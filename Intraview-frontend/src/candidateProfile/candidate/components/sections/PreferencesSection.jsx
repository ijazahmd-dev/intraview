// src/pages/candidate/components/sections/PreferencesSection.jsx
import React, { useEffect } from 'react';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { Loader2, AlertCircle } from 'lucide-react';

const INTERVIEW_TYPES = [
  { value: 'HR', label: '🎤 HR Interview' },
  { value: 'TECHNICAL', label: '💻 Technical' },
  { value: 'SYSTEM_DESIGN', label: '🏗️ System Design' },
  { value: 'DSA', label: '📊 DSA/Algorithms' },
  { value: 'BEHAVIORAL', label: '🤝 Behavioral' },
];

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
];

const PreferencesSection = () => {
  const {
    candidateProfile,
    isUpdatingProfile,
    handleUpdateProfile,
  } = useProfileData();

  const initialData = {
    preferred_interview_types:
      Array.isArray(candidateProfile?.preferred_interview_types)
        ? candidateProfile.preferred_interview_types
        : [],
    preferred_difficulty:
      candidateProfile?.preferred_difficulty || 'INTERMEDIATE',
    preferred_duration: candidateProfile?.preferred_duration || 60,
    interviewer_notes: candidateProfile?.interviewer_notes || '',
  };

  const {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    handleArrayChange,
    setFieldValue,
    getFieldError,
    isSubmitting,
    isDirty,
    resetForm,
  } = useProfileForm(initialData, async (data) => {
    await handleUpdateProfile(data);
  });

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateProfile?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  const toggleInterviewType = (type) => {
    const current = Array.isArray(formData.preferred_interview_types)
      ? formData.preferred_interview_types
      : [];
    if (current.includes(type)) {
      handleArrayChange(
        'preferred_interview_types',
        current.filter((t) => t !== type)
      );
    } else {
      handleArrayChange('preferred_interview_types', [...current, type]);
    }
  };

  const selectedInterviewTypes = Array.isArray(formData.preferred_interview_types)
    ? formData.preferred_interview_types
    : [];

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Interview preferences</h3>
          <p className="text-xs text-slate-500 mt-1">
            Customize your interview experience. These preferences help us match you with suitable interviewers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interview Types */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-3">
            What type of interview do you prefer?
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {INTERVIEW_TYPES.map((item) => {
              const isSelected = selectedInterviewTypes.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleInterviewType(item.value)}
                  disabled={disabled}
                  className={`p-3 rounded-2xl text-sm font-medium border-2 transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {selectedInterviewTypes.length === 0 && (
            <div className="mt-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600">
                Select at least one interview type
              </p>
            </div>
          )}
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-3">
            Preferred difficulty level
          </label>
          <div className="grid sm:grid-cols-3 gap-2">
            {DIFFICULTIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFieldValue('preferred_difficulty', item.value)
                }
                disabled={disabled}
                className={`p-3 rounded-2xl text-sm font-medium border-2 transition-all ${
                  formData.preferred_difficulty === item.value
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            💡 <span className="font-semibold">Beginner:</span> Fundamentals & easy questions |{' '}
            <span className="font-semibold">Intermediate:</span> Real-world scenarios |{' '}
            <span className="font-semibold">Advanced:</span> Complex problem-solving
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-3">
            Preferred interview duration
          </label>
          <div className="grid sm:grid-cols-3 gap-2">
            {DURATIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFieldValue('preferred_duration', item.value)}
                disabled={disabled}
                className={`p-3 rounded-2xl text-sm font-medium border-2 transition-all ${
                  formData.preferred_duration === item.value
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            💡 Longer interviews allow for deeper discussions
          </p>
        </div>

        {/* Notes for Interviewer */}
        <div>
          <label htmlFor="interviewer_notes" className="block text-xs font-semibold text-slate-600 mb-1">
            Additional notes for interviewer
          </label>
          <textarea
            id="interviewer_notes"
            name="interviewer_notes"
            value={formData.interviewer_notes || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            rows={4}
            maxLength={500}
            placeholder="Example: I want focus on React hooks and system design. I'm weak in database optimization but strong in frontend. Please focus on my strengths too."
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-[11px] text-slate-500">
              💡 Help the interviewer prepare better questions
            </p>
            <p className="text-[11px] text-slate-400">
              {(formData.interviewer_notes || '').length}/500
            </p>
          </div>
          {getFieldError('interviewer_notes') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('interviewer_notes')}
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
          <button
            type="button"
            disabled={disabled || !isDirty}
            onClick={resetForm}
            className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={disabled || !isDirty || selectedInterviewTypes.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
          >
            {(isSubmitting || isUpdatingProfile) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferencesSection;
