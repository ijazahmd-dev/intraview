# intraview_agent/constants.py

"""
Centralized constants for the agent runtime.

This file prevents scattering magic numbers across the codebase.
"""

# How long to wait for a candidate answer before a gentle retry.
NO_ANSWER_TIMEOUT_SECONDS: float = 40.0

# Maximum multiplier for total no-answer wait after retry.
# 40s (initial) + 40s (retry) = 80s total window.
NO_ANSWER_MAX_MULTIPLIER: int = 2

# How often the timeout loop wakes up to inspect state.
TIMEOUT_LOOP_INTERVAL_SECONDS: float = 2.0

# How long a room can stay empty before we *consider* abandonment (future use).
EMPTY_ROOM_GRACE_SECONDS: float = 60.0

# Maximum number of processed conversation item IDs to keep in memory
# for STT deduplication. This avoids unbounded growth over long sessions.
PROCESSED_ITEM_ID_LIMIT: int = 2000

# Minimum answer quality heuristics.
# These are intentionally conservative; you can tune them later.
MIN_ANSWER_CHARS: int = 15   # ignore extremely short transcripts
MIN_ANSWER_WORDS: int = 3    # ignore 1-word / 2-word fillers

# Maximum number of follow-up questions allowed per base question.
# Follow-ups do not increment turn_index or count toward max_questions.
MAX_FOLLOWUPS_PER_QUESTION: int = 2

# Minimum answer size before runtime considers the response
# potentially "complete enough" to avoid unnecessary follow-ups.
#
# These are intentionally conservative and should be tuned
# using real interview session analytics later.
FOLLOWUP_MIN_ANSWER_WORDS: int = 18
FOLLOWUP_MIN_ANSWER_CHARS: int = 80

# Hard safety guard against infinite clarification loops.
#
# Even if runtime logic fails, the interview must NEVER
# exceed this total number of clarification attempts.
ABSOLUTE_MAX_FOLLOWUP_GENERATIONS: int = 2

# Maximum number of unexpected autonomous assistant messages
# tolerated before runtime forcefully suppresses further processing.
#
# Helps protect against uncontrolled conversational continuation.
MAX_AUTONOMOUS_ASSISTANT_MESSAGES: int = 3

# Maximum retry attempts for a single pending prompt
# before runtime forcefully skips the question.
MAX_NO_ANSWER_RETRIES: int = 1

# Maximum time allowed for assistant response generation
# before runtime considers generation stalled.
ASSISTANT_GENERATION_TIMEOUT_SECONDS: float = 20.0