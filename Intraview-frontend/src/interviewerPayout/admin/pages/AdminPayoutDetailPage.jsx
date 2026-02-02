import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Coins,
  IndianRupee,
  CreditCard,
  Building2,
  Phone,
  User,
  Mail,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// Hooks
import useAdminPayoutDetail from '../hooks/useAdminPayoutDetail';

// Components
import PayoutStatusBadge from '../../interviewer/components/PayoutStatusBadge';
import PayoutTimeline from '../../interviewer/components/PayoutTimeline';
import AdminActionButtons from '../components/AdminActionButtons';
import AdminApprovalModal from '../components/AdminApprovalModal';
import AdminRejectionModal from '../components/AdminRejectionModal';
import AdminMarkPaidModal from '../components/AdminMarkPaidModal';

/**
 * AdminPayoutDetailPage - View and manage single payout request
 * Route: /admin/payout/:id
 */
const AdminPayoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    payout,
    loading,
    error,
    actionLoading,
    handleApprove,
    handleReject,
    handleMarkPaid,
  } = useAdminPayoutDetail(id);

  // Modal states
  const [approvalModal, setApprovalModal] = useState(false);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle approve confirm
  const handleApproveConfirm = async (payload) => {
    const result = await handleApprove(payload);
    if (result.success) {
      toast.success('Payout approved successfully!');
      setApprovalModal(false);
    } else {
      toast.error(result.error || 'Failed to approve payout');
    }
  };

  // Handle reject confirm
  const handleRejectConfirm = async (payload) => {
    const result = await handleReject(payload);
    if (result.success) {
      toast.success('Payout rejected');
      setRejectionModal(false);
    } else {
      toast.error(result.error || 'Failed to reject payout');
    }
  };

  // Handle mark paid confirm
  const handleMarkPaidConfirm = async (payload) => {
    const result = await handleMarkPaid(payload);
    if (result.success) {
      toast.success('Payout marked as paid!');
      setMarkPaidModal(false);
    } else {
      toast.error(result.error || 'Failed to mark as paid');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/payout/queue')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 h-48 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Payout
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate('/admin/payout/queue')}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!payout) return null;

  const {
    reference_number,
    status,
    tokens_requested,
    amount_inr,
    token_rate_snapshot,
    bank_account_number,
    ifsc_code,
    account_holder_name,
    mobile_number,
    interviewer_name,
    interviewer_email,
    interviewer_phone,
    requested_at,
    admin_notes,
    rejection_reason,
  } = payout;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/payout/queue')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-7 h-7 text-primary" />
                  {reference_number}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Admin payout management
                </p>
              </div>
            </div>
            <PayoutStatusBadge status={status} size="lg" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payout Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payout Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tokens */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Coins className="w-4 h-4" />
                    <span>Tokens Requested</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tokens_requested}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Rate: ₹{parseFloat(token_rate_snapshot).toFixed(2)} per token
                  </p>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 mb-2">
                    <IndianRupee className="w-4 h-4" />
                    <span>Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ₹{parseFloat(amount_inr).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    {tokens_requested} × ₹{parseFloat(token_rate_snapshot).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Interviewer Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Interviewer Details
              </h2>
              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Full Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {interviewer_name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {interviewer_email || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone Number
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {interviewer_phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bank Details
              </h2>
              <div className="space-y-4">
                {/* Account Number - FULL (not masked for admin) */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Account Number
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {bank_account_number}
                    </p>
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      IFSC Code
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {ifsc_code}
                    </p>
                  </div>
                </div>

                {/* Account Holder */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Account Holder Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {account_holder_name}
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Mobile Number
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      +91 {mobile_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes / Rejection Reason */}
            {(admin_notes || rejection_reason) && (
              <div
                className={`rounded-lg border p-6 ${
                  status === 'REJECTED'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {status === 'REJECTED' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        status === 'REJECTED'
                          ? 'text-red-900 dark:text-red-100'
                          : 'text-blue-900 dark:text-blue-100'
                      }`}
                    >
                      {status === 'REJECTED' ? 'Rejection Reason' : 'Admin Notes'}
                    </h3>
                    <p
                      className={`text-sm ${
                        status === 'REJECTED'
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {rejection_reason || admin_notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Admin Actions
              </h2>
              <AdminActionButtons
                status={status}
                onApprove={() => setApprovalModal(true)}
                onReject={() => setRejectionModal(true)}
                onMarkPaid={() => setMarkPaidModal(true)}
                loading={actionLoading}
              />
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <PayoutTimeline payout={payout} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminApprovalModal
        isOpen={approvalModal}
        onClose={() => setApprovalModal(false)}
        onConfirm={handleApproveConfirm}
        payout={payout}
        loading={actionLoading}
      />

      <AdminRejectionModal
        isOpen={rejectionModal}
        onClose={() => setRejectionModal(false)}
        onConfirm={handleRejectConfirm}
        payout={payout}
        loading={actionLoading}
      />

      <AdminMarkPaidModal
        isOpen={markPaidModal}
        onClose={() => setMarkPaidModal(false)}
        onConfirm={handleMarkPaidConfirm}
        payout={payout}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminPayoutDetailPage;
