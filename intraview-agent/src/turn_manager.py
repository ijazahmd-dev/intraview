

# intraview_agent/turn_manager.py


import time
from dataclasses import dataclass


from constants import SILENCE_STAGE_SECONDS


@dataclass
class TurnState:
    turn_index: int = 0             # 0-based; only increments on base question completion
    waiting_for_answer: bool = False
    last_question_text: str | None = None
    last_question_time: float = 0.0
    no_answer_retry_used: bool = False
    # Number of completed silence prompts for this answer window.  This is
    # deliberately separate from the historical retry flag so stages can be
    # progressed deterministically without consuming a question.
    silence_stage: int = 0
    clarification_count: int = 0
    done: bool = False
    # True once current base turn is entering finalization.
    #
    # Prevents duplicate finalize/post operations caused by:
    # - timeout races
    # - duplicate transcript callbacks
    # - overlapping async tasks
    is_finalizing_turn: bool = False


    # --- Follow-up sub-state (scoped to current base question) ---
    # Stores the original base question text for backend metadata.
    base_question_text: str | None = None

    # Stores the first (base) answer for backend metadata.
    base_answer_text: str = ""

    # Current stabilized transcript buffer for the active prompt.
    #
    # This continuously evolves while the candidate speaks.
    # Runtime commits this buffer only after transcript stabilization.
    active_transcript_buffer: str = ""

    # Last finalized/committed transcript for this turn.
    #
    # Prevents duplicate transcript commits caused by:
    # - repeated STT events
    # - delayed provider emissions
    # - reconnect replay
    last_committed_transcript: str = ""

    # Timestamp of the latest transcript update.
    #
    # Used by runtime stabilization timers to determine when
    # transcript input has gone silent long enough to commit.
    last_transcript_at: float = 0.0

    # Number of transcript updates received for current prompt.
    #
    # Useful for:
    # - debugging STT fragmentation
    # - transcript stabilization heuristics
    # - analytics
    transcript_update_count: int = 0

    # Kept only for the lifetime of this runtime so a submission failure is
    # observable during recovery.  It is never treated as a persisted answer.
    last_failed_submission_answer: str = ""



class TurnManager:
    """
    Local in-memory turn tracking for the agent process.

    Backend still enforces true idempotency (via UNIQUE(session, turn_index)),
    but this manager helps avoid obvious duplicates and drives timeout behavior.

    Follow-up behavior:
    - Follow-up questions do NOT increment turn_index.
    - Follow-up state is scoped to the current base question.
    - When the base question is finalized, follow-up state is reset.
    """

    def __init__(self, total_questions: int):
        self.total_questions = total_questions
        self.state = TurnState()

    # ------------------------------------------------------------------ #
    #  Existing methods — unchanged                                        #
    # ------------------------------------------------------------------ #

    def can_ask_new_question(self) -> bool:
        return not self.state.done and self.state.turn_index < self.total_questions

    def mark_question_asked(self, question_text: str):
        """
        Called when a base (counted) question has been spoken.
        Resets the current turn state for the new base question.
        """
        self.state.base_question_text = question_text
        self.state.base_answer_text = ""
        self.state.last_question_text = question_text
        self.state.waiting_for_answer = True
        self.state.last_question_time = time.monotonic()
        self.state.no_answer_retry_used = False
        self.state.silence_stage = 0
        self.state.clarification_count = 0
        self.state.last_failed_submission_answer = ""

        self.complete_turn_finalization()
        self.reset_transcript_state()

    def mark_answer_received(self):
        """
        Finalizes the current base question and advances turn_index.
        """
        self.state.turn_index += 1
        self.state.waiting_for_answer = False
        self.state.last_question_text = None
        self.state.last_question_time = 0.0
        self.state.no_answer_retry_used = False
        self.state.silence_stage = 0
        self.state.clarification_count = 0
        self.complete_turn_finalization()

        if self.state.turn_index >= self.total_questions:
            self.state.done = True


    def reset_current_turn_state(self):
        """
        Emergency reset for partially corrupted turn lifecycle.

        Used when:
        - generation crashes
        - runtime aborts mid-turn
        - ownership changes
        - timeout recovery fails

        Does NOT advance turn_index.
        """
        self.state.waiting_for_answer = False
        self.state.last_question_text = None
        self.state.last_question_time = 0.0
        self.state.no_answer_retry_used = False
        self.state.silence_stage = 0
        self.complete_turn_finalization()
        self.reset_transcript_state() 

    def current_turn_index_0based(self) -> int:
        return self.state.turn_index

    def current_turn_index_1based(self) -> int:
        return self.state.turn_index + 1

    def has_pending_question(self) -> bool:
        return self.state.waiting_for_answer and self.state.last_question_text is not None
    
    def try_begin_turn_finalization(self) -> bool:
        """
        Atomically marks current turn as entering finalization.

        Returns:
        - True  -> caller owns finalization
        - False -> another coroutine already finalized, or no live turn exists

        Prevents:
        - duplicate backend turn posts
        - double question advancement
        - timeout/transcript races
        """

        if self.state.done:
            return False

        if self.state.is_finalizing_turn:
            return False

        if not self.state.waiting_for_answer:
            return False

        self.state.is_finalizing_turn = True
        return True
    
    def abort_turn_finalization(self):
        """
        Emergency recovery for stuck finalization.

        Used when:
        - backend turn post fails
        - runtime crashes mid-finalize
        - follow-up generation fails
        - ownership changes

        Prevents permanent deadlock where
        is_finalizing_turn=True forever.
        """

        self.state.is_finalizing_turn = False


    def complete_turn_finalization(self):
        """
        Marks successful completion of turn finalization.

        This is the normal success path counterpart to
        abort_turn_finalization().

        Runtime should call this only after:
        - backend turn post succeeds, or
        - a deliberate skip path has fully resolved
        """
        self.state.is_finalizing_turn = False    
    


    def next_silence_stage(self) -> int | None:
        """Return the next due silence stage without mutating turn state."""
        if not self.state.waiting_for_answer or self.state.last_question_time <= 0:
            return None

        if self.state.silence_stage >= len(SILENCE_STAGE_SECONDS):
            return None

        elapsed = time.monotonic() - self.state.last_question_time
        next_stage = self.state.silence_stage + 1
        threshold = SILENCE_STAGE_SECONDS[next_stage - 1]
        return next_stage if elapsed >= threshold else None

    def mark_silence_stage_handled(self, stage: int) -> None:
        """Record one handled silence stage; each stage can run only once."""
        if stage != self.state.silence_stage + 1:
            return
        self.state.silence_stage = stage

    def mark_meaningful_speech(self) -> None:
        """Restart silence pacing when the candidate begins a real response."""
        if not self.state.waiting_for_answer:
            return
        self.reset_silence_timer()

    def reset_silence_timer(self) -> None:
        """Restart silence pacing while preserving the active question."""
        if not self.state.waiting_for_answer:
            return
        self.state.last_question_time = time.monotonic()
        self.state.silence_stage = 0
        self.state.no_answer_retry_used = False

    def reopen_after_submission_failure(self) -> None:
        """
        Safely reopen the same question when a finalized answer was not saved.

        This intentionally does not advance turn_index.  The caller must tell
        the candidate that the earlier response was not saved before accepting
        a replacement answer.
        """
        self.state.last_failed_submission_answer = self.state.base_answer_text
        self.state.base_answer_text = ""
        self.state.waiting_for_answer = True
        self.state.last_question_time = time.monotonic()
        self.state.no_answer_retry_used = False
        self.state.silence_stage = 0
        self.complete_turn_finalization()
        self.reset_transcript_state()

    # ------------------------------------------------------------------ #
    #  New follow-up methods                                               #
    # ------------------------------------------------------------------ #


    
    def record_base_answer(self, answer_text: str):
        """
        Records base question answer.

        Production-safe:
        - allows transcript improvement
        - prevents duplicate corruption
        - supports salvage/recovery
        """
        cleaned = (answer_text or "").strip()

        if not cleaned:
            return

        existing = (self.state.base_answer_text or "").strip()

        # This method is called only after a single transcript has been
        # stabilized.  Keeping the longer string here used to preserve stale
        # false starts and made a legitimate shorter correction impossible.
        self.state.base_answer_text = cleaned

        self.state.waiting_for_answer = False
        self.state.last_question_time = 0.0
        self.state.no_answer_retry_used = False


    def update_transcript_buffer(self, text: str):
        """
        Updates transcript buffer.

        LiveKit transcripts are cumulative,
        so we keep the latest version
        instead of appending.
        """

        cleaned = (text or "").strip()

        if not cleaned:
            return

        # A smaller provider update may be a fresh utterance or correction,
        # not merely a degraded cumulative transcript.  Runtime-level merge
        # logic decides whether it belongs to the same utterance.
        self.state.active_transcript_buffer = cleaned

        self.state.last_transcript_at = (
            time.monotonic()
        )

        self.state.transcript_update_count += 1


    def current_transcript_buffer(self) -> str:
        """
        Returns current in-progress transcript buffer.
        """

        return self.state.active_transcript_buffer


    def has_transcript_buffer(self) -> bool:
        """
        True if transcript buffer currently contains text.
        """

        return bool(
            self.state.active_transcript_buffer.strip()
        )


    def mark_transcript_committed(self, text: str):
        """
        Marks transcript as finalized/committed.

        Prevents duplicate turn processing from repeated
        transcript emissions.
        """

        cleaned = (text or "").strip()

        self.state.last_committed_transcript = cleaned
        self.state.active_transcript_buffer = ""


    def transcript_already_committed(self, text: str) -> bool:
        """
        Returns True if transcript was already finalized.

        Helps runtime ignore duplicate transcript commits.
        """

        cleaned = (text or "").strip()

        if not cleaned:
            return False

        return (
            cleaned ==
            self.state.last_committed_transcript
        )


    def reset_transcript_state(self):
        """
        Clears transcript assembly state for next prompt.
        """

        self.state.active_transcript_buffer = ""
        self.state.last_committed_transcript = ""
        self.state.last_transcript_at = 0.0
        self.state.transcript_update_count = 0    



    def current_turn_snapshot(self) -> dict:
        """
        Debug/runtime snapshot of current turn state.

        Useful for:
        - structured logging
        - crash diagnostics
        - runtime recovery
        - backend observability
        """
        return {
            "turn_index": self.state.turn_index,
            "waiting_for_answer": self.state.waiting_for_answer,
            "is_finalizing_turn": self.state.is_finalizing_turn,
            "done": self.state.done,
        }

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

