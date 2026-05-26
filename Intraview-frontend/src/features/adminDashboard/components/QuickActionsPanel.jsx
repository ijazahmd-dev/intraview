// src/features/adminDashboard/components/QuickActionsPanel.jsx
/**
 * Section 9: Quick Action Panel
 * Admin productivity shortcuts to common operational pages
 */

import { useNavigate } from "react-router-dom";
import { FadeIn, DashboardCard, SectionHeader } from "./DashboardShell";
import {
    Shield, UserCheck, RotateCcw, Wallet, Bell,
    ArrowRight, Users, CreditCard,
} from "lucide-react";

const actions = [
    {
        icon: Shield, label: "Review Reports",
        description: "Manage open issues and complaints",
        path: "/admin/issues", color: "from-rose-500 to-red-500",
    },
    {
        icon: UserCheck, label: "Verify Interviewers",
        description: "Review pending applications",
        path: "/admin/interviewers/verifications", color: "from-amber-500 to-orange-500",
    },
    {
        icon: Wallet, label: "Review Payouts",
        description: "Process pending payout requests",
        path: "/admin/payout/queue", color: "from-emerald-500 to-teal-500",
    },
    {
        icon: RotateCcw, label: "Manage Refunds",
        description: "Handle refund requests",
        path: "/admin/payout/history", color: "from-blue-500 to-indigo-500",
    },
    {
        icon: Users, label: "Manage Users",
        description: "User management and moderation",
        path: "/admin/users", color: "from-violet-500 to-purple-500",
    },
    {
        icon: CreditCard, label: "Subscription Plans",
        description: "Manage subscription offerings",
        path: "/admin/subscription-plans", color: "from-cyan-500 to-blue-500",
    },
];

export default function QuickActionsPanel() {
    const navigate = useNavigate();

    return (
        <FadeIn>
            <section>
                <SectionHeader
                    title="Quick Actions"
                    subtitle="Shortcuts to common admin operations"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="group text-left"
                        >
                            <DashboardCard className="!p-4 group-hover:scale-[1.02] transition-all duration-300 group-hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color}
                    flex items-center justify-center shadow-lg flex-shrink-0
                    group-hover:scale-110 transition-transform duration-300`}>
                                        <action.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {action.label}
                                        </p>
                                        <p className="text-[11px] text-slate-400 truncate">{action.description}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </DashboardCard>
                        </button>
                    ))}
                </div>
            </section>
        </FadeIn>
    );
}
