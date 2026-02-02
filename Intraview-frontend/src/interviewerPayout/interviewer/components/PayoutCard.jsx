import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Coins, 
  IndianRupee, 
  ExternalLink,
  Eye
} from 'lucide-react';
import PayoutStatusBadge from './PayoutStatusBadge';

/**
 * PayoutCard Component
 * Mobile-friendly card view for payout items
 */
const PayoutCard = ({ payout }) => {
  const navigate = useNavigate();

  const {
    id,
    reference_number,
    status,
    tokens_requested,
    amount_inr,
    requested_at,
    paid_at,
    masked_account,
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

  const handleViewDetails = () => {
    navigate(`/interviewer/payout/${id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {reference_number}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Account: {masked_account}
          </p>
        </div>
        <PayoutStatusBadge status={status} size="sm" />
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

      {/* Date Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Requested: {formatDate(requested_at)}</span>
        </div>
        {paid_at && (
          <div className="text-xs text-green-600 dark:text-green-400">
            Paid: {formatDate(paid_at)}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleViewDetails}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
    </div>
  );
};

export default PayoutCard;
