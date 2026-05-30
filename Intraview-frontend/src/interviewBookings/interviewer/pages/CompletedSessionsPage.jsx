// src/pages/interviewer/CompletedSessionsPage.jsx - ✅ DATE FIXED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewerBookingsApi } from '../../interviewerBookingsApi';
import { toast } from 'sonner';

const CompletedSessionsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ sessions: [], tokens_earned: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchHistorySessions();
  }, []);

  const fetchHistorySessions = async () => {
    try {
      setLoading(true);
      const res = await interviewerBookingsApi.getCompletedSessions();
      setData({
        sessions: res.data.completed_sessions || [],
        tokens_earned: res.data.tokens_earned || 0
      });
    } catch (error) {
      toast.error('Failed to load session history');
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
      CONFIRMED: 'bg-indigo-100 text-indigo-800',
      CANDIDATE_NO_SHOW: 'bg-slate-200 text-slate-800',
      INTERVIEWER_NO_SHOW: 'bg-slate-200 text-slate-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-slate-100 text-slate-800'}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'N/A';
    try {
      const dateTimeString = `${date}T${time}`;
      return new Date(dateTimeString);
    } catch {
      return null;
    }
  };

  const filteredSessions = React.useMemo(() => {
    if (filter === 'ALL') return data.sessions;
    if (filter === 'CANCELLED') return data.sessions.filter(s => s.status?.includes('CANCELLED'));
    if (filter === 'NO_SHOW') return data.sessions.filter(s => s.status?.includes('NO_SHOW'));
    return data.sessions.filter(s => s.status === filter);
  }, [data.sessions, filter]);

  const renderSessions = () => {
    if (filteredSessions.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No sessions found
          </h3>
          <p className="text-slate-600">No sessions match your selected filter.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((booking) => {
          const dateTime = formatDateTime(booking.date, booking.start_time);

          return (
            <div
              key={booking.id}
              className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/interviewer/dashboard/bookings/${booking.id}`)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-indigo-600">
                    {booking.candidate_name || 'Candidate'}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">{booking.candidate_email}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{dateTime ? dateTime.toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{dateTime ? dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
              </div>

              {booking.status === 'COMPLETED' && (
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                    +{booking.token_cost || 0} earned
                  </span>
                </div>
              )}

              {booking.status?.includes('CANCELLED') && booking.cancellation_reason && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <p className="text-sm text-rose-700 whitespace-pre-line truncate">{booking.cancellation_reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
          <p className="text-slate-600 mt-2">
            Total earnings: <span className="font-bold text-emerald-600">+{data.tokens_earned || 0} tokens</span>
          </p>
        </div>

        {/* Filter Dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold bg-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <option value="ALL">All Past Sessions</option>
          <option value="COMPLETED">Completed</option>
          <option value="CONFIRMED">Past Pending</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      <div className="space-y-6 pt-4">
        {renderSessions()}
      </div>
    </div>
  );
};

export default CompletedSessionsPage;
