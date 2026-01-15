// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { candidateBookingsApi } from '../../candidateBookingsApi';

// const CandidateBookingsDashboard = () => {
//   const navigate = useNavigate();
  
//   // State
//   const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');

//   // Fetch bookings based on tab
//   const fetchBookings = useCallback(async () => {
//   try {
//     console.log('🔥 fetchBookings STARTED - tab:', activeTab);
    
//     setLoading(true);
    
//     let res;
//     if (activeTab === 'upcoming') {
//       console.log('📡 Calling getUpcomingBookings()');
//       res = await candidateBookingsApi.getUpcomingBookings();
//     } else {
//       console.log('📡 Calling getPastBookings()');
//       res = await candidateBookingsApi.getPastBookings();
//     }
    
//     console.log('✅ API Response:', res.data);
//     setBookings(res.data || []);
    
//   } catch (error) {
//     // 🔥 DETAILED ERROR LOGGING
//     console.error('💥 FULL ERROR OBJECT:', error);
//     console.error('💥 Error.response:', error.response);
//     console.error('💥 Error.request:', error.request);
//     console.error('💥 Error.message:', error.message);
    
//     toast.error('Failed to load bookings: ' + (error.message || 'Unknown error'));
//     setBookings([]);
//   } finally {
//     setLoading(false);
//     console.log('🔥 fetchBookings FINISHED');
//   }
// }, [activeTab]);

//   useEffect(() => {
//     fetchBookings();
//   }, [fetchBookings]);

//   // Filter bookings
//   const filteredBookings = bookings.filter(booking => {
//     const matchesSearch = booking.interviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          booking.start_datetime?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === 'all' || booking.type === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   const handleBookingClick = (bookingId) => {
//     navigate(`/candidate/bookings-detail/${bookingId}`);
//   };

//   const BookingStatusBadge = ({ status }) => {
//     const statusConfig = {
//       CONFIRMED: { bg: 'bg-emerald-100', text: 'bg-emerald-800', label: 'Confirmed' },
//       PENDING: { bg: 'bg-amber-100', text: 'bg-amber-800', label: 'Pending' },
//       COMPLETED: { bg: 'bg-slate-100', text: 'bg-slate-800', label: 'Completed' },
//       CANCELLED: { bg: 'bg-rose-100', text: 'bg-rose-800', label: 'Cancelled' },
//     };

//     const config = statusConfig[status] || statusConfig.CANCELLED;
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
//         {config.label}
//       </span>
//     );
//   };

//   const SessionCard = ({ booking }) => (
//     <div 
//       className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
//       onClick={() => handleBookingClick(booking.id)}
//     >
//       {/* Top: Type + Status */}
//       <div className="flex items-center justify-between mb-6">
//         <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold">
//           {booking.type || 'Technical Interview'}
//         </span>
//         <BookingStatusBadge status={booking.status} />
//       </div>

//       {/* Meta Info */}
//       <div className="space-y-4 mb-6">
//         <div className="flex items-center gap-3 text-sm text-slate-700">
//           <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//           <span>{new Date(booking.start_datetime).toLocaleDateString('en-US', { 
//             weekday: 'short', 
//             year: 'numeric', 
//             month: 'short', 
//             day: 'numeric' 
//           })}</span>
//         </div>

//         <div className="flex items-center gap-3 text-sm text-slate-700">
//           <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>{booking.start_time} - {booking.end_time}</span>
//         </div>

//         <div className="flex items-center gap-3 text-sm text-slate-700">
//           <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
//           </svg>
//           <span className="font-semibold text-slate-900">{booking.interviewer_name}</span>
//         </div>
//       </div>

//       {/* Notes Preview */}
//       {booking.notes && (
//         <div className="p-4 bg-slate-50/50 rounded-2xl mb-6">
//           <p className="text-sm text-slate-600 leading-relaxed">{booking.notes.substring(0, 100)}...</p>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-3">
//         <button 
//           className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
//           onClick={(e) => {
//             e.stopPropagation();
//             handleBookingClick(booking.id);
//           }}
//         >
//           View Details
//         </button>
//         {activeTab === 'past' && (
//           <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-200">
//             Transcript
//           </button>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-16">
//           <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
//             Sessions
//           </h1>
//           <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
//             View and manage your upcoming and past interview sessions
//           </p>
//         </div>

//         {/* Controls */}
//         <div className="max-w-4xl mx-auto mb-12">
//           {/* Search + Filter */}
//           <div className="flex flex-col lg:flex-row gap-4 mb-8">
//             <div className="flex-1 relative">
//               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search by interviewer, type, or notes…"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-sm shadow-lg"
//               />
//             </div>
//             <div className="w-full lg:w-auto">
//               <select
//                 value={filterType}
//                 onChange={(e) => setFilterType(e.target.value)}
//                 className="w-full lg:w-48 px-6 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-sm shadow-lg appearance-none"
//               >
//                 <option value="all">All Types</option>
//                 <option value="technical">Technical</option>
//                 <option value="behavioral">Behavioral</option>
//                 <option value="system-design">System Design</option>
//               </select>
//             </div>
//           </div>

//           {/* Tab Toggle */}
//           <div className="flex bg-slate-100/50 backdrop-blur-sm rounded-3xl p-1 max-w-md mx-auto">
//             <button
//               onClick={() => setActiveTab('upcoming')}
//               className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${
//                 activeTab === 'upcoming'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
//                   : 'text-slate-700 hover:text-slate-900'
//               }`}
//             >
//               Upcoming Sessions
//             </button>
//             <button
//               onClick={() => setActiveTab('past')}
//               className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${
//                 activeTab === 'past'
//                   ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
//                   : 'text-slate-700 hover:text-slate-900'
//               }`}
//             >
//               Past Sessions
//             </button>
//           </div>
//         </div>

//         {/* Loading */}
//         {loading && (
//           <div className="flex items-center justify-center py-20">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
//           </div>
//         )}

//         {/* No results */}
//         {!loading && filteredBookings.length === 0 && (
//           <div className="text-center py-20">
//             <svg className="w-24 h-24 text-slate-300 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <h3 className="text-2xl font-bold text-slate-900 mb-2">
//               {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
//             </h3>
//             <p className="text-slate-600 max-w-md mx-auto">
//               {activeTab === 'upcoming'
//                 ? 'Book an interview with one of our expert interviewers to get started.'
//                 : 'All your past sessions will appear here.'}
//             </p>
//           </div>
//         )}

//         {/* Sessions Grid */}
//         {!loading && filteredBookings.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
//             {filteredBookings.map((booking) => (
//               <SessionCard key={booking.id} booking={booking} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CandidateBookingsDashboard;



















import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { candidateBookingsApi } from '../../candidateBookingsApi';

const CandidateBookingsDashboard = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      console.log('🔥 fetchBookings STARTED - tab:', activeTab);
      setLoading(true);
      
      let res;
      if (activeTab === 'upcoming') {
        res = await candidateBookingsApi.getUpcomingBookings();
      } else {
        res = await candidateBookingsApi.getPastBookings();
      }
      
      console.log('✅ RAW API DATA:', res.data);
      setBookings(res.data || []);
      
    } catch (error) {
      console.error('💥 ERROR:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 🔥 FIXED FILTERING - Handle missing/undefined fields
  const filteredBookings = bookings.filter(booking => {
    const interviewerName = booking.interviewer_name || booking.interviewer__interviewer_profile__display_name || '';
    const startDateTime = booking.start_datetime || '';
    
    const matchesSearch = interviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startDateTime.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || booking.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleBookingClick = (bookingId) => {
    navigate(`/candidate/bookings-detail/${bookingId}`);
  };


  // 🔥 In BookingStatusBadge - Add status logging
const BookingStatusBadge = ({ status }) => {
  console.log('🔥 Status from API:', status, typeof status); // DEBUG
  
  const statusConfig = {
    'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
    'CONFIRMED': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
    'pending': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
    'PENDING': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
    'completed': { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completed' },
    'COMPLETED': { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completed' },
    'cancelled': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    'CANCELLED': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    'cancelled_by_candidate': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    'CANCELLED_BY_CANDIDATE': { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    bg: 'bg-gray-100', 
    text: 'text-gray-800', 
    label: 'Unknown' 
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};



  // 🔥 FIXED SessionCard - Matches YOUR SERIALIZER FIELDS
const SessionCard = ({ booking }) => {
  // 🔥 TIME FORMATTER FUNCTION
  const formatTime = (timeString) => {
    if (!timeString) return 'Time unavailable';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  const interviewerName = booking.interviewer_name || 'Unknown Interviewer';
  const interviewDate = booking.date;
  const startTime = booking.start_time;
  const endTime = booking.end_time;
  const bookingType = booking.type || 'Technical Interview';

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      const date = new Date(dateString + 'T00:00:00'); // Add time for DateField
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const status = booking.status || 'CONFIRMED';

  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
         onClick={() => handleBookingClick(booking.id)}>
      
      {/* Top: Type + Status */}
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold">
          {bookingType}
        </span>
        <BookingStatusBadge status={status} />
      </div>

      {/* Meta Info */}
      <div className="space-y-4 mb-6">
        {/* Date */}
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{getFormattedDate(interviewDate)}</span>
        </div>

        {/* ✅ FIXED TIME */}
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
        </div>

        {/* Interviewer */}
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
          </svg>
          <span className="font-semibold text-slate-900">{interviewerName}</span>
        </div>
      </div>

      {/* Rest of your JSX unchanged... */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleBookingClick(booking.id);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};


  // 🔥 DEBUG INFO - Remove after fixing
  console.log('🔥 ACTIVE TAB:', activeTab);
  console.log('🔥 RAW BOOKINGS:', bookings);
  console.log('🔥 FILTERED BOOKINGS:', filteredBookings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
            Sessions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            View and manage your upcoming and past interview sessions
          </p>
        </div>

        {/* Controls */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Search + Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by interviewer, type, or notes…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-sm shadow-lg"
              />
            </div>
            <div className="w-full lg:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full lg:w-48 px-6 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-sm shadow-lg appearance-none"
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="system-design">System Design</option>
              </select>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-slate-100/50 backdrop-blur-sm rounded-3xl p-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Past Sessions
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* No results */}
        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-slate-300 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {activeTab === 'upcoming'
                ? 'Book an interview with one of our expert interviewers to get started.'
                : 'All your past sessions will appear here.'}
            </p>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBookings.map((booking) => (
              <SessionCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateBookingsDashboard;
