import React from 'react';
import { X, Calendar, Clock, Zap, ArrowLeft } from 'lucide-react';
import {
    INTERVIEW_TYPE_LABELS,
    INTERVIEW_TYPE_ICONS,
    DIFFICULTY_LABELS,
    CANDIDATE_GOALS,
} from './SessionConfigModal';

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

    const Row = ({ label, value, valueClass = '' }) => (
        <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className={`text-sm font-semibold text-slate-900 text-right max-w-[55%] ${valueClass}`}>{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">

                {/* ── Header ── */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Step 2 of 2</p>
                        <h2 className="text-xl font-bold text-slate-900">Booking Summary</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Review everything before confirming</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-6 space-y-5 flex-1">

                    {/* Interviewer */}
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        {profile.profile_picture ? (
                            <img src={profile.profile_picture} alt={profile.display_name} className="w-12 h-12 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                                {profile.display_name?.[0]?.toUpperCase() || 'I'}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-slate-900">{profile.display_name}</p>
                            <p className="text-sm text-slate-500">{profile.headline || 'Interviewer'}</p>
                        </div>
                    </div>

                    {/* Slot timing */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Timing</p>
                        <Row
                            label={<span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</span>}
                            value={slot.start_datetime ? new Date(slot.start_datetime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                        />
                        <Row
                            label={<span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time</span>}
                            value={`${slot.start_time} – ${slot.end_time}`}
                        />
                        <Row label="Duration" value={`${slot.duration_minutes || '—'} minutes`} />
                        <Row label="Timezone" value={slot.timezone || '—'} />
                    </div>

                    {/* Session Config */}
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Configuration</p>
                        <Row
                            label="Interview Type"
                            value={
                                sessionConfig.interview_type
                                    ? `${INTERVIEW_TYPE_ICONS[sessionConfig.interview_type] || ''} ${INTERVIEW_TYPE_LABELS[sessionConfig.interview_type] || sessionConfig.interview_type}`
                                    : '—'
                            }
                        />
                        <Row
                            label="Experience Level"
                            value={DIFFICULTY_LABELS[sessionConfig.difficulty_level] || '—'}
                        />
                        <Row
                            label="Your Goal"
                            value={`${goalIcon} ${goalLabel}`}
                        />
                        {sessionConfig.selected_specialties?.length > 0 && (
                            <div className="py-3 border-b border-slate-100">
                                <span className="text-sm text-slate-500 font-medium block mb-2">Focus Areas</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {sessionConfig.selected_specialties.map(spec => (
                                        <span key={spec} className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {sessionConfig.candidate_notes && (
                            <div className="py-3">
                                <span className="text-sm text-slate-500 font-medium block mb-1">Your Notes</span>
                                <p className="text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-200 leading-relaxed">
                                    {sessionConfig.candidate_notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-600" />
                                <span className="font-bold text-2xl text-emerald-700">−{tokenCost} tokens</span>
                            </div>
                            <span className="text-sm font-semibold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200">
                                Locked until completion
                            </span>
                        </div>
                        <p className="text-sm text-emerald-600 mt-2">
                            Balance after booking: <span className="font-bold">{tokenBalance - tokenCost} tokens</span>
                        </p>
                    </div>

                    {/* Token warning */}
                    {tokenBalance < tokenCost && (
                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">
                            ⚠️ Insufficient token balance. You need {tokenCost} tokens but have {tokenBalance}.
                        </div>
                    )}

                    <div className="text-xs text-slate-400 space-y-1">
                        <p>✅ Tokens automatically refunded if interviewer cancels</p>
                        <p>✅ Tokens transferred after successful session completion</p>
                        <p>⚠️ Cancel at least 5 hours before session for a refund</p>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="p-6 pt-4 border-t border-slate-100 flex-shrink-0">
                    <div className="flex gap-3">
                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-5 py-3 border-2 border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading || tokenBalance < tokenCost}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Booking…
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Confirm &amp; Lock {tokenCost} Tokens
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSummaryModal;
