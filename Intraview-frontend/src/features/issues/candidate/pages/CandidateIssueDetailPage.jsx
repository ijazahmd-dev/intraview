// src/features/issues/candidate/pages/CandidateIssueDetailPage.jsx




import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

import {
  fetchCandidateIssueDetail,
  clearCandidateSelectedIssue,
  selectCandidateSelectedIssue,
  selectCandidateDetailLoading,
  selectCandidateDetailError,
} from "../../slices/issuesSlice";

import IssueStatusBadge from "../../components/IssueStatusBadge";
import IssuePriorityBadge from "../../components/IssuePriorityBadge";

import {
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS,
} from "../../constants/issueConstants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const DetailSkeleton = () => (
  <div className="animate-pulse space-y-4 max-w-2xl mx-auto px-4 py-8">
    <div className="h-4 w-24 bg-gray-200 rounded" />
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <div className="flex justify-between">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-3 w-32 bg-gray-100 rounded" />
      <div className="h-16 bg-gray-100 rounded" />
    </div>
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-3 w-full bg-gray-100 rounded" />
      ))}
    </div>
  </div>
);

// ─── Timeline Item ────────────────────────────────────────────────────────────

const TimelineItem = ({ icon: Icon, iconBg, iconColor, title, subtitle, date, isLast }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </span>
      {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
    </div>
    <div className="pb-5 min-w-0">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      )}
      {date && (
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      )}
    </div>
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-gray-400" />
    </span>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

// ─── Status Banner ────────────────────────────────────────────────────────────

const StatusBanner = ({ status, resolution }) => {
  if (status === ISSUE_STATUS.WAITING_FOR_RESPONSE) {
    return (
      <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-start gap-3 text-sm text-orange-700">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Our team needs more information from you to continue reviewing this issue.
          Please check your email or contact support.
        </span>
      </div>
    );
  }

  if (status === ISSUE_STATUS.RESOLVED && resolution) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-start gap-3 text-sm text-green-700">
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium mb-0.5">Issue Resolved</p>
          <p>{resolution}</p>
        </div>
      </div>
    );
  }

  if (status === ISSUE_STATUS.REJECTED) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3 text-sm text-red-700">
        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Your complaint has been reviewed and was not upheld. No action was taken.
          If you believe this is incorrect, please contact support.
        </span>
      </div>
    );
  }

  if (status === ISSUE_STATUS.ACTION_TAKEN) {
    return (
      <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 flex items-start gap-3 text-sm text-purple-700">
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Our team has reviewed your issue and taken appropriate action.
        </span>
      </div>
    );
  }

  return null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CandidateIssueDetailPage = () => {
  const { issueId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const issue = useSelector(selectCandidateSelectedIssue);
  const loading = useSelector(selectCandidateDetailLoading);
  const error = useSelector(selectCandidateDetailError);

  useEffect(() => {
    dispatch(fetchCandidateIssueDetail(issueId));
    return () => {
      dispatch(clearCandidateSelectedIssue());
    };
  }, [dispatch, issueId]);

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error?.detail ?? "Failed to load issue details."}
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const typeLabel = ISSUE_TYPE_LABELS[issue.issue_type] ?? issue.issue_type;

  // Build timeline from issue data
  const timeline = [
    {
      icon: AlertCircle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      title: "Issue Reported",
      subtitle: `You reported: ${typeLabel}`,
      date: formatDate(issue.created_at),
    },
  ];

  if (issue.status === ISSUE_STATUS.UNDER_REVIEW || issue.resolved_at) {
    timeline.push({
      icon: BookOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      title: "Under Review",
      subtitle: "Our moderation team is reviewing your issue.",
      date: null,
    });
  }

  if (issue.status === ISSUE_STATUS.WAITING_FOR_RESPONSE) {
    timeline.push({
      icon: Info,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      title: "More Information Requested",
      subtitle: "The team needs additional information from you.",
      date: null,
    });
  }

  if (issue.status === ISSUE_STATUS.ACTION_TAKEN) {
    timeline.push({
      icon: CheckCircle2,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
      title: "Action Taken",
      subtitle: "The team has taken action on your issue.",
      date: issue.resolved_at ? formatDate(issue.resolved_at) : null,
    });
  }

  if (issue.status === ISSUE_STATUS.RESOLVED) {
    timeline.push({
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
      title: "Issue Resolved",
      subtitle: issue.resolution || "Resolved by our team.",
      date: issue.resolved_at ? formatDate(issue.resolved_at) : null,
    });
  }

  if (issue.status === ISSUE_STATUS.REJECTED) {
    timeline.push({
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      title: "Complaint Rejected",
      subtitle: "The complaint was reviewed and not upheld.",
      date: issue.resolved_at ? formatDate(issue.resolved_at) : null,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Back */}
        <button
          onClick={() => navigate("/my-issues")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Issues
        </button>

        {/* Title card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{typeLabel}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Issue #{issue.id} · Booking #{issue.booking_id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IssuePriorityBadge priority={issue.priority} />
              <IssueStatusBadge status={issue.status} />
            </div>
          </div>

          {/* Status banner */}
          {(issue.status !== "OPEN" && issue.status !== "UNDER_REVIEW") && (
            <div className="mt-4">
              <StatusBanner status={issue.status} resolution={issue.resolution} />
            </div>
          )}
        </div>

        {/* Details card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Issue Details
          </h2>
          <InfoRow icon={User} label="Raised By" value={issue.raised_by_name} />
          <InfoRow icon={User} label="Against" value={issue.against_user_name} />
          <InfoRow
            icon={Calendar}
            label="Reported On"
            value={formatDate(issue.created_at)}
          />
          {issue.issue_deadline && (
            <InfoRow
              icon={Clock}
              label="Issue Deadline"
              value={formatDate(issue.issue_deadline)}
            />
          )}
          {issue.resolved_at && (
            <InfoRow
              icon={CheckCircle2}
              label="Resolved On"
              value={formatDate(issue.resolved_at)}
            />
          )}
        </div>

        {/* Description card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Your Description
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {/* Timeline card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Issue Timeline
          </h2>
          <div>
            {timeline.map((item, idx) => (
              <TimelineItem
                key={idx}
                {...item}
                isLast={idx === timeline.length - 1}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateIssueDetailPage;