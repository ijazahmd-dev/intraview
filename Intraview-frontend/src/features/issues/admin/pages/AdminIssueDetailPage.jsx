// src/features/issues/admin/pages/AdminIssueDetailPage.jsx




import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldAlert,
  CheckCircle,
  User,
  Calendar,
  FileText,
  ChevronDown,
} from "lucide-react";

import {
  fetchAdminIssueDetail,
  updateAdminIssueStatus,
  resolveAdminIssue,
  openAdminActionModal,
  clearAdminSelectedIssue,
  clearAdminStatusUpdateState,
  clearAdminResolveState,
  selectAdminSelectedIssue,
  selectAdminDetailLoading,
  selectAdminDetailError,
  selectAdminStatusUpdateLoading,
  selectAdminStatusUpdateError,
  selectAdminResolveLoading,
  selectAdminResolveError,
} from "../../slices/adminIssuesSlice";

import AdminActionModal from "../components/AdminActionModal";
import IssueStatusBadge from "../../components/IssueStatusBadge";
import IssuePriorityBadge from "../../components/IssuePriorityBadge";

import {
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS,
  ISSUE_STATUS_OPTIONS,
} from "../../constants/issueConstants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractError = (error) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error.detail) return error.detail;
  return Object.entries(error)
    .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
    .join(" | ");
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "—";

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex-shrink-0 mt-0.5">
      {label}
    </span>
    <span className="text-sm text-gray-800 text-right">{value ?? "—"}</span>
  </div>
);

// ─── Update Status Panel ──────────────────────────────────────────────────────

const UpdateStatusPanel = ({ issueId, currentStatus }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAdminStatusUpdateLoading);
  const error = useSelector(selectAdminStatusUpdateError);

  const [status, setStatus] = useState(currentStatus ?? "");
  const [adminNotes, setAdminNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync if parent issue reloads
  useEffect(() => {
    setStatus(currentStatus ?? "");
  }, [currentStatus]);

  useEffect(() => {
    return () => dispatch(clearAdminStatusUpdateState());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(false);
    const payload = { status };
    if (adminNotes.trim()) payload.admin_notes = adminNotes.trim();
    dispatch(updateAdminIssueStatus({ issueId, payload })).then((res) => {
      if (!res.error) {
        setSaved(true);
        setAdminNotes("");
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const errorMsg = extractError(error);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
          Change Status
        </label>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {ISSUE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Admin notes */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
          Admin Notes{" "}
          <span className="normal-case text-gray-400">(optional)</span>
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes visible to admins only..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {saved && (
        <p className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4" />
          Status updated successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || status === currentStatus}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Status"
        )}
      </button>
    </form>
  );
};

// ─── Resolve Panel ────────────────────────────────────────────────────────────

const ResolvePanel = ({ issueId, alreadyResolved }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAdminResolveLoading);
  const error = useSelector(selectAdminResolveError);

  const [resolution, setResolution] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return () => dispatch(clearAdminResolveState());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolution.trim()) return;
    setSaved(false);
    const payload = { resolution: resolution.trim() };
    if (actionTaken.trim()) payload.action_taken = actionTaken.trim();
    dispatch(resolveAdminIssue({ issueId, payload })).then((res) => {
      if (!res.error) {
        setSaved(true);
        setResolution("");
        setActionTaken("");
      }
    });
  };

  const errorMsg = extractError(error);

  if (alreadyResolved && saved === false) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        This issue has already been resolved.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
          Resolution <span className="text-red-500">*</span>
        </label>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={4}
          placeholder="Describe what was decided and why..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
          Action Taken{" "}
          <span className="normal-case text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={actionTaken}
          onChange={(e) => setActionTaken(e.target.value)}
          placeholder="e.g. Issued full refund, warned interviewer..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {saved && (
        <p className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4" />
          Issue marked as resolved.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !resolution.trim()}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Resolving...
          </>
        ) : (
          "Mark as Resolved"
        )}
      </button>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminIssueDetailPage = () => {
  const { issueId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const issue = useSelector(selectAdminSelectedIssue);
  const detailLoading = useSelector(selectAdminDetailLoading);
  const detailError = useSelector(selectAdminDetailError);

  // ── Fetch on mount ──
  useEffect(() => {
    if (issueId) dispatch(fetchAdminIssueDetail(Number(issueId)));
    return () => dispatch(clearAdminSelectedIssue());
  }, [dispatch, issueId]);

  const handleActionSuccess = useCallback(() => {
    // Re-fetch to get updated issue after action
    if (issueId) dispatch(fetchAdminIssueDetail(Number(issueId)));
  }, [dispatch, issueId]);

  // ── Loading ──
  if (detailLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (detailError || !issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </span>
        <div>
          <p className="text-base font-semibold text-gray-800">
            {detailError?.detail ?? "Issue not found"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            The issue may have been deleted or you don't have access.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  const typeLabel = ISSUE_TYPE_LABELS[issue.issue_type] ?? issue.issue_type;
  const isResolved = issue.status === ISSUE_STATUS.RESOLVED;
  const isRejected = issue.status === ISSUE_STATUS.REJECTED;
  const isClosed = isResolved || isRejected;

  return (
    <>
      <AdminActionModal onSuccess={handleActionSuccess} />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

          {/* Back + header */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Issues
            </button>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-gray-900">
                  {typeLabel}
                  <span className="ml-2 text-sm font-normal text-gray-400 font-mono">
                    #{issue.id}
                  </span>
                </h1>
                <p className="text-sm text-gray-500">
                  Reported {formatDate(issue.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge priority={issue.priority} />
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <SectionCard title="Issue Details" icon={FileText}>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Booking ID" value={`#${issue.booking_id}`} />
              <InfoRow label="Issue Type" value={typeLabel} />
              <InfoRow label="Reported By" value={issue.raised_by_email ?? issue.raised_by_id ?? "—"} />
              <InfoRow label="Against User" value={issue.against_user_email ?? issue.against_user_id ?? "—"} />
              <InfoRow label="Submitted" value={formatDate(issue.created_at)} />
              <InfoRow label="Last Updated" value={formatDate(issue.updated_at)} />
            </div>

            {/* Description */}
            {issue.description && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  User Description
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>
            )}
          </SectionCard>

          {/* Admin Notes (read) */}
          {issue.admin_notes && (
            <SectionCard title="Admin Notes" icon={FileText}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {issue.admin_notes}
              </p>
            </SectionCard>
          )}

          {/* Resolution (read) */}
          {issue.resolution && (
            <SectionCard title="Resolution" icon={CheckCircle}>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                {issue.resolution}
              </p>
              {issue.action_taken && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Action Taken
                  </p>
                  <p className="text-sm text-gray-700">{issue.action_taken}</p>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Admin Actions ── */}
          {!isClosed && (
            <>
              {/* Update Status */}
              <SectionCard title="Update Status" icon={User}>
                <UpdateStatusPanel
                  issueId={issue.id}
                  currentStatus={issue.status}
                />
              </SectionCard>

              {/* Apply Admin Action */}
              <SectionCard title="Apply Action" icon={ShieldAlert}>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Apply a formal admin action — refund, warn, suspend, or ban.
                    This will update the issue status and log the action.
                  </p>
                  <button
                    onClick={() =>
                      dispatch(
                        openAdminActionModal({
                          issueId: issue.id,
                          reporterRole: issue.raised_by_role,     // from API serializer
                          againstRole: issue.against_user_role,   // from API serializer
                        })
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Open Action Panel
                  </button>
                </div>
              </SectionCard>

              {/* Resolve */}
              <SectionCard title="Resolve Issue" icon={CheckCircle}>
                <ResolvePanel
                  issueId={issue.id}
                  alreadyResolved={isResolved}
                />
              </SectionCard>
            </>
          )}

          {/* Closed state banner */}
          {isClosed && (
            <div
              className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${isResolved
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
                }`}
            >
              <CheckCircle
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isResolved ? "text-green-600" : "text-red-500"
                  }`}
              />
              <div>
                <p
                  className={`text-sm font-semibold ${isResolved ? "text-green-800" : "text-red-700"
                    }`}
                >
                  {isResolved ? "Issue Resolved" : "Issue Rejected"}
                </p>
                <p
                  className={`text-xs mt-0.5 ${isResolved ? "text-green-700" : "text-red-600"
                    }`}
                >
                  {isResolved
                    ? "This issue has been closed with a resolution."
                    : "This complaint was reviewed and rejected."}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminIssueDetailPage;