// src/pages/candidate/components/sections/BookingSummary.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  AlertCircle,
  Loader2,
  TrendingUp,
  Star,
} from 'lucide-react';
import { fetchOverviewStats } from '../../../../features/progress/progressSlice';

const StatCard = ({ label, value, icon: Icon, colorClass, borderClass, textColor, isLoading }) => (
  <div className={`${colorClass} rounded-2xl border ${borderClass} p-3 text-center`}>
    <Icon className={`w-5 h-5 ${textColor} mx-auto mb-1`} />
    {isLoading ? (
      <div className="h-6 w-8 bg-white/60 rounded animate-pulse mx-auto mb-1" />
    ) : (
      <p className={`text-lg font-bold ${textColor}`}>{value ?? '—'}</p>
    )}
    <p className="text-[10px] text-slate-600">{label}</p>
  </div>
);

const BookingSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: overviewData, status } = useSelector((state) => state.progress.overview);
  const isLoading = status === 'loading' || status === 'idle';

  useEffect(() => {
    dispatch(fetchOverviewStats());
  }, [dispatch]);

  const totalSessions = overviewData?.total_sessions ?? overviewData?.total_interviews ?? null;
  const completedSessions = overviewData?.completed_sessions ?? overviewData?.interviews_completed ?? null;
  const avgScore = overviewData?.average_score ?? overviewData?.avg_score ?? null;
  const peerSessions = overviewData?.peer_sessions ?? overviewData?.total_peer_sessions ?? null;
  const aiSessions = overviewData?.ai_sessions ?? overviewData?.total_ai_sessions ?? null;

  const stats = [
    {
      label: 'Total',
      value: totalSessions,
      icon: Calendar,
      colorClass: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderClass: 'border-blue-100',
    },
    {
      label: 'Completed',
      value: completedSessions,
      icon: CheckCircle2,
      colorClass: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderClass: 'border-emerald-100',
    },
    {
      label: 'Avg Score',
      value: avgScore != null ? `${Number(avgScore).toFixed(1)}` : null,
      icon: Star,
      colorClass: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderClass: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Session Breakdown */}
      {!isLoading && (peerSessions != null || aiSessions != null) && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 mb-3">
            Session breakdown
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-indigo-700">{peerSessions ?? '—'}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Peer sessions</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-violet-700">{aiSessions ?? '—'}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">AI sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* Skeleton if loading */}
      {isLoading && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5 animate-pulse">
          <div className="h-3 w-32 bg-indigo-200 rounded mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-2xl p-3 text-center">
              <div className="h-8 w-12 bg-indigo-100 rounded mx-auto mb-1" />
              <div className="h-2 w-16 bg-indigo-100 rounded mx-auto" />
            </div>
            <div className="bg-white/60 rounded-2xl p-3 text-center">
              <div className="h-8 w-12 bg-violet-100 rounded mx-auto mb-1" />
              <div className="h-2 w-16 bg-violet-100 rounded mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && totalSessions === 0 && (
        <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 mb-1">No sessions yet</p>
          <p className="text-xs text-slate-500 mb-3">
            Book your first mock interview to start tracking your progress.
          </p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all"
          >
            Book an interview
          </button>
        </div>
      )}

      {/* View All */}
      <button
        onClick={() => navigate('/bookings')}
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
      >
        View all interviews
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Progress CTA */}
      <button
        onClick={() => navigate('/candidate/progress')}
        className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        View full progress report
      </button>
    </div>
  );
};

export default BookingSummary;
