// src/features/adminSessions/components/SessionKPICards.jsx
/**
 * Section 1 — KPI Overview
 * 13 executive-grade metric cards in a responsive grid.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
    Calendar, CheckCircle, Clock, TrendingUp, TrendingDown,
    AlertTriangle, Users, UserX, RefreshCw, Activity,
    XCircle, Loader2, BarChart3,
} from "lucide-react";
import { fetchSessionKPIs } from "../redux/adminSessionsSlice";

const KPI_DEFS = [
    { key: "total_sessions", label: "Total Sessions", icon: BarChart3, color: "from-indigo-500 to-violet-600", bg: "bg-indigo-50", text: "text-indigo-700" },
    { key: "pending_sessions", label: "Pending", icon: Clock, color: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-700" },
    { key: "confirmed_sessions", label: "Confirmed", icon: CheckCircle, color: "from-blue-500 to-cyan-500", bg: "bg-blue-50", text: "text-blue-700" },
    { key: "live_sessions", label: "Live Now", icon: Activity, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    { key: "completed_sessions", label: "Completed", icon: CheckCircle, color: "from-slate-500 to-slate-600", bg: "bg-slate-50", text: "text-slate-700" },
    { key: "cancelled_sessions", label: "Cancelled", icon: XCircle, color: "from-red-500 to-rose-600", bg: "bg-red-50", text: "text-red-700" },
    { key: "candidate_no_show_count", label: "Candidate No-Show", icon: UserX, color: "from-orange-500 to-amber-600", bg: "bg-orange-50", text: "text-orange-700" },
    { key: "interviewer_no_show_count", label: "Interviewer No-Show", icon: UserX, color: "from-orange-500 to-amber-600", bg: "bg-orange-50", text: "text-orange-700" },
    { key: "rescheduled_sessions", label: "Rescheduled", icon: RefreshCw, color: "from-purple-500 to-fuchsia-600", bg: "bg-purple-50", text: "text-purple-700" },
    { key: "today_sessions", label: "Today", icon: Calendar, color: "from-sky-500 to-blue-600", bg: "bg-sky-50", text: "text-sky-700" },
    { key: "weekly_sessions", label: "This Week", icon: Users, color: "from-teal-500 to-emerald-600", bg: "bg-teal-50", text: "text-teal-700" },
    { key: "completion_rate", label: "Completion Rate", icon: TrendingUp, color: "from-green-500 to-emerald-600", bg: "bg-green-50", text: "text-green-700", isRate: true },
    { key: "cancellation_rate", label: "Cancellation Rate", icon: TrendingDown, color: "from-red-400 to-rose-500", bg: "bg-red-50", text: "text-red-700", isRate: true },
];

function KPISkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 mb-3" />
                    <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
                    <div className="h-6 w-12 bg-slate-200 rounded" />
                </div>
            ))}
        </div>
    );
}

export default function SessionKPICards() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminSessions.kpis);

    useEffect(() => {
        if (status === "idle") dispatch(fetchSessionKPIs());
    }, [dispatch, status]);

    if (status === "loading" || status === "idle") return <KPISkeleton />;
    if (status === "failed") {
        return (
            <div className="text-center py-8 text-red-500 text-sm">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
                {error || "Failed to load KPIs"}
                <button
                    onClick={() => dispatch(fetchSessionKPIs())}
                    className="ml-3 text-indigo-600 underline"
                >Retry</button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {KPI_DEFS.map((def, i) => {
                const Icon = def.icon;
                const raw = data?.[def.key] ?? 0;
                const display = def.isRate ? `${raw}%` : raw.toLocaleString();
                return (
                    <motion.div
                        key={def.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.35 }}
                        whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10)" }}
                        className="bg-white rounded-2xl border border-slate-100 p-4 cursor-default
                       transition-shadow duration-200 group relative overflow-hidden"
                    >
                        {/* subtle gradient accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${def.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className={`w-8 h-8 rounded-xl ${def.bg} flex items-center justify-center mb-3`}>
                            <Icon className={`w-4 h-4 ${def.text}`} />
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                            {def.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">
                            {display}
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
}
