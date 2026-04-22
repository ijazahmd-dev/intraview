export const EVENT_LABELS = {
  INTERVIEW_BOOKED: "Interview booked",
  PAYMENT_SUCCESS: "Payment successful",
  PAYOUT_FAILED: "Payout failed",
  FEEDBACK_PENDING: "Feedback requested",
  INTERVIEW_REMINDER_30M: "Interview starting soon",
};

export function formatEventTitle(notification) {
  const code = notification.event_type;
  if (notification.title) return notification.title;
  if (EVENT_LABELS[code]) return EVENT_LABELS[code];
  // fallback: transform ENUM_NAME into "enum name"
  return code.replace(/_/g, " ").toLowerCase();
}

export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}
