import React from 'react';
import { Filter, X, Download } from 'lucide-react';

/**
 * AdminFilterBar Component
 * Advanced filtering for admin payout history
 */
const AdminFilterBar = ({ filters, onFilterChange, onExport, exportLoading }) => {
  const {
    status = 'ALL',
    date_range = 'ALL',
    min_amount = '',
    max_amount = '',
    search = '',
  } = filters;

  const handleReset = () => {
    onFilterChange({
      status: 'ALL',
      date_range: 'ALL',
      min_amount: '',
      max_amount: '',
      search: '',
    });
  };

  const hasActiveFilters =
    status !== 'ALL' ||
    date_range !== 'ALL' ||
    min_amount ||
    max_amount ||
    search;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
          <button
            onClick={onExport}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Reference or interviewer name..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <select
            value={date_range}
            onChange={(e) => onFilterChange({ ...filters, date_range: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="LAST_3_MONTHS">Last 3 Months</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={min_amount}
              onChange={(e) =>
                onFilterChange({ ...filters, min_amount: e.target.value })
              }
              placeholder="Min"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={max_amount}
              onChange={(e) =>
                onFilterChange({ ...filters, max_amount: e.target.value })
              }
              placeholder="Max"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFilterBar;
