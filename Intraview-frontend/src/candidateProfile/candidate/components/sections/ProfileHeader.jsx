// src/pages/candidate/components/sections/ProfileHeader.jsx
import React from 'react';
import { ShieldCheck, Edit3 } from 'lucide-react';
import useProfileData from '../../hooks/useProfileData';

const ProfileHeader = ({ onEditClick }) => {
  const {
    user,
    candidateProfile,
    getProfilePicture,
    getFullName,
    getCompletionPercentage,
  } = useProfileData();

  const fullName = getFullName();
  const completion = getCompletionPercentage();

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Left: Avatar + Basic Info */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative">
            <img
              src={getProfilePicture()}
              alt={fullName || user?.email}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/60 shadow-lg object-cover bg-slate-100"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-emerald-400 text-xs font-semibold text-emerald-900 shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Candidate
            </span>
          </div>

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

        {/* Right: Completion + Buttons */}
        <div className="flex flex-col items-end gap-4">
          {/* Completion */}
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

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 text-indigo-700 text-xs sm:text-sm font-semibold shadow-sm hover:bg-white"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
