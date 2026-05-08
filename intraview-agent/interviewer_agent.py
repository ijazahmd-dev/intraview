# intraview_agent/interviewer_agent.py

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import List, Optional

import httpx
from livekit import agents
from livekit.agents import room_io
from livekit.plugins import deepgram, silero  # official plugins[web:216][web:204]

from .config import get_backend_config, get_interview_defaults
from .questions import get_fixed_question_set, Question

logger = logging.getLogger(__name__)


class AgentState(Enum):
    IDLE = auto()
    INTRO = auto()
    ASKING = auto()
    LISTENING = auto()
    PROCESSING = auto()
    ENDING = auto()
    FAILED = auto()


@dataclass
class InterviewContext:
    session_id: int
    role_slug: str
    round_type: str
    difficulty: str
    duration_minutes: Optional[int] = None
    state: AgentState = AgentState.IDLE
    questions: List[Question] = field(default_factory=list)
    current_index: int = 0  # 0-based
    started_at: float = 0.0
    max_questions: int = 0
    candidate_identity: Optional[str] = None


class InterviewerAgent:
    """
    Batch 2: deterministic interviewer with Deepgram STT + Silero VAD,
    using the modern AgentServer / JobContext architecture.
    """

    def __init__(self, ctx: agents.JobContext):
        self.ctx = ctx
        self.room = ctx.room
        self.backend_cfg = get_backend_config()
        self.defaults = get_interview_defaults()
        self.http_client = httpx.AsyncClient(http2=True, timeout=10.0)

        # Deepgram STT – use nova-3 or Flux depending on your preference.[web:216]
        self.stt = deepgram.STT(
            model="nova-3",
            language="en",
            interim_results=True,
            punctuate=True,
        )

        # Silero VAD – used primarily for interruption/room-health later.[web:204][web:214]
        self.vad = silero.VAD.load()

        self.interview: Optional[InterviewContext] = None

        # Disconnect handling
        self._room_monitor_task: Optional[asyncio.Task] = None
        self._stop = asyncio.Event()

    async def setup_from_metadata(self):
        meta = self.ctx.job.metadata or {}
        logger.info("Agent metadata: %s", meta)

        try:
            session_id = int(meta.get("session_id"))
        except Exception:
            raise RuntimeError(f"Missing or invalid session_id in job metadata: {meta}")

        role_slug = str(meta.get("role_slug") or "unknown-role")
        round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
        difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()
        duration_minutes_raw = meta.get("duration_minutes")
        duration_minutes = int(duration_minutes_raw) if duration_minutes_raw else None

        questions = get_fixed_question_set(role_slug, round_type, difficulty)
        max_questions = min(len(questions), self.defaults.max_questions)

        # For now, assume exactly one remote participant – the candidate.
        candidate_identity = None
        for p in self.room.remote_participants:
            candidate_identity = p.identity
            break

        self.interview = InterviewContext(
            session_id=session_id,
            role_slug=role_slug,
            round_type=round_type,
            difficulty=difficulty,
            duration_minutes=duration_minutes,
            questions=questions[:max_questions],
            max_questions=max_questions,
            candidate_identity=candidate_identity,
        )

        logger.info(
            "Interview context: session=%s, role=%s, round=%s, difficulty=%s, max_questions=%s, candidate=%s",
            session_id,
            role_slug,
            round_type,
            difficulty,
            max_questions,
            candidate_identity,
        )

        if not self.backend_cfg.base_url or not self.backend_cfg.shared_secret:
            raise RuntimeError("Backend configuration missing (BASE_URL or SHARED_SECRET).")

    async def run(self):
        try:
            await self.setup_from_metadata()
        except Exception:
            logger.exception("Failed to initialize interview context")
            self.ctx.log.error("Failed to initialize interview context")
            return

        assert self.interview is not None
        self.interview.started_at = time.monotonic()

        # Start room-monitor task (disconnect handling)
        self._room_monitor_task = asyncio.create_task(self._monitor_room())

        # Intro
        await self._broadcast_state(AgentState.INTRO)
        await self._send_intro()

        # Fixed questions
        for idx in range(self.interview.max_questions):
            if self._stop.is_set():
                break

            self.interview.current_index = idx

            question = await self._ask_next_question()
            if not question:
                break

            answer_text = await self._listen_for_answer()
            if self._stop.is_set():
                break

            if not answer_text:
                logger.warning(
                    "Empty transcript for turn %s in session %s",
                    idx + 1,
                    self.interview.session_id,
                )
                continue

            await self._post_turn_to_backend(
                question=question,
                answer_text=answer_text,
                turn_index=idx + 1,
            )

        # Ending
        await self._broadcast_state(AgentState.ENDING)
        await self._send_ending()

        self._stop.set()
        if self._room_monitor_task:
            await self._room_monitor_task

    async def _send_intro(self):
        assert self.interview is not None
        intro_text = (
            "Hi, I am your AI interviewer. I will ask you a few questions for this practice interview. "
            "Please answer out loud after each question. Let's begin."
        )
        await self._send_data(
            {
                "type": "intro",
                "text": intro_text,
            }
        )

    async def _ask_next_question(self) -> Optional[Question]:
        assert self.interview is not None

        if self.interview.current_index >= self.interview.max_questions:
            return None

        q = self.interview.questions[self.interview.current_index]
        await self._broadcast_state(AgentState.ASKING)

        await self._send_data(
            {
                "type": "question",
                "index": self.interview.current_index + 1,
                "text": q.text,
                "topic": q.topic,
            }
        )

        logger.info(
            "Asked question %s for session %s",
            self.interview.current_index + 1,
            self.interview.session_id,
        )
        return q

    async def _listen_for_answer(self) -> str:
        """
        Batch 2: improved listening logic using Deepgram STT plugin.

        Multi-signal heuristic:
        - MIN_TRANSCRIPT_CHARS: avoid hanging forever on tiny responses.
        - MIN_SPEECH_SECONDS: ensure user has spoken for a bit.
        - MAX_ANSWER_SECONDS: hard cap per answer.
        """
        assert self.interview is not None
        await self._broadcast_state(AgentState.LISTENING)

        MIN_TRANSCRIPT_CHARS = 10
        MIN_SPEECH_SECONDS = 2.0
        MAX_ANSWER_SECONDS = 120.0

        transcripts: List[str] = []
        first_speech_time: Optional[float] = None
        start_time = time.monotonic()

        logger.info("Starting STT stream for answer...")

        # Deepgram STT plugin: we stream from the entire room and later
        # can restrict to candidate if needed.[web:216][web:213]
        async with self.stt.stream(self.room) as stream:
            try:
                async for result in stream:
                    if self._stop.is_set():
                        break

                    now = time.monotonic()
                    if now - start_time > MAX_ANSWER_SECONDS:
                        logger.warning("Max answer time reached, stopping STT")
                        break

                    # Each result typically has .text and .is_final properties,
                    # per plugin conventions.[web:216][web:201]
                    if not result.text:
                        continue

                    if first_speech_time is None:
                        first_speech_time = now

                    if result.is_final:
                        transcripts.append(result.text)
                        logger.info("STT final segment: %s", result.text)

                    full_text = " ".join(transcripts).strip()

                    # End condition: enough text + enough speaking time
                    if (
                        len(full_text) >= MIN_TRANSCRIPT_CHARS
                        and first_speech_time is not None
                        and (now - first_speech_time) >= MIN_SPEECH_SECONDS
                    ):
                        logger.info(
                            "Answer transcript ready: len=%s, duration=%.2fs",
                            len(full_text),
                            now - first_speech_time,
                        )
                        return full_text

            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Error during STT listen_for_answer")
                self.interview.state = AgentState.FAILED
                await self._broadcast_state(AgentState.FAILED)
                return ""

        full_text = " ".join(transcripts).strip()
        return full_text

    async def _post_turn_to_backend(
        self, *, question: Question, answer_text: str, turn_index: int
    ):
        assert self.interview is not None

        url = (
            self.backend_cfg.base_url
            + f"/api/ai-interview/session/{self.interview.session_id}/turns/"
        )
        payload = {
            "turn_index": turn_index,
            "question_text": question.text,
            "answer_text": answer_text,
            "metadata": {
                "topic": question.topic,
                "followup": question.followup,
            },
        }
        headers = {
            "Content-Type": "application/json",
            "X-Agent-Token": self.backend_cfg.shared_secret,
        }

        logger.info(
            "Posting turn to backend: session=%s, turn_index=%s",
            self.interview.session_id,
            turn_index,
        )

        try:
            resp = await self.http_client.post(url, json=payload, headers=headers)
        except Exception:
            logger.exception("Error posting turn to backend")
            return

        if resp.status_code >= 400:
            logger.error(
                "Backend turn post failed: status=%s, body=%s",
                resp.status_code,
                resp.text,
            )
        else:
            logger.info("Backend turn post success: %s", resp.status_code)

    async def _send_ending(self):
        assert self.interview is not None
        closing = "This concludes the practice interview. Thank you for your time."
        await self._send_data(
            {
                "type": "ending",
                "text": closing,
            }
        )
        logger.info("Interview completed for session %s", self.interview.session_id)

    async def _broadcast_state(self, new_state: AgentState):
        assert self.interview is not None
        self.interview.state = new_state
        await self._send_data(
            {
                "type": "state",
                "state": new_state.name,
                "current_index": self.interview.current_index + 1,
                "max_questions": self.interview.max_questions,
            }
        )

    async def _send_data(self, payload: dict):
        """
        Send structured JSON messages via LiveKit data channel so the frontend
        can distinguish intro/question/state/ending.
        """
        try:
            data = json.dumps(payload).encode("utf-8")
            await self.room.local_participant.publish_data(data, reliable=True)
        except Exception:
            logger.exception("Failed to publish data message")

    async def _monitor_room(self):
        """
        Basic room health monitoring:
        - If no remote participants for 30s → end interview.
        """
        EMPTY_GRACE_SECONDS = 30.0
        last_seen_remote = time.monotonic()

        while not self._stop.is_set():
            await asyncio.sleep(2.0)

            if len(self.room.remote_participants) > 0:
                last_seen_remote = time.monotonic()
                continue

            if time.monotonic() - last_seen_remote > EMPTY_GRACE_SECONDS:
                logger.warning(
                    "No remote participants for %.1fs, ending interview",
                    EMPTY_GRACE_SECONDS,
                )
                self._stop.set()
                await self._broadcast_state(AgentState.ENDING)
                await self._send_data(
                    {
                        "type": "info",
                        "reason": "no_remote_participants",
                        "message": "The candidate disconnected. Ending interview.",
                    }
                )
                break

    async def close(self):
        self._stop.set()
        if self._room_monitor_task:
            self._room_monitor_task.cancel()
            try:
                await self._room_monitor_task
            except Exception:
                pass
        await self.http_client.aclose()