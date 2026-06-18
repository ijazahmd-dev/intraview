// import React, { useEffect } from 'react';
// import { toast } from 'sonner';
// import useProfileForm from '../../hooks/useProfileForm';
// import { useProfileData } from '../../hooks/useProfileData';
// import { Loader2 } from 'lucide-react';

// const BasicInfoSection = () => {
//   const {
//     user,
//     candidateProfile,
//     isUpdatingProfile,
//     handleUpdateProfile,
//   } = useProfileData();

//   const initialData = {
//     user_first_name: user?.firstName || '',
//     user_last_name: user?.lastName || '',
//     full_name: candidateProfile?.full_name || '',
//     phone: candidateProfile?.phone || '',
//     location: candidateProfile?.location || '',
//     timezone: candidateProfile?.timezone || 'Asia/Kolkata',
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
//   } = useProfileForm(initialData, async (data) => {
//     const result = await handleUpdateProfile(data);
//     if (result && !result.error) {
//       toast.success('Basic info saved!');
//     } else if (result?.error) {
//       toast.error('Failed to save — please check your inputs.');
//     }
//   });

//   // keep form in sync if profile reloads
//   useEffect(() => {
//     resetForm();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [candidateProfile?.id, user?.id]);

//   const disabled = isSubmitting || isUpdatingProfile;

//   return (
//     <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-bold text-slate-900">Basic information</h3>
//           <p className="text-xs text-slate-500 mt-1">
//             Keep your personal details up to date.
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 text-sm">
//         {/* First name */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             First name
//           </label>
//           <input
//             type="text"
//             name="user_first_name"
//             value={formData.user_first_name || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             placeholder="John"
//             disabled={disabled}
//           />
//           {getFieldError('user_first_name') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('user_first_name')}
//             </p>
//           )}
//         </div>

//         {/* Last name */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Last name
//           </label>
//           <input
//             type="text"
//             name="user_last_name"
//             value={formData.user_last_name || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             placeholder="Doe"
//             disabled={disabled}
//           />
//           {getFieldError('user_last_name') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('user_last_name')}
//             </p>
//           )}
//         </div>

//         {/* Full name */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Display name (full name)
//           </label>
//           <input
//             type="text"
//             name="full_name"
//             value={formData.full_name || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             placeholder="John Doe"
//             disabled={disabled}
//           />
//           {getFieldError('full_name') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('full_name')}
//             </p>
//           )}
//         </div>

//         {/* Email (readonly) */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             value={user?.email || ''}
//             readOnly
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
//           />
//           <p className="mt-1 text-[11px] text-slate-400">
//             Email is your login and cannot be changed here.
//           </p>
//         </div>

//         {/* Phone */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Phone number
//           </label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             placeholder="+91 98765 43210"
//             disabled={disabled}
//           />
//           {getFieldError('phone') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('phone')}
//             </p>
//           )}
//         </div>

//         {/* Location */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Location
//           </label>
//           <input
//             type="text"
//             name="location"
//             value={formData.location || ''}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//             placeholder="Kozhikode, Kerala"
//             disabled={disabled}
//           />
//           {getFieldError('location') && (
//             <p className="mt-1 text-xs text-rose-600">
//               {getFieldError('location')}
//             </p>
//           )}
//         </div>

//         {/* Timezone */}
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">
//             Timezone
//           </label>
//           <select
//             name="timezone"
//             value={formData.timezone || 'Asia/Kolkata'}
//             onChange={handleChange}
//             onBlur={handleBlur}
//             disabled={disabled}
//             className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//           >
//             <option value="Asia/Kolkata">(GMT+5:30) India Standard Time</option>
//             <option value="Asia/Dubai">(GMT+4:00) Gulf Standard Time</option>
//             <option value="Europe/London">(GMT+0:00) UK / London</option>
//             <option value="America/New_York">(GMT-5:00) US / Eastern</option>
//           </select>
//         </div>

//         {/* Actions */}
//         <div className="md:col-span-2 flex justify-end gap-3 mt-2">
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

// export default BasicInfoSection;



























// src/pages/candidate/components/sections/BasicInfoSection.jsx
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import useProfileForm from '../../hooks/useProfileForm';
import { useProfileData } from '../../hooks/useProfileData';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  grayMid: '#E8E8E8',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
};

// ─── Shared primitives ─────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: C.textMuted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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

const Select = ({ status, children, ...props }) => {
  const isError = status === 'error';
  const isValid = status === 'valid';
  let borderColor = C.grayBorder;
  if (isError) borderColor = '#EF4444';
  if (isValid) borderColor = '#10B981';

  return (
    <div style={{ position: 'relative' }}>
      <select
        {...props}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '10px 36px 10px 14px',
          borderRadius: '12px', border: `1.5px solid ${borderColor}`,
          background: C.white, fontSize: '13.5px', color: C.text,
          outline: 'none', fontFamily: '"DM Sans", sans-serif',
          cursor: 'pointer', appearance: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => { if (!isError && !isValid) e.target.style.borderColor = C.teal; }}
        onBlur={e => {
          if (!isError && !isValid) e.target.style.borderColor = C.grayBorder;
          if (props.onBlur) props.onBlur(e);
        }}
      >
        {children}
      </select>
      {isValid && <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      {isError && <XCircle size={16} color="#EF4444" style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      {/* Custom select arrow */}
      <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `4px solid ${C.textMuted}` }} />
    </div>
  );
};

const FieldError = ({ msg }) => msg
  ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#DC2626' }}>{msg}</p>
  : null;

// ─── Component ─────────────────────────────────────────────────────────────────
const BasicInfoSection = () => {
  const { user, candidateProfile, isUpdatingProfile, handleUpdateProfile } = useProfileData();

  const initialData = {
    user_first_name: user?.firstName || '',
    user_last_name: user?.lastName || '',
    full_name: candidateProfile?.full_name || '',
    phone: candidateProfile?.phone || '',
    location: candidateProfile?.location || '',
    timezone: candidateProfile?.timezone || 'Asia/Kolkata',
  };

  const { formData, handleChange, handleBlur, handleSubmit, setFieldValue, getFieldError, getFieldStatus, handleApiErrors, isSubmitting, isDirty, resetForm } =
    useProfileForm(initialData, async (data) => {
      const result = await handleUpdateProfile(data);
      if (result && !result.error) {
        toast.success('Basic info saved!');
      } else if (result?.error) {
        handleApiErrors(result.error);
        toast.error('Failed to save — please check your inputs.');
      }
    });

  useEffect(() => { resetForm(); }, [candidateProfile?.id, user?.id]);

  const disabled = isSubmitting || isUpdatingProfile;

  return (
    <div style={{
      background: C.white, borderRadius: '20px', border: `1px solid ${C.grayBorder}`,
      padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      {/* Section header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.teal }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.dark }}>Basic Information</h3>
        </div>
        <p style={{ margin: '0 0 0 14px', fontSize: '12px', color: C.textMuted }}>Keep your personal details up to date.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          <div>
            <Label>First name</Label>
            <Input type="text" name="user_first_name" value={formData.user_first_name || ''} onChange={handleChange} onBlur={handleBlur} placeholder="John" disabled={disabled} status={getFieldStatus('user_first_name')} />
            <FieldError msg={getFieldError('user_first_name')} />
          </div>

          <div>
            <Label>Last name</Label>
            <Input type="text" name="user_last_name" value={formData.user_last_name || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Doe" disabled={disabled} status={getFieldStatus('user_last_name')} />
            <FieldError msg={getFieldError('user_last_name')} />
          </div>

          <div>
            <Label>Display name</Label>
            <Input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} onBlur={handleBlur} placeholder="John Doe" disabled={disabled} status={getFieldStatus('full_name')} />
            <FieldError msg={getFieldError('full_name')} />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" value={user?.email || ''} readOnly />
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.textLight }}>Email is your login and cannot be changed here.</p>
          </div>

          <div>
            <Label>Phone number</Label>
            <Input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} onBlur={handleBlur} placeholder="+91 98765 43210" disabled={disabled} status={getFieldStatus('phone')} />
            <FieldError msg={getFieldError('phone')} />
          </div>

          <div>
            <Label>Location</Label>
            <Input type="text" name="location" value={formData.location || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Kozhikode, Kerala" disabled={disabled} status={getFieldStatus('location')} />
            <FieldError msg={getFieldError('location')} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Label>Timezone</Label>
            <Select name="timezone" value={formData.timezone || 'Asia/Kolkata'} onChange={handleChange} onBlur={handleBlur} disabled={disabled} status={getFieldStatus('timezone')}>
              <option value="Asia/Kolkata">(GMT+5:30) India Standard Time</option>
              <option value="Asia/Dubai">(GMT+4:00) Gulf Standard Time</option>
              <option value="Europe/London">(GMT+0:00) UK / London</option>
              <option value="America/New_York">(GMT-5:00) US / Eastern</option>
            </Select>
            <FieldError msg={getFieldError('timezone')} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${C.grayBorder}` }}>
          <button
            type="button" disabled={disabled || !isDirty} onClick={resetForm}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: `1.5px solid ${C.grayBorder}`,
              background: C.white, color: C.textMuted, fontWeight: 600, fontSize: '13px',
              cursor: disabled || !isDirty ? 'not-allowed' : 'pointer', opacity: disabled || !isDirty ? 0.45 : 1,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Reset
          </button>
          <button
            type="submit" disabled={disabled || !isDirty}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '12px', border: 'none',
              background: disabled || !isDirty ? C.grayBorder : C.teal,
              color: disabled || !isDirty ? C.textMuted : C.white,
              fontWeight: 700, fontSize: '13px',
              cursor: disabled || !isDirty ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {(isSubmitting || isUpdatingProfile) && (
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'bi-spin 0.8s linear infinite' }} />
            )}
            Save changes
          </button>
        </div>
      </form>
      <style>{`@keyframes bi-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BasicInfoSection;