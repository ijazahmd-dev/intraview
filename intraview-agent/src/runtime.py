# # intraview_agent/runtime.py

# import asyncio
# import json
# import logging
# from typing import Optional

# from livekit.agents import (
#     AgentSession,
#     JobContext,
#     inference,
#     room_io,
#     ConversationItemAddedEvent,
# )
# from livekit.plugins import ai_coustics, silero
# from livekit.plugins.turn_detector.multilingual import MultilingualModel

# from .planner import InterviewConfig, QuestionPlanner
# from .turn_manager import TurnManager
# from .backend_client import BackendClient
# from .config import get_interview_defaults

# logger = logging.getLogger(__name__)


# class InterviewRuntime:
#     """
#     Runtime that wires together:
#       - QuestionPlanner
#       - TurnManager
#       - BackendClient
#       - AgentSession (STT/LLM/TTS)
#       - LiveKit room events

#     It assumes backend is the ultimate source of truth for session status,
#     but actively avoids obvious duplicates and provides structured events
#     to the frontend.
#     """

#     def __init__(self, ctx: JobContext):
#         self.ctx = ctx
#         self.room = ctx.room

#         self.cfg: Optional[InterviewConfig] = None
#         self.planner: Optional[QuestionPlanner] = None
#         self.tm: Optional[TurnManager] = None
#         self.backend: Optional[BackendClient] = None

#         self.session: Optional[AgentSession] = None
#         self.timeout_task: Optional[asyncio.Task] = None

#     # ---------- init ----------

#     def _build_config_from_metadata(self) -> InterviewConfig:
#         meta = self.ctx.job.metadata or {}

#         try:
#             session_id = int(meta.get("session_id"))
#         except Exception:
#             raise RuntimeError(f"session_id missing or invalid in metadata: {meta!r}")

#         role_slug = str(meta.get("role_slug") or "unknown-role")
#         round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
#         difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()

#         defaults = get_interview_defaults()
#         raw_max = meta.get("max_questions")
#         if raw_max is not None:
#             try:
#                 max_questions = int(raw_max)
#             except ValueError:
#                 max_questions = defaults.max_questions
#         else:
#             max_questions = defaults.max_questions

#         return InterviewConfig(
#             session_id=session_id,
#             role_slug=role_slug,
#             round_type=round_type,
#             difficulty=difficulty,
#             max_questions=max_questions,
#         )

#     async def _send_data(self, payload: dict):
#         """
#         Structured JSON messages for frontend.
#         """
#         try:
#             data = json.dumps(payload).encode("utf-8")
#             await self.room.local_participant.publish_data(data, reliable=True)
#         except Exception:
#             logger.exception("Failed to publish data message")

#     # ---------- main entry ----------

#     async def run(self):
#         """
#         High-level sequence:
#           1. Initialize config, planner, backend client.
#           2. Build AgentSession with STT/LLM/TTS + turn detection.
#           3. Attach conversation event handler + timeout loop.
#           4. Start session and ask first question.
#           5. Connect to room and wait until disconnect.
#         """
#         self.cfg = self._build_config_from_metadata()
#         self.backend = await BackendClient.create()
#         self.planner = QuestionPlanner(self.cfg)

#         total_q = self.planner.total_questions()
#         if total_q == 0:
#             logger.warning("No questions available for this interview; aborting.")
#             await self.backend.close()
#             return

#         self.tm = TurnManager(total_questions=total_q)

#         # AgentSession: STT/LLM/TTS pipeline via LiveKit Inference.[web:149]
#         self.session = AgentSession(
#             stt=inference.STT(model="deepgram/nova-3", language="multi"),
#             llm=inference.LLM(model="google/gemini-2.5-flash"),
#             tts=inference.TTS(
#                 model="cartesia/sonic-3",
#                 voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
#             ),
#             vad=self.ctx.proc.userdata["vad"],
#             turn_detection=MultilingualModel(),
#             preemptive_generation=True,
#         )

#         self._attach_conversation_handler(total_q)

#         try:
#             await self._start_session_and_ask_first()
#             self.timeout_task = asyncio.create_task(self._timeout_loop())
#             await self.ctx.connect()
#         finally:
#             if self.timeout_task:
#                 self.timeout_task.cancel()
#                 try:
#                     await self.timeout_task
#                 except Exception:
#                     pass
#             if self.backend:
#                 await self.backend.close()

#     # ---------- helpers ----------

#     def _attach_conversation_handler(self, total_q: int):
#         assert self.session is not None
#         assert self.cfg is not None
#         assert self.planner is not None
#         assert self.tm is not None

#         @self.session.on("conversation_item_added")
#         async def _on_item(ev: ConversationItemAddedEvent):
#             item = ev.item
#             role = getattr(item, "role", None)
#             text = getattr(item, "text", None)
#             if not text or role not in ("assistant", "user"):
#                 return

#             logger.debug(
#                 "conversation_item_added: session_id=%s role=%s text=%s",
#                 self.cfg.session_id,
#                 role,
#                 text,
#             )

#             # Assistant side: questions / closing
#             if role == "assistant":
#                 if not self.tm.can_ask_new_question():
#                     # Treat as closing or generic speech after questions.
#                     await self._send_data({"type": "ending", "text": text})
#                     return

#                 # This is the phrased question for the current turn.
#                 self.tm.mark_question_asked(question_text=text)
#                 await self._send_data(
#                     {
#                         "type": "question",
#                         "index": self.tm.current_turn_index_1based(),
#                         "text": text,
#                         "total": total_q,
#                     }
#                 )
#                 await self._send_data(
#                     {
#                         "type": "state",
#                         "state": "ASKING",
#                         "current_index": self.tm.current_turn_index_1based(),
#                         "max_questions": total_q,
#                     }
#                 )
#                 return

#             # User side: answers
#             if role == "user" and self.tm.has_pending_question():
#                 answer_text = text
#                 turn_index_1based = self.tm.current_turn_index_1based()
#                 question_text = self.tm.state.last_question_text or ""

#                 await self._send_data(
#                     {
#                         "type": "answer",
#                         "index": turn_index_1based,
#                         "question": question_text,
#                         "answer": answer_text,
#                     }
#                 )

#                 # Persist to backend with basic dedupe via backend's uniqueness constraint
#                 assert self.backend is not None
#                 resp = await self.backend.post_turn(
#                     session_id=self.cfg.session_id,
#                     turn_index_1based=turn_index_1based,
#                     question_text=question_text,
#                     answer_text=answer_text,
#                     metadata={
#                         "round_type": self.cfg.round_type,
#                         "difficulty": self.cfg.difficulty,
#                         "role_slug": self.cfg.role_slug,
#                     },
#                 )
#                 if resp.status_code >= 400:
#                     logger.error(
#                         "Backend turn post failed: status=%s body=%s",
#                         resp.status_code,
#                         resp.text,
#                     )

#                 self.tm.mark_answer_received()

#                 await self._send_data(
#                     {
#                         "type": "state",
#                         "state": "ANSWER_RECEIVED",
#                         "current_index": self.tm.current_turn_index_1based(),
#                         "max_questions": total_q,
#                     }
#                 )

#     async def _start_session_and_ask_first(self):
#         assert self.session is not None
#         assert self.cfg is not None
#         assert self.planner is not None
#         assert self.tm is not None

#         # Start voice pipeline
#         from intraview_agent.planner import InterviewConfig  # avoid circular import in type checkers

#         interviewer_agent = _build_interview_agent(self.cfg)

#         await self.session.start(
#             agent=interviewer_agent,
#             room=self.room,
#             room_options=room_io.RoomOptions(
#                 audio_input=room_io.AudioInputOptions(
#                     noise_cancellation=ai_coustics.audio_enhancement(
#                         model=ai_coustics.EnhancerModel.QUAIL_VF_L
#                     ),
#                 ),
#             ),
#         )

#         # Intro event for frontend
#         await self._send_data(
#             {
#                 "type": "intro",
#                 "text": "Hi, I am your AI interviewer. I will ask you a few practice interview questions.",
#             }
#         )

#         # Ask first question
#         base_q0 = self.planner.base_question_for_turn(0)
#         instr = self.planner.build_llm_instruction(
#             turn_index=0,
#             base_q=base_q0,
#             last_answer=None,
#         )
#         await self._send_data(
#             {
#                 "type": "state",
#                 "state": "INTRO",
#                 "current_index": 0,
#                 "max_questions": self.planner.total_questions(),
#             }
#         )
#         await self.session.generate_reply(instructions=instr)

#     async def _timeout_loop(self):
#         """
#         Handles "no-answer" timeout + retry/skip behavior.

#         This does NOT own the main audio pipeline; it only observes TurnManager state.
#         """
#         assert self.tm is not None
#         assert self.planner is not None
#         assert self.session is not None
#         assert self.cfg is not None

#         total_q = self.planner.total_questions()

#         while not self.tm.state.done:
#             await asyncio.sleep(2.0)

#             if not self.tm.state.waiting_for_answer:
#                 continue

#             # Retry once if no answer
#             if self.tm.should_retry_for_no_answer():
#                 self.tm.mark_retry_used()
#                 await self._send_data(
#                     {
#                         "type": "info",
#                         "reason": "no_answer_retry",
#                         "message": "I didn't hear a response. Please answer the question when you're ready.",
#                         "index": self.tm.current_turn_index_1based(),
#                     }
#                 )
#                 # Ask the same question again in slightly different wording.
#                 base_q = self.planner.base_question_for_turn(self.tm.current_turn_index_0based())
#                 retry_instr = (
#                     "The candidate did not respond clearly to your last question about:\n"
#                     f"\"{base_q.text}\"\n\n"
#                     "Please politely repeat the SAME question in different words. "
#                     "Do not add new information, hints, or commentary. "
#                     "Respond with the question only."
#                 )
#                 await self.session.generate_reply(instructions=retry_instr)
#                 continue

#             # If still nothing after second window, skip with empty answer.
#             if self.tm.should_timeout_and_skip():
#                 idx_1based = self.tm.current_turn_index_1based()
#                 await self._send_data(
#                     {
#                         "type": "info",
#                         "reason": "no_answer_skip",
#                         "message": "We will move on to the next question.",
#                         "index": idx_1based,
#                     }
#                 )
#                 assert self.backend is not None
#                 await self.backend.post_turn(
#                     session_id=self.cfg.session_id,
#                     turn_index_1based=idx_1based,
#                     question_text=self.tm.state.last_question_text or "",
#                     answer_text="",
#                     metadata={
#                         "round_type": self.cfg.round_type,
#                         "difficulty": self.cfg.difficulty,
#                         "role_slug": self.cfg.role_slug,
#                     },
#                 )
#                 self.tm.mark_answer_received()

#                 if self.tm.can_ask_new_question():
#                     base_q = self.planner.base_question_for_turn(self.tm.current_turn_index_0based())
#                     instr = self.planner.build_llm_instruction(
#                         turn_index=self.tm.current_turn_index_0based(),
#                         base_q=base_q,
#                         last_answer=None,
#                     )
#                     await self.session.generate_reply(instructions=instr)
#                 else:
#                     # All questions exhausted
#                     await self._send_data(
#                         {
#                             "type": "state",
#                             "state": "DONE",
#                             "current_index": self.tm.current_turn_index_1based(),
#                             "max_questions": total_q,
#                         }
#                     )
#                     self.tm.state.done = True
#                     break


# # Helper to build the interviewer Agent (Gemini prompt) without circular imports
# def _build_interview_agent(cfg: InterviewConfig):
#     from livekit.agents import Agent
#     import textwrap

#     instructions = textwrap.dedent(
#         f"""\
#         You are an AI interviewer for a practice interview platform.

#         ROLE AND CONTEXT
#         - Target role: {cfg.role_slug}
#         - Round type: {cfg.round_type}
#         - Difficulty level: {cfg.difficulty}
#         - This is a PRACTICE interview, not a real hiring decision.

#         BEHAVIOR RULES
#         - Ask one clear interview question at a time.
#         - Do NOT give hints, coaching, or feedback.
#         - Do NOT say things like "great answer", "excellent", or "that's correct".
#         - Stay neutral and professional in tone.
#         - Avoid small talk unrelated to the interview.

#         FLOW RULES
#         - When you receive an instruction describing what question to ask, follow it exactly.
#         - Do NOT decide on your own how many questions to ask or when to end the interview.
#         - Wait for the candidate's answer before asking the next question.

#         OUTPUT RULES
#         - Respond in plain text only (no JSON, bullet points, or formatting).
#         - Never mention that you are an AI model or that you are using tools.
#         """
#     )

#     class InterviewAgent(Agent):
#         def __init__(self):
#             super().__init__(instructions=instructions)

#     return InterviewAgent()


































# # intraview_agent/runtime.py

# import asyncio
# import json
# import logging
# from typing import Optional

# from livekit.agents import (
#     AgentSession,
#     JobContext,
#     inference,
#     room_io,
#     ConversationItemAddedEvent,
# )
# from livekit.plugins import ai_coustics, silero
# from livekit.plugins.turn_detector.multilingual import MultilingualModel

# from .backend_client import BackendClient
# from .config import get_interview_defaults
# from .constants import TIMEOUT_LOOP_INTERVAL_SECONDS
# from .planner import InterviewConfig, QuestionPlanner
# from .state import InterviewState, StateMachine
# from .turn_manager import TurnManager

# logger = logging.getLogger(__name__)


# class InterviewRuntime:
#     """
#     Runtime that wires together:
#       - QuestionPlanner
#       - TurnManager
#       - StateMachine
#       - BackendClient
#       - AgentSession (STT/LLM/TTS)
#       - LiveKit room events
#     """

#     def __init__(self, ctx: JobContext):
#         self.ctx = ctx
#         self.room = ctx.room

#         self.cfg: Optional[InterviewConfig] = None
#         self.state_machine = StateMachine()

#         self.planner: Optional[QuestionPlanner] = None
#         self.tm: Optional[TurnManager] = None
#         self.backend: Optional[BackendClient] = None

#         self.session: Optional[AgentSession] = None
#         self.timeout_task: Optional[asyncio.Task] = None

#     # ---------- initialization helpers ----------

#     def _build_config_from_metadata(self) -> InterviewConfig:
#         meta = self.ctx.job.metadata or {}

#         try:
#             session_id = int(meta.get("session_id"))
#         except Exception:
#             raise RuntimeError(f"session_id missing or invalid in metadata: {meta!r}")

#         role_slug = str(meta.get("role_slug") or "unknown-role")
#         round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
#         difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()

#         defaults = get_interview_defaults()
#         raw_max = meta.get("max_questions")
#         if raw_max is not None:
#             try:
#                 max_questions = int(raw_max)
#             except ValueError:
#                 max_questions = defaults.max_questions
#         else:
#             max_questions = defaults.max_questions

#         return InterviewConfig(
#             session_id=session_id,
#             role_slug=role_slug,
#             round_type=round_type,
#             difficulty=difficulty,
#             max_questions=max_questions,
#         )

#     async def _send_data(self, payload: dict):
#         """
#         Send structured JSON messages to frontend.
#         """
#         try:
#             data = json.dumps(payload).encode("utf-8")
#             await self.room.local_participant.publish_data(data, reliable=True)
#         except Exception:
#             logger.exception("Failed to publish data message")

#     async def _sync_runtime_state(self):
#         """
#         Best-effort push of current runtime state to backend.

#         Backend is the long-term source of truth; this call is optional
#         and safe to add later on the Django side.
#         """
#         if not self.backend or not self.cfg or not self.tm:
#             return

#         current_state = self.state_machine.value
#         payload = {
#             "current_turn_index": self.tm.current_turn_index_0based(),
#             "waiting_for_answer": self.tm.state.waiting_for_answer,
#             "current_state": current_state.name,
#         }
#         try:
#             await self.backend.update_runtime_state(self.cfg.session_id, payload)
#         except Exception:
#             # We log but don't crash the runtime for sync errors.
#             logger.exception("Failed to sync runtime state to backend")

#     # ---------- main entry ----------

#     async def run(self):
#         """
#         High-level sequence:
#           1. Initialize config, planner, backend client.
#           2. Build AgentSession with STT/LLM/TTS + turn detection.
#           3. Attach conversation event handler + timeout loop.
#           4. Start session and ask first question.
#           5. Connect to room and wait until disconnect.
#         """
#         self.cfg = self._build_config_from_metadata()
#         self.backend = await BackendClient.create()
#         self.planner = QuestionPlanner(self.cfg)

#         total_q = self.planner.total_questions()
#         if total_q == 0:
#             logger.warning("No questions available for this interview; aborting.")
#             await self.backend.close()
#             return

#         self.tm = TurnManager(total_questions=total_q)

#         # AgentSession: STT/LLM/TTS pipeline via LiveKit Inference.
#         self.session = AgentSession(
#             stt=inference.STT(model="deepgram/nova-3", language="multi"),
#             llm=inference.LLM(model="google/gemini-2.5-flash"),
#             tts=inference.TTS(
#                 model="cartesia/sonic-3",
#                 voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
#             ),
#             vad=self.ctx.proc.userdata["vad"],
#             turn_detection=MultilingualModel(),
#             preemptive_generation=True,
#         )

#         # Optional: load existing runtime state for future reconnect support.
#         await self._load_existing_runtime_state()

#         self._attach_conversation_handler(total_q)

#         try:
#             await self._start_session_and_ask_first()
#             self.timeout_task = asyncio.create_task(self._timeout_loop())
#             await self.ctx.connect()
#         except asyncio.CancelledError:
#             # Propagate cancellation cleanly.
#             raise
#         except Exception:
#             logger.exception("InterviewRuntime failed")
#         finally:
#             if self.timeout_task:
#                 self.timeout_task.cancel()
#                 try:
#                     await self.timeout_task
#                 except asyncio.CancelledError:
#                     pass
#                 except Exception:
#                     logger.exception("Timeout task failed during shutdown")

#             if self.backend:
#                 await self.backend.close()

#     async def _load_existing_runtime_state(self):
#         """
#         Best-effort attempt to read existing runtime state from backend.

#         If runtime-state endpoint is not implemented or returns 404, we simply
#         start from fresh in-memory state.
#         """
#         if not self.backend or not self.cfg:
#             return

#         try:
#             data = await self.backend.load_runtime_state(self.cfg.session_id)
#         except httpx.HTTPStatusError:
#             # Non-404 errors bubble up; 404 is treated as "no state"
#             return
#         except Exception:
#             logger.exception("Failed to load runtime state; starting fresh")
#             return

#         if not data:
#             return

#         # Minimal resume logic for now: we only adopt current_turn_index.
#         try:
#             idx = int(data.get("current_turn_index", 0))
#         except Exception:
#             idx = 0

#         if self.tm and 0 <= idx < self.tm.total_questions:
#             self.tm.state.turn_index = idx
#             logger.info(
#                 "Resuming interview from backend runtime state: current_turn_index=%s",
#                 idx,
#             )

#     # ---------- LiveKit conversation handling ----------

#     def _attach_conversation_handler(self, total_q: int):
#         assert self.session is not None
#         assert self.cfg is not None
#         assert self.planner is not None
#         assert self.tm is not None

#         @self.session.on("conversation_item_added")
#         async def _on_item(ev: ConversationItemAddedEvent):
#             item = ev.item
#             role = getattr(item, "role", None)
#             text = getattr(item, "text", None)
#             if not text or role not in ("assistant", "user"):
#                 return

#             logger.debug(
#                 "conversation_item_added: session_id=%s role=%s text=%s",
#                 self.cfg.session_id,
#                 role,
#                 text,
#             )

#             # Assistant side: question wording / closing language.
#             if role == "assistant":
#                 if not self.tm.can_ask_new_question():
#                     # Treat as closing or generic speech after questions.
#                     await self._send_data({"type": "ending", "text": text})
#                     return

#                 # This item is the actual question for the current turn.
#                 try:
#                     self.state_machine.transition(InterviewState.ASKING)
#                 except ValueError:
#                     logger.warning(
#                         "Illegal state transition to ASKING from %s",
#                         self.state_machine.value.name,
#                     )

#                 self.tm.mark_question_asked(question_text=text)
#                 await self._send_data(
#                     {
#                         "type": "question",
#                         "index": self.tm.current_turn_index_1based(),
#                         "text": text,
#                         "total": total_q,
#                     }
#                 )
#                 await self._send_data(
#                     {
#                         "type": "state",
#                         "state": self.state_machine.value.name,
#                         "current_index": self.tm.current_turn_index_1based(),
#                         "max_questions": total_q,
#                     }
#                 )
#                 await self._sync_runtime_state()
#                 return

#             # User side: answers
#             if role == "user" and self.tm.has_pending_question():
#                 try:
#                     self.state_machine.transition(InterviewState.LISTENING)
#                 except ValueError:
#                     logger.warning(
#                         "Illegal state transition to LISTENING from %s",
#                         self.state_machine.value.name,
#                     )

#                 answer_text = text
#                 turn_index_1based = self.tm.current_turn_index_1based()
#                 question_text = self.tm.state.last_question_text or ""

#                 await self._send_data(
#                     {
#                         "type": "answer",
#                         "index": turn_index_1based,
#                         "question": question_text,
#                         "answer": answer_text,
#                     }
#                 )

#                 # Persist to backend (idempotent).
#                 try:
#                     assert self.backend is not None
#                     resp = await self.backend.post_turn(
#                         session_id=self.cfg.session_id,
#                         turn_index_1based=turn_index_1based,
#                         question_text=question_text,
#                         answer_text=answer_text,
#                         metadata={
#                             "round_type": self.cfg.round_type,
#                             "difficulty": self.cfg.difficulty,
#                             "role_slug": self.cfg.role_slug,
#                         },
#                     )
#                     if resp.status_code >= 400:
#                         logger.error(
#                             "Backend turn post failed: status=%s body=%s",
#                             resp.status_code,
#                             resp.text,
#                         )
#                 except Exception:
#                     logger.exception("Error posting turn to backend")

#                 self.tm.mark_answer_received()
#                 try:
#                     self.state_machine.transition(InterviewState.PROCESSING)
#                 except ValueError:
#                     logger.warning(
#                         "Illegal state transition to PROCESSING from %s",
#                         self.state_machine.value.name,
#                     )

#                 await self._send_data(
#                     {
#                         "type": "state",
#                         "state": self.state_machine.value.name,
#                         "current_index": self.tm.current_turn_index_1based(),
#                         "max_questions": total_q,
#                     }
#                 )
#                 await self._sync_runtime_state()

#     # ---------- session start & first question ----------

#     async def _start_session_and_ask_first(self):
#         assert self.session is not None
#         assert self.cfg is not None
#         assert self.planner is not None
#         assert self.tm is not None

#         interviewer_agent = _build_interview_agent(self.cfg)

#         # Start voice pipeline
#         await self.session.start(
#             agent=interviewer_agent,
#             room=self.room,
#             room_options=room_io.RoomOptions(
#                 audio_input=room_io.AudioInputOptions(
#                     noise_cancellation=ai_coustics.audio_enhancement(
#                         model=ai_coustics.EnhancerModel.QUAIL_VF_L
#                     ),
#                 ),
#             ),
#         )

#         # Intro
#         self.state_machine.transition(InterviewState.INTRO)
#         await self._send_data(
#             {
#                 "type": "intro",
#                 "text": "Hi, I am your AI interviewer. I will ask you a few practice interview questions.",
#             }
#         )
#         await self._send_data(
#             {
#                 "type": "state",
#                 "state": self.state_machine.value.name,
#                 "current_index": self.tm.current_turn_index_1based(),
#                 "max_questions": self.planner.total_questions(),
#             }
#         )
#         await self._sync_runtime_state()

#         # Ask first question (or resume from current index if we adopted runtime state)
#         if self.tm.current_turn_index_0based() >= self.planner.total_questions():
#             # Nothing to ask – treat as completed.
#             self.state_machine.transition(InterviewState.COMPLETED)
#             await self._send_data(
#                 {
#                     "type": "state",
#                     "state": self.state_machine.value.name,
#                     "current_index": self.tm.current_turn_index_1based(),
#                     "max_questions": self.planner.total_questions(),
#                 }
#             )
#             await self._sync_runtime_state()
#             return

#         idx = self.tm.current_turn_index_0based()
#         base_q = self.planner.base_question_for_turn(idx)
#         instr = self.planner.build_llm_instruction(
#             turn_index=idx,
#             base_q=base_q,
#             last_answer=None,
#         )

#         await self.session.generate_reply(instructions=instr)

#     # ---------- timeout loop ----------

#     async def _timeout_loop(self):
#         """
#         Handles "no-answer" timeout + retry/skip behavior.
#         """
#         assert self.tm is not None
#         assert self.planner is not None
#         assert self.session is not None
#         assert self.cfg is not None

#         total_q = self.planner.total_questions()

#         try:
#             while not self.tm.state.done:
#                 await asyncio.sleep(TIMEOUT_LOOP_INTERVAL_SECONDS)

#                 if not self.tm.state.waiting_for_answer:
#                     continue

#                 # Retry once if no answer
#                 if self.tm.should_retry_for_no_answer():
#                     try:
#                         self.state_machine.transition(InterviewState.RETRYING)
#                     except ValueError:
#                         logger.warning(
#                             "Illegal state transition to RETRYING from %s",
#                             self.state_machine.value.name,
#                         )

#                     self.tm.mark_retry_used()
#                     await self._send_data(
#                         {
#                             "type": "info",
#                             "reason": "no_answer_retry",
#                             "message": "I didn't hear a response. Please answer the question when you're ready.",
#                             "index": self.tm.current_turn_index_1based(),
#                         }
#                     )
#                     base_q = self.planner.base_question_for_turn(self.tm.current_turn_index_0based())
#                     retry_instr = (
#                         "The candidate did not respond clearly to your last question about:\n"
#                         f"\"{base_q.text}\"\n\n"
#                         "Please politely repeat the SAME question in different words. "
#                         "Do not add new information, hints, or commentary. "
#                         "Respond with the question only."
#                     )
#                     await self.session.generate_reply(instructions=retry_instr)
#                     await self._sync_runtime_state()
#                     continue

#                 # If still nothing after second window, skip with empty answer.
#                 if self.tm.should_timeout_and_skip():
#                     try:
#                         self.state_machine.transition(InterviewState.SKIPPING)
#                     except ValueError:
#                         logger.warning(
#                             "Illegal state transition to SKIPPING from %s",
#                             self.state_machine.value.name,
#                         )

#                     idx_1based = self.tm.current_turn_index_1based()
#                     await self._send_data(
#                         {
#                             "type": "info",
#                             "reason": "no_answer_skip",
#                             "message": "We will move on to the next question.",
#                             "index": idx_1based,
#                         }
#                     )
#                     assert self.backend is not None
#                     await self.backend.post_turn(
#                         session_id=self.cfg.session_id,
#                         turn_index_1based=idx_1based,
#                         question_text=self.tm.state.last_question_text or "",
#                         answer_text="",
#                         metadata={
#                             "round_type": self.cfg.round_type,
#                             "difficulty": self.cfg.difficulty,
#                             "role_slug": self.cfg.role_slug,
#                         },
#                     )
#                     self.tm.mark_answer_received()

#                     if self.tm.can_ask_new_question():
#                         base_q = self.planner.base_question_for_turn(self.tm.current_turn_index_0based())
#                         instr = self.planner.build_llm_instruction(
#                             turn_index=self.tm.current_turn_index_0based(),
#                             base_q=base_q,
#                             last_answer=None,
#                         )
#                         await self.session.generate_reply(instructions=instr)
#                     else:
#                         # All questions exhausted
#                         self.state_machine.transition(InterviewState.ENDING)
#                         await self._send_data(
#                             {
#                                 "type": "state",
#                                 "state": self.state_machine.value.name,
#                                 "current_index": self.tm.current_turn_index_1based(),
#                                 "max_questions": total_q,
#                             }
#                         )
#                         self.state_machine.transition(InterviewState.COMPLETED)
#                         self.tm.state.done = True

#                     await self._sync_runtime_state()
#         except asyncio.CancelledError:
#             # Normal shutdown path.
#             raise
#         except Exception:
#             logger.exception("Timeout loop failed")
#             try:
#                 self.state_machine.transition(InterviewState.FAILED)
#             except Exception:
#                 pass
#             await self._sync_runtime_state()


# # Helper to build the interviewer Agent (Gemini prompt)
# def _build_interview_agent(cfg: InterviewConfig):
#     from livekit.agents import Agent
#     import textwrap

#     instructions = textwrap.dedent(
#         f"""\
#         You are an AI interviewer for a practice interview platform.

#         ROLE AND CONTEXT
#         - Target role: {cfg.role_slug}
#         - Round type: {cfg.round_type}
#         - Difficulty level: {cfg.difficulty}
#         - This is a PRACTICE interview, not a real hiring decision.

#         BEHAVIOR RULES
#         - Ask one clear interview question at a time.
#         - Do NOT give hints, coaching, or feedback.
#         - Do NOT say things like "good answer", "great", or "excellent".
#         - Do NOT evaluate whether answers are correct or incorrect.
#         - Stay neutral and professional in tone.
#         - Avoid small talk unrelated to the interview.

#         FLOW RULES
#         - When you receive instructions describing what question to ask, follow them exactly.
#         - Do NOT decide on your own how many questions to ask or when to end the interview.
#         - Wait for the candidate's answer before asking the next question.

#         OUTPUT RULES
#         - Respond in plain text only (no JSON, bullet points, or formatting).
#         - Never mention that you are an AI model or that you are using tools.
#         """
#     )

#     class InterviewAgent(Agent):
#         def __init__(self):
#             super().__init__(instructions=instructions)

#     return InterviewAgent()















































# # intraview_agent/runtime.py

# import asyncio
# import json
# import logging
# import time
# from typing import Optional, Set

# from livekit.agents import (
#     AgentSession,
#     JobContext,
#     inference,
#     room_io,
#     ConversationItemAddedEvent,
# )
# from livekit.plugins import ai_coustics, silero
# from livekit.plugins.turn_detector.multilingual import MultilingualModel

# from backend_client import BackendClient
# from config import get_interview_defaults
# from constants import TIMEOUT_LOOP_INTERVAL_SECONDS
# from planner import InterviewConfig, QuestionPlanner
# from state import InterviewState, StateMachine
# from turn_manager import TurnManager

# logger = logging.getLogger(__name__)


# class InterviewRuntime:
#     """
#     Runtime that wires together:
#       - QuestionPlanner
#       - TurnManager
#       - StateMachine
#       - BackendClient
#       - AgentSession (STT/LLM/TTS)
#       - LiveKit room events

#     This version focuses on:
#       - Correct assistant message classification
#       - Concurrency-safe turn finalization
#       - Transcript deduplication
#       - Duration enforcement
#       - Pausing timeouts when candidate is disconnected
#     """

#     def __init__(self, ctx: JobContext):
#         self.ctx = ctx
#         self.room = ctx.room

#         self.cfg: Optional[InterviewConfig] = None
#         self.state_machine = StateMachine()

#         self.planner: Optional[QuestionPlanner] = None
#         self.tm: Optional[TurnManager] = None
#         self.backend: Optional[BackendClient] = None

#         self.session: Optional[AgentSession] = None
#         self.timeout_task: Optional[asyncio.Task] = None

#         # Track when interview started (for duration enforcement)
#         self._start_time_monotonic: Optional[float] = None

#         # Only process each conversation item once
#         self._processed_item_ids: Set[str] = set()

#         # Lock around turn finalization to prevent races between timeout and transcript
#         self._turn_lock = asyncio.Lock()

#         # Lock around LLM generation so we don't overlap generate_reply() calls
#         self._generation_lock = asyncio.Lock()

#         # Classify what we expect the next assistant message to be
#         # ("QUESTION", None, etc.). This prevents accidental question detection.
#         self._pending_generation_type: Optional[str] = None

#     # ---------- initialization helpers ----------

#     def _build_config_from_metadata(self) -> InterviewConfig:
#         raw_meta = self.ctx.job.metadata

#         if not raw_meta:
#             meta = {}
#         elif isinstance(raw_meta, str):
#             try:
#                 meta = json.loads(raw_meta)
#             except json.JSONDecodeError:
#                 raise RuntimeError(f"job metadata is not valid JSON: {raw_meta!r}")
#         elif isinstance(raw_meta, dict):
#             meta = raw_meta
#         else:
#             raise RuntimeError(
#                 f"job metadata must be dict or JSON string, got {type(raw_meta)!r}: {raw_meta!r}"
#             )

#         try:
#             session_id = int(meta.get("session_id"))
#         except (TypeError, ValueError):
#             raise RuntimeError(f"session_id missing or invalid in metadata: {meta!r}")

#         role_slug = str(meta.get("role_slug") or "unknown-role")
#         round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
#         difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()

#         defaults = get_interview_defaults()

#         raw_max = meta.get("max_questions")
#         if raw_max is not None:
#             try:
#                 max_questions = int(raw_max)
#             except (TypeError, ValueError):
#                 max_questions = defaults.max_questions
#         else:
#             max_questions = defaults.max_questions

#         duration_seconds: Optional[int] = None
#         raw_dur_sec = meta.get("duration_seconds")
#         raw_dur_min = meta.get("duration_minutes")

#         if raw_dur_sec is not None:
#             try:
#                 duration_seconds = int(raw_dur_sec)
#             except (TypeError, ValueError):
#                 duration_seconds = None
#         elif raw_dur_min is not None:
#             try:
#                 duration_seconds = int(raw_dur_min) * 60
#             except (TypeError, ValueError):
#                 duration_seconds = None

#         return InterviewConfig(
#             session_id=session_id,
#             role_slug=role_slug,
#             round_type=round_type,
#             difficulty=difficulty,
#             max_questions=max_questions,
#             duration_seconds=duration_seconds,
#         )

#     async def _send_data(self, payload: dict):
#         """
#         Send structured JSON messages to frontend.
#         """
#         try:
#             data = json.dumps(payload).encode("utf-8")
#             await self.room.local_participant.publish_data(data, reliable=True)
#         except Exception:
#             logger.exception("Failed to publish data message")

#     async def _sync_runtime_state(self):
#         """
#         Best-effort push of current runtime state to backend.

#         Backend is the long-term source of truth; this call is optional
#         and safe to add later on the Django side.
#         """
#         if not self.backend or not self.cfg or not self.tm:
#             return

#         current_state = self.state_machine.value
#         payload = {
#             "current_turn_index": self.tm.current_turn_index_0based(),
#             "waiting_for_answer": self.tm.state.waiting_for_answer,
#             "current_state": current_state.name,
#         }

#         # If duration is configured and we have a start time, include remaining seconds.
#         if self.cfg.duration_seconds is not None and self._start_time_monotonic is not None:
#             elapsed = int(time.monotonic() - self._start_time_monotonic)
#             remaining = max(self.cfg.duration_seconds - elapsed, 0)
#             payload["remaining_seconds"] = remaining

#         try:
#             await self.backend.update_runtime_state(self.cfg.session_id, payload)
#         except Exception:
#             # Log but do not crash runtime on sync failure.
#             logger.exception("Failed to sync runtime state to backend")

#     # ---------- main entry ----------

#     async def run(self):
#         """
#         High-level sequence:
#           1. Initialize config, planner, backend client.
#           2. Build AgentSession with STT/LLM/TTS + turn detection.
#           3. Attach conversation event handler + timeout loop.
#           4. Start session and ask first question.
#           5. Connect to room and wait until disconnect.
#         """
#         self.cfg = self._build_config_from_metadata()
#         self.backend = await BackendClient.create()
#         self.planner = QuestionPlanner(self.cfg)

#         total_q = self.planner.total_questions()
#         if total_q == 0:
#             logger.warning("No questions available for this interview; aborting.")
#             await self.backend.close()
#             return

#         self.tm = TurnManager(total_questions=total_q)

#         # AgentSession: STT/LLM/TTS pipeline via LiveKit Inference.
#         self.session = AgentSession(
#             stt=inference.STT(model="deepgram/nova-3", language="multi"),
#             llm=inference.LLM(model="google/gemini-2.5-flash"),
#             tts=inference.TTS(
#                 model="cartesia/sonic-3",
#                 voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
#             ),
#             vad=self.ctx.proc.userdata["vad"],
#             turn_handling={
#                 "turn_detection": MultilingualModel(),
#                 "endpointing": {
#                     "mode": "dynamic",
#                     "min_delay": 0.4,
#                     "max_delay": 1.2,
#                 },
#                 "interruption": {
#                     "enabled": True,
#                     "mode": "adaptive",
#                     "min_duration": 0.4,
#                     "min_words": 0,
#                     "false_interruption_timeout": 2.0,
#                     "resume_false_interruption": True,
#                     "discard_audio_if_uninterruptible": True,
#                 },
#                 "preemptive_generation": {
#                     "enabled": True,
#                     "preemptive_tts": False,
#                     "max_speech_duration": 8.0,
#                     "max_retries": 1,
#                 },
#             },
#         )

#         # Start interview timer for duration enforcement.
#         self._start_time_monotonic = time.monotonic()

#         # Optional: load existing runtime state for future reconnect support.
#         await self._load_existing_runtime_state()

#         self._attach_conversation_handler(total_q)

#         try:
#             await self._start_session_and_ask_first()
#             self.timeout_task = asyncio.create_task(self._timeout_loop())
#             await self.ctx.connect()
#         except asyncio.CancelledError:
#             # Propagate cancellation cleanly.
#             raise
#         except Exception:
#             logger.exception("InterviewRuntime failed")
#         finally:
#             if self.timeout_task:
#                 self.timeout_task.cancel()
#                 try:
#                     await self.timeout_task
#                 except asyncio.CancelledError:
#                     pass
#                 except Exception:
#                     logger.exception("Timeout task failed during shutdown")

#             if self.backend:
#                 await self.backend.close()

#     async def _load_existing_runtime_state(self):
#         """
#         Best-effort attempt to read existing runtime state from backend.

#         Currently we only adopt current_turn_index; more fields can be added later.
#         """
#         if not self.backend or not self.cfg or not self.tm:
#             return

#         try:
#             data = await self.backend.load_runtime_state(self.cfg.session_id)
#         except Exception:
#             logger.exception("Failed to load runtime state; starting fresh")
#             return

#         if not data:
#             return

#         try:
#             idx = int(data.get("current_turn_index", 0))
#         except Exception:
#             idx = 0

#         if 0 <= idx < self.tm.total_questions:
#             self.tm.state.turn_index = idx
#             logger.info(
#                 "Resuming interview from backend runtime state: current_turn_index=%s",
#                 idx,
#             )

#     # ---------- LiveKit conversation handling ----------

#     def _attach_conversation_handler(self, total_q: int):
#         assert self.session is not None
#         assert self.cfg is not None
#         assert self.planner is not None
#         assert self.tm is not None

#         async def _handle_item(ev: ConversationItemAddedEvent):
#             item = ev.item
#             role = getattr(item, "role", None)
#             text = getattr(item, "text", None)
#             item_id = getattr(item, "id", None)

#             # Deduplicate conversation items by ID if available.
#             if item_id is not None:
#                 if item_id in self._processed_item_ids:
#                     return
#                 self._processed_item_ids.add(item_id)

#             if not text or role not in ("assistant", "user"):
#                 return

#             logger.debug(
#                 "conversation_item_added: session_id=%s role=%s text=%s",
#                 self.cfg.session_id,
#                 role,
#                 text,
#             )

#             # Assistant side: question wording / closing language.
#             if role == "assistant":
#                 # Only treat this as a question if we explicitly requested a question.
#                 if self._pending_generation_type == "QUESTION" and self.tm.can_ask_new_question():
#                     self._pending_generation_type = None

#                     # The question has now been spoken; we transition to LISTENING state.
#                     try:
#                         # Allow ASKING -> LISTENING or RETRYING -> LISTENING
#                         self.state_machine.transition(InterviewState.LISTENING)
#                     except ValueError:
#                         logger.warning(
#                             "Illegal state transition to LISTENING from %s",
#                             self.state_machine.value.name,
#                         )

#                     self.tm.mark_question_asked(question_text=text)
#                     await self._send_data(
#                         {
#                             "type": "question",
#                             "index": self.tm.current_turn_index_1based(),
#                             "text": text,
#                             "total": total_q,
#                         }
#                     )
#                     await self._send_data(
#                         {
#                             "type": "state",
#                             "state": self.state_machine.value.name,
#                             "current_index": self.tm.current_turn_index_1based(),
#                             "max_questions": total_q,
#                         }
#                     )
#                     await self._sync_runtime_state()
#                 else:
#                     # Assistant filler / closing messages – forward as info or ignore.
#                     await self._send_data(
#                         {
#                             "type": "info",
#                             "reason": "assistant_message",
#                             "message": text,
#                         }
#                     )
#                 return

#             # User side: answers
#             if role == "user" and self.tm.has_pending_question():
#                 async with self._turn_lock:
#                     # Double-check after acquiring the lock to avoid races.
#                     if not self.tm.has_pending_question():
#                         return

#                     answer_text = text
#                     turn_index_1based = self.tm.current_turn_index_1based()
#                     question_text = self.tm.state.last_question_text or ""

#                     await self._send_data(
#                         {
#                             "type": "answer",
#                             "index": turn_index_1based,
#                             "question": question_text,
#                             "answer": answer_text,
#                         }
#                     )

#                     # Persist to backend (idempotent).
#                     try:
#                         assert self.backend is not None
#                         resp = await self.backend.post_turn(
#                             session_id=self.cfg.session_id,
#                             turn_index_1based=turn_index_1based,
#                             question_text=question_text,
#                             answer_text=answer_text,
#                             metadata={
#                                 "round_type": self.cfg.round_type,
#                                 "difficulty": self.cfg.difficulty,
#                                 "role_slug": self.cfg.role_slug,
#                             },
#                         )
#                         if resp.status_code >= 400:
#                             logger.error(
#                                 "Backend turn post failed: status=%s body=%s",
#                                 resp.status_code,
#                                 resp.text,
#                             )
#                     except Exception:
#                         logger.exception("Error posting turn to backend")

#                     self.tm.mark_answer_received()
#                     try:
#                         self.state_machine.transition(InterviewState.PROCESSING)
#                     except ValueError:
#                         logger.warning(
#                             "Illegal state transition to PROCESSING from %s",
#                             self.state_machine.value.name,
#                         )

#                     await self._send_data(
#                         {
#                             "type": "state",
#                             "state": self.state_machine.value.name,
#                             "current_index": self.tm.current_turn_index_1based(),
#                             "max_questions": total_q,
#                         }
#                     )
#                     await self._sync_runtime_state()

#         @self.session.on("conversation_item_added")
#         def _on_item(ev: ConversationItemAddedEvent):
#             asyncio.create_task(_handle_item(ev))

#     # ---------- session start & first question ----------

#     async def _start_session_and_ask_first(self):
#         assert self.session is not None
#         assert self.cfg is not None
#         assert self.planner is not None
#         assert self.tm is not None

#         interviewer_agent = _build_interview_agent(self.cfg)

#         # Start voice pipeline
#         await self.session.start(
#             agent=interviewer_agent,
#             room=self.room,
#             room_options=room_io.RoomOptions(
#                 audio_input=room_io.AudioInputOptions(
#                     noise_cancellation=ai_coustics.audio_enhancement(
#                         model=ai_coustics.EnhancerModel.QUAIL_VF_L
#                     ),
#                 ),
#             ),
#         )

#         # Intro
#         self.state_machine.transition(InterviewState.INTRO)
#         await self._send_data(
#             {
#                 "type": "intro",
#                 "text": "Hi, I am your AI interviewer. I will ask you a few practice interview questions.",
#             }
#         )
#         await self._send_data(
#             {
#                 "type": "state",
#                 "state": self.state_machine.value.name,
#                 "current_index": self.tm.current_turn_index_1based(),
#                 "max_questions": self.planner.total_questions(),
#             }
#         )
#         await self._sync_runtime_state()

#         # Ask first question (or resume from current index if we adopted runtime state)
#         if self.tm.current_turn_index_0based() >= self.planner.total_questions():
#             # Nothing to ask – treat as completed.
#             self.state_machine.transition(InterviewState.COMPLETED)
#             await self._send_data(
#                 {
#                     "type": "state",
#                     "state": self.state_machine.value.name,
#                     "current_index": self.tm.current_turn_index_1based(),
#                     "max_questions": self.planner.total_questions(),
#                 }
#             )
#             await self._sync_runtime_state()
#             return

#         idx = self.tm.current_turn_index_0based()
#         base_q = self.planner.base_question_for_turn(idx)
#         instr = self.planner.build_llm_instruction(
#             turn_index=idx,
#             base_q=base_q,
#             last_answer=None,
#         )

#         # We are now in ASKING state while LLM generates/speaks the question.
#         try:
#             self.state_machine.transition(InterviewState.ASKING)
#         except ValueError:
#             logger.warning(
#                 "Illegal state transition to ASKING from %s",
#                 self.state_machine.value.name,
#             )
#         await self._send_data(
#             {
#                 "type": "state",
#                 "state": self.state_machine.value.name,
#                 "current_index": self.tm.current_turn_index_1based(),
#                 "max_questions": self.planner.total_questions(),
#             }
#         )
#         await self._sync_runtime_state()

#         # Mark that we expect the next assistant message to be a question.
#         self._pending_generation_type = "QUESTION"
#         async with self._generation_lock:
#             await self.session.generate_reply(instructions=instr)

#     # ---------- timeout loop ----------

#     async def _timeout_loop(self):
#         """
#         Handles "no-answer" timeout + retry/skip behavior,
#         enforces overall interview duration,
#         and pauses when no remote participants are present.
#         """
#         assert self.tm is not None
#         assert self.planner is not None
#         assert self.session is not None
#         assert self.cfg is not None

#         total_q = self.planner.total_questions()

#         try:
#             while not self.tm.state.done:
#                 await asyncio.sleep(TIMEOUT_LOOP_INTERVAL_SECONDS)

#                 # If candidate is disconnected, pause timeout behavior.
#                 if len(self.room.remote_participants) == 0:
#                     continue

#                 # Enforce overall interview duration if configured.
#                 if (
#                     self.cfg.duration_seconds is not None
#                     and self._start_time_monotonic is not None
#                 ):
#                     elapsed = time.monotonic() - self._start_time_monotonic
#                     if elapsed >= self.cfg.duration_seconds:
#                         logger.info(
#                             "Interview duration reached for session %s; ending.",
#                             self.cfg.session_id,
#                         )
#                         try:
#                             self.state_machine.transition(InterviewState.ENDING)
#                             self.state_machine.transition(InterviewState.COMPLETED)
#                         except ValueError:
#                             logger.warning(
#                                 "Illegal state transition during duration ending from %s",
#                                 self.state_machine.value.name,
#                             )
#                         self.tm.state.done = True
#                         await self._send_data(
#                             {
#                                 "type": "state",
#                                 "state": self.state_machine.value.name,
#                                 "current_index": self.tm.current_turn_index_1based(),
#                                 "max_questions": total_q,
#                             }
#                         )
#                         await self._send_data(
#                             {
#                                 "type": "info",
#                                 "reason": "duration_reached",
#                                 "message": "The interview duration has ended.",
#                             }
#                         )
#                         await self._sync_runtime_state()
#                         break

#                 if not self.tm.state.waiting_for_answer:
#                     continue

#                 # Retry once if no answer
#                 if self.tm.should_retry_for_no_answer():
#                     try:
#                         self.state_machine.transition(InterviewState.RETRYING)
#                     except ValueError:
#                         logger.warning(
#                             "Illegal state transition to RETRYING from %s",
#                             self.state_machine.value.name,
#                         )

#                     self.tm.mark_retry_used()
#                     await self._send_data(
#                         {
#                             "type": "info",
#                             "reason": "no_answer_retry",
#                             "message": "I didn't hear a response. Please answer the question when you're ready.",
#                             "index": self.tm.current_turn_index_1based(),
#                         }
#                     )
#                     base_q = self.planner.base_question_for_turn(
#                         self.tm.current_turn_index_0based()
#                     )
#                     retry_instr = (
#                         "The candidate did not respond clearly to your last question about:\n"
#                         f"\"{base_q.text}\"\n\n"
#                         "Please politely repeat the SAME question in different words. "
#                         "Do not add new information, hints, or commentary. "
#                         "Respond with the question only."
#                     )
#                     self._pending_generation_type = "QUESTION"
#                     async with self._generation_lock:
#                         await self.session.generate_reply(instructions=retry_instr)
#                     await self._sync_runtime_state()
#                     continue

#                 # If still nothing after second window, skip with empty answer.
#                 if self.tm.should_timeout_and_skip():
#                     async with self._turn_lock:
#                         # Double-check after acquiring lock.
#                         if not self.tm.has_pending_question():
#                             continue

#                         idx_1based = self.tm.current_turn_index_1based()
#                         try:
#                             self.state_machine.transition(InterviewState.SKIPPING)
#                         except ValueError:
#                             logger.warning(
#                                 "Illegal state transition to SKIPPING from %s",
#                                 self.state_machine.value.name,
#                             )

#                         await self._send_data(
#                             {
#                                 "type": "info",
#                                 "reason": "no_answer_skip",
#                                 "message": "We will move on to the next question.",
#                                 "index": idx_1based,
#                             }
#                         )
#                         assert self.backend is not None
#                         await self.backend.post_turn(
#                             session_id=self.cfg.session_id,
#                             turn_index_1based=idx_1based,
#                             question_text=self.tm.state.last_question_text or "",
#                             answer_text="",
#                             metadata={
#                                 "round_type": self.cfg.round_type,
#                                 "difficulty": self.cfg.difficulty,
#                                 "role_slug": self.cfg.role_slug,
#                             },
#                         )
#                         self.tm.mark_answer_received()

#                         if self.tm.can_ask_new_question():
#                             base_q = self.planner.base_question_for_turn(
#                                 self.tm.current_turn_index_0based()
#                             )
#                             instr = self.planner.build_llm_instruction(
#                                 turn_index=self.tm.current_turn_index_0based(),
#                                 base_q=base_q,
#                                 last_answer=None,
#                             )
#                             try:
#                                 self.state_machine.transition(InterviewState.ASKING)
#                             except ValueError:
#                                 logger.warning(
#                                     "Illegal state transition to ASKING from %s",
#                                     self.state_machine.value.name,
#                                 )
#                             await self._send_data(
#                                 {
#                                     "type": "state",
#                                     "state": self.state_machine.value.name,
#                                     "current_index": self.tm.current_turn_index_1based(),
#                                     "max_questions": total_q,
#                                 }
#                             )
#                             self._pending_generation_type = "QUESTION"
#                             async with self._generation_lock:
#                                 await self.session.generate_reply(instructions=instr)
#                         else:
#                             # All questions exhausted
#                             try:
#                                 self.state_machine.transition(InterviewState.ENDING)
#                                 self.state_machine.transition(InterviewState.COMPLETED)
#                             except ValueError:
#                                 logger.warning(
#                                     "Illegal state transition during completion from %s",
#                                     self.state_machine.value.name,
#                                 )
#                             self.tm.state.done = True
#                             await self._send_data(
#                                 {
#                                     "type": "state",
#                                     "state": self.state_machine.value.name,
#                                     "current_index": self.tm.current_turn_index_1based(),
#                                     "max_questions": total_q,
#                                 }
#                             )

#                         await self._sync_runtime_state()
#         except asyncio.CancelledError:
#             # Normal shutdown path.
#             raise
#         except Exception:
#             logger.exception("Timeout loop failed")
#             try:
#                 self.state_machine.transition(InterviewState.FAILED)
#             except Exception:
#                 pass
#             await self._sync_runtime_state()


# # Helper to build the interviewer Agent (Gemini prompt)
# def _build_interview_agent(cfg: InterviewConfig):
#     from livekit.agents import Agent
#     import textwrap

#     instructions = textwrap.dedent(
#         f"""\
#         You are an AI interviewer for a practice interview platform.

#         ROLE AND CONTEXT
#         - Target role: {cfg.role_slug}
#         - Round type: {cfg.round_type}
#         - Difficulty level: {cfg.difficulty}
#         - This is a PRACTICE interview, not a real hiring decision.

#         BEHAVIOR RULES
#         - Ask one clear interview question at a time.
#         - Do NOT give hints, coaching, or feedback.
#         - Do NOT say things like "good answer", "great", or "excellent".
#         - Do NOT evaluate whether answers are correct or incorrect.
#         - Stay neutral and professional in tone.
#         - Avoid small talk unrelated to the interview.

#         FLOW RULES
#         - When you receive instructions describing what question to ask, follow them exactly.
#         - Do NOT decide on your own how many questions to ask or when to end the interview.
#         - Wait for the candidate's answer before asking the next question.

#         OUTPUT RULES
#         - Respond in plain text only (no JSON, bullet points, or formatting).
#         - Never mention that you are an AI model or that you are using tools.
#         """
#     )

#     class InterviewAgent(Agent):
#         def __init__(self):
#             super().__init__(instructions=instructions)

#     return InterviewAgent()




































# intraview_agent/runtime.py

import asyncio
import json
import logging
import re          # [NEW] for word count in _should_ask_followup
import time
from typing import Optional, Set

from livekit.agents import (
    AgentSession,
    JobContext,
    inference,
    room_io,
    ConversationItemAddedEvent,
)
from livekit.plugins import ai_coustics, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from backend_client import BackendClient
from runtime_guard import RuntimeGuard, RuntimeOwnershipLost
from config import get_interview_defaults
from constants import (
    TIMEOUT_LOOP_INTERVAL_SECONDS,
    MAX_FOLLOWUPS_PER_QUESTION,
    ASSISTANT_GENERATION_TIMEOUT_SECONDS,
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
        self._pending_generation_type: Optional[str] = None  # "QUESTION" | "FOLLOWUP" | None

        # Hard runtime guard that prevents recursive follow-up generation.
        # Once True for a base question, runtime will never ask another follow-up.
        self._followup_phase_closed: bool = False

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
        round_type = str(meta.get("round_type") or "BEHAVIORAL").upper()
        difficulty = str(meta.get("difficulty") or "INTERMEDIATE").upper()

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
        )

    async def _send_data(self, payload: dict):
        """
        Send structured JSON messages to frontend.
        """
        try:
            data = json.dumps(payload).encode("utf-8")
            await self.room.local_participant.publish_data(data, reliable=True)
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
            await self.backend.update_runtime_state(self.cfg.session_id, payload)
        except Exception:
            # Log but do not crash runtime on sync failure.
            logger.exception("Failed to sync runtime state to backend")




    
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
            self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
            self._background_tasks.add(self.heartbeat_task)
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

    # ---------- follow-up decision (NEW) ----------

    def _should_ask_followup(self, answer_text: str) -> bool:
        assert self.tm is not None

        # Runtime-level hard stop.
        if self._followup_phase_closed:
            return False

        # Hard follow-up budget enforcement.
        if self.tm.followup_budget_exhausted(
            MAX_FOLLOWUPS_PER_QUESTION
        ):
            self._followup_phase_closed = True
            return False

        # Evaluate the COMPLETE accumulated answer instead of
        # only the latest response fragment.
        #
        # This prevents recursive follow-ups when the candidate
        # gradually answers across multiple turns.

        if self.tm.state.followup_exchanges:
            combined_parts = [
                self.tm.state.base_answer_text,
                *[
                    ex["answer"]
                    for ex in self.tm.state.followup_exchanges
                    if ex.get("answer")
                ],
            ]

            text = " ".join(
                part.strip()
                for part in combined_parts
                if part and part.strip()
            )

        else:
            text = (answer_text or "").strip()

        if not text:
            return False

        word_count = len(
            re.findall(r"\b[\w'-]+\b", text)
        )

        lower = text.lower()
        refusal_markers = (
            "i can't reveal",
            "i cannot reveal",
            "prefer not to say",
            "confidential",
            "cannot share",
            "can't share",
            "stop asking follow",
            "stop asking",
            "personal",           # ← comma was missing before, now fixed
            "no more follow",
            "move on",
            "next question",
            "skip this",
            "go to the next",
        )
        if any(m in lower for m in refusal_markers):
            return False



        # Extremely short answers usually need clarification.
        if word_count < 20:
            return True

        vague_markers = (
            "some stuff",
            "kind of",
            "sort of",
            "like that",
            "many things",
        )
        if (
            word_count < 35
            and any(m in lower for m in vague_markers)
        ):
            return True

        return False

    # ---------- LiveKit conversation handling ----------

    def _attach_conversation_handler(self, total_q: int):
        assert self.session is not None
        assert self.cfg is not None
        assert self.planner is not None
        assert self.tm is not None

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

            # ----------------------------------------------------------------
            # Assistant side: classify spoken message
            # ----------------------------------------------------------------
            if role == "assistant":

                if self._pending_generation_type == "QUESTION" and self.tm.can_ask_new_question():
                    # A base question has been spoken.
                    self._pending_generation_type = None

                    try:
                        self.state_machine.transition(InterviewState.LISTENING)
                    except ValueError:
                        logger.warning(
                            "Illegal state transition to LISTENING from %s",
                            self.state_machine.value.name,
                        )

                    self.tm.mark_question_asked(question_text=text)
                    self._followup_phase_closed = False
                    await self._send_data(
                        {
                            "type": "question",
                            "index": self.tm.current_turn_index_1based(),
                            "text": text,
                            "total": total_q,
                            "is_followup": False,          # [NEW]
                            "followup_index": 0,           # [NEW]
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

                # [NEW] Follow-up question has been spoken.
                elif self._pending_generation_type == "FOLLOWUP":
                    self._pending_generation_type = None

                    try:
                        self.state_machine.transition(InterviewState.LISTENING)
                    except ValueError:
                        logger.warning(
                            "Illegal state transition to LISTENING from %s",
                            self.state_machine.value.name,
                        )

                    self.tm.mark_followup_asked(question_text=text)
                    await self._send_data(
                        {
                            "type": "question",
                            "index": self.tm.current_turn_index_1based(),
                            "text": text,
                            "total": total_q,
                            "is_followup": True,                          # [NEW]
                            "followup_index": self.tm.state.followup_count,  # [NEW]
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

                else:
                    # # Assistant filler / closing messages – forward as info or ignore.
                    # await self._send_data(
                    #     {
                    #         "type": "info",
                    #         "reason": "assistant_message",
                    #         "message": text,
                    #     }
                    # )

                    #replaced
                    # Ignore assistant messages not explicitly initiated by runtime.
                    # This prevents autonomous conversational continuation from
                    # interfering with deterministic interview flow.
                    logger.warning(
                        "Ignoring autonomous assistant message: %s",
                        text,
                    )
                    return
                return

            # ----------------------------------------------------------------
            # User side: handle answers
            # ----------------------------------------------------------------
            if (
                role == "user"
                and self.tm.has_pending_question()
                and not self._generation_in_progress
            ):
                should_followup = False
                async with self._turn_lock:
                    # Double-check after acquiring the lock to avoid races.
                    if not self.tm.has_pending_question():
                        return

                    answer_text = text
                    turn_index_1based = self.tm.current_turn_index_1based()
                    question_text = self.tm.state.last_question_text or ""

                    await self._send_data(
                        {
                            "type": "answer",
                            "index": turn_index_1based,
                            "question": question_text,
                            "answer": answer_text,
                            "is_followup": self.tm.state.is_followup_active,  # [NEW]
                        }
                    )

                    # [NEW] Branch: are we answering a follow-up or a base question?
                    if self.tm.state.is_followup_active:
                        # Record the follow-up answer (does NOT increment turn_index).
                        self.tm.mark_followup_answer_received(answer_text=answer_text)

                        try:
                            self.state_machine.transition(InterviewState.PROCESSING)
                        except ValueError:
                            logger.warning(
                                "Illegal state transition to PROCESSING from %s",
                                self.state_machine.value.name,
                            )

                        await self._send_data(
                            {
                                "type": "state",
                                "state": self.state_machine.value.name,
                                "current_index": turn_index_1based,
                                "max_questions": total_q,
                            }
                        )
                        await self._sync_runtime_state()

                        # Decide: another follow-up or finalize?
                        should_followup = self._should_ask_followup(answer_text)

                    else:
                        # Base question answered.
                        # Record answer locally first (does NOT increment turn_index yet).
                        self.tm.record_base_answer(answer_text=answer_text)  # [NEW]

                        try:
                            self.state_machine.transition(InterviewState.PROCESSING)
                        except ValueError:
                            logger.warning(
                                "Illegal state transition to PROCESSING from %s",
                                self.state_machine.value.name,
                            )

                        await self._send_data(
                            {
                                "type": "state",
                                "state": self.state_machine.value.name,
                                "current_index": turn_index_1based,
                                "max_questions": total_q,
                            }
                        )
                        await self._sync_runtime_state()

                        # [NEW] Decide: ask a follow-up or finalize immediately?
                        # if self._should_ask_followup(answer_text):
                        #     await self._ask_followup(total_q)
                        # else:
                        #     await self._finalize_base_turn(total_q)
                        should_followup = self._should_ask_followup(answer_text)

                try:
                    if self.tm.followup_budget_exhausted(
                        MAX_FOLLOWUPS_PER_QUESTION
                    ):
                        should_followup = False

                    if should_followup:
                        await self._ask_followup(total_q)
                    else:
                        await self._finalize_base_turn(total_q)

                except Exception:
                    logger.exception(
                        "Post-answer generation failed: session_id=%s",
                        self.cfg.session_id,
                    )       

        @self.session.on("conversation_item_added")
        def _on_item(ev: ConversationItemAddedEvent):

            task = asyncio.create_task(_handle_item(ev))

            self._background_tasks.add(task)

            def _cleanup_task(t: asyncio.Task):
                self._background_tasks.discard(t)

            task.add_done_callback(_cleanup_task)

    # ---------- follow-up helper (NEW) ----------

    async def _ask_followup(self, total_q: int):
        """
        [NEW] Generate and speak a follow-up question for the current base question.
        Called from within _turn_lock, so must not re-acquire it.
        """
        assert self.session is not None
        assert self.planner is not None
        assert self.tm is not None
        assert self.cfg is not None

        # Runtime already finalized follow-up phase.
        # Never allow re-entry.
        if self.tm.state.followup_phase_completed:
            logger.warning(
                "Blocked follow-up generation because phase is closed."
            )
            return

        # Hard follow-up budget enforcement.
        if not self.tm.can_ask_followup(
            MAX_FOLLOWUPS_PER_QUESTION
        ):
            logger.warning(
                "Blocked follow-up generation because budget exhausted."
            )

            self.tm.mark_followup_phase_completed()
            self._followup_phase_closed = True

            return

        idx = self.tm.current_turn_index_0based()
        base_q = self.planner.base_question_for_turn(idx)

        # Determine the most recent answer to pass to the follow-up prompt.
        # If we already had a follow-up exchange, use the last follow-up answer.
        # Otherwise use the base answer.
        if self.tm.state.followup_exchanges:
            last_answer = self.tm.state.followup_exchanges[-1]["answer"]
        else:
            last_answer = self.tm.state.base_answer_text

        instr = self.planner.build_followup_instruction(
            turn_index=idx,
            base_q=base_q,
            base_question_text=self.tm.state.base_question_text or "",
            last_answer=last_answer,
            followup_num=self.tm.state.followup_count + 1,
            max_followups=MAX_FOLLOWUPS_PER_QUESTION,
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

        await self._safe_generate_reply(
            instructions=instr,
            generation_type="FOLLOWUP",
        )

    # ---------- base turn finalization (NEW) ----------

    async def _finalize_base_turn(self, total_q: int):
        """
        [NEW] Post the completed base turn (with follow-up metadata) to the backend,
        then advance turn_index and ask the next base question.

        Called after the follow-up phase is done (or skipped entirely).
        Called from within _turn_lock, so must not re-acquire it.
        """
        assert self.backend is not None
        assert self.cfg is not None
        assert self.tm is not None
        assert self.planner is not None

        turn_index_1based = self.tm.current_turn_index_1based()
        question_text = self.tm.state.base_question_text or ""
        answer_text = self.tm.state.base_answer_text

        # Merge base metadata with follow-up extras.
        metadata = {
            "round_type": self.cfg.round_type,
            "difficulty": self.cfg.difficulty,
            "role_slug": self.cfg.role_slug,
            **self.tm.get_turn_metadata_extras(),   # [NEW] followup_count, followup_exchanges, etc.
        }

        try:
            resp = await self.backend.post_turn(
                session_id=self.cfg.session_id,
                turn_index_1based=turn_index_1based,
                question_text=question_text,
                answer_text=answer_text,
                metadata=metadata,
            )
            if resp.status_code >= 400:
                logger.error(
                    "Backend turn post failed: status=%s body=%s",
                    resp.status_code,
                    resp.text,
                )
        except Exception:
            logger.exception("Error posting turn to backend")

        # Hard close follow-up lifecycle before advancing.
        self.tm.mark_followup_phase_completed()
        self._followup_phase_closed = True    

        # Now increment turn_index (base question fully finalized).
        self.tm.mark_answer_received()

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

            # self._pending_generation_type = (
            #     "FOLLOWUP"
            #     if self.tm.state.is_followup_active
            #     else "QUESTION"
            # )

            await self._safe_generate_reply(
                instructions=instr,
                generation_type="QUESTION",
            )

        else:
            # All base questions done.
            try:
                self.state_machine.transition(InterviewState.ENDING)
                self.state_machine.transition(InterviewState.COMPLETED)
            except ValueError:
                logger.warning(
                    "Illegal state transition during completion from %s",
                    self.state_machine.value.name,
                )
            self.tm.state.done = True
            await self._send_data(
                {
                    "type": "state",
                    "state": self.state_machine.value.name,
                    "current_index": self.tm.current_turn_index_1based(),
                    "max_questions": total_q,
                }
            )
            await self._sync_runtime_state()
            await self.backend.notify_interview_completed(self.cfg.session_id)
            self._interview_done.set() 

    # ---------- session start & first question ----------

    async def _start_session_and_ask_first(self):
        assert self.session is not None
        assert self.cfg is not None
        assert self.planner is not None
        assert self.tm is not None

        interviewer_agent = _build_interview_agent(self.cfg)

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
        )

        # Intro
        self.state_machine.transition(InterviewState.INTRO)
        await self._send_data(
            {
                "type": "intro",
                "text": "Hi, I am your AI interviewer. I will ask you a few practice interview questions.",
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

        # Ask first question (or resume from current index if we adopted runtime state)
        if self.tm.current_turn_index_0based() >= self.planner.total_questions():
            # Nothing to ask – treat as completed.
            self.state_machine.transition(InterviewState.COMPLETED)
            await self._send_data(
                {
                    "type": "state",
                    "state": self.state_machine.value.name,
                    "current_index": self.tm.current_turn_index_1based(),
                    "max_questions": self.planner.total_questions(),
                }
            )
            await self._sync_runtime_state()
            return

        idx = self.tm.current_turn_index_0based()
        base_q = self.planner.base_question_for_turn(idx)
        instr = self.planner.build_llm_instruction(
            turn_index=idx,
            base_q=base_q,
            last_answer=None,
        )

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
                        try:
                            self.state_machine.transition(InterviewState.ENDING)
                            self.state_machine.transition(InterviewState.COMPLETED)
                        except ValueError:
                            logger.warning(
                                "Illegal state transition during duration ending from %s",
                                self.state_machine.value.name,
                            )
                        self.tm.state.done = True
                        await self._send_data(
                            {
                                "type": "state",
                                "state": self.state_machine.value.name,
                                "current_index": self.tm.current_turn_index_1based(),
                                "max_questions": total_q,
                            }
                        )
                        await self._send_data(
                            {
                                "type": "info",
                                "reason": "duration_reached",
                                "message": "The interview duration has ended.",
                            }
                        )
                        await self._sync_runtime_state()
                        await self.backend.notify_interview_completed(self.cfg.session_id)
                        self._interview_done.set()  
                        break

                if not self.tm.state.waiting_for_answer:
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
                            "message": "I didn't hear a response. Please answer the question when you're ready.",
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
                        generation_type=(
                            "FOLLOWUP"
                            if self.tm.state.is_followup_active
                            else "QUESTION"
                        ),
                    )
                    await self._sync_runtime_state()
                    continue

                if self.tm.should_timeout_and_skip():

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

                        # If timed out on a follow-up, finalize using existing base answer.
                        if self.tm.state.is_followup_active:
                            self.tm.mark_followup_answer_received(answer_text="")
                            self.tm.mark_followup_phase_completed()
                            self._followup_phase_closed = True

                        skip_confirmed = True

                    # IMPORTANT:
                    # _finalize_base_turn() internally calls generate_reply().
                    # Never run generation while holding _turn_lock.
                    if skip_confirmed:
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
            # Release ownership
            #
            if self.backend and self.cfg:

                try:
                    await self.backend.release_runtime_ownership(
                        self.cfg.session_id
                    )
                except Exception:
                    logger.exception(
                        "Failed releasing runtime ownership"
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

            logger.info(
                "Runtime shutdown completed: session_id=%s",
                self.cfg.session_id if self.cfg else None,
            )            


def _build_interview_agent(cfg: InterviewConfig):
    from livekit.agents import Agent

    import textwrap

    instructions = textwrap.dedent(
        f"""\
        You are a professional AI interviewer conducting a practice interview.

        Role: {cfg.role_slug}
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

    return InterviewAgent()