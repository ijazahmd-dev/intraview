import React, { useState } from 'react';
import { X, ChevronRight, Target, Layers, BookOpen, MessageSquare } from 'lucide-react';

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


// ─── Helper ────────────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
            <p className="font-semibold text-slate-900 text-sm">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">

                {/* ── Header ── */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">Step 1 of 2</p>
                        <h2 className="text-xl font-bold text-slate-900">Configure Your Session</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Tell <span className="font-semibold">{profile.display_name}</span> what you need
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-6 space-y-7 flex-1">

                    {/* 1. Interview Type */}
                    <section>
                        <SectionHeader icon={Target} title="Interview Type" subtitle="Select the type of interview you want" />
                        <div className="grid grid-cols-2 gap-2">
                            {supportedTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setInterviewType(type)}
                                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm font-medium text-left transition-all ${interviewType === type
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                                        }`}
                                >
                                    <span className="text-base">{INTERVIEW_TYPE_ICONS[type] || '📋'}</span>
                                    <span className="leading-tight">{INTERVIEW_TYPE_LABELS[type] || type}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 2. Experience Level */}
                    <section>
                        <SectionHeader icon={Layers} title="Experience Level" subtitle="Select the difficulty that matches your background" />
                        <div className="flex gap-3">
                            {supportedLevels.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setDifficultyLevel(level)}
                                    className={`flex-1 py-2.5 px-4 rounded-2xl border-2 text-sm font-semibold transition-all ${difficultyLevel === level
                                            ? DIFFICULTY_SELECTED_COLORS[level]
                                            : DIFFICULTY_COLORS[level]
                                        }`}
                                >
                                    {DIFFICULTY_LABELS[level] || level}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 3. Focus Areas (multi-select chips) */}
                    {interviewerSpecialties.length > 0 && (
                        <section>
                            <SectionHeader
                                icon={BookOpen}
                                title="Focus Areas"
                                subtitle="Pick topics you want to focus on (multi-select)"
                            />
                            <div className="flex flex-wrap gap-2">
                                {interviewerSpecialties.map(spec => (
                                    <button
                                        key={spec}
                                        onClick={() => toggleSpecialty(spec)}
                                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${selectedSpecialties.includes(spec)
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
                                            }`}
                                    >
                                        {selectedSpecialties.includes(spec) && <span className="mr-1">✓</span>}
                                        {spec}
                                    </button>
                                ))}
                            </div>
                            {selectedSpecialties.length > 0 && (
                                <p className="text-xs text-indigo-600 mt-2 font-medium">
                                    {selectedSpecialties.length} topic{selectedSpecialties.length > 1 ? 's' : ''} selected
                                </p>
                            )}
                        </section>
                    )}

                    {/* 4. Candidate Goal */}
                    <section>
                        <SectionHeader icon={Target} title="Your Goal" subtitle="What do you want to achieve?" />
                        <div className="grid grid-cols-2 gap-2">
                            {CANDIDATE_GOALS.map(g => (
                                <button
                                    key={g.value}
                                    onClick={() => setCandidateGoal(g.value)}
                                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-sm text-left transition-all ${candidateGoal === g.value
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                                        }`}
                                >
                                    <span className="text-base">{g.icon}</span>
                                    <span className="leading-tight font-medium">{g.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 5. Notes (optional) */}
                    <section>
                        <SectionHeader
                            icon={MessageSquare}
                            title="Preparation Notes"
                            subtitle="Optional — tell the interviewer what to focus on"
                        />
                        <textarea
                            value={candidateNotes}
                            onChange={e => setCandidateNotes(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="e.g. Please focus on React hooks and Redux Toolkit. I'm weak on async patterns."
                            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm text-slate-700 placeholder:text-slate-400 resize-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">{candidateNotes.length}/1000</p>
                    </section>
                </div>

                {/* ── Footer ── */}
                <div className="p-6 pt-4 border-t border-slate-100 flex-shrink-0">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            Review Summary
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionConfigModal;
