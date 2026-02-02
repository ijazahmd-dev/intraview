import React from 'react';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';

/**
 * AdminActionButtons Component
 * Action buttons for admin payout management
 */
const AdminActionButtons = ({
  status,
  onApprove,
  onReject,
  onMarkPaid,
  loading = false,
}) => {
  // REQUESTED status - can approve or reject
  if (status === 'REQUESTED') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReject}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="w-5 h-5" />
          Reject Request
        </button>
        <button
          onClick={onApprove}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          Approve Request
        </button>
      </div>
    );
  }

  // APPROVED status - can mark as paid
  if (status === 'APPROVED') {
    return (
      <button
        onClick={onMarkPaid}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DollarSign className="w-5 h-5" />
        Mark as Paid
      </button>
    );
  }

  // PAID or REJECTED - no actions available
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
      No actions available for this status
    </div>
  );
};

export default AdminActionButtons;
