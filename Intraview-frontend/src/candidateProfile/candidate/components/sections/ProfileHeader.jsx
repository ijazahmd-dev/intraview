
// // src/candidateProfile/candidate/components/sections/ProfileHeader.jsx

// import React, { useRef, useState, useEffect, useCallback } from 'react';
// import { ShieldCheck, Edit3, Loader2, X, Upload, Trash2, Camera } from 'lucide-react';
// import useProfileData from '../../hooks/useProfileData';

// // ─── Picture Preview Modal ────────────────────────────────────────────────────

// const PicturePreviewModal = ({
//   src,
//   fullName,
//   onClose,
//   onChangeClick,
//   onDelete,
//   isUploading,
//   pictureError,
//   pictureSuccess,
//   hasCustomPicture,
// }) => {
//   useEffect(() => {
//     const handler = (e) => { if (e.key === 'Escape') onClose(); };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [onClose]);

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
//       onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
//     >
//       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//           <h2 className="text-sm font-semibold text-slate-800">Profile Picture</h2>
//           <button
//             onClick={onClose}
//             className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
//             aria-label="Close"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>

//         {/* Picture + actions */}
//         <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-5">

//           {/* Large preview — fills the box entirely */}
//           <div className="w-48 h-48 rounded-2xl border-4 border-slate-100 shadow-lg bg-slate-50 overflow-hidden">
//             {isUploading ? (
//               <div className="w-full h-full flex items-center justify-center bg-slate-100">
//                 <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
//               </div>
//             ) : (
//               <img
//                 src={src}
//                 alt={fullName || 'Profile picture'}
//                 className="w-full h-full object-cover"
//               />
//             )}
//           </div>

//           {/* Name */}
//           <div className="text-center">
//             <p className="text-base font-semibold text-slate-900">{fullName || 'Your Name'}</p>
//             <p className="text-xs text-slate-400 mt-0.5">Profile picture</p>
//           </div>

//           {/* Feedback */}
//           {pictureError && (
//             <p className="w-full text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
//               {typeof pictureError === 'string'
//                 ? pictureError
//                 : pictureError?.detail || 'Upload failed'}
//             </p>
//           )}
//           {pictureSuccess && (
//             <p className="w-full text-center text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
//               {pictureSuccess}
//             </p>
//           )}

//           {/* Buttons */}
//           <div className="w-full flex flex-col gap-2">
//             <button
//               type="button"
//               onClick={onChangeClick}
//               disabled={isUploading}
//               className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Upload className="w-4 h-4" />
//               {isUploading ? 'Uploading...' : 'Change Picture'}
//             </button>

//             {/* ✅ Always render when hasCustomPicture — key fix */}
//             {hasCustomPicture && (
//               <button
//                 type="button"
//                 onClick={onDelete}
//                 disabled={isUploading}
//                 className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Trash2 className="w-4 h-4" />
//                 Remove Picture
//               </button>
//             )}

//             <button
//               type="button"
//               onClick={onClose}
//               className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── ProfileHeader ────────────────────────────────────────────────────────────

// const ProfileHeader = ({ onEditClick }) => {
//   const {
//     user,
//     candidateProfile,
//     getProfilePicture,
//     getFullName,
//     getCompletionPercentage,
//     handleUploadPicture,
//     handleDeletePicture,
//     isUploadingPicture,
//     pictureError,
//     pictureSuccess,
//   } = useProfileData();

//   const fileInputRef = useRef(null);
//   const [previewOpen, setPreviewOpen] = useState(false);

//   // ✅ Call these as functions in render — NOT cached in const above JSX
//   // This ensures the image URL re-derives from Redux state on every render
//   // after upload/delete dispatches update the store.
//   const fullName = getFullName();
//   const completion = getCompletionPercentage();

//   // ── Auto-close modal after success ──
//   useEffect(() => {
//     if (pictureSuccess) {
//       // Small delay so success message is briefly visible before closing
//       const t = setTimeout(() => setPreviewOpen(false), 1200);
//       return () => clearTimeout(t);
//     }
//   }, [pictureSuccess]);

//   // ── File change ──
//   const onFileChange = useCallback(async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     await handleUploadPicture(file);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   }, [handleUploadPicture]);

//   const handleDeleteAndClose = useCallback(async () => {
//     await handleDeletePicture();
//   }, [handleDeletePicture]);

//   // ✅ Read picture URL fresh from store on every render
//   const pictureSrc = getProfilePicture();

//   // ✅ Check the correct field — user.profile_picture_url comes from backend
//   // Your Redux slice maps it as user.profilePicture OR profile_picture_url
//   // depending on your authSlice normalisation. Check both:
//   const hasCustomPicture = !!(user?.profile_picture_url || user?.profilePicture);

//   return (
//     <>
//       {/* ── Preview Modal ── */}
//       {previewOpen && (
//         <PicturePreviewModal
//           src={pictureSrc}
//           fullName={fullName}
//           onClose={() => setPreviewOpen(false)}
//           onChangeClick={() => fileInputRef.current?.click()}
//           onDelete={handleDeleteAndClose}
//           isUploading={isUploadingPicture}
//           pictureError={pictureError}
//           pictureSuccess={pictureSuccess}
//           hasCustomPicture={hasCustomPicture}
//         />
//       )}

//       {/* Hidden file input */}
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={onFileChange}
//         className="hidden"
//         accept="image/jpeg,image/png,image/gif"
//       />

//       {/* ── Header card ── */}
//       <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl" />
//           <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl" />
//         </div>

//         <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

//           {/* Left: Avatar + info */}
//           <div className="flex items-center gap-4 sm:gap-6">

//             {/* Avatar with hover actions */}
//             <div className="relative group flex-shrink-0">

//               {/* Main avatar — click to preview */}
//               <div
//                 className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/60 shadow-lg bg-slate-100 overflow-hidden cursor-pointer"
//                 onClick={() => setPreviewOpen(true)}
//               >
//                 {isUploadingPicture ? (
//                   <div className="w-full h-full flex items-center justify-center bg-indigo-700/60">
//                     <Loader2 className="w-6 h-6 text-white animate-spin" />
//                   </div>
//                 ) : (
//                   <img
//                     src={pictureSrc}
//                     alt={fullName || user?.email}
//                     className="w-full h-full object-cover"
//                   />
//                 )}

//                 {/* Hover overlay — fades in on group hover */}
//                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//                   <Camera className="w-5 h-5 text-white" />
//                   <span className="text-white text-[10px] font-semibold tracking-wide">
//                     CHANGE
//                   </span>
//                 </div>
//               </div>

//               {/* ── Hover action buttons — appear on group hover ── */}
//               {/* Change button */}
//               <button
//                 type="button"
//                 onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
//                 disabled={isUploadingPicture}
//                 title="Change picture"
//                 className="absolute -bottom-3 -left-1 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-indigo-700 text-[10px] font-bold shadow-lg border border-indigo-100 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <Upload className="w-3 h-3" />
//                 Change
//               </button>

//               {/* Remove button — only when custom picture exists */}
//               {hasCustomPicture && (
//                 <button
//                   type="button"
//                   onClick={(e) => { e.stopPropagation(); handleDeleteAndClose(); }}
//                   disabled={isUploadingPicture}
//                   title="Remove picture"
//                   className="absolute -bottom-3 -right-1 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-red-500 text-[10px] font-bold shadow-lg border border-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <Trash2 className="w-3 h-3" />
//                   Remove
//                 </button>
//               )}

//               {/* Candidate badge */}
//               {/* <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-400 text-[10px] font-semibold text-emerald-900 shadow-md flex items-center gap-1 pointer-events-none">
//                 <ShieldCheck className="w-3 h-3" />
//                 Candidate
//               </span> */}
//             </div>

//             {/* Name / role / email */}
//             <div>
//               <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
//                 {fullName || 'Your Name'}
//               </h1>
//               <p className="text-sm sm:text-base text-indigo-100">
//                 {candidateProfile?.target_role || 'Set your target role'}
//               </p>
//               <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
//                 {user?.email}
//               </p>
//             </div>
//           </div>

//           {/* Right: completion ring + edit */}
//           <div className="flex flex-col items-end gap-4">
//             <div className="flex items-center gap-3">
//               <div className="text-right">
//                 <p className="text-xs uppercase tracking-wide text-indigo-100/80">
//                   Profile Completion
//                 </p>
//                 <p className="text-lg font-semibold">
//                   {completion.toFixed(0)}%
//                 </p>
//               </div>
//               <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10">
//                 <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
//                   <span className="text-sm font-semibold">
//                     {completion.toFixed(0)}%
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {/* <button
//                 type="button"
//                 onClick={onEditClick}
//                 className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 text-indigo-700 text-xs sm:text-sm font-semibold shadow-sm hover:bg-white transition-colors"
//               >
//                 <Edit3 className="w-4 h-4" />
//                 Edit Profile
//               </button> */}
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// };

// export default ProfileHeader;




























// src/candidateProfile/candidate/components/sections/ProfileHeader.jsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Upload, Trash2, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useProfileData from '../../hooks/useProfileData';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealDark: '#099485',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  yellow: '#F5C518',
  yellowLight: '#FEFAE8',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
};

// ─── Picture Preview Modal ─────────────────────────────────────────────────────
const PicturePreviewModal = ({
  src, fullName, onClose, onChangeClick, onDelete,
  isUploading, pictureError, pictureSuccess, hasCustomPicture,
}) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(17,24,39,0.65)', backdropFilter: 'blur(6px)', padding: '16px',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <div style={{
        background: C.white, borderRadius: '24px', width: '100%', maxWidth: '360px',
        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        border: `1px solid ${C.grayBorder}`,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${C.grayBorder}`,
        }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: C.dark }}>Profile Picture</h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: C.gray, borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px 24px', gap: '16px' }}>
          <div style={{ width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', border: `3px solid ${C.tealBorder}`, background: C.gray }}>
            {isUploading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.tealLight }}>
                <div style={{ width: '32px', height: '32px', border: `3px solid ${C.tealBorder}`, borderTopColor: C.teal, borderRadius: '50%', animation: 'ph-spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <img src={src} alt={fullName || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 700, color: C.dark, fontSize: '15px' }}>{fullName || 'Your Name'}</p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textMuted }}>Profile picture</p>
          </div>

          {pictureError && (
            <div style={{ width: '100%', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '12px', color: '#DC2626', textAlign: 'center' }}>
              {typeof pictureError === 'string' ? pictureError : pictureError?.detail || 'Upload failed'}
            </div>
          )}
          {pictureSuccess && (
            <div style={{ width: '100%', padding: '10px 14px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: '10px', fontSize: '12px', color: C.tealDark, textAlign: 'center' }}>
              {pictureSuccess}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <button
              type="button" onClick={onChangeClick} disabled={isUploading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '11px', borderRadius: '12px', border: 'none',
                background: C.teal, color: C.white, fontWeight: 700, fontSize: '13px',
                cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.6 : 1,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              <Upload size={14} />
              {isUploading ? 'Uploading...' : 'Change Picture'}
            </button>

            {hasCustomPicture && (
              <button
                type="button" onClick={onDelete} disabled={isUploading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '11px', borderRadius: '12px', border: '1px solid #FECACA',
                  background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '13px',
                  cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.6 : 1,
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                <Trash2 size={14} />
                Remove Picture
              </button>
            )}

            <button
              type="button" onClick={onClose}
              style={{
                padding: '11px', borderRadius: '12px', border: `1px solid ${C.grayBorder}`,
                background: C.gray, color: C.textMuted, fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ProfileHeader ─────────────────────────────────────────────────────────────
const ProfileHeader = ({ onEditClick }) => {
  const {
    user, candidateProfile,
    getProfilePicture, getFullName, getCompletionPercentage,
    handleUploadPicture, handleDeletePicture,
    isUploadingPicture, pictureError, pictureSuccess,
  } = useProfileData();

  const fileInputRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fullName = getFullName();
  const completion = getCompletionPercentage();
  const pictureSrc = getProfilePicture();
  const hasCustomPicture = !!(user?.profile_picture_url || user?.profilePicture);

  useEffect(() => {
    if (pictureSuccess) {
      const t = setTimeout(() => setPreviewOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [pictureSuccess]);

  useEffect(() => {
    if (pictureError) {
      toast.error(typeof pictureError === 'string' ? pictureError : pictureError?.detail || 'Upload failed');
    }
  }, [pictureError]);

  const onFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please select an image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File too large. Please select an image under 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    await handleUploadPicture(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleUploadPicture]);

  const handleDeleteAndClose = useCallback(async () => {
    await handleDeletePicture();
  }, [handleDeletePicture]);

  // Completion ring SVG
  const radius = 30;
  const circum = 2 * Math.PI * radius;
  const offset = circum - (completion / 100) * circum;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes ph-spin { to { transform: rotate(360deg); } }
        .ph-avatar-group:hover .ph-overlay { opacity: 1 !important; }
        .ph-avatar-group:hover .ph-hover-btn { opacity: 1 !important; }
      `}</style>

      {previewOpen && (
        <PicturePreviewModal
          src={pictureSrc} fullName={fullName}
          onClose={() => setPreviewOpen(false)}
          onChangeClick={() => fileInputRef.current?.click()}
          onDelete={handleDeleteAndClose}
          isUploading={isUploadingPicture}
          pictureError={pictureError}
          pictureSuccess={pictureSuccess}
          hasCustomPicture={hasCustomPicture}
        />
      )}

      <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/jpeg,image/png,image/gif" />

      {/* Header card */}
      <div style={{
        borderRadius: '22px', padding: '28px 32px', color: C.white,
        background: `linear-gradient(135deg, ${C.dark} 0%, #1F3A38 60%, #0B8A79 100%)`,
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 12px 48px rgba(11, 181, 160, 0.18)`,
        fontFamily: '"DM Sans", sans-serif',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: `${C.teal}1A`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '30%', width: '120px', height: '120px', borderRadius: '50%', background: `${C.yellow}0F`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

          {/* Left: avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

            {/* Avatar group */}
            <div className="ph-avatar-group" style={{ position: 'relative', flexShrink: 0 }}>
              <div
                onClick={() => setPreviewOpen(true)}
                style={{
                  width: '80px', height: '80px', borderRadius: '18px',
                  overflow: 'hidden', cursor: 'pointer', position: 'relative',
                  border: `2.5px solid rgba(255,255,255,0.25)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                {isUploadingPicture ? (
                  <div style={{ width: '100%', height: '100%', background: 'rgba(11,181,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: C.white, borderRadius: '50%', animation: 'ph-spin 0.8s linear infinite' }} />
                  </div>
                ) : (
                  <img src={pictureSrc} alt={fullName || user?.email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Hover overlay */}
                <div
                  className="ph-overlay"
                  style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none',
                  }}
                >
                  <Camera size={16} color={C.white} />
                  <span style={{ fontSize: '8px', fontWeight: 700, color: C.white, letterSpacing: '0.08em' }}>CHANGE</span>
                </div>
              </div>

              {/* Change button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={isUploadingPicture}
                className="ph-hover-btn"
                style={{
                  position: 'absolute', bottom: '-10px', left: '-4px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 8px', borderRadius: '8px', border: 'none',
                  background: C.white, color: C.teal, fontSize: '9px', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  opacity: 0, transition: 'opacity 0.2s',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                <Upload size={9} /> Change
              </button>

              {hasCustomPicture && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteAndClose(); }}
                  disabled={isUploadingPicture}
                  className="ph-hover-btn"
                  style={{
                    position: 'absolute', bottom: '-10px', right: '-4px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', borderRadius: '8px', border: 'none',
                    background: C.white, color: '#DC2626', fontSize: '9px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: 0, transition: 'opacity 0.2s',
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                >
                  <Trash2 size={9} /> Remove
                </button>
              )}
            </div>

            {/* Name / role / email */}
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Candidate Profile
              </p>
              <h1 style={{ margin: '0 0 3px', fontSize: '24px', fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
                {fullName || 'Your Name'}
              </h1>
              <p style={{ margin: '0 0 2px', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                {candidateProfile?.target_role || 'Set your target role'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Right: completion ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Profile Completion
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: C.white }}>{completion.toFixed(0)}%</p>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
                <circle
                  cx="36" cy="36" r={radius} fill="none"
                  stroke={C.teal} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circum}
                  strokeDashoffset={offset}
                  transform="rotate(-90 36 36)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              Complete profile for better matches
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;