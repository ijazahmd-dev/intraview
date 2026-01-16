// src/pages/interviewer/InterviewerWalletPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  fetchWalletSummary,
  fetchTransactions,
  fetchEarnings,
  fetchWalletStats,
  setFilter,
} from '../../interviewerWalletSlice';

const InterviewerWalletPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { summary, transactions, earnings, stats, loading, error, filters } = useSelector(
    (state) => state.interviewerWallet
  );

  useEffect(() => {
  if (error) {
    toast.error(error);
  }
}, [error]);

  useEffect(() => {
    console.log('🔥 DISPATCHING - About to call transactions...');
    
    dispatch(fetchWalletSummary()).then(console.log).catch(console.error);
    dispatch(fetchEarnings()).then(console.log).catch(console.error);
    dispatch(fetchWalletStats()).then(console.log).catch(console.error);
    
    const txPromise = dispatch(fetchTransactions({ page: 1, pageSize: 20 }));
    console.log('🚀 Transactions dispatched, promise:', txPromise);
    
    txPromise.then((result) => {
      console.log('✅ Transactions SUCCESS:', result);
    }).catch((err) => {
      console.error('❌ Transactions FAILED:', err);
    });
  }, [dispatch]);

  const handleFilterChange = (type) => {
    dispatch(setFilter(type));
    dispatch(fetchTransactions({ 
      page: 1, 
      pageSize: 20, 
      type: type || null 
    }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchTransactions({ 
      page, 
      pageSize: transactions.pageSize, 
      type: filters.type 
    }));
  };

  const transactionTypeLabels = {
    SESSION_EARN: 'Session Earned',
    TOKEN_PURCHASE: 'Token Purchase',
    ADMIN_ADJUSTMENT: 'Admin Adjustment',
    REFUND: 'Refund',
    PENALTY_DEDUCTION: 'Penalty Deduction',
  };



  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            My Wallet
          </h1>
          <p className="text-xl text-slate-600 mt-2">Your earnings dashboard</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-semibold">
          Interviewer
        </div>
      </div>

      {/* Wallet Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Available Balance */}
          <div className="group bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
                </svg>
              </div>
              <span className="text-emerald-200 text-sm font-medium uppercase tracking-wide">
                Available
              </span>
            </div>
            <p className="text-4xl font-bold mb-1">{summary.available_balance || 0}</p>
            <p className="text-lg opacity-90">Ready to withdraw</p>
          </div>

          {/* Locked Balance */}
          <div className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8h-1V6c0-2.757-2.243-5-5-5S7 3.243 7 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 4a2 2 0 11-4 0 2 2 0 014 0zM12.5 15a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
              </div>
              <span className="text-orange-200 text-sm font-medium uppercase tracking-wide">
                Locked
              </span>
            </div>
            <p className="text-4xl font-bold mb-1">{summary.locked_balance || 0}</p>
            <p className="text-lg opacity-90">Pending sessions</p>
          </div>

          {/* Total Balance */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium uppercase tracking-wide">
                Total
              </span>
            </div>
            <p className="text-4xl font-bold mb-1">{summary.total_balance || 0}</p>
            <p className="text-lg opacity-90">Lifetime earnings</p>
          </div>
        </div>
      )}

      {/* Earnings Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Earnings */}
        {earnings && (
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
              </svg>
              Total Earnings
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">All Time</span>
                <p className="text-4xl font-bold">{earnings.tokens_earned_total || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/20">
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide mb-1">Last 7 Days</p>
                  <p className="text-2xl font-bold">+{earnings.earnings_last_7_days || 0}</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide mb-1">Last 30 Days</p>
                  <p className="text-2xl font-bold">+{earnings.earnings_last_30_days || 0}</p>
                </div>
              </div>
              <p className="text-emerald-100 text-sm mt-4">
                {earnings.completed_sessions_count || 0} completed sessions
              </p>
            </div>
          </div>
        )}

        {/* Withdraw Placeholder */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-3xl border-2 border-dashed border-slate-300 shadow-xl group hover:border-slate-400 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl text-white shadow-lg group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Withdraw Earnings
              </h3>
              <p className="text-slate-600">Convert tokens to money</p>
            </div>
          </div>
          <button
            disabled
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 opacity-75 cursor-not-allowed"
            title="Coming Soon"
          >
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Coming Soon
          </button>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Bank transfer & PayPal integration in progress
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Transaction History</h2>
            <p className="text-slate-600 mt-1">
              {transactions.count || 0} total transactions
            </p>
          </div>
          
          {/* Filter Dropdown */}
          <select
            value={filters.type || 'ALL'}
            onChange={(e) => handleFilterChange(e.target.value === 'ALL' ? null : e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-semibold bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <option value="ALL">All Transactions</option>
            <option value="SESSION_EARN">Session Earnings</option>
            <option value="TOKEN_PURCHASE">Purchases</option>
            <option value="ADMIN_ADJUSTMENT">Admin Adjustments</option>
            <option value="REFUND">Refunds</option>
          </select>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : transactions.results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No transactions yet</h3>
            <p className="text-slate-600">Complete your first session to earn tokens!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-slate-200">
              {transactions.results.map((tx) => (
                <div
                  key={tx.id}
                  className="py-6 px-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Date */}
                    <div className="col-span-2">
                      <p className="font-semibold text-slate-900">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(tx.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Type & Note */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.amount > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {transactionTypeLabels[tx.transaction_type] || tx.transaction_type}
                          </p>
                          {tx.note && (
                            <p className="text-sm text-slate-600 truncate max-w-xs">
                              {tx.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reference ID */}
                    <div className="col-span-2 text-center hidden md:block">
                      <p className="text-sm font-mono bg-slate-100 px-3 py-1 rounded-xl">
                        {tx.reference_id || '-'}
                      </p>
                    </div>

                    {/* Balances After */}
                    <div className="col-span-2 text-right">
                      <p className="font-bold text-lg text-slate-900">
                        {tx.balance_after || '—'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Locked: {tx.locked_balance_after || '—'}
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="col-span-2 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.amount > 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.amount > 0 ? 'EARNED' : 'DEDUCTED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {transactions.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {transactions.pageSize * (transactions.page - 1) + 1} to{' '}
              {Math.min(transactions.pageSize * transactions.page, transactions.count)} of{' '}
              {transactions.count} transactions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(transactions.page - 1)}
                disabled={transactions.page === 1}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(transactions.page + 1)}
                disabled={transactions.page === transactions.totalPages}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerWalletPage;
