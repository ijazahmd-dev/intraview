import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, Plus, AlertCircle } from 'lucide-react';

// Hooks
import usePayoutList from '../hooks/usePayoutList';
import usePayoutStats from '../hooks/usePayoutStats';

// Components
import PayoutStatsCards from '..//components/PayoutStatsCards';
import FilterBar from '..//components/FilterBar';
import PayoutTable from '..//components/PayoutTable';
import PayoutCard from '../components/PayoutCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';

/**
 * PayoutHistoryPage - View all payout requests with filtering
 * Route: /interviewer/payout/history
 */
const PayoutHistoryPage = () => {
  const navigate = useNavigate();

  // Fetch payout list with pagination
  const {
    payouts,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    goToPage,
  } = usePayoutList();

  // Fetch stats
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = usePayoutStats();

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  // Calculate total pages
  const totalPages = Math.ceil(pagination.count / filters.page_size);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/interviewer/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-7 h-7 text-primary" />
                  Payout History
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View and track all your payout requests
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/interviewer/payout/request')}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              New Payout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <PayoutStatsCards
            stats={stats}
            loading={statsLoading}
            error={statsError}
          />

          {/* Filter Bar */}
          <FilterBar
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Failed to Load Payouts
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payout List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              {loading ? (
                <PayoutTable payouts={[]} loading={true} />
              ) : payouts.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No payout requests found"
                  description={
                    filters.status
                      ? "No payouts match the selected filters. Try adjusting your filters."
                      : "You haven't made any payout requests yet. Create your first payout request to get started."
                  }
                  action={
                    !filters.status && (
                      <button
                        onClick={() => navigate('/interviewer/payout/request')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5" />
                        Request Payout
                      </button>
                    )
                  }
                />
              ) : (
                <PayoutTable payouts={payouts} loading={false} />
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg h-40 animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No payout requests found"
                  description={
                    filters.status
                      ? "No payouts match the selected filters."
                      : "You haven't made any payout requests yet."
                  }
                  action={
                    !filters.status && (
                      <button
                        onClick={() => navigate('/interviewer/payout/request')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5" />
                        Request Payout
                      </button>
                    )
                  }
                />
              ) : (
                <div className="p-4 space-y-4">
                  {payouts.map((payout) => (
                    <PayoutCard key={payout.id} payout={payout} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {payouts.length > 0 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                totalCount={pagination.count}
                pageSize={filters.page_size}
                onPageChange={goToPage}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutHistoryPage;
