// import React from 'react';
// import { X, Calendar, Clock, Zap, ArrowLeft } from 'lucide-react';
// import {
//     INTERVIEW_TYPE_LABELS,
//     INTERVIEW_TYPE_ICONS,
//     DIFFICULTY_LABELS,
//     CANDIDATE_GOALS,
// } from './SessionConfigModal';

// /**
//  * BookingSummaryModal
//  *
//  * Props:
//  *   isOpen          – boolean
//  *   onClose         – () => void
//  *   onBack          – () => void   (go back to SessionConfigModal)
//  *   onConfirm       – () => void   (submit booking)
//  *   loading         – boolean
//  *   slot            – availability slot object
//  *   profile         – interviewer profile object
//  *   sessionConfig   – { interview_type, difficulty_level, candidate_goal, selected_specialties, candidate_notes }
//  *   tokenCost       – number
//  *   tokenBalance    – number
//  */
// const BookingSummaryModal = ({
//     isOpen,
//     onClose,
//     onBack,
//     onConfirm,
//     loading,
//     slot,
//     profile,
//     sessionConfig,
//     tokenCost,
//     tokenBalance,
// }) => {
//     if (!isOpen || !slot || !profile || !sessionConfig) return null;

//     const goalLabel = CANDIDATE_GOALS.find(g => g.value === sessionConfig.candidate_goal)?.label || sessionConfig.candidate_goal;
//     const goalIcon = CANDIDATE_GOALS.find(g => g.value === sessionConfig.candidate_goal)?.icon || '🎯';

//     const formatTime = (timeString) => {
//         if (!timeString) return '';
//         try {
//             const parts = timeString.split(':');
//             if (parts.length < 2) return timeString;
//             const h = parseInt(parts[0], 10);
//             const m = parts[1];
//             const ampm = h >= 12 ? 'PM' : 'AM';
//             const h12 = h % 12 || 12;
//             return `${h12}:${m} ${ampm}`;
//         } catch {
//             return timeString;
//         }
//     };

//     const Row = ({ label, value, valueClass = '' }) => (
//         <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
//             <span className="text-sm text-slate-500 font-medium">{label}</span>
//             <span className={`text-sm font-semibold text-slate-900 text-right max-w-[55%] ${valueClass}`}>{value}</span>
//         </div>
//     );

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//             <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">

//                 {/* ── Header ── */}
//                 <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 flex-shrink-0">
//                     <div>
//                         <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Step 2 of 2</p>
//                         <h2 className="text-xl font-bold text-slate-900">Booking Summary</h2>
//                         <p className="text-sm text-slate-500 mt-0.5">Review everything before confirming</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
//                         <X className="w-5 h-5 text-slate-500" />
//                     </button>
//                 </div>

//                 {/* ── Body ── */}
//                 <div className="p-6 space-y-5 flex-1">

//                     {/* Interviewer */}
//                     <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
//                         {profile.profile_picture ? (
//                             <img src={profile.profile_picture} alt={profile.display_name} className="w-12 h-12 rounded-2xl object-cover" />
//                         ) : (
//                             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
//                                 {profile.display_name?.[0]?.toUpperCase() || 'I'}
//                             </div>
//                         )}
//                         <div>
//                             <p className="font-bold text-slate-900">{profile.display_name}</p>
//                             <p className="text-sm text-slate-500">{profile.headline || 'Interviewer'}</p>
//                         </div>
//                     </div>

//                     {/* Slot timing */}
//                     <div className="bg-slate-50 rounded-2xl p-4 space-y-0">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Timing</p>
//                         <Row
//                             label={<span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</span>}
//                             value={slot.start_datetime ? new Date(slot.start_datetime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
//                         />
//                         <Row
//                             label={<span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time</span>}
//                             value={`${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`}
//                         />
//                         <Row label="Duration" value={`${slot.duration_minutes || '—'} minutes`} />
//                         <Row label="Timezone" value={slot.timezone || '—'} />
//                     </div>

//                     {/* Session Config */}
//                     <div className="bg-slate-50 rounded-2xl p-4">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Configuration</p>
//                         <Row
//                             label="Interview Type"
//                             value={
//                                 sessionConfig.interview_type
//                                     ? `${INTERVIEW_TYPE_ICONS[sessionConfig.interview_type] || ''} ${INTERVIEW_TYPE_LABELS[sessionConfig.interview_type] || sessionConfig.interview_type}`
//                                     : '—'
//                             }
//                         />
//                         <Row
//                             label="Experience Level"
//                             value={DIFFICULTY_LABELS[sessionConfig.difficulty_level] || '—'}
//                         />
//                         <Row
//                             label="Your Goal"
//                             value={`${goalIcon} ${goalLabel}`}
//                         />
//                         {sessionConfig.selected_specialties?.length > 0 && (
//                             <div className="py-3 border-b border-slate-100">
//                                 <span className="text-sm text-slate-500 font-medium block mb-2">Focus Areas</span>
//                                 <div className="flex flex-wrap gap-1.5">
//                                     {sessionConfig.selected_specialties.map(spec => (
//                                         <span key={spec} className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
//                                             {spec}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                         {sessionConfig.candidate_notes && (
//                             <div className="py-3">
//                                 <span className="text-sm text-slate-500 font-medium block mb-1">Your Notes</span>
//                                 <p className="text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-200 leading-relaxed">
//                                     {sessionConfig.candidate_notes}
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Payment */}
//                     <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment</p>
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                                 <Zap className="w-5 h-5 text-emerald-600" />
//                                 <span className="font-bold text-2xl text-emerald-700">−{tokenCost} tokens</span>
//                             </div>
//                             <span className="text-sm font-semibold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200">
//                                 Locked until completion
//                             </span>
//                         </div>
//                         <p className="text-sm text-emerald-600 mt-2">
//                             Balance after booking: <span className="font-bold">{tokenBalance - tokenCost} tokens</span>
//                         </p>
//                     </div>

//                     {/* Token warning */}
//                     {tokenBalance < tokenCost && (
//                         <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">
//                             ⚠️ Insufficient token balance. You need {tokenCost} tokens but have {tokenBalance}.
//                         </div>
//                     )}

//                     <div className="text-xs text-slate-400 space-y-1">
//                         <p>✅ Tokens automatically refunded if interviewer cancels</p>
//                         <p>✅ Tokens transferred after successful session completion</p>
//                         <p>⚠️ Cancel at least 5 hours before session for a refund</p>
//                     </div>
//                 </div>

//                 {/* ── Footer ── */}
//                 <div className="p-6 pt-4 border-t border-slate-100 flex-shrink-0">
//                     <div className="flex gap-3">
//                         <button
//                             onClick={onBack}
//                             disabled={loading}
//                             className="flex items-center gap-1.5 px-5 py-3 border-2 border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
//                         >
//                             <ArrowLeft className="w-4 h-4" />
//                             Back
//                         </button>
//                         <button
//                             onClick={onConfirm}
//                             disabled={loading || tokenBalance < tokenCost}
//                             className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                                     Booking…
//                                 </>
//                             ) : (
//                                 <>
//                                     <Zap className="w-4 h-4" />
//                                     Confirm &amp; Lock {tokenCost} Tokens
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default BookingSummaryModal;





























import React from 'react';
import { X, Calendar, Clock, Zap, ArrowLeft } from 'lucide-react';
import {
    INTERVIEW_TYPE_LABELS,
    INTERVIEW_TYPE_ICONS,
    DIFFICULTY_LABELS,
    CANDIDATE_GOALS,
} from './SessionConfigModal';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    teal: '#0BB5A0',
    tealDark: '#099485',
    tealLight: '#E6F8F6',
    tealBorder: '#B3E8E3',
    yellow: '#F5C518',
    yellowDark: '#C9A214',
    yellowLight: '#FEFAE8',
    yellowBorder: '#EDD87A',
    dark: '#111827',
    gray: '#F5F5F5',
    grayMid: '#E8E8E8',
    grayBorder: '#E0E0E0',
    white: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
};

// ─── Shared primitives ─────────────────────────────────────────────────────────

const InfoRow = ({ label, value, last }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '9px 0', borderBottom: last ? 'none' : `1px solid ${C.grayMid}`,
    }}>
        <span style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: C.text, textAlign: 'right', maxWidth: '60%' }}>
            {value}
        </span>
    </div>
);

/**
 * BookingSummaryModal
 *
 * Props:
 *   isOpen          – boolean
 *   onClose         – () => void
 *   onBack          – () => void   (go back to SessionConfigModal)
 *   onConfirm       – () => void   (submit booking)
 *   loading         – boolean
 *   slot            – availability slot object
 *   profile         – interviewer profile object
 *   sessionConfig   – { interview_type, difficulty_level, candidate_goal, selected_specialties, candidate_notes }
 *   tokenCost       – number
 *   tokenBalance    – number
 */
const BookingSummaryModal = ({
    isOpen,
    onClose,
    onBack,
    onConfirm,
    loading,
    slot,
    profile,
    sessionConfig,
    tokenCost,
    tokenBalance,
}) => {
    if (!isOpen || !slot || !profile || !sessionConfig) return null;

    const goalLabel = CANDIDATE_GOALS.find(g => g.value === sessionConfig.candidate_goal)?.label || sessionConfig.candidate_goal;
    const goalIcon = CANDIDATE_GOALS.find(g => g.value === sessionConfig.candidate_goal)?.icon || '🎯';

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const parts = timeString.split(':');
            if (parts.length < 2) return timeString;
            const h = parseInt(parts[0], 10);
            const m = parts[1];
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m} ${ampm}`;
        } catch {
            return timeString;
        }
    };

    const canConfirm = tokenBalance >= tokenCost;

    const timingRows = [
        {
            label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color={C.textMuted} /> Date</span>,
            value: slot.start_datetime
                ? new Date(slot.start_datetime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                : '—',
        },
        {
            label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} color={C.textMuted} /> Time</span>,
            value: `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`,
        },
        { label: 'Duration', value: `${slot.duration_minutes || '—'} minutes` },
        { label: 'Timezone', value: slot.timezone || '—' },
    ];

    const configRows = [
        {
            label: 'Interview Type',
            value: sessionConfig.interview_type
                ? `${INTERVIEW_TYPE_ICONS[sessionConfig.interview_type] || ''} ${INTERVIEW_TYPE_LABELS[sessionConfig.interview_type] || sessionConfig.interview_type}`
                : '—',
        },
        { label: 'Experience Level', value: DIFFICULTY_LABELS[sessionConfig.difficulty_level] || '—' },
        { label: 'Your Goal', value: `${goalIcon} ${goalLabel}` },
    ];

    const hasSpecs = sessionConfig.selected_specialties?.length > 0;
    const hasNotes = !!sessionConfig.candidate_notes;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes bsm-spin { to { transform: rotate(360deg); } }
      `}</style>

            {/* Overlay */}
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.52)',
                backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '16px',
                fontFamily: '"DM Sans", sans-serif',
            }}>
                {/* Sheet */}
                <div style={{
                    background: C.white, borderRadius: '28px', maxWidth: '480px', width: '100%',
                    maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                    border: `1px solid ${C.grayBorder}`,
                    boxShadow: `0 28px 72px ${C.yellow}22, 0 4px 20px rgba(0,0,0,0.09)`,
                }}>

                    {/* ── Header ── */}
                    <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${C.grayBorder}`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{
                                    display: 'inline-block', background: C.yellowLight, color: C.yellowDark,
                                    fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em',
                                    padding: '3px 11px', borderRadius: '20px', textTransform: 'uppercase',
                                    marginBottom: '8px', border: `1px solid ${C.yellowBorder}`,
                                }}>Step 2 of 2</span>
                                <h2 style={{ margin: '0 0 3px', fontSize: '21px', fontWeight: 700, color: C.dark }}>Booking Summary</h2>
                                <p style={{ margin: 0, fontSize: '13px', color: C.textMuted }}>Review everything before confirming</p>
                            </div>
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                style={{
                                    border: 'none', background: C.gray, borderRadius: '10px',
                                    width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                <X size={17} color={C.textMuted} />
                            </button>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>

                        {/* Interviewer card */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                            background: C.tealLight, borderRadius: '18px', border: `1px solid ${C.tealBorder}`,
                        }}>
                            {profile.profile_picture ? (
                                <img
                                    src={profile.profile_picture}
                                    alt={profile.display_name}
                                    style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '14px', background: C.teal,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: C.white, fontWeight: 700, fontSize: '18px', flexShrink: 0,
                                }}>
                                    {profile.display_name?.[0]?.toUpperCase() || 'I'}
                                </div>
                            )}
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, color: C.dark, fontSize: '15px' }}>{profile.display_name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '13px', color: C.teal, fontWeight: 500 }}>
                                    {profile.headline || 'Interviewer'}
                                </p>
                            </div>
                        </div>

                        {/* Slot timing */}
                        <div style={{ background: C.gray, borderRadius: '18px', padding: '14px 16px' }}>
                            <p style={{
                                margin: '0 0 4px', fontSize: '10.5px', fontWeight: 700, color: C.textLight,
                                textTransform: 'uppercase', letterSpacing: '0.09em',
                            }}>Session Timing</p>
                            {timingRows.map((r, i) => (
                                <InfoRow key={i} label={r.label} value={r.value} last={i === timingRows.length - 1} />
                            ))}
                        </div>

                        {/* Session Config */}
                        <div style={{ background: C.gray, borderRadius: '18px', padding: '14px 16px' }}>
                            <p style={{
                                margin: '0 0 4px', fontSize: '10.5px', fontWeight: 700, color: C.textLight,
                                textTransform: 'uppercase', letterSpacing: '0.09em',
                            }}>Session Configuration</p>
                            {configRows.map((r, i) => (
                                <InfoRow
                                    key={i}
                                    label={r.label}
                                    value={r.value}
                                    last={i === configRows.length - 1 && !hasSpecs && !hasNotes}
                                />
                            ))}
                            {hasSpecs && (
                                <div style={{ padding: '10px 0 0', borderTop: `1px solid ${C.grayMid}` }}>
                                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: C.textMuted, fontWeight: 500 }}>Focus Areas</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {sessionConfig.selected_specialties.map(spec => (
                                            <span key={spec} style={{
                                                padding: '4px 10px', background: C.tealLight, color: C.teal,
                                                fontSize: '12px', fontWeight: 600, borderRadius: '20px',
                                                border: `1px solid ${C.tealBorder}`,
                                            }}>
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {hasNotes && (
                                <div style={{ padding: '10px 0 0', borderTop: `1px solid ${C.grayMid}` }}>
                                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: C.textMuted, fontWeight: 500 }}>Your Notes</p>
                                    <p style={{
                                        margin: 0, fontSize: '13px', color: C.text, background: C.white,
                                        borderRadius: '12px', padding: '10px 12px', border: `1px solid ${C.grayBorder}`, lineHeight: 1.6,
                                    }}>
                                        {sessionConfig.candidate_notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div style={{
                            background: C.yellowLight, borderRadius: '18px', padding: '14px 16px',
                            border: `1.5px solid ${C.yellowBorder}`,
                        }}>
                            <p style={{
                                margin: '0 0 10px', fontSize: '10.5px', fontWeight: 700, color: C.yellowDark,
                                textTransform: 'uppercase', letterSpacing: '0.09em',
                            }}>Payment</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '10px', background: C.yellow,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Zap size={16} color={C.white} strokeWidth={2.5} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '22px', color: C.dark }}>−{tokenCost} tokens</span>
                                </div>
                                <span style={{
                                    fontSize: '12px', fontWeight: 600, color: C.yellowDark, background: C.white,
                                    padding: '5px 10px', borderRadius: '10px', border: `1px solid ${C.yellowBorder}`,
                                }}>
                                    Locked until completion
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: C.yellowDark }}>
                                Balance after booking: <span style={{ fontWeight: 700 }}>{tokenBalance - tokenCost} tokens</span>
                            </p>
                        </div>

                        {/* Token warning */}
                        {tokenBalance < tokenCost && (
                            <div style={{
                                padding: '12px 14px', borderRadius: '14px', background: '#FEF2F2',
                                border: '1px solid #FECACA', fontSize: '13px', color: '#DC2626', fontWeight: 500,
                            }}>
                                ⚠️ Insufficient token balance. You need {tokenCost} tokens but have {tokenBalance}.
                            </div>
                        )}

                        {/* Policy hints */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                            {[
                                { text: 'Tokens automatically refunded if interviewer cancels', ok: true },
                                { text: 'Tokens transferred after successful session completion', ok: true },
                                { text: 'Cancel at least 5 hours before session for a refund', ok: false },
                            ].map((n, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                        background: n.ok ? C.tealLight : C.yellowLight,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '10px', color: n.ok ? C.teal : C.yellowDark }}>
                                            {n.ok ? '✓' : '!'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: C.textMuted }}>{n.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.grayBorder}`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={onBack}
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '13px 18px',
                                    border: `1.5px solid ${C.grayBorder}`, borderRadius: '18px', background: C.white,
                                    color: C.textMuted, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                                    opacity: loading ? 0.5 : 1, fontFamily: '"DM Sans", sans-serif',
                                }}
                            >
                                <ArrowLeft size={15} /> Back
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading || tokenBalance < tokenCost}
                                style={{
                                    flex: 1, padding: '13px', border: 'none', borderRadius: '18px',
                                    background: canConfirm ? C.teal : C.grayMid,
                                    color: canConfirm ? C.white : C.textMuted,
                                    fontWeight: 700, fontSize: '14px',
                                    cursor: canConfirm && !loading ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontFamily: '"DM Sans", sans-serif', transition: 'all 0.15s',
                                    boxShadow: canConfirm ? `0 4px 18px ${C.teal}44` : 'none',
                                    opacity: loading || !canConfirm ? 0.7 : 1,
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white', borderRadius: '50%',
                                            animation: 'bsm-spin 0.7s linear infinite',
                                        }} />
                                        Booking…
                                    </>
                                ) : (
                                    <>
                                        <Zap size={15} strokeWidth={2.5} />
                                        Confirm &amp; Lock {tokenCost} Tokens
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default BookingSummaryModal;