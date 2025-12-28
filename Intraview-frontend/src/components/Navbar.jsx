// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAdminAuth } from "../context/AdminAuthContext";

// const Navbar = () => {
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const navigate = useNavigate();
//   const {logoutAdmin} = useAdminAuth()

//   return (
//     <nav 
//       className="h-16 px-6 flex items-center justify-between shadow-lg"
//       style={{ backgroundColor: 'white' }}
//     >
//       {/* Left Section - Logo and Search */}
//       <div className="flex items-center gap-6 flex-1">
//         {/* Logo */}
//         {/* <div className="flex items-center gap-3">
//           <div 
//             className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
//             style={{ background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)' }}
//           >
//             SV
//           </div>
//           <span className="text-xl font-bold" style={{ color: '#778873' }}>
//             SkillVerse
//           </span>
//         </div> */}

//         {/* Search Bar */}
//         <div className="flex-1 max-w-xl">
//           <div className="relative">
//             <svg 
//               className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
//               fill="none" 
//               stroke="#A1BC98" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               type="text"
//               placeholder="Search or type command..."
//               className="w-full pl-12 pr-20 py-3 rounded-xl focus:outline-none transition-all text-sm"
//               style={{ 
//                 backgroundColor: '#F1F3E0',
//                 border: '2px solid #D2DCB6',
//                 color: '#778873'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#A1BC98';
//                 e.target.style.boxShadow = '0 0 0 3px rgba(161, 188, 152, 0.2)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = '#D2DCB6';
//                 e.target.style.boxShadow = 'none';
//               }}
//             />
//             {/* <div 
//               className="absolute right-4 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-semibold"
//               style={{ backgroundColor: '#D2DCB6', color: '#778873' }}
//             >
//               ⌘K
//             </div> */}
//           </div>
//         </div>
//       </div>

//       {/* Right Section - Actions */}
//       <div className="flex items-center gap-4">
//         {/* Theme Toggle */}
//         {/* <button
//           className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
//           style={{ backgroundColor: '#F1F3E0' }}
//           onMouseEnter={(e) => {
//             e.target.style.backgroundColor = '#D2DCB6';
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.backgroundColor = '#F1F3E0';
//           }}
//         >
//           <svg className="w-5 h-5" fill="none" stroke="#778873" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//           </svg>
//         </button> */}

//         {/* Notifications */}
//         <button
//           className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 relative"
//           style={{ backgroundColor: '#F1F3E0' }}
//           onMouseEnter={(e) => {
//             e.target.style.backgroundColor = '#D2DCB6';
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.backgroundColor = '#F1F3E0';
//           }}
//         >
//           <svg className="w-5 h-5" fill="none" stroke="#778873" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//           </svg>
//           <span 
//             className="absolute top-1 right-1 w-2 h-2 rounded-full"
//             style={{ backgroundColor: '#DC2626' }}
//           ></span>
//         </button>

//         {/* Admin Badge */}
//         <div 
//           className="px-3 py-1 rounded-lg flex items-center gap-2"
//           style={{ backgroundColor: '#F1F3E0' }}
//         >
//           <svg className="w-4 h-4" fill="none" stroke="#778873" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//           </svg>
//           <span className="text-sm font-semibold" style={{ color: '#778873' }}>
//             Admin
//           </span>
//         </div>

//         {/* Profile */}
//         <div className="relative">
//           <button
//             onClick={() => setShowProfileMenu(!showProfileMenu)}
//             className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
//             style={{ backgroundColor: '#F1F3E0' }}
//             onMouseEnter={(e) => {
//               e.target.style.backgroundColor = '#D2DCB6';
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.backgroundColor = '#F1F3E0';
//             }}
//           >
//             <div 
//               className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
//               style={{ background: 'linear-gradient(135deg, #778873 0%, #A1BC98 100%)' }}
//             >
//               SP
//             </div>
//             <span className="text-sm font-semibold" style={{ color: '#778873' }}>
//               Shamved P
//             </span>
//             <svg 
//               className="w-4 h-4 transition-transform duration-200"
//               fill="none" 
//               stroke="#778873" 
//               viewBox="0 0 24 24"
//               style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {showProfileMenu && (
//             <div 
//               className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl overflow-hidden z-50"
//               style={{ backgroundColor: 'white' }}
//             >
//               <div className="p-4 border-b" style={{ borderColor: '#F1F3E0' }}>
//                 <p className="font-semibold" style={{ color: '#778873' }}>Shamved P</p>
//                 <p className="text-sm" style={{ color: '#778873', opacity: 0.7 }}>admin@skillverse.com</p>
//               </div>
              
//               <div className="py-2">
//                 <button
//                   onClick={() => navigate('/profile')}
//                   className="w-full px-4 py-2 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2"
//                   style={{ color: '#778873' }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = '#F1F3E0';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = 'transparent';
//                   }}
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                   Profile
//                 </button>
                
//                 <button
//                   onClick={() => navigate('/settings')}
//                   className="w-full px-4 py-2 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2"
//                   style={{ color: '#778873' }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = '#F1F3E0';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = 'transparent';
//                   }}
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                   Settings
//                 </button>
//               </div>

//               <div className="border-t py-2" style={{ borderColor: '#F1F3E0' }}>
//                 <button
//                   onClick={logoutAdmin}
//                   className="w-full px-4 py-2 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2"
//                   style={{ color: '#DC2626' }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = '#FEE2E2';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = 'transparent';
//                   }}
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                   </svg>
//                   Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


















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
    name: 'John Anderson',
    email: 'john.anderson@intraview.com',
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
          <Search 
            size={18} 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              searchFocused ? 'text-orange-500' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search or type command..."
            className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-700 placeholder-gray-400"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600 font-medium">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun size={18} className="text-gray-600" />
          ) : (
            <Moon size={18} className="text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button 
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all duration-200 relative border border-gray-200"
          title="Notifications"
        >
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Admin Badge */}
        {admin && (
          <div className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 flex items-center gap-2">
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
                className={`text-gray-400 transition-transform duration-200 ${
                  showProfileMenu ? '-rotate-90' : 'rotate-180'
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
                  
                  <div className="py-2">
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
                  </div>

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