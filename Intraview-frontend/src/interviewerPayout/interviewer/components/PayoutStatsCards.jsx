import React from 'react';
import { 
  Coins, 
  CheckCircle, 
  Clock, 
  XCircle 
} from 'lucide-react';
import StatCard from './StatCard';

/**
 * PayoutStatsCards Component
 * Displays 4 key statistics for interviewer's payouts
 */
const PayoutStatsCards = ({ stats, loading, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          Failed to load statistics: {error}
        </p>
      </div>
    );
  }

  // Default values if stats not loaded
  const {
    total_tokens_requested = 0,
    total_tokens_paid = 0,
    total_amount_paid_inr = 0,
    pending_count = 0,
    completed_count = 0,
    rejected_count = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tokens Requested */}
      <StatCard
        title="Total Requested"
        value={`${total_tokens_requested} tokens`}
        subtitle={`₹${total_tokens_requested * 10}`}
        icon={Coins}
        colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        loading={loading}
      />

      {/* Total Paid */}
      <StatCard
        title="Total Paid"
        value={`₹${total_amount_paid_inr.toFixed(2)}`}
        subtitle={`${total_tokens_paid} tokens`}
        icon={CheckCircle}
        colorClass="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        loading={loading}
      />

      {/* Pending Count */}
      <StatCard
        title="Pending"
        value={pending_count}
        subtitle={pending_count === 1 ? 'payout request' : 'payout requests'}
        icon={Clock}
        colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        loading={loading}
      />

      {/* Completed Count */}
      <StatCard
        title="Completed"
        value={completed_count}
        subtitle={`${rejected_count} rejected`}
        icon={CheckCircle}
        colorClass="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
        loading={loading}
      />
    </div>
  );
};

export default PayoutStatsCards;
