// // src/pages/candidate/components/sections/PreferencesSection.jsx
// import React, { useEffect } from 'react';
// import { toast } from 'sonner';
// import useProfileForm from '../../hooks/useProfileForm';
// import { useProfileData } from '../../hooks/useProfileData';
// import { Loader2, AlertCircle } from 'lucide-react';

// const INTERVIEW_TYPES = [
//   { value: 'HR', label: '🎤 HR Interview' },
//   { value: 'TECHNICAL', label: '💻 Technical' },
//   { value: 'SYSTEM_DESIGN', label: '🏗️ System Design' },
//   { value: 'DSA', label: '📊 DSA/Algorithms' },
//   { value: 'BEHAVIORAL', label: '🤝 Behavioral' },
// ];

// const DIFFICULTIES = [
//   { value: 'BEGINNER', label: 'Beginner' },
//   { value: 'INTERMEDIATE', label: 'Intermediate' },
//   { value: 'ADVANCED', label: 'Advanced' },
// ];

// const DURATIONS = [
//   { value: 30, label: '30 minutes' },
//   { value: 45, label: '45 minutes' },
//   { value: 60, label: '60 minutes' },
// ];

// const PreferencesSection = () => {
//   const {
//     candidateProfile,
//     isUpdatingProfile,
//     handleUpdateProfile,
//   } = useProfileData();

//   const initialData = {
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
//     const result = await handleUpdateProfile(data);
//     if (result && !result.error) {
//       toast.success('Preferences saved!');
//     } else if (result?.error) {
//       toast.error('Failed to save preferences.');
//     }
//   });

//   useEffect(() => {
//     resetForm();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [candidateProfile?.id]);

//   const disabled = isSubmitting || isUpdatingProfile;

//   const toggleInterviewType = (type) => {
//     const current = Array.isArray(formData.preferred_interview_types)
//       ? formData.preferred_interview_types
//       : [];
//     if (current.includes(type)) {
//       handleArrayChange(
//         'preferred_interview_types',
//         current.filter((t) => t !== type)
//       );
//     } else {
//       handleArrayChange('preferred_interview_types', [...current, type]);
//     }
//   };

//   const selectedInterviewTypes = Array.isArray(formData.preferred_interview_types)
//     ? formData.preferred_interview_types
//     : [];

//   return (
//     <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-bold text-slate-900">Interview preferences</h3>
//           <p className="text-xs text-slate-500 mt-1">
//             Customize your interview experience. These preferences help us match you with suitable interviewers.
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Interview Types */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-3">
//             What type of interview do you prefer?
//           </label>
//           <div className="grid sm:grid-cols-2 gap-2">
//             {INTERVIEW_TYPES.map((item) => {
//               const isSelected = selectedInterviewTypes.includes(item.value);
//               return (
//                 <button
//                   key={item.value}
//                   type="button"
//                   onClick={() => toggleInterviewType(item.value)}
//                   disabled={disabled}
//                   className={`p-3 rounded-2xl text-sm font-medium border-2 transition-all text-left ${isSelected
//                       ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
//                       : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
//                     }`}
//                 >
//                   {item.label}
//                 </button>
//               );
//             })}
//           </div>
//           {selectedInterviewTypes.length === 0 && (
//             <div className="mt-2 flex items-start gap-2">
//               <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
//               <p className="text-xs text-amber-600">
//                 Select at least one interview type
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Difficulty Level */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-3">
//             Preferred difficulty level
//           </label>
//           <div className="grid sm:grid-cols-3 gap-2">
//             {DIFFICULTIES.map((item) => (
//               <button
//                 key={item.value}
//                 type="button"
//                 onClick={() =>
//                   setFieldValue('preferred_difficulty', item.value)
//                 }
//                 disabled={disabled}
//                 className={`p-3 rounded-2xl text-sm font-medium border-2 transition-all ${formData.preferred_difficulty === item.value
//                     ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
//                     : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
//                   }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//           <p className="text-[11px] text-slate-500 mt-2">
//             💡 <span className="font-semibold">Beginner:</span> Fundamentals & easy questions |{' '}
//             <span className="font-semibold">Intermediate:</span> Real-world scenarios |{' '}
//             <span className="font-semibold">Advanced:</span> Complex problem-solving
//           </p>
//         </div>

//         {/* Duration */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-3">
//             Preferred interview duration
//           </label>
//           <div className="grid sm:grid-cols-3 gap-2">
//             {DURATIONS.map((item) => (
//               <button
//                 key={item.value}
//                 type="button"
//                 onClick={() => setFieldValue('preferred_duration', item.value)}
//                 disabled={disabled}
//                 className={`p-3 rounded-2xl text-sm font-medium border-2 transition-all ${formData.preferred_duration === item.value
//                     ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
//                     : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
//                   }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//           <p className="text-[11px] text-slate-500 mt-2">
//             💡 Longer interviews allow for deeper discussions
//           </p>
//         </div>

//         {/* Notes for Interviewer */}
//         <div>
//           <label htmlFor="interviewer_notes" className="block text-xs font-semibold text-slate-600 mb-1">
//             Additional notes for interviewer
//           </label>
//           <textarea
//             id="interviewer_notes"
//             name="interviewer_notes"
//             value={formData.interviewer_notes || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             rows={4}
//             maxLength={500}
//             placeholder="Example: I want focus on React hooks and system design. I'm weak in database optimization but strong in frontend. Please focus on my strengths too."
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
//           />
//           <div className="flex justify-between items-center mt-1">
//             <p className="text-[11px] text-slate-500">
//               💡 Help the interviewer prepare better questions
//             </p>
//             <p className="text-[11px] text-slate-400">
//               {(formData.interviewer_notes || '').length}/500
//             </p>
//           </div>
//           {getFieldError('interviewer_notes') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('interviewer_notes')}
//             </p>
//           )}
//         </div>

//         {/* Submit Actions */}
//         <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
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
//             disabled={disabled || !isDirty || selectedInterviewTypes.length === 0}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
//           >
//             {(isSubmitting || isUpdatingProfile) && (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             )}
//             Save preferences
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PreferencesSection;























// src/pages/candidate/components/sections/PreferencesSection.jsx
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

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

const SectionLabel = ({ children }) => (
  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
    {children}
  </p>
);

const ToggleCard = ({ selected, onClick, children, accent = 'teal' }) => {
  const s = selected
    ? (accent === 'yellow' ? { bg: C.yellowLight, border: C.yellow, color: '#92740A' } : { bg: C.tealLight, border: C.teal, color: C.teal })
    : { bg: C.white, border: C.grayBorder, color: C.text };
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '12px 16px', borderRadius: '16px',
        border: `1.5px solid ${s.border}`, background: s.bg, color: s.color,
        fontSize: '13.5px', fontWeight: selected ? 700 : 500, cursor: 'pointer',
        transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif', textAlign: 'center'
      }}
    >
      {children}
    </button>
  );
};

const Textarea = ({ status, ...props }) => {
  const isError = status === 'error';
  const isValid = status === 'valid';
  let borderColor = C.grayBorder;
  if (isError) borderColor = '#EF4444';
  if (isValid) borderColor = '#10B981';

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        {...props}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 36px 12px 14px',
          borderRadius: '14px', border: `1.5px solid ${borderColor}`,
          background: C.gray, fontSize: '13.5px', color: C.text,
          resize: 'none', outline: 'none', lineHeight: 1.6,
          fontFamily: '"DM Sans", sans-serif', transition: 'border-color 0.15s',
          ...props.style
        }}
        onFocus={e => { if (!props.readOnly && !isError && !isValid) e.target.style.borderColor = C.teal; }}
        onBlur={e => {
          if (!props.readOnly && !isError && !isValid) e.target.style.borderColor = C.grayBorder;
          if (props.onBlur) props.onBlur(e);
        }}
      />
      {isValid && <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '12px', top: '14px' }} />}
      {isError && <XCircle size={16} color="#EF4444" style={{ position: 'absolute', right: '12px', top: '14px' }} />}
    </div>
  );
};

const PreferencesSection = () => {
  const { candidateProfile, isUpdatingProfile, handleUpdateProfile } = useProfileData();

  const initialData = {
    preferred_interview_types: Array.isArray(candidateProfile?.preferred_interview_types) ? candidateProfile.preferred_interview_types : [],
    preferred_difficulty: candidateProfile?.preferred_difficulty || 'INTERMEDIATE',
    preferred_duration: candidateProfile?.preferred_duration || 60,
    interviewer_notes: candidateProfile?.interviewer_notes || '',
  };

  const { formData, handleChange, handleBlur, handleSubmit, handleArrayChange, setFieldValue, getFieldError, getFieldStatus, handleApiErrors, isSubmitting, isDirty, resetForm } =
    useProfileForm(initialData, async (data) => {
      const result = await handleUpdateProfile(data);
      if (result && !result.error) {
        toast.success('Preferences saved!');
      } else if (result?.error) {
        handleApiErrors(result.error);
        toast.error('Failed to save preferences.');
      }
    });

  useEffect(() => { resetForm(); }, [candidateProfile?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  const toggleInterviewType = (type) => {
    const current = Array.isArray(formData.preferred_interview_types) ? formData.preferred_interview_types : [];
    if (current.includes(type)) handleArrayChange('preferred_interview_types', current.filter((t) => t !== type));
    else handleArrayChange('preferred_interview_types', [...current, type]);
  };

  const selectedInterviewTypes = Array.isArray(formData.preferred_interview_types) ? formData.preferred_interview_types : [];

  return (
    <div style={{
      background: C.white, borderRadius: '20px', border: `1px solid ${C.grayBorder}`,
      padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <style>{`@keyframes pref-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.teal }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.dark }}>Interview Preferences</h3>
        </div>
        <p style={{ margin: '0 0 0 14px', fontSize: '12px', color: C.textMuted }}>
          Customize your interview experience to get better matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Interview Types */}
        <div>
          <SectionLabel>What type of interview do you prefer?</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {INTERVIEW_TYPES.map((item) => (
              <ToggleCard key={item.value} selected={selectedInterviewTypes.includes(item.value)} onClick={() => toggleInterviewType(item.value)}>
                {item.label}
              </ToggleCard>
            ))}
          </div>
          {selectedInterviewTypes.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <AlertCircle size={13} style={{ color: '#D97706' }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#D97706' }}>Select at least one interview type</p>
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <SectionLabel>Preferred difficulty level</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {DIFFICULTIES.map((item) => (
              <ToggleCard key={item.value} selected={formData.preferred_difficulty === item.value} onClick={() => setFieldValue('preferred_difficulty', item.value)} accent="yellow">
                {item.label}
              </ToggleCard>
            ))}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11px', color: C.textLight }}>
            💡 <strong>Beginner:</strong> Fundamentals &nbsp;|&nbsp; <strong>Intermediate:</strong> Real-world &nbsp;|&nbsp; <strong>Advanced:</strong> Complex
          </p>
        </div>

        {/* Duration */}
        <div>
          <SectionLabel>Preferred interview duration</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {DURATIONS.map((item) => (
              <ToggleCard key={item.value} selected={formData.preferred_duration === item.value} onClick={() => setFieldValue('preferred_duration', item.value)}>
                {item.label}
              </ToggleCard>
            ))}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11px', color: C.textLight }}>
            💡 Longer interviews allow for deeper discussions
          </p>
        </div>

        {/* Notes */}
        <div>
          <SectionLabel>Additional notes for interviewer</SectionLabel>
          <Textarea
            id="interviewer_notes" name="interviewer_notes"
            value={formData.interviewer_notes || ''} onChange={handleChange} onBlur={handleBlur}
            disabled={disabled} rows={4} maxLength={500}
            placeholder="Example: I want focus on React hooks and system design. I'm weak in database optimization..."
            status={getFieldStatus('interviewer_notes')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: C.textLight }}>💡 Help the interviewer prepare better questions</p>
            <p style={{ margin: 0, fontSize: '11px', color: C.textLight }}>{(formData.interviewer_notes || '').length}/500</p>
          </div>
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
          <button type="submit" disabled={disabled || !isDirty || selectedInterviewTypes.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '12px', border: 'none',
              background: (disabled || !isDirty || selectedInterviewTypes.length === 0) ? C.grayBorder : C.teal,
              color: (disabled || !isDirty || selectedInterviewTypes.length === 0) ? C.textMuted : C.white,
              fontWeight: 700, fontSize: '13px',
              cursor: (disabled || !isDirty || selectedInterviewTypes.length === 0) ? 'not-allowed' : 'pointer',
              fontFamily: '"DM Sans", sans-serif',
            }}>
            {(isSubmitting || isUpdatingProfile) && (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'pref-spin 0.8s linear infinite' }} />
            )}
            Save preferences
          </button>
        </div>
      </form>
    </div>
  );
};

const FieldError = ({ msg }) => msg ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{msg}</p> : null;

export default PreferencesSection;