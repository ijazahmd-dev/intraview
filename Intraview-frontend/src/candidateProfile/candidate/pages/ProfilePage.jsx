// src/pages/candidate/ProfilePage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Activity, CheckCircle2, Loader2, MapPin, Clock } from 'lucide-react';

import ProfileSidebar from '../components/ProfileSidebar';
import useProfileData from '../hooks/useProfileData';
import { setActiveTab } from '../../profileSlice';

// 🔹 Placeholder components (will be replaced in Part 3)
const BasicInfoSection = ({ profile, user }) => (
  <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-slate-500">Full Name</p>
        <p className="font-semibold text-slate-900">
          {profile?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set'}
        </p>
      </div>
      <div>
        <p className="text-slate-500">Email</p>
        <p className="font-semibold text-slate-900">{user?.email}</p>
      </div>
      <div>
        <p className="text-slate-500">Phone</p>
        <p className="font-semibold text-slate-900">{profile?.phone || 'Not set'}</p>
      </div>
      <div className="flex items-center gap-2">
        <div>
          <p className="text-slate-500">Location</p>
          <p className="font-semibold text-slate-900">
            {profile?.location || 'Not set'}
          </p>
        </div>
      </div>
      <div>
        <p className="text-slate-500">Timezone</p>
        <p className="font-semibold text-slate-900">
          {profile?.timezone || 'Asia/Kolkata'}
        </p>
      </div>
    </div>
  </div>
);

const CareerInfoSection = ({ profile }) => (
  <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900 mb-4">Career Information</h3>
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-slate-500">Current Status</p>
        <p className="font-semibold text-slate-900">
          {profile?.current_status || 'Not set'}
        </p>
      </div>
      <div>
        <p className="text-slate-500">Current Role</p>
        <p className="font-semibold text-slate-900">
          {profile?.current_role || 'Not set'}
        </p>
      </div>
      <div>
        <p className="text-slate-500">Target Role</p>
        <p className="font-semibold text-slate-900">
          {profile?.target_role || 'Not set'}
        </p>
      </div>
      <div>
        <p className="text-slate-500">Experience Level</p>
        <p className="font-semibold text-slate-900">
          {profile?.experience_level || 'Not set'}
        </p>
      </div>
      <div>
        <p className="text-slate-500">Years of Experience</p>
        <p className="font-semibold text-slate-900">
          {profile?.years_experience ?? 'Not set'}
        </p>
      </div>
      <div>
        <p className="text-slate-500">Primary Skills</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Array.isArray(profile?.skills) && profile.skills.length > 0 ? (
            profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="font-semibold text-slate-900">Not set</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const BookingSummarySection = () => (
  <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Summary</h3>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
        <p className="text-xs text-emerald-700 font-semibold uppercase">Upcoming</p>
        <p className="text-2xl font-bold text-emerald-800 mt-1">0</p>
      </div>
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-700 font-semibold uppercase">Completed</p>
        <p className="text-2xl font-bold text-blue-800 mt-1">0</p>
      </div>
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
        <p className="text-xs text-rose-700 font-semibold uppercase">Cancelled</p>
        <p className="text-2xl font-bold text-rose-800 mt-1">0</p>
      </div>
    </div>
  </div>
);

// 🔹 Main Profile Header
const ProfileHeader = ({ user, completionPercent }) => {
  const initials = (user?.firstName || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-white/40 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-white/80 mb-1">
              Candidate Profile
            </p>
            <h1 className="text-2xl sm:text-3xl font-black">
              {user?.firstName || user?.email || 'Your Profile'}
            </h1>
            <p className="text-sm text-indigo-100 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-emerald-200" />
            <span className="font-semibold">Profile completion</span>
          </div>
          <div className="w-56">
            <div className="flex items-center justify-between text-xs text-indigo-100 mb-1">
              <span>Overview</span>
              <span>{completionPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-indigo-800/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">
              Complete your profile to get better interview matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const {
    user,
    candidateProfile,
    completion,
    isLoadingProfile,
    isLoadingCompletion,
    profileError,
    getCompletionPercentage,
  } = useProfileData();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle tab via query param (?tab=preferences|tokens)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (tab === 'preferences') {
      dispatch(setActiveTab('preferences'));
    } else if (tab === 'tokens') {
      dispatch(setActiveTab('tokens'));
    } else {
      dispatch(setActiveTab('overview'));
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    if (profileError) {
      toast.error(
        typeof profileError === 'string'
          ? profileError
          : 'Failed to load profile'
      );
    }
  }, [profileError]);

  if (isLoadingProfile && !candidateProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!candidateProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            We could not load your candidate profile. Please try logging in
            again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const completionPercent = isLoadingCompletion
    ? completion.percentage || 0
    : getCompletionPercentage();

  const handleLogout = () => {
    // Here you should clear auth tokens / cookies and redirect
    // For now just navigate to landing
    navigate('/auth/logout'); // Or implement your own logout route
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar (desktop) */}
        <ProfileSidebar onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <ProfileHeader
            user={user}
            completionPercent={completionPercent}
          />

          {/* Mobile navigation hint */}
          <div className="lg:hidden mb-2">
            <p className="text-xs text-slate-500 text-center">
              For more sections like Resume & Settings, use the main sidebar in
              desktop view.
            </p>
          </div>

          {/* Overview Content */}
          <section className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BasicInfoSection profile={candidateProfile} user={user} />
                <CareerInfoSection profile={candidateProfile} />
              </div>
              <div className="space-y-6">
                <BookingSummarySection />
                <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-3 text-sm">
                    <button
                      onClick={() => navigate('/candidate/resume')}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                    >
                      <span>Manage Resume</span>
                      <FileText className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() =>
                        navigate('/candidate/profile?tab=preferences')
                      }
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                    >
                      <span>Edit Preferences</span>
                      <Clock className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => navigate('/candidate/settings')}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                    >
                      <span>Account Settings</span>
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
