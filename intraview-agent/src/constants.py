# intraview_agent/constants.py

"""


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

# Maximum total assistant follow-up events allowed
# for a single base question INCLUDING unexpected
# autonomous assistant generations.
#
# This is a final hard safety ceiling.
MAX_TOTAL_ASSISTANT_FOLLOWUP_EVENTS: int = 3

# Maximum number of duplicate user transcript events
# tolerated for the same pending prompt.
#
# Helps protect against repeated STT emissions.
MAX_DUPLICATE_TRANSCRIPT_EVENTS: int = 2

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

RUNTIME_LEASE_SECONDS: int = 20

# How frequently runtime heartbeats are sent.
#
# Must always be LOWER than lease duration.
RUNTIME_HEARTBEAT_INTERVAL_SECONDS: float = 5.0

# Maximum number of consecutive heartbeat failures
# before runtime shuts itself down defensively.
MAX_HEARTBEAT_FAILURES: int = 3

# Maximum consecutive assistant generation failures allowed
# before runtime forcefully shuts down the interview session.
#
# Prevents zombie/stuck interview agents from lingering forever.
MAX_CONSECUTIVE_GENERATION_FAILURES: int = 3

# Maximum number of concurrent in-flight generation
# requests allowed at runtime.
#
# Prevents overlapping generate_reply() storms.
MAX_CONCURRENT_GENERATIONS: int = 1

# Safety timeout for turn finalization lock ownership.
#
# Prevents permanently stuck finalization state if
# runtime crashes mid-finalize.
TURN_FINALIZATION_TIMEOUT_SECONDS: float = 15.0