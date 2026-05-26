// src/features/adminDashboard/components/InterviewerHealthSection.jsx
/**
 * Section 4: Interviewer Health
 * Status distribution, top performers, verification queue
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchInterviewerHealth } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, FadeIn, KPICard,
    KPISkeleton, ErrorState, EmptyState, TableSkeleton,
} from "./DashboardShell";
import {
    UserCheck, Users, ShieldOff, Clock,
    Star, Award, AlertTriangle,
} from "lucide-react";

export default function InterviewerHealthSection() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminDashboard.interviewerHealth);

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Interviewer Health" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <TableSkeleton /><TableSkeleton />
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchInterviewerHealth())} />;
    }

    if (!data) return <EmptyState />;

    const statusCards = [
        { icon: Users, label: "Total", value: data.total_interviewers, color: "blue" },
        { icon: UserCheck, label: "Active", value: data.active, color: "emerald" },
        { icon: ShieldOff, label: "Suspended", value: data.suspended, color: "rose" },
        { icon: Clock, label: "Pending Verification", value: data.pending_verification, color: "amber" },
    ];

    const { top_performers, risky_interviewers } = data;

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Interviewer Health" subtitle="Ecosystem status and intelligence" />

                {/* Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {statusCards.map((c, i) => <KPICard key={c.label} {...c} delay={i * 0.05} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Highest Rated */}
                    <DashboardCard>
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-amber-500" />
                            <p className="text-sm font-semibold text-slate-700">Highest Rated</p>
                        </div>
                        {top_performers?.highest_rated?.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {top_performers.highest_rated.map((item, i) => (
                                    <div key={item.user_id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                      text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{item.name || item.email}</p>
                                            <p className="text-[11px] text-slate-400">{item.review_count} reviews</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-slate-800">{item.avg_rating?.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
                        )}
                    </DashboardCard>

                    {/* Most Completed */}
                    <DashboardCard>
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-4 h-4 text-emerald-500" />
                            <p className="text-sm font-semibold text-slate-700">Most Completed Interviews</p>
                        </div>
                        {top_performers?.most_completed?.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {top_performers.most_completed.map((item, i) => (
                                    <div key={item.user_id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500
                      text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{item.name || item.email}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 tabular-nums">{item.completed_count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
                        )}
                    </DashboardCard>
                </div>

                {/* Verification Queue */}
                {data.pending_verification_queue > 0 && (
                    <DashboardCard className="mt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <p className="text-sm font-semibold text-slate-700">
                                    Pending Verification Queue
                                </p>
                            </div>
                            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                {data.pending_verification_queue} awaiting
                            </span>
                        </div>
                    </DashboardCard>
                )}
            </section>
        </FadeIn>
    );
}
