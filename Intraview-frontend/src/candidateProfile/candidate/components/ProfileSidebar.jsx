// // src/pages/candidate/components/ProfileSidebar.jsx
// import React from 'react';
// import { NavLink, useLocation, useNavigate } from 'react-router-dom';
// import {
//   User,
//   FileText,
//   SlidersHorizontal,
//   WalletCards,
//   ShieldCheck,
//   LogOut,
//   AlertCircle,
//   MessageSquare,
// } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { setActiveTab } from '../../profileSlice';

// const navItems = [
//   {
//     id: 'overview',
//     label: 'Profile Overview',
//     icon: User,
//     to: '/candidate/profile',
//   },
//   {
//     id: 'resume',
//     label: 'Resume & Documents',
//     icon: FileText,
//     to: '/candidate/resume',
//   },
//   {
//     id: 'preferences',
//     label: 'Preferences',
//     icon: SlidersHorizontal,
//     to: '/candidate/profile?tab=preferences',
//   },
//   {
//     id: 'tokens',
//     label: 'Tokens & Subscription',
//     icon: WalletCards,
//     to: '/candidate/profile?tab=tokens',
//   },
//   {
//     id: 'settings',
//     label: 'Account Settings',
//     icon: ShieldCheck,
//     to: '/candidate/settings',
//   },
//   {
//     id: 'issues',
//     label: 'My Issues',
//     icon: AlertCircle,
//     to: '/my-issues',
//   },
//   {
//     id: 'feedback',
//     label: 'My Feedbacks',
//     icon: MessageSquare,
//     to: '/candidate/feedback',
//   },
// ];

// const ProfileSidebar = ({ onLogout }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleNavClick = (item) => {
//     // Update Redux activeTab for in-page sections
//     if (item.id === 'overview') {
//       dispatch(setActiveTab('overview'));
//     } else if (item.id === 'preferences') {
//       dispatch(setActiveTab('preferences'));
//     } else if (item.id === 'tokens') {
//       dispatch(setActiveTab('tokens'));
//     }

//     navigate(item.to);
//   };

//   const isActiveRoute = (item) => {
//     if (item.id === 'overview' && location.pathname === '/candidate/profile' && !location.search) {
//       return true;
//     }
//     if (item.id === 'preferences' && location.pathname === '/candidate/profile' && location.search.includes('tab=preferences')) {
//       return true;
//     }
//     if (item.id === 'tokens' && location.pathname === '/candidate/profile' && location.search.includes('tab=tokens')) {
//       return true;
//     }
//     if (item.id === 'resume' && location.pathname === '/candidate/resume') {
//       return true;
//     }
//     if (item.id === 'settings' && location.pathname === '/candidate/settings') {
//       return true;
//     }
//     if (item.id === 'issues' && location.pathname.startsWith('/my-issues')) {
//       return true;
//     }
//     if (item.id === 'feedback' && location.pathname.startsWith('/candidate/feedback')) {
//       return true;
//     }
//     return false;
//   };

//   return (
//     <aside className="hidden lg:flex lg:flex-col w-72 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-6">
//       <div className="mb-6">
//         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
//           Candidate
//         </p>
//         <h2 className="text-xl font-bold text-slate-900">Profile Center</h2>
//         <p className="text-xs text-slate-500 mt-1">
//           Manage your personal info, resume, and settings.
//         </p>
//       </div>

//       <nav className="flex-1 space-y-1">
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const active = isActiveRoute(item);
//           return (
//             <button
//               key={item.id}
//               onClick={() => handleNavClick(item)}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${active
//                   ? 'bg-indigo-600 text-white shadow-lg'
//                   : 'text-slate-700 hover:bg-slate-100'
//                 }`}
//             >
//               <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
//               <span>{item.label}</span>
//             </button>
//           );
//         })}
//       </nav>

//       <div className="pt-4 mt-4 border-t border-slate-200">
//         <button
//           onClick={onLogout}
//           className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
//         >
//           <LogOut className="w-4 h-4" />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default ProfileSidebar;






















// src/pages/candidate/components/ProfileSidebar.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User, FileText, SlidersHorizontal, WalletCards,
  ShieldCheck, LogOut, AlertCircle, MessageSquare,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../profileSlice';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
};

const navItems = [
  { id: 'overview', label: 'Profile Overview', icon: User, to: '/candidate/profile' },
  { id: 'resume', label: 'Resume & Documents', icon: FileText, to: '/candidate/resume' },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal, to: '/candidate/profile?tab=preferences' },
  { id: 'tokens', label: 'Tokens & Subscription', icon: WalletCards, to: '/candidate/profile?tab=tokens' },
  { id: 'settings', label: 'Account Settings', icon: ShieldCheck, to: '/candidate/settings' },
  { id: 'issues', label: 'My Issues', icon: AlertCircle, to: '/my-issues' },
  { id: 'feedback', label: 'My Feedbacks', icon: MessageSquare, to: '/candidate/feedback' },
];

const ProfileSidebar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavClick = (item) => {
    if (item.id === 'overview') dispatch(setActiveTab('overview'));
    if (item.id === 'preferences') dispatch(setActiveTab('preferences'));
    if (item.id === 'tokens') dispatch(setActiveTab('tokens'));
    navigate(item.to);
  };

  const isActiveRoute = (item) => {
    if (item.id === 'overview' && location.pathname === '/candidate/profile' && !location.search) return true;
    if (item.id === 'preferences' && location.pathname === '/candidate/profile' && location.search.includes('tab=preferences')) return true;
    if (item.id === 'tokens' && location.pathname === '/candidate/profile' && location.search.includes('tab=tokens')) return true;
    if (item.id === 'resume' && location.pathname === '/candidate/resume') return true;
    if (item.id === 'settings' && location.pathname === '/candidate/settings') return true;
    if (item.id === 'issues' && location.pathname.startsWith('/my-issues')) return true;
    if (item.id === 'feedback' && location.pathname.startsWith('/candidate/feedback')) return true;
    return false;
  };

  return (
    <aside className="lg-sidebar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .lg-sidebar {
          display: flex;
          flex-direction: column;
          width: 260px;
          flex-shrink: 0;
          background: ${C.white};
          border-radius: 20px;
          border: 1px solid ${C.grayBorder};
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
          padding: 24px;
          position: sticky;
          top: 24px;
          align-self: flex-start;
          font-family: "DM Sans", sans-serif;
        }
      `}</style>

      {/* Brand mark */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: C.tealLight, borderRadius: '10px', padding: '6px 12px',
          marginBottom: '10px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.teal }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Candidate
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: C.dark }}>Profile Center</h2>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted }}>
          Manage your info, resume & settings.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: C.grayBorder, marginBottom: '12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '12px', border: 'none',
                background: active ? C.teal : 'transparent',
                color: active ? C.white : C.text,
                fontWeight: active ? 700 : 500, fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                fontFamily: '"DM Sans", sans-serif',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.tealLight; e.currentTarget.style.color = C.teal; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text; } }}
            >
              <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: C.grayBorder, margin: '16px 0 12px' }} />

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '12px', border: `1px solid #FECACA`,
          background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '13px',
          cursor: 'pointer', width: '100%', transition: 'all 0.15s',
          fontFamily: '"DM Sans", sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
        onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
      >
        <LogOut size={14} />
        Logout
      </button>
    </aside>
  );
};

export default ProfileSidebar;