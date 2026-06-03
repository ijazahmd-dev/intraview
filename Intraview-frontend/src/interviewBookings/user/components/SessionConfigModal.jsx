// import React, { useState } from 'react';
// import { X, ChevronRight, Target, Layers, BookOpen, MessageSquare } from 'lucide-react';

// // ─── Static option maps ────────────────────────────────────────────────────────

// export const INTERVIEW_TYPE_LABELS = {
//     TECHNICAL: 'Technical Interview',
//     BEHAVIORAL: 'Behavioral Interview',
//     HR_ROUND: 'HR Round',
//     CODING: 'Coding Interview',
//     MOCK_FULL: 'Mock Full Interview',
//     RESUME_REVIEW: 'Resume Review',
//     WARMUP: 'Warm-up Session',
//     SYSTEM_DESIGN: 'System Design',
// };

// export const INTERVIEW_TYPE_ICONS = {
//     TECHNICAL: '⚙️',
//     BEHAVIORAL: '🧠',
//     HR_ROUND: '🤝',
//     CODING: '💻',
//     MOCK_FULL: '🎯',
//     RESUME_REVIEW: '📄',
//     WARMUP: '🔥',
//     SYSTEM_DESIGN: '🏗️',
// };

// export const DIFFICULTY_LABELS = {
//     BEGINNER: 'Beginner',
//     INTERMEDIATE: 'Intermediate',
//     ADVANCED: 'Advanced',
// };

// export const DIFFICULTY_COLORS = {
//     BEGINNER: 'bg-green-50 border-green-300 text-green-800',
//     INTERMEDIATE: 'bg-yellow-50 border-yellow-300 text-yellow-800',
//     ADVANCED: 'bg-red-50 border-red-300 text-red-800',
// };

// export const DIFFICULTY_SELECTED_COLORS = {
//     BEGINNER: 'bg-green-500 border-green-500 text-white',
//     INTERMEDIATE: 'bg-yellow-500 border-yellow-500 text-white',
//     ADVANCED: 'bg-red-500 border-red-500 text-white',
// };

// export const CANDIDATE_GOALS = [
//     { value: 'FIRST_MOCK', label: 'First Mock Interview', icon: '🚀' },
//     { value: 'PLACEMENT_PREP', label: 'Placement Preparation', icon: '🎓' },
//     { value: 'IMPROVE_CONFIDENCE', label: 'Improve Confidence', icon: '💪' },
//     { value: 'COMPANY_PREP', label: 'Company Preparation', icon: '🏢' },
//     { value: 'PRACTICE_DSA', label: 'Practice DSA', icon: '🧮' },
//     { value: 'IMPROVE_COMM', label: 'Improve Communication', icon: '🗣️' },
//     { value: 'GENERAL_PRACTICE', label: 'General Practice', icon: '📚' },
// ];


// // ─── Helper ────────────────────────────────────────────────────────────────────

// const SectionHeader = ({ icon: Icon, title, subtitle }) => (
//     <div className="flex items-start gap-3 mb-4">
//         <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
//             <Icon className="w-5 h-5 text-indigo-600" />
//         </div>
//         <div>
//             <p className="font-semibold text-slate-900 text-sm">{title}</p>
//             {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
//         </div>
//     </div>
// );

// // ─── Main Component ────────────────────────────────────────────────────────────

// /**
//  * SessionConfigModal
//  *
//  * Props:
//  *   isOpen              – boolean
//  *   onClose             – () => void
//  *   onNext              – (sessionConfig: object) => void   (moves to summary step)
//  *   slot                – availability slot object
//  *   profile             – interviewer profile object with:
//  *                           supported_interview_types, supported_experience_levels,
//  *                           specializations, display_name
//  */
// const SessionConfigModal = ({ isOpen, onClose, onNext, slot, profile }) => {
//     const [interviewType, setInterviewType] = useState('');
//     const [difficultyLevel, setDifficultyLevel] = useState('');
//     const [candidateGoal, setCandidateGoal] = useState('');
//     const [selectedSpecialties, setSelectedSpecialties] = useState([]);
//     const [candidateNotes, setCandidateNotes] = useState('');

//     if (!isOpen || !slot || !profile) return null;

//     // Dynamic options — filter by what the interviewer offers. Fall back to all if none configured.
//     const supportedTypes = profile.supported_interview_types?.length
//         ? profile.supported_interview_types
//         : Object.keys(INTERVIEW_TYPE_LABELS);

//     const supportedLevels = profile.supported_experience_levels?.length
//         ? profile.supported_experience_levels
//         : Object.keys(DIFFICULTY_LABELS);

//     const interviewerSpecialties = profile.specializations || [];

//     const toggleSpecialty = (spec) => {
//         setSelectedSpecialties(prev =>
//             prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
//         );
//     };

//     const handleNext = () => {
//         if (!interviewType) {
//             alert('Please select an interview type.');
//             return;
//         }
//         if (!difficultyLevel) {
//             alert('Please select an experience level.');
//             return;
//         }
//         if (!candidateGoal) {
//             alert('Please select your goal for this session.');
//             return;
//         }
//         onNext({
//             interview_type: interviewType,
//             difficulty_level: difficultyLevel,
//             candidate_goal: candidateGoal,
//             selected_specialties: selectedSpecialties,
//             candidate_notes: candidateNotes.trim(),
//         });
//     };

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//             <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">

//                 {/* ── Header ── */}
//                 <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 flex-shrink-0">
//                     <div>
//                         <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">Step 1 of 2</p>
//                         <h2 className="text-xl font-bold text-slate-900">Configure Your Session</h2>
//                         <p className="text-sm text-slate-500 mt-0.5">
//                             Tell <span className="font-semibold">{profile.display_name}</span> what you need
//                         </p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 hover:bg-slate-100 rounded-xl transition-all"
//                     >
//                         <X className="w-5 h-5 text-slate-500" />
//                     </button>
//                 </div>

//                 {/* ── Body ── */}
//                 <div className="p-6 space-y-7 flex-1">

//                     {/* 1. Interview Type */}
//                     <section>
//                         <SectionHeader icon={Target} title="Interview Type" subtitle="Select the type of interview you want" />
//                         <div className="grid grid-cols-2 gap-2">
//                             {supportedTypes.map(type => (
//                                 <button
//                                     key={type}
//                                     onClick={() => setInterviewType(type)}
//                                     className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm font-medium text-left transition-all ${interviewType === type
//                                             ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
//                                             : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
//                                         }`}
//                                 >
//                                     <span className="text-base">{INTERVIEW_TYPE_ICONS[type] || '📋'}</span>
//                                     <span className="leading-tight">{INTERVIEW_TYPE_LABELS[type] || type}</span>
//                                 </button>
//                             ))}
//                         </div>
//                     </section>

//                     {/* 2. Experience Level */}
//                     <section>
//                         <SectionHeader icon={Layers} title="Experience Level" subtitle="Select the difficulty that matches your background" />
//                         <div className="flex gap-3">
//                             {supportedLevels.map(level => (
//                                 <button
//                                     key={level}
//                                     onClick={() => setDifficultyLevel(level)}
//                                     className={`flex-1 py-2.5 px-4 rounded-2xl border-2 text-sm font-semibold transition-all ${difficultyLevel === level
//                                             ? DIFFICULTY_SELECTED_COLORS[level]
//                                             : DIFFICULTY_COLORS[level]
//                                         }`}
//                                 >
//                                     {DIFFICULTY_LABELS[level] || level}
//                                 </button>
//                             ))}
//                         </div>
//                     </section>

//                     {/* 3. Focus Areas (multi-select chips) */}
//                     {interviewerSpecialties.length > 0 && (
//                         <section>
//                             <SectionHeader
//                                 icon={BookOpen}
//                                 title="Focus Areas"
//                                 subtitle="Pick topics you want to focus on (multi-select)"
//                             />
//                             <div className="flex flex-wrap gap-2">
//                                 {interviewerSpecialties.map(spec => (
//                                     <button
//                                         key={spec}
//                                         onClick={() => toggleSpecialty(spec)}
//                                         className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${selectedSpecialties.includes(spec)
//                                                 ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
//                                                 : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
//                                             }`}
//                                     >
//                                         {selectedSpecialties.includes(spec) && <span className="mr-1">✓</span>}
//                                         {spec}
//                                     </button>
//                                 ))}
//                             </div>
//                             {selectedSpecialties.length > 0 && (
//                                 <p className="text-xs text-indigo-600 mt-2 font-medium">
//                                     {selectedSpecialties.length} topic{selectedSpecialties.length > 1 ? 's' : ''} selected
//                                 </p>
//                             )}
//                         </section>
//                     )}

//                     {/* 4. Candidate Goal */}
//                     <section>
//                         <SectionHeader icon={Target} title="Your Goal" subtitle="What do you want to achieve?" />
//                         <div className="grid grid-cols-2 gap-2">
//                             {CANDIDATE_GOALS.map(g => (
//                                 <button
//                                     key={g.value}
//                                     onClick={() => setCandidateGoal(g.value)}
//                                     className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm text-left transition-all ${candidateGoal === g.value
//                                             ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
//                                             : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
//                                         }`}
//                                 >
//                                     <span className="text-base">{g.icon}</span>
//                                     <span className="leading-tight font-medium">{g.label}</span>
//                                 </button>
//                             ))}
//                         </div>
//                     </section>

//                     {/* 5. Notes (optional) */}
//                     <section>
//                         <SectionHeader
//                             icon={MessageSquare}
//                             title="Preparation Notes"
//                             subtitle="Optional — tell the interviewer what to focus on"
//                         />
//                         <textarea
//                             value={candidateNotes}
//                             onChange={e => setCandidateNotes(e.target.value)}
//                             maxLength={1000}
//                             rows={3}
//                             placeholder="e.g. Please focus on React hooks and Redux Toolkit. I'm weak on async patterns."
//                             className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm text-slate-700 placeholder:text-slate-400 resize-none transition-all"
//                         />
//                         <p className="text-xs text-slate-400 mt-1 text-right">{candidateNotes.length}/1000</p>
//                     </section>
//                 </div>

//                 {/* ── Footer ── */}
//                 <div className="p-6 pt-4 border-t border-slate-100 flex-shrink-0">
//                     <div className="flex gap-3">
//                         <button
//                             onClick={onClose}
//                             className="flex-1 py-3 border-2 border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             onClick={handleNext}
//                             className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
//                         >
//                             Review Summary
//                             <ChevronRight className="w-4 h-4" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SessionConfigModal;
























import React, { useState } from 'react';
import { X, ChevronRight, Target, Layers, BookOpen, MessageSquare } from 'lucide-react';

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

// ─── Static option maps ────────────────────────────────────────────────────────

export const INTERVIEW_TYPE_LABELS = {
    TECHNICAL: 'Technical Interview',
    BEHAVIORAL: 'Behavioral Interview',
    HR_ROUND: 'HR Round',
    CODING: 'Coding Interview',
    MOCK_FULL: 'Mock Full Interview',
    RESUME_REVIEW: 'Resume Review',
    WARMUP: 'Warm-up Session',
    SYSTEM_DESIGN: 'System Design',
};

export const INTERVIEW_TYPE_ICONS = {
    TECHNICAL: '⚙️',
    BEHAVIORAL: '🧠',
    HR_ROUND: '🤝',
    CODING: '💻',
    MOCK_FULL: '🎯',
    RESUME_REVIEW: '📄',
    WARMUP: '🔥',
    SYSTEM_DESIGN: '🏗️',
};

export const DIFFICULTY_LABELS = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
};

export const DIFFICULTY_COLORS = {
    BEGINNER: 'bg-green-50 border-green-300 text-green-800',
    INTERMEDIATE: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    ADVANCED: 'bg-red-50 border-red-300 text-red-800',
};

export const DIFFICULTY_SELECTED_COLORS = {
    BEGINNER: 'bg-green-500 border-green-500 text-white',
    INTERMEDIATE: 'bg-yellow-500 border-yellow-500 text-white',
    ADVANCED: 'bg-red-500 border-red-500 text-white',
};

export const CANDIDATE_GOALS = [
    { value: 'FIRST_MOCK', label: 'First Mock Interview', icon: '🚀' },
    { value: 'PLACEMENT_PREP', label: 'Placement Preparation', icon: '🎓' },
    { value: 'IMPROVE_CONFIDENCE', label: 'Improve Confidence', icon: '💪' },
    { value: 'COMPANY_PREP', label: 'Company Preparation', icon: '🏢' },
    { value: 'PRACTICE_DSA', label: 'Practice DSA', icon: '🧮' },
    { value: 'IMPROVE_COMM', label: 'Improve Communication', icon: '🗣️' },
    { value: 'GENERAL_PRACTICE', label: 'General Practice', icon: '📚' },
];

// ─── Design constants for difficulty ──────────────────────────────────────────
const DIFF_CFG = {
    BEGINNER: { fill: C.tealLight, border: C.tealBorder, text: C.teal, selFill: C.teal, selText: C.white },
    INTERMEDIATE: { fill: C.yellowLight, border: C.yellowBorder, text: C.yellowDark, selFill: C.yellow, selText: C.dark },
    ADVANCED: { fill: '#FEF2F2', border: '#FECACA', text: '#EF4444', selFill: '#EF4444', selText: C.white },
};

// ─── Shared primitives ─────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: C.tealLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Icon size={17} color={C.teal} />
        </div>
        <div>
            <p style={{ margin: 0, fontWeight: 600, color: C.text, fontSize: '13.5px' }}>{title}</p>
            {subtitle && <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textMuted }}>{subtitle}</p>}
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * SessionConfigModal
 *
 * Props:
 *   isOpen              – boolean
 *   onClose             – () => void
 *   onNext              – (sessionConfig: object) => void   (moves to summary step)
 *   slot                – availability slot object
 *   profile             – interviewer profile object with:
 *                           supported_interview_types, supported_experience_levels,
 *                           specializations, display_name
 */
const SessionConfigModal = ({ isOpen, onClose, onNext, slot, profile }) => {
    const [interviewType, setInterviewType] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const [candidateGoal, setCandidateGoal] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [candidateNotes, setCandidateNotes] = useState('');

    if (!isOpen || !slot || !profile) return null;

    // Dynamic options — filter by what the interviewer offers. Fall back to all if none configured.
    const supportedTypes = profile.supported_interview_types?.length
        ? profile.supported_interview_types
        : Object.keys(INTERVIEW_TYPE_LABELS);

    const supportedLevels = profile.supported_experience_levels?.length
        ? profile.supported_experience_levels
        : Object.keys(DIFFICULTY_LABELS);

    const interviewerSpecialties = profile.specializations || [];

    const toggleSpecialty = (spec) => {
        setSelectedSpecialties(prev =>
            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
        );
    };

    const handleNext = () => {
        if (!interviewType) {
            alert('Please select an interview type.');
            return;
        }
        if (!difficultyLevel) {
            alert('Please select an experience level.');
            return;
        }
        if (!candidateGoal) {
            alert('Please select your goal for this session.');
            return;
        }
        onNext({
            interview_type: interviewType,
            difficulty_level: difficultyLevel,
            candidate_goal: candidateGoal,
            selected_specialties: selectedSpecialties,
            candidate_notes: candidateNotes.trim(),
        });
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes scm-spin { to { transform: rotate(360deg); } }
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
                    background: C.white, borderRadius: '28px', maxWidth: '520px', width: '100%',
                    maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                    border: `1px solid ${C.grayBorder}`,
                    boxShadow: `0 28px 72px ${C.teal}22, 0 4px 20px rgba(0,0,0,0.09)`,
                }}>

                    {/* ── Header ── */}
                    <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${C.grayBorder}`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{
                                    display: 'inline-block', background: C.tealLight, color: C.teal,
                                    fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.09em',
                                    padding: '3px 11px', borderRadius: '20px', textTransform: 'uppercase', marginBottom: '8px',
                                }}>Step 1 of 2</span>
                                <h2 style={{ margin: '0 0 3px', fontSize: '21px', fontWeight: 700, color: C.dark }}>
                                    Configure Your Session
                                </h2>
                                <p style={{ margin: 0, fontSize: '13px', color: C.textMuted }}>
                                    Tell <span style={{ fontWeight: 600, color: C.text }}>{profile.display_name}</span> what you need
                                </p>
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
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 }}>

                        {/* 1. Interview Type */}
                        <section>
                            <SectionHeader icon={Target} title="Interview Type" subtitle="Choose the kind of session you want" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {supportedTypes.map(type => {
                                    const sel = interviewType === type;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setInterviewType(type)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '12px 14px', borderRadius: '16px',
                                                border: `1.5px solid ${sel ? C.teal : C.grayBorder}`,
                                                background: sel ? C.tealLight : C.white,
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                                                fontFamily: '"DM Sans", sans-serif',
                                            }}
                                        >
                                            <span style={{ fontSize: '17px' }}>{INTERVIEW_TYPE_ICONS[type] || '📋'}</span>
                                            <span style={{
                                                fontSize: '13px', lineHeight: 1.3,
                                                fontWeight: sel ? 600 : 500,
                                                color: sel ? C.teal : C.text,
                                            }}>
                                                {INTERVIEW_TYPE_LABELS[type] || type}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 2. Experience Level */}
                        <section>
                            <SectionHeader icon={Layers} title="Experience Level" subtitle="Match the difficulty to your background" />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {supportedLevels.map(level => {
                                    const cf = DIFF_CFG[level] || {};
                                    const sel = difficultyLevel === level;
                                    return (
                                        <button
                                            key={level}
                                            onClick={() => setDifficultyLevel(level)}
                                            style={{
                                                flex: 1, padding: '11px 0', borderRadius: '14px', cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                border: `1.5px solid ${sel ? cf.selFill : cf.border}`,
                                                background: sel ? cf.selFill : cf.fill,
                                                color: sel ? cf.selText : cf.text,
                                                fontWeight: 600, fontSize: '13.5px', fontFamily: '"DM Sans", sans-serif',
                                            }}
                                        >
                                            {DIFFICULTY_LABELS[level] || level}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 3. Focus Areas (multi-select chips) */}
                        {interviewerSpecialties.length > 0 && (
                            <section>
                                <SectionHeader
                                    icon={BookOpen}
                                    title="Focus Areas"
                                    subtitle="Pick topics to concentrate on (optional)"
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {interviewerSpecialties.map(spec => {
                                        const sel = selectedSpecialties.includes(spec);
                                        return (
                                            <button
                                                key={spec}
                                                onClick={() => toggleSpecialty(spec)}
                                                style={{
                                                    padding: '7px 14px', borderRadius: '20px',
                                                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                                    border: `1.5px solid ${sel ? C.teal : C.grayBorder}`,
                                                    background: sel ? C.teal : C.white,
                                                    color: sel ? C.white : C.text,
                                                    transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
                                                }}
                                            >
                                                {sel && <span style={{ marginRight: '4px' }}>✓</span>}
                                                {spec}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedSpecialties.length > 0 && (
                                    <p style={{ fontSize: '12px', color: C.teal, marginTop: '8px', fontWeight: 600 }}>
                                        {selectedSpecialties.length} topic{selectedSpecialties.length > 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </section>
                        )}

                        {/* 4. Candidate Goal */}
                        <section>
                            <SectionHeader icon={Target} title="Your Goal" subtitle="What do you want to achieve?" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {CANDIDATE_GOALS.map(g => {
                                    const sel = candidateGoal === g.value;
                                    return (
                                        <button
                                            key={g.value}
                                            onClick={() => setCandidateGoal(g.value)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '12px 14px', borderRadius: '16px',
                                                border: `1.5px solid ${sel ? C.yellow : C.grayBorder}`,
                                                background: sel ? C.yellowLight : C.white,
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                                                fontFamily: '"DM Sans", sans-serif',
                                            }}
                                        >
                                            <span style={{ fontSize: '17px' }}>{g.icon}</span>
                                            <span style={{
                                                fontSize: '13px', lineHeight: 1.3,
                                                fontWeight: sel ? 600 : 500,
                                                color: sel ? C.yellowDark : C.text,
                                            }}>
                                                {g.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 5. Notes (optional) */}
                        <section>
                            <SectionHeader
                                icon={MessageSquare}
                                title="Preparation Notes"
                                subtitle="Optional — share what to focus on"
                            />
                            <textarea
                                value={candidateNotes}
                                onChange={e => setCandidateNotes(e.target.value)}
                                maxLength={1000}
                                rows={3}
                                placeholder="e.g. Please focus on React hooks and Redux Toolkit. I'm weak on async patterns."
                                onFocus={e => (e.target.style.borderColor = C.teal)}
                                onBlur={e => (e.target.style.borderColor = C.grayBorder)}
                                style={{
                                    width: '100%', boxSizing: 'border-box', padding: '13px 16px',
                                    borderRadius: '16px', border: `1.5px solid ${C.grayBorder}`,
                                    fontSize: '13.5px', color: C.text, resize: 'none', outline: 'none',
                                    fontFamily: '"DM Sans", sans-serif', background: C.gray,
                                    lineHeight: 1.6, transition: 'border-color 0.15s',
                                }}
                            />
                            <p style={{ fontSize: '11.5px', color: C.textLight, textAlign: 'right', margin: '4px 0 0' }}>
                                {candidateNotes.length}/1000
                            </p>
                        </section>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.grayBorder}`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1, padding: '13px', border: `1.5px solid ${C.grayBorder}`,
                                    borderRadius: '18px', background: C.white, color: C.textMuted,
                                    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                                    fontFamily: '"DM Sans", sans-serif',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                style={{
                                    flex: 2, padding: '13px', border: 'none', borderRadius: '18px',
                                    background: C.teal, color: C.white, fontWeight: 700, fontSize: '14px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '6px', fontFamily: '"DM Sans", sans-serif',
                                    boxShadow: `0 4px 18px ${C.teal}44`,
                                }}
                            >
                                Review Summary <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default SessionConfigModal;