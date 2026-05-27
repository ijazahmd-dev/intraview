// src/features/adminSessions/components/StatusBadge.jsx
/**
 * Reusable badge for session status, payment status, and reschedule status.
 */

import { getStatusMeta, getPaymentMeta, getRescheduleMeta } from "../utils/sessionUtils";

export function StatusBadge({ status, variant = "status", size = "sm" }) {
    const meta =
        variant === "payment" ? getPaymentMeta(status) :
            variant === "reschedule" ? getRescheduleMeta(status) :
                getStatusMeta(status);

    const sizeClass = size === "xs"
        ? "text-[10px] px-1.5 py-0.5"
        : "text-xs px-2 py-0.5";

    return (
        <span
            className={`inline-flex items-center gap-1 font-medium rounded-full border
                  ${meta.bg} ${meta.text} ${meta.border} ${sizeClass}`}
        >
            {variant === "status" && meta.dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} flex-shrink-0`} />
            )}
            {meta.label}
        </span>
    );
}

export function RiskBadge({ size = "sm" }) {
    const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
    return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full border
                      bg-red-50 text-red-700 border-red-200 ${sizeClass}`}>
            ⚠ Risk
        </span>
    );
}

export function BoolBadge({ value, trueLabel = "Yes", falseLabel = "No" }) {
    return value ? (
        <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 font-medium
                     rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ {trueLabel}
        </span>
    ) : (
        <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 font-medium
                     rounded-full bg-slate-50 text-slate-400 border border-slate-200">
            — {falseLabel}
        </span>
    );
}
