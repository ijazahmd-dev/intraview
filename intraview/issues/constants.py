# constants.py



from __future__ import annotations

from enum import Enum

# How long after interview end a user can raise an issue
ISSUE_RAISE_WINDOW_HOURS = 48

# Which issue types are automatically treated as high priority
HIGH_PRIORITY_ISSUE_TYPES = {
    "ABUSE",
    "INTERVIEWER_NO_SHOW",
    "CANDIDATE_NO_SHOW",
}


class IssueNotificationEvent(str, Enum):
    """
    These map to EventType values in notifications.constants
    and Novu workflows via settings.NOVU_WORKFLOW_IDS.
    """

    ISSUE_RAISED = "ISSUE_RAISED"
    ISSUE_RESOLVED = "ISSUE_RESOLVED"
    ISSUE_REJECTED = "ISSUE_REJECTED"
    ISSUE_ACTION_TAKEN = "ISSUE_ACTION_TAKEN"
    ISSUE_WAITING_RESPONSE = "ISSUE_WAITING_RESPONSE"


class AdminActionType(str, Enum):
    # Candidate → reporting interviewer (refund-focused + moderation)
    FULL_REFUND = "FULL_REFUND"
    PARTIAL_REFUND = "PARTIAL_REFUND"
    WARN_INTERVIEWER = "WARN_INTERVIEWER"
    SUSPEND_INTERVIEWER = "SUSPEND_INTERVIEWER"        # 7-day suspension
    BAN_INTERVIEWER = "BAN_INTERVIEWER"                # permanent

    # Interviewer → reporting candidate (compensation-focused + moderation)
    COMPENSATE_INTERVIEWER = "COMPENSATE_INTERVIEWER"
    WARN_CANDIDATE = "WARN_CANDIDATE"
    SUSPEND_CANDIDATE = "SUSPEND_CANDIDATE"            # 7-day suspension
    BAN_CANDIDATE = "BAN_CANDIDATE"                    # permanent

    # Generic
    NO_ACTION = "NO_ACTION"