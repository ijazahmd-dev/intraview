// src/features/adminDashboard/components/InterviewSection.jsx
/**
 * Section 3: Interview Analytics
 * Interview funnel, rates, and top/risky interviewers
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchInterviews } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, FadeIn, ChartSkeleton,
    ErrorState, EmptyState,
} from "./DashboardShell";
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ArrowDown, AlertTriangle } from "lucide-react";

export default function InterviewSection() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminDashboard.interviews);

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Interview Analytics" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartSkeleton height="h-64" />
                    <ChartSkeleton height="h-64" />
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchInterviews())} />;
    }

    if (!data) return <EmptyState />;

    const { counts, funnel, rates, performance, top_interviewers_by_sessions, risky_interviewers } = data;

    // Funnel data for bar chart
    const funnelData = [
        { stage: "Booked", value: funnel?.booked || 0, fill: "#6366f1" },
        { stage: "Confirmed", value: funnel?.confirmed || 0, fill: "#8b5cf6" },
        { stage: "Completed", value: funnel?.completed || 0, fill: "#10b981" },
        { stage: "Feedback", value: funnel?.feedback_submitted || 0, fill: "#06b6d4" },
    ];

    const rateCards = [
        { label: "Completion", value: `${rates?.completion_rate || 0}%`, color: "text-emerald-600" },
        { label: "Cancellation", value: `${rates?.cancellation_rate || 0}%`, color: "text-amber-600" },
        { label: "No-Show", value: `${rates?.no_show_rate || 0}%`, color: "text-rose-600" },
        { label: "Avg Candidate Rating", value: performance?.avg_candidate_rating?.toFixed(1) || "—", color: "text-blue-600" },
        { label: "Avg Interviewer Rating", value: performance?.avg_interviewer_rating?.toFixed(1) || "—", color: "text-violet-600" },
    ];

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Interview Analytics" subtitle="Funnel, rates, and performance" />

                {/* Rate Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {rateCards.map((card) => (
                        <DashboardCard key={card.label} className="!p-4 text-center">
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{card.label}</p>
                            <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                        </DashboardCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Funnel Chart */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Interview Funnel</p>
                        <p className="text-xs text-slate-400 mb-4">Booked → Confirmed → Completed → Feedback</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={funnelData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: "#475569" }} width={80} />
                                <Tooltip
                                    contentStyle={{
                                        background: "white", border: "1px solid #e2e8f0",
                                        borderRadius: "12px", fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                    {funnelData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </DashboardCard>

                    {/* Top Interviewers */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Top Interviewers by Sessions</p>
                        {top_interviewers_by_sessions?.length > 0 ? (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                {top_interviewers_by_sessions.map((item, i) => (
                                    <div key={item.user_id} className="flex items-center gap-3 py-1.5">
                                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500
                      text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{item.name || item.email}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{item.email}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 tabular-nums">{item.session_count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
                        )}
                    </DashboardCard>
                </div>

                {/* Risky Interviewers */}
                {risky_interviewers?.length > 0 && (
                    <DashboardCard className="mt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <p className="text-sm font-semibold text-slate-700">Risky Interviewers</p>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                {risky_interviewers.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="pb-2 font-medium">Interviewer</th>
                                        <th className="pb-2 font-medium">Avg Rating</th>
                                        <th className="pb-2 font-medium">Complaints</th>
                                        <th className="pb-2 font-medium">Risk Signals</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {risky_interviewers.map((r) => (
                                        <tr key={r.user_id} className="hover:bg-slate-50/50">
                                            <td className="py-2.5">
                                                <p className="font-medium text-slate-700">{r.name || r.email}</p>
                                                <p className="text-[11px] text-slate-400">{r.email}</p>
                                            </td>
                                            <td className="py-2.5">
                                                <span className={`font-semibold ${r.avg_rating < 2.5 ? "text-rose-600" : "text-slate-700"}`}>
                                                    {r.avg_rating?.toFixed(1) || "—"}
                                                </span>
                                            </td>
                                            <td className="py-2.5 font-medium text-slate-700">{r.complaint_count}</td>
                                            <td className="py-2.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {r.risk_signals?.map((s, i) => (
                                                        <span key={i} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardCard>
                )}
            </section>
        </FadeIn>
    );
}

