// src/pages/candidate/components/sections/LinksSection.jsx
import React, { useEffect } from 'react';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { Github, Linkedin, Globe, Loader2, AlertCircle } from 'lucide-react';

// URL validation helpers
const validateUrls = {
  github: (url) => {
    if (!url) return true; // Optional field
    const regex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
    return regex.test(url);
  },
  linkedin: (url) => {
    if (!url) return true; // Optional field
    const regex = /(https?:\/\/(www\.)?linkedin\.com\/(mwlite\/|m\/)?in\/[a-zA-Z0-9_.-]+\/?)/;
    return regex.test(url);
  },
  portfolio: (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return url.startsWith('https://') || url.startsWith('http://');
    } catch {
      return false;
    }
  },
};

const LinksSection = () => {
  const {
    candidateProfile,
    isUpdatingProfile,
    handleUpdateProfile,
  } = useProfileData();

  const initialData = {
    github_url: candidateProfile?.github_url || '',
    linkedin_url: candidateProfile?.linkedin_url || '',
    portfolio_url: candidateProfile?.portfolio_url || '',
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
    errors,
    setFieldValue,
  } = useProfileForm(initialData, async (data) => {
    // Validate all URLs
    if (data.github_url && !validateUrls.github(data.github_url)) {
      // Return error but don't submit
      return;
    }
    if (data.linkedin_url && !validateUrls.linkedin(data.linkedin_url)) {
      return;
    }
    if (data.portfolio_url && !validateUrls.portfolio(data.portfolio_url)) {
      return;
    }

    await handleUpdateProfile(data);
  });

  // Sync form when profile data changes
  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateProfile?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  // Real-time URL validation
  const getUrlError = (fieldName, value) => {
    if (!value) return null;
    
    switch (fieldName) {
      case 'github_url':
        if (!validateUrls.github(value)) {
          return 'Invalid GitHub URL (e.g., https://github.com/username)';
        }
        break;
      case 'linkedin_url':
        if (!validateUrls.linkedin(value)) {
          return 'Invalid LinkedIn URL (e.g., https://www.linkedin.com/in/username)';
        }
        break;
      case 'portfolio_url':
        if (!validateUrls.portfolio(value)) {
          return 'Invalid URL (must start with https:// or http://)';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const githubError = getUrlError('github_url', formData.github_url);
  const linkedinError = getUrlError('linkedin_url', formData.linkedin_url);
  const portfolioError = getUrlError('portfolio_url', formData.portfolio_url);

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Professional links</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add links to your GitHub, LinkedIn, and portfolio. These help interviewers learn more about you.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* GitHub URL */}
        <div>
          <label htmlFor="github_url" className="block text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub profile
            </span>
          </label>
          <input
            id="github_url"
            type="url"
            name="github_url"
            value={formData.github_url || ''}
            onChange={(e) => {
              handleChange(e);
            }}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="https://github.com/username"
            className={`w-full px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 text-sm transition-all ${
              githubError
                ? 'border-rose-200 focus:ring-rose-500'
                : 'border-slate-200 focus:ring-indigo-500'
            }`}
          />
          {githubError && (
            <div className="mt-1 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-600">{githubError}</p>
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-1.5">
            💡 Example: https://github.com/yourname
          </p>
        </div>

        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedin_url" className="block text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn profile
            </span>
          </label>
          <input
            id="linkedin_url"
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="https://www.linkedin.com/in/username"
            className={`w-full px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 text-sm transition-all ${
              linkedinError
                ? 'border-rose-200 focus:ring-rose-500'
                : 'border-slate-200 focus:ring-indigo-500'
            }`}
          />
          {linkedinError && (
            <div className="mt-1 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-600">{linkedinError}</p>
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-1.5">
            💡 Example: https://www.linkedin.com/in/yourname
          </p>
        </div>

        {/* Portfolio URL */}
        <div>
          <label htmlFor="portfolio_url" className="block text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Portfolio website
            </span>
          </label>
          <input
            id="portfolio_url"
            type="url"
            name="portfolio_url"
            value={formData.portfolio_url || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="https://yourportfolio.com"
            className={`w-full px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 text-sm transition-all ${
              portfolioError
                ? 'border-rose-200 focus:ring-rose-500'
                : 'border-slate-200 focus:ring-indigo-500'
            }`}
          />
          {portfolioError && (
            <div className="mt-1 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-600">{portfolioError}</p>
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-1.5">
            💡 Example: https://yourname.com or https://projects.com
          </p>
        </div>

        {/* Submit Actions */}
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
            disabled={disabled || !isDirty || githubError || linkedinError || portfolioError}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
          >
            {(isSubmitting || isUpdatingProfile) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save links
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinksSection;
