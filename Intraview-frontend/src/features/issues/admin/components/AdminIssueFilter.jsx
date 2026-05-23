// src/features/issues/admin/components/AdminIssueFilter.jsx




import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, X } from "lucide-react";

import {
  setAdminIssueFilters,
  resetAdminIssueFilters,
  selectAdminIssueFilters,
} from "../../slices/adminIssuesSlice";

import {
  ISSUE_STATUS_OPTIONS,
  ISSUE_PRIORITY_OPTIONS,
  ISSUE_TYPE_OPTIONS,
} from "../../constants/issueConstants";

// ─── Select Field ─────────────────────────────────────────────────────────────

const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-500">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AdminIssueFilter = ({ onSearch }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectAdminIssueFilters);

  const hasActiveFilters =
    filters.status || filters.priority || filters.issue_type || filters.search;

  const handleChange = (key, value) => {
    dispatch(setAdminIssueFilters({ [key]: value }));
  };

  const handleReset = () => {
    dispatch(resetAdminIssueFilters());
    onSearch?.({});
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch?.(filters);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">

      {/* Search bar */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Booking ID or user email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => handleChange("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => handleChange("status", v)}
          options={ISSUE_STATUS_OPTIONS}
          placeholder="All Statuses"
        />
        <FilterSelect
          label="Priority"
          value={filters.priority}
          onChange={(v) => handleChange("priority", v)}
          options={ISSUE_PRIORITY_OPTIONS}
          placeholder="All Priorities"
        />
        <FilterSelect
          label="Issue Type"
          value={filters.issue_type}
          onChange={(v) => handleChange("issue_type", v)}
          options={ISSUE_TYPE_OPTIONS}
          placeholder="All Types"
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onSearch?.(filters)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminIssueFilter;