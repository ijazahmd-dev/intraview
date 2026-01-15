// src/pages/interviewer/CompletedSessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';
import { toast } from 'sonner';

const CompletedSessionsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ completed_sessions: [], cancelled_sessions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      setLoading(true);
      const res = await interviewerBookingsApi.getCompletedSessions();
      // Separate completed vs cancelled for tabs
      const cancelled = res.data.completed_sessions?.filter(session => 
        session.status?.includes('CANCELLED')
      ) || [];
      const completed = res.data.completed_sessions?.filter(session => 
        !session.status?.includes('CANCELLED')
      ) || [];
      
      setData({
        completed_sessions: completed,
        cancelled_sessions: cancelled,
        tokens_earned: res.data.tokens_earned || 0
      });
    } catch (error) {
      toast.error('Failed to load completed sessions');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-rose-100 text-rose-800',
      CANCELLED_BY_CANDIDATE: 'bg-amber-100 text-amber-800',
      CANCELLED_BY_INTERVIEWER: 'bg-rose-100 text-rose-800',
    };
    
    return (
      <Badge className={`px-3 py-1 ${config[status] || 'bg-slate-100 text-slate-800'}`}>
        {status?.replace('_', ' ')}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
          <p className="text-slate-600 mt-2">
            Total earnings: <span className="font-bold text-emerald-600">+{data.tokens_earned || 0} tokens</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-2xl p-1 mb-8">
          <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
            Completed ({data.completed_sessions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
            Cancelled ({data.cancelled_sessions?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="space-y-6">
          {data.completed_sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No completed sessions</h3>
              <p className="text-slate-600">Completed sessions will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.completed_sessions.map((booking) => (
                <div
                  key={booking.id}
                  className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/interviewer/dashboard/bookings/${booking.id}`)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 truncate">{booking.candidate_name || 'Candidate'}</h3>
                      <p className="text-sm text-slate-600 truncate">{booking.candidate_email}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(booking.start_datetime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-100 text-emerald-800">+{booking.token_cost} earned</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-6">
          {data.cancelled_sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636 9 9 0 0018.364 18.364zm0 0A9 9 0 005.636 5.636 9 9 0 0018.364 18.364z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No cancelled sessions</h3>
              <p className="text-slate-600">Cancelled sessions will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.cancelled_sessions.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/interviewer/dashboard/bookings/${booking.id}`)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 truncate">{booking.candidate_name || 'Candidate'}</h3>
                      <p className="text-sm text-slate-600 truncate">{booking.candidate_email}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(booking.start_datetime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {booking.cancellation_reason && (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                      <p className="text-sm text-rose-700">{booking.cancellation_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompletedSessionsPage;
