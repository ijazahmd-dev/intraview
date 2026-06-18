// src/features/feedback/interviewer/pages/SubmitEvaluation.jsx

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Star, X, ArrowLeft, CheckCircle, AlertCircle, Tag, Plus
} from 'lucide-react';

import { submitEvaluation } from '../interviewerFeedbackSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeText(raw) {
  if (!raw) return '';
  return raw.replace(/<[^>]+>/g, '');
}

function hasXSS(value) {
  const patterns = [/javascript\s*:/i, /on\w+\s*=/i, /<\s*script/i, /vbscript\s*:/i];
  return patterns.some(p => p.test(value));
}

// ─── StarRating (defined outside component to prevent remount) ────────────────

const STAR_LABELS = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

const StarRating = React.memo(({ value, onChange, label, error, touched }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const borderCls = touched
    ? value >= 1
      ? 'border-green-400 bg-green-50/30'
      : 'border-red-300 bg-red-50/30'
    : 'border-slate-200';

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all duration-200 ${borderCls}`}>
      <label className="text-sm font-semibold text-slate-700 block mb-3">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-7 h-7 transition-all duration-150 ${
                star <= display
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className={`ml-3 text-sm font-bold min-w-[90px] ${
          value >= 4 ? 'text-green-600' :
          value >= 3 ? 'text-blue-600' :
          value >= 2 ? 'text-yellow-600' :
          value >= 1 ? 'text-red-500' :
          'text-slate-400'
        }`}>
          {value ? `${value}/5 — ${STAR_LABELS[value]}` : 'Not rated'}
        </span>
      </div>
      {touched && error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {touched && value >= 1 && !error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          Rating recorded
        </p>
      )}
    </div>
  );
});

// ─── TopicTagInput (defined outside component to prevent remount) ─────────────

const TopicTagInput = React.memo(({ topics, onChange, error, touched }) => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const inputRef = useRef(null);

  const addTopic = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) { setInputError('Topic cannot be empty.'); return; }
    if (trimmed.length < 2) { setInputError('Minimum 2 characters.'); return; }
    if (trimmed.length > 50) { setInputError('Maximum 50 characters.'); return; }
    if (topics.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('Topic already added.');
      return;
    }
    if (topics.length >= 20) { setInputError('Maximum 20 topics.'); return; }
    if (hasXSS(trimmed)) { setInputError('Invalid characters.'); return; }
    setInputError('');
    setInputValue('');
    onChange([...topics, trimmed]);
  }, [inputValue, topics, onChange]);

  const removeTopic = useCallback((index) => {
    onChange(topics.filter((_, i) => i !== index));
  }, [topics, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTopic(); }
  }, [addTopic]);

  const borderCls = touched
    ? topics.length >= 1 ? 'border-green-400' : 'border-red-400'
    : 'border-slate-200';

  return (
    <div className="space-y-3">
      <div className={`border-2 rounded-2xl p-4 transition-all duration-200 ${borderCls}`}>
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {topics.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
              >
                <Tag className="w-3 h-3" />
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic(i)}
                  className="ml-0.5 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${topic}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setInputError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a topic and press Enter…"
            maxLength={51}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
          <button
            type="button"
            onClick={addTopic}
            disabled={topics.length >= 20}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {inputError && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {inputError}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={topics.length >= 1 ? 'text-green-600 font-medium' : 'text-slate-400'}>
          {topics.length} / 20 topics added
        </span>
        {touched && topics.length < 1 && (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </span>
        )}
        {touched && topics.length >= 1 && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Topics added
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Examples: <span className="text-slate-400">React Hooks, System Design, Binary Search, Django ORM, Redis, AWS</span>
      </p>
    </div>
  );
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validateField(name, value) {
  switch (name) {
    case 'technical_score':
      return value >= 1 ? '' : 'Please rate Technical Skills.';
    case 'communication_score':
      return value >= 1 ? '' : 'Please rate Communication & Clarity.';
    case 'problem_solving_score':
      return value >= 1 ? '' : 'Please rate Problem Solving Ability.';
    case 'confidence_score':
      return value >= 1 ? '' : 'Please rate Confidence & Composure.';
    case 'hire_recommendation':
      return value ? '' : 'Please select a hiring recommendation.';
    case 'interview_difficulty':
      return value ? '' : 'Please select interview difficulty.';
    case 'strengths': {
      const v = value.trim();
      if (!v) return 'Please provide candidate strengths.';
      if (v.length < 30) return `Minimum 30 characters. (${v.length}/30)`;
      if (v.length > 500) return 'Cannot exceed 500 characters.';
      if (hasXSS(v)) return 'Contains invalid content.';
      return '';
    }
    case 'areas_for_improvement': {
      const v = value.trim();
      if (!v) return 'Please provide areas for improvement.';
      if (v.length < 30) return `Minimum 30 characters. (${v.length}/30)`;
      if (v.length > 500) return 'Cannot exceed 500 characters.';
      if (hasXSS(v)) return 'Contains invalid content.';
      return '';
    }
    case 'actionable_suggestions': {
      const v = value.trim();
      if (!v) return 'Please provide actionable recommendations.';
      if (v.length < 30) return `Minimum 30 characters. (${v.length}/30)`;
      if (v.length > 500) return 'Cannot exceed 500 characters.';
      if (hasXSS(v)) return 'Contains invalid content.';
      return '';
    }
    case 'additional_notes': {
      const v = (value || '').trim();
      if (v.length > 500) return 'Cannot exceed 500 characters.';
      if (hasXSS(v)) return 'Contains invalid content.';
      return '';
    }
    case 'topics_covered':
      return value.length >= 1 ? '' : 'Add at least one topic covered.';
    default:
      return '';
  }
}

const ALL_REQUIRED_FIELDS = [
  'technical_score', 'communication_score', 'problem_solving_score', 'confidence_score',
  'hire_recommendation', 'interview_difficulty',
  'strengths', 'areas_for_improvement', 'actionable_suggestions',
  'topics_covered',
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SubmitEvaluation = ({ bookingId, bookingData, onClose, isOpen = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submitting } = useSelector(state => state.feedback);

  const [formData, setFormData] = useState({
    technical_score: 0,
    communication_score: 0,
    problem_solving_score: 0,
    confidence_score: 0,
    hire_recommendation: '',
    strengths: '',
    areas_for_improvement: '',
    actionable_suggestions: '',
    additional_notes: '',
    interview_difficulty: '',
    topics_covered: [],
  });

  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  // Display-only score preview (integers only go to backend)
  const overallScore = useMemo(() => {
    const { technical_score: t, communication_score: c, problem_solving_score: p, confidence_score: f } = formData;
    if (!t || !c || !p || !f) return null;
    return ((t + c + p + f) / 4).toFixed(1);
  }, [formData.technical_score, formData.communication_score, formData.problem_solving_score, formData.confidence_score]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const markTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitized = sanitizeText(value);
    setFormData(prev => ({ ...prev, [name]: sanitized }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, sanitized) }));
    }
  }, [touched]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    markTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }, [markTouched]);

  const handleStarChange = useCallback((name, val) => {
    setFormData(prev => ({ ...prev, [name]: val }));
    markTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, val) }));
  }, [markTouched]);

  const handleTopicsChange = useCallback((newTopics) => {
    setFormData(prev => ({ ...prev, topics_covered: newTopics }));
    markTouched('topics_covered');
    setErrors(prev => ({ ...prev, topics_covered: validateField('topics_covered', newTopics) }));
  }, [markTouched]);

  const handleSelectChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    markTouched(name);
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }, [markTouched]);

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Touch everything and compute all errors
    const newTouched = {};
    const newErrors  = {};
    ALL_REQUIRED_FIELDS.forEach(name => {
      newTouched[name] = true;
      newErrors[name]  = validateField(name, formData[name]);
    });
    setTouched(newTouched);
    setErrors(newErrors);

    const hasErrors = ALL_REQUIRED_FIELDS.some(n => newErrors[n]);
    if (hasErrors) {
      toast.error('Please fix all errors before submitting.');
      setTimeout(() => {
        const firstError = document.querySelector('[data-has-error="true"]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    try {
      await dispatch(submitEvaluation({ bookingId, data: formData })).unwrap();
      toast.success('Evaluation submitted successfully!');
      if (onClose) onClose();
      else navigate('/interviewer/dashboard?evaluation-submitted=true');
    } catch {
      // Error toast handled in the thunk
    }
  }, [formData, bookingId, dispatch, navigate, onClose]);

  if (!isOpen) return null;

  const scoreLabel = overallScore
    ? Number(overallScore) >= 4 ? 'Excellent'
    : Number(overallScore) >= 3 ? 'Good'
    : Number(overallScore) >= 2 ? 'Average'
    : 'Needs Improvement'
    : 'Not yet rated';

  const errorCount = ALL_REQUIRED_FIELDS.filter(n => touched[n] && errors[n]).length;

  const candidateName = bookingData?.booking?.candidate_name;

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT: Full-page (no fixed/overflow tricks). The page itself scrolls.
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">

      {/* ── Sticky Topbar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onClose?.() || navigate(-1)}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Submit Candidate Evaluation</h1>
              <p className="text-slate-500 text-sm">
                {candidateName ? `Evaluating: ${candidateName}` : 'Detailed feedback for your interview session'}
              </p>
            </div>
          </div>

          {/* Score badge in topbar */}
          {overallScore && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
              <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span className="text-2xl font-black text-slate-900">{overallScore}</span>
              <span className="text-xs text-slate-500">/ 5.0</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                Number(overallScore) >= 4 ? 'bg-emerald-100 text-emerald-800' :
                Number(overallScore) >= 3 ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>{scoreLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Page Content (natural document scroll) ─────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10 pb-32">

        {/* Overall Score Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Overall Score Preview</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900">{overallScore ?? '—'}</span>
                  <span className="text-slate-400 text-lg">/ 5.0</span>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              !overallScore ? 'bg-slate-100 text-slate-500' :
              Number(overallScore) >= 4 ? 'bg-emerald-100 text-emerald-800' :
              Number(overallScore) >= 3 ? 'bg-blue-100 text-blue-800' :
              Number(overallScore) >= 2 ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              {scoreLabel}
            </div>
          </div>
          {!overallScore && (
            <p className="mt-3 text-xs text-slate-400">Rate all four performance categories below to see your overall score.</p>
          )}
        </div>

        {/* ── 1. Performance Ratings ────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <div className="w-1.5 h-7 bg-gradient-to-b from-blue-500 to-indigo-600 rounded flex-shrink-0" />
            Performance Ratings
            <span className="text-xs text-slate-400 font-normal">All four required</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'technical_score', label: 'Technical Skills' },
              { name: 'communication_score', label: 'Communication & Clarity' },
              { name: 'problem_solving_score', label: 'Problem Solving Ability' },
              { name: 'confidence_score', label: 'Confidence & Composure' },
            ].map(({ name, label }) => (
              <div key={name} data-has-error={!!(touched[name] && errors[name])}>
                <StarRating
                  label={label}
                  value={formData[name]}
                  onChange={val => handleStarChange(name, val)}
                  error={errors[name]}
                  touched={touched[name]}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. Hiring Recommendation ──────────────────────────────────────── */}
        <section
          className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8 space-y-5"
          data-has-error={!!(touched.hire_recommendation && errors.hire_recommendation)}
        >
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <div className="w-1.5 h-7 bg-gradient-to-b from-emerald-500 to-green-600 rounded flex-shrink-0" />
            Hiring Recommendation <span className="text-red-500 text-sm">*</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { value: 'STRONG_YES', label: 'Strong Yes', subtitle: 'Hire immediately', color: 'from-emerald-500 to-green-500', ring: 'ring-emerald-400' },
              { value: 'YES',        label: 'Yes',        subtitle: 'Minor concerns',    color: 'from-blue-500 to-indigo-500',   ring: 'ring-blue-400' },
              { value: 'MAYBE',      label: 'Maybe',      subtitle: 'Needs improvement', color: 'from-amber-500 to-orange-500',  ring: 'ring-amber-400' },
              { value: 'NO',         label: 'No',         subtitle: 'Not ready yet',     color: 'from-orange-500 to-red-500',    ring: 'ring-orange-400' },
              { value: 'STRONG_NO',  label: 'Strong No',  subtitle: 'Significant gaps',  color: 'from-red-500 to-rose-500',     ring: 'ring-red-400' },
            ].map(({ value, label, subtitle, color, ring }) => {
              const selected = formData.hire_recommendation === value;
              return (
                <label key={value} className="group cursor-pointer">
                  <input
                    type="radio"
                    name="hire_recommendation"
                    value={value}
                    className="sr-only"
                    checked={selected}
                    onChange={handleSelectChange}
                  />
                  <div className={`
                    p-5 rounded-2xl border-2 transition-all duration-200 text-center
                    group-hover:scale-[1.02] group-hover:shadow-md
                    ${selected
                      ? `bg-gradient-to-br ${color} border-transparent shadow-xl ring-2 ${ring} ring-offset-2 scale-[1.02]`
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }
                  `}>
                    <div className={`font-bold text-base leading-tight ${selected ? 'text-white' : 'text-slate-800'}`}>{label}</div>
                    <div className={`text-xs mt-1 ${selected ? 'text-white/80' : 'text-slate-500'}`}>{subtitle}</div>
                  </div>
                </label>
              );
            })}
          </div>
          {touched.hire_recommendation && errors.hire_recommendation && (
            <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.hire_recommendation}
            </div>
          )}
          {touched.hire_recommendation && !errors.hire_recommendation && (
            <p className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" /> Recommendation recorded
            </p>
          )}
        </section>

        {/* ── 3. Detailed Feedback ──────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <div className="w-1.5 h-7 bg-gradient-to-b from-purple-500 to-pink-500 rounded flex-shrink-0" />
            Detailed Feedback
          </h2>
          {[
            {
              name: 'strengths',
              label: 'Candidate Strengths',
              placeholder: 'What did the candidate excel at? Be specific about technical skills demonstrated, problem-solving approaches, communication style, etc.',
              rows: 4,
            },
            {
              name: 'areas_for_improvement',
              label: 'Areas for Improvement',
              placeholder: 'What needs work? Focus on specific skills, knowledge gaps, or behaviors observed during the interview.',
              rows: 4,
            },
            {
              name: 'actionable_suggestions',
              label: 'Actionable Next Steps',
              placeholder: 'Concrete recommendations: practice dynamic programming, study system design, strengthen communication structure, etc.',
              rows: 4,
            },
          ].map(({ name, label, placeholder, rows }) => {
            const charCount = formData[name].length;
            const isValid   = touched[name] && !errors[name] && charCount >= 30;
            const isInvalid = touched[name] && !!errors[name];
            return (
              <div key={name} data-has-error={isInvalid}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs font-medium tabular-nums ${
                    charCount > 500 ? 'text-red-600' :
                    charCount >= 30  ? 'text-green-600' :
                    charCount > 0    ? 'text-amber-600' :
                    'text-slate-400'
                  }`}>
                    {charCount} / 500
                  </span>
                </div>
                <textarea
                  name={name}
                  rows={rows}
                  value={formData[name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  className={`w-full p-4 border-2 rounded-2xl resize-none text-sm leading-relaxed
                    focus:outline-none focus:ring-4 transition-all placeholder-slate-400
                    ${isValid   ? 'border-green-400 bg-green-50/20 focus:ring-green-500/20 focus:border-green-500' :
                      isInvalid ? 'border-red-400 bg-red-50/30 focus:ring-red-500/20 focus:border-red-400' :
                                  'border-slate-200 hover:border-slate-300 focus:ring-blue-500/20 focus:border-blue-400'}
                  `}
                />
                {isInvalid && (
                  <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{errors[name]}</span>
                  </div>
                )}
                {isValid && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" /> Looks good
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {/* ── 4. Interview Context ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Difficulty */}
          <section
            className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8"
            data-has-error={!!(touched.interview_difficulty && errors.interview_difficulty)}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Interview Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              name="interview_difficulty"
              value={formData.interview_difficulty}
              onChange={handleSelectChange}
              onBlur={handleBlur}
              className={`w-full p-4 border-2 rounded-2xl bg-white focus:outline-none focus:ring-4 transition-all text-sm
                ${touched.interview_difficulty && !errors.interview_difficulty
                  ? 'border-green-400 bg-green-50/20 focus:ring-green-500/20 focus:border-green-500'
                  : touched.interview_difficulty && errors.interview_difficulty
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500/20'
                  : 'border-slate-200 hover:border-slate-300 focus:ring-blue-500/20 focus:border-blue-400'
                }`}
            >
              <option value="">Select difficulty level</option>
              <option value="EASY">🟢 Easy — Freshers / Junior roles</option>
              <option value="MEDIUM">🟡 Medium — 2–4 years experience</option>
              <option value="HARD">🟠 Hard — Senior roles</option>
              <option value="EXPERT">🔴 Expert — Staff / Lead roles</option>
            </select>
            {touched.interview_difficulty && errors.interview_difficulty && (
              <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{errors.interview_difficulty}</span>
              </div>
            )}
            {touched.interview_difficulty && !errors.interview_difficulty && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" /> Difficulty recorded
              </p>
            )}
          </section>

          {/* Topics */}
          <section
            className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8"
            data-has-error={!!(touched.topics_covered && errors.topics_covered)}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Topics Covered <span className="text-red-500">*</span>
            </label>
            <TopicTagInput
              topics={formData.topics_covered}
              onChange={handleTopicsChange}
              error={errors.topics_covered}
              touched={touched.topics_covered}
            />
          </section>
        </div>

        {/* ── 5. Additional Notes ───────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700">
              Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className={`text-xs font-medium tabular-nums ${
              (formData.additional_notes?.length || 0) > 500 ? 'text-red-600' : 'text-slate-400'
            }`}>
              {formData.additional_notes?.length || 0} / 500
            </span>
          </div>
          <textarea
            name="additional_notes"
            rows={3}
            value={formData.additional_notes}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Any other observations, behavioral notes, or context that might be helpful…"
            className={`w-full p-4 border-2 rounded-2xl resize-none text-sm
              focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-slate-400
              ${touched.additional_notes && errors.additional_notes
                ? 'border-red-400 bg-red-50/30'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
              }`}
          />
          {touched.additional_notes && errors.additional_notes && (
            <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{errors.additional_notes}</span>
            </div>
          )}
        </section>

      </div>

      {/* ── Sticky Footer ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/70 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4">
          {errorCount > 0 && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">
                {errorCount} field{errorCount > 1 ? 's' : ''} need{errorCount === 1 ? 's' : ''} attention — scroll up to review
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onClose?.() || navigate(-1)}
              disabled={submitting}
              className="px-8 py-3 text-slate-700 font-semibold bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl rounded-2xl transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 min-w-[190px] justify-center"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SubmitEvaluation;
