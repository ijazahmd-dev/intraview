

import React, { useState } from 'react';
import {
  Search, Command, User, LogOut, Moon, Sun, Bell,
  Settings, ChevronLeft
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAdmin } from '../authentication/adminAuthSlice';


const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Mock admin data - replace with your Redux state
  const admin = {
    name: '',
    email: '',
    role: 'Admin'
  };
  const dispatch = useDispatch();
  // const { admin } = useSelector((state) => state.adminAuth);

  const handleLogout = () => {
    // Add your logout logic here
    dispatch(logoutAdmin());
    setShowProfileMenu(false);
    console.log('Logging out...');
    setShowProfileMenu(false);
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      {/* Left Section - Search */}
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="flex-1 relative">
          {/* <Search
            size={18}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${searchFocused ? 'text-orange-500' : 'text-gray-400'
              }`}
          /> */}
          {/* <input
            type="text"
            placeholder="Search or type command..."
            className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700 placeholder-gray-400"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          /> */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600 font-medium">
            {/* <Command size={10} />
            <span></span> */}
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        {/* <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun size={18} className="text-gray-600" />
          ) : (
            <Moon size={18} className="text-gray-600" />
          )}
        </button> */}

        {/* Notifications */}
        {/* <button
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all duration-200 relative border border-gray-200"
          title="Notifications"
        >
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button> */}

        {/* Admin Badge */}
        {admin && (
          <div className="px-3 py-1.5 frounded-lg bg-orange-50 border border-orange-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-orange-700">
              {admin.role}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200"></div>

        {/* Profile */}
        {admin && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                {admin.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500">
                  {admin.email}
                </p>
              </div>
              <ChevronLeft
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? '-rotate-90' : 'rotate-180'
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                ></div>

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-white border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md">
                        {admin.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {admin.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {admin.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-orange-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Active Now</span>
                    </div>
                  </div>

                  {/* <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Add navigation logic here
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-3"
                    >
                      <User size={16} className="text-gray-500" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Add navigation logic here
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-3"
                    >
                      <Settings size={16} className="text-gray-500" />
                      <span>Account Settings</span>
                    </button>
                  </div> */}

                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-3"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;