// src/pages/candidate/components/sections/CareerInfoSection.jsx
import React, { useEffect } from 'react';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { Loader2 } from 'lucide-react';

const EXPERIENCE_LEVELS = [
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'JUNIOR', label: 'Junior (0–2 years)' },
  { value: 'MID', label: 'Mid-level (2–5 years)' },
  { value: 'SENIOR', label: 'Senior (5+ years)' },
];

const PREFERRED_TYPES = [
  { value: 'HR', label: 'HR' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'SYSTEM_DESIGN', label: 'System design' },
  { value: 'DSA', label: 'DSA' },
  { value: 'BEHAVIORAL', label: 'Behavioral' },
];

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const DURATIONS = [30, 45, 60];

const CareerInfoSection = () => {
  const {
    candidateProfile,
    isUpdatingProfile,
    handleUpdateProfile,
  } = useProfileData();

  const initialData = {
    current_status: candidateProfile?.current_status || '',
    current_role: candidateProfile?.current_role || '',
    target_role: candidateProfile?.target_role || '',
    experience_level: candidateProfile?.experience_level || '',
    years_experience:
      candidateProfile?.years_experience !== null &&
      candidateProfile?.years_experience !== undefined
        ? candidateProfile.years_experience
        : '',
    skills: Array.isArray(candidateProfile?.skills)
      ? candidateProfile.skills
      : [],
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
    const cleaned = {
      ...data,
      years_experience:
        data.years_experience === '' ? null : Number(data.years_experience),
      preferred_duration: Number(data.preferred_duration),
      skills:
        Array.isArray(data.skills) && data.skills.length
          ? data.skills
          : [],
      preferred_interview_types:
        Array.isArray(data.preferred_interview_types)
          ? data.preferred_interview_types
          : [],
    };
    await handleUpdateProfile(cleaned);
  });

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateProfile?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  // skill input local state pattern: no separate hook to keep it simple
  const [skillInput, setSkillInput] = React.useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    const existing = Array.isArray(formData.skills) ? formData.skills : [];
    if (existing.find((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkillInput('');
      return;
    }
    handleArrayChange('skills', [...existing, value]);
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    const existing = Array.isArray(formData.skills) ? formData.skills : [];
    handleArrayChange(
      'skills',
      existing.filter((s) => s !== skill)
    );
  };

  const togglePreferredType = (value) => {
    const list = Array.isArray(formData.preferred_interview_types)
      ? formData.preferred_interview_types
      : [];
    if (list.includes(value)) {
      handleArrayChange(
        'preferred_interview_types',
        list.filter((v) => v !== value)
      );
    } else {
      handleArrayChange('preferred_interview_types', [...list, value]);
    }
  };

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Career & interview profile</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tell us what you do and what you are aiming for.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Current status
            </label>
            <select
              name="current_status"
              value={formData.current_status || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">Select status</option>
              <option value="Student">Student</option>
              <option value="Fresher">Fresher</option>
              <option value="Working">Working Professional</option>
              <option value="Career Switcher">Career switcher</option>
            </select>
          </div>

          {/* Current role */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Current role
            </label>
            <input
              type="text"
              name="current_role"
              value={formData.current_role || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Software Engineer, Student, etc."
            />
          </div>

          {/* Target role */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Target role
            </label>
            <input
              type="text"
              name="target_role"
              value={formData.target_role || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Frontend Developer, ML Engineer, etc."
            />
            {getFieldError('target_role') && (
              <p className="mt-1 text-xs text-rose-600">
                {getFieldError('target_role')}
              </p>
            )}
          </div>

          {/* Experience level */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Experience level
            </label>
            <select
              name="experience_level"
              value={formData.experience_level || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">Select experience</option>
              {EXPERIENCE_LEVELS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Years of experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Years of experience
            </label>
            <input
              type="number"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              onBlur={handleBlur}
              min={0}
              max={100}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="0"
            />
            {getFieldError('years_experience') && (
              <p className="mt-1 text-xs text-rose-600">
                {getFieldError('years_experience')}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Primary skills
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.isArray(formData.skills) && formData.skills.length > 0 ? (
              formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                Add at least 3 skills you want to be interviewed on.
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="React, Django, DSA…"
              disabled={disabled}
              className="flex-1 px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <button
              type="button"
              onClick={addSkill}
              disabled={disabled}
              className="px-3 py-2 rounded-2xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {getFieldError('skills') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('skills')}
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Preferred interview types
            </label>
            <div className="flex flex-wrap gap-2">
              {PREFERRED_TYPES.map((item) => {
                const active =
                  formData.preferred_interview_types?.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => togglePreferredType(item.value)}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Preferred duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFieldValue('preferred_duration', d)}
                  disabled={disabled}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                    Number(formData.preferred_duration) === d
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Preferred difficulty
          </label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFieldValue('preferred_difficulty', item.value)
                }
                disabled={disabled}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                  formData.preferred_difficulty === item.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Notes for interviewer
          </label>
          <textarea
            name="interviewer_notes"
            value={formData.interviewer_notes || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            rows={4}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            placeholder="Example: I want more focus on React hooks, system design basics, and project discussion."
          />
          {getFieldError('interviewer_notes') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('interviewer_notes')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
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
            disabled={disabled || !isDirty}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
          >
            {(isSubmitting || isUpdatingProfile) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareerInfoSection;
