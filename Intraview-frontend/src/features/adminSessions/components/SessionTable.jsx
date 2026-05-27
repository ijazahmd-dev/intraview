// src/features/adminSessions/components/SessionTable.jsx
/**
 * Section 3 — Sessions Table
 * Premium data table with sorting, pagination, and risk indicators.
 * Opens the detail drawer when a row is clicked.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
    Eye, AlertTriangle, FileText, MessageSquare, Loader2,
    RefreshCw, InboxIcon,
} from "lucide-react";
import { fetchSessions, setFilter, setSelectedSession } from "../redux/adminSessionsSlice";
import { StatusBadge, RiskBadge, BoolBadge } from "./StatusBadge";
import { fmtDateTime, fmtDuration, getInitials } from "../utils/sessionUtils";

// ── Avatar ────────────────────────────────────────────────────────
function Avatar({ name, email }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
                      flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {getInitials(name) || (email?.[0] || "?").toUpperCase()}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{name || "—"}</p>
                <p className="text-[10px] text-slate-400 truncate">{email || ""}</p>
            </div>
        </div>
    );
}

// ── Sort header ───────────────────────────────────────────────────
function SortTh({ label, field, ordering, onChange, className = "" }) {
    const isActive = ordering === field || ordering === `-${field}`;
    const isDesc = ordering === `-${field}`;
    const toggle = () => onChange(isDesc ? field : `-${field}`);
    return (
        <th
            onClick={toggle}
            className={`px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide
                  text-slate-400 cursor-pointer select-none hover:text-slate-700
                  whitespace-nowrap ${className}`}
        >
            <span className="flex items-center gap-1">
                {label}
                {isActive ? (
                    isDesc ? <ChevronDown className="w-3 h-3 text-indigo-500" /> : <ChevronUp className="w-3 h-3 text-indigo-500" />
                ) : (
                    <ChevronDown className="w-3 h-3 opacity-30" />
                )}
            </span>
        </th>
    );
}

// ── Skeleton row ──────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-slate-50">
            {Array.from({ length: 10 }).map((_, i) => (
                <td key={i} className="px-3 py-3">
                    <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
                </td>
            ))}
        </tr>
    );
}

export default function SessionTable() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((s) => s.adminSessions.sessions);
    const filters = useSelector((s) => s.adminSessions.filters);

    // Fetch whenever filters change
    useEffect(() => {
        dispatch(fetchSessions(filters));
    }, [dispatch, filters]);

    const handleSort = (field) => dispatch(setFilter({ key: "ordering", value: field }));
    const handlePage = (page) => dispatch(setFilter({ key: "page", value: page }));
    const openDetail = (id) => dispatch(setSelectedSession(id));

    const results = data?.results || [];
    const totalPages = data?.total_pages || 1;
    const currentPage = data?.page || 1;
    const count = data?.count || 0;

    const isLoading = status === "loading";

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Table header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-800">Sessions</h2>
                    {!isLoading && (
                        <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                            {count.toLocaleString()} total
                        </span>
                    )}
                </div>
                {isLoading && (
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading…
                    </div>
                )}
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                            <SortTh label="Booking" field="id" ordering={filters.ordering} onChange={handleSort} className="pl-4" />
                            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</th>
                            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Candidate</th>
                            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Interviewer</th>
                            <SortTh label="Scheduled" field="start_datetime" ordering={filters.ordering} onChange={handleSort} />
                            <SortTh label="Duration" field="token_cost" ordering={filters.ordering} onChange={handleSort} />
                            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Payment</th>
                            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Reschedule</th>
                            <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Flags</th>
                            <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400 pr-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && results.length === 0
                            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            : null
                        }

                        <AnimatePresence>
                            {!isLoading && results.length === 0 && status !== "idle" ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center">
                                        <InboxIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">No sessions match your filters.</p>
                                    </td>
                                </tr>
                            ) : null}

                            {results.map((row, i) => (
                                <motion.tr
                                    key={row.booking_id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    onClick={() => openDetail(row.booking_id)}
                                    className="border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer
                             transition-colors duration-100 group"
                                >
                                    {/* Booking ID */}
                                    <td className="px-3 pl-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {row.high_risk_session && (
                                                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                            )}
                                            <span className="text-xs font-mono font-semibold text-slate-700">
                                                #{row.booking_id}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-1">
                                            <StatusBadge status={row.status} size="xs" />
                                            {row.high_risk_session && <RiskBadge size="xs" />}
                                        </div>
                                    </td>

                                    {/* Candidate */}
                                    <td className="px-3 py-3 max-w-[160px]">
                                        <Avatar name={row.candidate_name} email={row.candidate_email} />
                                    </td>

                                    {/* Interviewer */}
                                    <td className="px-3 py-3 max-w-[160px]">
                                        <Avatar name={row.interviewer_name} email={row.interviewer_email} />
                                    </td>

                                    {/* Scheduled start */}
                                    <td className="px-3 py-3">
                                        <p className="text-xs text-slate-700">{fmtDateTime(row.scheduled_start)}</p>
                                        {row.timezone && (
                                            <p className="text-[10px] text-slate-400">{row.timezone}</p>
                                        )}
                                    </td>

                                    {/* Duration + tokens */}
                                    <td className="px-3 py-3">
                                        <p className="text-xs text-slate-700">{fmtDuration(row.duration_minutes)}</p>
                                        <p className="text-[10px] text-slate-400">{row.token_cost} tkn</p>
                                    </td>

                                    {/* Payment */}
                                    <td className="px-3 py-3">
                                        <StatusBadge status={row.payment_status} variant="payment" size="xs" />
                                    </td>

                                    {/* Reschedule */}
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-1">
                                            <StatusBadge status={row.reschedule_status} variant="reschedule" size="xs" />
                                            {row.reschedule_count > 0 && (
                                                <span className="text-[10px] text-slate-400">{row.reschedule_count}×</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Flags */}
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col gap-1">
                                            {row.has_feedback && (
                                                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                                                    <MessageSquare className="w-2.5 h-2.5" /> Feedback
                                                </span>
                                            )}
                                            {row.has_report && (
                                                <span className="flex items-center gap-0.5 text-[10px] text-red-500">
                                                    <FileText className="w-2.5 h-2.5" /> Report
                                                </span>
                                            )}
                                            {row.is_live && (
                                                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Live
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* View */}
                                    <td className="px-3 pr-4 py-3 text-right">
                                        <button
                                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200
                                 flex items-center justify-center text-slate-500
                                 group-hover:bg-indigo-600 group-hover:border-indigo-600
                                 group-hover:text-white transition-all duration-150"
                                            onClick={(e) => { e.stopPropagation(); openDetail(row.booking_id); }}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Error state */}
            {status === "failed" && (
                <div className="flex items-center justify-center gap-2 py-6 text-red-500 text-sm border-t border-slate-50">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error || "Failed to load sessions"}</span>
                    <button
                        onClick={() => dispatch(fetchSessions(filters))}
                        className="flex items-center gap-1 ml-2 text-indigo-600 text-xs underline"
                    >
                        <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400">
                        Page {currentPage} of {totalPages} · {count} sessions
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center
                         text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePage(page)}
                                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                    ${page === currentPage
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center
                         text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
