// src/features/adminSessions/components/SessionTimeline.jsx
/**
 * Section 5 — Premium Session Timeline View
 * Displays ordered lifecycle events vertically with icons and timestamps.
 */

import { motion } from "framer-motion";
import {
    Plus, CheckCircle, RefreshCw, Play, Award, X,
    MessageSquare, DollarSign, AlertTriangle, Clock,
} from "lucide-react";
import { fmtDateTime } from "../utils/sessionUtils";

const EVENT_META = {
    "Booking Created": { icon: Plus, color: "bg-indigo-500", ring: "ring-indigo-200" },
    "Booking Confirmed": { icon: CheckCircle, color: "bg-blue-500", ring: "ring-blue-200" },
    "Reschedule Requested": { icon: RefreshCw, color: "bg-amber-500", ring: "ring-amber-200" },
    "Reschedule Accepted": { icon: CheckCircle, color: "bg-green-500", ring: "ring-green-200" },
    "Reschedule Rejected": { icon: X, color: "bg-red-500", ring: "ring-red-200" },
    "Session Went Live": { icon: Play, color: "bg-emerald-500", ring: "ring-emerald-200" },
    "Session Completed": { icon: Award, color: "bg-slate-600", ring: "ring-slate-200" },
    "Session Cancelled": { icon: X, color: "bg-red-500", ring: "ring-red-200" },
    "Candidate Evaluation Submitted": { icon: MessageSquare, color: "bg-teal-500", ring: "ring-teal-200" },
    "Interviewer Reviewed by Candidate": { icon: MessageSquare, color: "bg-cyan-500", ring: "ring-cyan-200" },
    "Payout Completed": { icon: DollarSign, color: "bg-green-600", ring: "ring-green-200" },
};

function getEventMeta(event) {
    for (const [key, val] of Object.entries(EVENT_META)) {
        if (event.startsWith(key)) return val;
    }
    return { icon: Clock, color: "bg-slate-400", ring: "ring-slate-200" };
}

export default function SessionTimeline({ events = [] }) {
    if (!events.length) {
        return (
            <div className="py-8 text-center text-slate-400 text-sm">
                No timeline events available.
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-100" />

            <div className="space-y-4">
                {events.map((ev, i) => {
                    const meta = getEventMeta(ev.event);
                    const Icon = meta.icon;
                    const isReport = ev.event.startsWith("Report");

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-4 relative"
                        >
                            {/* Icon dot */}
                            <div
                                className={`w-10 h-10 rounded-full ${meta.color} ring-4 ${meta.ring}
                            flex items-center justify-center flex-shrink-0 relative z-10`}
                            >
                                <Icon className="w-4 h-4 text-white" />
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-4 ${i < events.length - 1 ? "border-b border-slate-50" : ""}`}>
                                <p className={`text-sm font-semibold ${isReport ? "text-orange-700" : "text-slate-800"}`}>
                                    {ev.event}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {ev.timestamp ? fmtDateTime(ev.timestamp) : "Timestamp not recorded"}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
