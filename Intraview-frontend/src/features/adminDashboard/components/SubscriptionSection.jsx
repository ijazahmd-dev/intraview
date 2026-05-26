// src/features/adminDashboard/components/SubscriptionSection.jsx
/**
 * Section 7: Subscription Analytics
 * Active/expired counts, renewal rate, revenue, breakdown
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchSubscriptions } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, FadeIn, KPICard,
    KPISkeleton, ErrorState, EmptyState,
} from "./DashboardShell";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CreditCard, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";

const COLORS = ["#10b981", "#f59e0b", "#6366f1", "#f43f5e"];

export default function SubscriptionSection() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminDashboard.subscriptions);

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Subscription Analytics" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)}
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchSubscriptions())} />;
    }

    if (!data) return <EmptyState />;

    const cards = [
        { icon: CheckCircle, label: "Active Subscriptions", value: data.active_subscriptions, color: "emerald" },
        { icon: XCircle, label: "Expired", value: data.expired_subscriptions, color: "amber" },
        { icon: TrendingUp, label: "Renewal Rate", value: `${data.renewal_rate || 0}%`, color: "blue" },
        { icon: DollarSign, label: "Subscription Revenue", value: `₹${Number(data.subscription_revenue || 0).toLocaleString()}`, color: "indigo" },
    ];

    const pieData = [
        { name: "Candidate Active", value: data.candidate_subscriptions?.active || 0 },
        { name: "Candidate Expired", value: data.candidate_subscriptions?.expired || 0 },
        { name: "Interviewer Active", value: data.interviewer_subscriptions?.active || 0 },
        { name: "Interviewer Expired", value: data.interviewer_subscriptions?.expired || 0 },
    ].filter((d) => d.value > 0);

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Subscription Analytics" subtitle="Active plans, renewals, and revenue" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {cards.map((c, i) => <KPICard key={c.label} {...c} delay={i * 0.05} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Breakdown Pie */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Subscription Breakdown</p>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80}
                                        dataKey="value" paddingAngle={3} strokeWidth={0}>
                                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                                        formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
                                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No subscription data</div>
                        )}
                    </DashboardCard>

                    {/* Candidate vs Interviewer Comparison */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Plan Comparison</p>
                        <div className="space-y-4 py-4">
                            {/* Candidate */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/50">
                                <div>
                                    <p className="text-sm font-semibold text-indigo-700">Candidate Plans</p>
                                    <p className="text-[11px] text-indigo-500 mt-0.5">User subscription plans</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-indigo-700">{data.candidate_subscriptions?.active || 0}</p>
                                    <p className="text-[11px] text-indigo-400">active</p>
                                </div>
                            </div>
                            {/* Interviewer */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700">Interviewer Plans</p>
                                    <p className="text-[11px] text-emerald-500 mt-0.5">Interviewer subscription plans</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-emerald-700">{data.interviewer_subscriptions?.active || 0}</p>
                                    <p className="text-[11px] text-emerald-400">active</p>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </section>
        </FadeIn>
    );
}
