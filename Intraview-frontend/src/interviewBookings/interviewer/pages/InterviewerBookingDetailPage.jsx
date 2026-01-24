// src/pages/interviewer/InterviewerBookingDetailPage.jsx - NO SHADCN
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';

const InterviewerBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await interviewerBookingsApi.getBookingDetail(bookingId);
      setBooking(res.data);
    } catch (error) {
      toast.error('Booking not found');
      navigate('/interviewer/dashboard/upcoming');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      await interviewerBookingsApi.cancelBooking(bookingId, cancelReason);
      toast.success('Booking cancelled successfully');
      navigate('/interviewer/dashboard/upcoming');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
      setCancelModalOpen(false);
      setCancelReason('');
    }
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setCancelReason('');
  };

  const canCancel = booking?.status === 'CONFIRMED' && new Date(booking?.start_datetime) > new Date();
  const isCompleted = booking?.status === 'COMPLETED';
  const isCancelled = booking?.status?.includes('CANCELLED');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Booking Not Found</h1>
          <button
            onClick={() => navigate('/interviewer/dashboard/upcoming')}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all duration-200 text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const config = {
      CONFIRMED: 'bg-emerald-100 text-emerald-800',
      COMPLETED: 'bg-slate-100 text-slate-800',
      CANCELLED: 'bg-rose-100 text-rose-800',
      CANCELLED_BY_CANDIDATE: 'bg-rose-100 text-rose-800',
      CANCELLED_BY_INTERVIEWER: 'bg-rose-100 text-rose-800',
    };
    const badgeClass = config[status] || config.CANCELLED;
    
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badgeClass}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/interviewer/dashboard/upcoming')}
            className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-slate-700 hover:text-slate-900 bg-white px-6 py-3 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Upcoming
          </button>

          {/* Main Booking Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 mb-4">Booking #{booking.id}</h1>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-600'} mb-1`}>
                    {isCompleted ? `+${booking.token_cost} tokens` : `-${booking.token_cost} tokens`}
                  </div>
                  <p className="text-sm text-slate-600">{isCompleted ? 'Earned' : 'Locked'}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Session Details */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">Session Details</h2>
                  
                  <div className="space-y-6">
                    {/* Date & Time */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100">
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-3">Date & Time</h3>
                        <p className="text-2xl font-bold text-slate-900">
                          {new Date(booking.start_datetime).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                        <p className="text-xl text-slate-700 mt-2">
                          {new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(booking.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-100">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-3">Candidate</h3>
                        <p className="text-2xl font-bold text-slate-900">{booking.candidate_name || 'N/A'}</p>
                        {booking.candidate_email && (
                          <p className="text-slate-600 mt-1">{booking.candidate_email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Panel */}
                <div className="lg:sticky lg:top-12 self-start">
                  <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Session Actions</h3>

                    {isCancelled && booking.cancellation_reason && (
                      <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-200 mb-6">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Cancellation Reason
                        </h4>
                        <p className="text-slate-700 whitespace-pre-line">{booking.cancellation_reason}</p>
                        {booking.cancelled_at && (
                          <p className="text-xs text-rose-600 mt-2 font-medium">
                            Cancelled on {new Date(booking.cancelled_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      {canCancel && (
                        <button
                          onClick={() => setCancelModalOpen(true)}
                          className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl h-16 text-lg transition-all duration-200"
                          disabled={cancelLoading}
                        >
                          Cancel Session
                        </button>
                      )}

                      {isCompleted && (
                        <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-200 text-center">
                          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-emerald-800 mb-2">Tokens Earned!</h3>
                          <p className="text-emerald-700 text-lg">+{booking.token_cost} tokens transferred</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 NORMAL CANCEL MODAL - NO SHADCN */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 pb-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Cancel Confirmed Session</h2>
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
              
              <div className="p-6 bg-rose-50 rounded-3xl border border-rose-200">
                <p className="text-rose-800 font-semibold text-lg">
                  ⚠️ Candidate will be fully refunded ({booking.token_cost} tokens)
                </p>
              </div>
            </div>

            {/* Reason Form */}
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why you're cancelling..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 resize-vertical disabled:opacity-50"
                  disabled={cancelLoading}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 pt-0 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl flex gap-3">
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
                  'Cancel & Refund'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewerBookingDetailPage;



























// // src/pages/interviewer/InterviewerBookingDetailPage.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { X, Clock, ArrowLeft } from 'lucide-react';
// import { interviewerBookingsApi } from '../../interviewerBookingsApi';
// import InterviewerCalendarComponent from '../components/InterviewerCalendarComponent';

// // 🔥 IST TIME FORMATTER - FIXED
// const formatTimeIST = (timeString) => {
//   const [hours, minutes] = timeString.split(':').slice(0, 2);
//   const date = new Date();
//   date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
//   return date.toLocaleTimeString('en-IN', {
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true
//   });
// };

// const InterviewerBookingDetailPage = () => {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();
  
//   // 🔥 ALL STATES
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Cancel Modal
//   const [cancelModalOpen, setCancelModalOpen] = useState(false);
//   const [cancelReason, setCancelReason] = useState('');
//   const [cancelLoading, setCancelLoading] = useState(false);
  
//   // 🔥 RESCHEDULE MODAL
//   const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
//   const [rescheduleLoading, setRescheduleLoading] = useState(false);
//   const [selectedNewSlot, setSelectedNewSlot] = useState(null);
  
//   // 🔥 LIVE TIMER
//   const [timeLeft, setTimeLeft] = useState('');
//   const [isLive, setIsLive] = useState(false);

//   useEffect(() => {
//     fetchBooking();
//   }, [bookingId]);

//   // 🔥 FIXED LIVE TIMER - IST
//   useEffect(() => {
//     if (!booking?.start_datetime || !booking?.end_datetime) return;

//     const startTime = new Date(booking.start_datetime);
//     const endTime = new Date(booking.end_datetime);
    
//     const updateTimer = () => {
//       const now = new Date();
//       const diffToStart = startTime - now;
//       const diffToEnd = endTime - now;

//       if (diffToStart <= 0 && diffToEnd > 0) {
//         setIsLive(true);
//         setTimeLeft('LIVE NOW');
//       } else if (diffToEnd <= 0) {
//         setIsLive(false);
//         setTimeLeft('ENDED');
//       } else {
//         const hours = Math.floor(diffToStart / (1000 * 60 * 60));
//         const minutes = Math.floor((diffToStart / (1000 * 60)) % 60);
//         const seconds = Math.floor((diffToStart / 1000) % 60);
//         setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//       }
//     };

//     const interval = setInterval(updateTimer, 1000);
//     updateTimer();
//     return () => clearInterval(interval);
//   }, [booking]);

//   const fetchBooking = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await interviewerBookingsApi.getBookingDetail(bookingId);
//       console.log("booking details", res.data);
//       setBooking(res.data);
//     } catch (error) {
//       toast.error('Booking not found');
//       navigate('/interviewer/dashboard/upcoming');
//     } finally {
//       setLoading(false);
//     }
//   }, [bookingId, navigate]);

//   // 🔥 RESCHEDULE FUNCTIONS
//   const openRescheduleModal = () => {
//     if (booking.status !== 'CONFIRMED') {
//       toast.error('Can only reschedule confirmed bookings');
//       return;
//     }
//     setRescheduleModalOpen(true);
//   };

//   const handleRescheduleConfirm = async () => {
//     if (!selectedNewSlot) {
//       toast.error('Please select a new time slot');
//       return;
//     }

//     try {
//       setRescheduleLoading(true);
//       await interviewerBookingsApi.rescheduleBooking(bookingId, {
//         new_availability_id: selectedNewSlot.id,
//         reason: 'Rescheduled by interviewer from detail page'
//       });
//       toast.success('✅ Session rescheduled successfully!');
//       setRescheduleModalOpen(false);
//       setSelectedNewSlot(null);
//       fetchBooking(); // Refresh booking data
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Reschedule failed');
//     } finally {
//       setRescheduleLoading(false);
//     }
//   };

//   const handleCancelConfirm = async () => {
//     if (!cancelReason.trim()) {
//       toast.error('Please provide a cancellation reason');
//       return;
//     }

//     try {
//       setCancelLoading(true);
//       await interviewerBookingsApi.cancelBooking(bookingId, cancelReason);
//       toast.success('Booking cancelled successfully');
//       navigate('/interviewer/dashboard/upcoming');
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Failed to cancel booking');
//     } finally {
//       setCancelLoading(false);
//       setCancelModalOpen(false);
//       setCancelReason('');
//     }
//   };

//   const closeCancelModal = () => {
//     setCancelModalOpen(false);
//     setCancelReason('');
//   };

//   const canCancel = booking?.status === 'CONFIRMED' && new Date(booking?.start_datetime) > new Date();
//   const canReschedule = booking?.status === 'CONFIRMED' && new Date(booking?.start_datetime) > new Date();
//   const isCompleted = booking?.status === 'COMPLETED';
//   const isCancelled = booking?.status?.includes('CANCELLED');

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   if (!booking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-slate-900 mb-4">Booking Not Found</h1>
//           <button
//             onClick={() => navigate('/interviewer/dashboard/upcoming')}
//             className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all duration-200 text-lg"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const StatusBadge = ({ status }) => {
//     const config = {
//       CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
//       COMPLETED: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completed' },
//       CANCELLED: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
//       CANCELLED_BY_CANDIDATE: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
//       CANCELLED_BY_INTERVIEWER: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
//     };
//     const badgeConfig = config[status] || config.CANCELLED;
    
//     return (
//       <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badgeConfig.bg} ${badgeConfig.text}`}>
//         {badgeConfig.label}
//       </span>
//     );
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4">
//         <div className="max-w-6xl mx-auto">
//           {/* Back Button */}
//           <button
//             onClick={() => navigate('/interviewer/dashboard/upcoming')}
//             className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-slate-700 hover:text-slate-900 bg-white px-6 py-3 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-200"
//           >
//             <ArrowLeft className="w-6 h-6" />
//             Back to Upcoming
//           </button>

//           {/* 🔥 MAIN BOOKING CARD WITH LIVE TIMER */}
//           <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
//             <div className="p-10">
//               {/* Header */}
//               <div className="flex items-start justify-between mb-10">
//                 <div>
//                   <h1 className="text-4xl font-black text-slate-900 mb-4">Booking #{booking.id}</h1>
//                   <StatusBadge status={booking.status} />
//                 </div>
//                 <div className="text-right">
//                   <div className={`text-3xl font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-600'} mb-1`}>
//                     {isCompleted ? `+${booking.token_cost} tokens` : `-${booking.token_cost} tokens`}
//                   </div>
//                   <p className="text-sm text-slate-600">{isCompleted ? 'Earned' : 'Locked'}</p>
//                 </div>
//               </div>

//               {/* 🔥 LIVE TIMER DISPLAY */}
//               {canReschedule && (
//                 <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl border-2 border-emerald-200">
//                   <div className="flex items-center justify-between">
//                     <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
//                       <Clock className="w-6 h-6" />
//                       Session Status:
//                     </span>
//                     <span className={`font-mono font-black text-2xl px-6 py-3 rounded-2xl shadow-lg ${
//                       isLive 
//                         ? 'bg-emerald-500 text-white animate-pulse' 
//                         : parseInt(timeLeft.split(' ')[0]) < 1 
//                           ? 'bg-amber-500 text-white' 
//                           : 'bg-blue-500 text-white'
//                     }`}>
//                       {timeLeft}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               <div className="grid lg:grid-cols-2 gap-12">
//                 {/* 🔥 FIXED SESSION DETAILS - IST TIME */}
//                 <div>
//                   <h2 className="text-2xl font-bold text-slate-900 mb-8">Session Details</h2>
                  
//                   <div className="space-y-6">
//                     {/* 🔥 FIXED Date & Time - IST */}
//                     <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100">
//                       <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-slate-900 mb-3">Date & Time (IST)</h3>
                        
//                         {/* 🔥 DATE - Fixed */}
//                         <p className="text-2xl font-bold text-slate-900 mb-4">
//                           {new Date(booking.date).toLocaleDateString('en-IN', {
//                             weekday: 'long', 
//                             year: 'numeric', 
//                             month: 'long', 
//                             day: 'numeric'
//                           })}
//                         </p>
                        
//                         {/* 🔥 TIME RANGE - FIXED IST */}
//                         <div className="flex items-center gap-6 text-xl font-bold text-slate-700 bg-white px-6 py-3 rounded-2xl shadow-sm">
//                           <span>{formatTimeIST(booking.start_time)}</span>
//                           <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           <span>{formatTimeIST(booking.end_time)}</span>
//                         </div>
                        
//                         {/* 🔥 Timezone badge */}
//                         <p className="text-sm text-slate-500 mt-3 font-medium flex items-center gap-2">
//                           <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">Asia/Kolkata</span>
//                           Confirmed Timezone
//                         </p>
//                       </div>
//                     </div>

//                     {/* Candidate Info */}
//                     <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-100">
//                       <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
//                         </svg>
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-slate-900 mb-3">Candidate</h3>
//                         <p className="text-2xl font-bold text-slate-900">{booking.candidate_name || 'N/A'}</p>
//                         {booking.candidate_email && (
//                           <p className="text-slate-600 mt-1">{booking.candidate_email}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* 🔥 ACTION PANEL */}
//                 <div className="lg:sticky lg:top-12 self-start">
//                   <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200">
//                     <h3 className="text-xl font-bold text-slate-900 mb-6">Session Actions</h3>

//                     {isCancelled && booking.cancellation_reason && (
//                       <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-200 mb-6">
//                         <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
//                           <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                           </svg>
//                           Cancellation Reason
//                         </h4>
//                         <p className="text-slate-700 whitespace-pre-line">{booking.cancellation_reason}</p>
//                         {booking.cancelled_at && (
//                           <p className="text-xs text-rose-600 mt-2 font-medium">
//                             Cancelled on {new Date(booking.cancelled_at).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     <div className="space-y-4">
//                       {canReschedule && (
//                         <button
//                           onClick={openRescheduleModal}
//                           className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl h-16 text-lg transition-all duration-200 flex items-center justify-center gap-2"
//                         >
//                           🔄 Reschedule Session
//                         </button>
//                       )}

//                       {canCancel && (
//                         <button
//                           onClick={() => setCancelModalOpen(true)}
//                           className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl h-16 text-lg transition-all duration-200"
//                           disabled={cancelLoading}
//                         >
//                           Cancel Session
//                         </button>
//                       )}

//                       {isCompleted && (
//                         <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-200 text-center">
//                           <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
//                             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </div>
//                           <h3 className="text-2xl font-bold text-emerald-800 mb-2">Tokens Earned!</h3>
//                           <p className="text-emerald-700 text-lg">+{booking.token_cost} tokens transferred</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 🔥 RESCHEDULE MODAL */}
//       {rescheduleModalOpen && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
//           <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
//             <div className="p-8 pb-6 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
//                   🔄 Reschedule Session #{booking.id}
//                 </h2>
//                 <button
//                   onClick={() => setRescheduleModalOpen(false)}
//                   className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200"
//                   disabled={rescheduleLoading}
//                 >
//                   <X className="w-7 h-7 text-slate-500" />
//                 </button>
//               </div>
//               <p className="text-slate-700">
//                 Select new time slot for <strong>{booking.candidate_name}</strong>
//               </p>
//             </div>

//             <div className="p-8 border-b">
//               {/* 🔥 CALENDAR - EXCLUDE CURRENT SLOT */}
//               <InterviewerCalendarComponent 
//                 excludeSlotId={booking.availability_id}
//                 onSlotSelect={setSelectedNewSlot}
//               />
//             </div>

//             <div className="p-8 pt-0 border-t bg-slate-50/50 rounded-b-3xl flex gap-4">
//               <button 
//                 onClick={() => setRescheduleModalOpen(false)} 
//                 disabled={rescheduleLoading}
//                 className="flex-1 py-5 px-8 border-2 border-slate-300 rounded-3xl font-bold text-lg hover:bg-slate-50 transition-all duration-200"
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

//       {/* CANCEL MODAL */}
//       {cancelModalOpen && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//           <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
//             <div className="p-8 pb-6 border-b border-slate-200">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-slate-900">Cancel Confirmed Session</h2>
//                 <button
//                   onClick={closeCancelModal}
//                   className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200"
//                   disabled={cancelLoading}
//                 >
//                   <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
              
//               <div className="p-6 bg-rose-50 rounded-3xl border border-rose-200">
//                 <p className="text-rose-800 font-semibold text-lg">
//                   ⚠️ Candidate will be fully refunded ({booking.token_cost} tokens)
//                 </p>
//               </div>
//             </div>

//             <div className="p-8">
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold text-slate-900 mb-2">
//                   Reason <span className="text-rose-500">*</span>
//                 </label>
//                 <textarea
//                   value={cancelReason}
//                   onChange={(e) => setCancelReason(e.target.value)}
//                   placeholder="Explain why you're cancelling..."
//                   rows={4}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 resize-vertical disabled:opacity-50"
//                   disabled={cancelLoading}
//                 />
//               </div>
//             </div>

//             <div className="p-8 pt-0 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl flex gap-3">
//               <button
//                 onClick={closeCancelModal}
//                 disabled={cancelLoading}
//                 className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
//               >
//                 Keep Booking
//               </button>
//               <button
//                 onClick={handleCancelConfirm}
//                 disabled={!cancelReason.trim() || cancelLoading}
//                 className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {cancelLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Cancelling...
//                   </>
//                 ) : (
//                   'Cancel & Refund'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default InterviewerBookingDetailPage;
