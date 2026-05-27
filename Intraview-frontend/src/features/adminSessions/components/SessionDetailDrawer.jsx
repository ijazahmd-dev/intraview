// src/features/adminSessions/components/SessionDetailDrawer.jsx
/**
 * Section 4 — Session Detail Drawer
 * Right-side inspection panel with all 9 sections A-I.
 * Slides in from the right when a session is selected.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, ChevronDown, ChevronRight, Loader2, AlertTriangle,
    Shield, User, Users, RefreshCw, XCircle,
    MessageSquare, DollarSign, FileText, Clock,
    Star, CheckCircle, Zap,
} from "lucide-react";
import {
    fetchSessionDetail, setSelectedSession,
    applySessionAction, clearActionState,
} from "../redux/adminSessionsSlice";
import { StatusBadge, RiskBadge } from "./StatusBadge";
import SessionTimeline from "./SessionTimeline";
import { fmtDateTime, fmtDuration, getInitials } from "../utils/sessionUtils";

// ── Util ─────────────────────────────────────────────────────────
function Section({ icon: Icon, title, color = "text-indigo-600", children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs font-semibold text-slate-700">{title}</span>
                </div>
                {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {open && <div className="p-4">{children}</div>}
        </div>
    );
}

function Row({ label, value, mono = false }) {
    return (
        <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
            <span className="text-[11px] text-slate-400 font-medium flex-shrink-0 min-w-[120px]">{label}</span>
            <span className={`text-[11px] text-slate-800 text-right ${mono ? "font-mono" : "font-medium"}`}>
                {value ?? "—"}
            </span>
        </div>
    );
}

function ScoreBar({ label, value, max = 5 }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-28 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(value / max) * 100}%` }}
                />
            </div>
            <span className="text-[10px] font-bold text-slate-700 w-6 text-right">{value}/{max}</span>
        </div>
    );
}

function Avatar({ name, email, role }) {
    const initials = getInitials(name) || (email?.[0] || "?").toUpperCase();
    return (
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
                      flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {initials}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-800">{name || "Unknown"}</p>
                <p className="text-[11px] text-slate-400">{email}</p>
                {role && <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-full font-medium">{role}</span>}
            </div>
        </div>
    );
}

// ── Quick admin action panel ───────────────────────────────────────
const ACTIONS = [
    { key: "mark_for_review", label: "Mark for Review", icon: Shield, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
    { key: "escalate_session", label: "Escalate", icon: Zap, color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100" },
    { key: "add_internal_note", label: "Add Note", icon: MessageSquare, color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { key: "flag_risky_session", label: "Flag as Risky", icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100" },
];

function AdminActionPanel({ bookingId }) {
    const dispatch = useDispatch();
    const { data: actionData, status: actionStatus, error: actionError } = useSelector((s) => s.adminSessions.action);
    const [note, setNote] = useState("");
    const [activeAction, setActiveAction] = useState(null);

    const handleAction = (actionKey) => {
        dispatch(applySessionAction({ bookingId, action: actionKey, note }));
        setActiveAction(actionKey);
    };

    useEffect(() => {
        return () => dispatch(clearActionState());
    }, [dispatch]);

    return (
        <div className="space-y-3">
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for this action…"
                className="w-full h-16 text-xs px-3 py-2 rounded-xl border border-slate-200
                   focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none
                   text-slate-700 placeholder:text-slate-300"
            />
            <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map(({ key, label, icon: Icon, color }) => (
                    <button
                        key={key}
                        onClick={() => handleAction(key)}
                        disabled={actionStatus === "loading"}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium
                       rounded-xl border transition-colors ${color}
                       disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {actionStatus === "loading" && activeAction === key
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Icon className="w-3.5 h-3.5" />
                        }
                        {label}
                    </button>
                ))}
            </div>
            {actionStatus === "succeeded" && actionData && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700">
                    ✓ {actionData.message}
                </div>
            )}
            {actionStatus === "failed" && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-600">
                    {actionError || "Action failed."}
                </div>
            )}
        </div>
    );
}

// ── Main Drawer ───────────────────────────────────────────────────
export default function SessionDetailDrawer() {
    const dispatch = useDispatch();
    const selectedId = useSelector((s) => s.adminSessions.selectedId);
    const { data, status, error } = useSelector((s) => s.adminSessions.detail);

    useEffect(() => {
        if (selectedId !== null) {
            dispatch(fetchSessionDetail(selectedId));
        }
    }, [dispatch, selectedId]);

    const close = () => dispatch(setSelectedSession(null));

    const d = data || {};
    const sd = d.session_details || {};
    const cand = d.candidate_details || {};
    const iw = d.interviewer_details || {};
    const rs = d.reschedule_details || {};
    const cancel = d.cancellation_details;
    const fb = d.feedback_details || {};
    const fin = d.financial_details || {};
    const rep = d.report_details || {};
    const tl = d.timeline || [];

    return (
        <AnimatePresence>
            {selectedId !== null && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 280 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[640px] bg-white
                       shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                                flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Session #{selectedId}
                                    </h2>
                                    <p className="text-[10px] text-slate-400">Booking Inspection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {d.high_risk_session && <RiskBadge />}
                                {sd.status && <StatusBadge status={sd.status} />}
                                <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center
                                                   text-slate-400 hover:bg-slate-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Loading */}
                        {status === "loading" && (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        )}

                        {/* Error */}
                        {status === "failed" && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-500">
                                <AlertTriangle className="w-6 h-6" />
                                <p className="text-sm">{error || "Failed to load session"}</p>
                                <button
                                    onClick={() => dispatch(fetchSessionDetail(selectedId))}
                                    className="text-xs text-indigo-600 underline"
                                >Retry</button>
                            </div>
                        )}

                        {/* Content */}
                        {status === "succeeded" && data && (
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

                                {/* A. Session Details */}
                                <Section icon={CheckCircle} title="Session Details" color="text-indigo-600">
                                    <Row label="Booking ID" value={`#${sd.booking_id}`} mono />
                                    <Row label="Status" value={<StatusBadge status={sd.status} size="xs" />} />
                                    <Row label="Payment" value={<StatusBadge status={sd.payment_status} variant="payment" size="xs" />} />
                                    <Row label="Token Cost" value={`${sd.token_cost} tokens`} />
                                    <Row label="Start" value={fmtDateTime(sd.start_datetime)} />
                                    <Row label="End" value={fmtDateTime(sd.end_datetime)} />
                                    <Row label="Duration" value={fmtDuration(sd.duration_minutes)} />
                                    <Row label="Eval Deadline" value={fmtDateTime(sd.evaluation_deadline)} />
                                    <Row label="Created" value={fmtDateTime(sd.created_at)} />
                                </Section>

                                {/* B. Candidate */}
                                <Section icon={User} title="Candidate" color="text-blue-600">
                                    <Avatar name={cand.full_name} email={cand.email} role="Candidate" />
                                    <Row label="Total Sessions" value={cand.total_sessions} />
                                    <Row label="Completed" value={cand.total_completed} />
                                    <Row label="Cancellations" value={cand.total_cancellations} />
                                    <Row label="Reports Filed" value={cand.report_count} />
                                </Section>

                                {/* C. Interviewer */}
                                <Section icon={Users} title="Interviewer" color="text-violet-600">
                                    <Avatar name={iw.name} email={iw.email} role="Interviewer" />
                                    <Row label="Verification" value={iw.verification_status} />
                                    <Row label="Avg Rating" value={iw.avg_rating ? `${iw.avg_rating} / 5` : "—"} />
                                    <Row label="Completed" value={iw.completed_interviews} />
                                    <Row label="Cancellation Rate" value={`${iw.cancellation_rate}%`} />
                                    <Row label="No-Show Rate" value={`${iw.no_show_rate}%`} />
                                    <Row label="Reports Against" value={iw.reports_count} />
                                </Section>

                                {/* D. Reschedule */}
                                <Section icon={RefreshCw} title="Reschedule" color="text-amber-600" defaultOpen={rs.reschedule_count > 0}>
                                    <Row label="Count" value={rs.reschedule_count} />
                                    <Row label="Requested By" value={rs.requested_by} />
                                    <Row label="Requested At" value={fmtDateTime(rs.requested_at)} />
                                    <Row label="Status" value={<StatusBadge status={rs.reschedule_status} variant="reschedule" size="xs" />} />
                                    <Row label="Reason" value={rs.reschedule_reason} />
                                    {rs.proposed_slot && (
                                        <Row label="Proposed Slot" value={`${rs.proposed_slot.date} ${rs.proposed_slot.start_time}–${rs.proposed_slot.end_time}`} />
                                    )}
                                </Section>

                                {/* E. Cancellation (only if cancelled) */}
                                {cancel && (
                                    <Section icon={XCircle} title="Cancellation" color="text-red-600">
                                        <Row label="Cancelled By" value={cancel.cancelled_by} />
                                        <Row label="Cancelled At" value={fmtDateTime(cancel.cancelled_at)} />
                                        <Row label="Reason" value={cancel.cancellation_reason} />
                                    </Section>
                                )}

                                {/* F. Feedback */}
                                <Section icon={MessageSquare} title="Feedback" color="text-teal-600" defaultOpen={false}>
                                    {fb.candidate_evaluation ? (
                                        <div className="space-y-2 mb-4">
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                Candidate Evaluation
                                            </p>
                                            <ScoreBar label="Technical" value={fb.candidate_evaluation.technical_score} />
                                            <ScoreBar label="Communication" value={fb.candidate_evaluation.communication_score} />
                                            <ScoreBar label="Problem Solving" value={fb.candidate_evaluation.problem_solving_score} />
                                            <ScoreBar label="Confidence" value={fb.candidate_evaluation.confidence_score} />
                                            <Row label="Overall" value={`${fb.candidate_evaluation.overall_score} / 5`} />
                                            <Row label="Hire Recommendation" value={fb.candidate_evaluation.hire_recommendation} />
                                            <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 space-y-1">
                                                <p><span className="font-medium">Strengths:</span> {fb.candidate_evaluation.strengths}</p>
                                                <p><span className="font-medium">Improve:</span> {fb.candidate_evaluation.areas_for_improvement}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-400 mb-4">No candidate evaluation submitted.</p>
                                    )}

                                    {fb.interviewer_review ? (
                                        <div className="space-y-2 pt-3 border-t border-slate-100">
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                Interviewer Review
                                            </p>
                                            <div className="flex items-center gap-1 mb-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < fb.interviewer_review.overall_rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                                                    />
                                                ))}
                                                <span className="text-xs text-slate-700 ml-1 font-semibold">
                                                    {fb.interviewer_review.overall_rating}/5
                                                </span>
                                            </div>
                                            <Row label="Professional" value={fb.interviewer_review.was_professional ? "Yes" : "No"} />
                                            <Row label="Prepared" value={fb.interviewer_review.was_prepared ? "Yes" : "No"} />
                                            <Row label="Would Recommend" value={fb.interviewer_review.would_recommend ? "Yes" : "No"} />
                                            {fb.interviewer_review.comment && (
                                                <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700">
                                                    "{fb.interviewer_review.comment}"
                                                </div>
                                            )}
                                            {fb.interviewer_review.reported_issues?.length > 0 && (
                                                <div className="mt-1 text-[11px] text-red-600">
                                                    Issues: {fb.interviewer_review.reported_issues.join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">No interviewer review submitted.</p>
                                    )}
                                </Section>

                                {/* G. Financial */}
                                <Section icon={DollarSign} title="Financial Audit" color="text-green-600" defaultOpen={false}>
                                    <Row label="Token Cost" value={`${fin.token_cost} tokens`} />
                                    <Row label="Payment Status" value={<StatusBadge status={fin.payment_status} variant="payment" size="xs" />} />
                                    <Row label="Refund Issued" value={fin.refund_issued ? `Yes (${fin.refund_tokens} tokens)` : "No"} />
                                    <Row label="Payout Status" value={fin.payout_status} />
                                    <Row label="Payout Ref" value={fin.payout_reference} mono />
                                    <Row label="Payout Amount" value={fin.payout_amount_inr ? `₹${fin.payout_amount_inr}` : "—"} />
                                </Section>

                                {/* H. Reports */}
                                <Section icon={FileText} title={`Reports (${rep.report_count || 0})`} color="text-red-600" defaultOpen={rep.report_count > 0}>
                                    {rep.report_count === 0 ? (
                                        <p className="text-[11px] text-slate-400">No reports for this session.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {rep.reports?.map((r) => (
                                                <div key={r.issue_id} className="p-3 bg-red-50/60 rounded-xl border border-red-100 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-semibold text-red-700">{r.issue_type.replace(/_/g, " ")}</span>
                                                        <StatusBadge status={r.status} size="xs" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-600">{r.description}</p>
                                                    {r.resolution && <p className="text-[11px] text-green-700 font-medium">✓ {r.resolution}</p>}
                                                    {r.admin_notes && (
                                                        <p className="text-[10px] text-slate-400 italic">Note: {r.admin_notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Section>

                                {/* I. Timeline */}
                                <Section icon={Clock} title="Session Timeline" color="text-slate-600" defaultOpen={false}>
                                    <SessionTimeline events={tl} />
                                </Section>

                                {/* Admin Actions */}
                                <Section icon={Shield} title="Admin Actions" color="text-slate-700" defaultOpen>
                                    <AdminActionPanel bookingId={selectedId} />
                                </Section>

                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
