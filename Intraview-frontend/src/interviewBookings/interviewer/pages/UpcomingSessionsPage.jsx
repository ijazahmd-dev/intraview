// src/pages/interviewer/UpcomingSessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';
import { Badge } from '@/components/ui/badge';

const UpcomingSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchUpcomingSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      setLoading(true);
      const res = await interviewerBookingsApi.getUpcomingSessions();
      setSessions(res.data);
    } catch (error) {
      toast.error('Failed to load upcoming sessions');
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
      await interviewerBookingsApi.cancelBooking(cancelDialog.bookingId, cancelReason);
      toast.success('Booking cancelled successfully');
      setCancelDialog({ open: false, bookingId: null });
      setCancelReason('');
      fetchUpcomingSessions(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatTimeUntil = (startDatetime) => {
    const now = new Date();
    const start = new Date(startDatetime);
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
          {sessions.map((booking) => (
            <div
              key={booking.id}
              className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-300 cursor-pointer"
              onClick={() => navigate(`/interviewer/dashboard/bookings/${booking.id}`)}
            >
              {/* Top: Candidate + Status */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-indigo-600">
                    {booking.candidate_name || booking.candidate_email || 'Candidate'}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">
                    {booking.candidate_email || 'Email not available'}
                  </p>
                </div>
                <Badge className="ml-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                  CONFIRMED
                </Badge>
              </div>

              {/* Date & Time */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(booking.start_datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Countdown + Tokens */}
              <div className="flex items-center justify-between mb-8">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {formatTimeUntil(booking.start_datetime)}
                </Badge>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">+{booking.token_cost} tokens</div>
                  <p className="text-xs text-slate-500">You'll earn</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Dialog open={cancelDialog.open && cancelDialog.bookingId === booking.id} onOpenChange={() => setCancelDialog({ open: false, bookingId: null })}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Cancel Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md sm:max-w-lg p-0 rounded-3xl">
                    <DialogHeader className="p-8 pb-6 border-b">
                      <DialogTitle className="text-2xl font-bold text-slate-900">Cancel Session</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 space-y-6">
                      <div className="flex items-start gap-4 p-6 bg-rose-50 rounded-3xl border border-rose-200">
                        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-rose-800">Candidate will lose this slot</h3>
                          <p className="text-sm text-rose-700 mt-1">
                            All {booking.token_cost} tokens will be refunded to candidate automatically.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Cancellation Reason <span className="text-rose-500">*</span>
                        </label>
                        <Textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="e.g., I'm unavailable, personal emergency, found a better candidate, etc."
                          className="min-h-[120px] resize-none"
                          disabled={cancelLoading}
                        />
                      </div>
                    </div>
                    <div className="p-8 pt-0 border-t bg-slate-50/50 rounded-b-3xl flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCancelDialog({ open: false, bookingId: null })}
                        disabled={cancelLoading}
                        className="flex-1 h-14 rounded-2xl"
                      >
                        Keep Booking
                      </Button>
                      <Button
                        onClick={handleCancelConfirm}
                        disabled={!cancelReason.trim() || cancelLoading}
                        className="flex-1 h-14 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {cancelLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Cancelling...
                          </>
                        ) : (
                          'Cancel & Refund Tokens'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsPage;
