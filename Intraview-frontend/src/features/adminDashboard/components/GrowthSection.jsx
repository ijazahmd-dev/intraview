// src/features/adminDashboard/components/GrowthSection.jsx
/**
 * Section 8: Platform Growth
 * User, interview, and revenue growth time-series charts
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchGrowth, setGrowthPeriod } from "../adminDashboardSlice";
import {
    DashboardCard, SectionHeader, PeriodSelector, FadeIn,
    ChartSkeleton, ErrorState, EmptyState,
} from "./DashboardShell";
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const tooltipStyle = {
    background: "white", border: "1px solid #e2e8f0",
    borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export default function GrowthSection() {
    const dispatch = useDispatch();
    const { data, status, error, period } = useSelector((s) => s.adminDashboard.growth);

    const handlePeriodChange = (p) => {
        dispatch(setGrowthPeriod(p));
        dispatch(fetchGrowth(p));
    };

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Platform Growth" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchGrowth(period))} />;
    }

    if (!data) return <EmptyState />;

    const fmtLabel = (iso) => {
        try {
            return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        } catch { return iso; }
    };

    const userGrowth = (data.user_growth || []).map((d) => ({ ...d, label: fmtLabel(d.period) }));
    const interviewGrowth = (data.interview_growth || []).map((d) => ({ ...d, label: fmtLabel(d.period) }));
    const revenueGrowth = (data.revenue_growth || []).map((d) => ({ ...d, label: fmtLabel(d.period) }));

    return (
        <FadeIn>
            <section>
                <SectionHeader title="Platform Growth" subtitle="User, interview, and revenue trends">
                    <PeriodSelector value={period} onChange={handlePeriodChange} />
                </SectionHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* User Growth */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">User Growth</p>
                        {userGrowth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={userGrowth}>
                                    <defs>
                                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="new_users" name="New Users"
                                        stroke="#6366f1" fill="url(#userGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data</div>
                        )}
                    </DashboardCard>

                    {/* Interview Growth */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Interview Growth</p>
                        {interviewGrowth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={interviewGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="top" iconType="circle" iconSize={8}
                                        formatter={(v) => <span className="text-[11px] text-slate-600">{v}</span>} />
                                    <Line type="monotone" dataKey="total_bookings" name="Bookings"
                                        stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="completed" name="Completed"
                                        stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data</div>
                        )}
                    </DashboardCard>

                    {/* Revenue Growth */}
                    <DashboardCard>
                        <p className="text-sm font-semibold text-slate-700 mb-4">Revenue Growth</p>
                        {revenueGrowth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={revenueGrowth}>
                                    <defs>
                                        <linearGradient id="revGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <Tooltip contentStyle={tooltipStyle}
                                        formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
                                    <Area type="monotone" dataKey="revenue" name="Revenue"
                                        stroke="#10b981" fill="url(#revGrowth)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data</div>
                        )}
                    </DashboardCard>
                </div>
            </section>
        </FadeIn>
    );
}
