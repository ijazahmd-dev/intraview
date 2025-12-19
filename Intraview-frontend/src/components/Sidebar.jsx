import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: "Dashboard",
      path: "/admin/dashboard",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: "Users",
      path: "/admin/users",
      badge: ""
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: "Interviewer Applications",
      path: "/admin/interviewers",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      label: "Companies",
      path: "/admin/companies",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      label: "Sessions",
      path: "/admin/sessions",
      badge: "12"
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: "Reports",
      path: "/admin/reports",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      label: "CMS",
      path: "/admin/cms",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: "Notifications",
      path: "/admin/notifications",
      badge: "5"
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: "Payments",
      path: "/admin/payments",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Settings",
      path: "/admin/settings",
      badge: null
    },
    { 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Support",
      path: "/admin/support",
      badge: null
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div 
    // h-screen  
      className="   flex flex-col transition-all duration-300 shadow-2xl"
      style={{ 
        width: collapsed ? '80px' : '280px',
        backgroundColor: '#ffffffff'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b-2" style={{ borderColor: '#D2DCB6' }}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl"
              style={{ background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)' }}
            >
              In
            </div>
            <span className="text-xl font-bold" style={{ color: '#778873' }}>
              IntraView
            </span>
          </div>
        )}
        {collapsed && (
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl mx-auto"
            style={{ background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)' }}
          >
            SV
          </div>
        )}
      </div>

      {/* Search */}
      {/* {!collapsed && (
        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2 rounded-xl focus:outline-none text-sm transition-all"
            style={{ 
              backgroundColor: 'white',
              border: '2px solid #D2DCB6',
              color: '#778873'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#A1BC98';
              e.target.style.boxShadow = '0 0 0 3px rgba(161, 188, 152, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D2DCB6';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      )} */}

      {/* Menu Items */}
      <div className="flex-1 py-4" style={{
                          overflowY: 'auto',
                          scrollbarWidth: 'none', /* Firefox */
                          msOverflowStyle: 'none', /* IE/Edge */
                        }}
                        css={`
                          &::-webkit-scrollbar {
                            display: none; /* Chrome/Safari */
                          }
                        `} >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="w-full px-4 py-3 flex items-center justify-between transition-all duration-200 group"
            style={{
              backgroundColor: isActive(item.path) ? 'white' : 'transparent',
              borderLeft: isActive(item.path) ? '4px solid #778873' : '4px solid transparent',
              color: isActive(item.path) ? '#778873' : '#778873'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.paddingLeft = '20px';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.paddingLeft = '16px';
              }
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ color: isActive(item.path) ? '#778873' : '#A1BC98' }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span 
                  className="font-semibold text-sm"
                  style={{ 
                    color: isActive(item.path) ? '#778873' : '#778873',
                    opacity: isActive(item.path) ? 1 : 0.7
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>
            {!collapsed && item.badge && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-bold"
                style={{ 
                  backgroundColor: isActive(item.path) ? '#D2DCB6' : '#D2DCB6',
                  color: '#778873'
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t-2" style={{ borderColor: '#D2DCB6' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-200"
          style={{ 
            backgroundColor: 'white',
            color: '#778873'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#D2DCB6';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
          }}
        >
          <svg 
            className="w-5 h-5 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;