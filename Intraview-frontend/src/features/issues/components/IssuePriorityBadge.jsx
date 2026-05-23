// src/features/issues/components/IssuePriorityBadge.jsx




import React from "react";
import { ISSUE_PRIORITY_LABELS, ISSUE_PRIORITY_COLORS } from "../constants/issueConstants";

/**
 * Usage:
 *   <IssuePriorityBadge priority="HIGH" />
 *   <IssuePriorityBadge priority="CRITICAL" size="sm" />
 */
const IssuePriorityBadge = ({ priority, size = "md" }) => {
  const colors = ISSUE_PRIORITY_COLORS[priority] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  const label = ISSUE_PRIORITY_LABELS[priority] ?? priority;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${colors.bg} ${colors.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
      {label}
    </span>
  );
};

export default IssuePriorityBadge;