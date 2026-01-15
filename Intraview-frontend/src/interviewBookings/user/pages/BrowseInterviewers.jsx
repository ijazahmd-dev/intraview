// import React, { useEffect, useState, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import InterviewerCard from '../components/InterviewerCard.jsx';
// import Filters from '../components/Filters.jsx';
// import { candidateBookingsApi } from '../../candidateBookingsApi.js';

// const BrowseInterviewers = () => {
//   const [interviewers, setInterviewers] = useState([]);
//   const [filteredInterviewers, setFilteredInterviewers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     specialization: '',
//     maxPrice: '',
//     date: '',
//   });

//   const user = useSelector((state) => state.auth?.user);
//   const tokenBalance = user?.token_balance || 0;

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
//                 <div className="text-2xl font-bold text-emerald-800">{tokenBalance} tokens</div>
//                 <div className="text-sm text-emerald-700">Available balance</div>
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
//                 tokenBalance={tokenBalance}
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










import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import InterviewerCard from '../components/InterviewerCard.jsx';
import Filters from '../components/Filters.jsx';
import { candidateBookingsApi } from '../../candidateBookingsApi.js';

const BrowseInterviewers = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);  // 🔥 NEW STATE
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(true);  // 🔥 NEW STATE
  const [filters, setFilters] = useState({
    specialization: '',
    maxPrice: '',
    date: '',
  });

  // 🔥 DEDICATED TOKEN FETCH
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

  // 🔥 LOAD BOTH ON MOUNT
  useEffect(() => {
    fetchTokenBalance();
    fetchInterviewers();
  }, [fetchTokenBalance, fetchInterviewers]);

  // 🔥 REFRESH ON FILTER CHANGE
  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({ specialization: '', maxPrice: '', date: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-8"></div>
            <p className="text-2xl font-semibold text-gray-700">Loading top interviewers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent mb-6">
            Find Your Interviewer
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Connect with verified, subscription-active interviewers for mock interviews and career guidance
          </p>
          <div className="mt-8 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-800">
                  {tokenLoading ? '...' : `${tokenBalance} tokens`}
                </div>
                <div className="text-sm text-emerald-700">
                  {tokenLoading ? 'Loading...' : 'Available balance'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Filters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          interviewers={interviewers}
          className="mb-16"
        />

        {/* Results */}
        {filteredInterviewers.length === 0 ? (
          <div className="text-center py-32">
            <svg className="w-32 h-32 text-gray-400 mx-auto mb-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} stroke="currentColor" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2h0a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">No interviewers found</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your filters or check back later for new availability
            </p>
            <button 
              onClick={clearFilters}
              className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInterviewers.map((interviewer) => (
              <InterviewerCard 
                key={interviewer.id}
                interviewer={interviewer}
                tokenBalance={tokenBalance}  // 🔥 PASSES FRESH VALUE
              />
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-lg text-gray-600">
            Only verified, subscription-active interviewers accepting bookings
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowseInterviewers;
