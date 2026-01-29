// src/pages/candidate/components/sections/BasicInfoSection.jsx
import React, { useEffect } from 'react';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { Loader2 } from 'lucide-react';

const BasicInfoSection = () => {
  const {
    user,
    candidateProfile,
    isUpdatingProfile,
    handleUpdateProfile,
  } = useProfileData();

  const initialData = {
    user_first_name: user?.firstName || '',
    user_last_name: user?.lastName || '',
    full_name: candidateProfile?.full_name || '',
    phone: candidateProfile?.phone || '',
    location: candidateProfile?.location || '',
    timezone: candidateProfile?.timezone || 'Asia/Kolkata',
  };

  const {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    isSubmitting,
    isDirty,
    resetForm,
  } = useProfileForm(initialData, async (data) => {
    await handleUpdateProfile(data);
  });

  // keep form in sync if profile reloads
  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateProfile?.id, user?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Basic information</h3>
          <p className="text-xs text-slate-500 mt-1">
            Keep your personal details up to date.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 text-sm">
        {/* First name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            First name
          </label>
          <input
            type="text"
            name="user_first_name"
            value={formData.user_first_name || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="John"
            disabled={disabled}
          />
          {getFieldError('user_first_name') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('user_first_name')}
            </p>
          )}
        </div>

        {/* Last name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Last name
          </label>
          <input
            type="text"
            name="user_last_name"
            value={formData.user_last_name || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Doe"
            disabled={disabled}
          />
          {getFieldError('user_last_name') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('user_last_name')}
            </p>
          )}
        </div>

        {/* Full name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Display name (full name)
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="John Doe"
            disabled={disabled}
          />
          {getFieldError('full_name') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('full_name')}
            </p>
          )}
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Email is your login and cannot be changed here.
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Phone number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="+91 98765 43210"
            disabled={disabled}
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('phone')}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Kozhikode, Kerala"
            disabled={disabled}
          />
          {getFieldError('location') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('location')}
            </p>
          )}
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Timezone
          </label>
          <select
            name="timezone"
            value={formData.timezone || 'Asia/Kolkata'}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="Asia/Kolkata">(GMT+5:30) India Standard Time</option>
            <option value="Asia/Dubai">(GMT+4:00) Gulf Standard Time</option>
            <option value="Europe/London">(GMT+0:00) UK / London</option>
            <option value="America/New_York">(GMT-5:00) US / Eastern</option>
          </select>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
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

export default BasicInfoSection;
