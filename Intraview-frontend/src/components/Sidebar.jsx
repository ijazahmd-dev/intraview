import React, { useState } from 'react';
import { 
  Home, Users, UserCheck, Building2, Video, 
  FileText, Database, Bell, CreditCard, 
  Settings, HelpCircle, ChevronLeft, ChevronRight, X, Share2, IdCard, Layers, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();  // ✅ Already imported correctly
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard', fullLabel: 'Dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users', fullLabel: 'User Management' },
    { icon: UserCheck, label: 'Interviewer Applicati...', path: '/admin/interviewers', fullLabel: 'Interviewer Applications' },
    { icon: IdCard, label: 'Interviewer KYC', path: '/admin/interviewers/verifications', fullLabel: 'Interviewer Verification',},
    { icon: CreditCard, label: 'Token Packs', path: '/admin/token-packs', fullLabel: 'Token Packs' },
    { icon: FileText, label: 'User Plans', path: '/admin/subscription-plans', fullLabel: 'User Subscription Plans' },
    { icon: UserCheck, label: 'Interviewer Plans', path: '/admin/interviewer-subscription-plans', fullLabel: 'Interviewer Subscription Plans' },
    { icon: Building2, label: 'Companies', path: '/admin/companies', fullLabel: 'Companies' },
    { icon: Video, label: 'Sessions', path: '/admin/sessions', badge: 12, fullLabel: 'Interview Sessions' },
    { icon: FileText, label: 'Reports', path: '/admin/reports', fullLabel: 'Reports' },
    { icon: Database, label: 'CMS', path: '/admin/cms', fullLabel: 'Content Management' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications', badge: 3, fullLabel: 'Notifications' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments', fullLabel: 'Payments' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/admin/settings', fullLabel: 'Settings' },
    { icon: HelpCircle, label: 'Support', path: '/admin/support', fullLabel: 'Support' },
  ];

  // ✅ NAVIGATION HANDLER
  const handleNavigation = (path) => {
    navigate(path);
    // Optional: Close sidebar on mobile
    // setIsCollapsed(true);
  };

  const MenuItem = ({ icon: Icon, label, badge, fullLabel, path }) => (
    <button
      onClick={() => handleNavigation(path)}  // ✅ ADD NAVIGATION
      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group relative"
    >
      <Icon size={20} className="flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium truncate">{label}</span>
          {badge && (
            <span className="ml-auto bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && fullLabel && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {fullLabel}
        </div>
      )}
      {isCollapsed && badge && (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">In</span>
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-gray-800 text-lg">IntraView</span>
            )}
          </div>
          
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}  // ✅ COLLAPSE HANDLER
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </nav>
        </div>

        {/* Bottom Items */}
        <div className="border-t border-gray-200 py-4 px-3">
          <nav className="space-y-1">
            {bottomItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </nav>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}  // ✅ TOGGLE HANDLER
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight size={14} className="text-gray-600" />
          ) : (
            <ChevronLeft size={14} className="text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
