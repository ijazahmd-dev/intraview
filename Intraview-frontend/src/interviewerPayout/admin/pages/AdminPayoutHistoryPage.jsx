import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import useAdminPayoutList from '../hooks/useAdminPayoutList';

// Components
import AdminFilterBar from '../components/AdminFilterBar';
import PayoutStatusBadge from '../../interviewer/components/PayoutStatusBadge';
import Pagination from '../../interviewer/components/Pagination';
import EmptyState from '../../interviewer/components/Pagination';
import StatCard from '../../interviewer/components/StatCard';

// Icons
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';

/**
 * AdminPayoutHistoryPage - View complete payout history with filters
 * Route: /admin/payout/history
 */
const AdminPayoutHistoryPage = () => {
  const navigate = useNavigate();

  // Filter state
  const [localFilters, setLocalFilters] = useState({
    status: 'ALL',
    date_range: 'ALL',
    min_amount: '',
    max_amount: '',
    search: '',
  });

  const [exportLoading, setExportLoading] = useState(false);

  // Fetch history with filters
  const {
    items: payouts,
    pagination,
    loading,
    error,
    filters,
    goToPage,
    setFilters,
  } = useAdminPayoutList('history', localFilters);

  // Calculate total pages
  const totalPages = Math.ceil(pagination.count / filters.page_size);

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  // Handle export
  const handleExport = async () => {
    setExportLoading(true);
    
    try {
      // Import the export function
      const { exportPayoutsToCSV } = await import('../../adminPayoutApi');
      const result = await exportPayoutsToCSV(localFilters);

      if (result.success) {
        // Create a blob and download
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payout-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Export completed successfully!');
      } else {
        toast.error(result.error || 'Failed to export data');
      }
    } catch (err) {
      toast.error('Export failed');
    }
    
    setExportLoading(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate stats from current filtered data
  const stats = {
    total_paid: payouts.filter((p) => p.status === 'PAID').length,
    total_rejected: payouts.filter((p) => p.status === 'REJECTED').length,
    total_amount_paid: payouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount_inr || 0), 0),
    total_approved: payouts.filter((p) => p.status === 'APPROVED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
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
                  View and analyze all payout requests
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/payout/queue')}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              ← Back to Queue
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Paid"
              value={stats.total_paid}
              subtitle="Completed payouts"
              icon={CheckCircle}
              colorClass="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              loading={loading}
            />
            <StatCard
              title="Amount Paid"
              value={`₹${stats.total_amount_paid.toLocaleString()}`}
              subtitle={`${stats.total_paid} payouts`}
              icon={DollarSign}
              colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              loading={loading}
            />
            <StatCard
              title="Approved (Pending Payment)"
              value={stats.total_approved}
              subtitle="Awaiting payment"
              icon={CheckCircle}
              colorClass="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
              loading={loading}
            />
            <StatCard
              title="Rejected"
              value={stats.total_rejected}
              subtitle="Declined requests"
              icon={XCircle}
              colorClass="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              loading={loading}
            />
          </div>

          {/* Filter Bar */}
          <AdminFilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            exportLoading={exportLoading}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Failed to Load History
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* History Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              {loading ? (
                <HistoryTableSkeleton />
              ) : payouts.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No payouts found"
                  description="No payout requests match your current filters. Try adjusting the filters."
                  variant="default"
                />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Reference
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Interviewer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {payout.reference_number}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payout.tokens_requested} tokens
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payout.interviewer_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payout.interviewer_email}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{parseFloat(payout.amount_inr).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <PayoutStatusBadge status={payout.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(payout.requested_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => navigate(`/admin/payout/${payout.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No payouts found"
                  description="No payout requests match your filters."
                />
              ) : (
                <div className="p-4 space-y-4">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {payout.reference_number}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {payout.interviewer_name}
                          </p>
                        </div>
                        <PayoutStatusBadge status={payout.status} />
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Amount
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{parseFloat(payout.amount_inr).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Date
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(payout.requested_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/payout/${payout.id}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
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

/**
 * Table Loading Skeleton
 */
const HistoryTableSkeleton = () => {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            Reference
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            Interviewer
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
            Amount
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            Date
          </th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i}>
            <td className="px-4 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </td>
            <td className="px-4 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            </td>
            <td className="px-4 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto animate-pulse"></div>
            </td>
            <td className="px-4 py-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
            </td>
            <td className="px-4 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </td>
            <td className="px-4 py-4 text-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto animate-pulse"></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminPayoutHistoryPage;
