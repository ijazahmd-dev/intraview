// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { fetchDashboardSummary } from "../interviewerDashboardApi";

// const navItems = [
//   { to: "/interviewer/dashboard", label: "Dashboard" },
//   { to: "/interviewer/dashboard/profile", label: "Interviewer Profile" },
//   { to: "/interviewer/dashboard/availability", label: "Availability" },
// ];

// export default function InterviewerDashboardLayout() {
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       try {
//         const { data } = await fetchDashboardSummary();
//         if (!mounted) return;
//         setSummary(data);
//       } catch {
//         // If not active interviewer, send away
//         navigate("/home", { replace: true });
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [navigate]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <p className="text-slate-500 text-sm">Loading dashboard...</p>
//       </div>
//     );
//   }

//   const name = summary?.header?.name || "Interviewer";

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white border-r border-slate-100 flex flex-col">
//         <div className="px-5 py-4 border-b border-slate-100">
//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-sm font-semibold text-white">
//               {name[0]?.toUpperCase() || "IN"}
//             </div>
//             <div>
//               <p className="text-xs text-slate-400">IntraView</p>
//               <p className="text-sm font-semibold text-slate-800">Interviewer</p>
//             </div>
//           </div>
//         </div>

//         <nav className="flex-1 px-3 py-4 space-y-1">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               end={item.to === "/interviewer/dashboard"}
//               className={({ isActive }) =>
//                 [
//                   "flex items-center px-3 py-2 rounded-lg text-sm transition",
//                   isActive
//                     ? "bg-slate-900 text-white"
//                     : "text-slate-600 hover:bg-slate-100",
//                 ].join(" ")
//               }
//             >
//               {item.label}
//             </NavLink>
//           ))}
//         </nav>

//         <div className="px-4 py-4 border-t border-slate-100 text-xs text-slate-500">
//           <p>{name}</p>
//           <button
//             onClick={() => navigate("/interviewer/login")}
//             className="mt-2 text-slate-400 hover:text-slate-700"
//           >
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main area */}
//       <div className="flex-1 flex flex-col">
//         {/* Topbar */}
//         <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6">
//           <div>
//             <p className="text-xs text-slate-400">Welcome back</p>
//             <p className="text-sm font-semibold text-slate-800">
//               {name}, let’s make a difference today.
//             </p>
//           </div>
//           <button className="px-4 py-2 rounded-full bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800">
//             Schedule New Session
//           </button>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 p-6 overflow-y-auto">
//           <Outlet context={{ summary }} />
//         </main>
//       </div>
//     </div>
//   );
// }




















import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../interviewerDashboardApi";
import { logoutInterviewer } from "../../authentication/interviewerAuthSlice";
import { useDispatch } from "react-redux";

const navItems = [
  { 
    to: "/interviewer/dashboard", 
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    // ✅ ADD VERIFICATION HERE (top priority for new interviewers)
    to: "/interviewer/dashboard/verification", 
    label: "Verification",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    to: "/interviewer/dashboard/profile", 
    label: "Interviewer Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  { 
    to: "/interviewer/dashboard/availability", 
    label: "Availability",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    to: "/interviewer/dashboard/upcoming", 
    label: "Upcoming Sessions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    to: "/interviewer/dashboard/completed", 
    label: "Session History", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
  to: "/interviewer/dashboard/wallet",
  label: "Wallet",
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m2-6h-4a2 2 0 100 4h4m0-4v4" />
    </svg>
  ),
},
{
  to: "/interviewer/dashboard/subscriptions",
  label: "Subscriptions",
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7h8m-8 4h8m-8 4h5M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
      />
    </svg>
  ),
},



  

];

export default function InterviewerDashboardLayout() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
  try {
    await dispatch(logoutInterviewer()).unwrap();
    navigate("/interviewer/login", { replace: true });
  } catch {
    navigate("/interviewer/login", { replace: true });
  }
};

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await fetchDashboardSummary();
        if (!mounted) return;
        setSummary(data);
      } catch {
        // If not active interviewer, send away
        navigate("/home", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const name = summary?.header?.name || "Interviewer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col shadow-sm">
        {/* Logo & Brand */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-medium text-slate-800">IntraView</h1>
              <p className="text-xs text-slate-500 font-light">Interviewer Portal</p>
            </div>
          </div>
          
          {/* User Profile Card */}
          {/* <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                {name[0]?.toUpperCase() || "IN"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-500 font-light">Active Interviewer</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/interviewer/dashboard"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-slate-800 text-white shadow-lg shadow-slate-300/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-72 bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-medium text-slate-800">IntraView</h1>
                  <p className="text-xs text-slate-500 font-light">Interviewer Portal</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/interviewer/dashboard"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-slate-800 text-white shadow-lg shadow-slate-300/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? "text-white" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 px-6 py-5 border-t border-slate-100 bg-white">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div>
              <p className="text-xs text-slate-400 font-light mb-0.5">Welcome back</p>
              <p className="text-base font-medium text-slate-800">
                {name}, let's make a difference today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-sm font-medium text-white hover:bg-slate-900 transition-all shadow-lg shadow-slate-300/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Schedule Interview</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ summary }} />
        </main>
      </div>
    </div>
  );
}