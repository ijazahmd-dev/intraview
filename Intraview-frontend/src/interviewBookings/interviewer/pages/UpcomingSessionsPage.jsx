// src/pages/interviewer/UpcomingSessionsPage.jsx - ✅ FULLY FIXED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';

const UpcomingSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchUpcomingSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      const res = await interviewerBookingsApi.getUpcomingSessions();
      console.log('Upcoming Sessions API Response:', res.data); // ✅ DEBUG
      setSessions(res.data);
    } catch (error) {
      toast.error('Failed to load upcoming sessions');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setSelectedBookingId(null);
    setCancelReason('');
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      await interviewerBookingsApi.cancelBooking(selectedBookingId, cancelReason);
      toast.success('Booking cancelled successfully');
      closeCancelModal();
      fetchUpcomingSessions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  // ✅ FIXED: Combine date + start_time (SAME AS CompletedSessionsPage)
  const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    try {
      const dateTimeString = `${date}T${time}`;
      return new Date(dateTimeString);
    } catch {
      return null;
    }
  };

  const formatTimeUntil = (dateTime) => {
    if (!dateTime || isNaN(dateTime)) return 'Loading...';
    
    const now = new Date();
    const start = dateTime;
    const diffMs = start - now;
    
    if (diffMs < 0) return 'Started';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upcoming Sessions</h1>
            <p className="text-slate-600 mt-2">
              {sessions.length} confirmed session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No upcoming sessions</h3>
            <p className="text-slate-600 mb-6">All your confirmed sessions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((booking) => {
              // ✅ FIXED: Create dateTime for this booking
              const dateTime = formatDateTime(booking.date, booking.start_time);
              const endTime = formatDateTime(booking.date, booking.end_time);
              
              return (
                <div
                  key={booking.id}
                  className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
                  onClick={() => navigate(`/interviewer/dashboard/bookings/${booking.id}`)}
                >
                  {/* ✅ Top: Candidate + Status - Fixed for your serializer */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-indigo-600">
                        {booking.candidate_name || booking.candidate_email || 'Candidate'}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">
                        {booking.candidate_email || 'Email not available'}
                      </p>
                    </div>
                    <span className="ml-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
                      CONFIRMED
                    </span>
                  </div>

                  {/* ✅ FIXED: Date & Time */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{dateTime ? dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {dateTime && endTime 
                          ? `${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  {/* ✅ FIXED: Countdown + Tokens */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                      {formatTimeUntil(dateTime)}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-600">
                        {console.log("🔥 booking.token_cost:", booking.token_cost)}
                        +{booking.token_cost || 25} tokens {/* ✅ Fallback to 25 */}
                      </div>
                      <p className="text-xs text-slate-500">You'll earn</p>
                    </div>
                  </div>

                  {/* Action Buttons - UNCHANGED */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCancelModal(booking.id);
                      }}
                      disabled={cancelLoading}
                      className="flex-1 bg-white border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Cancel Session
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/interviewer/dashboard/bookings/${booking.id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - UNCHANGED */}
      {cancelModalOpen && selectedBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
            <div className="p-8 pb-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Cancel Session</h2>
                <button
                  onClick={closeCancelModal}
                  className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 disabled:opacity-50"
                  disabled={cancelLoading}
                >
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-rose-800">Candidate will lose this slot</h3>
                  <p className="text-sm text-rose-700">All tokens will be refunded automatically.</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., I'm unavailable, personal emergency, found a better candidate, etc."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 resize-vertical disabled:opacity-50"
                  disabled={cancelLoading}
                />
              </div>
            </div>

            <div className="p-8 pt-0 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeCancelModal}
                  disabled={cancelLoading}
                  className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={!cancelReason.trim() || cancelLoading}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel & Refund Tokens'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpcomingSessionsPage;



























// // src/pages/interviewer/UpcomingSessionsPage.jsx - ✅ FULL RESCHEDULE + LIVE TIMERS
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { X, Clock } from 'lucide-react';
// import { interviewerBookingsApi } from '../../interviewerBookingsApi';
// import InterviewerCalendarComponent from '../components/InterviewerCalendarComponent'; // Adjust path

// const UpcomingSessionsPage = () => {
//   const navigate = useNavigate();
  
//   // 🔥 ALL STATES
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Cancel Modal
//   const [cancelModalOpen, setCancelModalOpen] = useState(false);
//   const [selectedBookingId, setSelectedBookingId] = useState(null);
//   const [cancelReason, setCancelReason] = useState('');
//   const [cancelLoading, setCancelLoading] = useState(false);
  
//   // 🔥 RESCHEDULE MODAL
//   const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
//   const [rescheduleLoading, setRescheduleLoading] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [selectedNewSlot, setSelectedNewSlot] = useState(null);

//   const fetchUpcomingSessions = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await interviewerBookingsApi.getUpcomingSessions();
//       console.log('Upcoming Sessions API Response:', res.data);
//       setSessions(res.data);
//     } catch (error) {
//       toast.error('Failed to load upcoming sessions');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUpcomingSessions();
//   }, [fetchUpcomingSessions]);

//   // 🔥 CANCEL MODALS (YOUR EXISTING)
//   const openCancelModal = (bookingId) => {
//     setSelectedBookingId(bookingId);
//     setCancelModalOpen(true);
//   };

//   const closeCancelModal = () => {
//     setCancelModalOpen(false);
//     setSelectedBookingId(null);
//     setCancelReason('');
//   };

//   const handleCancelConfirm = async () => {
//     if (!cancelReason.trim()) {
//       toast.error('Please provide a cancellation reason');
//       return;
//     }

//     try {
//       setCancelLoading(true);
//       await interviewerBookingsApi.cancelBooking(selectedBookingId, cancelReason);
//       toast.success('Booking cancelled successfully');
//       closeCancelModal();
//       fetchUpcomingSessions();
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Failed to cancel booking');
//     } finally {
//       setCancelLoading(false);
//     }
//   };

//   // 🔥 NEW: RESCHEDULE FUNCTIONS
//   const openRescheduleModal = async (bookingId) => {
//     try {
//       const res = await interviewerBookingsApi.getBookingDetail(bookingId);
//       setSelectedBooking(res.data);
//       setSelectedBookingId(bookingId);
//       setRescheduleModalOpen(true);
//     } catch (error) {
//       toast.error('Failed to load booking details');
//     }
//   };

//   const handleRescheduleConfirm = async () => {
//     if (!selectedNewSlot) {
//       toast.error('Please select a new time slot');
//       return;
//     }

//     try {
//       setRescheduleLoading(true);
//       await interviewerBookingsApi.rescheduleBooking(selectedBookingId, {
//         new_availability_id: selectedNewSlot.id,
//         reason: 'Rescheduled by interviewer'
//       });
//       toast.success('✅ Session rescheduled successfully!');
//       setRescheduleModalOpen(false);
//       setSelectedNewSlot(null);
//       fetchUpcomingSessions();
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Reschedule failed');
//     } finally {
//       setRescheduleLoading(false);
//     }
//   };

//   // 🔥 ENHANCED formatDateTime (your existing + seconds support)
//   const formatDateTime = (date, time) => {
//     if (!date || !time) return null;
//     try {
//       const dateTimeString = `${date}T${time}`;
//       return new Date(dateTimeString);
//     } catch {
//       return null;
//     }
//   };

//   // 🔥 SessionCard Component with LIVE TIMER
//   const SessionCard = ({ booking }) => {
//     const [timeLeft, setTimeLeft] = useState('');
//     const [isLive, setIsLive] = useState(false);

//     // 🔥 LIVE COUNTDOWN TIMER (per session)
//     useEffect(() => {
//       if (!booking.start_datetime || !booking.end_datetime) return;

//       const startTime = new Date(booking.start_datetime);
//       const endTime = new Date(booking.end_datetime);

//       const updateTimer = () => {
//         const now = new Date();
//         const diffToStart = startTime - now;
//         const diffToEnd = endTime - now;

//         if (diffToStart <= 0 && diffToEnd > 0) {
//           setIsLive(true);
//           setTimeLeft('LIVE NOW');
//         } else if (diffToEnd <= 0) {
//           setIsLive(false);
//           setTimeLeft('ENDED');
//         } else {
//           const hours = Math.floor(diffToStart / (1000 * 60 * 60));
//           const minutes = Math.floor((diffToStart / (1000 * 60)) % 60);
//           const seconds = Math.floor((diffToStart / 1000) % 60);
//           setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//         }
//       };

//       const interval = setInterval(updateTimer, 1000);
//       updateTimer();
//       return () => clearInterval(interval);
//     }, [booking.start_datetime, booking.end_datetime]);

//     const dateTime = formatDateTime(booking.date, booking.start_time);
//     const endTime = formatDateTime(booking.date, booking.end_time);
//     const canReschedule = booking.status === 'CONFIRMED' && new Date(booking.start_datetime) > new Date();

//     return (
//       <div 
//         className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
//         onClick={() => navigate(`/interviewer/dashboard/bookings/${booking.id}`)}
//       >
//         {/* Top: Candidate + Status */}
//         <div className="flex items-start justify-between mb-6">
//           <div className="flex-1 min-w-0">
//             <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-indigo-600">
//               {booking.candidate_name || booking.candidate_email || 'Candidate'}
//             </h3>
//             <p className="text-sm text-slate-600 truncate">
//               {booking.candidate_email || 'Email not available'}
//             </p>
//           </div>
//           <span className="ml-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
//             CONFIRMED
//           </span>
//         </div>

//         {/* Date & Time */}
//         <div className="space-y-3 mb-6">
//           <div className="flex items-center gap-2 text-sm text-slate-700">
//             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             <span>{dateTime ? dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}</span>
//           </div>
//           <div className="flex items-center gap-2 text-sm text-slate-700">
//             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span>
//               {dateTime && endTime 
//                 ? `${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
//                 : 'N/A'
//               }
//             </span>
//           </div>
//         </div>

//         {/* 🔥 LIVE COUNTDOWN TIMER */}
//         {canReschedule && (
//           <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
//                 <Clock className="w-4 h-4" />
//                 Starts in:
//               </span>
//               <span className={`font-mono font-bold text-lg px-3 py-1 rounded-lg shadow-lg ${
//                 isLive 
//                   ? 'bg-emerald-500 text-white animate-pulse' 
//                   : parseInt(timeLeft.split(' ')[0]) < 1 
//                     ? 'bg-amber-500 text-white' 
//                     : 'bg-blue-500 text-white'
//               }`}>
//                 {timeLeft}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Tokens */}
//         <div className="flex items-center justify-between mb-8">
//           <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
//             {canReschedule ? timeLeft : 'Confirmed'}
//           </span>
//           <div className="text-right">
//             <div className="text-lg font-bold text-emerald-600">
//               +{booking.token_cost || 25} tokens
//             </div>
//             <p className="text-xs text-slate-500">You'll earn</p>
//           </div>
//         </div>

//         {/* 🔥 ACTION BUTTONS - ADD RESCHEDULE */}
//         <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               openCancelModal(booking.id);
//             }}
//             disabled={cancelLoading}
//             className="flex-1 bg-white border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//             </svg>
//             Cancel
//           </button>
          
//           {canReschedule && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openRescheduleModal(booking.id);
//               }}
//               className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
//               disabled={rescheduleLoading}
//             >
//               🔄 Reschedule
//             </button>
//           )}
          
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/interviewer/dashboard/bookings/${booking.id}`);
//             }}
//             className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
//           >
//             Details
//           </button>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Upcoming Sessions</h1>
//             <p className="text-slate-600 mt-2">
//               {sessions.length} confirmed session{sessions.length !== 1 ? 's' : ''}
//             </p>
//           </div>
//         </div>

//         {sessions.length === 0 ? (
//           <div className="text-center py-20">
//             <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
//               <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-semibold text-slate-900 mb-2">No upcoming sessions</h3>
//             <p className="text-slate-600 mb-6">All your confirmed sessions will appear here.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {sessions.map((booking) => (
//               <SessionCard key={booking.id} booking={booking} />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* 🔥 YOUR EXISTING CANCEL MODAL */}
//       {cancelModalOpen && selectedBookingId && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//           {/* YOUR EXISTING CANCEL MODAL JSX - UNCHANGED */}
//           <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
//             <div className="p-8 pb-6 border-b border-slate-200">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-slate-900">Cancel Session</h2>
//                 <button
//                   onClick={closeCancelModal}
//                   className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 disabled:opacity-50"
//                   disabled={cancelLoading}
//                 >
//                   <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
              
//               <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
//                 <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-xl text-rose-800">Candidate will lose this slot</h3>
//                   <p className="text-sm text-rose-700">All tokens will be refunded automatically.</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-8">
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold text-slate-900 mb-2">
//                   Cancellation Reason <span className="text-rose-500">*</span>
//                 </label>
//                 <textarea
//                   value={cancelReason}
//                   onChange={(e) => setCancelReason(e.target.value)}
//                   placeholder="e.g., I'm unavailable, personal emergency, found a better candidate, etc."
//                   rows={4}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 resize-vertical disabled:opacity-50"
//                   disabled={cancelLoading}
//                 />
//               </div>
//             </div>

//             <div className="p-8 pt-0 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={closeCancelModal}
//                   disabled={cancelLoading}
//                   className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
//                 >
//                   Keep Booking
//                 </button>
//                 <button
//                   onClick={handleCancelConfirm}
//                   disabled={!cancelReason.trim() || cancelLoading}
//                   className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {cancelLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       Cancelling...
//                     </>
//                   ) : (
//                     'Cancel & Refund Tokens'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔥 NEW RESCHEDULE MODAL */}
//       {rescheduleModalOpen && selectedBooking && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
//           <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
//             <div className="p-8 pb-6 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
//                   🔄 Reschedule Session #{selectedBooking.id}
//                 </h2>
//                 <button 
//                   onClick={() => setRescheduleModalOpen(false)} 
//                   className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 disabled:opacity-50"
//                   disabled={rescheduleLoading}
//                 >
//                   <X className="w-7 h-7 text-slate-500" />
//                 </button>
//               </div>
//               <p className="text-slate-700 text-lg">
//                 Select new time for <strong>{selectedBooking.candidate_name}</strong>
//               </p>
//             </div>

//             <div className="p-8 border-b">
//               <InterviewerCalendarComponent 
//                 interviewerId={selectedBooking.interviewer_id}
//                 excludeSlotId={selectedBooking.availability_id}
//                 onSlotSelect={setSelectedNewSlot}
//               />
//             </div>

//             <div className="p-8 pt-0 border-t bg-slate-50/50 rounded-b-3xl flex gap-4">
//               <button 
//                 onClick={() => setRescheduleModalOpen(false)} 
//                 disabled={rescheduleLoading}
//                 className="flex-1 py-5 px-8 border-2 border-slate-300 rounded-3xl font-bold text-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleRescheduleConfirm} 
//                 disabled={!selectedNewSlot || rescheduleLoading}
//                 className="flex-1 py-5 px-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-lg rounded-3xl shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200"
//               >
//                 {rescheduleLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//                     Rescheduling...
//                   </>
//                 ) : (
//                   `✅ Confirm New Time`
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default UpcomingSessionsPage;

