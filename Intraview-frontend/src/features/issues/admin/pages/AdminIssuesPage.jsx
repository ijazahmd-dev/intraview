// src/features/issues/admin/pages/AdminIssuesPage.jsx


import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

import {
  fetchAdminIssues,
  selectAdminIssues,
  selectAdminIssuesPagination,
  selectAdminIssuesListLoading,
  selectAdminIssuesListError,
  selectAdminIssueFilters,
  setAdminIssueFilters,
  resetAdminIssueFilters,
} from "../../slices/adminIssuesSlice";

import AdminIssueFilter from "../components/AdminIssueFilter";
import AdminIssueCard from "../components/AdminIssueCard";

// ─── Skeletons ────────────────────────────────────────────────────────────────

const IssueCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 animate-pulse">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="h-4 w-4 bg-gray-100 rounded mt-1" />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ hasFilters, onClear }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <span className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4">
      <Inbox className="w-7 h-7 text-gray-300" />
    </span>
    <h3 className="text-base font-semibold text-gray-800 mb-1">
      {hasFilters ? "No issues match your filters" : "No issues yet"}
    </h3>
    <p className="text-sm text-gray-400 max-w-xs mb-5">
      {hasFilters
        ? "Try adjusting your filters or clearing them to see all issues."
        : "When users report booking issues, they will appear here."}
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
      >
        Clear all filters
      </button>
    )}
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <span className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <AlertCircle className="w-7 h-7 text-red-400" />
    </span>
    <h3 className="text-base font-semibold text-gray-800 mb-1">
      Failed to load issues
    </h3>
    <p className="text-sm text-gray-400 max-w-xs mb-5">
      Something went wrong while fetching issues. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Retry
    </button>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AdminIssuesPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const issues    = useSelector(selectAdminIssues);
  const pagination = useSelector(selectAdminIssuesPagination);
  const loading   = useSelector(selectAdminIssuesListLoading);
  const error     = useSelector(selectAdminIssuesListError);
  const filters   = useSelector(selectAdminIssueFilters);

  // ── On mount — load with persisted filters ──
  useEffect(() => {
    dispatch(fetchAdminIssues(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (appliedFilters) => {
      dispatch(fetchAdminIssues(appliedFilters));
    },
    [dispatch]
  );

  const handleClearFilters = useCallback(() => {
    dispatch(resetAdminIssueFilters());
    dispatch(fetchAdminIssues({}));
  }, [dispatch]);

  const handleCardClick = useCallback(
    (issueId) => {
      navigate(`/admin/issues/${issueId}`);
    },
    [navigate]
  );

  const hasActiveFilters =
    !!(filters.status || filters.priority || filters.issue_type || filters.search);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reported Issues</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading
                ? "Loading..."
                : `${pagination.count ?? issues.length} issue${
                    (pagination.count ?? issues.length) !== 1 ? "s" : ""
                  } total`}
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchAdminIssues(filters))}
            disabled={loading}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white border border-gray-100 transition disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters */}
        <AdminIssueFilter onSearch={handleSearch} />

        {/* List */}
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <IssueCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState onRetry={() => dispatch(fetchAdminIssues(filters))} />
          ) : issues.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClear={handleClearFilters}
            />
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <AdminIssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination hint (if backend sends next/previous) */}
        {!loading && !error && pagination.next && (
          <p className="text-center text-sm text-gray-400">
            Showing {issues.length} of {pagination.count}. Pagination coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminIssuesPage;