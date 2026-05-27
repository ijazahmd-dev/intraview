// src/features/adminSessions/components/RiskInsightsPanel.jsx
/**
 * Section 6 — Risk Insights Panel
 * Shows high-risk sessions at a glance for quick admin investigation.
 */

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { AlertTriangle, Eye } from "lucide-react";
import { setSelectedSession } from "../redux/adminSessionsSlice";
import { StatusBadge, RiskBadge } from "./StatusBadge";
import { fmtDateTime } from "../utils/sessionUtils";

function RiskReason({ booking }) {
    const reasons = [];
    if (booking.reschedule_count >= 2) reasons.push(`${booking.reschedule_count}× rescheduled`);
    if (booking.has_report) reasons.push("Report filed");
    if (booking.payment_status === "REFUNDED_TO_CANDIDATE") reasons.push("Refund issued");
    if (booking.is_no_show) reasons.push("No-show");
    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {reasons.map((r) => (
                <span key={r} className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-medium">
                    {r}
                </span>
            ))}
        </div>
    );
}

export default function RiskInsightsPanel() {
    const dispatch = useDispatch();
    const { data, status } = useSelector((s) => s.adminSessions.sessions);

    const risky = (data?.results || []).filter((b) => b.high_risk_session);

    if (status !== "succeeded" || risky.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-red-100 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50/60 border-b border-red-100">
                <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-red-700">Risk Insights</h3>
                    <p className="text-[10px] text-red-400">{risky.length} session{risky.length !== 1 ? "s" : ""} require investigation</p>
                </div>
            </div>

            {/* Risk rows */}
            <div className="divide-y divide-slate-50">
                {risky.map((b, i) => (
                    <motion.div
                        key={b.booking_id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-red-50/30 transition-colors group"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-slate-700">#{b.booking_id}</span>
                                <StatusBadge status={b.status} size="xs" />
                                <RiskBadge size="xs" />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {b.candidate_name} → {b.interviewer_name}
                            </p>
                            <p className="text-[10px] text-slate-400">{fmtDateTime(b.scheduled_start)}</p>
                            <RiskReason booking={b} />
                        </div>
                        <button
                            onClick={() => dispatch(setSelectedSession(b.booking_id))}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium
                         text-indigo-600 bg-indigo-50 border border-indigo-100
                         hover:bg-indigo-100 transition-colors flex-shrink-0"
                        >
                            <Eye className="w-3 h-3" />
                            Inspect
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
