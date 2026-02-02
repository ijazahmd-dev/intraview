import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Coins, IndianRupee, User, Eye, CheckCircle, XCircle } from 'lucide-react';

/**
 * AdminPayoutQueueCard Component
 * Mobile-friendly card view for pending payout requests
 */
const AdminPayoutQueueCard = ({ payout, onApprove, onReject }) => {
  const navigate = useNavigate();

  const {
    id,
    reference_number,
    tokens_requested,
    amount_inr,
    requested_at,
    masked_account,
    interviewer_name,
    interviewer_email,
  } = payout;

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {reference_number}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <User className="w-3 h-3" />
            <span>{interviewer_name || 'N/A'}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {interviewer_email}
          </p>
        </div>
      </div>

      {/* Amount Details */}
      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Coins className="w-3 h-3" />
            <span>Tokens</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {tokens_requested}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <IndianRupee className="w-3 h-3" />
            <span>Amount</span>
          </div>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            ₹{parseFloat(amount_inr).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Date & Account */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Requested: {formatDate(requested_at)}</span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-mono">{masked_account}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate(`/admin/payout/${id}`)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg transition-colors duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button
          onClick={() => onApprove(payout)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg transition-colors duration-200"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          onClick={() => onReject(payout)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg transition-colors duration-200"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  );
};

export default AdminPayoutQueueCard;
