// src/pages/candidate/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Chrome,
  LogOut,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import ProfileSidebar from '../components/ProfileSidebar';
import { useProfileData } from '../hooks/useProfileData';
import useProfileForm from '../hooks/useProfileForm';

// ============================================
// CHANGE PASSWORD SECTION
// ============================================

const ChangePasswordSection = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const initialData = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  const {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    isDirty,
    resetForm,
    errors,
  } = useProfileForm(initialData, async (data) => {
    // Validate passwords match
    if (data.new_password !== data.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate password strength
    if (data.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(data.new_password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(data.new_password)) {
      toast.error('Password must contain at least one number');
      return;
    }

    setIsChanging(true);

    try {
      // TODO: API call to change password
      // await API.post('/auth/change-password/', data);
      
      // Mock success for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Password changed successfully!');
      resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setIsChanging(false);
    }
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    await handleSubmit(e);
  };

  const disabled = isChanging;

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-2xl bg-indigo-50">
          <Lock className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Change password</h3>
          <p className="text-xs text-slate-500 mt-1">
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Current password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {getFieldError('current_password') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('current_password')}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {getFieldError('new_password') && (
            <p className="mt-1 text-xs text-rose-600">
              {getFieldError('new_password')}
            </p>
          )}
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <p className={formData.new_password?.length >= 8 ? 'text-emerald-600' : ''}>
              ✓ At least 8 characters
            </p>
            <p className={/[A-Z]/.test(formData.new_password) ? 'text-emerald-600' : ''}>
              ✓ One uppercase letter
            </p>
            <p className={/[0-9]/.test(formData.new_password) ? 'text-emerald-600' : ''}>
              ✓ One number
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {formData.new_password &&
            formData.confirm_password &&
            formData.new_password !== formData.confirm_password && (
              <p className="mt-1 text-xs text-rose-600">Passwords do not match</p>
            )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={resetForm}
            disabled={disabled || !isDirty}
            className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={disabled || !isDirty}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
          >
            {isChanging && <Loader2 className="w-4 h-4 animate-spin" />}
            Change password
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// CONNECTED LOGINS SECTION
// ============================================

const ConnectedLoginsSection = () => {
  const [connectedLogins, setConnectedLogins] = useState({
    email: true,
    google: false,
    github: false,
  });

  const [isConnecting, setIsConnecting] = useState(null);

  const handleConnect = async (provider) => {
    setIsConnecting(provider);

    try {
      // TODO: API call to connect OAuth provider
      // await API.post(`/auth/connect/${provider}/`);

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setConnectedLogins((prev) => ({
        ...prev,
        [provider]: true,
      }));

      toast.success(`${provider} connected successfully!`);
    } catch (error) {
      toast.error(`Failed to connect ${provider}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (provider === 'email') {
      toast.error('Cannot disconnect your primary email login');
      return;
    }

    setIsConnecting(provider);

    try {
      // TODO: API call to disconnect OAuth provider
      // await API.post(`/auth/disconnect/${provider}/`);

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setConnectedLogins((prev) => ({
        ...prev,
        [provider]: false,
      }));

      toast.success(`${provider} disconnected successfully!`);
    } catch (error) {
      toast.error(`Failed to disconnect ${provider}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const logins = [
    {
      id: 'email',
      name: 'Email & Password',
      icon: Mail,
      description: 'Your primary login method',
      connected: connectedLogins.email,
      isPrimary: true,
    },
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      description: 'Sign in with your Google account',
      connected: connectedLogins.google,
      isPrimary: false,
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Chrome,
      description: 'Sign in with your GitHub account',
      connected: connectedLogins.github,
      isPrimary: false,
    },
  ];

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Connected logins</h3>
        <p className="text-xs text-slate-500 mt-1">
          Manage your login methods to access Intraview.
        </p>
      </div>

      <div className="space-y-3">
        {logins.map((login) => {
          const Icon = login.icon;
          const isLoading = isConnecting === login.id;

          return (
            <div
              key={login.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white border border-slate-200">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {login.name}
                  </p>
                  <p className="text-xs text-slate-500">{login.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {login.connected ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">
                        Connected
                      </span>
                    </span>
                    {!login.isPrimary && (
                      <button
                        onClick={() => handleDisconnect(login.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-2xl hover:bg-rose-50 disabled:opacity-40"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Disconnect'
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(login.id)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-2xl hover:bg-indigo-50 disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// ACCOUNT PREFERENCES SECTION
// ============================================

const AccountPreferencesSection = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    sessionReminders: true,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    toast.success('Preference updated!');
  };

  return (
    <div className="bg-white/80 rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          Account preferences
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Control how you receive communications.
        </p>
      </div>

      <div className="space-y-3">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Email notifications
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Receive important updates about your account
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
          </label>
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Marketing emails
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tips, updates, and product news from Intraview
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketingEmails}
              onChange={() => handleToggle('marketingEmails')}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
          </label>
        </div>

        {/* Session Reminders */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Session reminders
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Reminders before your interviews
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sessionReminders}
              onChange={() => handleToggle('sessionReminders')}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
          </label>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DANGER ZONE SECTION
// ============================================

const DangerZoneSection = ({ onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <div className="bg-white/80 rounded-3xl border border-rose-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-2xl bg-rose-50">
            <LogOut className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Logout</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sign out from your account
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Logout?</h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600">
                Are you sure you want to logout? You'll be signed out from all your devices.
              </p>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// MAIN PAGE
// ============================================

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useProfileData();

  const handleLogout = () => {
    // Clear auth tokens, etc.
    // localStorage.removeItem('token');
    // dispatch logout action if using Redux auth
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <ProfileSidebar onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-indigo-100 mb-1">
                  Account Management
                </p>
                <h1 className="text-2xl sm:text-3xl font-black">Account Settings</h1>
                <p className="text-sm text-indigo-100 mt-2 max-w-md">
                  Manage your password, login methods, and account preferences.
                </p>
              </div>
              <Lock className="w-16 h-16 text-indigo-300 opacity-50" />
            </div>
          </div>

          {/* Security Alert */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Keep your account secure
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Use a strong password and review your login methods regularly.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ChangePasswordSection />
              <ConnectedLoginsSection />
              <AccountPreferencesSection />
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 shadow-sm sticky top-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Account info
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    {user?.email}
                  </p>
                  <p>
                    <span className="font-semibold">Name:</span>{' '}
                    {user?.firstName || 'Not set'}
                  </p>
                </div>
              </div>

              <DangerZoneSection onLogout={handleLogout} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
