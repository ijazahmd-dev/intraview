// src/features/adminSessions/pages/AdminSessionsPage.jsx
/**
 * Admin Session Management — Main Page
 *
 * Assembles all 7 sections into the sessions operations command center.
 * Accessible only to authenticated admins via AdminProtectedRoute.
 *
 * Layout:
 *   Header (sticky)
 *   1. KPI Cards
 *   2. Filter Bar
 *   3. Session Table
 *   4. Risk Insights Panel
 *   5. Detail Drawer (portal-style, on top)
 */

import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CalendarDays, RefreshCw, Loader2 } from "lucide-react";

import { fetchSessionKPIs, fetchSessions, resetFilters } from "../redux/adminSessionsSlice";
import SessionKPICards from "../components/SessionKPICards";
import SessionFilterBar from "../components/SessionFilterBar";
import SessionTable from "../components/SessionTable";
import SessionDetailDrawer from "../components/SessionDetailDrawer";
import RiskInsightsPanel from "../components/RiskInsightsPanel";

export default function AdminSessionsPage() {
    const dispatch = useDispatch();
    const filters = useSelector((s) => s.adminSessions.filters);
    const kpiStatus = useSelector((s) => s.adminSessions.kpis.status);
    const sessionsStatus = useSelector((s) => s.adminSessions.sessions.status);

    const isAnyLoading = kpiStatus === "loading" || sessionsStatus === "loading";

    const handleRefresh = () => {
        dispatch(fetchSessionKPIs());
        dispatch(fetchSessions(filters));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">

            {/* ── Sticky Header ─────────────────────────────────────── */}
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                              flex items-center justify-center shadow-lg shadow-indigo-200">
                                <CalendarDays className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">Session Management</h1>
                                <p className="text-[11px] text-slate-400 -mt-0.5">Booking Intelligence · Operations</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isAnyLoading && (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="flex items-center gap-1.5 text-xs text-indigo-500"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    Syncing…
                                </motion.div>
                            )}
                            <button
                                onClick={handleRefresh}
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

            {/* ── Main Content ──────────────────────────────────────── */}
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

                {/* Section 1 — KPI Cards */}
                <section>
                    <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Overview
                    </h2>
                    <SessionKPICards />
                </section>

                {/* Section 2 — Filter Bar */}
                <section>
                    <SessionFilterBar />
                </section>

                {/* Section 3 — Session Table */}
                <section>
                    <SessionTable />
                </section>

                {/* Section 4 — Risk Insights */}
                <section>
                    <RiskInsightsPanel />
                </section>

                {/* Footer */}
                <footer className="text-center py-8 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Intraview Admin · Session Management · Booking Intelligence
                    </p>
                </footer>
            </main>

            {/* Section 5 — Detail Drawer (renders at fixed position, outside flow) */}
            <SessionDetailDrawer />
        </div>
    );
}
