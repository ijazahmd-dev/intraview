
// import React, { useEffect, useState, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import InterviewerCard from '../components/InterviewerCard.jsx';
// import Filters from '../components/Filters.jsx';
// import { candidateBookingsApi } from '../../candidateBookingsApi.js';

// const BrowseInterviewers = () => {
//   const [interviewers, setInterviewers] = useState([]);
//   const [filteredInterviewers, setFilteredInterviewers] = useState([]);
//   const [tokenBalance, setTokenBalance] = useState(0);  // 🔥 NEW STATE
//   const [loading, setLoading] = useState(true);
//   const [tokenLoading, setTokenLoading] = useState(true);  // 🔥 NEW STATE
//   const [filters, setFilters] = useState({
//     specialization: '',
//     maxPrice: '',
//     date: '',
//   });

//   // 🔥 DEDICATED TOKEN FETCH
//   const fetchTokenBalance = useCallback(async () => {
//     try {
//       setTokenLoading(true);
//       const response = await candidateBookingsApi.getTokenBalance();
//       setTokenBalance(response.data.token_balance);
//     } catch (error) {
//       console.error('Token balance fetch failed:', error);
//       toast.error('Failed to load token balance');
//       setTokenBalance(0);
//     } finally {
//       setTokenLoading(false);
//     }
//   }, []);

//   const fetchInterviewers = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await candidateBookingsApi.getInterviewers({
//         specialization: filters.specialization || undefined,
//         max_price: filters.maxPrice || undefined,
//         date: filters.date || undefined,
//       });
//       setInterviewers(response.data);
//       setFilteredInterviewers(response.data);
//       toast.success(`${response.data.length} interviewers available`);
//     } catch (error) {
//       toast.error('Failed to load interviewers');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   // 🔥 LOAD BOTH ON MOUNT
//   useEffect(() => {
//     fetchTokenBalance();
//     fetchInterviewers();
//   }, [fetchTokenBalance, fetchInterviewers]);

//   // 🔥 REFRESH ON FILTER CHANGE
//   useEffect(() => {
//     fetchInterviewers();
//   }, [fetchInterviewers]);

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//   };

//   const clearFilters = () => {
//     setFilters({ specialization: '', maxPrice: '', date: '' });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-8"></div>
//             <p className="text-2xl font-semibold text-gray-700">Loading top interviewers...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//       <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-20">
//           <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent mb-6">
//             Find Your Interviewer
//           </h1>
//           <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
//             Connect with verified, subscription-active interviewers for mock interviews and career guidance
//           </p>
//           <div className="mt-8 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl max-w-md mx-auto">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-emerald-800">
//                   {tokenLoading ? '...' : `${tokenBalance} tokens`}
//                 </div>
//                 <div className="text-sm text-emerald-700">
//                   {tokenLoading ? 'Loading...' : 'Available balance'}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <Filters
//           filters={filters}
//           onFilterChange={handleFilterChange}
//           onClearFilters={clearFilters}
//           interviewers={interviewers}
//           className="mb-16"
//         />

//         {/* Results */}
//         {filteredInterviewers.length === 0 ? (
//           <div className="text-center py-32">
//             <svg className="w-32 h-32 text-gray-400 mx-auto mb-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="currentColor" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2h0a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//             </svg>
//             <h2 className="text-4xl font-bold text-gray-900 mb-6">No interviewers found</h2>
//             <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
//               Try adjusting your filters or check back later for new availability
//             </p>
//             <button
//               onClick={clearFilters}
//               className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
//             >
//               Clear Filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredInterviewers.map((interviewer) => (
//               <InterviewerCard
//                 key={interviewer.id}
//                 interviewer={interviewer}
//                 tokenBalance={tokenBalance}  // 🔥 PASSES FRESH VALUE
//               />
//             ))}
//           </div>
//         )}

//         <div className="mt-20 text-center">
//           <p className="text-lg text-gray-600">
//             Only verified, subscription-active interviewers accepting bookings
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BrowseInterviewers;





























// import React, { useEffect, useState, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import InterviewerCard from '../components/InterviewerCard.jsx';
// import Filters from '../components/Filters.jsx';
// import { candidateBookingsApi } from '../../candidateBookingsApi.js';

// /* ─────────────────────────────────────────────
//    IntraView Brand Tokens
//    Primary teal: #1D9E75  (brand green from design ref)
//    Dark navy:    #0D1B2A
//    Surface:      #F7F9FC
//    Card bg:      #FFFFFF
//    Border:       #E4EAF0
// ───────────────────────────────────────────── */

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

//   .iv-browse-root {
//     min-height: 100vh;
//     background: #F7F9FC;
//     font-family: 'DM Sans', sans-serif;
//     color: #0D1B2A;
//   }

//   /* ── Hero Banner ── */
//   .iv-hero {
//     background: #FFFFFF;
//     border-bottom: 1px solid #E4EAF0;
//     padding: 56px 0 48px;
//     position: relative;
//     overflow: hidden;
//   }

//   .iv-hero::before {
//     content: '';
//     position: absolute;
//     top: -80px; right: -80px;
//     width: 320px; height: 320px;
//     background: radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%);
//     border-radius: 50%;
//     pointer-events: none;
//   }

//   .iv-hero::after {
//     content: '';
//     position: absolute;
//     bottom: -60px; left: -60px;
//     width: 240px; height: 240px;
//     background: radial-gradient(circle, rgba(29,158,117,0.05) 0%, transparent 70%);
//     border-radius: 50%;
//     pointer-events: none;
//   }

//   .iv-container {
//     max-width: 1200px;
//     margin: 0 auto;
//     padding: 0 32px;
//   }

//   .iv-hero-inner {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 48px;
//   }

//   .iv-hero-text {
//     flex: 1;
//     min-width: 0;
//   }

//   .iv-eyebrow {
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     background: #E1F5EE;
//     color: #0F6E56;
//     font-size: 12px;
//     font-weight: 600;
//     letter-spacing: 0.08em;
//     text-transform: uppercase;
//     padding: 5px 12px;
//     border-radius: 100px;
//     margin-bottom: 20px;
//   }

//   .iv-eyebrow-dot {
//     width: 6px; height: 6px;
//     background: #1D9E75;
//     border-radius: 50%;
//   }

//   .iv-hero-title {
//     font-family: 'DM Serif Display', serif;
//     font-size: 48px;
//     line-height: 1.1;
//     color: #0D1B2A;
//     margin: 0 0 16px;
//     font-weight: 400;
//   }

//   .iv-hero-title em {
//     font-style: italic;
//     color: #1D9E75;
//   }

//   .iv-hero-subtitle {
//     font-size: 16px;
//     line-height: 1.65;
//     color: #4A5568;
//     margin: 0;
//     max-width: 480px;
//   }

//   /* ── Token Balance Card ── */
//   .iv-token-card {
//     background: #FFFFFF;
//     border: 1px solid #E4EAF0;
//     border-radius: 16px;
//     padding: 24px 28px;
//     min-width: 220px;
//     position: relative;
//     flex-shrink: 0;
//   }

//   .iv-token-card-accent {
//     position: absolute;
//     top: 0; left: 0; right: 0;
//     height: 3px;
//     background: linear-gradient(90deg, #1D9E75, #5DCAA5);
//     border-radius: 16px 16px 0 0;
//   }

//   .iv-token-label {
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: 0.08em;
//     text-transform: uppercase;
//     color: #9AA5B4;
//     margin: 0 0 10px;
//   }

//   .iv-token-amount {
//     font-family: 'DM Serif Display', serif;
//     font-size: 36px;
//     line-height: 1;
//     color: #0D1B2A;
//     margin: 0 0 4px;
//   }

//   .iv-token-amount span {
//     font-family: 'DM Sans', sans-serif;
//     font-size: 16px;
//     font-weight: 500;
//     color: #4A5568;
//     margin-left: 4px;
//   }

//   .iv-token-sub {
//     font-size: 12px;
//     color: #1D9E75;
//     font-weight: 500;
//     display: flex;
//     align-items: center;
//     gap: 4px;
//     margin: 0;
//   }

//   .iv-token-sub svg {
//     width: 12px; height: 12px;
//   }

//   .iv-token-skeleton {
//     display: inline-block;
//     width: 80px;
//     height: 36px;
//     background: linear-gradient(90deg, #F0F4F8 25%, #E4EAF0 50%, #F0F4F8 75%);
//     background-size: 200% 100%;
//     animation: iv-shimmer 1.4s infinite;
//     border-radius: 6px;
//   }

//   /* ── Stats Row ── */
//   .iv-stats-bar {
//     display: flex;
//     align-items: center;
//     gap: 0;
//     margin-top: 20px;
//   }

//   .iv-stat-item {
//     display: flex;
//     flex-direction: column;
//     padding-right: 28px;
//     margin-right: 28px;
//     border-right: 1px solid #E4EAF0;
//   }

//   .iv-stat-item:last-child {
//     border-right: none;
//     padding-right: 0;
//     margin-right: 0;
//   }

//   .iv-stat-value {
//     font-size: 20px;
//     font-weight: 600;
//     color: #0D1B2A;
//     line-height: 1;
//   }

//   .iv-stat-label {
//     font-size: 12px;
//     color: #9AA5B4;
//     margin-top: 3px;
//   }

//   /* ── Content Area ── */
//   .iv-content {
//     padding: 40px 0 80px;
//   }

//   /* ── Section Header ── */
//   .iv-section-header {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     margin-bottom: 24px;
//   }

//   .iv-section-title {
//     font-size: 18px;
//     font-weight: 600;
//     color: #0D1B2A;
//     margin: 0;
//   }

//   .iv-result-count {
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     background: #E1F5EE;
//     color: #0F6E56;
//     font-size: 13px;
//     font-weight: 600;
//     padding: 4px 12px;
//     border-radius: 100px;
//   }

//   /* ── Filters Wrapper ── */
//   .iv-filters-wrapper {
//     background: #FFFFFF;
//     border: 1px solid #E4EAF0;
//     border-radius: 14px;
//     padding: 20px 24px;
//     margin-bottom: 32px;
//   }

//   .iv-filters-label {
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: 0.08em;
//     text-transform: uppercase;
//     color: #9AA5B4;
//     margin-bottom: 14px;
//     display: flex;
//     align-items: center;
//     gap: 6px;
//   }

//   .iv-filters-label svg {
//     width: 14px; height: 14px;
//     color: #9AA5B4;
//   }

//   /* ── Grid ── */
//   .iv-grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
//     gap: 20px;
//   }

//   /* ── Loading State ── */
//   .iv-loading {
//     min-height: 100vh;
//     background: #F7F9FC;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     gap: 24px;
//     font-family: 'DM Sans', sans-serif;
//   }

//   .iv-spinner-wrap {
//     position: relative;
//     width: 52px; height: 52px;
//   }

//   .iv-spinner {
//     position: absolute; inset: 0;
//     border: 2.5px solid #E4EAF0;
//     border-top-color: #1D9E75;
//     border-radius: 50%;
//     animation: iv-spin 0.8s linear infinite;
//   }

//   .iv-spinner-inner {
//     position: absolute;
//     inset: 8px;
//     border: 2px solid transparent;
//     border-top-color: #5DCAA5;
//     border-radius: 50%;
//     animation: iv-spin 0.6s linear infinite reverse;
//   }

//   .iv-loading-text {
//     font-size: 15px;
//     color: #4A5568;
//     font-weight: 500;
//   }

//   .iv-loading-dots::after {
//     content: '';
//     animation: iv-dots 1.5s steps(4, end) infinite;
//   }

//   /* ── Empty State ── */
//   .iv-empty {
//     text-align: center;
//     padding: 80px 24px;
//     background: #FFFFFF;
//     border: 1px solid #E4EAF0;
//     border-radius: 16px;
//   }

//   .iv-empty-icon {
//     width: 64px; height: 64px;
//     background: #F7F9FC;
//     border: 1px solid #E4EAF0;
//     border-radius: 16px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin: 0 auto 20px;
//   }

//   .iv-empty-icon svg {
//     width: 28px; height: 28px;
//     color: #9AA5B4;
//   }

//   .iv-empty h2 {
//     font-size: 20px;
//     font-weight: 600;
//     color: #0D1B2A;
//     margin: 0 0 8px;
//   }

//   .iv-empty p {
//     font-size: 14px;
//     color: #6B7280;
//     margin: 0 0 24px;
//     max-width: 360px;
//     margin-left: auto;
//     margin-right: auto;
//     line-height: 1.6;
//   }

//   .iv-btn-primary {
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     background: #1D9E75;
//     color: #FFFFFF;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 14px;
//     font-weight: 600;
//     padding: 11px 24px;
//     border-radius: 10px;
//     border: none;
//     cursor: pointer;
//     transition: background 0.18s, transform 0.12s;
//     text-decoration: none;
//   }

//   .iv-btn-primary:hover {
//     background: #0F6E56;
//     transform: translateY(-1px);
//   }

//   .iv-btn-primary:active {
//     transform: translateY(0);
//   }

//   /* ── Footer Note ── */
//   .iv-footer-note {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 8px;
//     margin-top: 48px;
//     padding-top: 32px;
//     border-top: 1px solid #E4EAF0;
//     font-size: 13px;
//     color: #9AA5B4;
//   }

//   .iv-footer-note svg {
//     width: 14px; height: 14px;
//     color: #1D9E75;
//   }

//   /* ── Animations ── */
//   @keyframes iv-spin {
//     to { transform: rotate(360deg); }
//   }

//   @keyframes iv-shimmer {
//     to { background-position: -200% 0; }
//   }

//   @keyframes iv-dots {
//     0%   { content: ''; }
//     25%  { content: '.'; }
//     50%  { content: '..'; }
//     75%  { content: '...'; }
//     100% { content: ''; }
//   }

//   @keyframes iv-fade-up {
//     from { opacity: 0; transform: translateY(12px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }

//   .iv-fade-up {
//     animation: iv-fade-up 0.36s ease both;
//   }

//   .iv-fade-up-1 { animation-delay: 0.06s; }
//   .iv-fade-up-2 { animation-delay: 0.12s; }
//   .iv-fade-up-3 { animation-delay: 0.18s; }

//   @media (max-width: 768px) {
//     .iv-hero-inner { flex-direction: column; gap: 32px; }
//     .iv-hero-title { font-size: 34px; }
//     .iv-token-card { width: 100%; min-width: unset; }
//     .iv-grid { grid-template-columns: 1fr; }
//     .iv-container { padding: 0 16px; }
//     .iv-stats-bar { flex-wrap: wrap; gap: 16px; }
//     .iv-stat-item { border-right: none; padding-right: 0; margin-right: 0; }
//     .iv-hero { padding: 40px 0 36px; }
//   }
// `;

// const BrowseInterviewers = () => {
//   const [interviewers, setInterviewers] = useState([]);
//   const [filteredInterviewers, setFilteredInterviewers] = useState([]);
//   const [tokenBalance, setTokenBalance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [tokenLoading, setTokenLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     specialization: '',
//     maxPrice: '',
//     date: '',
//   });

//   const fetchTokenBalance = useCallback(async () => {
//     try {
//       setTokenLoading(true);
//       const response = await candidateBookingsApi.getTokenBalance();
//       setTokenBalance(response.data.token_balance);
//     } catch (error) {
//       console.error('Token balance fetch failed:', error);
//       toast.error('Failed to load token balance');
//       setTokenBalance(0);
//     } finally {
//       setTokenLoading(false);
//     }
//   }, []);

//   const fetchInterviewers = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await candidateBookingsApi.getInterviewers({
//         specialization: filters.specialization || undefined,
//         max_price: filters.maxPrice || undefined,
//         date: filters.date || undefined,
//       });
//       setInterviewers(response.data);
//       setFilteredInterviewers(response.data);
//       toast.success(`${response.data.length} interviewers available`);
//     } catch (error) {
//       toast.error('Failed to load interviewers');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => {
//     fetchTokenBalance();
//     fetchInterviewers();
//   }, [fetchTokenBalance, fetchInterviewers]);

//   useEffect(() => {
//     fetchInterviewers();
//   }, [fetchInterviewers]);

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//   };

//   const clearFilters = () => {
//     setFilters({ specialization: '', maxPrice: '', date: '' });
//   };

//   if (loading) {
//     return (
//       <>
//         <style>{styles}</style>
//         <div className="iv-loading">
//           <div className="iv-spinner-wrap">
//             <div className="iv-spinner" />
//             <div className="iv-spinner-inner" />
//           </div>
//           <p className="iv-loading-text">
//             Finding interviewers
//             <span className="iv-loading-dots" />
//           </p>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <style>{styles}</style>

//       <div className="iv-browse-root">

//         {/* ── Hero / Header ── */}
//         <section className="iv-hero">
//           <div className="iv-container">
//             <div className="iv-hero-inner">

//               {/* Left: text */}
//               <div className="iv-hero-text iv-fade-up">
//                 <div className="iv-eyebrow">
//                   <span className="iv-eyebrow-dot" />
//                   Verified professionals
//                 </div>
//                 <h1 className="iv-hero-title">
//                   Find your <em>perfect</em><br />interviewer
//                 </h1>
//                 <p className="iv-hero-subtitle">
//                   Connect with subscription-active interviewers for mock interviews, personalized feedback, and career guidance.
//                 </p>

//                 {/* Stats */}
//                 <div className="iv-stats-bar iv-fade-up iv-fade-up-2">
//                   <div className="iv-stat-item">
//                     <span className="iv-stat-value">{filteredInterviewers.length}</span>
//                     <span className="iv-stat-label">Available now</span>
//                   </div>
//                   <div className="iv-stat-item">
//                     <span className="iv-stat-value">4.9★</span>
//                     <span className="iv-stat-label">Avg. rating</span>
//                   </div>
//                   <div className="iv-stat-item">
//                     <span className="iv-stat-value">24h</span>
//                     <span className="iv-stat-label">Avg. response</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Right: Token balance card */}
//               <div className="iv-token-card iv-fade-up iv-fade-up-3">
//                 <div className="iv-token-card-accent" />
//                 <p className="iv-token-label">Your token balance</p>
//                 {tokenLoading ? (
//                   <span className="iv-token-skeleton" />
//                 ) : (
//                   <p className="iv-token-amount">
//                     {tokenBalance}
//                     <span>tokens</span>
//                   </p>
//                 )}
//                 <p className="iv-token-sub">
//                   <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <circle cx="6" cy="6" r="5" />
//                     <path d="M6 4v2.5l1.5 1" strokeLinecap="round" />
//                   </svg>
//                   {tokenLoading ? 'Loading...' : 'Ready to use'}
//                 </p>
//               </div>

//             </div>
//           </div>
//         </section>

//         {/* ── Main content ── */}
//         <div className="iv-content">
//           <div className="iv-container">

//             {/* Filters */}
//             <div className="iv-filters-wrapper">
//               <div className="iv-filters-label">
//                 <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//                   <path d="M1 3h12M3 7h8M5 11h4" strokeLinecap="round" />
//                 </svg>
//                 Filter interviewers
//               </div>
//               <Filters
//                 filters={filters}
//                 onFilterChange={handleFilterChange}
//                 onClearFilters={clearFilters}
//                 interviewers={interviewers}
//               />
//             </div>

//             {/* Section header */}
//             <div className="iv-section-header">
//               <h2 className="iv-section-title">
//                 {filteredInterviewers.length > 0
//                   ? 'Available interviewers'
//                   : 'No results'}
//               </h2>
//               {filteredInterviewers.length > 0 && (
//                 <span className="iv-result-count">
//                   <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
//                     <circle cx="5" cy="5" r="5" />
//                   </svg>
//                   {filteredInterviewers.length} found
//                 </span>
//               )}
//             </div>

//             {/* Empty state */}
//             {filteredInterviewers.length === 0 ? (
//               <div className="iv-empty">
//                 <div className="iv-empty-icon">
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
//                   </svg>
//                 </div>
//                 <h2>No interviewers found</h2>
//                 <p>
//                   Try adjusting your filters or check back later — new interviewers join regularly.
//                 </p>
//                 <button className="iv-btn-primary" onClick={clearFilters}>
//                   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <path strokeLinecap="round" d="M1 7h12M8 3l4 4-4 4" />
//                   </svg>
//                   Clear all filters
//                 </button>
//               </div>
//             ) : (
//               /* Card grid */
//               <div className="iv-grid">
//                 {filteredInterviewers.map((interviewer) => (
//                   <InterviewerCard
//                     key={interviewer.id}
//                     interviewer={interviewer}
//                     tokenBalance={tokenBalance}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Footer note */}
//             <div className="iv-footer-note">
//               <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5 5.5 4z" />
//               </svg>
//               Only verified, subscription-active interviewers are shown
//             </div>

//           </div>
//         </div>

//       </div>
//     </>
//   );
// };

// export default BrowseInterviewers;
















































import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import InterviewerCard from '../components/InterviewerCard.jsx';
import Filters from '../components/Filters.jsx';
import { candidateBookingsApi } from '../../candidateBookingsApi.js';

/* ─────────────────────────────────────────────
   IntraView Brand Tokens
   Primary teal : #1D9E75
   Dark navy    : #0D1B2A
   Surface      : #F7F9FC
   Card bg      : #FFFFFF
   Border       : #E4EAF0
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  /* ── Root ── */
  .iv-browse-root {
    min-height: 100vh;
    background: #F7F9FC;
    font-family: 'DM Sans', sans-serif;
    color: #0D1B2A;
  }

  .iv-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }

  /* ─────────────────────────────────────────
     Hero Banner
  ───────────────────────────────────────── */
  .iv-hero {
    background: #FFFFFF;
    border-bottom: 1px solid #E4EAF0;
    padding: 52px 0 44px;
    position: relative;
    overflow: hidden;
  }

  .iv-hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(29,158,117,0.07) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .iv-hero::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -60px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(29,158,117,0.04) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .iv-hero-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
  }

  .iv-hero-text {
    flex: 1;
    min-width: 0;
  }

  /* Eyebrow label */
  .iv-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    padding: 5px 13px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .iv-eyebrow-dot {
    width: 6px; height: 6px;
    background: #1D9E75;
    border-radius: 50%;
  }

  .iv-hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 46px;
    line-height: 1.1;
    color: #0D1B2A;
    margin: 0 0 14px;
    font-weight: 400;
  }

  .iv-hero-title em {
    font-style: italic;
    color: #1D9E75;
  }

  .iv-hero-subtitle {
    font-size: 15.5px;
    line-height: 1.7;
    color: #4A5568;
    margin: 0;
    max-width: 460px;
  }

  /* Stats row */
  .iv-stats-bar {
    display: flex;
    align-items: center;
    margin-top: 24px;
  }

  .iv-stat-item {
    display: flex;
    flex-direction: column;
    padding-right: 28px;
    margin-right: 28px;
    border-right: 1px solid #E4EAF0;
  }

  .iv-stat-item:last-child {
    border-right: none;
    padding-right: 0;
    margin-right: 0;
  }

  .iv-stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #0D1B2A;
    line-height: 1;
  }

  .iv-stat-label {
    font-size: 11.5px;
    color: #9AA5B4;
    margin-top: 4px;
  }

  /* Token balance card */
  .iv-token-card {
    background: #FFFFFF;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
    padding: 24px 28px;
    min-width: 210px;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 2px 12px rgba(13,27,42,0.06);
  }

  .iv-token-card-accent {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1D9E75, #5DCAA5);
    border-radius: 14px 14px 0 0;
  }

  .iv-token-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9AA5B4;
    margin: 0 0 10px;
  }

  .iv-token-amount {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    line-height: 1;
    color: #0D1B2A;
    margin: 0 0 6px;
  }

  .iv-token-amount span {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #4A5568;
    margin-left: 4px;
  }

  .iv-token-sub {
    font-size: 12px;
    color: #1D9E75;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
  }

  .iv-token-skeleton {
    display: inline-block;
    width: 80px;
    height: 36px;
    background: linear-gradient(90deg, #F0F4F8 25%, #E4EAF0 50%, #F0F4F8 75%);
    background-size: 200% 100%;
    animation: iv-shimmer 1.4s infinite;
    border-radius: 6px;
  }

  /* ─────────────────────────────────────────
     Main Content
  ───────────────────────────────────────── */
  .iv-content {
    padding: 40px 0 80px;
  }

  /* Filter section — just a spacing wrapper; Filters.jsx renders its own card */
  .iv-filter-section {
    margin-bottom: 32px;
  }

  /* ── Section Header ── */
  .iv-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .iv-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #0D1B2A;
    margin: 0;
  }

  .iv-result-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E1F5EE;
    color: #0F6E56;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 13px;
    border-radius: 100px;
  }

  /* ── Card Grid: 3 columns ── */
  .iv-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: start;       /* cards start at top, don't stretch to each other */
  }

  /* ── Loading State ── */
  .iv-loading {
    min-height: 100vh;
    background: #F7F9FC;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 22px;
    font-family: 'DM Sans', sans-serif;
  }

  .iv-spinner-wrap {
    position: relative;
    width: 52px; height: 52px;
  }

  .iv-spinner {
    position: absolute; inset: 0;
    border: 2.5px solid #E4EAF0;
    border-top-color: #1D9E75;
    border-radius: 50%;
    animation: iv-spin 0.8s linear infinite;
  }

  .iv-spinner-inner {
    position: absolute;
    inset: 8px;
    border: 2px solid transparent;
    border-top-color: #5DCAA5;
    border-radius: 50%;
    animation: iv-spin 0.6s linear infinite reverse;
  }

  .iv-loading-text {
    font-size: 15px;
    color: #4A5568;
    font-weight: 500;
  }

  .iv-loading-dots::after {
    content: '';
    animation: iv-dots 1.5s steps(4, end) infinite;
  }

  /* ── Empty State ── */
  .iv-empty {
    text-align: center;
    padding: 80px 24px;
    background: #FFFFFF;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
  }

  .iv-empty-icon {
    width: 60px; height: 60px;
    background: #F7F9FC;
    border: 1px solid #E4EAF0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .iv-empty-icon svg {
    width: 26px; height: 26px;
    color: #9AA5B4;
  }

  .iv-empty h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #0D1B2A;
    margin: 0 0 8px;
  }

  .iv-empty p {
    font-size: 14px;
    color: #6B7280;
    max-width: 340px;
    margin: 0 auto 24px;
    line-height: 1.65;
  }

  .iv-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #1D9E75;
    color: #FFFFFF;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 11px 24px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
  }

  .iv-btn-primary:hover {
    background: #0F6E56;
    transform: translateY(-1px);
  }

  .iv-btn-primary:active { transform: translateY(0); }

  /* ── Footer note ── */
  .iv-footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 48px;
    padding-top: 28px;
    border-top: 1px solid #E4EAF0;
    font-size: 12.5px;
    color: #9AA5B4;
  }

  .iv-footer-note svg { color: #1D9E75; }

  /* ── Animations ── */
  @keyframes iv-spin    { to { transform: rotate(360deg); } }
  @keyframes iv-shimmer { to { background-position: -200% 0; } }

  @keyframes iv-dots {
    0%   { content: ''; }
    25%  { content: '.'; }
    50%  { content: '..'; }
    75%  { content: '...'; }
    100% { content: ''; }
  }

  @keyframes iv-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .iv-fade-up   { animation: iv-fade-up 0.36s ease both; }
  .iv-delay-1   { animation-delay: 0.06s; }
  .iv-delay-2   { animation-delay: 0.12s; }
  .iv-delay-3   { animation-delay: 0.2s; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .iv-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .iv-hero-inner   { flex-direction: column; gap: 28px; }
    .iv-hero-title   { font-size: 34px; }
    .iv-token-card   { width: 100%; min-width: unset; }
    .iv-grid         { grid-template-columns: 1fr; }
    .iv-container    { padding: 0 16px; }
    .iv-stats-bar    { flex-wrap: wrap; gap: 16px; }
    .iv-stat-item    { border-right: none; padding-right: 0; margin-right: 0; }
    .iv-hero         { padding: 36px 0 32px; }
  }

  @media (max-width: 540px) {
    .iv-hero-title { font-size: 28px; }
  }
`;

/* ─────────────────────────────────────────────
   BrowseInterviewers Page
───────────────────────────────────────────── */
const BrowseInterviewers = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    maxPrice: '',
    date: '',
  });

  /* ── Token balance ── */
  const fetchTokenBalance = useCallback(async () => {
    try {
      setTokenLoading(true);
      const response = await candidateBookingsApi.getTokenBalance();
      setTokenBalance(response.data.token_balance);
    } catch (error) {
      console.error('Token balance fetch failed:', error);
      toast.error('Failed to load token balance');
      setTokenBalance(0);
    } finally {
      setTokenLoading(false);
    }
  }, []);

  /* ── Interviewers list ── */
  const fetchInterviewers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await candidateBookingsApi.getInterviewers({
        specialization: filters.specialization || undefined,
        max_price: filters.maxPrice || undefined,
        date: filters.date || undefined,
      });
      setInterviewers(response.data);
      setFilteredInterviewers(response.data);
      toast.success(`${response.data.length} interviewers available`);
    } catch (error) {
      toast.error('Failed to load interviewers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTokenBalance();
    fetchInterviewers();
  }, [fetchTokenBalance, fetchInterviewers]);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const clearFilters = () => setFilters({ specialization: '', maxPrice: '', date: '' });

  /* ── Loading screen ── */
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="iv-loading">
          <div className="iv-spinner-wrap">
            <div className="iv-spinner" />
            <div className="iv-spinner-inner" />
          </div>
          <p className="iv-loading-text">
            Finding interviewers
            <span className="iv-loading-dots" />
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="iv-browse-root">

        {/* ══════════════════════════════════════
            Hero / Header
        ══════════════════════════════════════ */}
        <section className="iv-hero">
          <div className="iv-container">
            <div className="iv-hero-inner">

              {/* Left: title + stats */}
              <div className="iv-hero-text iv-fade-up">
                <div className="iv-eyebrow">
                  <span className="iv-eyebrow-dot" />
                  Verified professionals
                </div>
                <h1 className="iv-hero-title">
                  Find your <em>perfect</em><br />interviewer
                </h1>
                <p className="iv-hero-subtitle">
                  Connect with subscription-active interviewers for mock
                  interviews, personalised feedback, and career guidance.
                </p>

                {/* Stats */}
                <div className="iv-stats-bar iv-fade-up iv-delay-2">
                  <div className="iv-stat-item">
                    <span className="iv-stat-value">{filteredInterviewers.length}</span>
                    <span className="iv-stat-label">Available now</span>
                  </div>
                  <div className="iv-stat-item">
                    <span className="iv-stat-value">4.9★</span>
                    <span className="iv-stat-label">Avg. rating</span>
                  </div>
                  <div className="iv-stat-item">
                    <span className="iv-stat-value">24h</span>
                    <span className="iv-stat-label">Avg. response</span>
                  </div>
                </div>
              </div>

              {/* Right: token balance card */}
              <div className="iv-token-card iv-fade-up iv-delay-3">
                <div className="iv-token-card-accent" />
                <p className="iv-token-label">Your token balance</p>
                {tokenLoading ? (
                  <span className="iv-token-skeleton" />
                ) : (
                  <p className="iv-token-amount">
                    {tokenBalance}
                    <span>tokens</span>
                  </p>
                )}
                <p className="iv-token-sub">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="6" cy="6" r="5" />
                    <path d="M6 4v2.5l1.5 1" strokeLinecap="round" />
                  </svg>
                  {tokenLoading ? 'Loading...' : 'Ready to use'}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            Main Content
        ══════════════════════════════════════ */}
        <div className="iv-content">
          <div className="iv-container">

            {/* ── Full-width Filter Bar ── */}
            <div className="iv-filter-section">
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                interviewers={interviewers}
              />
            </div>

            {/* ── Section Header ── */}
            <div className="iv-section-header">
              <h2 className="iv-section-title">
                {filteredInterviewers.length > 0
                  ? 'Available Interviewers'
                  : 'No Results'}
              </h2>
              {filteredInterviewers.length > 0 && (
                <span className="iv-result-count">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  {filteredInterviewers.length} found
                </span>
              )}
            </div>

            {/* ── Empty State ── */}
            {filteredInterviewers.length === 0 ? (
              <div className="iv-empty">
                <div className="iv-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </div>
                <h2>No interviewers found</h2>
                <p>
                  Try adjusting your filters or check back later —
                  new interviewers join regularly.
                </p>
                <button className="iv-btn-primary" onClick={clearFilters}>
                  Clear all filters
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 6.5h10M8 3l4 3.5L8 10" />
                  </svg>
                </button>
              </div>
            ) : (
              /* ── Card Grid ── */
              <div className="iv-grid">
                {filteredInterviewers.map((interviewer) => (
                  <InterviewerCard
                    key={interviewer.id}
                    interviewer={interviewer}
                    tokenBalance={tokenBalance}
                  />
                ))}
              </div>
            )}

            {/* ── Footer note ── */}
            <div className="iv-footer-note">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5 5.5 4z" />
              </svg>
              Only verified, subscription-active interviewers are shown
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default BrowseInterviewers;