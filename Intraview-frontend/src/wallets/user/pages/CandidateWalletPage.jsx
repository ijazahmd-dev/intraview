// // src/pages/candidate/CandidateWalletPage.jsx
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import {
//   fetchWalletSummary,
//   fetchTransactions,
//   fetchWalletStats,
//   setFilter,
// } from '../../candidateWalletSlice';
// import CandidateNavbar from '../../../components/CandidateNavbar';
// import CandidateFooter from '../../../components/CandidateFooter';

// const CandidateWalletPage = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { summary, transactions, stats, loading, error, filters } = useSelector(
//     (state) => state.candidateWallet
//   );

//   useEffect(() => {
//     dispatch(fetchWalletSummary());
//     dispatch(fetchWalletStats());
//     dispatch(fetchTransactions({ page: 1, pageSize: 20 }));
//   }, [dispatch]);

//   const handleFilterChange = (type) => {
//     dispatch(setFilter(type));
//     dispatch(fetchTransactions({
//       page: 1,
//       pageSize: 20,
//       type: type || null
//     }));
//   };

//   const handlePageChange = (page) => {
//     dispatch(fetchTransactions({
//       page,
//       pageSize: transactions.pageSize,
//       type: filters.type
//     }));
//   };

//   const transactionTypeLabels = {
//     TOKEN_PURCHASE: 'Token Purchase',
//     BOOKING_LOCK: 'Booking Locked',
//     BOOKING_RELEASE: 'Booking Released',
//     SESSION_SPEND: 'Session Spent',
//     REFUND: 'Refund',
//     SUBSCRIPTION_GRANT: 'Subscription Grant',
//     ADMIN_ADJUSTMENT: 'Admin Adjustment',
//   };

//   if (error) {
//     toast.error(error);
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <CandidateNavbar />
//       <div className="flex-grow space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold tracking-tight text-slate-900">
//               My Wallet
//             </h1>
//             <p className="text-xl text-slate-600 mt-2">Manage your tokens</p>
//           </div>
//           <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold">
//             Candidate
//           </div>
//         </div>

//         {/* Wallet Summary Cards */}
//         {summary && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Available Balance */}
//             <div className="group bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
//                   </svg>
//                 </div>
//                 <span className="text-emerald-200 text-sm font-medium uppercase tracking-wide">
//                   Available
//                 </span>
//               </div>
//               <p className="text-4xl font-bold mb-1">{summary.available_balance || 0}</p>
//               <p className="text-lg opacity-90">Ready to spend</p>
//             </div>

//             {/* Locked Balance */}
//             <div className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 8h-1V6c0-2.757-2.243-5-5-5S7 3.243 7 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 4a2 2 0 11-4 0 2 2 0 014 0zM12.5 15a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
//                   </svg>
//                 </div>
//                 <span className="text-orange-200 text-sm font-medium uppercase tracking-wide">
//                   Locked
//                 </span>
//               </div>
//               <p className="text-4xl font-bold mb-1">{summary.locked_balance || 0}</p>
//               <p className="text-lg opacity-90">In active bookings</p>
//             </div>

//             {/* Total Balance */}
//             <div className="group bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
//                   </svg>
//                 </div>
//                 <span className="text-slate-300 text-sm font-medium uppercase tracking-wide">
//                   Total
//                 </span>
//               </div>
//               <p className="text-4xl font-bold mb-1">{summary.total_balance || 0}</p>
//               <p className="text-lg opacity-90">All time</p>
//             </div>
//           </div>
//         )}

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Buy Tokens */}
//           <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
//             <div className="flex items-center gap-4 mb-6">
//               <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg">
//                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
//                   Buy Tokens
//                 </h3>
//                 <p className="text-slate-600">Get more tokens instantly</p>
//               </div>
//             </div>
//             <button
//               onClick={() => navigate('/tokens')}
//               className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5" />
//               </svg>
//               Buy Now
//             </button>
//           </div>

//           {/* Stats Summary */}
//           {stats && (
//             <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-3xl border border-slate-200 shadow-xl">
//               <h3 className="text-2xl font-bold text-slate-900 mb-6">This Month</h3>
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
//                     Purchased
//                   </p>
//                   <p className="text-2xl font-bold text-emerald-600">
//                     +{stats.tokens_purchased_total || 0}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
//                     Spent
//                   </p>
//                   <p className="text-2xl font-bold text-rose-600">
//                     -{stats.tokens_spent_total || 0}
//                   </p>
//                 </div>
//               </div>
//               <div className="mt-6 pt-6 border-t border-slate-200">
//                 <p className="text-sm text-slate-500">
//                   Total transactions: {stats.transactions_count || 0}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Transaction History */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl p-8">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//             <div>
//               <h2 className="text-3xl font-bold text-slate-900">Transaction History</h2>
//               <p className="text-slate-600 mt-1">
//                 {transactions.count || 0} total transactions
//               </p>
//             </div>

//             {/* Filter Dropdown */}
//             <select
//               value={filters.type || 'ALL'}
//               onChange={(e) => handleFilterChange(e.target.value === 'ALL' ? null : e.target.value)}
//               className="px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold bg-white shadow-sm hover:shadow-md transition-all duration-200"
//             >
//               <option value="ALL">All Transactions</option>
//               <option value="TOKEN_PURCHASE">Purchases</option>
//               <option value="BOOKING_LOCK">Booking Locks</option>
//               <option value="SESSION_SPEND">Sessions Spent</option>
//               <option value="REFUND">Refunds</option>
//               <option value="SUBSCRIPTION_GRANT">Subscriptions</option>
//             </select>
//           </div>

//           {/* Transactions Table */}
//           {loading ? (
//             <div className="flex items-center justify-center py-20">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//             </div>
//           ) : transactions.results.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
//                 <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold text-slate-900 mb-2">No transactions</h3>
//               <p className="text-slate-600">Your transaction history will appear here.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <div className="min-w-full divide-y divide-slate-200">
//                 {transactions.results.map((tx) => (
//                   <div
//                     key={tx.id}
//                     className="py-6 px-4 hover:bg-slate-50 rounded-2xl transition-colors group"
//                   >
//                     <div className="grid grid-cols-12 gap-4 items-center">
//                       {/* Date */}
//                       <div className="col-span-2">
//                         <p className="font-semibold text-slate-900">
//                           {new Date(tx.created_at).toLocaleDateString('en-US', {
//                             month: 'short',
//                             day: 'numeric',
//                           })}
//                         </p>
//                         <p className="text-sm text-slate-500">
//                           {new Date(tx.created_at).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit',
//                           })}
//                         </p>
//                       </div>

//                       {/* Type & Note */}
//                       <div className="col-span-4">
//                         <div className="flex items-center gap-3">
//                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.amount > 0
//                             ? 'bg-emerald-100 text-emerald-800'
//                             : 'bg-rose-100 text-rose-800'
//                             }`}>
//                             {tx.amount > 0 ? '+' : ''}{tx.amount}
//                           </span>
//                           <div>
//                             <p className="font-semibold text-slate-900">
//                               {transactionTypeLabels[tx.transaction_type] || tx.transaction_type}
//                             </p>
//                             {tx.note && (
//                               <p className="text-sm text-slate-600 truncate max-w-xs">
//                                 {tx.note}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Reference ID */}
//                       <div className="col-span-2 text-center hidden md:block">
//                         <p className="text-sm font-mono bg-slate-100 px-3 py-1 rounded-xl">
//                           {tx.reference_id || '-'}
//                         </p>
//                       </div>

//                       {/* Balances After */}
//                       <div className="col-span-2 text-right">
//                         <p className="font-bold text-lg text-slate-900">
//                           {tx.balance_after || '—'}
//                         </p>
//                         <p className="text-xs text-slate-500">
//                           Locked: {tx.locked_balance_after || '—'}
//                         </p>
//                       </div>

//                       {/* Status Indicator */}
//                       <div className="col-span-2 text-right">
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.amount > 0
//                           ? 'bg-emerald-100 text-emerald-800'
//                           : 'bg-rose-100 text-rose-800'
//                           }`}>
//                           {tx.amount > 0 ? 'CREDIT' : 'DEBIT'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Pagination */}
//           {transactions.totalPages > 1 && (
//             <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200">
//               <div className="text-sm text-slate-600">
//                 Showing {transactions.pageSize * (transactions.page - 1) + 1} to{' '}
//                 {Math.min(transactions.pageSize * transactions.page, transactions.count)} of{' '}
//                 {transactions.count} transactions
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handlePageChange(transactions.page - 1)}
//                   disabled={transactions.page === 1}
//                   className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(transactions.page + 1)}
//                   disabled={transactions.page === transactions.totalPages}
//                   className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <CandidateFooter />
//     </div>
//   );
// };

// export default CandidateWalletPage;


























// src/pages/candidate/CandidateWalletPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  fetchWalletSummary,
  fetchTransactions,
  fetchWalletStats,
  setFilter,
} from '../../candidateWalletSlice';
import CandidateNavbar from '../../../components/CandidateNavbar';
import CandidateFooter from '../../../components/CandidateFooter';

const BRAND = {
  teal: '#0BB5A0',
  dark: '#111827',
  amber: '#F5C518',
  light: '#F5F5F5',
  tealDim: '#09907E',
  tealFaint: '#E6F7F5',
  darkMid: '#1F2937',
  darkMute: '#374151',
  amberFaint: '#FFFBEA',
  muted: '#6B7280',
  border: '#E5E7EB',
};

const transactionTypeLabels = {
  TOKEN_PURCHASE: 'Token Purchase',
  BOOKING_LOCK: 'Booking Locked',
  BOOKING_RELEASE: 'Booking Released',
  SESSION_SPEND: 'Session Spent',
  REFUND: 'Refund',
  SUBSCRIPTION_GRANT: 'Subscription Grant',
  ADMIN_ADJUSTMENT: 'Admin Adjustment',
};

/* ─── tiny shared primitives ─── */

const Tag = ({ children, variant = 'teal' }) => {
  const map = {
    teal: { bg: BRAND.tealFaint, color: BRAND.tealDim },
    amber: { bg: BRAND.amberFaint, color: '#92710A' },
    red: { bg: '#FEF2F2', color: '#B91C1C' },
    dark: { bg: BRAND.light, color: BRAND.darkMute },
  };
  const s = map[variant] || map.teal;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: s.bg, color: s.color,
    }}>
      {children}
    </span>
  );
};

const Divider = () => (
  <div style={{ height: 1, background: BRAND.border, margin: '0 0 8px' }} />
);

/* ─── Balance Cards ─── */
const BalanceCard = ({ label, value, accent, icon, sub }) => (
  <div style={{
    borderRadius: 20, padding: '28px 28px 24px',
    background: BRAND.dark,
    border: `2px solid ${BRAND.darkMid}`,
    position: 'relative', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', gap: 12,
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 12px 40px rgba(11,181,160,0.18)`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* top accent bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 4,
      background: accent, borderRadius: '20px 20px 0 0',
    }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: BRAND.muted,
      }}>
        {label}
      </span>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: accent + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18, color: accent }}>{icon}</span>
      </div>
    </div>

    <div>
      <p style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>
        {value ?? 0}
      </p>
      <p style={{ fontSize: 13, color: BRAND.muted, margin: '4px 0 0', fontWeight: 500 }}>
        {sub}
      </p>
    </div>
  </div>
);

/* ─── Transaction Row ─── */
const TxRow = ({ tx }) => {
  const isCredit = tx.amount > 0;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr 100px 110px 80px',
      gap: 12, alignItems: 'center',
      padding: '16px 20px',
      borderRadius: 14,
      transition: 'background 0.15s',
      cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Date */}
      <div>
        <p style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark, margin: 0 }}>
          {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
        <p style={{ fontSize: 12, color: BRAND.muted, margin: '2px 0 0' }}>
          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Label + note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: isCredit ? BRAND.teal : '#EF4444',
        }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: BRAND.dark, margin: 0 }}>
            {transactionTypeLabels[tx.transaction_type] || tx.transaction_type}
          </p>
          {tx.note && (
            <p style={{
              fontSize: 12, color: BRAND.muted, margin: '2px 0 0',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {tx.note}
            </p>
          )}
        </div>
      </div>

      {/* Ref */}
      <div>
        <span style={{
          fontSize: 11, fontFamily: 'monospace',
          background: BRAND.light, color: BRAND.muted,
          padding: '4px 8px', borderRadius: 6, display: 'inline-block',
        }}>
          {tx.reference_id || '—'}
        </span>
      </div>

      {/* Balance after */}
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, margin: 0 }}>
          {tx.balance_after ?? '—'}
        </p>
        <p style={{ fontSize: 11, color: BRAND.muted, margin: '2px 0 0' }}>
          Locked: {tx.locked_balance_after ?? '—'}
        </p>
      </div>

      {/* Amount badge */}
      <div style={{ textAlign: 'right' }}>
        <span style={{
          display: 'inline-block',
          fontWeight: 800, fontSize: 14,
          color: isCredit ? BRAND.tealDim : '#B91C1C',
          background: isCredit ? BRAND.tealFaint : '#FEF2F2',
          padding: '5px 12px', borderRadius: 20,
        }}>
          {isCredit ? '+' : ''}{tx.amount}
        </span>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const CandidateWalletPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { summary, transactions, stats, loading, error, filters } = useSelector(
    (state) => state.candidateWallet
  );

  useEffect(() => {
    dispatch(fetchWalletSummary());
    dispatch(fetchWalletStats());
    dispatch(fetchTransactions({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  const handleFilterChange = (type) => {
    dispatch(setFilter(type));
    dispatch(fetchTransactions({ page: 1, pageSize: 20, type: type || null }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchTransactions({ page, pageSize: transactions.pageSize, type: filters.type }));
  };

  if (error) toast.error(error);

  return (
    <div style={{ minHeight: '100vh', background: BRAND.light, display: 'flex', flexDirection: 'column' }}>
      <CandidateNavbar />

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px', width: '100%' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 40,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 5, height: 36, background: BRAND.teal, borderRadius: 4,
              }} />
              <h1 style={{
                margin: 0,
                fontSize: 38, fontWeight: 900, letterSpacing: '-0.03em',
                color: BRAND.dark,
              }}>
                My Wallet
              </h1>
            </div>
            <p style={{ margin: 0, marginLeft: 15, color: BRAND.muted, fontSize: 15, fontWeight: 500 }}>
              Token balance & transaction history
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: BRAND.dark, color: BRAND.amber,
            padding: '8px 18px', borderRadius: 12,
            fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: BRAND.teal, display: 'inline-block',
            }} />
            Candidate
          </div>
        </div>

        {/* ── BALANCE CARDS ── */}
        {summary && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20, marginBottom: 28,
          }}>
            <BalanceCard
              label="Available Balance"
              value={summary.available_balance}
              accent={BRAND.teal}
              icon="◈"
              sub="Ready to spend"
            />
            <BalanceCard
              label="Locked Balance"
              value={summary.locked_balance}
              accent={BRAND.amber}
              icon="⊗"
              sub="In active bookings"
            />
            <BalanceCard
              label="Total Balance"
              value={summary.total_balance}
              accent="#6B7280"
              icon="◉"
              sub="All time accumulated"
            />
          </div>
        )}

        {/* ── ACTIONS + STATS ROW ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, marginBottom: 28,
        }}>

          {/* Buy Tokens CTA */}
          <div style={{
            background: '#fff', borderRadius: 20,
            border: `1.5px solid ${BRAND.border}`,
            padding: '28px 28px 24px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div>
              <Tag variant="teal">Quick Action</Tag>
              <h3 style={{
                margin: '10px 0 4px', fontSize: 22, fontWeight: 800,
                color: BRAND.dark, letterSpacing: '-0.02em',
              }}>
                Need more tokens?
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: BRAND.muted, lineHeight: 1.6 }}>
                Top up your wallet instantly and keep your sessions uninterrupted.
              </p>
            </div>

            <button
              onClick={() => navigate('/tokens')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: BRAND.dark, color: BRAND.amber,
                border: 'none', borderRadius: 14,
                padding: '16px 24px', fontSize: 15, fontWeight: 800,
                cursor: 'pointer', letterSpacing: '0.02em',
                transition: 'background 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = BRAND.teal;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = BRAND.dark;
                e.currentTarget.style.color = BRAND.amber;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Buy Tokens Now
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{
              background: BRAND.dark, borderRadius: 20,
              padding: '28px 28px 24px',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: BRAND.muted,
                }}>
                  Monthly Overview
                </span>
                <Tag variant="amber">This Month</Tag>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{
                  background: BRAND.darkMid, borderRadius: 14, padding: '16px 18px',
                }}>
                  <p style={{
                    margin: '0 0 6px', fontSize: 11, fontWeight: 700,
                    color: BRAND.muted, textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    Purchased
                  </p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: BRAND.teal }}>
                    +{stats.tokens_purchased_total || 0}
                  </p>
                </div>
                <div style={{
                  background: BRAND.darkMid, borderRadius: 14, padding: '16px 18px',
                }}>
                  <p style={{
                    margin: '0 0 6px', fontSize: 11, fontWeight: 700,
                    color: BRAND.muted, textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    Spent
                  </p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#F87171' }}>
                    -{stats.tokens_spent_total || 0}
                  </p>
                </div>
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.darkMute}`,
                paddingTop: 12,
                fontSize: 13, color: BRAND.muted,
              }}>
                {stats.transactions_count || 0} total transactions this period
              </div>
            </div>
          )}
        </div>

        {/* ── TRANSACTION HISTORY ── */}
        <div style={{
          background: '#fff', borderRadius: 24,
          border: `1.5px solid ${BRAND.border}`,
          overflow: 'hidden',
        }}>
          {/* Table Header Bar */}
          <div style={{
            background: BRAND.dark,
            padding: '24px 28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h2 style={{
                margin: 0, fontSize: 22, fontWeight: 800,
                color: '#fff', letterSpacing: '-0.02em',
              }}>
                Transaction History
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: BRAND.muted }}>
                {transactions.count || 0} total records
              </p>
            </div>

            <select
              value={filters.type || 'ALL'}
              onChange={(e) => handleFilterChange(e.target.value === 'ALL' ? null : e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 12,
                border: `1.5px solid ${BRAND.darkMute}`,
                background: BRAND.darkMid, color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All Transactions</option>
              <option value="TOKEN_PURCHASE">Purchases</option>
              <option value="BOOKING_LOCK">Booking Locks</option>
              <option value="SESSION_SPEND">Sessions Spent</option>
              <option value="REFUND">Refunds</option>
              <option value="SUBSCRIPTION_GRANT">Subscriptions</option>
            </select>
          </div>

          {/* Column Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 100px 110px 80px',
            gap: 12, padding: '12px 20px',
            background: BRAND.light,
            borderBottom: `1px solid ${BRAND.border}`,
          }}>
            {['Date', 'Transaction', 'Reference', 'Balance After', 'Amount'].map((h, i) => (
              <div key={i} style={{
                fontSize: 11, fontWeight: 700, color: BRAND.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                textAlign: i >= 3 ? 'right' : 'left',
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '60px 0', gap: 14,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `3px solid ${BRAND.teal}`,
                  borderTopColor: 'transparent',
                  animation: 'spin 0.75s linear infinite',
                }} />
                <span style={{ color: BRAND.muted, fontSize: 14, fontWeight: 500 }}>
                  Loading transactions…
                </span>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : transactions.results.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: BRAND.light,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: BRAND.muted,
                }}>
                  ◷
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: BRAND.dark }}>
                  No transactions yet
                </p>
                <p style={{ margin: 0, fontSize: 14, color: BRAND.muted }}>
                  Your history will appear here once you make a transaction.
                </p>
              </div>
            ) : (
              transactions.results.map((tx) => <TxRow key={tx.id} tx={tx} />)
            )}
          </div>

          {/* Pagination */}
          {transactions.totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 24px',
              borderTop: `1px solid ${BRAND.border}`,
              background: BRAND.light,
            }}>
              <span style={{ fontSize: 13, color: BRAND.muted }}>
                Showing{' '}
                {transactions.pageSize * (transactions.page - 1) + 1}–
                {Math.min(transactions.pageSize * transactions.page, transactions.count)}{' '}
                of {transactions.count}
              </span>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handlePageChange(transactions.page - 1)}
                  disabled={transactions.page === 1}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    border: `1.5px solid ${BRAND.border}`,
                    background: transactions.page === 1 ? BRAND.light : '#fff',
                    color: transactions.page === 1 ? BRAND.border : BRAND.dark,
                    cursor: transactions.page === 1 ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => handlePageChange(transactions.page + 1)}
                  disabled={transactions.page === transactions.totalPages}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    border: `1.5px solid ${BRAND.border}`,
                    background: transactions.page === transactions.totalPages ? BRAND.light : BRAND.dark,
                    color: transactions.page === transactions.totalPages ? BRAND.border : BRAND.amber,
                    cursor: transactions.page === transactions.totalPages ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
      <CandidateFooter />
    </div>
  );
};

export default CandidateWalletPage;