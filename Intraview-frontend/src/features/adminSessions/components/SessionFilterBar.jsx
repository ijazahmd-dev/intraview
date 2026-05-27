// src/features/adminSessions/components/SessionFilterBar.jsx
/**
 * Section 2 — Advanced Filter Bar
 * Debounced search, dropdowns, date range, reset.
 * Reads/writes filters directly to Redux — no local state for filters.
 */

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { setFilter, resetFilters, fetchSessions } from "../redux/adminSessionsSlice";

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "LIVE", label: "Live" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "CANCELLED_BY_CANDIDATE", label: "Cancelled by Candidate" },
    { value: "CANCELLED_BY_INTERVIEWER", label: "Cancelled by Interviewer" },
    { value: "CANDIDATE_NO_SHOW", label: "Candidate No-Show" },
    { value: "INTERVIEWER_NO_SHOW", label: "Interviewer No-Show" },
];

const PAYMENT_OPTIONS = [
    { value: "", label: "All Payments" },
    { value: "PENDING", label: "Pending" },
    { value: "PAID_TO_INTERVIEWER", label: "Paid to Interviewer" },
    { value: "REFUNDED_TO_CANDIDATE", label: "Refunded" },
    { value: "AWAITING_EVALUATION", label: "Awaiting Evaluation" },
];

const RESCHEDULE_OPTIONS = [
    { value: "", label: "Any Reschedule" },
    { value: "NONE", label: "None" },
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
];

const DATE_PRESETS = [
    { label: "Today", days: 0 },
    { label: "Last 7d", days: 7 },
    { label: "Last 30d", days: 30 },
];

function isoDate(d) {
    return d.toISOString().split("T")[0];
}

function Select({ value, onChange, options, className = "" }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-9 pl-3 pr-8 text-xs font-medium rounded-xl border border-slate-200
                  bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300
                  appearance-none cursor-pointer hover:border-slate-300 transition-colors ${className}`}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

export default function SessionFilterBar() {
    const dispatch = useDispatch();
    const filters = useSelector((s) => s.adminSessions.filters);
    const debounceRef = useRef(null);

    // Debounced search (500ms)
    const handleSearch = useCallback(
        (value) => {
            dispatch(setFilter({ key: "search", value }));
        },
        [dispatch]
    );

    const handleSearchInput = (e) => {
        const v = e.target.value;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => handleSearch(v), 500);
    };

    const handleFilter = (key) => (value) => {
        dispatch(setFilter({ key, value }));
    };

    const handleDatePreset = (days) => {
        const today = new Date();
        const end = isoDate(today);
        if (days === 0) {
            dispatch(setFilter({ key: "start_date", value: end }));
            dispatch(setFilter({ key: "end_date", value: end }));
        } else {
            const start = new Date(today);
            start.setDate(start.getDate() - days);
            dispatch(setFilter({ key: "start_date", value: isoDate(start) }));
            dispatch(setFilter({ key: "end_date", value: end }));
        }
    };

    const handleReset = () => {
        clearTimeout(debounceRef.current);
        dispatch(resetFilters());
    };

    const hasActiveFilters =
        filters.status ||
        filters.payment_status ||
        filters.reschedule_status ||
        filters.start_date ||
        filters.end_date ||
        filters.search;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            {/* Row 1 — Search + Status + Payment + Reschedule */}
            <div className="flex flex-wrap gap-2 items-center">
                <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />

                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, name, or email…"
                        defaultValue={filters.search}
                        onChange={handleSearchInput}
                        className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700
                       placeholder:text-slate-400 bg-white hover:border-slate-300 transition-colors"
                    />
                </div>

                <Select value={filters.status} onChange={handleFilter("status")} options={STATUS_OPTIONS} className="min-w-[140px]" />
                <Select value={filters.payment_status} onChange={handleFilter("payment_status")} options={PAYMENT_OPTIONS} className="min-w-[150px]" />
                <Select value={filters.reschedule_status} onChange={handleFilter("reschedule_status")} options={RESCHEDULE_OPTIONS} className="min-w-[140px]" />
            </div>

            {/* Row 2 — Date presets + custom range + reset */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[11px] text-slate-400 font-medium ml-6">Date range:</span>

                {DATE_PRESETS.map((p) => (
                    <button
                        key={p.label}
                        onClick={() => handleDatePreset(p.days)}
                        className="h-7 px-3 text-[11px] font-medium rounded-lg border border-slate-200
                       text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700
                       transition-colors"
                    >
                        {p.label}
                    </button>
                ))}

                <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilter("start_date")(e.target.value)}
                    className="h-7 px-2 text-[11px] rounded-lg border border-slate-200 text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-slate-300 text-xs">→</span>
                <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilter("end_date")(e.target.value)}
                    className="h-7 px-2 text-[11px] rounded-lg border border-slate-200 text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />

                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="ml-auto flex items-center gap-1 h-7 px-3 text-[11px] font-medium
                       rounded-lg border border-red-200 text-red-600 bg-red-50
                       hover:bg-red-100 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Reset filters
                    </button>
                )}
            </div>
        </div>
    );
}
