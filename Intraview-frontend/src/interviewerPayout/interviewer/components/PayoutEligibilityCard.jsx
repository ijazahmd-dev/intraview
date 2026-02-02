import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Wallet, 
  ShieldCheck,
  Clock,
  Info
} from 'lucide-react';

/**
 * PayoutEligibilityCard Component
 * Shows if interviewer can request payout with detailed breakdown
 */
const PayoutEligibilityCard = ({ eligibility, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
              Failed to Load Eligibility
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eligibility) return null;

  const { 
    can_request, 
    wallet_balance, 
    verification_status, 
    active_payout, 
    min_tokens_required 
  } = eligibility;

  const available = wallet_balance.available || 0;
  const total = wallet_balance.total || 0;
  const locked = wallet_balance.locked || 0;

  // Determine overall status
  const getStatusConfig = () => {
    if (can_request) {
      return {
        icon: CheckCircle2,
        color: 'green',
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        borderClass: 'border-green-200 dark:border-green-800',
        iconClass: 'text-green-600 dark:text-green-400',
        textClass: 'text-green-900 dark:text-green-100',
        subtextClass: 'text-green-700 dark:text-green-300',
        title: 'Eligible for Payout',
        message: 'You can request a payout now!',
      };
    } else {
      return {
        icon: XCircle,
        color: 'red',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        borderClass: 'border-red-200 dark:border-red-800',
        iconClass: 'text-red-600 dark:text-red-400',
        textClass: 'text-red-900 dark:text-red-100',
        subtextClass: 'text-red-700 dark:text-red-300',
        title: 'Not Eligible',
        message: 'Please resolve the issues below to request payout.',
      };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-lg border ${status.borderClass} ${status.bgClass} p-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <StatusIcon className={`w-6 h-6 ${status.iconClass} flex-shrink-0 mt-0.5`} />
        <div>
          <h3 className={`text-lg font-semibold ${status.textClass} mb-1`}>
            {status.title}
          </h3>
          <p className={`text-sm ${status.subtextClass}`}>
            {status.message}
          </p>
        </div>
      </div>

      {/* Eligibility Checks */}
      <div className="space-y-3 mb-4">
        {/* Wallet Balance Check */}
        <EligibilityCheck
          icon={Wallet}
          label="Wallet Balance"
          passed={available >= min_tokens_required}
          detail={`Available: ${available} tokens (Minimum: ${min_tokens_required})`}
        />

        {/* Verification Status Check */}
        <EligibilityCheck
          icon={ShieldCheck}
          label="Verification Status"
          passed={verification_status === 'APPROVED'}
          detail={
            verification_status === 'APPROVED'
              ? 'Your account is verified'
              : `Status: ${verification_status}`
          }
        />

        {/* Active Payout Check */}
        <EligibilityCheck
          icon={Clock}
          label="Pending Payout"
          passed={!active_payout}
          detail={
            active_payout
              ? `You have an active payout: ${active_payout}`
              : 'No pending payout requests'
          }
        />
      </div>

      {/* Wallet Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Wallet Details
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {total}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {available}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Locked</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {locked}
            </p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Current rate: <strong>₹10 per token</strong>. Minimum payout: {min_tokens_required} tokens (₹{min_tokens_required * 10}).
        </p>
      </div>
    </div>
  );
};

/**
 * Individual Eligibility Check Item
 */
const EligibilityCheck = ({ icon: Icon, label, passed, detail }) => {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        passed 
          ? 'bg-green-100 dark:bg-green-900/30' 
          : 'bg-red-100 dark:bg-red-900/30'
      }`}>
        {passed ? (
          <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
        </div>
        <p className={`text-xs ${
          passed 
            ? 'text-gray-600 dark:text-gray-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {detail}
        </p>
      </div>
    </div>
  );
};

export default PayoutEligibilityCard;
