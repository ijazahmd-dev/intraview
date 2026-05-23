// // src/features/issues/components/RaiseIssueModal.jsx




// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { X, AlertTriangle, Loader2 } from "lucide-react";

// import { ISSUE_TYPE_OPTIONS } from "../constants/issueConstants";

// // Candidate
// import {
//   raiseIssueAsCandidate,
//   closeRaiseModal,
//   selectRaiseModal,
//   selectRaiseLoading,
//   selectRaiseError,
//   selectRaiseSuccess,
//   clearRaiseState,
// } from "../slices/issuesSlice";

// // Interviewer
// import {
//   raiseIssueAsInterviewer,
//   closeInterviewerRaiseModal,
//   selectInterviewerRaiseModal,
//   selectInterviewerRaiseLoading,
//   selectInterviewerRaiseError,
//   selectInterviewerRaiseSuccess,
//   clearInterviewerRaiseState,
// } from "../slices/interviewerIssuesSlice";

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const extractErrorMessage = (error) => {
//   if (!error) return null;
//   if (typeof error === "string") return error;
//   if (error.detail) return error.detail;
//   // Field-level errors
//   const fieldErrors = Object.entries(error)
//     .map(([field, msgs]) => {
//       const msg = Array.isArray(msgs) ? msgs.join(", ") : msgs;
//       return `${field}: ${msg}`;
//     })
//     .join(" | ");
//   return fieldErrors || "Something went wrong. Please try again.";
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// /**
//  * RaiseIssueModal — shared for candidate and interviewer.
//  *
//  * Props:
//  *   role: "candidate" | "interviewer"
//  *   onSuccess?: () => void  ← optional callback after successful raise
//  *
//  * Reads open state + bookingId from Redux (openRaiseModal / openInterviewerRaiseModal).
//  */
// const RaiseIssueModal = ({ role = "candidate", onSuccess }) => {
//   const dispatch = useDispatch();

//   // ── Role-specific selectors ──
//   const isCandidate = role === "candidate";

//   const modal = useSelector(
//     isCandidate ? selectRaiseModal : selectInterviewerRaiseModal
//   );
//   const loading = useSelector(
//     isCandidate ? selectRaiseLoading : selectInterviewerRaiseLoading
//   );
//   const error = useSelector(
//     isCandidate ? selectRaiseError : selectInterviewerRaiseError
//   );
//   const success = useSelector(
//     isCandidate ? selectRaiseSuccess : selectInterviewerRaiseSuccess
//   );

//   // ── Form state ──
//   const [issueType, setIssueType] = useState("");
//   const [description, setDescription] = useState("");
//   const [touched, setTouched] = useState(false);

//   // ── Reset form when modal opens ──
//   useEffect(() => {
//     if (modal.open) {
//       setIssueType("");
//       setDescription("");
//       setTouched(false);
//       if (isCandidate) {
//         dispatch(clearRaiseState());
//       } else {
//         dispatch(clearInterviewerRaiseState());
//       }
//     }
//   }, [modal.open]);

//   // ── Close on success + fire callback ──
//   useEffect(() => {
//     if (success) {
//       onSuccess?.();
//     }
//   }, [success]);

//   // ── Handlers ──
//   const handleClose = () => {
//     if (loading) return;
//     if (isCandidate) {
//       dispatch(closeRaiseModal());
//     } else {
//       dispatch(closeInterviewerRaiseModal());
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setTouched(true);

//     if (!issueType || !description.trim()) return;

//     const thunkArgs = {
//       bookingId: modal.bookingId,
//       issue_type: issueType,
//       description: description.trim(),
//     };

//     if (isCandidate) {
//       dispatch(raiseIssueAsCandidate(thunkArgs));
//     } else {
//       dispatch(raiseIssueAsInterviewer(thunkArgs));
//     }
//   };

//   const errorMessage = extractErrorMessage(error);
//   const descriptionLength = description.length;
//   const descriptionMax = 2000;

//   if (!modal.open) return null;

//   return (
//     // Backdrop
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) handleClose();
//       }}
//     >
//       {/* Modal panel */}
//       <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

//         {/* Header */}
//         <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-50">
//               <AlertTriangle className="w-5 h-5 text-orange-500" />
//             </span>
//             <div>
//               <h2 className="text-base font-semibold text-gray-900">
//                 Report an Issue
//               </h2>
//               <p className="text-xs text-gray-500 mt-0.5">
//                 Booking #{modal.bookingId}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={handleClose}
//             disabled={loading}
//             className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
//             aria-label="Close modal"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Body */}
//         <form
//           onSubmit={handleSubmit}
//           className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
//         >
//           {/* Info note */}
//           <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
//             Issues can be raised within <strong>48 hours</strong> of the interview ending.
//             Our team will review and respond to you.
//           </div>

//           {/* Issue Type */}
//           <div className="space-y-1.5">
//             <label
//               htmlFor="issue_type"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Issue Type <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="issue_type"
//               value={issueType}
//               onChange={(e) => setIssueType(e.target.value)}
//               disabled={loading}
//               className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed ${
//                 touched && !issueType
//                   ? "border-red-400 focus:ring-red-400"
//                   : "border-gray-200"
//               }`}
//             >
//               <option value="">Select an issue type...</option>
//               {ISSUE_TYPE_OPTIONS.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//             {touched && !issueType && (
//               <p className="text-xs text-red-500 mt-1">
//                 Please select an issue type.
//               </p>
//             )}
//           </div>

//           {/* Description */}
//           <div className="space-y-1.5">
//             <label
//               htmlFor="description"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Description <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               id="description"
//               rows={5}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               disabled={loading}
//               placeholder="Describe what happened in detail. Include timestamps if possible (e.g. 'Interviewer joined 5 minutes late...')."
//               className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed ${
//                 touched && !description.trim()
//                   ? "border-red-400 focus:ring-red-400"
//                   : "border-gray-200"
//               }`}
//             />
//             <div className="flex items-center justify-between mt-1">
//               {touched && !description.trim() ? (
//                 <p className="text-xs text-red-500">
//                   Please provide a description.
//                 </p>
//               ) : (
//                 <span />
//               )}
//               <span
//                 className={`text-xs ml-auto ${
//                   descriptionLength > descriptionMax
//                     ? "text-red-500"
//                     : "text-gray-400"
//                 }`}
//               >
//                 {descriptionLength}/{descriptionMax}
//               </span>
//             </div>
//           </div>

//           {/* Backend error */}
//           {errorMessage && (
//             <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
//               {errorMessage}
//             </div>
//           )}
//         </form>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
//           <button
//             type="button"
//             onClick={handleClose}
//             disabled={loading}
//             className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading || descriptionLength > descriptionMax}
//             className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Submitting...
//               </>
//             ) : (
//               "Submit Issue"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RaiseIssueModal;


















// // src/features/issues/components/RaiseIssueModal.jsx




import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

// Candidate
import {
  raiseIssueAsCandidate,
  clearRaiseState,
  selectRaiseLoading,
  selectRaiseError,
  selectRaiseSuccess,
} from "../slices/issuesSlice";

// Interviewer
import {
  raiseIssueAsInterviewer,
  clearInterviewerRaiseState,
  selectInterviewerRaiseLoading,
  selectInterviewerRaiseError,
  selectInterviewerRaiseSuccess,
} from "../slices/interviewerIssuesSlice";

import { ISSUE_TYPE_OPTIONS_CANDIDATE, ISSUE_TYPE_OPTIONS_INTERVIEWER } from "../constants/issueConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Prop interface:
//   bookingId  — the booking to raise the issue against
//   open       — boolean
//   onClose    — () => void
//   role       — "candidate" | "interviewer"  (default: "candidate")
// ─────────────────────────────────────────────────────────────────────────────

const RaiseIssueModal = ({ bookingId, open, onClose, role = "candidate" }) => {
  const dispatch = useDispatch();

  const isInterviewer = role === "interviewer";

  // ── Select role-appropriate slice state ──
  const candidateLoading = useSelector(selectRaiseLoading);
  const candidateError   = useSelector(selectRaiseError);
  const candidateSuccess = useSelector(selectRaiseSuccess);

  const interviewerLoading = useSelector(selectInterviewerRaiseLoading);
  const interviewerError   = useSelector(selectInterviewerRaiseError);
  const interviewerSuccess = useSelector(selectInterviewerRaiseSuccess);

  const loading = isInterviewer ? interviewerLoading : candidateLoading;
  const error   = isInterviewer ? interviewerError   : candidateError;
  const success = isInterviewer ? interviewerSuccess : candidateSuccess;

  const issueTypeOptions = isInterviewer
    ? ISSUE_TYPE_OPTIONS_INTERVIEWER
    : ISSUE_TYPE_OPTIONS_CANDIDATE;

  // ── Local form state ──
  const [issueType,   setIssueType]   = useState("");
  const [description, setDescription] = useState("");

  // ── Reset when modal opens ──
  useEffect(() => {
    if (open) {
      setIssueType("");
      setDescription("");
      if (isInterviewer) dispatch(clearInterviewerRaiseState());
      else               dispatch(clearRaiseState());
    }
  }, [open, dispatch, isInterviewer]);

  // ── Auto-close after success ──
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        handleClose();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ── Prevent background scroll ──
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    if (isInterviewer) dispatch(clearInterviewerRaiseState());
    else               dispatch(clearRaiseState());
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueType || !description.trim()) return;

    if (isInterviewer) {
      dispatch(raiseIssueAsInterviewer({ bookingId, issue_type: issueType, description: description.trim() }));
    } else {
      dispatch(raiseIssueAsCandidate({ bookingId, issue_type: issueType, description: description.trim() }));
    }
  };

  const extractError = (err) => {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (err.detail) return err.detail;
    return Object.entries(err)
      .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
      .join(" · ");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">Report an Issue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Booking #{bookingId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Success State ── */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <span className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </span>
            <h3 className="text-base font-bold text-gray-900 mb-1">Issue Submitted</h3>
            <p className="text-sm text-gray-500">
              Our team will review your report and take action within 1–2 business days.
            </p>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Issue Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {issueTypeOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      issueType === opt.value
                        ? "border-orange-400 bg-orange-50 text-orange-800"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="issue_type"
                      value={opt.value}
                      checked={issueType === opt.value}
                      onChange={() => setIssueType(opt.value)}
                      className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      issueType === opt.value ? "border-orange-500" : "border-gray-300"
                    }`}>
                      {issueType === opt.value && (
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Please describe the issue in detail — what happened, when, and how it affected you..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400 transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 text-right">
                {description.length} / 1000
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {extractError(error)}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !issueType || !description.trim()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default RaiseIssueModal;