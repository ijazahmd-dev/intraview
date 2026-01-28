// src/pages/candidate/components/ProfileSidebar.jsx
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  FileText,
  SlidersHorizontal,
  WalletCards,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../profileSlice';

const navItems = [
  {
    id: 'overview',
    label: 'Profile Overview',
    icon: User,
    to: '/candidate/profile',
  },
  {
    id: 'resume',
    label: 'Resume & Documents',
    icon: FileText,
    to: '/candidate/resume',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: SlidersHorizontal,
    to: '/candidate/profile?tab=preferences',
  },
  {
    id: 'tokens',
    label: 'Tokens & Subscription',
    icon: WalletCards,
    to: '/candidate/profile?tab=tokens',
  },
  {
    id: 'settings',
    label: 'Account Settings',
    icon: ShieldCheck,
    to: '/candidate/settings',
  },
];

const ProfileSidebar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavClick = (item) => {
    // Update Redux activeTab for in-page sections
    if (item.id === 'overview') {
      dispatch(setActiveTab('overview'));
    } else if (item.id === 'preferences') {
      dispatch(setActiveTab('preferences'));
    } else if (item.id === 'tokens') {
      dispatch(setActiveTab('tokens'));
    }

    navigate(item.to);
  };

  const isActiveRoute = (item) => {
    if (item.id === 'overview' && location.pathname === '/candidate/profile' && !location.search) {
      return true;
    }
    if (item.id === 'preferences' && location.pathname === '/candidate/profile' && location.search.includes('tab=preferences')) {
      return true;
    }
    if (item.id === 'tokens' && location.pathname === '/candidate/profile' && location.search.includes('tab=tokens')) {
      return true;
    }
    if (item.id === 'resume' && location.pathname === '/candidate/resume') {
      return true;
    }
    if (item.id === 'settings' && location.pathname === '/candidate/settings') {
      return true;
    }
    return false;
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-72 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Candidate
        </p>
        <h2 className="text-xl font-bold text-slate-900">Profile Center</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal info, resume, and settings.
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
