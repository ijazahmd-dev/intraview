// // src/features/issues/admin/components/AdminActionModal.jsx







// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { X, Loader2, ShieldAlert, AlertTriangle } from "lucide-react";

// import {
//   applyAdminIssueAction,
//   closeAdminActionModal,
//   selectAdminActionModal,
//   selectAdminActionLoading,
//   selectAdminActionError,
//   selectAdminActionSuccess,
//   clearAdminActionState,
// } from "../../slices/adminIssuesSlice";

// import {
//   ADMIN_ACTIONS,
//   ADMIN_ACTION_MAP,
//   ADMIN_ACTION_TYPES,
//   REFUND_MODE,
// } from "../../constants/issueConstants";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const extractError = (error) => {
//   if (!error) return null;
//   if (typeof error === "string") return error;
//   if (error.detail) return error.detail;
//   return Object.entries(error)
//     .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
//     .join(" | ");
// };

// // ─── Action Option Button ─────────────────────────────────────────────────────

// const ActionOption = ({ value, label, selected, onClick, destructive }) => (
//   <button
//     type="button"
//     onClick={() => onClick(value)}
//     className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${
//       selected
//         ? destructive
//           ? "border-red-400 bg-red-50 text-red-700"
//           : "border-blue-400 bg-blue-50 text-blue-700"
//         : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
//     }`}
//   >
//     {label}
//   </button>
// );

// // ─── Component ────────────────────────────────────────────────────────────────

// /**
//  * AdminActionModal
//  *
//  * Opens via: dispatch(openAdminActionModal(issueId))
//  * Self-closes on success via Redux state.
//  *
//  * Props:
//  *   onSuccess?: () => void
//  */
// const AdminActionModal = ({ onSuccess }) => {
//   const dispatch = useDispatch();

//   const modal   = useSelector(selectAdminActionModal);
//   const loading = useSelector(selectAdminActionLoading);
//   const error   = useSelector(selectAdminActionError);
//   const success = useSelector(selectAdminActionSuccess);

//   const [actionType,  setActionType]  = useState("");
//   const [refundMode,  setRefundMode]  = useState(REFUND_MODE.AMOUNT);
//   const [amount,      setAmount]      = useState("");
//   const [percent,     setPercent]     = useState("");
//   const [confirmed,   setConfirmed]   = useState(false);

//   // ── Reset on open ──
//   useEffect(() => {
//     if (modal.open) {
//       setActionType("");
//       setRefundMode(REFUND_MODE.AMOUNT);
//       setAmount("");
//       setPercent("");
//       setConfirmed(false);
//       dispatch(clearAdminActionState());
//     }
//   }, [modal.open]);

//   // ── Fire callback on success ──
//   useEffect(() => {
//     if (success) onSuccess?.();
//   }, [success]);

//   // ── Derived from ADMIN_ACTION_MAP ──
//   const selectedAction = ADMIN_ACTION_MAP[actionType] ?? null;
//   const isDestructive  = selectedAction?.danger ?? false;
//   const needsAmount    = selectedAction?.needsAmount ?? false;
//   const needsConfirm   = isDestructive;

//   // ── canSubmit ──
//   const amountValid =
//     refundMode === REFUND_MODE.AMOUNT
//       ? amount && parseInt(amount, 10) > 0
//       : percent && parseInt(percent, 10) > 0 && parseInt(percent, 10) <= 100;

//   const canSubmit =
//     !!actionType &&
//     (!needsAmount || amountValid) &&
//     (!needsConfirm || confirmed);

//   // ── Handlers ──
//   const handleClose = () => {
//     if (loading) return;
//     dispatch(closeAdminActionModal());
//   };

//   const handleActionSelect = (value) => {
//     setActionType(value);
//     // Reset amount fields when switching action
//     setAmount("");
//     setPercent("");
//     setConfirmed(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!actionType || !canSubmit) return;

//     const payload = { action_type: actionType };

//     if (needsAmount) {
//       if (refundMode === REFUND_MODE.AMOUNT && amount) {
//         payload.amount = parseInt(amount, 10);
//       } else if (refundMode === REFUND_MODE.PERCENT && percent) {
//         payload.percent = parseInt(percent, 10);
//       }
//     }

//     dispatch(applyAdminIssueAction({ issueId: modal.issueId, payload }));
//   };

//   const errorMessage = extractError(error);

//   if (!modal.open) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
//       onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
//     >
//       <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

//         {/* ── Header ── */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             <span className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
//               <ShieldAlert className="w-5 h-5 text-red-500" />
//             </span>
//             <div>
//               <h2 className="text-base font-semibold text-gray-900">
//                 Apply Admin Action
//               </h2>
//               <p className="text-xs text-gray-500 mt-0.5">
//                 Issue #{modal.issueId}
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

//         {/* ── Body ── */}
//         <form
//           onSubmit={handleSubmit}
//           className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
//         >

//           {/* Action selection */}
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-700">
//               Select Action <span className="text-red-500">*</span>
//             </p>
//             <div className="space-y-2">
//               {ADMIN_ACTIONS.map((action) => (
//                 <ActionOption
//                   key={action.value}
//                   value={action.value}
//                   label={action.label}
//                   selected={actionType === action.value}
//                   onClick={handleActionSelect}
//                   destructive={action.danger}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Description of selected action */}
//           {selectedAction && (
//             <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
//               {selectedAction.description}
//             </div>
//           )}

//           {/* Partial refund — amount/percent toggle */}
//           {needsAmount && (
//             <div className="space-y-3">

//               {/* Mode toggle */}
//               <div className="flex rounded-lg border border-gray-200 overflow-hidden">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setRefundMode(REFUND_MODE.AMOUNT);
//                     setPercent("");
//                   }}
//                   className={`flex-1 py-2 text-sm font-medium transition ${
//                     refundMode === REFUND_MODE.AMOUNT
//                       ? "bg-blue-600 text-white"
//                       : "text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   Token Amount
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setRefundMode(REFUND_MODE.PERCENT);
//                     setAmount("");
//                   }}
//                   className={`flex-1 py-2 text-sm font-medium transition ${
//                     refundMode === REFUND_MODE.PERCENT
//                       ? "bg-blue-600 text-white"
//                       : "text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   Percentage
//                 </button>
//               </div>

//               {/* Token amount input */}
//               {refundMode === REFUND_MODE.AMOUNT && (
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Tokens to Refund <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     min={1}
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     placeholder="e.g. 50"
//                     className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                   />
//                   <p className="text-xs text-gray-400">
//                     Cannot exceed the session token cost.
//                   </p>
//                 </div>
//               )}

//               {/* Percentage input */}
//               {refundMode === REFUND_MODE.PERCENT && (
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Percentage (1–100) <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       min={1}
//                       max={100}
//                       value={percent}
//                       onChange={(e) => setPercent(e.target.value)}
//                       placeholder="e.g. 50"
//                       className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                     />
//                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
//                       %
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-400">
//                     The computed token amount will be rounded down to the nearest whole token.
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Destructive confirmation */}
//           {isDestructive && (
//             <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 space-y-3">
//               <div className="flex items-start gap-2 text-sm text-red-700">
//                 <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                 <span>
//                   This is a <strong>destructive action</strong> and cannot be
//                   easily undone. Please confirm before proceeding.
//                 </span>
//               </div>
//               <label className="flex items-center gap-2 text-sm text-red-700 cursor-pointer select-none">
//                 <input
//                   type="checkbox"
//                   checked={confirmed}
//                   onChange={(e) => setConfirmed(e.target.checked)}
//                   className="w-4 h-4 accent-red-600"
//                 />
//                 I understand and confirm this action.
//               </label>
//             </div>
//           )}

//           {/* Backend error */}
//           {errorMessage && (
//             <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
//               {errorMessage}
//             </div>
//           )}
//         </form>

//         {/* ── Footer ── */}
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
//             disabled={loading || !canSubmit}
//             className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
//               isDestructive
//                 ? "bg-red-600 hover:bg-red-700"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Applying...
//               </>
//             ) : (
//               "Apply Action"
//             )}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AdminActionModal;



























// src/features/issues/admin/components/AdminActionModal.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Loader2, ShieldAlert, AlertTriangle } from "lucide-react";

import {
  applyAdminIssueAction,
  closeAdminActionModal,
  selectAdminActionModal,
  selectAdminActionLoading,
  selectAdminActionError,
  selectAdminActionSuccess,
  clearAdminActionState,
} from "../../slices/adminIssuesSlice";

import {
  ADMIN_ACTIONS_FOR_CANDIDATE_REPORT,
  ADMIN_ACTIONS_FOR_INTERVIEWER_REPORT,
  ADMIN_ACTION_MAP,
  ADMIN_ACTION_TYPES,
  REFUND_MODE,
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

// ─── Action Option Button ─────────────────────────────────────────────────────

const ActionOption = ({ value, label, selected, onClick, destructive }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${
      selected
        ? destructive
          ? "border-red-400 bg-red-50 text-red-700"
          : "border-blue-400 bg-blue-50 text-blue-700"
        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminActionModal
 *
 * Opens via: dispatch(openAdminActionModal(issueId))
 * Self-closes on success via Redux state.
 *
 * Props:
 *   onSuccess?: () => void
 */
const AdminActionModal = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const modal   = useSelector(selectAdminActionModal);
  const loading = useSelector(selectAdminActionLoading);
  const error   = useSelector(selectAdminActionError);
  const success = useSelector(selectAdminActionSuccess);

  const { issueId, reporterRole, againstRole } = modal || {};

  // Decide which set of actions to show
  const isCandidateReporting = reporterRole === "user";
  const isInterviewerReporting = reporterRole === "interviewer";

  const ACTIONS = isCandidateReporting
    ? ADMIN_ACTIONS_FOR_CANDIDATE_REPORT
    : ADMIN_ACTIONS_FOR_INTERVIEWER_REPORT;

  const [actionType, setActionType]   = useState("");
  const [refundMode, setRefundMode]   = useState(REFUND_MODE.AMOUNT);
  const [amount,     setAmount]       = useState("");
  const [percent,    setPercent]      = useState("");
  const [confirmed,  setConfirmed]    = useState(false);

  // ── Reset on open ──
  useEffect(() => {
    if (modal.open) {
      setActionType("");
      setRefundMode(REFUND_MODE.AMOUNT);
      setAmount("");
      setPercent("");
      setConfirmed(false);
      dispatch(clearAdminActionState());
    }
  }, [modal.open, dispatch]);

  // ── Fire callback on success, then reset success flag ──
  useEffect(() => {
    if (success) {
      onSuccess?.();
      // Important: clear success/loading/error so this effect only runs once per action
      dispatch(clearAdminActionState());
    }
  }, [success, dispatch, onSuccess]);

  // ── Derived from ADMIN_ACTION_MAP ──
  const selectedAction = ADMIN_ACTION_MAP[actionType] ?? null;
  const isDestructive  = selectedAction?.danger ?? false;
  const needsAmount    = selectedAction?.needsAmount ?? false;
  const needsConfirm   = isDestructive;

  // ── canSubmit ──
  const amountValid =
    refundMode === REFUND_MODE.AMOUNT
      ? amount && parseInt(amount, 10) > 0
      : percent && parseInt(percent, 10) > 0 && parseInt(percent, 10) <= 100;

  const canSubmit =
    !!actionType &&
    (!needsAmount || amountValid) &&
    (!needsConfirm || confirmed);

  // ── Handlers ──
  const handleClose = () => {
    if (loading) return;
    dispatch(closeAdminActionModal());
  };

  const handleActionSelect = (value) => {
    setActionType(value);
    // Reset amount fields when switching action
    setAmount("");
    setPercent("");
    setConfirmed(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!actionType || !canSubmit) return;

    const payload = { action_type: actionType };

    if (needsAmount) {
      if (refundMode === REFUND_MODE.AMOUNT && amount) {
        payload.amount = parseInt(amount, 10);
      } else if (refundMode === REFUND_MODE.PERCENT && percent) {
        payload.percent = parseInt(percent, 10);
      }
    }

    dispatch(applyAdminIssueAction({ issueId, payload }));
  };

  const errorMessage = extractError(error);

  if (!modal.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Apply Admin Action
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Issue #{modal.issueId}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Action selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Select Action <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {ACTIONS.map((action) => (
                <ActionOption
                  key={action.value}
                  value={action.value}
                  label={action.label}
                  selected={actionType === action.value}
                  onClick={handleActionSelect}
                  destructive={action.danger}
                />
              ))}
            </div>
          </div>

          {/* Description of selected action */}
          {selectedAction && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
              {selectedAction.description}
            </div>
          )}

          {/* Partial refund — amount/percent toggle */}
          {needsAmount && (
            <div className="space-y-3">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setRefundMode(REFUND_MODE.AMOUNT);
                    setPercent("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition ${
                    refundMode === REFUND_MODE.AMOUNT
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Token Amount
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRefundMode(REFUND_MODE.PERCENT);
                    setAmount("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition ${
                    refundMode === REFUND_MODE.PERCENT
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Percentage
                </button>
              </div>

              {/* Token amount input */}
              {refundMode === REFUND_MODE.AMOUNT && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Tokens to Refund <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <p className="text-xs text-gray-400">
                    Cannot exceed the session token cost.
                  </p>
                </div>
              )}

              {/* Percentage input */}
              {refundMode === REFUND_MODE.PERCENT && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Percentage (1–100) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={percent}
                      onChange={(e) => setPercent(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    The computed token amount will be rounded down to the nearest whole token.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Destructive confirmation */}
          {isDestructive && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 space-y-3">
              <div className="flex items-start gap-2 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  This is a <strong>destructive action</strong> and cannot be
                  easily undone. Please confirm before proceeding.
                </span>
              </div>
              <label className="flex items-center gap-2 text-sm text-red-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                I understand and confirm this action.
              </label>
            </div>
          )}

          {/* Backend error */}
          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply Action"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActionModal;