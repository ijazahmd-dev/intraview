// src/features/adminDashboard/pages/AdminDashboardPage.jsx
/**
 * Admin Dashboard — Main Page
 *
 * Assembles all 9 dashboard sections into a single scrollable admin command center.
 * Dispatches all 8 API fetches on mount for a comprehensive overview.
 * Only accessible to authenticated admin users (wrapped in AdminProtectedRoute).
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
    LayoutDashboard, RefreshCw,
} from "lucide-react";

// Redux thunks
import {
    fetchOverview,
    fetchRevenue,
    fetchInterviews,
    fetchInterviewerHealth,
    fetchModeration,
    fetchFinance,
    fetchSubscriptions,
    fetchGrowth,
} from "../adminDashboardSlice";

// Section components
import OverviewSection from "../components/OverviewSection";
import RevenueSection from "../components/RevenueSection";
import InterviewSection from "../components/InterviewSection";
import InterviewerHealthSection from "../components/InterviewerHealthSection";
import ModerationSection from "../components/ModerationSection";
import FinanceSection from "../components/FinanceSection";
import SubscriptionSection from "../components/SubscriptionSection";
import GrowthSection from "../components/GrowthSection";
import QuickActionsPanel from "../components/QuickActionsPanel";

export default function AdminDashboardPage() {
    const dispatch = useDispatch();
    const revenuePeriod = useSelector((s) => s.adminDashboard.revenue.period);
    const growthPeriod = useSelector((s) => s.adminDashboard.growth.period);

    // Fetch all dashboard data on mount
    useEffect(() => {
        dispatch(fetchOverview());
        dispatch(fetchRevenue(revenuePeriod));
        dispatch(fetchInterviews());
        dispatch(fetchInterviewerHealth());
        dispatch(fetchModeration());
        dispatch(fetchFinance());
        dispatch(fetchSubscriptions());
        dispatch(fetchGrowth(growthPeriod));
    }, [dispatch]); // Only on mount — period changes are handled by child components

    // Check if anything is still loading for the global loading indicator
    const dashboardState = useSelector((s) => s.adminDashboard);
    const isAnyLoading = Object.values(dashboardState).some(
        (section) => section?.status === "loading"
    );

    const handleRefreshAll = () => {
        dispatch(fetchOverview());
        dispatch(fetchRevenue(revenuePeriod));
        dispatch(fetchInterviews());
        dispatch(fetchInterviewerHealth());
        dispatch(fetchModeration());
        dispatch(fetchFinance());
        dispatch(fetchSubscriptions());
        dispatch(fetchGrowth(growthPeriod));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                flex items-center justify-center shadow-lg shadow-indigo-200">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
                                <p className="text-[11px] text-slate-400 -mt-0.5">Platform Command Center</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Loading indicator */}
                            {isAnyLoading && (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="flex items-center gap-1.5 text-xs text-indigo-500"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    Syncing...
                                </motion.div>
                            )}

                            {/* Refresh button */}
                            <button
                                onClick={handleRefreshAll}
                                disabled={isAnyLoading}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium
                  text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200
                  disabled:opacity-50 transition-all duration-200"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isAnyLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
                {/* Section 1: KPI Overview */}
                <OverviewSection />

                {/* Section 2: Revenue Analytics */}
                <RevenueSection />

                {/* Section 3: Interview Analytics */}
                <InterviewSection />

                {/* Section 4: Interviewer Health */}
                <InterviewerHealthSection />

                {/* Section 5: Reports & Moderation */}
                <ModerationSection />

                {/* Section 6: Finance */}
                <FinanceSection />

                {/* Section 7: Subscription Analytics */}
                <SubscriptionSection />

                {/* Section 8: Platform Growth */}
                <GrowthSection />

                {/* Section 9: Quick Actions */}
                <QuickActionsPanel />

                {/* Footer */}
                <footer className="text-center py-8 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Intraview Admin Dashboard • Platform Intelligence
                    </p>
                </footer>
            </main>
        </div>
    );
}
