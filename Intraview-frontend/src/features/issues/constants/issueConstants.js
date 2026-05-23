
// src/features/issues/constants/issueConstants.js







// ─── Issue Types ────────────────────────────────────────────────────────────

export const ISSUE_TYPES = {
  INTERVIEWER_NO_SHOW: "INTERVIEWER_NO_SHOW",
  CANDIDATE_NO_SHOW: "CANDIDATE_NO_SHOW",
  ENDED_TOO_EARLY: "ENDED_TOO_EARLY",
  UNPROFESSIONAL: "UNPROFESSIONAL",
  LOW_QUALITY: "LOW_QUALITY",
  POOR_FEEDBACK: "POOR_FEEDBACK",
  ABUSE: "ABUSE",
  TECHNICAL: "TECHNICAL",
  PAYMENT: "PAYMENT",
  OTHER: "OTHER",
};

export const ISSUE_TYPE_LABELS = {
  [ISSUE_TYPES.INTERVIEWER_NO_SHOW]: "Interviewer never joined",
  [ISSUE_TYPES.CANDIDATE_NO_SHOW]: "Candidate never joined",
  [ISSUE_TYPES.ENDED_TOO_EARLY]: "Interview ended too early",
  [ISSUE_TYPES.UNPROFESSIONAL]: "Unprofessional behavior",
  [ISSUE_TYPES.LOW_QUALITY]: "Poor interview quality",
  [ISSUE_TYPES.POOR_FEEDBACK]: "Poor feedback quality",
  [ISSUE_TYPES.ABUSE]: "Abusive behavior",
  [ISSUE_TYPES.TECHNICAL]: "Technical issue",
  [ISSUE_TYPES.PAYMENT]: "Payment concern",
  [ISSUE_TYPES.OTHER]: "Other",
};

export const ISSUE_TYPE_OPTIONS = Object.entries(ISSUE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);


// ─── Issue Statuses ──────────────────────────────────────────────────────────

export const ISSUE_STATUS = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  WAITING_FOR_RESPONSE: "WAITING_FOR_RESPONSE",
  ACTION_TAKEN: "ACTION_TAKEN",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

export const ISSUE_STATUS_LABELS = {
  [ISSUE_STATUS.OPEN]: "Open",
  [ISSUE_STATUS.UNDER_REVIEW]: "Under Review",
  [ISSUE_STATUS.WAITING_FOR_RESPONSE]: "Waiting for Response",
  [ISSUE_STATUS.ACTION_TAKEN]: "Action Taken",
  [ISSUE_STATUS.RESOLVED]: "Resolved",
  [ISSUE_STATUS.REJECTED]: "Rejected",
};

// Tailwind color classes per status
export const ISSUE_STATUS_COLORS = {
  [ISSUE_STATUS.OPEN]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  [ISSUE_STATUS.UNDER_REVIEW]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
  [ISSUE_STATUS.WAITING_FOR_RESPONSE]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500",
  },
  [ISSUE_STATUS.ACTION_TAKEN]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-500",
  },
  [ISSUE_STATUS.RESOLVED]: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  [ISSUE_STATUS.REJECTED]: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
  },
};

export const ISSUE_STATUS_OPTIONS = Object.entries(ISSUE_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);


// ─── Priorities ──────────────────────────────────────────────────────────────

export const ISSUE_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export const ISSUE_PRIORITY_LABELS = {
  [ISSUE_PRIORITY.LOW]: "Low",
  [ISSUE_PRIORITY.MEDIUM]: "Medium",
  [ISSUE_PRIORITY.HIGH]: "High",
  [ISSUE_PRIORITY.CRITICAL]: "Critical",
};

export const ISSUE_PRIORITY_COLORS = {
  [ISSUE_PRIORITY.LOW]: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  [ISSUE_PRIORITY.MEDIUM]: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  [ISSUE_PRIORITY.HIGH]: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  [ISSUE_PRIORITY.CRITICAL]: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-600",
  },
};

export const ISSUE_PRIORITY_OPTIONS = Object.entries(ISSUE_PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label })
);


// ─── Admin Actions ───────────────────────────────────────────────────────────

// These string values must match your backend AdminActionType enum.
export const ADMIN_ACTION_TYPES = {
  // Candidate → reporting interviewer
  FULL_REFUND: "FULL_REFUND",
  PARTIAL_REFUND: "PARTIAL_REFUND",
  WARN_INTERVIEWER: "WARN_INTERVIEWER",
  SUSPEND_INTERVIEWER: "SUSPEND_INTERVIEWER",
  BAN_INTERVIEWER: "BAN_INTERVIEWER",

  // Interviewer → reporting candidate
  COMPENSATE_INTERVIEWER: "COMPENSATE_INTERVIEWER",
  WARN_CANDIDATE: "WARN_CANDIDATE",
  SUSPEND_CANDIDATE: "SUSPEND_CANDIDATE",
  BAN_CANDIDATE: "BAN_CANDIDATE",

  // Generic
  NO_ACTION: "NO_ACTION",
};

// Candidate → reports interviewer (refund + moderation)
export const ADMIN_ACTIONS_FOR_CANDIDATE_REPORT = [
  {
    value: ADMIN_ACTION_TYPES.FULL_REFUND,
    label: "Full Refund",
    description: "Refund 100% of session tokens back to candidate.",
    needsAmount: false,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.PARTIAL_REFUND,
    label: "Partial Refund",
    description:
      "Refund a specific percentage or token amount to candidate.",
    needsAmount: true,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.WARN_INTERVIEWER,
    label: "Warn Interviewer",
    description:
      "Issue a formal warning to the interviewer. Warning count increments on their profile.",
    needsAmount: false,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.SUSPEND_INTERVIEWER,
    label: "Suspend Interviewer (7 days)",
    description:
      "Temporarily suspend the interviewer for 7 days. They cannot accept new sessions.",
    needsAmount: false,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.BAN_INTERVIEWER,
    label: "Permanent Ban",
    description:
      "Permanently ban the interviewer from the platform. This cannot be undone easily.",
    needsAmount: false,
    danger: true,
  },
  {
    value: ADMIN_ACTION_TYPES.NO_ACTION,
    label: "Reject Complaint",
    description:
      "Mark the complaint as rejected. No action will be taken against the interviewer.",
    needsAmount: false,
    danger: false,
  },
];

// Interviewer → reports candidate (compensation + moderation)
export const ADMIN_ACTIONS_FOR_INTERVIEWER_REPORT = [
  {
    value: ADMIN_ACTION_TYPES.COMPENSATE_INTERVIEWER,
    label: "Compensate Interviewer",
    description:
      "Pay the interviewer the session tokens when the candidate is at fault (e.g. no-show).",
    needsAmount: false,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.WARN_CANDIDATE,
    label: "Warn Candidate",
    description: "Issue a formal warning to the candidate.",
    needsAmount: false,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.SUSPEND_CANDIDATE,
    label: "Suspend Candidate (7 days)",
    description:
      "Temporarily suspend the candidate for 7 days from booking new sessions.",
    needsAmount: false,
    danger: false,
  },
  {
    value: ADMIN_ACTION_TYPES.BAN_CANDIDATE,
    label: "Permanent Ban (Candidate)",
    description:
      "Permanently ban the candidate from the platform. This cannot be undone easily.",
    needsAmount: false,
    danger: true,
  },
  {
    value: ADMIN_ACTION_TYPES.NO_ACTION,
    label: "Reject Complaint",
    description:
      "Mark the complaint as rejected. No action will be taken against the candidate.",
    needsAmount: false,
    danger: false,
  },
];

// Combined lookup
export const ADMIN_ACTION_MAP = Object.fromEntries(
  [
    ...ADMIN_ACTIONS_FOR_CANDIDATE_REPORT,
    ...ADMIN_ACTIONS_FOR_INTERVIEWER_REPORT,
  ].map((action) => [action.value, action])
);

// ─── Partial refund modes ────────────────────────────────────────────────────

export const REFUND_MODE = {
  PERCENT: "percent",
  AMOUNT: "amount",
};





// src/features/issues/constants/issueConstants.js

export const ISSUE_TYPE_OPTIONS_CANDIDATE = [
  { value: "INTERVIEWER_NO_SHOW", label: "Interviewer never joined" },
  { value: "ENDED_TOO_EARLY",     label: "Interview ended too early" },
  { value: "UNPROFESSIONAL",      label: "Unprofessional behaviour" },
  { value: "LOW_QUALITY",         label: "Poor interview quality" },
  { value: "ABUSE",               label: "Abusive behaviour" },
  { value: "TECHNICAL",           label: "Technical / connection problem" },
  { value: "PAYMENT",             label: "Token / payment issue" },
  { value: "OTHER",               label: "Other" },
];

export const ISSUE_TYPE_OPTIONS_INTERVIEWER = [
  { value: "CANDIDATE_NO_SHOW",   label: "Candidate never joined" },
  { value: "ENDED_TOO_EARLY",     label: "Interview ended too early" },
  { value: "UNPROFESSIONAL",      label: "Unprofessional behaviour" },
  { value: "LOW_QUALITY",         label: "Poor interview quality" },
  { value: "ABUSE",               label: "Abusive behaviour" },
  { value: "TECHNICAL",           label: "Technical / connection problem" },
  { value: "PAYMENT",             label: "Token / payment dispute" },
  { value: "OTHER",               label: "Other" },
];