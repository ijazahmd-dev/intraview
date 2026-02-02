import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import useAdminPayoutList from '../hooks/useAdminPayoutList';
import useAdminPayoutStats from '../hooks/useAdminPayoutStats';

// Components
import AdminPayoutStatsCards from '../components/AdminPayoutStatsCards';
import AdminPayoutQueueTable from '../components/AdminPayoutQueueTable';
import AdminPayoutQueueCard from '../components/AdminPayoutQueueCard';
import AdminApprovalModal from '../components/AdminApprovalModal';
import AdminRejectionModal from '../components/AdminRejectionModal';
import Pagination from '../../interviewer/components/Pagination';
import EmptyState from '../../interviewer/components/EmptyState';

/**
 * AdminPayoutQueuePage - Manage pending payout requests
 * Route: /admin/payout/queue
 */
const AdminPayoutQueuePage = () => {
  const navigate = useNavigate();

  // Fetch pending payouts (status = REQUESTED)
  const {
    items: payouts,
    pagination,
    loading,
    error,
    filters,
    goToPage,
    refetch,
  } = useAdminPayoutList('queue', { status: 'REQUESTED' });

  // Fetch stats
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useAdminPayoutStats();

  // Modal states
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, payout: null });
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, payout: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(pagination.count / filters.page_size);

  // Handle approve click
  const handleApproveClick = (payout) => {
    setApprovalModal({ isOpen: true, payout });
  };

  // Handle reject click
  const handleRejectClick = (payout) => {
    setRejectionModal({ isOpen: true, payout });
  };

  // Handle approve confirm
  const handleApproveConfirm = async (payload) => {
    setActionLoading(true);
    
    // Import the action
    const { approvePayout } = await import('../../adminPayoutApi');
    const result = await approvePayout(approvalModal.payout.id, payload);

    if (result.success) {
      toast.success(`Payout ${approvalModal.payout.reference_number} approved successfully!`);
      setApprovalModal({ isOpen: false, payout: null });
      refetch();
    } else {
      toast.error(result.error || 'Failed to approve payout');
    }

    setActionLoading(false);
  };

  // Handle reject confirm
  const handleRejectConfirm = async (payload) => {
    setActionLoading(true);
    
    // Import the action
    const { rejectPayout } = await import('../../adminPayoutApi');
    const result = await rejectPayout(rejectionModal.payout.id, payload);

    if (result.success) {
      toast.success(`Payout ${rejectionModal.payout.reference_number} rejected`);
      setRejectionModal({ isOpen: false, payout: null });
      refetch();
    } else {
      toast.error(result.error || 'Failed to reject payout');
    }

    setActionLoading(false);
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
                  <Clock className="w-7 h-7 text-orange-500" />
                  Payout Queue
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage pending payout requests
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/payout/history')}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              View History →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <AdminPayoutStatsCards
            stats={stats}
            loading={statsLoading}
            error={statsError}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Failed to Load Queue
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              {loading ? (
                <AdminPayoutQueueTable payouts={[]} loading={true} />
              ) : payouts.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No pending payouts"
                  description="All payout requests have been processed. New requests will appear here."
                  variant="default"
                />
              ) : (
                <AdminPayoutQueueTable
                  payouts={payouts}
                  loading={false}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                />
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No pending payouts"
                  description="All requests have been processed."
                />
              ) : (
                <div className="p-4 space-y-4">
                  {payouts.map((payout) => (
                    <AdminPayoutQueueCard
                      key={payout.id}
                      payout={payout}
                      onApprove={handleApproveClick}
                      onReject={handleRejectClick}
                    />
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

      {/* Modals */}
      <AdminApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, payout: null })}
        onConfirm={handleApproveConfirm}
        payout={approvalModal.payout}
        loading={actionLoading}
      />

      <AdminRejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, payout: null })}
        onConfirm={handleRejectConfirm}
        payout={rejectionModal.payout}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminPayoutQueuePage;
