// src/features/issues/interviewer/pages/InterviewerMyIssuesPage.jsx






import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw, FileX, Plus } from "lucide-react";

import {
  fetchInterviewerMyIssues,
  openInterviewerRaiseModal,
  selectInterviewerIssues,
  selectInterviewerIssuesListLoading,
  selectInterviewerIssuesListError,
} from "../../slices/interviewerIssuesSlice";

import IssueStatusBadge from "../../components/IssueStatusBadge";
import IssuePriorityBadge from "../../components/IssuePriorityBadge";
import RaiseIssueModal from "../../components/RaiseIssueModal";

import { ISSUE_TYPE_LABELS } from "../../constants/issueConstants";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const IssueSkeleton = () => (
  <div className="animate-pulse bg-white rounded-xl border border-gray-100 p-5 space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 w-36 bg-gray-200 rounded" />
      <div className="h-5 w-20 bg-gray-200 rounded-full" />
    </div>
    <div className="h-3 w-48 bg-gray-100 rounded" />
    <div className="flex gap-2 pt-1">
      <div className="h-5 w-16 bg-gray-100 rounded-full" />
      <div className="h-5 w-16 bg-gray-100 rounded-full" />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <FileX className="w-7 h-7 text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">
      No issues reported yet
    </h3>
    <p className="text-sm text-gray-500 max-w-xs">
      If a candidate was a no-show or behaved unprofessionally, you can report
      it from your booking detail page within 48 hours of the session.
    </p>
  </div>
);

// ─── Issue Card ───────────────────────────────────────────────────────────────

const IssueCard = ({ issue, onClick }) => {
  const typeLabel = ISSUE_TYPE_LABELS[issue.issue_type] ?? issue.issue_type;
  const date = new Date(issue.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      onClick={() => onClick(issue.id)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm p-5 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
            {typeLabel}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Booking #{issue.booking_id} · Reported on {date}
          </p>
        </div>
        <IssueStatusBadge status={issue.status} />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <IssuePriorityBadge priority={issue.priority} size="sm" />
        <span className="text-xs text-gray-400">{issue.status_display}</span>
      </div>
    </button>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const InterviewerMyIssuesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const issues = useSelector(selectInterviewerIssues);
  const loading = useSelector(selectInterviewerIssuesListLoading);
  const error = useSelector(selectInterviewerIssuesListError);

  useEffect(() => {
    dispatch(fetchInterviewerMyIssues());
  }, [dispatch]);

  const handleCardClick = (issueId) => {
    navigate(`/interviewer/my-issues/${issueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Issues</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Issues you have raised against candidates.
            </p>
          </div>
          {issues.length > 0 && (
            <button
              onClick={() => dispatch(fetchInterviewerMyIssues())}
              disabled={loading}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error?.detail ?? "Failed to load issues."}</span>
            <button
              onClick={() => dispatch(fetchInterviewerMyIssues())}
              className="ml-auto text-red-600 underline text-xs hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <IssueSkeleton key={n} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && issues.length === 0 && <EmptyState />}

        {/* List */}
        {!loading && issues.length > 0 && (
          <div className="space-y-3">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal — normally opened from booking detail page */}
      <RaiseIssueModal role="interviewer" />
    </div>
  );
};

export default InterviewerMyIssuesPage;