// src/pages/interviewer/InterviewerBookingDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';

const InterviewerBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
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
      setCancelDialogOpen(false);
    }
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
          <Button onClick={() => navigate('/interviewer/dashboard/upcoming')} className="px-8 py-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const config = {
      CONFIRMED: { variant: 'default', className: 'bg-emerald-100 text-emerald-800' },
      COMPLETED: { variant: 'secondary', className: 'bg-slate-100 text-slate-800' },
      CANCELLED: { variant: 'destructive', className: 'bg-rose-100 text-rose-800' },
      CANCELLED_BY_CANDIDATE: { variant: 'destructive', className: 'bg-rose-100 text-rose-800' },
      CANCELLED_BY_INTERVIEWER: { variant: 'destructive', className: 'bg-rose-100 text-rose-800' },
    };
    const style = config[status] || config.CANCELLED;
    
    return (
      <Badge className={`px-4 py-2 ${style.className}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/interviewer/dashboard/upcoming')}
          className="mb-8 inline-flex items-center gap-2 text-lg font-semibold text-slate-700 hover:text-slate-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Upcoming
        </Button>

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
                      <>
                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl h-16 text-lg">
                              Cancel Session
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md p-0 rounded-3xl">
                            <DialogHeader className="p-8 pb-6 border-b">
                              <DialogTitle className="text-2xl font-bold">Cancel Confirmed Session</DialogTitle>
                            </DialogHeader>
                            <div className="p-8 space-y-6">
                              <div className="p-6 bg-rose-50 rounded-3xl border border-rose-200">
                                <p className="text-rose-800 font-semibold">
                                  ⚠️ Candidate will be fully refunded ({booking.token_cost} tokens)
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                  Reason <span className="text-rose-500">*</span>
                                </label>
                                <Textarea
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder="Explain why you're cancelling..."
                                  className="min-h-[100px]"
                                  disabled={cancelLoading}
                                />
                              </div>
                            </div>
                            <div className="p-8 pt-0 border-t bg-slate-50 rounded-b-3xl flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setCancelDialogOpen(false)}
                                className="flex-1 h-14"
                                disabled={cancelLoading}
                              >
                                Keep Booking
                              </Button>
                              <Button
                                onClick={handleCancelConfirm}
                                disabled={!cancelReason.trim() || cancelLoading}
                                className="flex-1 h-14 bg-gradient-to-r from-rose-600 to-rose-700"
                              >
                                {cancelLoading ? 'Cancelling...' : 'Cancel & Refund'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
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
  );
};

export default InterviewerBookingDetailPage;
