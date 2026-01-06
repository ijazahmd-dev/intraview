// import { useEffect, useState, useCallback } from "react";
// import {
//   fetchAdminVerifications,
//   fetchAdminVerificationDetail,
//   reviewAdminVerification,
// } from "../../interviewerProfileApi";

// const STATUS_OPTIONS = [
//   { value: "", label: "All" },
//   { value: "PENDING", label: "Pending" },
//   { value: "APPROVED", label: "Approved" },
//   { value: "REJECTED", label: "Rejected" },
// ];

// export default function AdminInterviewerVerificationsPage() {
//   const [verifications, setVerifications] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("PENDING");
//   const [loading, setLoading] = useState(true);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [reviewing, setReviewing] = useState(false);
//   const [error, setError] = useState(null);

//   const [selectedId, setSelectedId] = useState(null);
//   const [selectedDetail, setSelectedDetail] = useState(null);
//   const [rejectReason, setRejectReason] = useState("");

//   const loadList = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchAdminVerifications(statusFilter || undefined);
      
//       // ✅ FIX: Handle DRF pagination object
//       setVerifications(Array.isArray(data) ? data : data.results || []);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load verifications.");
//       setVerifications([]);  // ✅ Prevent map crash
//     } finally {
//       setLoading(false);
//     }
//   }, [statusFilter]);

//   const loadDetail = useCallback(
//     async (id) => {
//       setLoadingDetail(true);
//       setError(null);
//       try {
//         const data = await fetchAdminVerificationDetail(id);
//         setSelectedDetail(data);
//         setRejectReason(data.rejection_reason || "");
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load verification detail.");
//       } finally {
//         setLoadingDetail(false);
//       }
//     },
//     []
//   );

//   useEffect(() => {
//     loadList();
//   }, [loadList]);

//   const handleRowClick = (id) => {
//     setSelectedId(id);
//     setSelectedDetail(null);
//     loadDetail(id);
//   };

//   const closeDetail = () => {
//     setSelectedId(null);
//     setSelectedDetail(null);
//     setRejectReason("");
//   };

//   const handleReview = async (action) => {
//     if (!selectedId) return;
//     if (action === "reject" && !rejectReason.trim()) {
//       alert("Rejection reason is required.");
//       return;
//     }

//     setReviewing(true);
//     setError(null);
//     try {
//       await reviewAdminVerification(selectedId, {
//         action,
//         rejection_reason: rejectReason.trim(),
//       });
//       await loadList();   // refresh list
//       await loadDetail(selectedId); // refresh detail (status changes)
//     } catch (err) {
//       console.error(err);
//       setError("Failed to submit review.");
//     } finally {
//       setReviewing(false);
//     }
//   };

//   const openDocument = () => {
//     if (!selectedDetail?.document_file) return;
//     window.open(selectedDetail.document_file, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 px-6 py-6">
//       <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h1 className="text-xl font-semibold text-slate-900">
//               Interviewer Verification
//             </h1>
//             <p className="text-sm text-slate-500">
//               Review government ID documents submitted by interviewers.
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <label className="text-xs text-slate-500 mr-1">Status</label>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
//             >
//               {STATUS_OPTIONS.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={loadList}
//               className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
//             >
//               Refresh
//             </button>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
//             {error}
//           </div>
//         )}

//         {loading ? (
//             <div className="py-10 text-center text-slate-500 text-sm">Loading verifications...</div>
//           ) : (!Array.isArray(verifications) || verifications.length === 0) ? (
//             <div className="py-10 text-center text-slate-500 text-sm">
//               No verifications found for this filter.
//             </div>
//           ) : (
//           <div className="border border-slate-100 rounded-xl overflow-hidden">
//             <table className="w-full text-sm">
//               <thead className="bg-slate-50 border-b border-slate-100">
//                 <tr>
//                   <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
//                     ID
//                   </th>
//                   <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
//                     Email
//                   </th>
//                   <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
//                     Doc Type
//                   </th>
//                   <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
//                     Status
//                   </th>
//                   <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
//                     Submitted At
//                   </th>
//                   <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {verifications.map((v) => (
//                   <tr
//                     key={v.id}
//                     className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
//                       selectedId === v.id ? "bg-slate-50" : ""
//                     }`}
//                     onClick={() => handleRowClick(v.id)}
//                   >
//                     <td className="px-4 py-2 text-xs text-slate-700">{v.id}</td>
//                     <td className="px-4 py-2 text-xs text-slate-700">
//                       {v.user_email}
//                     </td>
//                     <td className="px-4 py-2 text-xs text-slate-700">
//                       {v.document_type}
//                     </td>
//                     <td className="px-4 py-2 text-xs">
//                       <StatusPill status={v.status} />
//                     </td>
//                     <td className="px-4 py-2 text-xs text-slate-500">
//                       {v.submitted_at
//                         ? new Date(v.submitted_at).toLocaleString()
//                         : "-"}
//                     </td>
//                     <td className="px-4 py-2 text-xs">
//                       <button
//                         type="button"
//                         className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-900"
//                       >
//                         Review
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Detail drawer / panel */}
//         {selectedId && (
//           <div className="mt-6 border-t border-slate-100 pt-4">
//             {loadingDetail || !selectedDetail ? (
//               <div className="text-sm text-slate-500">Loading verification...</div>
//             ) : (
//               <div className="flex flex-col lg:flex-row gap-6">
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-3">
//                     <h2 className="text-sm font-semibold text-slate-900">
//                       Verification #{selectedDetail.id}
//                     </h2>
//                     <button
//                       onClick={closeDetail}
//                       className="text-xs text-slate-500 hover:text-slate-700"
//                     >
//                       Close
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
//                     <InfoRow label="Email" value={selectedDetail.user_email} />
//                     <InfoRow
//                       label="Document Type"
//                       value={selectedDetail.document_type}
//                     />
//                     <InfoRow
//                       label="Document Number"
//                       value={selectedDetail.document_number || "—"}
//                     />
//                     <InfoRow
//                       label="Status"
//                       value={<StatusPill status={selectedDetail.status} />}
//                     />
//                     <InfoRow
//                       label="Submitted At"
//                       value={
//                         selectedDetail.submitted_at
//                           ? new Date(
//                               selectedDetail.submitted_at
//                             ).toLocaleString()
//                           : "—"
//                       }
//                     />
//                     <InfoRow
//                       label="Reviewed At"
//                       value={
//                         selectedDetail.reviewed_at
//                           ? new Date(
//                               selectedDetail.reviewed_at
//                             ).toLocaleString()
//                           : "—"
//                       }
//                     />
//                     <InfoRow
//                       label="Reviewed By"
//                       value={selectedDetail.reviewed_by || "—"}
//                     />
//                   </div>

//                   {selectedDetail.rejection_reason && (
//                     <div className="mt-3 text-xs">
//                       <div className="font-semibold text-red-600">
//                         Rejection reason
//                       </div>
//                       <p className="text-slate-700 mt-1 whitespace-pre-wrap">
//                         {selectedDetail.rejection_reason}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="w-full lg:w-80">
//                   <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs">
//                     <div className="flex items-center justify-between mb-3">
//                       <span className="font-semibold text-slate-800">
//                         Document
//                       </span>
//                       {selectedDetail.document_file && (
//                         <button
//                           onClick={openDocument}
//                           className="text-xs text-emerald-600 hover:text-emerald-700"
//                         >
//                           Open in new tab
//                         </button>
//                       )}
//                     </div>

//                     {selectedDetail.document_file ? (
//                       <div className="text-slate-600">
//                         <p className="mb-2">
//                           File is stored and accessible via CDN / storage URL.
//                         </p>
//                         <code className="block text-[11px] break-all bg-white border border-slate-200 rounded px-2 py-1">
//                           {selectedDetail.document_file}
//                         </code>
//                       </div>
//                     ) : (
//                       <p className="text-slate-500">
//                         No document file uploaded.
//                       </p>
//                     )}

//                     {/* Review controls */}
//                     {selectedDetail.status === "PENDING" && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-[11px] font-medium text-slate-700 mb-1">
//                             Rejection reason (required when rejecting)
//                           </label>
//                           <textarea
//                             rows={3}
//                             className="w-full border border-slate-200 rounded-lg text-xs px-2 py-1.5 resize-none"
//                             value={rejectReason}
//                             onChange={(e) => setRejectReason(e.target.value)}
//                           />
//                         </div>
//                         <div className="flex gap-2">
//                           <button
//                             disabled={reviewing}
//                             onClick={() => handleReview("approve")}
//                             className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
//                           >
//                             {reviewing ? "Submitting..." : "Approve"}
//                           </button>
//                           <button
//                             disabled={reviewing}
//                             onClick={() => handleReview("reject")}
//                             className="flex-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-60"
//                           >
//                             {reviewing ? "Submitting..." : "Reject"}
//                           </button>
//                         </div>
//                       </div>
//                     )}

//                     {selectedDetail.status === "APPROVED" && (
//                       <p className="mt-3 text-xs text-emerald-700">
//                         This document has been approved.
//                       </p>
//                     )}

//                     {selectedDetail.status === "REJECTED" && (
//                       <p className="mt-3 text-xs text-red-600">
//                         This document was rejected.
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatusPill({ status }) {
//   let color =
//     status === "APPROVED"
//       ? "bg-emerald-50 text-emerald-700 border-emerald-100"
//       : status === "REJECTED"
//       ? "bg-red-50 text-red-700 border-red-100"
//       : status === "PENDING"
//       ? "bg-amber-50 text-amber-700 border-amber-100"
//       : "bg-slate-50 text-slate-600 border-slate-100";

//   return (
//     <span
//       className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${color}`}
//     >
//       {status}
//     </span>
//   );
// }

// function InfoRow({ label, value }) {
//   return (
//     <div>
//       <div className="text-[11px] font-medium text-slate-500">{label}</div>
//       <div className="text-xs text-slate-800 mt-0.5">{value}</div>
//     </div>
//   );
// }























import { useEffect, useState, useCallback } from "react";
import {
  fetchAdminVerifications,
  fetchAdminVerificationDetail,
  reviewAdminVerification,
} from "../../interviewerProfileApi";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  Shield, Filter, RefreshCw, FileText, Eye, X,
  CheckCircle, XCircle, AlertCircle, Loader2,
  Calendar, User, Hash, ExternalLink, Download,
  FileCheck, Clock, AlertTriangle
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending Review" },
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
  const [showModal, setShowModal] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminVerifications(statusFilter || undefined);
      setVerifications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load verifications.");
      setVerifications([]);
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
    setShowModal(true);
    loadDetail(id);
  };

  const closeModal = () => {
    setShowModal(false);
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
      await loadList();
      await loadDetail(selectedId);
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

  // Count stats
  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'PENDING').length,
    approved: verifications.filter(v => v.status === 'APPROVED').length,
    rejected: verifications.filter(v => v.status === 'REJECTED').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Document Verification
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Review government ID documents submitted by interviewers
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Submissions</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Pending Review</span>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Approved</span>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Rejected</span>
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={loadList}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
                  <p className="text-gray-600">Loading verifications...</p>
                </div>
              ) : !Array.isArray(verifications) || verifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    No verifications found
                  </p>
                  <p className="text-gray-600">
                    No documents match the selected filter
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Interviewer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Document Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {verifications.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                            #{v.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-xs">
                                {v.user_email?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {v.user_email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{v.document_type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusPill status={v.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {v.submitted_at
                              ? new Date(v.submitted_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleRowClick(v.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetail || !selectedDetail ? (
              <div className="p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
                <p className="text-gray-600">Loading verification details...</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Verification #{selectedDetail.id}
                      </h2>
                      <p className="text-sm text-gray-600">{selectedDetail.user_email}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group"
                  >
                    <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left - Details */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Document Info */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Document Information</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <InfoRow
                            icon={<FileCheck className="w-4 h-4 text-gray-500" />}
                            label="Document Type"
                            value={selectedDetail.document_type}
                          />
                          <InfoRow
                            icon={<Hash className="w-4 h-4 text-gray-500" />}
                            label="Document Number"
                            value={selectedDetail.document_number || "Not provided"}
                          />
                          <InfoRow
                            icon={<User className="w-4 h-4 text-gray-500" />}
                            label="Interviewer Email"
                            value={selectedDetail.user_email}
                          />
                          <InfoRow
                            icon={<div className="w-4 h-4" />}
                            label="Status"
                            value={<StatusPill status={selectedDetail.status} />}
                          />
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Timeline</h3>
                        <div className="space-y-4">
                          <TimelineItem
                            icon={<Calendar className="w-4 h-4" />}
                            label="Submitted"
                            value={selectedDetail.submitted_at
                              ? new Date(selectedDetail.submitted_at).toLocaleString()
                              : "—"}
                          />
                          {selectedDetail.reviewed_at && (
                            <TimelineItem
                              icon={<CheckCircle className="w-4 h-4" />}
                              label="Reviewed"
                              value={`${new Date(selectedDetail.reviewed_at).toLocaleString()}${
                                selectedDetail.reviewed_by ? ` by ${selectedDetail.reviewed_by}` : ''
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {selectedDetail.rejection_reason && (
                        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <h3 className="text-sm font-bold text-red-800">Rejection Reason</h3>
                          </div>
                          <p className="text-sm text-red-700 leading-relaxed whitespace-pre-wrap">
                            {selectedDetail.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right - Document & Actions */}
                    <div className="space-y-6">
                      {/* Document File */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Document File</h3>
                        {selectedDetail.document_file ? (
                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">File stored securely</p>
                              <code className="block text-xs text-gray-800 break-all font-mono bg-gray-50 p-2 rounded">
                                {selectedDetail.document_file.split('/').pop()}
                              </code>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={openDocument}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open File
                              </button>
                              <a
                                href={selectedDetail.document_file}
                                download
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No document uploaded</p>
                        )}
                      </div>

                      {/* Review Actions */}
                      {selectedDetail.status === "PENDING" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-sm font-bold text-gray-800 mb-4">Review Actions</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason (required if rejecting)
                              </label>
                              <textarea
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700 resize-none"
                                placeholder="Provide a reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                disabled={reviewing}
                                onClick={() => handleReview("approve")}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                              >
                                {reviewing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>
                              <button
                                disabled={reviewing}
                                onClick={() => handleReview("reject")}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status Messages */}
                      {selectedDetail.status === "APPROVED" && (
                        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="text-sm font-bold text-green-800">Approved</h3>
                          </div>
                          <p className="text-sm text-green-700">
                            This document has been verified and approved.
                          </p>
                        </div>
                      )}

                      {selectedDetail.status === "REJECTED" && (
                        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <h3 className="text-sm font-bold text-red-800">Rejected</h3>
                          </div>
                          <p className="text-sm text-red-700">
                            This document was rejected during review.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatusPill({ status }) {
  const config = {
    APPROVED: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: <CheckCircle className="w-3 h-3" />
    },
    REJECTED: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <XCircle className="w-3 h-3" />
    },
    PENDING: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-3 h-3" />
    },
    NOT_SUBMITTED: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: <AlertCircle className="w-3 h-3" />
    }
  };

  const style = config[status] || config.NOT_SUBMITTED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {style.icon}
      {status}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function TimelineItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}