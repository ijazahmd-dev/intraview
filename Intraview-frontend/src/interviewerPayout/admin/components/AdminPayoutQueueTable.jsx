import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Calendar, Coins, IndianRupee, User } from 'lucide-react';
import PayoutStatusBadge from '../../interviewer/components/PayoutStatusBadge';

/**
 * AdminPayoutQueueTable Component
 * Desktop table view for pending payout requests
 */
const AdminPayoutQueueTable = ({ payouts, loading, onApprove, onReject }) => {
  const navigate = useNavigate();

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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Interviewer
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Tokens
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Requested Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Account
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {payouts.map((payout) => (
            <tr
              key={payout.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              {/* Reference Number */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {payout.reference_number}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {payout.id}
                  </p>
                </div>
              </td>

              {/* Interviewer */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {payout.interviewer_name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payout.interviewer_email || 'N/A'}
                    </p>
                  </div>
                </div>
              </td>

              {/* Tokens */}
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Coins className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {payout.tokens_requested}
                  </span>
                </div>
              </td>

              {/* Amount */}
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <IndianRupee className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {parseFloat(payout.amount_inr).toLocaleString()}
                  </span>
                </div>
              </td>

              {/* Requested Date */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p>{formatDate(payout.requested_at)}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(payout.requested_at)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Account */}
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {payout.masked_account}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/payout/${payout.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => onApprove(payout)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg transition-colors duration-200"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(payout)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors duration-200"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Table Loading Skeleton
 */
const TableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Reference</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Interviewer</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Tokens</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Account</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div></td>
              <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div></td>
              <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto animate-pulse"></div></td>
              <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto animate-pulse"></div></td>
              <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div></td>
              <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div></td>
              <td className="px-4 py-4 text-center"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPayoutQueueTable;
