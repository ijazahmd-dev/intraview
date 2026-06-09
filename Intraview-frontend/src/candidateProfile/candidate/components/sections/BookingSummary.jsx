// // src/pages/candidate/components/sections/BookingSummary.jsx
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Calendar,
//   Clock,
//   CheckCircle2,
//   X,
//   ArrowRight,
//   AlertCircle,
//   Loader2,
//   TrendingUp,
//   Star,
// } from 'lucide-react';
// import { fetchOverviewStats } from '../../../../features/progress/progressSlice';

// const StatCard = ({ label, value, icon: Icon, colorClass, borderClass, textColor, isLoading }) => (
//   <div className={`${colorClass} rounded-2xl border ${borderClass} p-3 text-center`}>
//     <Icon className={`w-5 h-5 ${textColor} mx-auto mb-1`} />
//     {isLoading ? (
//       <div className="h-6 w-8 bg-white/60 rounded animate-pulse mx-auto mb-1" />
//     ) : (
//       <p className={`text-lg font-bold ${textColor}`}>{value ?? '—'}</p>
//     )}
//     <p className="text-[10px] text-slate-600">{label}</p>
//   </div>
// );

// const BookingSummary = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { data: overviewData, status } = useSelector((state) => state.progress.overview);
//   const isLoading = status === 'loading' || status === 'idle';

//   useEffect(() => {
//     dispatch(fetchOverviewStats());
//   }, [dispatch]);

//   const totalSessions = overviewData?.total_sessions ?? overviewData?.total_interviews ?? null;
//   const completedSessions = overviewData?.completed_sessions ?? overviewData?.interviews_completed ?? null;
//   const avgScore = overviewData?.average_score ?? overviewData?.avg_score ?? null;
//   const peerSessions = overviewData?.peer_sessions ?? overviewData?.total_peer_sessions ?? null;
//   const aiSessions = overviewData?.ai_sessions ?? overviewData?.total_ai_sessions ?? null;

//   const stats = [
//     {
//       label: 'Total',
//       value: totalSessions,
//       icon: Calendar,
//       colorClass: 'bg-blue-50',
//       textColor: 'text-blue-600',
//       borderClass: 'border-blue-100',
//     },
//     {
//       label: 'Completed',
//       value: completedSessions,
//       icon: CheckCircle2,
//       colorClass: 'bg-emerald-50',
//       textColor: 'text-emerald-600',
//       borderClass: 'border-emerald-100',
//     },
//     {
//       label: 'Avg Score',
//       value: avgScore != null ? `${Number(avgScore).toFixed(1)}` : null,
//       icon: Star,
//       colorClass: 'bg-amber-50',
//       textColor: 'text-amber-600',
//       borderClass: 'border-amber-100',
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-3 gap-3">
//         {stats.map((stat) => (
//           <StatCard key={stat.label} {...stat} isLoading={isLoading} />
//         ))}
//       </div>

//       {/* Session Breakdown */}
//       {!isLoading && (peerSessions != null || aiSessions != null) && (
//         <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5">
//           <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 mb-3">
//             Session breakdown
//           </p>
//           <div className="grid grid-cols-2 gap-3">
//             <div className="bg-white/60 rounded-2xl p-3 text-center">
//               <p className="text-2xl font-black text-indigo-700">{peerSessions ?? '—'}</p>
//               <p className="text-[10px] text-slate-600 mt-0.5">Peer sessions</p>
//             </div>
//             <div className="bg-white/60 rounded-2xl p-3 text-center">
//               <p className="text-2xl font-black text-violet-700">{aiSessions ?? '—'}</p>
//               <p className="text-[10px] text-slate-600 mt-0.5">AI sessions</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Skeleton if loading */}
//       {isLoading && (
//         <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5 animate-pulse">
//           <div className="h-3 w-32 bg-indigo-200 rounded mb-3" />
//           <div className="grid grid-cols-2 gap-3">
//             <div className="bg-white/60 rounded-2xl p-3 text-center">
//               <div className="h-8 w-12 bg-indigo-100 rounded mx-auto mb-1" />
//               <div className="h-2 w-16 bg-indigo-100 rounded mx-auto" />
//             </div>
//             <div className="bg-white/60 rounded-2xl p-3 text-center">
//               <div className="h-8 w-12 bg-violet-100 rounded mx-auto mb-1" />
//               <div className="h-2 w-16 bg-violet-100 rounded mx-auto" />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Empty state */}
//       {!isLoading && totalSessions === 0 && (
//         <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 text-center shadow-sm">
//           <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
//           <p className="text-sm font-semibold text-slate-700 mb-1">No sessions yet</p>
//           <p className="text-xs text-slate-500 mb-3">
//             Book your first mock interview to start tracking your progress.
//           </p>
//           <button
//             onClick={() => navigate('/bookings')}
//             className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all"
//           >
//             Book an interview
//           </button>
//         </div>
//       )}

//       {/* View All */}
//       <button
//         onClick={() => navigate('/bookings')}
//         className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
//       >
//         View all interviews
//         <ArrowRight className="w-4 h-4" />
//       </button>

//       {/* Progress CTA */}
//       <button
//         onClick={() => navigate('/candidate/progress')}
//         className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
//       >
//         <TrendingUp className="w-4 h-4" />
//         View full progress report
//       </button>
//     </div>
//   );
// };

// export default BookingSummary;






















// src/pages/candidate/components/sections/BookingSummary.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar, CheckCircle2, Star, TrendingUp, ArrowRight, AlertCircle,
} from 'lucide-react';
import { fetchOverviewStats } from '../../../../features/progress/progressSlice';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  yellow: '#F5C518',
  yellowLight: '#FEFAE8',
  yellowBorder: '#EDD87A',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  grayMid: '#E8E8E8',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
};

// ─── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, bg, iconColor, isLoading }) => (
  <div style={{
    background: bg, borderRadius: '14px', border: `1px solid ${C.grayBorder}`,
    padding: '14px 10px', textAlign: 'center',
  }}>
    <Icon size={18} style={{ color: iconColor, margin: '0 auto 6px', display: 'block' }} />
    {isLoading ? (
      <div style={{ height: '22px', width: '32px', background: C.grayMid, borderRadius: '6px', margin: '0 auto 4px', animation: 'bs-pulse 1.4s ease-in-out infinite' }} />
    ) : (
      <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 800, color: C.dark }}>{value ?? '—'}</p>
    )}
    <p style={{ margin: 0, fontSize: '10px', color: C.textMuted, fontWeight: 500 }}>{label}</p>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────
const BookingSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: overviewData, status } = useSelector((state) => state.progress.overview);
  const isLoading = status === 'loading' || status === 'idle';

  useEffect(() => { dispatch(fetchOverviewStats()); }, [dispatch]);

  const totalSessions = overviewData?.total_sessions_attended ?? null;
  const completedSessions = overviewData?.total_sessions_attended ?? null;
  const avgScore = overviewData?.average_overall_score ?? null;
  const peerSessions = overviewData?.peer_sessions_count ?? null;
  const aiSessions = overviewData?.ai_sessions_count ?? null;

  const stats = [
    { label: 'Total', value: totalSessions, icon: Calendar, bg: C.tealLight, iconColor: C.teal },
    { label: 'Completed', value: completedSessions, icon: CheckCircle2, bg: '#F0FDF4', iconColor: '#22C55E' },
    { label: 'Avg Score', value: avgScore != null ? Number(avgScore).toFixed(1) : null, icon: Star, bg: C.yellowLight, iconColor: '#D97706' },
  ];

  return (
    <div style={{
      background: C.white, borderRadius: '20px', border: `1px solid ${C.grayBorder}`,
      padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <style>{`
        @keyframes bs-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes bs-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.teal }} />
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.dark }}>Interview Stats</h3>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {stats.map((s) => <StatCard key={s.label} {...s} isLoading={isLoading} />)}
      </div>

      {/* Session breakdown */}
      {isLoading ? (
        <div style={{
          background: C.gray, borderRadius: '16px', padding: '16px',
          animation: 'bs-pulse 1.4s ease-in-out infinite',
        }}>
          <div style={{ height: '10px', width: '100px', background: C.grayMid, borderRadius: '5px', marginBottom: '12px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[0, 1].map(i => (
              <div key={i} style={{ background: C.white, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ height: '26px', width: '36px', background: C.grayMid, borderRadius: '6px', margin: '0 auto 6px' }} />
                <div style={{ height: '8px', width: '60px', background: C.grayMid, borderRadius: '4px', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (peerSessions != null || aiSessions != null) ? (
        <div style={{
          background: `linear-gradient(135deg, ${C.tealLight} 0%, ${C.yellowLight} 100%)`,
          borderRadius: '16px', border: `1px solid ${C.tealBorder}`, padding: '16px',
        }}>
          <p style={{ margin: '0 0 10px', fontSize: '10px', fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            Session breakdown
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: 800, color: C.dark }}>{peerSessions ?? '—'}</p>
              <p style={{ margin: 0, fontSize: '10px', color: C.textMuted }}>Peer sessions</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: 800, color: C.dark }}>{aiSessions ?? '—'}</p>
              <p style={{ margin: 0, fontSize: '10px', color: C.textMuted }}>AI sessions</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Empty state */}
      {!isLoading && totalSessions === 0 && (
        <div style={{
          background: C.gray, borderRadius: '16px', padding: '24px',
          textAlign: 'center', border: `1px dashed ${C.grayBorder}`,
        }}>
          <AlertCircle size={28} style={{ color: C.grayBorder, margin: '0 auto 8px', display: 'block' }} />
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: C.dark }}>No sessions yet</p>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: C.textMuted }}>
            Book your first mock interview to start tracking progress.
          </p>
          <button
            onClick={() => navigate('/candidate/interviewers')}
            style={{
              padding: '8px 18px', borderRadius: '10px', border: 'none',
              background: C.teal, color: C.white, fontWeight: 700, fontSize: '12px',
              cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Book an interview
          </button>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: C.grayBorder }} />

      {/* CTAs */}
      <button
        onClick={() => navigate('/candidate/dashboard/upcoming')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '11px', borderRadius: '12px', border: `1.5px solid ${C.grayBorder}`,
          background: C.white, color: C.dark, fontWeight: 600, fontSize: '13px',
          cursor: 'pointer', transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.grayBorder; e.currentTarget.style.color = C.dark; }}
      >
        View all interviews <ArrowRight size={14} />
      </button>

      <button
        onClick={() => navigate('/candidate/progress')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '11px', borderRadius: '12px', border: `1.5px solid ${C.tealBorder}`,
          background: C.tealLight, color: C.teal, fontWeight: 700, fontSize: '13px',
          cursor: 'pointer', transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#C9F0EC'}
        onMouseLeave={e => e.currentTarget.style.background = C.tealLight}
      >
        <TrendingUp size={14} /> View full progress report
      </button>
    </div>
  );
};

export default BookingSummary;