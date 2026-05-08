# intraview_agent/runtime.py

import asyncio
import json
import logging
from typing import Optional

from livekit.agents import (
    AgentSession,
    JobContext,
    inference,
    room_io,
    ConversationItemAddedEvent,
)
from livekit.plugins import ai_coustics, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from .planner import InterviewConfig, QuestionPlanner
from .turn_manager import TurnManager
from .backend_client import BackendClient
from .config import get_interview_defaults

logger = logging.getLogger(__name__)


class InterviewRuntime:
    """
    Runtime that wires together:
      - QuestionPlanner
      - TurnManager
      - BackendClient
      - AgentSession (STT/LLM/TTS)
      - LiveKit room events

    It assumes backend is the ultimate source of truth for session status,
    but actively avoids obvious duplicates and provides structured events
    to the frontend.
    """

    def __init__(self, ctx: JobContext):
        self.ctx = ctx
        self.room = ctx.room

        self.cfg: Optional[InterviewConfig] = None
        self.planner: Optional[QuestionPlanner] = None
        self.tm: Optional[TurnManager] = None
        self.backend: Optional[BackendClient] = None

        self.session: Optional[AgentSession] = None
        self.timeout_task: Optional[asyncio.Task] = None

    # ---------- init ----------

    def _build_config_from_metadata(self) -> InterviewConfig:
        meta = self.ctx.job.metadata or {}

        try:
            session_id = int(meta.get("session_id"))
        except Exception:
            raise RuntimeError(f"session_id missing or invalid in metadata: {meta!r}")

        role_slug = str(meta.get("role_slug") or "unknown-role")
        round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
        difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()

        defaults = get_interview_defaults()
        raw_max = meta.get("max_questions")
        if raw_max is not None:
            try:
                max_questions = int(raw_max)
            except ValueError:
                max_questions = defaults.max_questions
        else:
            max_questions = defaults.max_questions

        return InterviewConfig(
            session_id=session_id,
            role_slug=role_slug,
            round_type=round_type,
            difficulty=difficulty,
            max_questions=max_questions,
        )

    async def _send_data(self, payload: dict):
        """
        Structured JSON messages for frontend.
        """
        try:
            data = json.dumps(payload).encode("utf-8")
            await self.room.local_participant.publish_data(data, reliable=True)
        except Exception:
            logger.exception("Failed to publish data message")

    # ---------- main entry ----------

    async def run(self):
        """
        High-level sequence:
          1. Initialize config, planner, backend client.
          2. Build AgentSession with STT/LLM/TTS + turn detection.
          3. Attach conversation event handler + timeout loop.
          4. Start session and ask first question.
          5. Connect to room and wait until disconnect.
        """
        self.cfg = self._build_config_from_metadata()
        self.backend = await BackendClient.create()
        self.planner = QuestionPlanner(self.cfg)

        total_q = self.planner.total_questions()
        if total_q == 0:
            logger.warning("No questions available for this interview; aborting.")
            await self.backend.close()
            return

        self.tm = TurnManager(total_questions=total_q)

        # AgentSession: STT/LLM/TTS pipeline via LiveKit Inference.[web:149]
        self.session = AgentSession(
            stt=inference.STT(model="deepgram/nova-3", language="multi"),
            llm=inference.LLM(model="google/gemini-2.5-flash"),
            tts=inference.TTS(
                model="cartesia/sonic-3",
                voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
            ),
            vad=self.ctx.proc.userdata["vad"],
            turn_detection=MultilingualModel(),
            preemptive_generation=True,
        )

        self._attach_conversation_handler(total_q)

        try:
            await self._start_session_and_ask_first()
            self.timeout_task = asyncio.create_task(self._timeout_loop())
            await self.ctx.connect()
        finally:
            if self.timeout_task:
                self.timeout_task.cancel()
                try:
                    await self.timeout_task
                except Exception:
                    pass
            if self.backend:
                await self.backend.close()

    # ---------- helpers ----------

    def _attach_conversation_handler(self, total_q: int):
        assert self.session is not None
        assert self.cfg is not None
        assert self.planner is not None
        assert self.tm is not None

        @self.session.on("conversation_item_added")
        async def _on_item(ev: ConversationItemAddedEvent):
            item = ev.item
            role = getattr(item, "role", None)
            text = getattr(item, "text", None)
            if not text or role not in ("assistant", "user"):
                return

            logger.debug(
                "conversation_item_added: session_id=%s role=%s text=%s",
                self.cfg.session_id,
                role,
                text,
            )

            # Assistant side: questions / closing
            if role == "assistant":
                if not self.tm.can_ask_new_question():
                    # Treat as closing or generic speech after questions.
                    await self._send_data({"type": "ending", "text": text})
                    return

                # This is the phrased question for the current turn.
                self.tm.mark_question_asked(question_text=text)
                await self._send_data(
                    {
                        "type": "question",
                        "index": self.tm.current_turn_index_1based(),
                        "text": text,
                        "total": total_q,
                    }
                )
                await self._send_data(
                    {
                        "type": "state",
                        "state": "ASKING",
                        "current_index": self.tm.current_turn_index_1based(),
                        "max_questions": total_q,
                    }
                )
                return

            # User side: answers
            if role == "user" and self.tm.has_pending_question():
                answer_text = text
                turn_index_1based = self.tm.current_turn_index_1based()
                question_text = self.tm.state.last_question_text or ""

                await self._send_data(
                    {
                        "type": "answer",
                        "index": turn_index_1based,
                        "question": question_text,
                        "answer": answer_text,
                    }
                )

                # Persist to backend with basic dedupe via backend's uniqueness constraint
                assert self.backend is not None
                resp = await self.backend.post_turn(
                    session_id=self.cfg.session_id,
                    turn_index_1based=turn_index_1based,
                    question_text=question_text,
                    answer_text=answer_text,
                    metadata={
                        "round_type": self.cfg.round_type,
                        "difficulty": self.cfg.difficulty,
                        "role_slug": self.cfg.role_slug,
                    },
                )
                if resp.status_code >= 400:
                    logger.error(
                        "Backend turn post failed: status=%s body=%s",
                        resp.status_code,
                        resp.text,
                    )

                self.tm.mark_answer_received()

                await self._send_data(
                    {
                        "type": "state",
                        "state": "ANSWER_RECEIVED",
                        "current_index": self.tm.current_turn_index_1based(),
                        "max_questions": total_q,
                    }
                )

    async def _start_session_and_ask_first(self):
        assert self.session is not None
        assert self.cfg is not None
        assert self.planner is not None
        assert self.tm is not None

        # Start voice pipeline
        from intraview_agent.planner import InterviewConfig  # avoid circular import in type checkers

        interviewer_agent = _build_interview_agent(self.cfg)

        await self.session.start(
            agent=interviewer_agent,
            room=self.room,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    noise_cancellation=ai_coustics.audio_enhancement(
                        model=ai_coustics.EnhancerModel.QUAIL_VF_L
                    ),
                ),
            ),
        )

        # Intro event for frontend
        await self._send_data(
            {
                "type": "intro",
                "text": "Hi, I am your AI interviewer. I will ask you a few practice interview questions.",
            }
        )

        # Ask first question
        base_q0 = self.planner.base_question_for_turn(0)
        instr = self.planner.build_llm_instruction(
            turn_index=0,
            base_q=base_q0,
            last_answer=None,
        )
        await self._send_data(
            {
                "type": "state",
                "state": "INTRO",
                "current_index": 0,
                "max_questions": self.planner.total_questions(),
            }
        )
        await self.session.generate_reply(instructions=instr)

    async def _timeout_loop(self):
        """
        Handles "no-answer" timeout + retry/skip behavior.

        This does NOT own the main audio pipeline; it only observes TurnManager state.
        """
        assert self.tm is not None
        assert self.planner is not None
        assert self.session is not None
        assert self.cfg is not None

        total_q = self.planner.total_questions()

        while not self.tm.state.done:
            await asyncio.sleep(2.0)

            if not self.tm.state.waiting_for_answer:
                continue

            # Retry once if no answer
            if self.tm.should_retry_for_no_answer():
                self.tm.mark_retry_used()
                await self._send_data(
                    {
                        "type": "info",
                        "reason": "no_answer_retry",
                        "message": "I didn't hear a response. Please answer the question when you're ready.",
                        "index": self.tm.current_turn_index_1based(),
                    }
                )
                # Ask the same question again in slightly different wording.
                base_q = self.planner.base_question_for_turn(self.tm.current_turn_index_0based())
                retry_instr = (
                    "The candidate did not respond clearly to your last question about:\n"
                    f"\"{base_q.text}\"\n\n"
                    "Please politely repeat the SAME question in different words. "
                    "Do not add new information, hints, or commentary. "
                    "Respond with the question only."
                )
                await self.session.generate_reply(instructions=retry_instr)
                continue

            # If still nothing after second window, skip with empty answer.
            if self.tm.should_timeout_and_skip():
                idx_1based = self.tm.current_turn_index_1based()
                await self._send_data(
                    {
                        "type": "info",
                        "reason": "no_answer_skip",
                        "message": "We will move on to the next question.",
                        "index": idx_1based,
                    }
                )
                assert self.backend is not None
                await self.backend.post_turn(
                    session_id=self.cfg.session_id,
                    turn_index_1based=idx_1based,
                    question_text=self.tm.state.last_question_text or "",
                    answer_text="",
                    metadata={
                        "round_type": self.cfg.round_type,
                        "difficulty": self.cfg.difficulty,
                        "role_slug": self.cfg.role_slug,
                    },
                )
                self.tm.mark_answer_received()

                if self.tm.can_ask_new_question():
                    base_q = self.planner.base_question_for_turn(self.tm.current_turn_index_0based())
                    instr = self.planner.build_llm_instruction(
                        turn_index=self.tm.current_turn_index_0based(),
                        base_q=base_q,
                        last_answer=None,
                    )
                    await self.session.generate_reply(instructions=instr)
                else:
                    # All questions exhausted
                    await self._send_data(
                        {
                            "type": "state",
                            "state": "DONE",
                            "current_index": self.tm.current_turn_index_1based(),
                            "max_questions": total_q,
                        }
                    )
                    self.tm.state.done = True
                    break


# Helper to build the interviewer Agent (Gemini prompt) without circular imports
def _build_interview_agent(cfg: InterviewConfig):
    from livekit.agents import Agent
    import textwrap

    instructions = textwrap.dedent(
        f"""\
        You are an AI interviewer for a practice interview platform.

        ROLE AND CONTEXT
        - Target role: {cfg.role_slug}
        - Round type: {cfg.round_type}
        - Difficulty level: {cfg.difficulty}
        - This is a PRACTICE interview, not a real hiring decision.

        BEHAVIOR RULES
        - Ask one clear interview question at a time.
        - Do NOT give hints, coaching, or feedback.
        - Do NOT say things like "great answer", "excellent", or "that's correct".
        - Stay neutral and professional in tone.
        - Avoid small talk unrelated to the interview.

        FLOW RULES
        - When you receive an instruction describing what question to ask, follow it exactly.
        - Do NOT decide on your own how many questions to ask or when to end the interview.
        - Wait for the candidate's answer before asking the next question.

        OUTPUT RULES
        - Respond in plain text only (no JSON, bullet points, or formatting).
        - Never mention that you are an AI model or that you are using tools.
        """
    )

    class InterviewAgent(Agent):
        def __init__(self):
            super().__init__(instructions=instructions)

    return InterviewAgent()