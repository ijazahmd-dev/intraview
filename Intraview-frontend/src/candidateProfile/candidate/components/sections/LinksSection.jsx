// // src/pages/candidate/components/sections/LinksSection.jsx
// import React, { useEffect } from 'react';
// import { toast } from 'sonner';
// import useProfileForm from '../../hooks/useProfileForm';
// import { useProfileData } from '../../hooks/useProfileData';
// import { Github, Linkedin, Globe, Loader2, AlertCircle } from 'lucide-react';

// // URL validation helpers
// const validateUrls = {
//   github: (url) => {
//     if (!url) return true; // Optional field
//     const regex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
//     return regex.test(url);
//   },
//   linkedin: (url) => {
//     if (!url) return true; // Optional field
//     const regex = /(https?:\/\/(www\.)?linkedin\.com\/(mwlite\/|m\/)?in\/[a-zA-Z0-9_.-]+\/?)/;
//     return regex.test(url);
//   },
//   portfolio: (url) => {
//     if (!url) return true; // Optional field
//     try {
//       new URL(url);
//       return url.startsWith('https://') || url.startsWith('http://');
//     } catch {
//       return false;
//     }
//   },
// };

// const LinksSection = () => {
//   const {
//     candidateProfile,
//     isUpdatingProfile,
//     handleUpdateProfile,
//   } = useProfileData();

//   const initialData = {
//     github_url: candidateProfile?.github_url || '',
//     linkedin_url: candidateProfile?.linkedin_url || '',
//     portfolio_url: candidateProfile?.portfolio_url || '',
//   };

//   const {
//     formData,
//     handleChange,
//     handleBlur,
//     handleSubmit,
//     getFieldError,
//     isSubmitting,
//     isDirty,
//     resetForm,
//     errors,
//     setFieldValue,
//   } = useProfileForm(initialData, async (data) => {
//     // Validate all URLs before submitting
//     if (data.github_url && !validateUrls.github(data.github_url)) return;
//     if (data.linkedin_url && !validateUrls.linkedin(data.linkedin_url)) return;
//     if (data.portfolio_url && !validateUrls.portfolio(data.portfolio_url)) return;

//     const result = await handleUpdateProfile(data);
//     if (result && !result.error) {
//       toast.success('Links saved!');
//     } else if (result?.error) {
//       toast.error('Failed to save links.');
//     }
//   });

//   // Sync form when profile data changes
//   useEffect(() => {
//     resetForm();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [candidateProfile?.id]);

//   const disabled = isSubmitting || isUpdatingProfile;

//   // Real-time URL validation
//   const getUrlError = (fieldName, value) => {
//     if (!value) return null;

//     switch (fieldName) {
//       case 'github_url':
//         if (!validateUrls.github(value)) {
//           return 'Invalid GitHub URL (e.g., https://github.com/username)';
//         }
//         break;
//       case 'linkedin_url':
//         if (!validateUrls.linkedin(value)) {
//           return 'Invalid LinkedIn URL (e.g., https://www.linkedin.com/in/username)';
//         }
//         break;
//       case 'portfolio_url':
//         if (!validateUrls.portfolio(value)) {
//           return 'Invalid URL (must start with https:// or http://)';
//         }
//         break;
//       default:
//         break;
//     }
//     return null;
//   };

//   const githubError = getUrlError('github_url', formData.github_url);
//   const linkedinError = getUrlError('linkedin_url', formData.linkedin_url);
//   const portfolioError = getUrlError('portfolio_url', formData.portfolio_url);

//   return (
//     <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-bold text-slate-900">Professional links</h3>
//           <p className="text-xs text-slate-500 mt-1">
//             Add links to your GitHub, LinkedIn, and portfolio. These help interviewers learn more about you.
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* GitHub URL */}
//         <div>
//           <label htmlFor="github_url" className="block text-xs font-semibold text-slate-600 mb-1">
//             <span className="flex items-center gap-2">
//               <Github className="w-4 h-4" />
//               GitHub profile
//             </span>
//           </label>
//           <input
//             id="github_url"
//             type="url"
//             name="github_url"
//             value={formData.github_url || ''}
//             onChange={(e) => {
//               handleChange(e);
//             }}
//             onBlur={handleBlur}
//             disabled={disabled}
//             placeholder="https://github.com/username"
//             className={`w-full px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 text-sm transition-all ${githubError
//                 ? 'border-rose-200 focus:ring-rose-500'
//                 : 'border-slate-200 focus:ring-indigo-500'
//               }`}
//           />
//           {githubError && (
//             <div className="mt-1 flex items-start gap-2">
//               <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
//               <p className="text-xs text-rose-600">{githubError}</p>
//             </div>
//           )}
//           <p className="text-[11px] text-slate-500 mt-1.5">
//             💡 Example: https://github.com/yourname
//           </p>
//         </div>

//         {/* LinkedIn URL */}
//         <div>
//           <label htmlFor="linkedin_url" className="block text-xs font-semibold text-slate-600 mb-1">
//             <span className="flex items-center gap-2">
//               <Linkedin className="w-4 h-4" />
//               LinkedIn profile
//             </span>
//           </label>
//           <input
//             id="linkedin_url"
//             type="url"
//             name="linkedin_url"
//             value={formData.linkedin_url || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             placeholder="https://www.linkedin.com/in/username"
//             className={`w-full px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 text-sm transition-all ${linkedinError
//                 ? 'border-rose-200 focus:ring-rose-500'
//                 : 'border-slate-200 focus:ring-indigo-500'
//               }`}
//           />
//           {linkedinError && (
//             <div className="mt-1 flex items-start gap-2">
//               <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
//               <p className="text-xs text-rose-600">{linkedinError}</p>
//             </div>
//           )}
//           <p className="text-[11px] text-slate-500 mt-1.5">
//             💡 Example: https://www.linkedin.com/in/yourname
//           </p>
//         </div>

//         {/* Portfolio URL */}
//         <div>
//           <label htmlFor="portfolio_url" className="block text-xs font-semibold text-slate-600 mb-1">
//             <span className="flex items-center gap-2">
//               <Globe className="w-4 h-4" />
//               Portfolio website
//             </span>
//           </label>
//           <input
//             id="portfolio_url"
//             type="url"
//             name="portfolio_url"
//             value={formData.portfolio_url || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             placeholder="https://yourportfolio.com"
//             className={`w-full px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 text-sm transition-all ${portfolioError
//                 ? 'border-rose-200 focus:ring-rose-500'
//                 : 'border-slate-200 focus:ring-indigo-500'
//               }`}
//           />
//           {portfolioError && (
//             <div className="mt-1 flex items-start gap-2">
//               <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
//               <p className="text-xs text-rose-600">{portfolioError}</p>
//             </div>
//           )}
//           <p className="text-[11px] text-slate-500 mt-1.5">
//             💡 Example: https://yourname.com or https://projects.com
//           </p>
//         </div>

//         {/* Submit Actions */}
//         <div className="flex justify-end gap-3 pt-2">
//           <button
//             type="button"
//             disabled={disabled || !isDirty}
//             onClick={resetForm}
//             className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
//           >
//             Reset
//           </button>
//           <button
//             type="submit"
//             disabled={disabled || !isDirty || githubError || linkedinError || portfolioError}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
//           >
//             {(isSubmitting || isUpdatingProfile) && (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             )}
//             Save links
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LinksSection;


























// src/pages/candidate/components/sections/LinksSection.jsx
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { Github, Linkedin, Globe, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
};

const Label = ({ icon: Icon, children }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 700, color: C.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    <Icon size={13} style={{ color: C.textMuted }} />
    {children}
  </label>
);

const Input = ({ status, ...props }) => {
  const isError = status === 'error';
  const isValid = status === 'valid';
  let borderColor = C.grayBorder;
  if (isError) borderColor = '#EF4444';
  if (isValid) borderColor = '#10B981';

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '10px 36px 10px 14px',
          borderRadius: '12px', border: `1.5px solid ${borderColor}`,
          background: props.readOnly ? C.gray : C.white,
          fontSize: '13.5px', color: props.readOnly ? C.textMuted : C.text,
          outline: 'none', fontFamily: '"DM Sans", sans-serif',
          cursor: props.readOnly ? 'not-allowed' : 'auto',
          transition: 'border-color 0.15s',
          ...props.style,
        }}
        onFocus={e => { if (!props.readOnly && !isError && !isValid) e.target.style.borderColor = C.teal; }}
        onBlur={e => {
          if (!props.readOnly && !isError && !isValid) e.target.style.borderColor = C.grayBorder;
          if (props.onBlur) props.onBlur(e);
        }}
      />
      {isValid && <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
      {isError && <XCircle size={16} color="#EF4444" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
    </div>
  );
};

const LinksSection = () => {
  const { candidateProfile, isUpdatingProfile, handleUpdateProfile } = useProfileData();

  const initialData = {
    github_url: candidateProfile?.github_url || '',
    linkedin_url: candidateProfile?.linkedin_url || '',
    portfolio_url: candidateProfile?.portfolio_url || '',
  };

  const { formData, handleChange, handleBlur, handleSubmit, getFieldError, getFieldStatus, handleApiErrors, isSubmitting, isDirty, resetForm } =
    useProfileForm(initialData, async (data) => {
      const result = await handleUpdateProfile(data);
      if (result && !result.error) {
        toast.success('Links saved!');
      } else if (result?.error) {
        handleApiErrors(result.error);
        toast.error('Failed to save links.');
      }
    });

  useEffect(() => { resetForm(); }, [candidateProfile?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  const fields = [
    { name: 'github_url', icon: Github, label: 'GitHub profile', placeholder: 'https://github.com/username', hint: 'https://github.com/yourname' },
    { name: 'linkedin_url', icon: Linkedin, label: 'LinkedIn profile', placeholder: 'https://www.linkedin.com/in/username', hint: 'https://www.linkedin.com/in/yourname' },
    { name: 'portfolio_url', icon: Globe, label: 'Portfolio website', placeholder: 'https://yourportfolio.com', hint: 'https://yourname.com or https://projects.com' },
  ];

  return (
    <div style={{
      background: C.white, borderRadius: '20px', border: `1px solid ${C.grayBorder}`,
      padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.dark }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.dark }}>Professional Links</h3>
        </div>
        <p style={{ margin: '0 0 0 14px', fontSize: '12px', color: C.textMuted }}>
          Add links to your GitHub, LinkedIn, and portfolio.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name}>
              <Label icon={Icon}>{f.label}</Label>
              <Input
                id={f.name} type="url" name={f.name}
                value={formData[f.name] || ''} onChange={handleChange} onBlur={handleBlur}
                disabled={disabled} placeholder={f.placeholder}
                status={getFieldStatus(f.name)}
              />
              {getFieldError(f.name) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
                  <AlertCircle size={13} style={{ color: '#DC2626', marginTop: '1px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '11px', color: '#DC2626' }}>{getFieldError(f.name)}</p>
                </div>
              )}
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.textLight }}>
                💡 Example: {f.hint}
              </p>
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: `1px solid ${C.grayBorder}` }}>
          <button type="button" disabled={disabled || !isDirty} onClick={resetForm}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: `1.5px solid ${C.grayBorder}`,
              background: C.white, color: C.textMuted, fontWeight: 600, fontSize: '13px',
              cursor: disabled || !isDirty ? 'not-allowed' : 'pointer', opacity: disabled || !isDirty ? 0.45 : 1,
              fontFamily: '"DM Sans", sans-serif',
            }}>
            Reset
          </button>
          <button type="submit" disabled={disabled || !isDirty}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '12px', border: 'none',
              background: disabled || !isDirty ? C.grayBorder : C.teal,
              color: disabled || !isDirty ? C.textMuted : C.white,
              fontWeight: 700, fontSize: '13px',
              cursor: disabled || !isDirty ? 'not-allowed' : 'pointer',
              fontFamily: '"DM Sans", sans-serif',
            }}>
            {(isSubmitting || isUpdatingProfile) && (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'ls-spin 0.8s linear infinite' }} />
            )}
            Save links
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinksSection;