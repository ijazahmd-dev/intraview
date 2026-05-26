// src/features/adminDashboard/components/ModerationSection.jsx
/**
 * Section 5: Reports / Moderation
 * Report status cards, complaint categories, most reported interviewers
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchModeration } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, FadeIn, KPICard,
    KPISkeleton, ErrorState, EmptyState,
} from "./DashboardShell";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Shield, AlertTriangle, CheckCircle, AlertOctagon, ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModerationSection() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data, status, error } = useSelector((s) => s.adminDashboard.moderation);

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Reports & Moderation" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)}
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchModeration())} />;
    }

    if (!data) return <EmptyState />;

    const cards = [
        { icon: Shield, label: "Pending", value: data.pending_reports, color: "amber" },
        { icon: AlertTriangle, label: "Escalated", value: data.escalated_reports, color: "orange" },
        { icon: CheckCircle, label: "Resolved", value: data.resolved_reports, color: "emerald" },
        { icon: AlertOctagon, label: "Critical", value: data.critical_reports, color: "rose" },
    ];

    // Complaint categories for bar chart
    const categoryData = (data.complaint_categories || []).map((c) => ({
        type: c.issue_type?.replace(/_/g, " ") || "Other",
        count: c.count,
    }));

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Reports & Moderation" subtitle="Issue tracking and complaint analytics">
                    <button
                        onClick={() => navigate("/admin/issues")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
              text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Review Reports
                    </button>
                </SectionHeader>

                {/* Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {cards.map((c, i) => <KPICard key={c.label} {...c} delay={i * 0.05} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Complaint Categories Chart */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Complaint Categories</p>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={0} angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "white", border: "1px solid #e2e8f0",
                                            borderRadius: "12px", fontSize: "12px",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                                No complaints recorded
                            </div>
                        )}
                    </DashboardCard>

                    {/* Most Reported Interviewers */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Most Reported Interviewers</p>
                        {data.most_reported_interviewers?.length > 0 ? (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto">
                                {data.most_reported_interviewers.map((item, i) => (
                                    <div key={item.user_id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold
                      ${i < 3 ? "bg-gradient-to-br from-rose-500 to-red-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{item.name || item.email}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{item.email}</p>
                                        </div>
                                        <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full tabular-nums">
                                            {item.report_count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No reports filed</p>
                        )}
                    </DashboardCard>
                </div>
            </section>
        </FadeIn>
    );
}
