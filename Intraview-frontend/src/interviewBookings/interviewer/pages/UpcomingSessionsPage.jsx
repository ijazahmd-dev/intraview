

// src/pages/interviewer/UpcomingSessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';
import { INTERVIEW_TYPE_LABELS } from '../../user/components/SessionConfigModal';

const UpcomingSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancel booking modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // NEW: reschedule reject modal state
  const [rescheduleRejectModalOpen, setRescheduleRejectModalOpen] =
    useState(false);
  const [rescheduleRejectBookingId, setRescheduleRejectBookingId] =
    useState(null);
  const [rescheduleRejectReason, setRescheduleRejectReason] = useState('');
  const [rescheduleActionLoadingId, setRescheduleActionLoadingId] =
    useState(null); // booking id currently being accepted/rejected

  const isRescheduleActionLoading =
    rescheduleActionLoadingId === rescheduleRejectBookingId;

  useEffect(() => {
    fetchUpcomingSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      const res = await interviewerBookingsApi.getUpcomingSessions();
      console.log('Upcoming Sessions API Response:', res.data);
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
      await interviewerBookingsApi.cancelBooking(
        selectedBookingId,
        cancelReason,
      );
      toast.success('Booking cancelled successfully');
      closeCancelModal();
      fetchUpcomingSessions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  // NEW: reschedule accept / reject helpers

  const openRescheduleRejectModal = (bookingId) => {
    setRescheduleRejectBookingId(bookingId);
    setRescheduleRejectReason('');
    setRescheduleRejectModalOpen(true);
  };

  const closeRescheduleRejectModal = () => {
    setRescheduleRejectModalOpen(false);
    setRescheduleRejectBookingId(null);
    setRescheduleRejectReason('');
  };

  const handleAcceptReschedule = async (bookingId, e) => {
    e.stopPropagation();
    try {
      setRescheduleActionLoadingId(bookingId);
      await interviewerBookingsApi.acceptReschedule(bookingId);
      toast.success('Reschedule accepted. Booking updated.');
      fetchUpcomingSessions();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Failed to accept reschedule request',
      );
    } finally {
      setRescheduleActionLoadingId(null);
    }
  };

  const handleRejectRescheduleConfirm = async () => {
    if (!rescheduleRejectReason.trim()) {
      toast.error('Please provide a reason for rejecting the request');
      return;
    }

    try {
      setRescheduleActionLoadingId(rescheduleRejectBookingId);
      await interviewerBookingsApi.rejectReschedule(
        rescheduleRejectBookingId,
        rescheduleRejectReason,
      );
      toast.success('Reschedule request rejected');
      closeRescheduleRejectModal();
      fetchUpcomingSessions();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Failed to reject reschedule request',
      );
    } finally {
      setRescheduleActionLoadingId(null);
    }
  };

  // ✅ Combine date + start_time (SAME AS CompletedSessionsPage)
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
    const minutes = Math.floor(
      (diffMs % (1000 * 60 * 60)) / (1000 * 60),
    );

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
            <h1 className="text-3xl font-bold tracking-tight">
              Upcoming Sessions
            </h1>
            <p className="text-slate-600 mt-2">
              {sessions.length} confirmed session
              {sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No upcoming sessions
            </h3>
            <p className="text-slate-600 mb-6">
              All your confirmed sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((booking) => {
              const dateTime = formatDateTime(booking.date, booking.start_time);
              const endTime = formatDateTime(booking.date, booking.end_time);

              const hasPendingReschedule =
                booking.reschedule_status === 'PENDING';

              const proposedSlot = booking.proposed_slot || null;

              const isRescheduleActionLoading =
                rescheduleActionLoadingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
                  onClick={() =>
                    navigate(`/interviewer/dashboard/bookings/${booking.id}`)
                  }
                >
                  {/* Top: Candidate + Status */}
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                        {INTERVIEW_TYPE_LABELS[booking.interview_type] || booking.interview_type || 'Interview Session'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        CONFIRMED
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-indigo-600">
                        {booking.candidate_name ||
                          booking.candidate_email ||
                          'Candidate'}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">
                        {booking.candidate_email || 'Email not available'}
                      </p>
                    </div>
                  </div>

                  {/* NEW: Reschedule request banner */}
                  {hasPendingReschedule && (
                    <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
                        Reschedule request pending
                      </p>
                      {proposedSlot && (
                        <p className="text-sm text-amber-900">
                          Proposed slot:{' '}
                          <span className="font-medium">
                            {proposedSlot.date}{' '}
                            {proposedSlot.start_time}–{proposedSlot.end_time}{' '}
                            ({proposedSlot.timezone})
                          </span>
                        </p>
                      )}
                      {booking.reschedule_note && (
                        <p className="text-sm text-amber-900 mt-1">
                          Candidate note:{' '}
                          <span className="italic">
                            {booking.reschedule_note}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {dateTime
                          ? dateTime.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {dateTime && endTime
                          ? `${dateTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - ${endTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Countdown + Tokens */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                      {formatTimeUntil(dateTime)}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-600">
                        {console.log('🔥 booking.token_cost:', booking.token_cost)}
                        +{booking.token_cost || 25} tokens
                      </div>
                      <p className="text-xs text-slate-500">You'll earn</p>
                    </div>
                  </div>

                  {/* NEW: Reschedule action buttons (when pending) */}
                  {hasPendingReschedule && (
                    <div className="flex gap-3 pb-4 mb-4 border-b border-slate-200">
                      <button
                        onClick={(e) =>
                          handleAcceptReschedule(booking.id, e)
                        }
                        disabled={isRescheduleActionLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-2xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRescheduleActionLoading
                          ? 'Updating...'
                          : 'Accept change'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRescheduleRejectModal(booking.id);
                        }}
                        disabled={isRescheduleActionLoading}
                        className="flex-1 bg-white border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50 text-amber-800 font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject request
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/interview/room/${booking.id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Join Now
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/interviewer/dashboard/bookings/${booking.id}`,
                        );
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

      {/* NEW: Reschedule reject modal */}
      {rescheduleRejectModalOpen && rescheduleRejectBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
            <div className="p-8 pb-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Reject reschedule request
                </h2>
                <button
                  onClick={closeRescheduleRejectModal}
                  className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 disabled:opacity-50"
                  disabled={isRescheduleActionLoading}
                >
                  <svg
                    className="w-6 h-6 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 mb-6">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-800">
                    Keep the original time
                  </h3>
                  <p className="text-sm text-amber-700">
                    The candidate will be informed that their reschedule request
                    was declined.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Reason for rejecting <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rescheduleRejectReason}
                  onChange={(e) =>
                    setRescheduleRejectReason(e.target.value)
                  }
                  placeholder="e.g., I'm not available at that time, please keep the original slot."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-500 resize-vertical disabled:opacity-50"
                  disabled={isRescheduleActionLoading}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={closeRescheduleRejectModal}
                  disabled={isRescheduleActionLoading}
                  className="flex-1 py-3 px-6 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                >
                  Keep request pending
                </button>
                <button
                  onClick={handleRejectRescheduleConfirm}
                  disabled={
                    !rescheduleRejectReason.trim() ||
                    isRescheduleActionLoading
                  }
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRescheduleActionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Rejecting...
                    </>
                  ) : (
                    'Reject request'
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
