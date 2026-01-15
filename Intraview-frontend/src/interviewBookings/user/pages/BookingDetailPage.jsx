import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { candidateBookingsApi } from '../../candidateBookingsApi';

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch booking details
  useEffect(() => {
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

    fetchBooking();
  }, [bookingId, navigate]);

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      await candidateBookingsApi.cancelBooking(bookingId, {cancellation_reason:cancelReason});
      toast.success('Booking cancelled successfully. Tokens unlocked.');
      navigate('/candidate/dashboard/upcoming');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
      setCancelModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Loading booking details…</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Booking Not Found</h1>
          <button
            onClick={() => navigate('/candidate/dashboard/upcoming')}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canCancel = booking.status === 'CONFIRMED' && 
                   new Date(booking.start_datetime) > new Date();

  const StatusBadge = ({ status }) => {
    const config = {
      CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
      COMPLETED: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completed' },
      CANCELLED: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    };
    const style = config[status] || config.CANCELLED;
    
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/candidate/dashboard/upcoming')}
            className="inline-flex items-center gap-2 text-lg font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Main Booking Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Booking #{booking.id}</h1>
                <StatusBadge status={booking.status} />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600 mb-1">-{booking.token_cost} tokens</div>
                <p className="text-sm text-slate-600">Locked until completion</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-12">
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
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Date & Time</h3>
                      <p className="text-2xl font-bold text-slate-900">
                        {new Date(booking.start_datetime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xl text-slate-700 mt-1">
                        {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                  </div>

                  {/* Interviewer */}
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 4 0 00-7 4v3h14v-3a7 4 0 00-7-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Interviewer</h3>
                      <p className="text-2xl font-bold text-slate-900">{booking.interviewer_name}</p>
                      {booking.interviewer_headline && (
                        <p className="text-slate-600 mt-1">{booking.interviewer_headline}</p>
                      )}
                    </div>
                  </div>

                  {/* Interview Type */}
                  {booking.type && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        Interview Type
                      </h3>
                      <p className="text-xl font-semibold text-slate-900 bg-indigo-100 px-4 py-2 rounded-2xl inline-block">
                        {booking.type}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Actions & Status */}
              <div className="lg:sticky lg:top-12 lg:self-start">
                <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Session Status</h3>
                  
                  {/* Status Timeline */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-slate-900">Booked</p>
                        <p className="text-sm text-slate-600">{new Date(booking.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className={`flex items-center ${booking.status === 'CONFIRMED' ? 'opacity-100' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 border-2 border-slate-300 rounded-full flex items-center justify-center ${booking.status === 'CONFIRMED' ? 'bg-emerald-500 border-emerald-500' : ''}`}>
                        {booking.status === 'CONFIRMED' ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-slate-900">Confirmed</p>
                        <p className="text-sm text-slate-600">Tokens locked</p>
                      </div>
                    </div>

                    {booking.status === 'COMPLETED' && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-slate-900">Completed</p>
                          <p className="text-sm text-slate-600">Tokens transferred</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {canCancel && (
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cancel Booking
                      </button>
                    )}
                    
                    {booking.status === 'COMPLETED' && (
                      <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                        View Recording
                      </button>
                    )}

                    <button className="w-full border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all duration-200">
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {booking.status === 'CANCELLED' && booking.cancellation_reason && (
                <div className="p-6 bg-rose-50 rounded-3xl border-2 border-rose-200 mt-8">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Cancellation Reason
                    </h3>
                    <p className="text-slate-700">{booking.cancellation_reason}</p>
                </div>
                )}

            {/* Additional Info */}
            {booking.notes && (
              <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Session Notes</h3>
                <p className="text-lg text-slate-700 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {canCancel && (
        <CancelBookingModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelBooking}
          loading={cancelLoading}
          tokenCost={booking.token_cost}
          reason={cancelReason}           // ✅ ADD THIS
          onReasonChange={setCancelReason}
        />
      )}
    </div>
  );
};

// Cancel Modal Component
const CancelBookingModal = ({ isOpen, onClose, onConfirm, loading, tokenCost, reason, onReasonChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/50">
        {/* Header - SAME */}
        <div className="p-8 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Cancel Booking</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200" disabled={loading}>
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
              <h3 className="font-bold text-xl text-rose-800">Confirm Cancellation</h3>
              <p className="text-sm text-rose-700">You'll get all {tokenCost} tokens refunded</p>
            </div>
          </div>
        </div>

        {/* Reason Form - FIXED */}
        <div className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}                    // ✅ Uses parent cancelReason
              onChange={(e) => onReasonChange(e.target.value)}  // ✅ Updates parent cancelReason
              placeholder="Please explain why you're cancelling..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-rose-200 focus:border-rose-500 resize-vertical"
              disabled={loading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 pt-0 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 px-6 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
            >
              Keep Booking
            </button>
            <button
              onClick={onConfirm}
              disabled={!reason.trim() || loading}  // ✅ Uses parent reason
              className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
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
  );
};


export default BookingDetailPage;
