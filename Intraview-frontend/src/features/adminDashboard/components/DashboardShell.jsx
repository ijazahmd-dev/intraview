// src/features/adminDashboard/components/DashboardShell.jsx
/**
 * Reusable shell components for the admin dashboard.
 * Contains: SectionHeader, DashboardCard, LoadingSkeleton, ErrorState, EmptyState
 */

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

/* ── Fade-in animation wrapper ─────────────────────────────── */
export const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

/* ── Section Header ────────────────────────────────────────── */
export const SectionHeader = ({ title, subtitle, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
);

/* ── Dashboard Card (glass morphism) ──────────────────────── */
export const DashboardCard = ({ children, className = "", noPadding = false }) => (
    <div
        className={`
      bg-white/80 backdrop-blur-sm border border-slate-200/60
      rounded-2xl shadow-sm hover:shadow-md
      transition-all duration-300
      ${noPadding ? "" : "p-5"}
      ${className}
    `}
    >
        {children}
    </div>
);

/* ── KPI Card ──────────────────────────────────────────────── */
export const KPICard = ({ icon: Icon, label, value, subtitle, color = "blue", delay = 0 }) => {
    const colorMap = {
        blue: "from-blue-500 to-blue-600 shadow-blue-200",
        emerald: "from-emerald-500 to-emerald-600 shadow-emerald-200",
        violet: "from-violet-500 to-violet-600 shadow-violet-200",
        amber: "from-amber-500 to-amber-600 shadow-amber-200",
        rose: "from-rose-500 to-rose-600 shadow-rose-200",
        indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200",
        cyan: "from-cyan-500 to-cyan-600 shadow-cyan-200",
        orange: "from-orange-500 to-orange-600 shadow-orange-200",
    };

    return (
        <FadeIn delay={delay}>
            <DashboardCard className="group cursor-default hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
                            {label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                            {value ?? "—"}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
                        )}
                    </div>
                    <div
                        className={`
              w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue}
              flex items-center justify-center shadow-lg flex-shrink-0
              group-hover:scale-110 transition-transform duration-300
            `}
                    >
                        {Icon && <Icon className="w-5 h-5 text-white" strokeWidth={2} />}
                    </div>
                </div>
            </DashboardCard>
        </FadeIn>
    );
};

/* ── Period Selector (daily/weekly/monthly/yearly) ─────────── */
export const PeriodSelector = ({ value, onChange }) => {
    const options = ["daily", "weekly", "monthly", "yearly"];
    return (
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`
            px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all duration-200
            ${value === opt
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }
          `}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
};

/* ── Loading Skeleton ──────────────────────────────────────── */
export const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-slate-200/60 rounded-lg ${className}`} />
);

export const KPISkeleton = () => (
    <DashboardCard>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-7 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
    </DashboardCard>
);

export const ChartSkeleton = ({ height = "h-64" }) => (
    <DashboardCard>
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className={`${height} w-full rounded-xl`} />
    </DashboardCard>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <DashboardCard>
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    </DashboardCard>
);

/* ── Error State ───────────────────────────────────────────── */
export const ErrorState = ({ message, onRetry }) => (
    <DashboardCard className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-sm font-medium text-slate-700 mb-1">Something went wrong</p>
        <p className="text-xs text-slate-400 mb-4 max-w-xs">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium
          text-white bg-slate-900 rounded-lg hover:bg-slate-800
          transition-colors duration-200"
            >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
        )}
    </DashboardCard>
);

/* ── Empty State ───────────────────────────────────────────── */
export const EmptyState = ({ message = "No data available yet" }) => (
    <DashboardCard className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">{message}</p>
    </DashboardCard>
);

/* ── Status Badge ──────────────────────────────────────────── */
export const StatusBadge = ({ status, count }) => {
    const styles = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        suspended: "bg-rose-50 text-rose-700 border-rose-200",
        approved: "bg-blue-50 text-blue-700 border-blue-200",
        critical: "bg-red-50 text-red-700 border-red-200",
        resolved: "bg-green-50 text-green-700 border-green-200",
        default: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
        rounded-full border ${styles[status] || styles.default}
      `}
        >
            {status && <span className="capitalize">{status}</span>}
            {count !== undefined && <span className="font-bold">{count}</span>}
        </span>
    );
};
