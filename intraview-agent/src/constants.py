# intraview_agent/constants.py

"""


This file prevents scattering magic numbers across the codebase.
"""

# How long to wait for a candidate answer before a gentle retry.
NO_ANSWER_TIMEOUT_SECONDS: float = 75.0

# Maximum multiplier for total no-answer wait after retry.
# 40s (initial) + 40s (retry) = 80s total window.
NO_ANSWER_MAX_MULTIPLIER: int = 2

# How often the timeout loop wakes up to inspect state.
TIMEOUT_LOOP_INTERVAL_SECONDS: float = 0.8

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

# Word count above which an answer is considered sufficiently detailed
# and should NOT trigger a follow-up question.
FOLLOWUP_SUFFICIENT_WORD_COUNT: int = 25

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

# ---------------------------------------------------------
# Streaming transcript assembly / stabilization
# ---------------------------------------------------------

# How long transcript input must remain unchanged
# before runtime considers the transcript "stable"
# and safe to finalize.
#
# Example:
# - user stops speaking
# - STT provider emits final chunks
# - no new transcript arrives for this duration
# => runtime commits transcript
TRANSCRIPT_STABILIZATION_SECONDS: float = 3.0

# How long after candidate stops speaking before runtime
# considers them truly finished.
#
# Decoupled from TRANSCRIPT_STABILIZATION_SECONDS because:
# - transcript similarity timing serves dedup
# - speech grace timing serves answer completeness
# - candidates naturally pause 2-4s mid-thought
SPEECH_END_GRACE_SECONDS: float = 4.0

# Minimum transcript size before runtime considers
# the answer meaningful enough to commit.
#
# Prevents:
# - tiny accidental utterances
# - microphone clicks
# - partial STT fragments
MIN_TRANSCRIPT_COMMIT_WORDS: int = 4

# Maximum duration transcript buffer may stay open
# before runtime forcefully commits/reset state.
#
# Prevents:
# - endless streaming sessions
# - stuck STT pipelines
# - memory growth
TRANSCRIPT_BUFFER_MAX_SECONDS: float = 120.0

# Similarity threshold used to suppress duplicate
# transcript commits caused by repeated STT emissions.
#
# Runtime compares normalized transcript strings.
#
# 1.0 = exact identical
# 0.0 = completely different
TRANSCRIPT_SIMILARITY_THRESHOLD: float = 0.92

# Maximum transcript updates accepted for a single
# pending prompt before runtime defensively resets
# transcript assembly state.
#
# Protects against runaway STT event storms.
MAX_TRANSCRIPT_UPDATES_PER_PROMPT: int = 250