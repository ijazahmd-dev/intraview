// src/features/adminDashboard/components/OverviewSection.jsx
/**
 * Section 1: Top KPI Hero Section
 * Premium KPI cards for Revenue, Users, Interviews, and Operations
 */

import { useSelector, useDispatch } from "react-redux";
import { fetchOverview } from "../adminDashboardSlice";
import {
    KPICard, KPISkeleton, ErrorState, FadeIn, SectionHeader,
} from "./DashboardShell";
import {
    DollarSign, Users, UserCheck, UserPlus,
    Video, Bot, CheckCircle, XCircle,
    AlertTriangle, Bell, ShieldAlert, RotateCcw,
    TrendingUp, Activity,
} from "lucide-react";

export default function OverviewSection() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminDashboard.overview);

    if (status === "loading" || status === "idle") {
        return (
            <section>
                <SectionHeader title="Platform Overview" subtitle="Key performance indicators" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 16 }).map((_, i) => <KPISkeleton key={i} />)}
                </div>
            </section>
        );
    }

    if (status === "failed") {
        return <ErrorState message={error} onRetry={() => dispatch(fetchOverview())} />;
    }

    if (!data) return null;

    const fmt = (v) => v?.toLocaleString?.() ?? "—";
    const fmtCurrency = (v) => v != null ? `₹${Number(v).toLocaleString()}` : "—";
    const fmtPct = (v) => v != null ? `${v}%` : "—";

    const revenueCards = [
        { icon: DollarSign, label: "Today Revenue", value: fmtCurrency(data.today_revenue), color: "emerald", subtitle: "Real-time" },
        { icon: TrendingUp, label: "Weekly Revenue", value: fmtCurrency(data.weekly_revenue), color: "blue" },
        { icon: Activity, label: "Monthly Revenue", value: fmtCurrency(data.monthly_revenue), color: "violet" },
        { icon: DollarSign, label: "Total Revenue", value: fmtCurrency(data.total_revenue), color: "indigo", subtitle: "All time" },
    ];

    const userCards = [
        { icon: Users, label: "Total Users", value: fmt(data.total_users), color: "blue" },
        { icon: UserPlus, label: "Candidates", value: fmt(data.total_candidates), color: "cyan" },
        { icon: UserCheck, label: "Interviewers", value: fmt(data.total_interviewers), color: "violet", subtitle: `${fmt(data.active_interviewers)} active` },
        { icon: ShieldAlert, label: "Suspended", value: fmt(data.suspended_users), color: "rose" },
    ];

    const interviewCards = [
        { icon: Video, label: "Peer Completed", value: fmt(data.completed_peer_interviews), color: "emerald" },
        { icon: Bot, label: "AI Completed", value: fmt(data.total_ai_interviews_completed), color: "indigo" },
        { icon: CheckCircle, label: "Completion Rate", value: fmtPct(data.interview_completion_rate), color: "blue" },
        { icon: XCircle, label: "Cancelled", value: fmt(data.cancelled_interviews), color: "amber" },
    ];

    const opsCards = [
        { icon: AlertTriangle, label: "Pending Reports", value: fmt(data.pending_reports), color: data.pending_reports > 0 ? "rose" : "emerald" },
        { icon: Bell, label: "Failed Notifs", value: fmt(data.failed_notifications), color: data.failed_notifications > 0 ? "amber" : "emerald" },
        { icon: UserCheck, label: "Pending Verifications", value: fmt(data.pending_verifications), color: data.pending_verifications > 0 ? "amber" : "emerald" },
        { icon: RotateCcw, label: "Pending Refunds", value: fmt(data.pending_refunds), color: data.pending_refunds > 0 ? "orange" : "emerald" },
    ];

    const renderRow = (title, cards) => (
        <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 pl-1">{title}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <KPICard key={card.label} {...card} delay={i * 0.05} />
                ))}
            </div>
        </div>
    );

    return (
        <section>
            <SectionHeader title="Platform Overview" subtitle="Real-time key performance indicators" />
            {renderRow("Revenue", revenueCards)}
            {renderRow("Users", userCards)}
            {renderRow("Interviews", interviewCards)}
            {renderRow("Operations", opsCards)}
        </section>
    );
}
