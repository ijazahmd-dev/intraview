

// // src/pages/candidate/BookingDetailPage.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
// import { toast } from 'sonner';
// import { X, ArrowLeft, Clock, Calendar, CheckCircle } from 'lucide-react';
// import { candidateBookingsApi } from '../../candidateBookingsApi';
// import RescheduleRequestModal from '../components/RescheduleRequestModal'; // NEW import

// const BookingDetailPage = () => {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cancelModalOpen, setCancelModalOpen] = useState(false);
//   const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
//   const [cancelReason, setCancelReason] = useState('');
//   const [cancelLoading, setCancelLoading] = useState(false);
//   const [timeLeft, setTimeLeft] = useState('');

//   // Open reschedule modal directly from dashboard when ?action=reschedule
//   useEffect(() => {
//     if (searchParams.get('action') === 'reschedule') {
//       setRescheduleModalOpen(true);
//     }
//   }, [searchParams]);

//   // Fetch booking details
//   const fetchBooking = async () => {
//     try {
//       setLoading(true);
//       const res = await candidateBookingsApi.getBookingDetail(bookingId);
//       setBooking(res.data);
//     } catch (error) {
//       toast.error(error.response?.data?.detail || 'Booking not found');
//       navigate('/candidate/dashboard/upcoming');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBooking();
//   }, [bookingId, navigate]);

//   // 🔥 LIVE COUNTDOWN TIMER
//   useEffect(() => {
//     if (!booking) return;

//     const startTime = new Date(booking.start_datetime);
//     const endTime = booking.end_datetime
//       ? new Date(booking.end_datetime)
//       : new Date(startTime.getTime() + 30 * 60 * 1000);

//     const updateTimer = () => {
//       const now = new Date();
//       const diffToStart = startTime - now;
//       const diffToEnd = endTime - now;

//       if (diffToStart <= 0 && diffToEnd > 0) {
//         setTimeLeft('LIVE NOW');
//       } else if (diffToEnd <= 0) {
//         setTimeLeft('SESSION COMPLETED');
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

//   // Cancel booking
//   const handleCancelBooking = async () => {
//     if (!cancelReason.trim()) {
//       toast.error('Please provide a cancellation reason');
//       return;
//     }

//     try {
//       setCancelLoading(true);
//       await candidateBookingsApi.cancelBooking(bookingId, {
//         cancellation_reason: cancelReason,
//       });
//       toast.success('Booking cancelled successfully. Tokens unlocked.');
//       navigate('/candidate/dashboard/upcoming');
//     } catch (error) {
//       toast.error(
//         error.response?.data?.detail || 'Failed to cancel booking',
//       );
//     } finally {
//       setCancelLoading(false);
//       setCancelModalOpen(false);
//     }
//   };

//   const now = new Date();
//   const canCancel =
//     booking?.status === 'CONFIRMED' &&
//     new Date(booking?.start_datetime) > now;

//   const hasPendingReschedule =
//     booking?.reschedule_status === 'PENDING';

//   const canReschedule =
//     booking?.status === 'CONFIRMED' &&
//     new Date(booking?.start_datetime) > now &&
//     !hasPendingReschedule; // disable if request already pending

//   const isLive = timeLeft === 'LIVE NOW';

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
//           <p className="text-xl font-semibold text-gray-700">
//             Loading booking details…
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!booking) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-slate-900 mb-4">
//             Booking Not Found
//           </h1>
//           <button
//             onClick={() => navigate('/candidate/dashboard/upcoming')}
//             className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all duration-200"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const StatusBadge = ({ status }) => {
//     const config = {
//       CONFIRMED: {
//         bg: 'bg-emerald-100',
//         text: 'text-emerald-800',
//         label: 'Confirmed',
//       },
//       PENDING: {
//         bg: 'bg-amber-100',
//         text: 'text-amber-800',
//         label: 'Pending',
//       },
//       COMPLETED: {
//         bg: 'bg-slate-100',
//         text: 'text-slate-800',
//         label: 'Completed',
//       },
//       CANCELLED: {
//         bg: 'bg-rose-100',
//         text: 'text-rose-800',
//         label: 'Cancelled',
//       },
//     };
//     const style = config[status] || config.CANCELLED;

//     return (
//       <span
//         className={`px-4 py-2 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}
//       >
//         {style.label}
//       </span>
//     );
//   };

//   const handleJoinSession = () => {
//     if (booking.meeting_url) {
//       window.open(booking.meeting_url, '_blank');
//     } else {
//       toast.info(
//         'Meeting link will be available closer to the session time',
//       );
//     }
//   };

//   const proposedSlot = booking.proposed_slot || null;
//   const rescheduleNote = booking.reschedule_note || '';

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Top Navigation */}
//         <div className="flex items-center justify-between mb-12">
//           <button
//             onClick={() => navigate('/candidate/dashboard/upcoming')}
//             className="inline-flex items-center gap-2 text-lg font-semibold text-slate-700 hover:text-slate-900 transition-colors"
//           >
//             <ArrowLeft className="w-6 h-6" />
//             Back to Dashboard
//           </button>
//         </div>

//         {/* Main Booking Card */}
//         <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
//           <div className="p-10">
//             {/* Header */}
//             <div className="flex items-start justify-between mb-8">
//               <div>
//                 <h1 className="text-4xl font-black text-slate-900 mb-2">
//                   Booking #{booking.id}
//                 </h1>
//                 <StatusBadge status={booking.status} />
//               </div>
//               <div className="text-right">
//                 <div className="text-3xl font-bold text-emerald-600 mb-1">
//                   -{booking.token_cost} tokens
//                 </div>
//                 <p className="text-sm text-slate-600">
//                   Locked until completion
//                 </p>
//               </div>
//             </div>

//             {/* NEW: Pending reschedule banner */}
//             {hasPendingReschedule && (
//               <div className="mb-8 p-5 bg-amber-50 rounded-3xl border border-amber-200">
//                 <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
//                   Reschedule request pending
//                 </p>
//                 {proposedSlot && (
//                   <p className="text-sm text-amber-900">
//                     Proposed slot:{' '}
//                     <span className="font-medium">
//                       {proposedSlot.date}{' '}
//                       {proposedSlot.start_time} - {proposedSlot.end_time}
//                     </span>
//                   </p>
//                 )}
//                 {rescheduleNote && (
//                   <p className="text-sm text-amber-900 mt-1">
//                     Your note:{' '}
//                     <span className="italic">{rescheduleNote}</span>
//                   </p>
//                 )}
//                 <p className="text-xs text-amber-700 mt-2">
//                   Waiting for the interviewer to accept or reject this
//                   request. You cannot send another reschedule until they
//                   respond.
//                 </p>
//               </div>
//             )}

//             {/* 🔥 LIVE TIMER */}
//             {canReschedule && (
//               <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl border-2 border-emerald-200">
//                 <div className="flex items-center justify-between">
//                   <span className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                     <Clock className="w-5 h-5" />
//                     Session Status
//                   </span>
//                   <span
//                     className={`font-mono font-bold text-2xl px-4 py-2 rounded-xl shadow-lg ${
//                       isLive
//                         ? 'bg-emerald-500 text-white animate-pulse'
//                         : timeLeft.includes('h')
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-amber-500 text-white'
//                     }`}
//                   >
//                     {timeLeft}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className="grid lg:grid-cols-2 gap-12 mb-12">
//               {/* Session Details */}
//               <div>
//                 <h2 className="text-2xl font-bold text-slate-900 mb-8">
//                   Session Details
//                 </h2>

//                 <div className="space-y-6">
//                   {/* Date & Time */}
//                   <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100">
//                     <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                       <Calendar className="w-6 h-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-slate-900 mb-2">
//                         Date & Time
//                       </h3>
//                       <p className="text-2xl font-bold text-slate-900">
//                         {new Date(
//                           booking.start_datetime,
//                         ).toLocaleDateString('en-US', {
//                           weekday: 'long',
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric',
//                         })}
//                       </p>
//                       <p className="text-xl text-slate-700 mt-1">
//                         {booking.start_time} - {booking.end_time}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Interviewer */}
//                   <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-100">
//                     <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                       <svg
//                         className="w-6 h-6 text-white"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-slate-900 mb-2">
//                         Interviewer
//                       </h3>
//                       <p className="text-2xl font-bold text-slate-900">
//                         {booking.interviewer_name}
//                       </p>
//                       {booking.interviewer_headline && (
//                         <p className="text-slate-600 mt-1">
//                           {booking.interviewer_headline}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Interview Type */}
//                   {booking.type && (
//                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
//                       <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
//                         <svg
//                           className="w-5 h-5 text-indigo-600"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
//                           />
//                         </svg>
//                         Interview Type
//                       </h3>
//                       <p className="text-xl font-semibold text-slate-900 bg-indigo-100 px-4 py-2 rounded-2xl inline-block">
//                         {booking.type}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Sidebar: Actions & Status */}
//               <div className="lg:sticky lg:top-12 lg:self-start">
//                 <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200">
//                   <h3 className="text-xl font-bold text-slate-900 mb-6">
//                     Quick Actions
//                   </h3>

//                   {/* 🔥 JOIN SESSION BUTTON */}
//                   {canReschedule && (
//                     <button
//                       onClick={handleJoinSession}
//                       className={`w-full mb-3 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 text-lg ${
//                         isLive
//                           ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
//                           : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
//                       }`}
//                     >
//                       {isLive ? (
//                         <>
//                           <CheckCircle className="w-6 h-6 animate-pulse" />
//                           JOIN SESSION NOW
//                         </>
//                       ) : (
//                         <>
//                           <Clock className="w-6 h-6" />
//                           Join Session
//                         </>
//                       )}
//                     </button>
//                   )}

//                   {/* Action Buttons */}
//                   <div className="space-y-3">
//                     {canCancel && (
//                       <button
//                         onClick={() => setCancelModalOpen(true)}
//                         className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
//                       >
//                         <svg
//                           className="w-5 h-5"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                           />
//                         </svg>
//                         Cancel Booking
//                       </button>
//                     )}

//                     {canReschedule && (
//                       <button
//                         onClick={() => setRescheduleModalOpen(true)}
//                         className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
//                       >
//                         <svg
//                           className="w-5 h-5"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                           />
//                         </svg>
//                         Reschedule
//                       </button>
//                     )}

//                     {booking.status === 'COMPLETED' && (
//                       <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
//                         View Recording
//                       </button>
//                     )}

//                     <button className="w-full border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all duration-200">
//                       Add to Calendar
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {booking.status === 'CANCELLED' &&
//               booking.cancellation_reason && (
//                 <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-200 mt-8">
//                   <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
//                     <svg
//                       className="w-5 h-5 text-rose-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                       />
//                     </svg>
//                     Cancellation Reason
//                   </h3>
//                   <p className="text-slate-700">
//                     {booking.cancellation_reason}
//                   </p>
//                 </div>
//               )}

//             {/* Additional Info */}
//             {booking.notes && (
//               <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200">
//                 <h3 className="text-xl font-bold text-slate-900 mb-4">
//                   Session Notes
//                 </h3>
//                 <p className="text-lg text-slate-700 whitespace-pre-line">
//                   {booking.notes}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* 🔥 CANCEL MODAL */}
//       {canCancel && (
//         <CancelBookingModal
//           isOpen={cancelModalOpen}
//           onClose={() => setCancelModalOpen(false)}
//           onConfirm={handleCancelBooking}
//           loading={cancelLoading}
//           tokenCost={booking.token_cost}
//           reason={cancelReason}
//           onReasonChange={setCancelReason}
//         />
//       )}

//       {/* 🔥 RESCHEDULE REQUEST MODAL (new flow) */}
//       {canReschedule && (
//         <RescheduleRequestModal
//           isOpen={rescheduleModalOpen}
//           booking={booking}
//           onClose={() => setRescheduleModalOpen(false)}
//           onRequestSent={async () => {
//             setRescheduleModalOpen(false);
//             await fetchBooking(); // refresh to show pending state
//           }}
//         />
//       )}
//     </div>
//   );
// };

// // 🔥 CANCEL MODAL COMPONENT (unchanged)
// const CancelBookingModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   loading,
//   tokenCost,
//   reason,
//   onReasonChange,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//       <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50">
//         <div className="p-8 pb-6 border-b border-slate-200">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-slate-900">
//               Cancel Booking
//             </h2>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200"
//               disabled={loading}
//             >
//               <X className="w-6 h-6 text-slate-500" />
//             </button>
//           </div>

//           <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
//             <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center">
//               <svg
//                 className="w-6 h-6 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h3 className="font-bold text-xl text-rose-800">
//                 Confirm Cancellation
//               </h3>
//               <p className="text-sm text-rose-700">
//                 You'll get all {tokenCost} tokens refunded
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-8">
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-slate-900 mb-2">
//               Cancellation Reason <span className="text-rose-500">*</span>
//             </label>
//             <textarea
//               value={reason}
//               onChange={(e) => onReasonChange(e.target.value)}
//               placeholder="Please explain why you're cancelling..."
//               rows={4}
//               className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-rose-200 focus:border-rose-500 resize-vertical"
//               disabled={loading}
//             />
//           </div>
//         </div>

//         <div className="p-8 pt-0 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               onClick={onClose}
//               disabled={loading}
//               className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
//             >
//               Keep Booking
//             </button>
//             <button
//               onClick={onConfirm}
//               disabled={!reason.trim() || loading}
//               className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Cancelling...
//                 </>
//               ) : (
//                 'Cancel & Refund Tokens'
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingDetailPage;

































// src/interviewBookings/user/pages/BookingDetailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Clock, Calendar, User, AlertTriangle,
  RefreshCw, XCircle, MessageSquare, CheckCircle2,
  ChevronRight, X, Target
} from 'lucide-react';
import { candidateBookingsApi } from '../../candidateBookingsApi';
import RescheduleRequestModal from '../components/RescheduleRequestModal';
import ReportIssueModal from '../../../features/issues/components/RaiseIssueModal';
import { INTERVIEW_TYPE_LABELS, DIFFICULTY_LABELS, CANDIDATE_GOALS } from '../components/SessionConfigModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  COMPLETED: { label: 'Completed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  LIVE: { label: 'Live Now', color: 'bg-green-100 text-green-800 border-green-200 animate-pulse' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  CANCELLED_BY_CANDIDATE: { label: 'Cancelled by You', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  CANCELLED_BY_INTERVIEWER: { label: 'Cancelled by Interviewer', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  CANDIDATE_NO_SHOW: { label: 'No Show', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  INTERVIEWER_NO_SHOW: { label: 'Interviewer No Show', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};



const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CANCELLED;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accent || 'bg-gray-100'}`}>
      <Icon className="w-4 h-4 text-gray-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [reportIssueOpen, setReportIssueOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'reschedule') setRescheduleModalOpen(true);
  }, [searchParams]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await candidateBookingsApi.getBookingDetail(bookingId);
      setBooking(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking not found');
      navigate('/candidate/dashboard/upcoming');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooking(); }, [bookingId]);

  // Live countdown timer
  useEffect(() => {
    if (!booking) return;
    const startTime = new Date(booking.start_datetime);
    const endTime = booking.end_datetime
      ? new Date(booking.end_datetime)
      : new Date(startTime.getTime() + 30 * 60 * 1000);

    const tick = () => {
      const now = new Date();
      const toStart = startTime - now;
      const toEnd = endTime - now;

      if (toStart <= 0 && toEnd > 0) {
        setTimeLeft('LIVE NOW');
      } else if (toEnd <= 0) {
        setTimeLeft('COMPLETED');
      } else {
        const h = Math.floor(toStart / 3_600_000);
        const m = Math.floor((toStart / 60_000) % 60);
        const s = Math.floor((toStart / 1000) % 60);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };

    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [booking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading booking…</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const now = new Date();
  const sessionStart = new Date(booking.start_datetime);
  const isUpcoming = sessionStart > now;
  const isLive = timeLeft === 'LIVE NOW';
  const isCompleted = booking.status === 'COMPLETED';
  const isCancelled = ['CANCELLED', 'CANCELLED_BY_CANDIDATE', 'CANCELLED_BY_INTERVIEWER'].includes(booking.status);
  const hasPendingReschedule = booking.reschedule_status === 'PENDING';
  const canCancel = booking.status === 'CONFIRMED' && isUpcoming;
  const canReschedule = booking.status === 'CONFIRMED' && isUpcoming && !hasPendingReschedule;
  const canJoin = (booking.status === 'CONFIRMED' || booking.status === 'LIVE') && !isCancelled;
  const hasFeedback = isCompleted && booking.feedback_evaluation_id;

  const formattedDate = sessionStart.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-700">
            Session #{booking.id}
          </span>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left column (main info) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Colored top stripe based on status */}
              <div className={`h-1.5 w-full ${isLive ? 'bg-green-500' :
                  isCompleted ? 'bg-teal-600' :
                    isCancelled ? 'bg-rose-400' :
                      'bg-teal-600'
                }`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Mock Interview Session
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Booking #{booking.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {booking.token_cost} tokens
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isCancelled ? 'Refunded' : isCompleted ? 'Spent' : 'Reserved'}
                    </p>
                  </div>
                </div>

                {/* Date / Time / Interviewer rows */}
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 divide-y divide-gray-100">
                  <InfoRow
                    icon={Calendar}
                    label="Date"
                    value={formattedDate}
                    accent="bg-blue-50"
                  />
                  <InfoRow
                    icon={Clock}
                    label="Time"
                    value={`${booking.start_time} – ${booking.end_time}`}
                    accent="bg-teal-50"
                  />
                  <InfoRow
                    icon={User}
                    label="Interviewer"
                    value={booking.interviewer_name || `Interviewer #${booking.interviewer_id}`}
                    accent="bg-emerald-50"
                  />
                </div>

                {booking.interviewer_headline && (
                  <p className="mt-3 text-sm text-gray-500 pl-11">
                    {booking.interviewer_headline}
                  </p>
                )}
              </div>
            </div>

            {/* Live countdown / timer */}
            {(canJoin || isLive) && booking.status !== 'COMPLETED' && (
              <div className={`rounded-2xl border p-5 flex items-center justify-between ${isLive
                  ? 'bg-green-50 border-green-200'
                  : 'bg-teal-50 border-teal-200'
                }`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 mb-1">
                    {isLive ? 'Session is happening now' : 'Time until session'}
                  </p>
                  <p className={`text-2xl font-bold font-mono ${isLive ? 'text-green-700' : 'text-teal-800'}`}>
                    {isLive ? '● LIVE' : timeLeft}
                  </p>
                </div>
                <button
                  onClick={() =>
                    booking.meeting_url
                      ? window.open(booking.meeting_url, '_blank')
                      : toast.info('Meeting link will be available closer to the session time')
                  }
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all ${isLive
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                >
                  {isLive ? 'Join Now →' : 'Join Session'}
                </button>
              </div>
            )}

            {/* Pending reschedule notice */}
            {hasPendingReschedule && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-800">
                    Reschedule request pending
                  </p>
                </div>
                {booking.proposed_slot && (
                  <p className="text-sm text-amber-900 mb-1">
                    <span className="font-medium">Proposed: </span>
                    {booking.proposed_slot.date} · {booking.proposed_slot.start_time} – {booking.proposed_slot.end_time}
                  </p>
                )}
                {booking.reschedule_note && (
                  <p className="text-sm text-amber-800 italic">
                    "{booking.reschedule_note}"
                  </p>
                )}
                <p className="text-xs text-amber-600 mt-2">
                  Waiting for the interviewer to respond. You cannot send another request until they do.
                </p>
              </div>
            )}

            {/* Cancellation reason */}
            {isCancelled && booking.cancellation_reason && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <p className="text-sm font-semibold text-rose-800">Cancellation reason</p>
                </div>
                <p className="text-sm text-rose-700">{booking.cancellation_reason}</p>
                {booking.cancelled_at && (
                  <p className="text-xs text-rose-400 mt-1">
                    Cancelled on {new Date(booking.cancelled_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Feedback card (completed sessions) */}
            {isCompleted && (
              <div className={`rounded-2xl border p-5 ${hasFeedback
                  ? 'bg-white border-teal-200'
                  : 'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasFeedback ? 'bg-teal-100' : 'bg-gray-100'
                      }`}>
                      <MessageSquare className={`w-5 h-5 ${hasFeedback ? 'text-teal-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {hasFeedback ? 'Feedback available' : 'Awaiting feedback'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {hasFeedback
                          ? 'Your interviewer has submitted feedback'
                          : 'Feedback will appear here once your interviewer submits it'}
                      </p>
                    </div>
                  </div>
                  {hasFeedback && (
                    <button
                      onClick={() =>
                        navigate(`/candidate/feedback/${booking.feedback_evaluation_id}`)
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      View Feedback
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Session Configuration */}
            {(booking.interview_type || booking.difficulty_level || booking.candidate_goal || booking.candidate_notes) && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <p className="text-sm font-bold text-gray-900">Session Requirements</p>
                </div>
                <div className="space-y-4">
                  {booking.interview_type && (
                    <div className="flex items-start justify-between border-b border-indigo-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-gray-500">Interview Type</span>
                      <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-indigo-100">
                        {INTERVIEW_TYPE_LABELS[booking.interview_type] || booking.interview_type}
                      </span>
                    </div>
                  )}
                  {booking.difficulty_level && (
                    <div className="flex items-start justify-between border-b border-indigo-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-gray-500">Experience Level</span>
                      <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-indigo-100">
                        {DIFFICULTY_LABELS[booking.difficulty_level] || booking.difficulty_level}
                      </span>
                    </div>
                  )}
                  {booking.candidate_goal && (
                    <div className="flex items-start justify-between border-b border-indigo-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-gray-500">Your Goal</span>
                      <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-indigo-100">
                        {CANDIDATE_GOALS.find(g => g.value === booking.candidate_goal)?.label || booking.candidate_goal}
                      </span>
                    </div>
                  )}
                  {booking.selected_specialties && Array.isArray(booking.selected_specialties) && booking.selected_specialties.length > 0 && (
                    <div className="border-b border-indigo-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-gray-500 block mb-2">Focus Areas</span>
                      <div className="flex flex-wrap gap-2">
                        {booking.selected_specialties.map((spec, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-indigo-100 text-sm font-semibold text-gray-700 rounded-lg">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {booking.candidate_notes && (
                    <div className="last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-gray-500 block mb-2">Preparation Notes</span>
                      <div className="p-4 bg-white rounded-xl border border-indigo-100 text-sm text-gray-700 whitespace-pre-wrap">
                        {booking.candidate_notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session notes */}
            {booking.notes && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* ── Right column (actions) ── */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
                Actions
              </p>

              <div className="space-y-2.5">
                {canReschedule && (
                  <button
                    onClick={() => setRescheduleModalOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Request Reschedule
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Cancel Booking
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {hasFeedback && (
                  <button
                    onClick={() => navigate(`/candidate/feedback/${booking.feedback_evaluation_id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-xl text-sm font-semibold text-white transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      View Feedback
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                )}

                {/* Report Issue — visible on completed or cancelled sessions */}
                {(isCompleted || isCancelled) && (
                  <button
                    onClick={() => setReportIssueOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Report Issue
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {!canCancel && !canReschedule && !hasFeedback && !isCompleted && !isCancelled && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No actions available
                  </p>
                )}
              </div>
            </div>

            {/* Booking meta */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
                Details
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono font-semibold text-gray-800">#{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tokens</span>
                  <span className="font-semibold text-gray-800">{booking.token_cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reschedules</span>
                  <span className="font-semibold text-gray-800">
                    {booking.reschedule_count ?? 0} / 2
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booked on</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <CancelBookingModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={async (reason) => {
            try {
              await candidateBookingsApi.cancelBooking(bookingId, {
                cancellation_reason: reason,
              });
              toast.success('Booking cancelled. Tokens refunded.');
              navigate('/candidate/dashboard/upcoming');
            } catch (err) {
              toast.error(err.response?.data?.detail || 'Failed to cancel booking');
            }
          }}
          tokenCost={booking.token_cost}
        />
      )}

      {/* Reschedule Modal */}
      {canReschedule && (
        <RescheduleRequestModal
          isOpen={rescheduleModalOpen}
          booking={booking}
          onClose={() => setRescheduleModalOpen(false)}
          onRequestSent={async () => {
            setRescheduleModalOpen(false);
            await fetchBooking();
          }}
        />
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        bookingId={booking?.id}
        open={reportIssueOpen}
        onClose={() => setReportIssueOpen(false)}
      />

    </div>
  );
};

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

const CancelBookingModal = ({ isOpen, onClose, onConfirm, tokenCost }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Cancel Booking</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100 mb-5">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-800">
                You'll receive {tokenCost} tokens back
              </p>
              <p className="text-xs text-rose-600 mt-0.5">
                Tokens are refunded immediately upon cancellation.
              </p>
            </div>
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Reason <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you cancelling this session?"
            rows={3}
            disabled={loading}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Cancelling…</>
              : 'Cancel & Refund'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;