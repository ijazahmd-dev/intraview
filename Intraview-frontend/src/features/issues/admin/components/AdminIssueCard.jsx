// src/features/issues/admin/components/AdminIssueCard.jsx





import React from "react";
import { User, ChevronRight } from "lucide-react";

import IssueStatusBadge from "../../components/IssueStatusBadge";
import IssuePriorityBadge from "../../components/IssuePriorityBadge";

import { ISSUE_TYPE_LABELS } from "../../constants/issueConstants";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminIssueCard
 *
 * Props:
 *   issue   — issue object from adminIssuesSlice
 *   onClick — (issueId) => void
 */
const AdminIssueCard = ({ issue, onClick }) => {
  const typeLabel = ISSUE_TYPE_LABELS[issue.issue_type] ?? issue.issue_type;

  const date = new Date(issue.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      onClick={() => onClick(issue.id)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition group p-5"
    >
      <div className="flex items-start justify-between gap-3">

        {/* Left */}
        <div className="flex-1 min-w-0 space-y-2">

          {/* Top row: type + issue id */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
              {typeLabel}
            </span>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-md">
              #{issue.id}
            </span>
          </div>

          {/* Booking + date */}
          <p className="text-xs text-gray-400">
            Booking #{issue.booking_id} · {date}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <IssueStatusBadge status={issue.status} size="sm" />
            <IssuePriorityBadge priority={issue.priority} size="sm" />
          </div>

        </div>

        {/* Right: chevron */}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition" />
      </div>
    </button>
  );
};

export default AdminIssueCard;