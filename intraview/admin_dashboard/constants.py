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
