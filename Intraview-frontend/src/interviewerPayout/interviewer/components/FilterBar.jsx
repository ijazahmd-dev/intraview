import React, { useState } from 'react';
import { Filter, X, Search } from 'lucide-react';

/**
 * FilterBar Component
 * Status filter and search for payout list
 */
const FilterBar = ({ onFilterChange, currentFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'REQUESTED', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PAID', label: 'Completed' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  const handleStatusChange = (status) => {
    onFilterChange({ status });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange({ search: searchTerm });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ status: '', search: '' });
  };

  const hasActiveFilters = currentFilters.status || currentFilters.search;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter Dropdown */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Filter by Status
          </label>
          <select
            value={currentFilters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search (Optional - for future reference number search) */}
        {/* <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Search Reference
          </label>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reference number..."
              className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </form>
        </div> */}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Active filters:</span>
          {currentFilters.status && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
              {statusOptions.find((opt) => opt.value === currentFilters.status)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
