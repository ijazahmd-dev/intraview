import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * PayoutStatusBadge Component
 * Color-coded status badge for payout requests
 */
const PayoutStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      REQUESTED: {
        label: 'Pending Review',
        icon: Clock,
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300',
        borderClass: 'border-orange-200 dark:border-orange-800',
      },
      APPROVED: {
        label: 'Approved',
        icon: AlertCircle,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-200 dark:border-blue-800',
      },
      PAID: {
        label: 'Completed',
        icon: CheckCircle,
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        borderClass: 'border-green-200 dark:border-green-800',
      },
      REJECTED: {
        label: 'Rejected',
        icon: XCircle,
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-300',
        borderClass: 'border-red-200 dark:border-red-800',
      },
    };

    return configs[status] || {
      label: status,
      icon: AlertCircle,
      bgClass: 'bg-gray-100 dark:bg-gray-700',
      textClass: 'text-gray-700 dark:text-gray-300',
      borderClass: 'border-gray-200 dark:border-gray-600',
    };
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${config.bgClass} ${config.textClass} ${config.borderClass}
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
};

export default PayoutStatusBadge;
