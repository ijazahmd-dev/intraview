// // src/pages/candidate/components/sections/CareerInfoSection.jsx
// import React, { useEffect } from 'react';
// import { toast } from 'sonner';
// import useProfileForm from '../../hooks/useProfileForm';
// import { useProfileData } from '../../hooks/useProfileData';
// import { Loader2 } from 'lucide-react';

// const EXPERIENCE_LEVELS = [
//   { value: 'FRESHER', label: 'Fresher' },
//   { value: 'JUNIOR', label: 'Junior (0–2 years)' },
//   { value: 'MID', label: 'Mid-level (2–5 years)' },
//   { value: 'SENIOR', label: 'Senior (5+ years)' },
// ];

// const PREFERRED_TYPES = [
//   { value: 'HR', label: 'HR' },
//   { value: 'TECHNICAL', label: 'Technical' },
//   { value: 'SYSTEM_DESIGN', label: 'System design' },
//   { value: 'DSA', label: 'DSA' },
//   { value: 'BEHAVIORAL', label: 'Behavioral' },
// ];

// const DIFFICULTIES = [
//   { value: 'BEGINNER', label: 'Beginner' },
//   { value: 'INTERMEDIATE', label: 'Intermediate' },
//   { value: 'ADVANCED', label: 'Advanced' },
// ];

// const DURATIONS = [30, 45, 60];

// const CareerInfoSection = () => {
//   const {
//     candidateProfile,
//     isUpdatingProfile,
//     handleUpdateProfile,
//   } = useProfileData();

//   const initialData = {
//     headline: candidateProfile?.headline || '',
//     bio: candidateProfile?.bio || '',
//     current_status: candidateProfile?.current_status || '',
//     current_role: candidateProfile?.current_role || '',
//     target_role: candidateProfile?.target_role || '',
//     experience_level: candidateProfile?.experience_level || '',
//     years_experience:
//       candidateProfile?.years_experience !== null &&
//         candidateProfile?.years_experience !== undefined
//         ? candidateProfile.years_experience
//         : '',
//     skills: Array.isArray(candidateProfile?.skills)
//       ? candidateProfile.skills
//       : [],
//     preferred_interview_types:
//       Array.isArray(candidateProfile?.preferred_interview_types)
//         ? candidateProfile.preferred_interview_types
//         : [],
//     preferred_difficulty:
//       candidateProfile?.preferred_difficulty || 'INTERMEDIATE',
//     preferred_duration: candidateProfile?.preferred_duration || 60,
//     interviewer_notes: candidateProfile?.interviewer_notes || '',
//   };

//   const {
//     formData,
//     handleChange,
//     handleBlur,
//     handleSubmit,
//     handleArrayChange,
//     setFieldValue,
//     getFieldError,
//     isSubmitting,
//     isDirty,
//     resetForm,
//   } = useProfileForm(initialData, async (data) => {
//     const cleaned = {
//       ...data,
//       years_experience:
//         data.years_experience === '' ? null : Number(data.years_experience),
//       preferred_duration: Number(data.preferred_duration),
//       skills:
//         Array.isArray(data.skills) && data.skills.length
//           ? data.skills
//           : [],
//       preferred_interview_types:
//         Array.isArray(data.preferred_interview_types)
//           ? data.preferred_interview_types
//           : [],
//     };
//     const result = await handleUpdateProfile(cleaned);
//     if (result && !result.error) {
//       toast.success('Career profile saved!');
//     } else if (result?.error) {
//       toast.error('Failed to save — please check your inputs.');
//     }
//   });

//   useEffect(() => {
//     resetForm();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [candidateProfile?.id]);

//   const disabled = isSubmitting || isUpdatingProfile;

//   const [skillInput, setSkillInput] = React.useState('');

//   const addSkill = () => {
//     const value = skillInput.trim();
//     if (!value) return;
//     const existing = Array.isArray(formData.skills) ? formData.skills : [];
//     if (existing.find((s) => s.toLowerCase() === value.toLowerCase())) {
//       setSkillInput('');
//       return;
//     }
//     handleArrayChange('skills', [...existing, value]);
//     setSkillInput('');
//   };

//   const removeSkill = (skill) => {
//     const existing = Array.isArray(formData.skills) ? formData.skills : [];
//     handleArrayChange(
//       'skills',
//       existing.filter((s) => s !== skill)
//     );
//   };

//   const togglePreferredType = (value) => {
//     const list = Array.isArray(formData.preferred_interview_types)
//       ? formData.preferred_interview_types
//       : [];
//     if (list.includes(value)) {
//       handleArrayChange(
//         'preferred_interview_types',
//         list.filter((v) => v !== value)
//       );
//     } else {
//       handleArrayChange('preferred_interview_types', [...list, value]);
//     }
//   };

//   return (
//     <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-bold text-slate-900">Career & interview profile</h3>
//           <p className="text-xs text-slate-500 mt-1">
//             Tell us what you do and what you are aiming for.
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5 text-sm">

//         {/* Headline */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Headline / Tagline
//           </label>
//           <input
//             type="text"
//             name="headline"
//             value={formData.headline || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             maxLength={150}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             placeholder="e.g. Aspiring ML Engineer | React Developer"
//           />
//           <div className="flex justify-between items-center mt-1">
//             <p className="text-[11px] text-slate-400">
//               Shown on your profile card
//             </p>
//             <p className="text-[11px] text-slate-400">
//               {(formData.headline || '').length}/150
//             </p>
//           </div>
//           {getFieldError('headline') && (
//             <p className="mt-1 text-xs text-rose-600">{getFieldError('headline')}</p>
//           )}
//         </div>

//         {/* Bio */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             About me
//           </label>
//           <textarea
//             name="bio"
//             value={formData.bio || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             rows={4}
//             maxLength={1000}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
//             placeholder="Write a short bio about yourself, your background, and what you're looking for..."
//           />
//           <div className="flex justify-between items-center mt-1">
//             <p className="text-[11px] text-slate-400">
//               Helps interviewers understand you better
//             </p>
//             <p className="text-[11px] text-slate-400">
//               {(formData.bio || '').length}/1000
//             </p>
//           </div>
//           {getFieldError('bio') && (
//             <p className="mt-1 text-xs text-rose-600">{getFieldError('bio')}</p>
//           )}
//         </div>

//         <div className="grid md:grid-cols-2 gap-4">
//           {/* Current status */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Current status
//             </label>
//             <select
//               name="current_status"
//               value={formData.current_status || ''}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               disabled={disabled}
//               className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             >
//               <option value="">Select status</option>
//               <option value="Student">Student</option>
//               <option value="Fresher">Fresher</option>
//               <option value="Working">Working Professional</option>
//               <option value="Career Switcher">Career switcher</option>
//             </select>
//           </div>

//           {/* Current role */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Current role
//             </label>
//             <input
//               type="text"
//               name="current_role"
//               value={formData.current_role || ''}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               disabled={disabled}
//               className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//               placeholder="Software Engineer, Student, etc."
//             />
//           </div>

//           {/* Target role */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Target role
//             </label>
//             <input
//               type="text"
//               name="target_role"
//               value={formData.target_role || ''}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               disabled={disabled}
//               className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//               placeholder="Frontend Developer, ML Engineer, etc."
//             />
//             {getFieldError('target_role') && (
//               <p className="mt-1 text-xs text-rose-600">
//                 {getFieldError('target_role')}
//               </p>
//             )}
//           </div>

//           {/* Experience level */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Experience level
//             </label>
//             <select
//               name="experience_level"
//               value={formData.experience_level || ''}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               disabled={disabled}
//               className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             >
//               <option value="">Select experience</option>
//               {EXPERIENCE_LEVELS.map((item) => (
//                 <option key={item.value} value={item.value}>
//                   {item.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Years of experience */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Years of experience
//             </label>
//             <input
//               type="number"
//               name="years_experience"
//               value={formData.years_experience}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               min={0}
//               max={100}
//               disabled={disabled}
//               className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//               placeholder="0"
//             />
//             {getFieldError('years_experience') && (
//               <p className="mt-1 text-xs text-rose-600">
//                 {getFieldError('years_experience')}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Skills */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Primary skills
//           </label>
//           <div className="flex flex-wrap gap-2 mb-2">
//             {Array.isArray(formData.skills) && formData.skills.length > 0 ? (
//               formData.skills.map((skill) => (
//                 <span
//                   key={skill}
//                   className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
//                 >
//                   {skill}
//                   <button
//                     type="button"
//                     onClick={() => removeSkill(skill)}
//                     className="text-indigo-500 hover:text-indigo-700"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ))
//             ) : (
//               <p className="text-xs text-slate-500">
//                 Add at least 3 skills you want to be interviewed on.
//               </p>
//             )}
//           </div>
//           <div className="flex gap-2 mt-1">
//             <input
//               type="text"
//               value={skillInput}
//               onChange={(e) => setSkillInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                   addSkill();
//                 }
//               }}
//               placeholder="React, Django, DSA…"
//               disabled={disabled}
//               className="flex-1 px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             />
//             <button
//               type="button"
//               onClick={addSkill}
//               disabled={disabled}
//               className="px-3 py-2 rounded-2xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
//             >
//               Add
//             </button>
//           </div>
//           {getFieldError('skills') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('skills')}
//             </p>
//           )}
//         </div>

//         {/* Preferences */}
//         <div className="grid md:grid-cols-3 gap-4">
//           <div className="md:col-span-2">
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Preferred interview types
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {PREFERRED_TYPES.map((item) => {
//                 const active =
//                   formData.preferred_interview_types?.includes(item.value);
//                 return (
//                   <button
//                     key={item.value}
//                     type="button"
//                     onClick={() => togglePreferredType(item.value)}
//                     disabled={disabled}
//                     className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${active
//                         ? 'bg-indigo-600 text-white border-indigo-600'
//                         : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
//                       }`}
//                   >
//                     {item.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Preferred duration
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {DURATIONS.map((d) => (
//                 <button
//                   key={d}
//                   type="button"
//                   onClick={() => setFieldValue('preferred_duration', d)}
//                   disabled={disabled}
//                   className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${Number(formData.preferred_duration) === d
//                       ? 'bg-indigo-600 text-white border-indigo-600'
//                       : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
//                     }`}
//                 >
//                   {d} min
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Difficulty */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Preferred difficulty
//           </label>
//           <div className="flex flex-wrap gap-2">
//             {DIFFICULTIES.map((item) => (
//               <button
//                 key={item.value}
//                 type="button"
//                 onClick={() =>
//                   setFieldValue('preferred_difficulty', item.value)
//                 }
//                 disabled={disabled}
//                 className={`px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${formData.preferred_difficulty === item.value
//                     ? 'bg-indigo-600 text-white border-indigo-600'
//                     : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
//                   }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Notes */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Notes for interviewer
//           </label>
//           <textarea
//             name="interviewer_notes"
//             value={formData.interviewer_notes || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             rows={4}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
//             placeholder="Example: I want more focus on React hooks, system design basics, and project discussion."
//           />
//           {getFieldError('interviewer_notes') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('interviewer_notes')}
//             </p>
//           )}
//         </div>

//         {/* Actions */}
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
//             disabled={disabled || !isDirty}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
//           >
//             {(isSubmitting || isUpdatingProfile) && (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             )}
//             Save changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CareerInfoSection;























// src/pages/candidate/components/sections/CareerInfoSection.jsx
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  yellow: '#F5C518',
  yellowLight: '#FEFAE8',
  yellowBorder: '#EDD87A',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
};

const EXPERIENCE_LEVELS = [
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'JUNIOR', label: 'Junior (0–2 yrs)' },
  { value: 'MID', label: 'Mid (2–5 yrs)' },
  { value: 'SENIOR', label: 'Senior (5+ yrs)' },
];
const PREFERRED_TYPES = [
  { value: 'HR', label: 'HR' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'DSA', label: 'DSA' },
  { value: 'BEHAVIORAL', label: 'Behavioral' },
];
const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];
const DURATIONS = [30, 45, 60];

// ─── Shared primitives ─────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: C.textMuted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    {children}
  </label>
);

const baseInput = {
  width: '100%', boxSizing: 'border-box', padding: '10px 14px',
  borderRadius: '12px', border: `1.5px solid ${C.grayBorder}`,
  background: C.white, fontSize: '13.5px', color: C.text,
  outline: 'none', fontFamily: '"DM Sans", sans-serif', transition: 'border-color 0.15s',
};

const FieldError = ({ msg }) => msg
  ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{msg}</p>
  : null;

const ChipButton = ({ selected, onClick, children, accent = 'teal' }) => {
  const colors = accent === 'yellow'
    ? { sel: { bg: C.yellowLight, border: C.yellow, color: '#92740A' }, idle: { bg: C.white, border: C.grayBorder, color: C.text } }
    : { sel: { bg: C.tealLight, border: C.teal, color: C.teal }, idle: { bg: C.white, border: C.grayBorder, color: C.text } };
  const s = selected ? colors.sel : colors.idle;
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: '20px',
        border: `1.5px solid ${s.border}`, background: s.bg, color: s.color,
        fontSize: '12.5px', fontWeight: selected ? 700 : 500, cursor: 'pointer',
        transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {children}
    </button>
  );
};

// ─── Component ─────────────────────────────────────────────────────────────────
const CareerInfoSection = () => {
  const { candidateProfile, isUpdatingProfile, handleUpdateProfile } = useProfileData();

  const initialData = {
    headline: candidateProfile?.headline || '',
    bio: candidateProfile?.bio || '',
    current_status: candidateProfile?.current_status || '',
    current_role: candidateProfile?.current_role || '',
    target_role: candidateProfile?.target_role || '',
    experience_level: candidateProfile?.experience_level || '',
    years_experience: candidateProfile?.years_experience !== null && candidateProfile?.years_experience !== undefined ? candidateProfile.years_experience : '',
    skills: Array.isArray(candidateProfile?.skills) ? candidateProfile.skills : [],
    preferred_interview_types: Array.isArray(candidateProfile?.preferred_interview_types) ? candidateProfile.preferred_interview_types : [],
    preferred_difficulty: candidateProfile?.preferred_difficulty || 'INTERMEDIATE',
    preferred_duration: candidateProfile?.preferred_duration || 60,
    interviewer_notes: candidateProfile?.interviewer_notes || '',
  };

  const { formData, handleChange, handleBlur, handleSubmit, handleArrayChange, setFieldValue, getFieldError, isSubmitting, isDirty, resetForm } =
    useProfileForm(initialData, async (data) => {
      const cleaned = {
        ...data,
        years_experience: data.years_experience === '' ? null : Number(data.years_experience),
        preferred_duration: Number(data.preferred_duration),
        skills: Array.isArray(data.skills) && data.skills.length ? data.skills : [],
        preferred_interview_types: Array.isArray(data.preferred_interview_types) ? data.preferred_interview_types : [],
      };
      const result = await handleUpdateProfile(cleaned);
      if (result && !result.error) toast.success('Career profile saved!');
      else if (result?.error) toast.error('Failed to save — please check your inputs.');
    });

  useEffect(() => { resetForm(); }, [candidateProfile?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  const [skillInput, setSkillInput] = React.useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    const existing = Array.isArray(formData.skills) ? formData.skills : [];
    if (existing.find((s) => s.toLowerCase() === value.toLowerCase())) { setSkillInput(''); return; }
    handleArrayChange('skills', [...existing, value]);
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    handleArrayChange('skills', (formData.skills || []).filter((s) => s !== skill));
  };

  const togglePreferredType = (value) => {
    const list = Array.isArray(formData.preferred_interview_types) ? formData.preferred_interview_types : [];
    if (list.includes(value)) handleArrayChange('preferred_interview_types', list.filter((v) => v !== value));
    else handleArrayChange('preferred_interview_types', [...list, value]);
  };

  return (
    <div style={{
      background: C.white, borderRadius: '20px', border: `1px solid ${C.grayBorder}`,
      padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <style>{`@keyframes ci-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.yellow }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.dark }}>Career & Interview Profile</h3>
        </div>
        <p style={{ margin: '0 0 0 14px', fontSize: '12px', color: C.textMuted }}>Tell us what you do and what you're aiming for.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Headline */}
        <div>
          <Label>Headline / Tagline</Label>
          <input
            type="text" name="headline" value={formData.headline || ''} onChange={handleChange} onBlur={handleBlur}
            disabled={disabled} maxLength={150} placeholder="e.g. Aspiring ML Engineer | React Developer"
            style={baseInput}
            onFocus={e => (e.target.style.borderColor = C.teal)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            <span style={{ fontSize: '11px', color: C.textLight }}>Shown on your profile card</span>
            <span style={{ fontSize: '11px', color: C.textLight }}>{(formData.headline || '').length}/150</span>
          </div>
          <FieldError msg={getFieldError('headline')} />
        </div>

        {/* Bio */}
        <div>
          <Label>About me</Label>
          <textarea
            name="bio" value={formData.bio || ''} onChange={handleChange} onBlur={handleBlur}
            disabled={disabled} rows={4} maxLength={1000}
            placeholder="Write a short bio about yourself..."
            style={{ ...baseInput, resize: 'none', lineHeight: 1.6 }}
            onFocus={e => (e.target.style.borderColor = C.teal)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            <span style={{ fontSize: '11px', color: C.textLight }}>Helps interviewers understand you better</span>
            <span style={{ fontSize: '11px', color: C.textLight }}>{(formData.bio || '').length}/1000</span>
          </div>
          <FieldError msg={getFieldError('bio')} />
        </div>

        {/* Grid row: status + current role + target role + exp level + years */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <Label>Current status</Label>
            <select name="current_status" value={formData.current_status || ''} onChange={handleChange} onBlur={handleBlur} disabled={disabled}
              style={baseInput} onFocus={e => (e.target.style.borderColor = C.teal)}>
              <option value="">Select status</option>
              <option value="Student">Student</option>
              <option value="Fresher">Fresher</option>
              <option value="Working">Working Professional</option>
              <option value="Career Switcher">Career switcher</option>
            </select>
          </div>
          <div>
            <Label>Current role</Label>
            <input type="text" name="current_role" value={formData.current_role || ''} onChange={handleChange} onBlur={handleBlur}
              disabled={disabled} placeholder="Software Engineer, Student…" style={baseInput}
              onFocus={e => (e.target.style.borderColor = C.teal)} />
          </div>
          <div>
            <Label>Target role</Label>
            <input type="text" name="target_role" value={formData.target_role || ''} onChange={handleChange} onBlur={handleBlur}
              disabled={disabled} placeholder="Frontend Developer, ML Engineer…" style={baseInput}
              onFocus={e => (e.target.style.borderColor = C.teal)} />
            <FieldError msg={getFieldError('target_role')} />
          </div>
          <div>
            <Label>Experience level</Label>
            <select name="experience_level" value={formData.experience_level || ''} onChange={handleChange} onBlur={handleBlur}
              disabled={disabled} style={baseInput} onFocus={e => (e.target.style.borderColor = C.teal)}>
              <option value="">Select experience</option>
              {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Years of experience</Label>
            <input type="number" name="years_experience" value={formData.years_experience} onChange={handleChange} onBlur={handleBlur}
              min={0} max={100} disabled={disabled} placeholder="0" style={baseInput}
              onFocus={e => (e.target.style.borderColor = C.teal)} />
            <FieldError msg={getFieldError('years_experience')} />
          </div>
        </div>

        {/* Skills */}
        <div>
          <Label>Primary skills</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {Array.isArray(formData.skills) && formData.skills.length > 0 ? (
              formData.skills.map((skill) => (
                <span key={skill} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 600,
                  background: C.tealLight, color: C.teal, border: `1px solid ${C.tealBorder}`,
                }}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}
                    style={{ border: 'none', background: 'none', color: C.teal, cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: C.textMuted }}>Add at least 3 skills you want to be interviewed on.</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="React, Django, DSA…"
              disabled={disabled} style={{ ...baseInput, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = C.teal)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" onClick={addSkill} disabled={disabled}
              style={{
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                background: C.dark, color: C.white, fontWeight: 700, fontSize: '13px',
                cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
                fontFamily: '"DM Sans", sans-serif',
              }}>
              Add
            </button>
          </div>
          <FieldError msg={getFieldError('skills')} />
        </div>

        {/* Preferred interview types + duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
          <div>
            <Label>Preferred interview types</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PREFERRED_TYPES.map(item => (
                <ChipButton key={item.value} selected={formData.preferred_interview_types?.includes(item.value)} onClick={() => togglePreferredType(item.value)}>
                  {item.label}
                </ChipButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Duration</Label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {DURATIONS.map(d => (
                <ChipButton key={d} selected={Number(formData.preferred_duration) === d} onClick={() => setFieldValue('preferred_duration', d)}>
                  {d}m
                </ChipButton>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <Label>Preferred difficulty</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {DIFFICULTIES.map(item => (
              <ChipButton key={item.value} selected={formData.preferred_difficulty === item.value} onClick={() => setFieldValue('preferred_difficulty', item.value)} accent="yellow">
                {item.label}
              </ChipButton>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label>Notes for interviewer</Label>
          <textarea
            name="interviewer_notes" value={formData.interviewer_notes || ''} onChange={handleChange} onBlur={handleBlur}
            disabled={disabled} rows={4}
            placeholder="Example: I want more focus on React hooks, system design basics..."
            style={{ ...baseInput, resize: 'none', lineHeight: 1.6 }}
            onFocus={e => (e.target.style.borderColor = C.teal)}
          />
          <FieldError msg={getFieldError('interviewer_notes')} />
        </div>

        {/* Actions */}
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
              transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
            }}>
            {(isSubmitting || isUpdatingProfile) && (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'ci-spin 0.8s linear infinite' }} />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareerInfoSection;