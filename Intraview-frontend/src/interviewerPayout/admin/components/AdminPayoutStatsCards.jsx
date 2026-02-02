import React from 'react';
import { Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../../interviewer/components/StatCard';

/**
 * AdminPayoutStatsCards Component
 * Displays admin-specific payout statistics
 */
const AdminPayoutStatsCards = ({ stats, loading, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
        <p className="text-sm text-red-800 dark:text-red-200">
          Failed to load statistics: {error}
        </p>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Pending Requests',
      value: stats?.pending_count || 0,
      subtitle: 'Awaiting approval',
      icon: Clock,
      colorClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Pending Amount',
      value: `₹${(stats?.pending_amount || 0).toLocaleString()}`,
      subtitle: `${stats?.pending_count || 0} requests`,
      icon: DollarSign,
      colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Paid This Month',
      value: `₹${(stats?.paid_this_month || 0).toLocaleString()}`,
      subtitle: `${stats?.paid_count_this_month || 0} payouts`,
      icon: CheckCircle,
      colorClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      title: 'Rejected This Month',
      value: stats?.rejected_count_this_month || 0,
      subtitle: 'Declined requests',
      icon: XCircle,
      colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          colorClass={stat.colorClass}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default AdminPayoutStatsCards;
