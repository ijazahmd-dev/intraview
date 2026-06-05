// // src/pages/candidate/components/sections/FeedbackSection.jsx
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Star,
//   TrendingUp,
//   ThumbsUp,
//   AlertCircle,
//   ChevronDown,
//   Target,
//   MessageSquare,
//   Lightbulb,
//   Loader2,
//   RefreshCw,
// } from 'lucide-react';
// import { fetchCandidateEvaluations } from '../../../../features/feedback/candidate/candidateFeedbackSlice';

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const RECOMMENDATION_COLORS = {
//   EXCELLENT: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600' },
//   GOOD_FIT: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600' },
//   NEEDS_IMPROVEMENT: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600' },
//   NOT_FIT: { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-600' },
// };

// const RECOMMENDATION_LABELS = {
//   EXCELLENT: 'Excellent',
//   GOOD_FIT: 'Good',
//   NEEDS_IMPROVEMENT: 'Improve',
//   NOT_FIT: 'Not Fit',
// };

// const StarRating = ({ rating }) => {
//   if (rating == null) return null;
//   const full = Math.floor(rating);
//   const hasHalf = rating % 1 !== 0;
//   return (
//     <div className="flex items-center gap-0.5">
//       {[...Array(5)].map((_, i) => {
//         const filled = i < full || (i === full && hasHalf);
//         return (
//           <div key={i} className="relative">
//             <Star className="w-4 h-4 text-slate-200" fill="currentColor" />
//             {filled && (
//               <div
//                 className="absolute top-0 left-0 overflow-hidden"
//                 style={{ width: i === full && hasHalf ? '50%' : '100%' }}
//               >
//                 <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
//               </div>
//             )}
//           </div>
//         );
//       })}
//       <span className="text-xs font-bold text-slate-900 ml-1">{Number(rating).toFixed(1)}</span>
//     </div>
//   );
// };

// // ─── Card ─────────────────────────────────────────────────────────────────────

// const FeedbackCard = ({ evaluation }) => {
//   const [expanded, setExpanded] = useState(false);

//   // Normalise field names — backend may use snake_case variants
//   const rating = evaluation.overall_score ?? evaluation.overall_rating;
//   const recommendation = evaluation.recommendation;
//   const interviewType = evaluation.interview_type ?? evaluation.booking?.interview_type ?? 'Interview';
//   const interviewer = evaluation.interviewer_name ?? evaluation.booking?.interviewer_name ?? 'Interviewer';
//   const dateStr = evaluation.created_at ?? evaluation.date;
//   const feedbackText = evaluation.general_feedback ?? evaluation.feedback ?? evaluation.comments;
//   const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
//   const improvements = Array.isArray(evaluation.areas_for_improvement ?? evaluation.weaknesses)
//     ? (evaluation.areas_for_improvement ?? evaluation.weaknesses)
//     : [];
//   const categories = Array.isArray(evaluation.categories) ? evaluation.categories : [];

//   const colors = RECOMMENDATION_COLORS[recommendation] ?? RECOMMENDATION_COLORS.GOOD_FIT;
//   const label = RECOMMENDATION_LABELS[recommendation] ?? recommendation ?? '';

//   return (
//     <div className={`rounded-3xl border-2 ${colors.border} ${colors.bg} p-4 sm:p-5 transition-all`}>
//       {/* Header */}
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <h4 className="text-sm font-bold text-slate-900">{interviewType} Interview</h4>
//             {label && (
//               <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${colors.badge}`}>
//                 {label}
//               </span>
//             )}
//           </div>
//           <p className="text-xs text-slate-600">
//             with <span className="font-semibold">{interviewer}</span>
//             {dateStr && (
//               <> &bull; {new Date(dateStr).toLocaleDateString('en-IN')}</>
//             )}
//           </p>
//         </div>
//         {rating != null && <StarRating rating={rating} />}
//       </div>

//       {/* Category Bars */}
//       {categories.length > 0 && (
//         <div className="mb-3 p-3 bg-white/50 rounded-2xl">
//           <p className="text-xs font-semibold text-slate-900 mb-2">Category breakdown</p>
//           <div className="space-y-2">
//             {categories.map((cat) => (
//               <div key={cat.name ?? cat.category}>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-xs font-medium text-slate-700">{cat.name ?? cat.category}</span>
//                   <span className="text-xs font-bold text-slate-900">{cat.rating ?? cat.score}/5</span>
//                 </div>
//                 <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
//                     style={{ width: `${((cat.rating ?? cat.score ?? 0) / 5) * 100}%` }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Feedback preview */}
//       {feedbackText && (
//         <div className="p-3 bg-white/50 rounded-2xl mb-3">
//           <p className="text-xs font-semibold text-slate-900 mb-1">Feedback</p>
//           <p className="text-xs text-slate-700 line-clamp-2">{feedbackText}</p>
//         </div>
//       )}

//       {/* Expand */}
//       {(strengths.length > 0 || improvements.length > 0) && (
//         <>
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-white/40 hover:bg-white/60 transition-all text-xs font-semibold text-slate-900"
//           >
//             View details
//             <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
//           </button>

//           {expanded && (
//             <div className="mt-3 space-y-3 pt-3 border-t-2 border-white/50">
//               {strengths.length > 0 && (
//                 <div>
//                   <div className="flex items-center gap-2 mb-2">
//                     <ThumbsUp className="w-4 h-4 text-emerald-600" />
//                     <p className="text-xs font-bold text-slate-900">Strengths</p>
//                   </div>
//                   <ul className="space-y-1">
//                     {strengths.map((s, i) => (
//                       <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
//                         <span className="text-emerald-600 font-bold mt-0.5">✓</span>
//                         <span>{s}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               {improvements.length > 0 && (
//                 <div>
//                   <div className="flex items-center gap-2 mb-2">
//                     <AlertCircle className="w-4 h-4 text-amber-600" />
//                     <p className="text-xs font-bold text-slate-900">Areas for improvement</p>
//                   </div>
//                   <ul className="space-y-1">
//                     {improvements.map((w, i) => (
//                       <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
//                         <span className="text-amber-600 font-bold mt-0.5">→</span>
//                         <span>{w}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               {feedbackText && (
//                 <div>
//                   <div className="flex items-center gap-2 mb-2">
//                     <MessageSquare className="w-4 h-4 text-blue-600" />
//                     <p className="text-xs font-bold text-slate-900">Detailed feedback</p>
//                   </div>
//                   <p className="text-xs text-slate-700 p-2 bg-white/50 rounded-xl">{feedbackText}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// // ─── Skeleton ─────────────────────────────────────────────────────────────────

// const FeedbackSkeleton = () => (
//   <div className="space-y-4 animate-pulse">
//     {[1, 2].map((i) => (
//       <div key={i} className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-5">
//         <div className="flex justify-between mb-3">
//           <div className="space-y-2">
//             <div className="h-4 w-36 bg-slate-200 rounded" />
//             <div className="h-3 w-24 bg-slate-100 rounded" />
//           </div>
//           <div className="h-4 w-20 bg-slate-200 rounded" />
//         </div>
//         <div className="h-16 bg-slate-100 rounded-2xl mb-3" />
//         <div className="h-8 bg-slate-100 rounded-2xl" />
//       </div>
//     ))}
//   </div>
// );

// // ─── Main ─────────────────────────────────────────────────────────────────────

// const FeedbackSection = () => {
//   const dispatch = useDispatch();
//   const [sortBy, setSortBy] = useState('recent');
//   const [filterType, setFilterType] = useState('all');

//   const {
//     evaluations,
//     evaluationsLoading,
//     evaluationsError,
//   } = useSelector((state) => state.candidateFeedback);

//   useEffect(() => {
//     dispatch(fetchCandidateEvaluations());
//   }, [dispatch]);

//   const handleRetry = () => dispatch(fetchCandidateEvaluations());

//   // Filter & sort
//   const filtered = evaluations.filter((e) => {
//     if (filterType === 'all') return true;
//     const type = e.interview_type ?? e.booking?.interview_type ?? '';
//     return type.toLowerCase().includes(filterType.toLowerCase());
//   });

//   const sorted = [...filtered].sort((a, b) => {
//     const dateA = new Date(a.created_at ?? a.date ?? 0);
//     const dateB = new Date(b.created_at ?? b.date ?? 0);
//     const rA = a.overall_score ?? a.overall_rating ?? 0;
//     const rB = b.overall_score ?? b.overall_rating ?? 0;
//     if (sortBy === 'recent') return dateB - dateA;
//     if (sortBy === 'rating_high') return rB - rA;
//     if (sortBy === 'rating_low') return rA - rB;
//     return 0;
//   });

//   // Aggregate stats
//   const ratings = evaluations
//     .map((e) => parseFloat(e.overall_score ?? e.overall_rating))
//     .filter((r) => r != null && !isNaN(r));
//   const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
//   const highestRating = ratings.length ? Math.max(...ratings) : null;

//   return (
//     <div className="space-y-6">
//       {/* Overall Stats */}
//       <div className="grid sm:grid-cols-3 gap-3">
//         <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-xs font-semibold text-amber-700">Average rating</p>
//             <Star className="w-4 h-4 text-amber-600" fill="currentColor" />
//           </div>
//           {evaluationsLoading ? (
//             <div className="h-8 w-16 bg-amber-100 rounded animate-pulse" />
//           ) : (
//             <div className="flex items-baseline gap-1">
//               <p className="text-3xl font-black text-amber-900">{avgRating ?? '—'}</p>
//               {avgRating && <p className="text-xs text-amber-700">/ 5</p>}
//             </div>
//           )}
//           <p className="text-[10px] text-amber-600 mt-1">across {evaluations.length} interview{evaluations.length !== 1 ? 's' : ''}</p>
//         </div>

//         <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-xs font-semibold text-emerald-700">Highest rating</p>
//             <TrendingUp className="w-4 h-4 text-emerald-600" />
//           </div>
//           {evaluationsLoading ? (
//             <div className="h-8 w-16 bg-emerald-100 rounded animate-pulse" />
//           ) : (
//             <div className="flex items-baseline gap-1">
//               <p className="text-3xl font-black text-emerald-900">{highestRating ?? '—'}</p>
//               {highestRating && <p className="text-xs text-emerald-700">/ 5</p>}
//             </div>
//           )}
//           <p className="text-[10px] text-emerald-600 mt-1">Keep it up!</p>
//         </div>

//         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-xs font-semibold text-blue-700">Interviews</p>
//             <Target className="w-4 h-4 text-blue-600" />
//           </div>
//           {evaluationsLoading ? (
//             <div className="h-8 w-12 bg-blue-100 rounded animate-pulse" />
//           ) : (
//             <div className="flex items-baseline gap-1">
//               <p className="text-3xl font-black text-blue-900">{evaluations.length}</p>
//               <p className="text-xs text-blue-700">completed</p>
//             </div>
//           )}
//           <p className="text-[10px] text-blue-600 mt-1">Great consistency!</p>
//         </div>
//       </div>

//       {/* Error state */}
//       {evaluationsError && !evaluationsLoading && (
//         <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-center">
//           <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
//           <p className="text-sm font-semibold text-rose-700 mb-3">Failed to load feedback</p>
//           <button
//             onClick={handleRetry}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all"
//           >
//             <RefreshCw className="w-3 h-3" />
//             Retry
//           </button>
//         </div>
//       )}

//       {/* Feedback list */}
//       <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="text-sm font-bold text-slate-900">Interview feedback</h4>
//           <span className="text-xs font-semibold text-slate-500">
//             {sorted.length} interview{sorted.length !== 1 ? 's' : ''}
//           </span>
//         </div>

//         {/* Filters */}
//         <div className="flex gap-2 mb-4 pb-4 border-b border-slate-200 overflow-x-auto">
//           {['all', 'Technical', 'System Design', 'Behavioral', 'HR'].map((type) => (
//             <button
//               key={type}
//               onClick={() => setFilterType(type)}
//               className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterType === type
//                 ? 'bg-indigo-600 text-white'
//                 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//             >
//               {type === 'all' ? 'All' : type}
//             </button>
//           ))}
//         </div>

//         {/* Sort */}
//         <div className="flex items-center justify-between mb-4">
//           <p className="text-xs text-slate-600">Sort by:</p>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl px-2 py-1"
//           >
//             <option value="recent">Most Recent</option>
//             <option value="rating_high">Highest Rating</option>
//             <option value="rating_low">Lowest Rating</option>
//           </select>
//         </div>

//         {/* Content */}
//         <div className="space-y-3">
//           {evaluationsLoading ? (
//             <FeedbackSkeleton />
//           ) : sorted.length > 0 ? (
//             sorted.map((ev) => <FeedbackCard key={ev.id} evaluation={ev} />)
//           ) : (
//             <div className="text-center py-8">
//               <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
//               <p className="text-sm text-slate-600">No feedback available yet</p>
//               <p className="text-xs text-slate-500 mt-1">
//                 Complete your first interview to see feedback here
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Tips */}
//       {evaluations.length > 0 && (
//         <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl border border-violet-200 p-4">
//           <div className="flex gap-3">
//             <Lightbulb className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
//             <div className="text-xs">
//               <p className="font-semibold text-violet-900 mb-1">Keep improving</p>
//               <p className="text-violet-800">
//                 Review your feedback regularly, focus on areas for improvement, and book more sessions to raise your average score.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeedbackSection;

























// src/pages/candidate/components/sections/FeedbackSection.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star, TrendingUp, ThumbsUp, AlertCircle,
  ChevronDown, Target, MessageSquare, Lightbulb, RefreshCw,
} from 'lucide-react';
import { fetchCandidateEvaluations } from '../../../../features/feedback/candidate/candidateFeedbackSlice';

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

const RECOMMENDATION_CFG = {
  EXCELLENT: { bg: C.tealLight, border: C.tealBorder, badgeBg: C.teal, badgeColor: C.white, label: 'Excellent' },
  GOOD_FIT: { bg: '#EFF6FF', border: '#BFDBFE', badgeBg: '#3B82F6', badgeColor: C.white, label: 'Good Fit' },
  NEEDS_IMPROVEMENT: { bg: C.yellowLight, border: C.yellowBorder, badgeBg: C.yellow, badgeColor: '#111827', label: 'Improve' },
  NOT_FIT: { bg: '#FEF2F2', border: '#FECACA', badgeBg: '#EF4444', badgeColor: C.white, label: 'Not Fit' },
};

// ─── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ rating }) => {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[...Array(5)].map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <div key={i} style={{ position: 'relative', width: '14px', height: '14px' }}>
            <Star size={14} style={{ color: C.grayMid }} fill={C.grayMid} />
            {filled && (
              <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: i === full && hasHalf ? '50%' : '100%' }}>
                <Star size={14} style={{ color: C.yellow }} fill={C.yellow} />
              </div>
            )}
          </div>
        );
      })}
      <span style={{ fontSize: '12px', fontWeight: 800, color: C.dark, marginLeft: '4px' }}>
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
};

// ─── Feedback Card ─────────────────────────────────────────────────────────────
const FeedbackCard = ({ evaluation }) => {
  const [expanded, setExpanded] = useState(false);

  const rating = evaluation.overall_score ?? evaluation.overall_rating;
  const recommendation = evaluation.recommendation;
  const interviewType = evaluation.interview_type ?? evaluation.booking?.interview_type ?? 'Interview';
  const interviewer = evaluation.interviewer_name ?? evaluation.booking?.interviewer_name ?? 'Interviewer';
  const dateStr = evaluation.created_at ?? evaluation.date;
  const feedbackText = evaluation.general_feedback ?? evaluation.feedback ?? evaluation.comments;
  const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
  const improvements = Array.isArray(evaluation.areas_for_improvement ?? evaluation.weaknesses)
    ? (evaluation.areas_for_improvement ?? evaluation.weaknesses) : [];
  const categories = Array.isArray(evaluation.categories) ? evaluation.categories : [];

  const cfg = RECOMMENDATION_CFG[recommendation] ?? RECOMMENDATION_CFG.GOOD_FIT;

  return (
    <div style={{
      borderRadius: '16px', border: `1.5px solid ${cfg.border}`, background: cfg.bg,
      padding: '16px', transition: 'all 0.15s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: C.dark }}>{interviewType} Interview</h4>
            {cfg.label && (
              <span style={{
                fontSize: '9.5px', fontWeight: 800, padding: '2px 8px',
                borderRadius: '20px', background: cfg.badgeBg, color: cfg.badgeColor,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {cfg.label}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '11.5px', color: C.textMuted }}>
            with <span style={{ fontWeight: 600, color: C.text }}>{interviewer}</span>
            {dateStr && <> &bull; {new Date(dateStr).toLocaleDateString('en-IN')}</>}
          </p>
        </div>
        {rating != null && <StarRating rating={rating} />}
      </div>

      {/* Category bars */}
      {categories.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: C.dark, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Category breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map((cat) => (
              <div key={cat.name ?? cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: C.text }}>{cat.name ?? cat.category}</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: C.dark }}>{cat.rating ?? cat.score}/5</span>
                </div>
                <div style={{ height: '5px', background: C.grayMid, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    background: `linear-gradient(90deg, ${C.teal}, ${C.yellow})`,
                    width: `${((cat.rating ?? cat.score ?? 0) / 5) * 100}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback preview */}
      {feedbackText && (
        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: C.dark }}>Feedback</p>
          <p style={{
            margin: 0, fontSize: '12px', color: C.text, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {feedbackText}
          </p>
        </div>
      )}

      {/* Expand */}
      {(strengths.length > 0 || improvements.length > 0) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: '10px', border: 'none',
              background: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, color: C.text,
              fontFamily: '"DM Sans", sans-serif', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
          >
            View details
            <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {expanded && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid rgba(255,255,255,0.5)`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {strengths.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <ThumbsUp size={13} style={{ color: '#22C55E' }} />
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.dark }}>Strengths</p>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {strengths.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: C.text }}>
                        <span style={{ color: '#22C55E', fontWeight: 700, marginTop: '1px' }}>✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {improvements.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertCircle size={13} style={{ color: '#D97706' }} />
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.dark }}>Areas for improvement</p>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {improvements.map((w, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: C.text }}>
                        <span style={{ color: '#D97706', fontWeight: 700, marginTop: '1px' }}>→</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {feedbackText && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={13} style={{ color: '#3B82F6' }} />
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.dark }}>Detailed feedback</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: C.text, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '10px', lineHeight: 1.5 }}>
                    {feedbackText}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const FeedbackSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <style>{`@keyframes fs-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    {[1, 2].map((i) => (
      <div key={i} style={{
        borderRadius: '16px', border: `1.5px solid ${C.grayBorder}`,
        background: C.gray, padding: '16px', animation: 'fs-pulse 1.5s ease-in-out infinite',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '14px', width: '140px', background: C.grayMid, borderRadius: '6px' }} />
            <div style={{ height: '10px', width: '90px', background: C.grayMid, borderRadius: '5px' }} />
          </div>
          <div style={{ height: '14px', width: '70px', background: C.grayMid, borderRadius: '6px' }} />
        </div>
        <div style={{ height: '52px', background: C.grayMid, borderRadius: '10px', marginBottom: '10px' }} />
        <div style={{ height: '32px', background: C.grayMid, borderRadius: '10px' }} />
      </div>
    ))}
  </div>
);

// ─── Stat box ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, sub, icon: Icon, bg, border, iconColor, loading }) => (
  <div style={{ background: bg, borderRadius: '16px', border: `1px solid ${border}`, padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
      <p style={{ margin: 0, fontSize: '11.5px', fontWeight: 700, color: iconColor }}>{label}</p>
      <Icon size={14} style={{ color: iconColor }} fill={Icon === Star ? iconColor : 'none'} />
    </div>
    {loading ? (
      <div style={{ height: '32px', width: '60px', background: 'rgba(0,0,0,0.08)', borderRadius: '6px', animation: 'fs-pulse 1.4s ease-in-out infinite' }} />
    ) : (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: C.dark }}>{value ?? '—'}</p>
        {value && sub && <p style={{ margin: 0, fontSize: '11px', color: iconColor }}>{sub}</p>}
      </div>
    )}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const FeedbackSection = () => {
  const dispatch = useDispatch();
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  const { evaluations, evaluationsLoading, evaluationsError } = useSelector((state) => state.candidateFeedback);

  useEffect(() => { dispatch(fetchCandidateEvaluations()); }, [dispatch]);

  const handleRetry = () => dispatch(fetchCandidateEvaluations());

  const filtered = evaluations.filter((e) => {
    if (filterType === 'all') return true;
    const type = e.interview_type ?? e.booking?.interview_type ?? '';
    return type.toLowerCase().includes(filterType.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    const dA = new Date(a.created_at ?? a.date ?? 0);
    const dB = new Date(b.created_at ?? b.date ?? 0);
    const rA = a.overall_score ?? a.overall_rating ?? 0;
    const rB = b.overall_score ?? b.overall_rating ?? 0;
    if (sortBy === 'recent') return dB - dA;
    if (sortBy === 'rating_high') return rB - rA;
    if (sortBy === 'rating_low') return rA - rB;
    return 0;
  });

  const ratings = evaluations.map(e => parseFloat(e.overall_score ?? e.overall_rating)).filter(r => !isNaN(r));
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
  const highestRating = ratings.length ? Math.max(...ratings) : null;

  const filterOptions = ['all', 'Technical', 'System Design', 'Behavioral', 'HR'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`@keyframes fs-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <StatBox label="Average rating" value={avgRating} sub="/ 5" icon={Star} bg={C.yellowLight} border={C.yellowBorder} iconColor="#D97706" loading={evaluationsLoading} />
        <StatBox label="Highest rating" value={highestRating} sub="/ 5" icon={TrendingUp} bg={C.tealLight} border={C.tealBorder} iconColor={C.teal} loading={evaluationsLoading} />
        <StatBox label="Interviews" value={evaluations.length} sub="completed" icon={Target} bg={C.gray} border={C.grayBorder} iconColor={C.textMuted} loading={evaluationsLoading} />
      </div>

      {/* Error */}
      {evaluationsError && !evaluationsLoading && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <AlertCircle size={28} style={{ color: '#EF4444', margin: '0 auto 8px', display: 'block' }} />
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>Failed to load feedback</p>
          <button
            onClick={handleRetry}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              background: '#EF4444', color: C.white, fontWeight: 700, fontSize: '12px',
              cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Feedback list card */}
      <div style={{
        background: C.white, borderRadius: '20px', border: `1px solid ${C.grayBorder}`,
        padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.yellow }} />
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.dark }}>Interview Feedback</h4>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted }}>
            {sorted.length} interview{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filterOptions.map((type) => {
            const active = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                  border: `1.5px solid ${active ? C.teal : C.grayBorder}`,
                  background: active ? C.tealLight : C.white,
                  color: active ? C.teal : C.textMuted,
                  fontSize: '11.5px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.12s', fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {type === 'all' ? 'All' : type}
              </button>
            );
          })}
        </div>

        {/* Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '14px', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', color: C.textMuted }}>Sort by:</span>
          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.grayBorder}`,
              background: C.gray, fontSize: '11.5px', fontWeight: 600, color: C.text,
              outline: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {evaluationsLoading ? (
            <FeedbackSkeleton />
          ) : sorted.length > 0 ? (
            sorted.map((ev) => <FeedbackCard key={ev.id} evaluation={ev} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <AlertCircle size={28} style={{ color: C.grayBorder, margin: '0 auto 8px', display: 'block' }} />
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: C.text }}>No feedback available yet</p>
              <p style={{ margin: 0, fontSize: '11.5px', color: C.textMuted }}>Complete your first interview to see feedback here</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      {evaluations.length > 0 && (
        <div style={{
          background: C.yellowLight, borderRadius: '16px',
          border: `1px solid ${C.yellowBorder}`, padding: '14px 16px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <Lightbulb size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 700, color: C.dark }}>Keep improving</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#92740A', lineHeight: 1.5 }}>
              Review your feedback regularly, focus on areas for improvement, and book more sessions to raise your average score.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;