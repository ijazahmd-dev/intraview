# intraview_agent/runtime.py



import asyncio
import json
import logging
import re         
import time
from typing import Optional, Set
from difflib import SequenceMatcher

from livekit.agents import (
    AgentSession,
    JobContext,
    inference,
    llm,
    room_io,
    ConversationItemAddedEvent,
    UserStateChangedEvent,
)
from livekit.plugins import ai_coustics, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from backend_client import BackendClient
from runtime_guard import RuntimeGuard, RuntimeOwnershipLost
from config import get_interview_defaults
from constants import (
    TIMEOUT_LOOP_INTERVAL_SECONDS,
    ASSISTANT_GENERATION_TIMEOUT_SECONDS,
    TRANSCRIPT_STABILIZATION_SECONDS,
    SPEECH_END_GRACE_SECONDS,
    MIN_TRANSCRIPT_COMMIT_WORDS,
    TRANSCRIPT_BUFFER_MAX_SECONDS,
    TRANSCRIPT_SIMILARITY_THRESHOLD,
    MAX_TRANSCRIPT_UPDATES_PER_PROMPT,
    NO_ANSWER_TIMEOUT_SECONDS,
    
)
from planner import InterviewConfig, QuestionPlanner
from state import InterviewState, StateMachine
from turn_manager import TurnManager

logger = logging.getLogger(__name__)


class InterviewRuntime:
    """
    Runtime that wires together:
      - QuestionPlanner
      - TurnManager
      - StateMachine
      - BackendClient
      - AgentSession (STT/LLM/TTS)
      - LiveKit room events

    This version focuses on:
      - Correct assistant message classification
      - Concurrency-safe turn finalization
      - Transcript deduplication
      - Duration enforcement
      - Pausing timeouts when candidate is disconnected
      - Controlled follow-up questions (0–2 per base question)  [NEW]
    """

    def __init__(self, ctx: JobContext):
        self.ctx = ctx
        self.room = ctx.room

        self.cfg: Optional[InterviewConfig] = None
        self.state_machine = StateMachine()

        self.planner: Optional[QuestionPlanner] = None
        self.tm: Optional[TurnManager] = None
        self.backend: Optional[BackendClient] = None
        self.runtime_guard: Optional[RuntimeGuard] = None

        self.session: Optional[AgentSession] = None
        self.timeout_task: Optional[asyncio.Task] = None
        self.heartbeat_task: Optional[asyncio.Task] = None
        self.avatar_bridge = None

        # Track when interview started (for duration enforcement)
        self._start_time_monotonic: Optional[float] = None

        # Only process each conversation item once
        self._processed_item_ids: Set[str] = set()

        # Lock around turn finalization to prevent races between timeout and transcript
        self._turn_lock = asyncio.Lock()

        # Lock around LLM generation so we don't overlap generate_reply() calls
        self._generation_lock = asyncio.Lock()

        # Classify what we expect the next assistant message to be.
        # [NEW] Added "FOLLOWUP" as a valid value alongside "QUESTION".
        self._pending_generation_type: Optional[str] = None  # "QUESTION" | "RETRY" | None

        # Explicit ownership marker for the assistant message
        # we are currently expecting from LiveKit.
        #
        # This stays alive until the assistant item is actually
        # consumed in _attach_conversation_handler().
        self._generation_owner_seq: int = 0
        self._active_generation_owner: Optional[dict] = None


        # True while a generate_reply() call is actively running.
        # Prevents overlapping generation requests.
        self._generation_in_progress: bool = False

        # Runtime lifecycle guard.
        # Prevents stale/zombie callbacks after shutdown or fatal failure.
        self._runtime_alive: bool = True

        # Prevent duplicate shutdown execution.
        self._shutdown_started: bool = False

        # Background tasks owned by runtime.
        self._background_tasks: set[asyncio.Task] = set()

        # Event that keeps run() alive until interview is genuinely complete.
        # Needed because ctx.connect() returns immediately in LiveKit agents v1.5+
        # when the room is already connected via session.start().
        self._interview_done: asyncio.Event = asyncio.Event()

        # Spoken lifecycle guards.
        # Keep start/end messages human and one-time only.
        self._greeting_spoken: bool = False
        self._closing_started: bool = False

        # Best-effort snapshot of durable runtime state loaded from backend.
        # Helps avoid replaying greeting/closing during reconnect scenarios.
        self._loaded_runtime_state_name: str = "INITIALIZING"
        self._loaded_waiting_for_answer: bool = False

        self._minimum_answer_words = 3
        self._minimum_answer_chars = 12

        # ---------------------------------------------------------
        # Streaming transcript assembly state
        # ---------------------------------------------------------

        # Current assembled transcript for the active prompt.
        self._active_transcript_text: str = ""

        # Last normalized transcript snapshot.
        #
        # Used for duplicate/similarity suppression.
        self._last_normalized_transcript: str = ""

        # Timestamp of latest transcript update.
        self._last_transcript_update_at: float = 0.0

        # Timestamp when transcript buffering started.
        #
        # Prevents infinite open transcript sessions.
        self._transcript_started_at: float = 0.0

        # Number of transcript update events received
        # for the current pending prompt.
        self._transcript_update_count: int = 0

        # Currently running stabilization task.
        #
        # Cancelled/restarted whenever new transcript arrives.
        self._transcript_stabilization_task: Optional[asyncio.Task] = None

        # ---------------------------------------------------------
        # Production speech activity state
        # ---------------------------------------------------------

        #
        # True while candidate is actively speaking.
        #
        # Source of truth:
        # LiveKit turn/VAD events
        #
        # NOT transcript timing.
        #
        self._candidate_is_speaking: bool = False

        #
        # Timestamp of latest detected speech end.
        #
        # Used for silence grace window before
        # transcript finalization.
        #
        self._last_speech_end_at: float = 0.0

        # True while finalized answer
        # True while finalized answer
        # processing is running.
        #
        # Prevents timeout retry race:
        #
        #
        # transcript committed
        # ↓
        # processing running
        # ↓
        # timeout loop retries
        #
        self._processing_answer: bool = False

        

    # ---------- initialization helpers ----------

    def _build_config_from_metadata(self) -> InterviewConfig:
        raw_meta = self.ctx.job.metadata

        if not raw_meta:
            meta = {}
        elif isinstance(raw_meta, str):
            try:
                meta = json.loads(raw_meta)
            except json.JSONDecodeError:
                raise RuntimeError(f"job metadata is not valid JSON: {raw_meta!r}")
        elif isinstance(raw_meta, dict):
            meta = raw_meta
        else:
            raise RuntimeError(
                f"job metadata must be dict or JSON string, got {type(raw_meta)!r}: {raw_meta!r}"
            )

        try:
            session_id = int(meta.get("session_id"))
        except (TypeError, ValueError):
            raise RuntimeError(f"session_id missing or invalid in metadata: {meta!r}")

        role_slug = str(meta.get("role_slug") or "unknown-role")
        role_name = str(meta.get("role_name") or "").strip() or None
        round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
        difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()
        candidate_name = str(meta.get("candidate_name") or "").strip() or None

        defaults = get_interview_defaults()

        raw_max = meta.get("max_questions")
        if raw_max is not None:
            try:
                max_questions = int(raw_max)
            except (TypeError, ValueError):
                max_questions = defaults.max_questions
        else:
            max_questions = defaults.max_questions

        duration_seconds: Optional[int] = None
        raw_dur_sec = meta.get("duration_seconds")
        raw_dur_min = meta.get("duration_minutes")

        if raw_dur_sec is not None:
            try:
                duration_seconds = int(raw_dur_sec)
            except (TypeError, ValueError):
                duration_seconds = None
        elif raw_dur_min is not None:
            try:
                duration_seconds = int(raw_dur_min) * 60
            except (TypeError, ValueError):
                duration_seconds = None

        return InterviewConfig(
            session_id=session_id,
            role_slug=role_slug,
            round_type=round_type,
            difficulty=difficulty,
            max_questions=max_questions,
            duration_seconds=duration_seconds,
            role_name=role_name,
            candidate_name=candidate_name,
        )

    def _track_background_task(self, task: asyncio.Task):
        self._background_tasks.add(task)

        def _cleanup_task(t: asyncio.Task):
            self._background_tasks.discard(t)

        task.add_done_callback(_cleanup_task)

    def _role_display_name(self) -> str:
        assert self.cfg is not None

        role_name = (self.cfg.role_name or "").strip()
        if role_name:
            return role_name

        role_slug = (self.cfg.role_slug or "").strip()
        if not role_slug:
            return "selected"

        return role_slug.replace("-", " ").replace("_", " ").title()

    def _candidate_display_name(self) -> Optional[str]:
        assert self.cfg is not None

        candidate_name = (self.cfg.candidate_name or "").strip()
        if candidate_name:
            return candidate_name

        for participant in self.room.remote_participants.values():
            display_name = (getattr(participant, "name", "") or "").strip()
            if display_name:
                return display_name

        return None

    def _build_greeting_text(self) -> str:
        role_name = self._role_display_name()
        candidate_name = self._candidate_display_name()
        greeting_prefix = (
            f"Hello {candidate_name}, welcome to your AI interview session "
            if candidate_name
            else "Hello, welcome to your AI interview session "
        )

        return (
            f"{greeting_prefix}for the {role_name} role. "
            "I will guide you through a few questions to understand your experience, "
            "communication, and problem-solving approach. "
            "Take a moment to settle in, and when you are ready, we will begin."
        )

    def _build_closing_text(self) -> str:
        return (
            "That concludes the interview. Thank you for taking the time to participate today. "
            "Your responses will now be processed and evaluated. "
            "We appreciate your effort, and we wish you the very best in your journey. "
            "Have a great day."
        )

    def _should_greet_on_start(self) -> bool:
        assert self.tm is not None

        if self._greeting_spoken:
            return False

        if self.tm.current_turn_index_0based() != 0:
            return False

        if self._loaded_waiting_for_answer:
            return False

        return self._loaded_runtime_state_name in {"", "INITIALIZING"}

    async def _send_data(self, payload: dict):
        """
        Send structured JSON messages to frontend.
        """
        try:
            data = json.dumps(payload).encode("utf-8")
            await asyncio.wait_for(
                self.room.local_participant.publish_data(data, reliable=True),
                timeout=2.0,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "Timed out publishing data message: type=%s",
                payload.get("type"),
            )
        except Exception:
            logger.exception("Failed to publish data message")

    async def _sync_runtime_state(self):
        """
        Best-effort push of current runtime state to backend.

        Backend is the long-term source of truth; this call is optional
        and safe to add later on the Django side.
        """
        if not self.backend or not self.cfg or not self.tm:
            return

        current_state = self.state_machine.value
        payload = {
            "current_turn_index": self.tm.current_turn_index_0based(),
            "waiting_for_answer": self.tm.state.waiting_for_answer,
            "current_state": current_state.name,
        }

        # If duration is configured and we have a start time, include remaining seconds.
        if self.cfg.duration_seconds is not None and self._start_time_monotonic is not None:
            elapsed = int(time.monotonic() - self._start_time_monotonic)
            remaining = max(self.cfg.duration_seconds - elapsed, 0)
            payload["remaining_seconds"] = remaining

        try:
            await asyncio.wait_for(
                self.backend.update_runtime_state(self.cfg.session_id, payload),
                timeout=5.0,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "Timed out syncing runtime state to backend: session_id=%s",
                self.cfg.session_id,
            )
        except Exception:
            # Log but do not crash runtime on sync failure.
            logger.exception("Failed to sync runtime state to backend")

    async def _safe_say(
        self,
        *,
        text: str,
        allow_interruptions: bool = False,
    ):
        """
        Speak a deterministic scripted message without adding it to chat context.

        Used for greeting and closing so they:
        - start quickly
        - do not depend on LLM generation latency
        - do not confuse question/answer tracking
        """

        assert self.session is not None

        if not self._runtime_alive:
            logger.warning("Skipping scripted speech because runtime is no longer alive.")
            return

        if self.runtime_guard:
            await self.runtime_guard.ensure_runtime_valid()

        try:
            handle = self.session.say(
                text=text,
                allow_interruptions=allow_interruptions,
                add_to_chat_ctx=False,
            )
            await asyncio.wait_for(
                handle.wait_for_playout(),
                timeout=45.0,
            )
        except asyncio.TimeoutError:
            logger.exception("Scripted speech timed out.")
        except Exception:
            logger.exception("Scripted speech failed.")

    async def _generate_question_text(
        self,
        *,
        instructions: str,
        fallback_text: str,
    ) -> str:
        """
        Generate question phrasing as plain text without enqueueing speech.

        This is used for the first question so we can pre-generate it during
        the greeting without allowing the speech pipeline to start early.
        """

        if not self._runtime_alive:
            return fallback_text

        if self.runtime_guard:
            await self.runtime_guard.ensure_runtime_valid()

        chat_ctx = llm.ChatContext.empty()
        chat_ctx.add_message(
            role="user",
            content=instructions,
        )

        try:
            async with inference.LLM(model="google/gemini-2.5-flash") as question_llm:
                response = await asyncio.wait_for(
                    question_llm.chat(
                        chat_ctx=chat_ctx,
                    ).collect(),
                    timeout=ASSISTANT_GENERATION_TIMEOUT_SECONDS,
                )
        except asyncio.TimeoutError:
            logger.exception("Question text pre-generation timed out.")
            return fallback_text
        except Exception:
            logger.exception("Question text pre-generation failed.")
            return fallback_text

        text = (response.text or "").strip()
        if not text:
            return fallback_text

        normalized = re.sub(r"\s+", " ", text).strip()
        return normalized or fallback_text

    async def _speak_question_text(
        self,
        *,
        question_text: str,
        total_q: int,
    ):
        """
        Speak a prepared question and only then open the answer window.
        """

        assert self.tm is not None

        try:
            self.state_machine.transition(InterviewState.ASKING)
        except ValueError:
            logger.warning(
                "Illegal state transition to ASKING from %s",
                self.state_machine.value.name,
            )

        await self._send_data(
            {
                "type": "question",
                "index": self.tm.current_turn_index_1based(),
                "text": question_text,
                "total": total_q,
            }
        )
        await self._send_data(
            {
                "type": "state",
                "state": self.state_machine.value.name,
                "current_index": self.tm.current_turn_index_1based(),
                "max_questions": total_q,
            }
        )
        await self._sync_runtime_state()

        await self._safe_say(
            text=question_text,
            allow_interruptions=False,
        )

        try:
            self.state_machine.transition(InterviewState.LISTENING)
        except ValueError:
            logger.warning(
                "Illegal state transition to LISTENING from %s",
                self.state_machine.value.name,
            )

        self._reset_transcript_buffer()
        self.tm.mark_question_asked(question_text=question_text)

        await self._send_data(
            {
                "type": "state",
                "state": self.state_machine.value.name,
                "current_index": self.tm.current_turn_index_1based(),
                "max_questions": total_q,
            }
        )
        await self._sync_runtime_state()

    async def _conclude_interview(
        self,
        *,
        total_q: int,
        reason: str,
    ):
        """
        Deliver the one-time professional closing and mark session completed.
        """

        assert self.backend is not None
        assert self.cfg is not None
        assert self.tm is not None

        if self._closing_started:
            return

        self._closing_started = True
        self.tm.state.done = True

        try:
            self.state_machine.transition(InterviewState.ENDING)
        except ValueError:
            logger.warning(
                "Illegal state transition to ENDING from %s",
                self.state_machine.value.name,
            )

        closing_text = self._build_closing_text()

        await self._send_data(
            {
                "type": "closing",
                "text": closing_text,
                "reason": reason,
            }
        )
        await self._send_data(
            {
                "type": "state",
                "state": self.state_machine.value.name,
                "current_index": total_q,
                "max_questions": total_q,
            }
        )
        await self._sync_runtime_state()

        try:
            await self._safe_say(
                text=closing_text,
                allow_interruptions=False,
            )
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Closing speech failed; completing session anyway.")

        try:
            self.state_machine.transition(InterviewState.COMPLETED)
        except ValueError:
            logger.warning(
                "Illegal state transition to COMPLETED from %s",
                self.state_machine.value.name,
            )

        await self._send_data(
            {
                "type": "state",
                "state": self.state_machine.value.name,
                "current_index": total_q,
                "max_questions": total_q,
            }
        )
        await self._sync_runtime_state()
        await self.backend.notify_interview_completed(self.cfg.session_id)
        self._interview_done.set()




    
    async def _safe_generate_reply(
        self,
        *,
        instructions: str,
        generation_type: str,
    ):
        """
        Centralized protected wrapper around session.generate_reply().

        Prevents:
        - overlapping generation
        - permanent deadlocks
        - stuck generation locks
        - stale pending generation state
        - silent provider hangs
        """

        assert self.session is not None
        assert self.cfg is not None

        if not self._runtime_alive:
            logger.warning(
                "Skipping generation because runtime is no longer alive."
            )
            return
        
        if self.runtime_guard:
            await self.runtime_guard.ensure_runtime_valid()

        async with self._generation_lock:

            if self._generation_in_progress:
                logger.warning(
                    "Skipping overlapping generation request: session_id=%s",
                    self.cfg.session_id,
                )
                return

            self._generation_in_progress = True
            self._pending_generation_type = generation_type

            # Create a deterministic ownership record for this generation.
            self._generation_owner_seq += 1
            self._active_generation_owner = {
                "seq": self._generation_owner_seq,
                "type": generation_type,
                "started_at": time.monotonic(),
            }

            try:
                logger.info(
                    "Starting generation: session_id=%s type=%s",
                    self.cfg.session_id,
                    generation_type,
                )

                await asyncio.wait_for(
                    self.session.generate_reply(
                        instructions=instructions
                    ),
                    timeout=ASSISTANT_GENERATION_TIMEOUT_SECONDS,
                )

                logger.info(
                    "Generation completed: session_id=%s type=%s",
                    self.cfg.session_id,
                    generation_type,
                )

            except asyncio.TimeoutError:
                logger.exception(
                    "Generation timeout: session_id=%s type=%s",
                    self.cfg.session_id,
                    generation_type,
                )


                await self._send_data(
                    {
                        "type": "info",
                        "reason": "generation_timeout",
                        "message": (
                            "The interviewer response timed out. "
                            "Continuing interview..."
                        ),
                    }
                )

            except Exception:
                logger.exception(
                    "Generation failed: session_id=%s type=%s",
                    self.cfg.session_id,
                    generation_type,
                )


                await self._send_data(
                    {
                        "type": "info",
                        "reason": "generation_failure",
                        "message": (
                            "The interviewer encountered an issue. "
                            "Recovering..."
                        ),
                    }
                )

            finally:
                self._generation_in_progress = False
                #
                # IMPORTANT: Do NOT clear _active_generation_owner
                # or _pending_generation_type here.
                #
                # generate_reply() returns when LLM text is submitted
                # to the TTS pipeline, but conversation_item_added
                # fires SECONDS LATER after TTS finishes speaking.
                #
                # If we clear the owner here, the item arrives with
                # no owner → classified as AUTONOMOUS → the runtime
                # never registers questions → transcripts are never
                # processed → backend turn POST never fires.
                #
                # The conversation handler (QUESTION/FOLLOWUP/RETRY
                # branches) is responsible for clearing these when
                # it successfully consumes the item.



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
        # Runtime ownership guard.
        # Prevents duplicate/zombie interview agents.
        self.runtime_guard = RuntimeGuard(
            backend=self.backend,
            session_id=self.cfg.session_id,
        )

        # Acquire ownership BEFORE interview starts.
        await self.runtime_guard.start()
        self.planner = QuestionPlanner(self.cfg)

        total_q = self.planner.total_questions()
        if total_q == 0:
            logger.warning("No questions available for this interview; aborting.")
            await self.backend.close()
            return

        self.tm = TurnManager(total_questions=total_q)

        # AgentSession: STT/LLM/TTS pipeline via LiveKit Inference.
        self.session = AgentSession(
            stt=inference.STT(model="deepgram/nova-3", language="multi"),
            llm=inference.LLM(model="google/gemini-2.5-flash"),
            tts=inference.TTS(
                model="cartesia/sonic-2",
                voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
            ),
            vad=self.ctx.proc.userdata["vad"],
            turn_handling={
                "turn_detection": MultilingualModel(unlikely_threshold=0.1),
                "endpointing": {
                    "mode": "dynamic",
                    "min_delay": 0.4,
                    "max_delay": 1.2,
                },
                "interruption": {
                    "enabled": True,
                    "mode": "adaptive",
                    "min_duration": 0.4,
                    "min_words": 0,
                    "false_interruption_timeout": 2.0,
                    "resume_false_interruption": True,
                    "discard_audio_if_uninterruptible": True,
                },
                # "preemptive_generation": {
                #     "enabled": True,
                #     "preemptive_tts": False,
                #     "max_speech_duration": 8.0,
                #     "max_retries": 1,
                # },
                "preemptive_generation": {
                    "enabled": False,
                },
            },
        )

        # Start interview timer for duration enforcement.
        self._start_time_monotonic = time.monotonic()

        # Optional: load existing runtime state for future reconnect support.
        await self._load_existing_runtime_state()

        self._attach_conversation_handler(total_q)

        try:
            await self._start_session_and_ask_first()
            self.timeout_task = asyncio.create_task(self._timeout_loop())
            self._background_tasks.add(self.timeout_task)
            await self.ctx.connect()
            # Block here until the interview completes or runtime is shut down.
            # ctx.connect() returns immediately in v1.5+ when room is already
            # connected via session.start(), so we need this explicit wait.
            await self._interview_done.wait()

        except asyncio.CancelledError:
            # Propagate cancellation cleanly.
            raise
        except RuntimeOwnershipLost:
            logger.error(
                "Runtime ownership lost for session %s",
                self.cfg.session_id if self.cfg else None,
            )

            self._runtime_alive = False

        except Exception:
            logger.exception("InterviewRuntime failed")
        finally:
            await self.shutdown()

    async def _load_existing_runtime_state(self):
        """
        Best-effort attempt to read existing runtime state from backend.

        Currently we only adopt current_turn_index; more fields can be added later.
        """
        if not self.backend or not self.cfg or not self.tm:
            return

        try:
            data = await self.backend.load_runtime_state(self.cfg.session_id)
        except Exception:
            logger.exception("Failed to load runtime state; starting fresh")
            return

        if not data:
            return

        try:
            idx = int(data.get("current_turn_index", 0))
        except Exception:
            idx = 0

        if 0 <= idx < self.tm.total_questions:
            self.tm.state.turn_index = idx
            logger.info(
                "Resuming interview from backend runtime state: current_turn_index=%s",
                idx,
            )

        state_name = str(data.get("current_state") or "").strip().upper()
        if state_name:
            self._loaded_runtime_state_name = state_name

        self._loaded_waiting_for_answer = bool(
            data.get("waiting_for_answer", False)
        )



    def _is_valid_user_answer(self, text: str) -> bool:
        """
        Filters fragmented / low-signal STT transcript events.

        Prevents:
        - empty transcripts
        - tiny partial chunks
        - accidental endpoint fragments
        - premature turn finalization
        """

        if not text:
            return False

        cleaned = text.strip()

        if not cleaned:
            return False

        if len(cleaned) < self._minimum_answer_chars:
            return False

        words = re.findall(r"\b[\w'-]+\b", cleaned)

        if len(words) < self._minimum_answer_words:
            return False

        return True       



    # ---------------------------------------------------------
    # Transcript normalization / similarity helpers
    # ---------------------------------------------------------

    def _normalize_transcript(self, text: str) -> str:
        """
        Normalize transcript for similarity comparison.

        Helps suppress:
        - duplicate STT emissions
        - punctuation-only changes
        - casing differences
        """

        text = (text or "").strip().lower()

        # Collapse whitespace
        text = re.sub(r"\s+", " ", text)

        # Remove repeated punctuation noise
        text = re.sub(r"[^\w\s'-]", "", text)

        return text.strip()


    def _transcript_similarity(
        self,
        a: str,
        b: str,
    ) -> float:
        """
        Compute transcript similarity score.

        Uses SequenceMatcher because:
        - lightweight
        - no external dependency
        - sufficient for realtime transcript dedup
        """

        return SequenceMatcher(
            None,
            a,
            b,
        ).ratio()


    def _reset_transcript_buffer(self):
        """
        Completely reset active transcript assembly state.

        Called after:
        - turn finalization
        - timeout skip
        - runtime shutdown
        - transcript corruption protection
        """

        self._active_transcript_text = ""
        self._last_normalized_transcript = ""
        self._last_transcript_update_at = 0.0
        self._transcript_started_at = 0.0
        self._transcript_update_count = 0
        current_task: Optional[asyncio.Task] = None

        try:
            current_task = asyncio.current_task()
        except RuntimeError:
            current_task = None

        if self._transcript_stabilization_task:

            if (
                not self._transcript_stabilization_task.done()
                and self._transcript_stabilization_task
                is not current_task
            ):
                self._transcript_stabilization_task.cancel()

        self._transcript_stabilization_task = None
        if self.tm is not None:
            self.tm.reset_transcript_state()



    def _build_turn_answer_text(self) -> str:
        """
        Build the canonical committed answer text for the current turn.

        With follow-ups removed, this is just the base answer text.
        """
        assert self.tm is not None
        return (self.tm.state.base_answer_text or "").strip()



    def _candidate_recently_stopped_speaking(
        self,
    ) -> bool:
        """
        Returns True if candidate recently stopped speaking.

        Used as a silence grace window before
        transcript finalization.

        Production logic:
        user stops speaking
        ↓
        wait short silence window
        ↓
        if still silent:
            finalize answer
        """

        if self._candidate_is_speaking:
            return True

        if self._last_speech_end_at <= 0:
            return False

        silence_duration = (
            time.monotonic()
            - self._last_speech_end_at
        )

        #
        # Use dedicated speech grace window.
        #
        # Decoupled from transcript stabilization because
        # candidates naturally pause 2-4s mid-thought.
        #
        return (
            silence_duration
            < SPEECH_END_GRACE_SECONDS
        )

    async def _schedule_transcript_commit(
        self,
        total_q: int,
    ):
        """
        Wait for transcript stabilization before committing answer.

        IMPORTANT:
        We only commit if transcript has remained unchanged
        for the FULL stabilization duration.

        Prevents:
        - premature commits during natural pauses
        - mid-answer truncation
        - accidental follow-up generation
        """

        try:
            #
            # Snapshot latest transcript timestamp.
            #
            snapshot_update_at = (
                self.tm.state.last_transcript_at
            )

            await asyncio.sleep(
                TRANSCRIPT_STABILIZATION_SECONDS
            )

            if not self._runtime_alive:
                return

            #
            # New transcript arrived while waiting.
            #
            # Candidate is still speaking.
            # Abort commit.
            #
            if (
                snapshot_update_at
                != self.tm.state.last_transcript_at
            ):
                logger.info(
                    (
                        "COMMIT ABORTED → "
                        "transcript still changing "
                        "snapshot=%s latest=%s"
                    ),
                    snapshot_update_at,
                    self._last_transcript_update_at,
                )
                return

            #
            # No transcript exists.
            #
            if not self._active_transcript_text.strip():
                return

            #
            # Still waiting for answer?
            #
            if not self.tm.has_pending_question():
                return

            logger.info(
                (
                    "TRANSCRIPT STABILIZED → "
                    "snapshot=%s "
                    "latest=%s "
                    "buffer=%r "
                    "words=%s"
                ),
                snapshot_update_at,
                self._last_transcript_update_at,
                self._active_transcript_text[:300],
                len(
                    re.findall(
                        r"\b[\w'-]+\b",
                        self._active_transcript_text,
                    )
                ),
            )

            await self._commit_stabilized_transcript(
                total_q=total_q,
            )

        except asyncio.CancelledError:
            return

        except Exception:
            logger.exception(
                "Transcript stabilization task failed"
            )


    async def _commit_stabilized_transcript(
        self,
        total_q: int,
    ):
        """
        Commit finalized stabilized transcript.

        This is the ONLY place where:
        - answers become finalized
        - follow-up logic executes
        - backend posting begins
        """

        assert self.tm is not None

        answer_to_process: Optional[str] = None

        async with self._turn_lock:

            logger.info(
                (
                    "COMMIT START → "
                    "pending=%s "
                    "waiting=%s "
                    "candidate_speaking=%s "
                    "buffer=%r"
                ),
                self.tm.has_pending_question(),
                self.tm.state.waiting_for_answer,
                self._candidate_is_speaking,

                self._active_transcript_text[:300],
            )

            if not self.tm.has_pending_question():
                return

            #
            # HARD GUARD: Never finalize while candidate
            # is actively speaking.
            #
            # This catches cases where stabilization timer
            # fires but VAD still reports active speech.
            #
            if self._candidate_is_speaking:
                logger.info(
                    "COMMIT BLOCKED → candidate still speaking"
                )
                if (
                    self._runtime_alive
                    and self.tm.has_pending_question()
                ):
                    task = asyncio.create_task(
                        self._schedule_transcript_commit(
                            total_q=total_q
                        )
                    )
                    self._transcript_stabilization_task = task
                    self._background_tasks.add(task)

                    def _cleanup_task(t: asyncio.Task):
                        self._background_tasks.discard(t)

                    task.add_done_callback(_cleanup_task)
                return
            
            #
            # Never finalize while candidate
            # is still speaking.
            #
            # This solves:
            # - long uninterrupted answers
            # - delayed transcript commits
            # - retry corruption
            #


            if (
                self._candidate_recently_stopped_speaking()
            ):
                logger.info(
                    "Waiting for speech stabilization."
                )

                #
                # CRITICAL:
                #
                # We cannot simply return here.
                #
                # Why?
                #
                # schedule_transcript_commit()
                # already completed.
                #
                # If we return now:
                #
                # transcript commit dies forever
                # ↓
                # timeout loop eventually skips
                # ↓
                # answer becomes empty
                #
                # Production fix:
                #
                # re-schedule another short commit
                # attempt after stabilization window.
                #

                if (
                    self._runtime_alive
                    and self.tm.has_pending_question()
                ):

                    task = asyncio.create_task(
                        self._schedule_transcript_commit(
                            total_q=total_q
                        )
                    )

                    self._transcript_stabilization_task = task
                    self._background_tasks.add(task)

                    def _cleanup_task(
                        t: asyncio.Task
                    ):
                        self._background_tasks.discard(t)

                    task.add_done_callback(
                        _cleanup_task
                    )

                return


            answer_text = (
                self.tm.current_transcript_buffer() or ""
            ).strip()

            if not self._is_valid_user_answer(answer_text):

                logger.info(
                    "Discarding unstable transcript: %r",
                    answer_text,
                )

                self._reset_transcript_buffer()
                return

            #
            # Prevent duplicate finalized transcript commits.
            #
            if self.tm.transcript_already_committed(
                answer_text
            ):
                logger.warning(
                    "Skipping duplicate committed transcript."
                )
                return

            self.tm.mark_transcript_committed(
                answer_text
            )

            #
            # HARD FINALIZATION FENCE
            #
            # Once transcript is finalized:
            #
            # - retries must stop
            # - skip timeout must stop
            # - duplicate transcript commits must stop
            #
            # If finalization already started,
            # another path already owns this turn.
            #
            if not self.tm.try_begin_turn_finalization():

                logger.warning(
                    (
                        "COMMIT BLOCKED → "
                        "turn already finalizing "
                        "answer=%r"
                    ),
                    answer_text[:120],
                )

                return

            #
            # Turn no longer waiting for answer.
            #
            self.tm.state.waiting_for_answer = False

            #
            # Prevent timeout loop races while
            # downstream processing is happening.
            #
            self._processing_answer = True

            # Hard reset pending transcript timing.
            #
            # Prevents stale stabilization callbacks
            # from re-processing the same answer.
            #
            self._last_transcript_update_at = 0.0

            logger.info(
                (
                    "FINAL ANSWER COMMITTED → "
                    "answer=%r "
                    "words=%s "
                ),
                answer_text[:300],
                len(
                    re.findall(
                        r"\b[\w'-]+\b",
                        answer_text,
                    )
                ),

            )

            #
            # Reset BEFORE downstream generation/finalization.
            #
            self._reset_transcript_buffer()

            #
            # IMPORTANT:
            # Save answer and process OUTSIDE lock.
            #
            answer_to_process = answer_text

        #
        # Process AFTER releasing _turn_lock.
        #
        if answer_to_process:

            try:
                await self._process_finalized_answer(
                    answer_text=answer_to_process,
                    total_q=total_q,
                )

            except asyncio.CancelledError:
                logger.warning(
                    "Post-answer processing cancelled: session_id=%s turn=%s",
                    self.cfg.session_id
                    if self.cfg else None,
                    self.tm.current_turn_index_1based()
                    if self.tm else None,
                )
                if self.tm is not None and self.tm.state.is_finalizing_turn:
                    logger.warning(
                        "Aborting stuck turn finalization after cancellation: turn=%s",
                        self.tm.current_turn_index_1based(),
                    )
                    self.tm.abort_turn_finalization()
                raise

            except Exception:
                logger.exception(
                    "Post-answer processing failed: "
                    "session_id=%s",
                    self.cfg.session_id
                    if self.cfg else None,
                )
                if self.tm is not None and self.tm.state.is_finalizing_turn:
                    logger.warning(
                        "Aborting stuck turn finalization after answer-processing failure: turn=%s",
                        self.tm.current_turn_index_1based(),
                    )
                    self.tm.abort_turn_finalization()

            finally:
                #
                # Always release processing guard.
                #
                self._processing_answer = False






    async def _process_finalized_answer(
        self,
        *,
        answer_text: str,
        total_q: int,
    ):
        """
        Process ONE finalized stabilized answer.

        Records the base answer, sends frontend events,
        transitions to PROCESSING state, then calls _finalize_base_turn().

        Every committed answer always goes directly to _finalize_base_turn()
        with no follow-up branching.
        """

        assert self.tm is not None

        turn_index_1based = (
            self.tm.current_turn_index_1based()
        )

        question_text = (
            self.tm.state.last_question_text or ""
        )

        logger.info(
            (
                "PROCESS ANSWER START → "
                "turn=%s "
                "answer_words=%s "
                "answer=%r"
            ),
            turn_index_1based,
            len(
                re.findall(
                    r"\b[\w'-]+\b",
                    answer_text,
                )
            ),
            answer_text[:300],
        )

        # Always treat as base question answer.
        self.tm.record_base_answer(
            answer_text=answer_text
        )

        await self._send_data(
            {
                "type": "answer",
                "index": turn_index_1based,
                "question": question_text,
                "answer": answer_text,
                "is_followup": False,
            }
        )

        try:
            self.state_machine.transition(
                InterviewState.PROCESSING
            )
        except ValueError:
            logger.warning(
                "Illegal state transition to PROCESSING from %s",
                self.state_machine.value.name,
            )

        await self._send_data(
            {
                "type": "state",
                "state": (
                    self.state_machine.value.name
                ),
                "current_index": (
                    turn_index_1based
                ),
                "max_questions": total_q,
            }
        )

        await self._sync_runtime_state()

        # Always finalize the base turn directly.
        # No follow-up logic of any kind.
        logger.info(
            "PROCESS ANSWER PRE-FINALIZE → turn=%s",
            turn_index_1based,
        )
        await self._finalize_base_turn(total_q)      


    

    # ---------- LiveKit conversation handling ----------

    def _attach_conversation_handler(self, total_q: int):
        assert self.session is not None
        assert self.cfg is not None
        assert self.planner is not None
        assert self.tm is not None



        @self.session.on("user_state_changed")
        def _handle_user_state(
            ev: UserStateChangedEvent,
        ):
            """
            Production speech activity tracking.

            IMPORTANT:
            We track speaking state from
            LiveKit turn/VAD events.

            We DO NOT rely on transcript timing
            anymore.
            """

            try:

                new_state = str(
                    ev.new_state
                ).lower()

                #
                # User actively speaking
                #
                if new_state == "speaking":

                    if (
                        not self._candidate_is_speaking
                    ):
                        logger.info(
                            "Candidate started speaking."
                        )

                    self._candidate_is_speaking = True

                #
                # User finished speaking
                #
                elif new_state == "listening":

                    if (
                        self._candidate_is_speaking
                    ):
                        logger.info(
                            "Candidate stopped speaking."
                        )

                    # Always clear the speaking flag.
                    #
                    # CRITICAL: Do NOT guard this with generation_in_progress.
                    #
                    # With Tavus, the agent sets _generation_in_progress=True
                    # *before* the playback_finished event arrives. If the
                    # candidate speaks and stops while this flag is up, the
                    # old guard would drop the entire "listening" event,
                    # leaving _candidate_is_speaking permanently True and
                    # permanently blocking the transcript commit loop.
                    #
                    self._candidate_is_speaking = (
                        False
                    )

                    # Only advance the speech-end grace window when
                    # generation is NOT in progress.
                    #
                    # During TTS playback we don't want a false
                    # "recently stopped speaking" window to open,
                    # because any VAD bleed-through from the speaker
                    # fires its own "listening" events.
                    #
                    if not (
                        self._generation_in_progress
                        and self._pending_generation_type
                    ):
                        self._last_speech_end_at = (
                            time.monotonic()
                        )


            except Exception:
                logger.exception(
                    "user_state_changed "
                    "handler failed."
                )



        async def _handle_item(ev: ConversationItemAddedEvent):
            if not self._runtime_alive:
                return
                
            item = ev.item
            role = getattr(item, "role", None)


            text = None

            #
            # LiveKit v1.5 ChatMessage stores message text in content[]
            #
            content = getattr(item, "content", None)

            if isinstance(content, list) and content:
                text = " ".join(
                    str(part).strip()
                    for part in content
                    if part is not None
                ).strip()

            #
            # Fallback for older formats
            #
            if not text:
                text = getattr(item, "text", None)

            #
            # Fallback for possible future formats
            #
            if not text:
                text = getattr(item, "text_content", None)


            item_id = getattr(item, "id", None)





            # Deduplicate conversation items by ID if available.
            if item_id is not None:
                if item_id in self._processed_item_ids:
                    return
                self._processed_item_ids.add(item_id)

            if not text or role not in ("assistant", "user"):
                return

            logger.debug(
                "conversation_item_added: session_id=%s role=%s text=%s",
                self.cfg.session_id,
                role,
                text,
            )

            logger.warning(
                "Assistant item received → "
                "pending_generation_type=%s "
                "generation_in_progress=%s "
                "text=%s",
                self._pending_generation_type,
                self._generation_in_progress,
                text[:120],
            )

            # ----------------------------------------------------------------
            # Assistant side: classify spoken message
            # ----------------------------------------------------------------

            logger.warning(
                (
                    "ASSISTANT MESSAGE RECEIVED → "
                    "pending_generation_type=%s "
                    "generation_in_progress=%s "
                    "waiting_for_answer=%s "
                    "text=%r"
                ),
                self._pending_generation_type,
                self._generation_in_progress,
                self.tm.state.waiting_for_answer,

                text[:200],
            )
        
            if role == "assistant":

                owner = self._active_generation_owner

                expected_generation_type = None

                if owner is not None:
                    owner_age = (
                        time.monotonic()
                        - owner["started_at"]
                    )

                    # ownership survives TTS pipeline delay
                    # (TTS can take 5-15s after generate_reply returns)
                    if owner_age <= 60:
                        expected_generation_type = owner["type"]
                    else:
                        # Stale owner — clear it and treat as autonomous
                        logger.warning(
                            "Clearing stale generation owner: "
                            "age=%.1fs type=%s",
                            owner_age,
                            owner["type"],
                        )
                        self._active_generation_owner = None
                        self._pending_generation_type = None

                if (
                    expected_generation_type is None
                    and self._pending_generation_type
                ):
                    expected_generation_type = (
                        self._pending_generation_type
                    )

                logger.warning(
                    (
                        "ASSISTANT MESSAGE RECEIVED → "
                        "expected_generation_type=%s "
                        "pending_generation_type=%s "
                        "owner_seq=%s "
                        "generation_in_progress=%s "
                        "waiting_for_answer=%s "
                        "text=%r"
                    ),
                    expected_generation_type,
                    self._pending_generation_type,
                    (
                        self._active_generation_owner.get("seq")
                        if self._active_generation_owner
                        else None
                    ),
                    self._generation_in_progress,
                    self.tm.state.waiting_for_answer,

                    text[:200],
    )

                if expected_generation_type == "QUESTION" and self.tm.can_ask_new_question():
                    logger.warning(
                        "ASSISTANT CLASSIFIED → QUESTION"
                    )
                    # A base question has been spoken.
                    self._pending_generation_type = None
                    self._active_generation_owner = None

                    try:
                        self.state_machine.transition(InterviewState.LISTENING)
                    except ValueError:
                        logger.warning(
                            "Illegal state transition to LISTENING from %s",
                            self.state_machine.value.name,
                        )


                    self._reset_transcript_buffer()    

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
                            "state": self.state_machine.value.name,
                            "current_index": self.tm.current_turn_index_1based(),
                            "max_questions": total_q,
                        }
                    )
                    await self._sync_runtime_state()


                elif expected_generation_type == "RETRY":
                    if (
                        self.tm.state.is_finalizing_turn
                        or bool((self.tm.state.base_answer_text or "").strip())
                        or not self.tm.state.waiting_for_answer
                    ):
                        logger.warning(
                            "Discarding stale retry assistant item: turn=%s waiting=%s finalizing=%s text=%r",
                            self.tm.current_turn_index_1based(),
                            self.tm.state.waiting_for_answer,
                            self.tm.state.is_finalizing_turn,
                            text[:200],
                        )
                        self._pending_generation_type = None
                        self._active_generation_owner = None
                        try:
                            self.session.interrupt()
                        except Exception:
                            logger.exception(
                                "Failed to interrupt stale retry speech."
                            )
                        return

                    logger.warning(
                        "ASSISTANT CLASSIFIED → RETRY"
                    )

                    #
                    # Retry of SAME question.
                    #
                    # IMPORTANT:
                    # Do NOT call mark_question_asked()
                    # because that resets base_answer_text
                    # and corrupts turn finalization.
                    #
                    self._pending_generation_type = None
                    self._active_generation_owner = None

                    try:
                        self.state_machine.transition(
                            InterviewState.LISTENING
                        )
                    except ValueError:
                        logger.warning(
                            "Illegal state transition "
                            "to LISTENING from %s",
                            self.state_machine.value.name,
                        )

                    #
                    # Reset transcript buffer before retry.
                    #
                    # Prevents stale partial answer
                    # from causing immediate commit
                    # after retry question.
                    #
                    self._reset_transcript_buffer()
                    self.tm.state.last_question_time = (
                        time.monotonic()
                    )
                    self.tm.state.waiting_for_answer = True

                    await self._send_data(
                        {
                            "type": "state",
                            "state": self.state_machine.value.name,
                            "current_index": (
                                self.tm.current_turn_index_1based()
                            ),
                            "max_questions": total_q,
                        }
                    )

                    await self._sync_runtime_state()    

                elif self._active_generation_owner is not None:
                    logger.error(
                        (
                            "ASSISTANT CLASSIFIED → OWNER_MISMATCH "
                            "expected_generation_type=%s "
                            "pending_generation_type=%s "
                            "owner_seq=%s "
                            "waiting_for_answer=%s "
                            "text=%r"
                        ),
                        expected_generation_type,
                        self._pending_generation_type,
                        (
                            self._active_generation_owner.get("seq")
                            if self._active_generation_owner
                            else None
                        ),
                        self.tm.state.waiting_for_answer,
                        text[:200],
                    )
                    return

                else:
                    logger.error(
                        (
                            "ASSISTANT CLASSIFIED → AUTONOMOUS "
                            "pending_generation_type=%s "

                            "waiting_for_answer=%s "
                            "text=%r"
                        ),
                        self._pending_generation_type,
                        self.tm.state.waiting_for_answer,
                        text[:200],
                    )
                    #
                    # CRITICAL FIX:
                    # Interrupt any in-progress TTS playback.
                    #
                    # Previously we only returned here, but the
                    # autonomous speech had already been queued
                    # to the TTS pipeline and would still play.
                    #
                    try:
                        self.session.interrupt()
                        logger.info(
                            "Interrupted autonomous assistant speech."
                        )
                    except Exception:
                        logger.exception(
                            "Failed to interrupt autonomous speech."
                        )
                    return
                return


            if (
                role == "user"
                and self.tm.has_pending_question()
            ):

                incoming_text = (text or "").strip()

                if not incoming_text:
                    return

                normalized = self._normalize_transcript(
                    incoming_text
                )

                if not normalized:
                    return

                #
                # Transcript session start
                #
                if not self._transcript_started_at:

                    self._transcript_started_at = (
                        time.monotonic()
                    )

                #
                # Hard safety ceiling
                #
                self._transcript_update_count += 1

                if (
                    self._transcript_update_count >
                    MAX_TRANSCRIPT_UPDATES_PER_PROMPT
                ):
                    logger.warning(
                        "Too many transcript updates. "
                        "Force resetting transcript buffer."
                    )

                    self._reset_transcript_buffer()
                    return

                #
                # Similarity suppression
                #
                similarity = self._transcript_similarity(
                    normalized,
                    self._last_normalized_transcript,
                )

                if (
                    similarity >=
                    TRANSCRIPT_SIMILARITY_THRESHOLD
                ):
                    return

                #
                # Update transcript buffer
                #
                self._last_normalized_transcript = (
                    normalized
                )

                #
                # IMPORTANT:
                # Accumulate transcript chunks instead of replacing.
                #
                # Prevents partial answer commits when STT emits
                # speech in multiple bursts.
                #
                ##################################
                # if self._active_transcript_text:

                #     self._active_transcript_text = (
                #         self._active_transcript_text
                #         + " "
                #         + incoming_text
                #     )

                # else:

                #     self._active_transcript_text = (
                #         incoming_text
                #     )
















                ##################################
                # LiveKit transcripts are typically cumulative,
                # not independent chunks.
                #
                # Replace transcript with the latest
                # version instead of appending.
                #
                # Example:
                #
                # "I worked"
                # "I worked on"
                # "I worked on auth"
                #
                # We want ONLY latest transcript.
                #
                existing = (
                    self._active_transcript_text or ""
                ).strip()

                incoming = incoming_text.strip()

                #
                # Production-safe transcript merge.
                #
                # Handles:
                #
                # 1. cumulative transcripts
                # 2. chunked transcripts
                # 3. overlapping partial rewrites
                # 4. repeated STT emissions
                #
                # Examples:
                #
                # cumulative:
                # "I worked"
                # "I worked on auth"
                #
                # chunked:
                # "I worked"
                # "on auth"
                #
                # overlapping:
                # "I worked on auth"
                # "worked on auth with JWT"
                #

                if not existing:

                    self._active_transcript_text = incoming

                else:

                    existing_lower = existing.lower()
                    incoming_lower = incoming.lower()

                    #
                    # CASE 1:
                    # cumulative transcript
                    #
                    if incoming_lower.startswith(
                        existing_lower
                    ):

                        self._active_transcript_text = (
                            incoming
                        )

                    #
                    # CASE 2:
                    # duplicate transcript
                    #
                    elif incoming_lower in existing_lower:

                        pass

                    #
                    # CASE 3:
                    # overlap merge
                    #
                    else:

                        overlap_found = False

                        existing_words = (
                            existing.split()
                        )

                        incoming_words = (
                            incoming.split()
                        )

                        #
                        # Find longest overlap.
                        #
                        max_overlap = min(
                            len(existing_words),
                            len(incoming_words),
                            12,
                        )

                        for n in range(
                            max_overlap,
                            0,
                            -1,
                        ):

                            existing_tail = " ".join(
                                existing_words[-n:]
                            ).lower()

                            incoming_head = " ".join(
                                incoming_words[:n]
                            ).lower()

                            if (
                                existing_tail
                                == incoming_head
                            ):

                                merged = (
                                    existing_words
                                    + incoming_words[n:]
                                )

                                self._active_transcript_text = (
                                    " ".join(merged)
                                )

                                overlap_found = True
                                break

                        #
                        # CASE 4:
                        # fully independent chunk
                        #
                        if not overlap_found:

                            self._active_transcript_text = (
                                existing
                                + " "
                                + incoming
                            ).strip()











                self.tm.update_transcript_buffer(self._active_transcript_text)

                self._last_transcript_update_at = (
                    time.monotonic()
                )

                logger.info(
                    (
                        "TRANSCRIPT UPDATED → "
                        "incoming=%r "
                        "merged=%r "
                        "words=%s "
                        "candidate_speaking=%s "
                        "waiting_for_answer=%s"
                    ),
                    incoming_text[:120],
                    self._active_transcript_text[:300],
                    len(
                        re.findall(
                            r"\b[\w'-]+\b",
                            self._active_transcript_text,
                        )
                    ),
                    self._candidate_is_speaking,
                    self.tm.state.waiting_for_answer,
                )

                #
                # Safety timeout against endless transcript growth
                #
                elapsed = (
                    time.monotonic()
                    - self._transcript_started_at
                )

                word_count = len(
                    re.findall(
                        r"\b[\w'-]+\b",
                        self._active_transcript_text,
                    )
                )

                force_commit = (
                    elapsed >= TRANSCRIPT_BUFFER_MAX_SECONDS
                    and word_count >= MIN_TRANSCRIPT_COMMIT_WORDS
                )

                #
                # Cancel previous stabilization task
                #
                if self._transcript_stabilization_task:

                    if (
                        not self._transcript_stabilization_task.done()
                    ):
                        self._transcript_stabilization_task.cancel()

                #
                # Immediate forced commit
                #
                if force_commit:

                    logger.warning(
                        "Force committing transcript due to "
                        "buffer timeout."
                    )

                    # IMPORTANT:
                    # Cancel stabilization timer BEFORE force commit.
                    #
                    # Prevents delayed stabilization callbacks
                    # from firing after forced commit already finalized.
                    if self._transcript_stabilization_task:

                        if (
                            not self._transcript_stabilization_task.done()
                        ):
                            self._transcript_stabilization_task.cancel()

                    await self._commit_stabilized_transcript(
                        total_q=total_q,
                    )

                    return

                #
                # Start stabilization timer
                #
                task = asyncio.create_task(
                    self._schedule_transcript_commit(
                        total_q=total_q,
                    )
                )

                self._transcript_stabilization_task = task

                self._background_tasks.add(task)

                def _cleanup_task(t: asyncio.Task):
                    self._background_tasks.discard(t)

                task.add_done_callback(_cleanup_task)

                return
            
            

        @self.session.on("conversation_item_added")
        def _on_item(ev: ConversationItemAddedEvent):

            task = asyncio.create_task(_handle_item(ev))

            self._background_tasks.add(task)

            def _cleanup_task(t: asyncio.Task):
                self._background_tasks.discard(t)

            task.add_done_callback(_cleanup_task)

   

    # ---------- base turn finalization (NEW) ----------

    async def _finalize_base_turn(self, total_q: int):
        """
        Post the completed base turn to the backend, then advance turn_index
        and ask the next base question (or end the interview).

        Always called for every finalized answer:
        - From _process_finalized_answer (normal transcript commit path)
        - From _timeout_loop (timeout skip path)

        With no follow-ups, combined_answer_text == base_answer_text.
        The follow-up hard close (mark_followup_phase_completed) is harmless
        when called in base-only mode.
        """

        combined_answer_text = self._build_turn_answer_text()

        logger.info(
            (
                "FINALIZE_BASE_TURN ENTERED → "
                "turn=%s "
                "base_answer=%r "
                "combined_answer=%r"
            ),
            self.tm.current_turn_index_1based(),
            (
                self.tm.state.base_answer_text[:200]
                if self.tm.state.base_answer_text
                else None
            ),
            (
                combined_answer_text[:200]
                if combined_answer_text
                else None
            ),
        )


        assert self.backend is not None
        assert self.cfg is not None
        assert self.tm is not None
        assert self.planner is not None


        turn_index_1based = self.tm.current_turn_index_1based()
        question_text = self.tm.state.base_question_text or ""

        logger.warning(
            (
                "FINALIZE TURN START → "
                "turn=%s "
                "base_answer_exists=%s"
            ),
            turn_index_1based,
            bool(self.tm.state.base_answer_text),
        )

        answer_text = (
            self.tm.state.base_answer_text or ""
        ).strip()

        if not answer_text:

            #
            # Try salvaging from active transcript buffer.
            #
            # Covers race:
            #
            # user speaking
            # ↓
            # stabilization not committed yet
            # ↓
            # finalize triggered
            #
            salvaged = (
                self.tm.current_transcript_buffer().strip()
            )

            if (
                salvaged
                and self._is_valid_user_answer(
                    salvaged
                )
            ):

                logger.info(
                    "Salvaged answer from transcript "
                    "buffer: %r",
                    salvaged[:80],
                )

                answer_text = salvaged

                self._reset_transcript_buffer()

                self.tm.state.base_answer_text = (
                    answer_text
                )

            else:

                logger.warning(
                    "Empty answer detected. "
                    "Re-asking SAME question "
                    "(not consuming question slot)."
                )

                self._reset_transcript_buffer()

                #
                # FIX: Do NOT call mark_answer_received()
                # which would advance turn_index and
                # consume a question slot for nothing.
                #
                # Instead, reset current turn state
                # so the same question can be re-asked.
                #
                self.tm.reset_current_turn_state()

                await self._sync_runtime_state()

                # Re-ask the SAME question (turn_index unchanged).
                if self.tm.can_ask_new_question():
                    _idx = self.tm.current_turn_index_0based()
                    _base_q = self.planner.base_question_for_turn(_idx)
                    _instr = self.planner.build_llm_instruction(
                        turn_index=_idx,
                        base_q=_base_q,
                        last_answer=None,
                    )
                    try:
                        self.state_machine.transition(InterviewState.ASKING)
                    except ValueError:
                        logger.warning(
                            "Illegal state transition to ASKING from %s",
                            self.state_machine.value.name,
                        )
                    await self._send_data(
                        {
                            "type": "state",
                            "state": self.state_machine.value.name,
                            "current_index": self.tm.current_turn_index_1based(),
                            "max_questions": total_q,
                        }
                    )
                    await self._sync_runtime_state()
                    await self._safe_generate_reply(
                        instructions=_instr,
                        generation_type="QUESTION",
                    )
                else:
                    await self._conclude_interview(
                        total_q=total_q,
                        reason="no_more_questions",
                    )
                return

        # Merge base metadata with follow-up extras.
        metadata = {
            "round_type": self.cfg.round_type,
            "difficulty": self.cfg.difficulty,
            "role_slug": self.cfg.role_slug,
        }

        try:

            logger.warning(
                (
                    "POSTING TURN → "
                    "session=%s "
                    "turn=%s "
                    "question=%r "
                    "answer_words=%s "
                    "answer=%r"
                ),
                self.cfg.session_id,
                turn_index_1based,
                question_text[:120],
                len(
                    re.findall(
                        r"\b[\w'-]+\b",
                        answer_text,
                    )
                ),
                answer_text[:300],
            )

            resp = await asyncio.wait_for(
                self.backend.post_turn(
                    session_id=self.cfg.session_id,
                    turn_index_1based=turn_index_1based,
                    question_text=question_text,
                    answer_text=answer_text,
                    metadata=metadata,
                ),
                timeout=15.0,
            )
            if resp.status_code >= 400:
                logger.error(
                    "Backend turn post failed: status=%s body=%s",
                    resp.status_code,
                    resp.text,
                )
                raise RuntimeError(
                    f"Backend turn post failed with status={resp.status_code}"
                )
            else:
                logger.info(
                    "TURN POST SUCCESS → session=%s turn=%s",
                    self.cfg.session_id,
                    turn_index_1based,
                )    
        except Exception:
            logger.exception("Error posting turn to backend")
            # Recover finalize fence.
            self.tm.abort_turn_finalization()
            return


        # Now increment turn_index (base question fully finalized).
        self.tm.mark_answer_received()

        #
        # Finalization complete.
        #
        self.tm.complete_turn_finalization()

        # try:
        #     self.state_machine.transition(InterviewState.PROCESSING)
        # except ValueError:
        #     logger.warning(
        #         "Illegal state transition to PROCESSING from %s",
        #         self.state_machine.value.name,
        #     )

        await self._send_data(
            {
                "type": "state",
                "state": self.state_machine.value.name,
                "current_index": self.tm.current_turn_index_1based(),
                "max_questions": total_q,
            }
        )
        await self._sync_runtime_state()

        # Ask next base question or end interview.
        if self.tm.can_ask_new_question():
            idx = self.tm.current_turn_index_0based()
            base_q = self.planner.base_question_for_turn(idx)
            instr = self.planner.build_llm_instruction(
                turn_index=idx,
                base_q=base_q,
                last_answer=None,
            )

            try:
                self.state_machine.transition(InterviewState.ASKING)
            except ValueError:
                logger.warning(
                    "Illegal state transition to ASKING from %s",
                    self.state_machine.value.name,
                )

            await self._send_data(
                {
                    "type": "state",
                    "state": self.state_machine.value.name,
                    "current_index": self.tm.current_turn_index_1based(),
                    "max_questions": total_q,
                }
            )
            await self._sync_runtime_state()



            await self._safe_generate_reply(
                instructions=instr,
                generation_type="QUESTION",
            )

        else:
            await self._conclude_interview(
                total_q=total_q,
                reason="all_questions_completed",
            )

    # ---------- session start & first question ----------

    async def _start_session_and_ask_first(self):
        assert self.session is not None
        assert self.cfg is not None
        assert self.planner is not None
        assert self.tm is not None

        interviewer_agent = _build_interview_agent(self.cfg)
        room_output_options = None
        if self.avatar_bridge is not None:
            try:
                await self.avatar_bridge.start(
                    agent_session=self.session,
                    room=self.room,
                )
                room_output_options = (
                    self.avatar_bridge.build_room_output_options()
                )
            except Exception:
                logger.exception(
                    "Failed to start Tavus avatar. Continuing with audio-only interviewer."
                )

        # Start voice pipeline
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
            room_output_options=room_output_options,
        )

        # Ask first question (or resume from current index if we adopted runtime state)
        if self.tm.current_turn_index_0based() >= self.planner.total_questions():
            await self._conclude_interview(
                total_q=self.planner.total_questions(),
                reason="no_questions_available",
            )
            return

        idx = self.tm.current_turn_index_0based()
        base_q = self.planner.base_question_for_turn(idx)
        instr = self.planner.build_llm_instruction(
            turn_index=idx,
            base_q=base_q,
            last_answer=None,
        )

        if self._should_greet_on_start():
            greeting_text = self._build_greeting_text()
            self._greeting_spoken = True

            self.state_machine.transition(InterviewState.INTRO)
            await self._send_data(
                {
                    "type": "intro",
                    "text": greeting_text,
                }
            )
            await self._send_data(
                {
                    "type": "state",
                    "state": self.state_machine.value.name,
                    "current_index": self.tm.current_turn_index_1based(),
                    "max_questions": self.planner.total_questions(),
                }
            )
            await self._sync_runtime_state()

            question_task = asyncio.create_task(
                self._generate_question_text(
                    instructions=instr,
                    fallback_text=base_q.text,
                )
            )
            self._track_background_task(question_task)

            await self._safe_say(
                text=greeting_text,
                allow_interruptions=False,
            )

            question_text = base_q.text
            try:
                question_text = await asyncio.wait_for(
                    question_task,
                    timeout=max(
                        1.0,
                        ASSISTANT_GENERATION_TIMEOUT_SECONDS - 1.0,
                    ),
                )
            except asyncio.TimeoutError:
                logger.warning(
                    "Timed out waiting for first question pre-generation; using fallback text."
                )
            except Exception:
                logger.exception(
                    "First question pre-generation failed after greeting; using fallback text."
                )

            await self._speak_question_text(
                question_text=question_text,
                total_q=self.planner.total_questions(),
            )

            return

        # We are now in ASKING state while LLM generates/speaks the question.
        try:
            self.state_machine.transition(InterviewState.ASKING)
        except ValueError:
            logger.warning(
                "Illegal state transition to ASKING from %s",
                self.state_machine.value.name,
            )
        await self._send_data(
            {
                "type": "state",
                "state": self.state_machine.value.name,
                "current_index": self.tm.current_turn_index_1based(),
                "max_questions": self.planner.total_questions(),
            }
        )
        await self._sync_runtime_state()

        await self._safe_generate_reply(
            instructions=instr,
            generation_type="QUESTION",
        )



    async def _heartbeat_loop(self):
        """
        Periodically renew runtime ownership lease.

        Prevents backend from treating this runtime as stale.
        """

        assert self.backend is not None
        assert self.cfg is not None

        try:

            while self._runtime_alive:

                await asyncio.sleep(5)

                if not self._runtime_alive:
                    return

                try:
                    await self.backend.heartbeat_runtime(
                        self.cfg.session_id
                    )

                except RuntimeOwnershipLost:
                    raise

                except Exception:
                    logger.exception(
                        "Runtime heartbeat failed: session_id=%s",
                        self.cfg.session_id,
                    )

        except asyncio.CancelledError:
            raise

        except RuntimeOwnershipLost:
            logger.error(
                "Runtime ownership lost during heartbeat: session_id=%s",
                self.cfg.session_id,
            )

            self._runtime_alive = False

        except Exception:
            logger.exception(
                "Heartbeat loop crashed"
            )


    # ---------- timeout loop ----------

    async def _timeout_loop(self):
        """
        Handles "no-answer" timeout + retry/skip behavior,
        enforces overall interview duration,
        and pauses when no remote participants are present.
        """
        assert self.tm is not None
        assert self.planner is not None
        assert self.session is not None
        assert self.cfg is not None

        total_q = self.planner.total_questions()

        try:
            while not self.tm.state.done:
                await asyncio.sleep(TIMEOUT_LOOP_INTERVAL_SECONDS)

                # If candidate is disconnected, pause timeout behavior.
                if len(self.room.remote_participants) == 0:
                    continue
                if self._generation_in_progress:
                    continue

                # Finalized answer currently processing.
                #
                # Prevent retry race after transcript
                # commit but before next question.
                #
                if (
                    self._processing_answer
                    or self.tm.state.is_finalizing_turn
                ):

                    logger.debug(
                        (
                            "Suppressing timeout → "
                            "processing_answer=%s "
                            "is_finalizing_turn=%s"
                        ),
                        self._processing_answer,
                        self.tm.state.is_finalizing_turn,
                    )

                    continue

                # Enforce overall interview duration if configured.
                if (
                    self.cfg.duration_seconds is not None
                    and self._start_time_monotonic is not None
                ):
                    elapsed = time.monotonic() - self._start_time_monotonic
                    if elapsed >= self.cfg.duration_seconds:
                        logger.info(
                            "Interview duration reached for session %s; ending.",
                            self.cfg.session_id,
                        )
                        await self._send_data(
                            {
                                "type": "info",
                                "reason": "duration_reached",
                                "message": "The interview duration has ended.",
                            }
                        )
                        await self._conclude_interview(
                            total_q=total_q,
                            reason="duration_reached",
                        )
                        break

                if not self.tm.state.waiting_for_answer:
                    continue

                #
                # Production speech guard.
                #
                # Never retry/skip while candidate
                # is actively speaking.
                #
                # We rely on LiveKit speech/VAD events,
                # NOT transcript timing.
                #
                if self._candidate_is_speaking:

                    logger.debug(
                        "Suppressing timeout: "
                        "candidate still speaking."
                    )

                    continue


                #
                # Candidate recently stopped speaking.
                #
                # Give natural pause window before
                # retrying/skipping.
                #
                if self._candidate_recently_stopped_speaking():

                    logger.debug(
                        "Suppressing timeout: "
                        "speech recently ended."
                    )

                    continue


                #
                # Transcript still stabilizing.
                #
                # Prevent retry while STT is still
                # assembling final answer text.
                #
                if (
                    self._active_transcript_text.strip()
                    and self._last_transcript_update_at > 0
                    and (
                        time.monotonic()
                        - self._last_transcript_update_at
                    ) < (
                        TRANSCRIPT_STABILIZATION_SECONDS
                        + 1.0
                    )
                ):

                    logger.debug(
                        "Suppressing timeout: "
                        "transcript stabilizing."
                    )

                    continue

                #
                # If we already have transcript content or a commit task is still
                # pending, let transcript finalization finish instead of retrying.
                #
                if self._active_transcript_text.strip():

                    logger.debug(
                        "Suppressing timeout: transcript available for commit."
                    )

                    continue

                if (
                    self._transcript_stabilization_task is not None
                    and not self._transcript_stabilization_task.done()
                ):

                    logger.debug(
                        "Suppressing timeout: transcript commit task pending."
                    )

                    continue

                # Retry once if no answer
                if self.tm.should_retry_for_no_answer():
                    try:
                        self.state_machine.transition(InterviewState.RETRYING)
                    except ValueError:
                        logger.warning(
                            "Illegal state transition to RETRYING from %s",
                            self.state_machine.value.name,
                        )

                    self.tm.mark_retry_used()


                    await self._send_data(
                        {
                            "type": "info",
                            "reason": "no_answer_retry",
                            "message": (
                                "I didn't hear a response. "
                                "Please answer the question when you're ready."
                            ),
                            "index": self.tm.current_turn_index_1based(),
                        }
                    )

                    # [NEW] Use the original base question topic for retry instruction
                    # regardless of whether we are in a follow-up or base question.
                    base_q = self.planner.base_question_for_turn(
                        self.tm.current_turn_index_0based()
                    )
                    retry_instr = (
                        "The candidate did not respond clearly to your last question about:\n"
                        f"\"{base_q.text}\"\n\n"
                        "Please politely repeat the SAME question in different words. "
                        "Do not add new information, hints, or commentary. "
                        "Respond with the question only."
                    )
                    await self._safe_generate_reply(
                        instructions=retry_instr,
                        generation_type="RETRY",
                    )
                    await self._sync_runtime_state()
                    continue

                if self.tm.should_timeout_and_skip():

                    #
                    # Candidate is actively speaking.
                    #
                    # Transcript stabilization may not have committed yet.
                    # Never skip while transcript buffer exists.
                    #
                    if self._active_transcript_text.strip():

                        logger.info(
                            "Suppressing timeout skip: "
                            "candidate has active transcript."
                        )

                        #
                        # Give candidate more time.
                        #
                        self.tm.state.last_question_time = (
                            time.monotonic()
                        )

                        continue

                    skip_confirmed = False

                    async with self._turn_lock:
                        # Double-check after acquiring lock.
                        if not self.tm.has_pending_question():
                            continue

                        idx_1based = self.tm.current_turn_index_1based()

                        try:
                            self.state_machine.transition(InterviewState.SKIPPING)
                        except ValueError:
                            logger.warning(
                                "Illegal state transition to SKIPPING from %s",
                                self.state_machine.value.name,
                            )

                        await self._send_data(
                            {
                                "type": "info",
                                "reason": "no_answer_skip",
                                "message": "We will move on to the next question.",
                                "index": idx_1based,
                            }
                        )

                        skip_confirmed = True

                    # IMPORTANT:
                    # _finalize_base_turn() internally calls generate_reply().
                    # Never run generation while holding _turn_lock.
                    if skip_confirmed:

                        # IMPORTANT:
                        # Clear any partially accumulated transcript
                        # before advancing to next question.
                        #
                        # Prevents stale transcript carry-over
                        # after timeout skips.
                        self._reset_transcript_buffer()

                        await self._finalize_base_turn(total_q)

        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Timeout loop failed")
            try:
                self.state_machine.transition(InterviewState.FAILED)
            except Exception:
                pass
            await self._sync_runtime_state()



    async def shutdown(self):
            """
            Graceful runtime shutdown.

            Safe to call multiple times.
            """

            if self._shutdown_started:
                return

            self._shutdown_started = True

            logger.info(
                "Runtime shutdown starting: session_id=%s",
                self.cfg.session_id if self.cfg else None,
            )

            self._runtime_alive = False
            if not self._interview_done.is_set():
                self._interview_done.set()
            
            #
            # Cancel background tasks
            #
            for task in list(self._background_tasks):

                if task.done():
                    continue

                task.cancel()

            for task in list(self._background_tasks):

                try:
                    await task
                except asyncio.CancelledError:
                    pass
                except Exception:
                    logger.exception(
                        "Background task failed during shutdown"
                    )

            self._background_tasks.clear()

            #
            # Stop heartbeat task
            #
            if self.heartbeat_task:

                if not self.heartbeat_task.done():
                    self.heartbeat_task.cancel()

                try:
                    await self.heartbeat_task
                except asyncio.CancelledError:
                    pass
                except Exception:
                    logger.exception(
                        "Heartbeat task shutdown failure"
                    )

            #
            # Stop timeout task
            #
            if self.timeout_task:

                if not self.timeout_task.done():
                    self.timeout_task.cancel()

                try:
                    await self.timeout_task
                except asyncio.CancelledError:
                    pass
                except Exception:
                    logger.exception(
                        "Timeout task shutdown failure"
                    )

            #
            # Stop runtime guard
            #
            if self.runtime_guard:

                try:
                    await self.runtime_guard.stop()
                except Exception:
                    logger.exception(
                        "Runtime guard shutdown failed"
                    )



            #
            # Close backend client
            #
            if self.backend:

                try:
                    await self.backend.close()
                except Exception:
                    logger.exception(
                        "Backend close failed"
                    )

            if self.avatar_bridge is not None:
                try:
                    await self.avatar_bridge.shutdown()
                except Exception:
                    logger.exception("Tavus avatar shutdown failed")

            logger.info(
                "Runtime shutdown completed: session_id=%s",
                self.cfg.session_id if self.cfg else None,
            )            


def _build_interview_agent(cfg: InterviewConfig):
    from livekit.agents import Agent, StopResponse

    import textwrap

    instructions = textwrap.dedent(
        f"""\
        You are a professional AI interviewer conducting a practice interview.

        Role: {cfg.role_name or cfg.role_slug}
        Round type: {cfg.round_type}
        Difficulty: {cfg.difficulty}

        Your behavior:
        - Ask one clear question at a time.
        - Use a neutral, professional tone.
        - Do NOT give hints, coaching, or feedback during the interview.
        - Do NOT say things like "great answer", "good", or "excellent".
        - Do NOT evaluate whether answers are correct or incorrect.
        - Do NOT introduce new topics on your own.
        - Always follow the exact instructions given to you for each question.
        - When asked to rephrase or clarify, stay strictly on the same topic.
        - NEVER ask follow-up or clarifying questions on your own initiative.
        - You will receive explicit runtime instructions whenever a follow-up is required.
        - If no explicit instruction is given, remain silent after the candidate finishes speaking.
        - Never continue the conversation autonomously.
        - Never probe deeper unless explicitly instructed.

        Respond in plain text only. No lists, JSON, or formatting.
        """
    )

    class InterviewAgent(Agent):
        def __init__(self):
            super().__init__(instructions=instructions)

        async def on_user_turn_completed(self, turn_ctx, new_message) -> None:
            """
            Persist the user's committed turn, but block LiveKit's automatic
            assistant reply so the runtime alone decides when to ask next.
            """
            if self._activity is not None:
                self._chat_ctx.items.append(new_message)
                self._activity._session._conversation_item_added(new_message)

            raise StopResponse()

    return InterviewAgent()
