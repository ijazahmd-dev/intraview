// src/pages/candidate/ProfilePage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Activity,
  CheckCircle2,
  Loader2,
  FileText,
  LayoutGrid,
  Heart,
  BarChart3,
  Settings,
} from 'lucide-react';

import ProfileSidebar from '../components/ProfileSidebar';
import useProfileData from '../hooks/useProfileData';
import { setActiveTab } from '../../profileSlice';

// Import all section components
import BasicInfoSection from '../components/sections/BasicInfoSection';
import CareerInfoSection from '../components/sections/CareerInfoSection';
import LinksSection from '../components/sections/LinksSection';
import PreferencesSection from '../components/sections/PreferencesSection';
import TokenSummary from '../components/sections/TokenSummary';
import BookingSummary from '../components/sections/BookingSummary';
import FeedbackSection from '../components/sections/FeedbackSection';

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

// 🔹 Tab Navigation Component
const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid,
      description: 'Profile info & links',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Heart,
      description: 'Interview preferences',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: BarChart3,
      description: 'Interview feedback',
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: Activity,
      description: 'Subscription & tokens',
    },
  ];

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-4 sm:px-6 sm:py-5 text-center border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-5 h-5 mx-auto mb-1 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <p
                className={`text-xs font-bold ${
                  isActive ? 'text-indigo-600' : 'text-slate-700'
                }`}
              >
                {tab.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 🔹 Main ProfilePage Component
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
  const activeTab = useSelector((state) => state.profile?.activeTab || 'overview');

  // Handle tab via query param (?tab=preferences|tokens|feedback|overview)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (['preferences', 'tokens', 'feedback'].includes(tab)) {
      dispatch(setActiveTab(tab));
    } else {
      dispatch(setActiveTab('overview'));
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    if (profileError) {
      toast.error(
        typeof profileError === 'string' ? profileError : 'Failed to load profile'
      );
    }
  }, [profileError]);

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    navigate(`/candidate/profile?tab=${tab}`);
  };

  const handleLogout = () => {
    navigate('/auth/logout');
  };

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
            We could not load your candidate profile. Please try logging in again.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar (desktop) */}
        <ProfileSidebar onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <ProfileHeader user={user} completionPercent={completionPercent} />

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Mobile navigation hint */}
          <div className="lg:hidden mb-2">
            <p className="text-xs text-slate-500 text-center">
              Use tabs above to navigate between sections. For Resume & Settings, use desktop sidebar.
            </p>
          </div>

          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <section className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content (2/3 width on desktop) */}
                <div className="lg:col-span-2 space-y-6">
                  <BasicInfoSection />
                  <CareerInfoSection />
                  <LinksSection />
                </div>

                {/* Sidebar Content (1/3 width on desktop) */}
                <div className="space-y-6">
                  <BookingSummary />

                  {/* Quick Actions */}
                  <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate('/candidate/resume')}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs sm:text-sm font-medium"
                      >
                        <span>Manage Resume</span>
                        <FileText className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() =>
                          navigate('/candidate/profile?tab=preferences')
                        }
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs sm:text-sm font-medium"
                      >
                        <span>Edit Preferences</span>
                        <Heart className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => navigate('/candidate/settings')}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs sm:text-sm font-medium"
                      >
                        <span>Account Settings</span>
                        <Settings className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========== PREFERENCES TAB ========== */}
          {activeTab === 'preferences' && (
            <section className="space-y-6">
              <PreferencesSection />
            </section>
          )}

          {/* ========== FEEDBACK TAB ========== */}
          {activeTab === 'feedback' && (
            <section className="space-y-6">
              <FeedbackSection />
            </section>
          )}

          {/* ========== TOKENS TAB ========== */}
          {activeTab === 'tokens' && (
            <section className="space-y-6">
              <TokenSummary />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
