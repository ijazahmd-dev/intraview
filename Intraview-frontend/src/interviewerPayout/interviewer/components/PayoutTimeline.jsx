import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar
} from 'lucide-react';

/**
 * PayoutTimeline Component
 * Visual timeline showing payout status progression
 */
const PayoutTimeline = ({ payout }) => {
  const {
    status,
    requested_at,
    updated_at,
    paid_at,
  } = payout;

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  // Timeline steps based on status
  const getTimelineSteps = () => {
    const steps = [
      {
        label: 'Requested',
        icon: Clock,
        status: 'completed',
        date: formatDateTime(requested_at),
        description: 'Payout request submitted',
      },
    ];

    if (status === 'REQUESTED') {
      steps.push({
        label: 'Under Review',
        icon: AlertCircle,
        status: 'current',
        date: null,
        description: 'Waiting for admin approval',
      });
      steps.push({
        label: 'Pending Payment',
        icon: Clock,
        status: 'upcoming',
        date: null,
        description: 'Payment processing',
      });
      steps.push({
        label: 'Completed',
        icon: CheckCircle,
        status: 'upcoming',
        date: null,
        description: 'Payment successful',
      });
    } else if (status === 'APPROVED') {
      steps.push({
        label: 'Approved',
        icon: CheckCircle,
        status: 'completed',
        date: formatDateTime(updated_at),
        description: 'Request approved by admin',
      });
      steps.push({
        label: 'Payment Processing',
        icon: Clock,
        status: 'current',
        date: null,
        description: 'Payment in progress',
      });
      steps.push({
        label: 'Completed',
        icon: CheckCircle,
        status: 'upcoming',
        date: null,
        description: 'Payment successful',
      });
    } else if (status === 'PAID') {
      steps.push({
        label: 'Approved',
        icon: CheckCircle,
        status: 'completed',
        date: formatDateTime(updated_at),
        description: 'Request approved',
      });
      steps.push({
        label: 'Payment Processed',
        icon: CheckCircle,
        status: 'completed',
        date: formatDateTime(paid_at),
        description: 'Payment successful',
      });
      steps.push({
        label: 'Completed',
        icon: CheckCircle,
        status: 'completed',
        date: formatDateTime(paid_at),
        description: 'Payout completed',
      });
    } else if (status === 'REJECTED') {
      steps.push({
        label: 'Rejected',
        icon: XCircle,
        status: 'rejected',
        date: formatDateTime(updated_at),
        description: 'Request rejected by admin',
      });
    }

    return steps;
  };

  const steps = getTimelineSteps();

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return {
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          line: 'bg-green-500',
        };
      case 'current':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          line: 'bg-gray-300 dark:bg-gray-600',
        };
      case 'rejected':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          line: 'bg-gray-300 dark:bg-gray-600',
        };
      default:
        return {
          iconBg: 'bg-gray-100 dark:bg-gray-700',
          iconColor: 'text-gray-400 dark:text-gray-500',
          line: 'bg-gray-300 dark:bg-gray-600',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Payout Timeline
      </h3>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const colors = getStepColor(step.status);
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 bottom-0 w-0.5 -mb-6 ${colors.line}`}
                  style={{ height: 'calc(100% + 1.5rem)' }}
                ></div>
              )}

              {/* Step Content */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${colors.iconBg}`}>
                  <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                </div>

                {/* Details */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {step.label}
                    </h4>
                    {step.date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{step.date.date}</span>
                        <span className="text-gray-400">•</span>
                        <span>{step.date.time}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PayoutTimeline;
