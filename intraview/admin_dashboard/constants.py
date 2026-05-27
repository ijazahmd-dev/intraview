# admin_dashboard/constants.py
"""
Configurable thresholds and constants for Admin Dashboard analytics.
All magic numbers live here — nothing is hardcoded in services.
"""

# ════════════════════════════════════════════════════════════════
# RISKY INTERVIEWER DETECTION THRESHOLDS
# ════════════════════════════════════════════════════════════════

# Minimum avg rating below which an interviewer is flagged as risky
RISKY_MIN_AVG_RATING = 2.5

# Minimum complaint count to flag as risky
RISKY_MIN_COMPLAINT_COUNT = 3

# Cancellation rate (%) above which interviewer is flagged
RISKY_CANCELLATION_RATE_THRESHOLD = 30.0

# No-show rate (%) above which interviewer is flagged
RISKY_NO_SHOW_RATE_THRESHOLD = 20.0

# Minimum completed sessions before risky analysis applies
# (prevents flagging new interviewers with 1 bad session)
RISKY_MIN_SESSIONS_FOR_ANALYSIS = 3


# ════════════════════════════════════════════════════════════════
# TOP PERFORMERS
# ════════════════════════════════════════════════════════════════

# Number of top interviewers to return in rankings
TOP_INTERVIEWERS_LIMIT = 10


# ════════════════════════════════════════════════════════════════
# REVENUE / COMMISSION
# ════════════════════════════════════════════════════════════════

# Platform commission rate on peer interviews (fraction, not %)
# e.g. 0.20 = 20% commission
PLATFORM_COMMISSION_RATE = 0.20

# Token-to-INR conversion rate for revenue calculations
# Used when calculating revenue from token-based bookings
TOKEN_TO_INR_RATE = 10.0


# ════════════════════════════════════════════════════════════════
# TIME PERIOD LABELS (for query param validation)
# ════════════════════════════════════════════════════════════════

VALID_PERIODS = {"daily", "weekly", "monthly", "yearly"}
DEFAULT_PERIOD = "monthly"


# ════════════════════════════════════════════════════════════════
# GROWTH CHART DEFAULTS
# ════════════════════════════════════════════════════════════════

# Max data points to return for time-series charts
MAX_TIMESERIES_POINTS = 365


# ════════════════════════════════════════════════════════════════
# SESSION RISK DETECTION THRESHOLDS
# (Used by booking_service.py — never hardcoded)
# ════════════════════════════════════════════════════════════════

# Number of reschedules above which a session is flagged risky
RISKY_SESSION_RESCHEDULE_THRESHOLD = 2

# Interviewer review rating at or below which a session is flagged
RISKY_SESSION_LOW_RATING_THRESHOLD = 2.0

# Sessions with any open report are flagged risky
RISKY_SESSION_OPEN_REPORT_TRIGGERS_FLAG = True

# Sessions where the candidate was refunded are flagged
RISKY_SESSION_REFUND_TRIGGERS_FLAG = True

# No-show statuses that automatically flag a session as risky
RISKY_SESSION_NO_SHOW_STATUSES = {
    "CANDIDATE_NO_SHOW",
    "INTERVIEWER_NO_SHOW",
}

# ════════════════════════════════════════════════════════════════
# SESSION LIST PAGINATION
# ════════════════════════════════════════════════════════════════

# Default page size for admin sessions table
SESSION_LIST_DEFAULT_PAGE_SIZE = 20
SESSION_LIST_MAX_PAGE_SIZE = 100

# Default ordering field for sessions list
SESSION_LIST_DEFAULT_ORDERING = "-created_at"

# ════════════════════════════════════════════════════════════════
# QUICK ADMIN ACTION CONSTANTS
# ════════════════════════════════════════════════════════════════

ADMIN_ACTION_MARK_FOR_REVIEW = "mark_for_review"
ADMIN_ACTION_ESCALATE = "escalate_session"
ADMIN_ACTION_ADD_NOTE = "add_internal_note"
ADMIN_ACTION_FLAG_RISKY = "flag_risky_session"

VALID_ADMIN_SESSION_ACTIONS = {
    ADMIN_ACTION_MARK_FOR_REVIEW,
    ADMIN_ACTION_ESCALATE,
    ADMIN_ACTION_ADD_NOTE,
    ADMIN_ACTION_FLAG_RISKY,
}
