// // src/candidateProfile/candidate/components/sections/ProfileHeader.jsx




// import React, { useRef } from 'react';
// import { ShieldCheck, Edit3, Camera, Trash2, Loader2 } from 'lucide-react';
// import useProfileData from '../../hooks/useProfileData';

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

//   const onFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       await handleUploadPicture(file);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const fullName = getFullName();
//   const completion = getCompletionPercentage();

//   return (
//     <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
//       <div className="absolute inset-0 opacity-10 pointer-events-none">
//         <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl" />
//         <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl" />
//       </div>

//       <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
//         {/* Left: Avatar + Basic Info */}
//         <div className="flex items-center gap-4 sm:gap-6">
//           <div className="relative group">
//             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/60 shadow-lg bg-slate-100 overflow-hidden relative">
//               <img
//                 src={getProfilePicture()}
//                 alt={fullName || user?.email}
//                 className="w-full h-full object-cover"
//               />
//               {/* Overlay for upload */}
//               <div
//                 className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 {isUploadingPicture ? (
//                   <Loader2 className="w-5 h-5 text-white animate-spin" />
//                 ) : (
//                   <Camera className="w-5 h-5 text-white" />
//                 )}
//               </div>
//             </div>

//             {user?.profilePicture && (
//               <button
//                 onClick={handleDeletePicture}
//                 disabled={isUploadingPicture}
//                 className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 z-10 disabled:opacity-50"
//                 title="Remove picture"
//               >
//                 <Trash2 className="w-3 h-3" />
//               </button>
//             )}

//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={onFileChange}
//               className="hidden"
//               accept="image/jpeg,image/png,image/gif"
//             />

//             <span className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-emerald-400 text-xs font-semibold text-emerald-900 shadow-md flex items-center gap-1">
//               <ShieldCheck className="w-3 h-3" />
//               Candidate
//             </span>
//           </div>

//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
//               {fullName || 'Your Name'}
//             </h1>
//             <p className="text-sm sm:text-base text-indigo-100">
//               {candidateProfile?.target_role || 'Set your target role'}
//             </p>
//             <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
//               {user?.email}
//             </p>
//           </div>
//         </div>

//         {/* Right: Completion + Buttons */}
//         {/* Right: Completion + edit */}
//         <div className="flex flex-col items-end gap-4">

//           {/* Picture upload feedback */}
//           {pictureError && (
//             <p className="text-xs text-red-200 bg-red-500/30 rounded-lg px-3 py-1">
//               {typeof pictureError === "string"
//                 ? pictureError
//                 : pictureError?.detail || "Upload failed"}
//             </p>
//           )}
//           {pictureSuccess && (
//             <p className="text-xs text-green-200 bg-green-500/30 rounded-lg px-3 py-1">
//               {pictureSuccess}
//             </p>
//           )}

//           {/* Completion */}
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <p className="text-xs uppercase tracking-wide text-indigo-100/80">
//                 Profile Completion
//               </p>
//               <p className="text-lg font-semibold">
//                 {completion.toFixed(0)}%
//               </p>
//             </div>
//             <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10">
//               <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
//                 <span className="text-sm font-semibold">
//                   {completion.toFixed(0)}%
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={onEditClick}
//               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 text-indigo-700 text-xs sm:text-sm font-semibold shadow-sm hover:bg-white"
//             >
//               <Edit3 className="w-4 h-4" />
//               Edit Profile
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileHeader;






















// src/candidateProfile/candidate/components/sections/ProfileHeader.jsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Edit3, Loader2, X, Upload, Trash2, Camera } from 'lucide-react';
import useProfileData from '../../hooks/useProfileData';

// ─── Picture Preview Modal ────────────────────────────────────────────────────

const PicturePreviewModal = ({
  src,
  fullName,
  onClose,
  onChangeClick,
  onDelete,
  isUploading,
  pictureError,
  pictureSuccess,
  hasCustomPicture,
}) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Profile Picture</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Picture + actions */}
        <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-5">

          {/* Large preview — fills the box entirely */}
          <div className="w-48 h-48 rounded-2xl border-4 border-slate-100 shadow-lg bg-slate-50 overflow-hidden">
            {isUploading ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <img
                src={src}
                alt={fullName || 'Profile picture'}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Name */}
          <div className="text-center">
            <p className="text-base font-semibold text-slate-900">{fullName || 'Your Name'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Profile picture</p>
          </div>

          {/* Feedback */}
          {pictureError && (
            <p className="w-full text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {typeof pictureError === 'string'
                ? pictureError
                : pictureError?.detail || 'Upload failed'}
            </p>
          )}
          {pictureSuccess && (
            <p className="w-full text-center text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              {pictureSuccess}
            </p>
          )}

          {/* Buttons */}
          <div className="w-full flex flex-col gap-2">
            <button
              type="button"
              onClick={onChangeClick}
              disabled={isUploading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Change Picture'}
            </button>

            {/* ✅ Always render when hasCustomPicture — key fix */}
            {hasCustomPicture && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Remove Picture
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ProfileHeader ────────────────────────────────────────────────────────────

const ProfileHeader = ({ onEditClick }) => {
  const {
    user,
    candidateProfile,
    getProfilePicture,
    getFullName,
    getCompletionPercentage,
    handleUploadPicture,
    handleDeletePicture,
    isUploadingPicture,
    pictureError,
    pictureSuccess,
  } = useProfileData();

  const fileInputRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ✅ Call these as functions in render — NOT cached in const above JSX
  // This ensures the image URL re-derives from Redux state on every render
  // after upload/delete dispatches update the store.
  const fullName = getFullName();
  const completion = getCompletionPercentage();

  // ── Auto-close modal after success ──
  useEffect(() => {
    if (pictureSuccess) {
      // Small delay so success message is briefly visible before closing
      const t = setTimeout(() => setPreviewOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [pictureSuccess]);

  // ── File change ──
  const onFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUploadPicture(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleUploadPicture]);

  const handleDeleteAndClose = useCallback(async () => {
    await handleDeletePicture();
  }, [handleDeletePicture]);

  // ✅ Read picture URL fresh from store on every render
  const pictureSrc = getProfilePicture();

  // ✅ Check the correct field — user.profile_picture_url comes from backend
  // Your Redux slice maps it as user.profilePicture OR profile_picture_url
  // depending on your authSlice normalisation. Check both:
  const hasCustomPicture = !!(user?.profile_picture_url || user?.profilePicture);

  return (
    <>
      {/* ── Preview Modal ── */}
      {previewOpen && (
        <PicturePreviewModal
          src={pictureSrc}
          fullName={fullName}
          onClose={() => setPreviewOpen(false)}
          onChangeClick={() => fileInputRef.current?.click()}
          onDelete={handleDeleteAndClose}
          isUploading={isUploadingPicture}
          pictureError={pictureError}
          pictureSuccess={pictureSuccess}
          hasCustomPicture={hasCustomPicture}
        />
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/gif"
      />

      {/* ── Header card ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Left: Avatar + info */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Avatar with hover actions */}
            <div className="relative group flex-shrink-0">

              {/* Main avatar — click to preview */}
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/60 shadow-lg bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => setPreviewOpen(true)}
              >
                {isUploadingPicture ? (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-700/60">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                ) : (
                  <img
                    src={pictureSrc}
                    alt={fullName || user?.email}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Hover overlay — fades in on group hover */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-white text-[10px] font-semibold tracking-wide">
                    CHANGE
                  </span>
                </div>
              </div>

              {/* ── Hover action buttons — appear on group hover ── */}
              {/* Change button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={isUploadingPicture}
                title="Change picture"
                className="absolute -bottom-3 -left-1 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-indigo-700 text-[10px] font-bold shadow-lg border border-indigo-100 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="w-3 h-3" />
                Change
              </button>

              {/* Remove button — only when custom picture exists */}
              {hasCustomPicture && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteAndClose(); }}
                  disabled={isUploadingPicture}
                  title="Remove picture"
                  className="absolute -bottom-3 -right-1 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-red-500 text-[10px] font-bold shadow-lg border border-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}

              {/* Candidate badge */}
              {/* <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-400 text-[10px] font-semibold text-emerald-900 shadow-md flex items-center gap-1 pointer-events-none">
                <ShieldCheck className="w-3 h-3" />
                Candidate
              </span> */}
            </div>

            {/* Name / role / email */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {fullName || 'Your Name'}
              </h1>
              <p className="text-sm sm:text-base text-indigo-100">
                {candidateProfile?.target_role || 'Set your target role'}
              </p>
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Right: completion ring + edit */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-indigo-100/80">
                  Profile Completion
                </p>
                <p className="text-lg font-semibold">
                  {completion.toFixed(0)}%
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {completion.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* <button
                type="button"
                onClick={onEditClick}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 text-indigo-700 text-xs sm:text-sm font-semibold shadow-sm hover:bg-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button> */}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfileHeader;