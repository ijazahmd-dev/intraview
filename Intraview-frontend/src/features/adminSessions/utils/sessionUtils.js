// src/features/adminSessions/utils/sessionUtils.js
/**
 * Shared formatting helpers for the Admin Sessions feature.
 * Keeps UI components clean — no formatting logic in JSX.
 */

/** Status → { label, color classes } mapping */
export const STATUS_META = {
    PENDING: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
    CONFIRMED: { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" },
    LIVE: { label: "Live", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
    COMPLETED: { label: "Completed", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
    CANCELLED: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-400" },
    CANCELLED_BY_CANDIDATE: { label: "Cancelled by Candidate", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-400" },
    CANCELLED_BY_INTERVIEWER: { label: "Cancelled by Interviewer", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-400" },
    CANDIDATE_NO_SHOW: { label: "Candidate No-Show", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-400" },
    INTERVIEWER_NO_SHOW: { label: "Interviewer No-Show", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-400" },
};

export const PAYMENT_META = {
    PENDING: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    PAID_TO_INTERVIEWER: { label: "Paid to Interviewer", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    REFUNDED_TO_CANDIDATE: { label: "Refunded", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    AWAITING_EVALUATION: { label: "Awaiting Evaluation", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

export const RESCHEDULE_META = {
    NONE: { label: "None", bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" },
    PENDING: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    ACCEPTED: { label: "Accepted", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    REJECTED: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export function getStatusMeta(status) {
    return STATUS_META[status] || { label: status, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
}
export function getPaymentMeta(status) {
    return PAYMENT_META[status] || { label: status, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
}
export function getRescheduleMeta(status) {
    return RESCHEDULE_META[status] || { label: status, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
}

/** Format ISO datetime string to readable short format */
export function fmtDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
        });
    } catch { return iso; }
}

export function fmtDateTime(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
}

export function fmtDuration(minutes) {
    if (!minutes && minutes !== 0) return "—";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Initials avatar from a name string */
export function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}
