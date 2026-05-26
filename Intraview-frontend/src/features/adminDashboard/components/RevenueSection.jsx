// src/features/adminDashboard/components/RevenueSection.jsx
/**
 * Section 2: Revenue Analytics
 * Revenue trend line chart, breakdown pie chart, and finance summary cards
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchRevenue, setRevenuePeriod } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, PeriodSelector,
    FadeIn, ChartSkeleton, ErrorState, EmptyState,
} from "./DashboardShell";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { DollarSign, TrendingDown, Percent, Wallet } from "lucide-react";

const COLORS = ["#6366f1", "#06b6d4", "#10b981"];

export default function RevenueSection() {
    const dispatch = useDispatch();
    const { data, status, error, period } = useSelector((s) => s.adminDashboard.revenue);

    const handlePeriodChange = (p) => {
        dispatch(setRevenuePeriod(p));
        dispatch(fetchRevenue(p));
    };

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Revenue Analytics" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartSkeleton height="h-72" />
                    <ChartSkeleton height="h-72" />
                    <ChartSkeleton height="h-72" />
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchRevenue(period))} />;
    }

    if (!data) return <EmptyState message="No revenue data available" />;

    const { summary, trends, breakdown } = data;
    const fmtCurrency = (v) => `₹${Number(v || 0).toLocaleString()}`;

    // Pie data
    const pieData = [
        { name: "Peer Interviews", value: breakdown?.peer_interview_revenue || 0 },
        { name: "AI Interviews", value: breakdown?.ai_interview_revenue || 0 },
        { name: "Subscriptions", value: breakdown?.subscription_revenue || 0 },
    ].filter((d) => d.value > 0);

    // Format trend period labels
    const trendData = (trends || []).map((t) => ({
        ...t,
        label: new Date(t.period).toLocaleDateString("en-IN", {
            month: "short", day: "numeric",
        }),
    }));

    const financeCards = [
        { icon: DollarSign, label: "Gross Revenue", value: fmtCurrency(summary?.gross_revenue), color: "text-emerald-600 bg-emerald-50" },
        { icon: TrendingDown, label: "Net Revenue", value: fmtCurrency(summary?.net_revenue), color: "text-blue-600 bg-blue-50" },
        { icon: Percent, label: "Commission", value: fmtCurrency(summary?.platform_commission), color: "text-violet-600 bg-violet-50" },
        { icon: TrendingDown, label: "Total Refunds", value: fmtCurrency(summary?.total_refunds), color: "text-rose-600 bg-rose-50" },
        { icon: Wallet, label: "Payout Liability", value: fmtCurrency(summary?.pending_payout_amount), color: "text-amber-600 bg-amber-50" },
    ];

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Revenue Analytics" subtitle="Financial performance and trends">
                    <PeriodSelector value={period} onChange={handlePeriodChange} />
                </SectionHeader>

                {/* Finance Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {financeCards.map((card) => (
                        <DashboardCard key={card.label} className="!p-4">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                                    <card.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase">{card.label}</p>
                                    <p className="text-sm font-bold text-slate-800">{card.value}</p>
                                </div>
                            </div>
                        </DashboardCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Revenue Trend */}
                    <DashboardCard className="lg:col-span-2">
                        <p className="text-sm font-semibold text-slate-700 mb-4">Revenue Trend</p>
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "white", border: "1px solid #e2e8f0",
                                            borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                        }}
                                    />
                                    <Area type="monotone" dataKey="token_revenue" name="Token Revenue"
                                        stroke="#6366f1" fill="url(#revGradient)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="subscription_revenue" name="Subscription"
                                        stroke="#10b981" fill="url(#subGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-56 flex items-center justify-center text-sm text-slate-400">
                                No trend data for this period
                            </div>
                        )}
                    </DashboardCard>

                    {/* Revenue Breakdown Pie */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Revenue Breakdown</p>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                                        dataKey="value" paddingAngle={3} strokeWidth={0}
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom" iconType="circle" iconSize={8}
                                        formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                                    />
                                    <Tooltip
                                        formatter={(v) => [`₹${Number(v).toLocaleString()}`, ""]}
                                        contentStyle={{
                                            background: "white", border: "1px solid #e2e8f0",
                                            borderRadius: "12px", fontSize: "12px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-56 flex items-center justify-center text-sm text-slate-400">
                                No revenue breakdown data
                            </div>
                        )}
                    </DashboardCard>
                </div>
            </section>
        </FadeIn>
    );
}
