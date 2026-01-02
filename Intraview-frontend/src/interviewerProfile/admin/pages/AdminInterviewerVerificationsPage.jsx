import { useEffect, useState, useCallback } from "react";
import {
  fetchAdminVerifications,
  fetchAdminVerificationDetail,
  reviewAdminVerification,
} from "../../interviewerProfileApi";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminInterviewerVerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminVerifications(statusFilter || undefined);
      
      // ✅ FIX: Handle DRF pagination object
      setVerifications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load verifications.");
      setVerifications([]);  // ✅ Prevent map crash
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadDetail = useCallback(
    async (id) => {
      setLoadingDetail(true);
      setError(null);
      try {
        const data = await fetchAdminVerificationDetail(id);
        setSelectedDetail(data);
        setRejectReason(data.rejection_reason || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load verification detail.");
      } finally {
        setLoadingDetail(false);
      }
    },
    []
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleRowClick = (id) => {
    setSelectedId(id);
    setSelectedDetail(null);
    loadDetail(id);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedDetail(null);
    setRejectReason("");
  };

  const handleReview = async (action) => {
    if (!selectedId) return;
    if (action === "reject" && !rejectReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }

    setReviewing(true);
    setError(null);
    try {
      await reviewAdminVerification(selectedId, {
        action,
        rejection_reason: rejectReason.trim(),
      });
      await loadList();   // refresh list
      await loadDetail(selectedId); // refresh detail (status changes)
    } catch (err) {
      console.error(err);
      setError("Failed to submit review.");
    } finally {
      setReviewing(false);
    }
  };

  const openDocument = () => {
    if (!selectedDetail?.document_file) return;
    window.open(selectedDetail.document_file, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Interviewer Verification
            </h1>
            <p className="text-sm text-slate-500">
              Review government ID documents submitted by interviewers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-500 mr-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={loadList}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
            <div className="py-10 text-center text-slate-500 text-sm">Loading verifications...</div>
          ) : (!Array.isArray(verifications) || verifications.length === 0) ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              No verifications found for this filter.
            </div>
          ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                    ID
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                    Email
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                    Doc Type
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                    Submitted At
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr
                    key={v.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                      selectedId === v.id ? "bg-slate-50" : ""
                    }`}
                    onClick={() => handleRowClick(v.id)}
                  >
                    <td className="px-4 py-2 text-xs text-slate-700">{v.id}</td>
                    <td className="px-4 py-2 text-xs text-slate-700">
                      {v.user_email}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-700">
                      {v.document_type}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <StatusPill status={v.status} />
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {v.submitted_at
                        ? new Date(v.submitted_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-900"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail drawer / panel */}
        {selectedId && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            {loadingDetail || !selectedDetail ? (
              <div className="text-sm text-slate-500">Loading verification...</div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Verification #{selectedDetail.id}
                    </h2>
                    <button
                      onClick={closeDetail}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <InfoRow label="Email" value={selectedDetail.user_email} />
                    <InfoRow
                      label="Document Type"
                      value={selectedDetail.document_type}
                    />
                    <InfoRow
                      label="Document Number"
                      value={selectedDetail.document_number || "—"}
                    />
                    <InfoRow
                      label="Status"
                      value={<StatusPill status={selectedDetail.status} />}
                    />
                    <InfoRow
                      label="Submitted At"
                      value={
                        selectedDetail.submitted_at
                          ? new Date(
                              selectedDetail.submitted_at
                            ).toLocaleString()
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Reviewed At"
                      value={
                        selectedDetail.reviewed_at
                          ? new Date(
                              selectedDetail.reviewed_at
                            ).toLocaleString()
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Reviewed By"
                      value={selectedDetail.reviewed_by || "—"}
                    />
                  </div>

                  {selectedDetail.rejection_reason && (
                    <div className="mt-3 text-xs">
                      <div className="font-semibold text-red-600">
                        Rejection reason
                      </div>
                      <p className="text-slate-700 mt-1 whitespace-pre-wrap">
                        {selectedDetail.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-80">
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-800">
                        Document
                      </span>
                      {selectedDetail.document_file && (
                        <button
                          onClick={openDocument}
                          className="text-xs text-emerald-600 hover:text-emerald-700"
                        >
                          Open in new tab
                        </button>
                      )}
                    </div>

                    {selectedDetail.document_file ? (
                      <div className="text-slate-600">
                        <p className="mb-2">
                          File is stored and accessible via CDN / storage URL.
                        </p>
                        <code className="block text-[11px] break-all bg-white border border-slate-200 rounded px-2 py-1">
                          {selectedDetail.document_file}
                        </code>
                      </div>
                    ) : (
                      <p className="text-slate-500">
                        No document file uploaded.
                      </p>
                    )}

                    {/* Review controls */}
                    {selectedDetail.status === "PENDING" && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Rejection reason (required when rejecting)
                          </label>
                          <textarea
                            rows={3}
                            className="w-full border border-slate-200 rounded-lg text-xs px-2 py-1.5 resize-none"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={reviewing}
                            onClick={() => handleReview("approve")}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {reviewing ? "Submitting..." : "Approve"}
                          </button>
                          <button
                            disabled={reviewing}
                            onClick={() => handleReview("reject")}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-60"
                          >
                            {reviewing ? "Submitting..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedDetail.status === "APPROVED" && (
                      <p className="mt-3 text-xs text-emerald-700">
                        This document has been approved.
                      </p>
                    )}

                    {selectedDetail.status === "REJECTED" && (
                      <p className="mt-3 text-xs text-red-600">
                        This document was rejected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  let color =
    status === "APPROVED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "REJECTED"
      ? "bg-red-50 text-red-700 border-red-100"
      : status === "PENDING"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${color}`}
    >
      {status}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="text-xs text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}
