// // src/components/navbar/CandidateNavbar.jsx
// /**
//  * CandidateNavbar
//  *
//  * Sticky top navbar for authenticated candidates.
//  * Features:
//  *   • Scroll-aware shadow
//  *   • Active-route indicator (animated underline)
//  *   • Notification bell with unread badge
//  *   • Token balance chip → navigates to /candidate/wallet
//  *   • Profile avatar → smooth dropdown (Profile, Settings, Logout)
//  *   • Responsive mobile menu (hamburger)
//  *
//  * Redux assumptions:
//  *   state.auth.user  → { first_name, last_name, profile_picture, email }
//  *   state.wallet.overview.data → { tokens_balance }   (optional)
//  *   state.notifications.unread_count                  (optional)
//  *
//  * Adapt the selectors below to match your exact slice shape.
//  */

// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";

// // ── Replace these with your real auth/logout action ──────────
// // import { logoutUser } from "../../features/auth/authSlice";

// // ── Icons ─────────────────────────────────────────────────────
// import {
//     Bell,
//     Coins,
//     ChevronDown,
//     User,
//     Settings,
//     LogOut,
//     Briefcase,
//     Menu,
//     X,
//     Home,
//     Search,
//     Bot,
//     CalendarCheck,
//     TrendingUp,
//     Wallet,
//     HeadphonesIcon,
// } from "lucide-react";

// const NAV_LINKS = [
//     { label: "Home", path: "/home", icon: Home },
//     { label: "Find Interviewers", path: "/candidate/interviewers", icon: Search },
//     { label: "AI Interview", path: "/ai-interview/roles", icon: Bot },
//     { label: "My Sessions", path: "/candidate/dashboard/upcoming", icon: CalendarCheck },
//     { label: "Progress", path: "/candidate/progress", icon: TrendingUp },
//     { label: "Wallet", path: "/candidate/wallet", icon: Wallet },
//     { label: "Subscriptions", path: "/subscriptions", icon: HeadphonesIcon },
// ];

// // ── Profile dropdown items ────────────────────────────────────
// const PROFILE_ITEMS = [
//     { label: "My Profile", path: "/candidate/profile", icon: User },
//     { label: "Settings", path: "/candidate/settings", icon: Settings },
//     { label: "Become Interviewer", path: "/interviewer/request", icon: Briefcase, divider: true },
//     { label: "Logout", action: "logout", icon: LogOut, danger: true },
// ];

// // ── Helper: get initials from name ────────────────────────────
// function getInitials(firstName, lastName) {
//     const f = (firstName || "").charAt(0).toUpperCase();
//     const l = (lastName || "").charAt(0).toUpperCase();
//     return f + l || "?";
// }

// export default function CandidateNavbar() {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     // ── Redux selectors ─────────────────────────────────────────
//     const user = useSelector((s) => s.auth?.user);
//     const tokenBalance = useSelector((s) => s.wallet?.overview?.data?.tokens_balance ?? null);
//     const unreadCount = useSelector((s) => s.notifications?.unread_count ?? 0);

//     // ── Local state ─────────────────────────────────────────────
//     const [scrolled, setScrolled] = useState(false);
//     const [profileOpen, setProfileOpen] = useState(false);
//     const [mobileOpen, setMobileOpen] = useState(false);
//     const [notifOpen, setNotifOpen] = useState(false);

//     const profileRef = useRef(null);
//     const notifRef = useRef(null);

//     // ── Scroll shadow ────────────────────────────────────────────
//     useEffect(() => {
//         const onScroll = () => setScrolled(window.scrollY > 8);
//         window.addEventListener("scroll", onScroll, { passive: true });
//         return () => window.removeEventListener("scroll", onScroll);
//     }, []);

//     // ── Close dropdowns on outside click ─────────────────────────
//     useEffect(() => {
//         const handler = (e) => {
//             if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
//             if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, []);

//     // ── Close mobile menu on route change ────────────────────────
//     useEffect(() => { setMobileOpen(false); }, [location.pathname]);

//     // ── Active route check ───────────────────────────────────────
//     const isActive = (path) => location.pathname === path ||
//         (path !== "/home" && location.pathname.startsWith(path));

//     // ── Logout handler ───────────────────────────────────────────
//     const handleLogout = () => {
//         setProfileOpen(false);
//         // dispatch(logoutUser()); ← uncomment when auth slice is wired
//         navigate("/login");
//     };

//     const handleProfileAction = (item) => {
//         setProfileOpen(false);
//         if (item.action === "logout") { handleLogout(); return; }
//         navigate(item.path);
//     };

//     // ── Profile display ───────────────────────────────────────────
//     const firstName = user?.first_name || "";
//     const lastName = user?.last_name || "";
//     const fullName = `${firstName} ${lastName}`.trim() || "Candidate";
//     const initials = getInitials(firstName, lastName);
//     const avatarSrc = user?.profile_picture || null;

//     return (
//         <>
//             <nav className={`nav-root ${scrolled ? "nav-scrolled" : ""}`}>
//                 <div className="nav-inner">

//                     {/* ── Logo ─────────────────────────────────────── */}
//                     <Link to="/home" className="nav-logo">
//                         <div className="logo-mark">
//                             <span>In</span>
//                         </div>
//                         <span className="logo-text">IntraView</span>
//                     </Link>

//                     {/* ── Desktop Nav Links ─────────────────────────── */}
//                     <div className="nav-links">
//                         {NAV_LINKS.map(({ label, path }) => (
//                             <Link
//                                 key={path}
//                                 to={path}
//                                 className={`nav-link ${isActive(path) ? "nav-link-active" : ""}`}
//                             >
//                                 {label}
//                                 {isActive(path) && <span className="nav-link-dot" />}
//                             </Link>
//                         ))}
//                     </div>

//                     {/* ── Right Controls ────────────────────────────── */}
//                     <div className="nav-right">

//                         {/* Token Balance */}
//                         <button
//                             className="token-chip"
//                             onClick={() => navigate("/candidate/wallet")}
//                             title="Your token balance"
//                         >
//                             <Coins size={14} strokeWidth={2} />
//                             <span className="token-amount">
//                                 {tokenBalance !== null ? tokenBalance.toLocaleString() : "—"}
//                             </span>
//                             <span className="token-label">tokens</span>
//                         </button>

//                         {/* Notification Bell */}
//                         <div className="nav-icon-wrap" ref={notifRef}>
//                             <button
//                                 className={`icon-btn ${notifOpen ? "icon-btn-active" : ""}`}
//                                 onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
//                                 aria-label="Notifications"
//                             >
//                                 <Bell size={18} strokeWidth={1.8} />
//                                 {unreadCount > 0 && (
//                                     <span className="notif-badge">
//                                         {unreadCount > 9 ? "9+" : unreadCount}
//                                     </span>
//                                 )}
//                             </button>

//                             {/* Notification Dropdown */}
//                             {notifOpen && (
//                                 <div className="notif-dropdown">
//                                     <div className="notif-header">
//                                         <span>Notifications</span>
//                                         {unreadCount > 0 && (
//                                             <span className="notif-count-chip">{unreadCount} new</span>
//                                         )}
//                                     </div>
//                                     {unreadCount === 0 ? (
//                                         <div className="notif-empty">
//                                             <Bell size={28} strokeWidth={1.2} />
//                                             <p>All caught up!</p>
//                                             <span>No new notifications.</span>
//                                         </div>
//                                     ) : (
//                                         <div className="notif-list">
//                                             {/* Notification items rendered by parent / NotificationsPanel */}
//                                             <p className="notif-link-all">
//                                                 <Link to="/candidate/notifications" onClick={() => setNotifOpen(false)}>
//                                                     View all notifications →
//                                                 </Link>
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Profile Avatar + Dropdown */}
//                         <div className="nav-icon-wrap" ref={profileRef}>
//                             <button
//                                 className={`avatar-btn ${profileOpen ? "avatar-btn-active" : ""}`}
//                                 onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
//                                 aria-label="Profile menu"
//                             >
//                                 {avatarSrc ? (
//                                     <img src={avatarSrc} alt={fullName} className="avatar-img" />
//                                 ) : (
//                                     <span className="avatar-initials">{initials}</span>
//                                 )}
//                                 <ChevronDown
//                                     size={12}
//                                     strokeWidth={2.5}
//                                     className={`avatar-chevron ${profileOpen ? "chevron-up" : ""}`}
//                                 />
//                             </button>

//                             {/* Profile Dropdown */}
//                             {profileOpen && (
//                                 <div className="profile-dropdown">
//                                     {/* User info header */}
//                                     <div className="profile-dd-header">
//                                         <div className="profile-dd-avatar">
//                                             {avatarSrc
//                                                 ? <img src={avatarSrc} alt={fullName} />
//                                                 : <span>{initials}</span>
//                                             }
//                                         </div>
//                                         <div>
//                                             <p className="profile-dd-name">{fullName}</p>
//                                             <p className="profile-dd-email">{user?.email || ""}</p>
//                                         </div>
//                                     </div>

//                                     <div className="profile-dd-divider" />

//                                     {PROFILE_ITEMS.map((item) => (
//                                         <div key={item.label}>
//                                             {item.divider && <div className="profile-dd-divider" />}
//                                             <button
//                                                 className={`profile-dd-item ${item.danger ? "dd-item-danger" : ""}`}
//                                                 onClick={() => handleProfileAction(item)}
//                                             >
//                                                 <item.icon size={15} strokeWidth={1.8} />
//                                                 {item.label}
//                                             </button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Mobile Hamburger */}
//                         <button
//                             className="hamburger-btn"
//                             onClick={() => setMobileOpen((p) => !p)}
//                             aria-label="Toggle menu"
//                         >
//                             {mobileOpen ? <X size={20} /> : <Menu size={20} />}
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Mobile Menu ────────────────────────────────────── */}
//                 <div className={`mobile-menu ${mobileOpen ? "mobile-menu-open" : ""}`}>
//                     <div className="mobile-menu-inner">
//                         {/* Mobile User info */}
//                         <div className="mobile-user-row">
//                             <div className="avatar-btn" style={{ pointerEvents: "none" }}>
//                                 {avatarSrc
//                                     ? <img src={avatarSrc} alt={fullName} className="avatar-img" />
//                                     : <span className="avatar-initials">{initials}</span>
//                                 }
//                             </div>
//                             <div>
//                                 <p className="mobile-user-name">{fullName}</p>
//                                 <p className="mobile-user-sub">{user?.email || "Candidate"}</p>
//                             </div>
//                             {tokenBalance !== null && (
//                                 <div className="mobile-token-chip">
//                                     <Coins size={12} />
//                                     <span>{tokenBalance.toLocaleString()}</span>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="mobile-divider" />

//                         {/* Mobile nav links */}
//                         {NAV_LINKS.map(({ label, path, icon: Icon }) => (
//                             <Link
//                                 key={path}
//                                 to={path}
//                                 className={`mobile-nav-link ${isActive(path) ? "mobile-link-active" : ""}`}
//                             >
//                                 <Icon size={17} strokeWidth={1.8} />
//                                 {label}
//                             </Link>
//                         ))}

//                         <div className="mobile-divider" />

//                         {/* Mobile profile actions */}
//                         {PROFILE_ITEMS.map((item) => (
//                             item.action === "logout" ? (
//                                 <button
//                                     key="logout"
//                                     className="mobile-nav-link mobile-logout"
//                                     onClick={handleLogout}
//                                 >
//                                     <item.icon size={17} strokeWidth={1.8} />
//                                     {item.label}
//                                 </button>
//                             ) : (
//                                 <Link
//                                     key={item.label}
//                                     to={item.path}
//                                     className="mobile-nav-link"
//                                 >
//                                     <item.icon size={17} strokeWidth={1.8} />
//                                     {item.label}
//                                 </Link>
//                             )
//                         ))}
//                     </div>
//                 </div>
//             </nav>

//             {/* Spacer so page content clears the fixed navbar */}
//             <div className="nav-spacer" />

//             {/* ── All Styles ─────────────────────────────────────────── */}
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

//         /* ── Root ───────────────────────────────────────────── */
//         .nav-root {
//           position: fixed;
//           top: 0; left: 0; right: 0;
//           z-index: 1000;
//           background: rgba(255, 255, 255, 0.97);
//           backdrop-filter: blur(12px);
//           -webkit-backdrop-filter: blur(12px);
//           border-bottom: 1px solid #e2e8f0;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//           transition: box-shadow 0.25s ease, border-color 0.25s ease;
//         }
//         .nav-scrolled {
//           box-shadow: 0 2px 20px rgba(0, 0, 0, 0.07);
//           border-color: #eff2f7;
//         }
//         .nav-spacer {
//           height: 64px;
//         }

//         /* ── Inner layout ───────────────────────────────────── */
//         .nav-inner {
//           max-width: 1280px;
//           margin: 0 auto;
//           padding: 0 24px;
//           height: 64px;
//           display: flex;
//           align-items: center;
//           gap: 0;
//         }

//         /* ── Logo ────────────────────────────────────────────── */
//         .nav-logo {
//           display: flex;
//           align-items: center;
//           gap: 9px;
//           text-decoration: none;
//           flex-shrink: 0;
//           margin-right: 32px;
//         }
//         .logo-mark {
//           width: 34px;
//           height: 34px;
//           background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
//           border-radius: 9px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 2px 8px rgba(20, 184, 166, 0.35);
//         }
//         .logo-mark span {
//           font-size: 13px;
//           font-weight: 800;
//           color: #fff;
//           letter-spacing: -0.5px;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         .logo-text {
//           font-size: 16px;
//           font-weight: 800;
//           color: #0f172a;
//           letter-spacing: -0.3px;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }

//         /* ── Desktop Nav Links ──────────────────────────────── */
//         .nav-links {
//           display: flex;
//           align-items: center;
//           gap: 2px;
//           flex: 1;
//         }
//         .nav-link {
//           position: relative;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 0;
//           padding: 6px 11px;
//           border-radius: 9px;
//           font-size: 13.5px;
//           font-weight: 500;
//           color: #64748b;
//           text-decoration: none;
//           transition: color 0.15s, background 0.15s;
//           white-space: nowrap;
//         }
//         .nav-link:hover {
//           color: #14b8a6;
//           background: rgba(20, 184, 166, 0.06);
//         }
//         .nav-link-active {
//           color: #14b8a6 !important;
//           font-weight: 600;
//           background: rgba(20, 184, 166, 0.08) !important;
//         }
//         .nav-link-dot {
//           position: absolute;
//           bottom: -1px;
//           left: 50%;
//           transform: translateX(-50%);
//           width: 20px;
//           height: 2.5px;
//           background: #14b8a6;
//           border-radius: 99px;
//           animation: dotIn 0.2s ease;
//         }
//         @keyframes dotIn {
//           from { width: 0; opacity: 0; }
//           to   { width: 20px; opacity: 1; }
//         }

//         /* ── Right controls ─────────────────────────────────── */
//         .nav-right {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-left: auto;
//         }

//         /* Token chip */
//         .token-chip {
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           padding: 6px 12px;
//           background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
//           border: 1px solid #99f6e4;
//           border-radius: 99px;
//           cursor: pointer;
//           transition: all 0.2s;
//           text-decoration: none;
//           white-space: nowrap;
//         }
//         .token-chip:hover {
//           background: linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 100%);
//           border-color: #2dd4bf;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
//         }
//         .token-chip svg { color: #0d9488; flex-shrink: 0; }
//         .token-amount {
//           font-size: 13px;
//           font-weight: 700;
//           color: #0f766e;
//           font-variant-numeric: tabular-nums;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         .token-label {
//           font-size: 11px;
//           color: #5eead4;
//           font-weight: 500;
//         }

//         /* Icon button base */
//         .nav-icon-wrap { position: relative; }
//         .icon-btn {
//           width: 38px;
//           height: 38px;
//           border-radius: 10px;
//           border: 1px solid #e2e8f0;
//           background: #fff;
//           color: #64748b;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: all 0.15s;
//           position: relative;
//         }
//         .icon-btn:hover, .icon-btn-active {
//           background: #f8fafc;
//           border-color: #cbd5e1;
//           color: #0f172a;
//         }

//         /* Notification badge */
//         .notif-badge {
//           position: absolute;
//           top: -5px;
//           right: -5px;
//           min-width: 18px;
//           height: 18px;
//           padding: 0 4px;
//           background: #ef4444;
//           color: #fff;
//           font-size: 9.5px;
//           font-weight: 700;
//           border-radius: 99px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border: 2px solid #fff;
//           animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         @keyframes badgePop {
//           from { transform: scale(0); }
//           to   { transform: scale(1); }
//         }

//         /* Notification dropdown */
//         .notif-dropdown {
//           position: absolute;
//           top: calc(100% + 10px);
//           right: 0;
//           width: 320px;
//           background: #fff;
//           border: 1px solid #e2e8f0;
//           border-radius: 16px;
//           box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
//           overflow: hidden;
//           animation: dropIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
//         }
//         .notif-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 16px 18px 12px;
//           font-size: 14px;
//           font-weight: 700;
//           color: #0f172a;
//           border-bottom: 1px solid #f1f5f9;
//         }
//         .notif-count-chip {
//           font-size: 11px;
//           font-weight: 600;
//           color: #14b8a6;
//           background: #f0fdfa;
//           border: 1px solid #99f6e4;
//           padding: 2px 9px;
//           border-radius: 99px;
//         }
//         .notif-empty {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           padding: 32px 20px;
//           gap: 8px;
//           color: #94a3b8;
//         }
//         .notif-empty p   { font-weight: 600; font-size: 14px; color: #374151; margin: 0; }
//         .notif-empty span { font-size: 12px; }
//         .notif-list { padding: 8px 0; }
//         .notif-link-all {
//           text-align: center;
//           padding: 12px;
//           margin: 0;
//           border-top: 1px solid #f1f5f9;
//         }
//         .notif-link-all a {
//           font-size: 13px;
//           color: #14b8a6;
//           text-decoration: none;
//           font-weight: 600;
//         }
//         .notif-link-all a:hover { text-decoration: underline; }

//         /* Avatar button */
//         .avatar-btn {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 4px 8px 4px 4px;
//           background: #fff;
//           border: 1px solid #e2e8f0;
//           border-radius: 99px;
//           cursor: pointer;
//           transition: all 0.15s;
//         }
//         .avatar-btn:hover, .avatar-btn-active {
//           border-color: #14b8a6;
//           background: #f0fdfa;
//         }
//         .avatar-img {
//           width: 30px;
//           height: 30px;
//           border-radius: 50%;
//           object-fit: cover;
//         }
//         .avatar-initials {
//           width: 30px;
//           height: 30px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
//           color: #fff;
//           font-size: 11.5px;
//           font-weight: 700;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           letter-spacing: 0.5px;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         .avatar-chevron {
//           color: #94a3b8;
//           transition: transform 0.2s;
//         }
//         .chevron-up { transform: rotate(180deg); }

//         /* Profile dropdown */
//         .profile-dropdown {
//           position: absolute;
//           top: calc(100% + 10px);
//           right: 0;
//           width: 240px;
//           background: #fff;
//           border: 1px solid #e2e8f0;
//           border-radius: 16px;
//           box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
//           overflow: hidden;
//           animation: dropIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
//           padding: 6px;
//         }
//         .profile-dd-header {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 10px 12px 10px;
//         }
//         .profile-dd-avatar {
//           width: 38px;
//           height: 38px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           overflow: hidden;
//         }
//         .profile-dd-avatar img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
//         .profile-dd-avatar span {
//           font-size: 13px;
//           font-weight: 700;
//           color: #fff;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         .profile-dd-name {
//           font-size: 13.5px;
//           font-weight: 700;
//           color: #0f172a;
//           margin: 0 0 2px;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           max-width: 150px;
//         }
//         .profile-dd-email {
//           font-size: 11.5px;
//           color: #94a3b8;
//           margin: 0;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           max-width: 150px;
//         }
//         .profile-dd-divider {
//           height: 1px;
//           background: #f1f5f9;
//           margin: 4px 0;
//         }
//         .profile-dd-item {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           width: 100%;
//           padding: 9px 12px;
//           background: none;
//           border: none;
//           border-radius: 9px;
//           cursor: pointer;
//           font-size: 13.5px;
//           font-weight: 500;
//           color: #374151;
//           transition: background 0.15s, color 0.15s;
//           text-align: left;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         .profile-dd-item:hover {
//           background: #f8fafc;
//           color: #0f172a;
//         }
//         .dd-item-danger { color: #ef4444 !important; }
//         .dd-item-danger:hover { background: #fff1f2 !important; }

//         /* Dropdown animation */
//         @keyframes dropIn {
//           from { opacity: 0; transform: translateY(-8px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }

//         /* ── Hamburger ──────────────────────────────────────── */
//         .hamburger-btn {
//           display: none;
//           width: 38px;
//           height: 38px;
//           border-radius: 10px;
//           border: 1px solid #e2e8f0;
//           background: #fff;
//           color: #374151;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: all 0.15s;
//           flex-shrink: 0;
//         }
//         .hamburger-btn:hover {
//           background: #f8fafc;
//           border-color: #cbd5e1;
//         }

//         /* ── Mobile Menu ────────────────────────────────────── */
//         .mobile-menu {
//           display: none;
//           overflow: hidden;
//           max-height: 0;
//           transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
//           border-top: 1px solid #f1f5f9;
//           background: #fff;
//         }
//         .mobile-menu-open {
//           max-height: 600px;
//         }
//         .mobile-menu-inner {
//           padding: 12px 16px 20px;
//         }
//         .mobile-user-row {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 10px 0 14px;
//         }
//         .mobile-user-name {
//           font-size: 14px;
//           font-weight: 700;
//           color: #0f172a;
//           margin: 0 0 2px;
//         }
//         .mobile-user-sub {
//           font-size: 11.5px;
//           color: #94a3b8;
//           margin: 0;
//         }
//         .mobile-token-chip {
//           margin-left: auto;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           background: #f0fdfa;
//           border: 1px solid #99f6e4;
//           padding: 5px 10px;
//           border-radius: 99px;
//           font-size: 12px;
//           font-weight: 700;
//           color: #0f766e;
//         }
//         .mobile-token-chip svg { color: #0d9488; }
//         .mobile-divider {
//           height: 1px;
//           background: #f1f5f9;
//           margin: 8px 0;
//         }
//         .mobile-nav-link {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 11px 12px;
//           border-radius: 10px;
//           font-size: 14px;
//           font-weight: 500;
//           color: #374151;
//           text-decoration: none;
//           transition: background 0.15s, color 0.15s;
//           width: 100%;
//           background: none;
//           border: none;
//           cursor: pointer;
//           text-align: left;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//         }
//         .mobile-nav-link:hover {
//           background: #f8fafc;
//           color: #0f172a;
//         }
//         .mobile-link-active {
//           background: rgba(20, 184, 166, 0.08) !important;
//           color: #14b8a6 !important;
//           font-weight: 600;
//         }
//         .mobile-link-active svg { color: #14b8a6; }
//         .mobile-logout {
//           color: #ef4444 !important;
//         }
//         .mobile-logout:hover {
//           background: #fff1f2 !important;
//         }

//         /* ── Responsive breakpoints ─────────────────────────── */
//         @media (max-width: 1100px) {
//           .nav-link { font-size: 12.5px; padding: 6px 8px; }
//           .logo-text { display: none; }
//           .nav-logo  { margin-right: 16px; }
//         }

//         @media (max-width: 900px) {
//           .nav-links    { display: none; }
//           .token-chip   { display: none; }
//           .hamburger-btn { display: flex; }
//           .mobile-menu   { display: block; }
//         }

//         @media (max-width: 640px) {
//           .nav-inner { padding: 0 16px; }
//           .token-label { display: none; }
//         }
//       `}</style>
//         </>
//     );
// }































// src/components/navbar/CandidateNavbar.jsx
/**
 * CandidateNavbar — Floating Pill Design
 *
 * A premium "floating card" navbar that lifts off the page,
 * inspired by the Solidroad floating-pill layout.
 *
 * Features:
 *   • Floating pill — hovers above page, shrinks subtly on scroll
 *   • Real IntraView logo image (Cloudinary)
 *   • Auth-aware: Login + Sign Up when unauthenticated
 *   • Authenticated: token chip, notifications, profile dropdown
 *   • Responsive: collapses to hamburger + separate floating mobile panel
 *
 * Redux:
 *   state.auth.user          → { first_name, last_name, profile_picture, email }
 *   state.wallet.overview.data.tokens_balance
 *   state.notifications.unread_count
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../api/authSlice";

import {
    Bell, Coins, ChevronDown, User, Settings, LogOut, Briefcase,
    Menu, X, Home, Search, Bot, CalendarCheck, TrendingUp,
    Wallet, Tag, ArrowUpRight,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const LOGO_URL =
    "https://res.cloudinary.com/dpn42vumz/image/upload/v1780132429/Intraview_logo_ysnzdc.jpg";

const AUTH_NAV = [
    { label: "Home", path: "/home", icon: Home },
    { label: "Find Interviewers", path: "/candidate/interviewers", icon: Search },
    { label: "AI Interview", path: "/ai-interview/roles", icon: Bot },
    { label: "My Sessions", path: "/candidate/dashboard/upcoming", icon: CalendarCheck },
    { label: "Progress", path: "/candidate/progress", icon: TrendingUp },
    { label: "Wallet", path: "/candidate/wallet", icon: Wallet },
    { label: "Subscriptions", path: "/subscriptions", icon: Tag },
];

const GUEST_NAV = [
    { label: "About", path: "/about" },
    { label: "Interviewers", path: "/candidate/interviewers" },
    { label: "Pricing", path: "/subscriptions" },
];

const PROFILE_ITEMS = [
    { label: "My Profile", path: "/candidate/profile", icon: User },
    { label: "Settings", path: "/candidate/settings", icon: Settings },
    { label: "Become Interviewer", path: "/interviewer/request", icon: Briefcase, divider: true },
    { label: "Logout", action: "logout", icon: LogOut, danger: true },
];

function initials(a, b) {
    return ((a || "").charAt(0) + (b || "").charAt(0)).toUpperCase() || "?";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CandidateNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((s) => s.auth?.user ?? null);
    const tokenBalance = useSelector((s) => s.wallet?.overview?.data?.tokens_balance ?? null);
    const unreadCount = useSelector((s) => s.notifications?.unread_count ?? 0);

    const isAuth = !!user;

    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Scroll detection
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    // Outside click — close dropdowns
    useEffect(() => {
        const fn = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    // Close mobile on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const isActive = (path) =>
        location.pathname === path ||
        (path !== "/home" && path !== "/" && location.pathname.startsWith(path));

    const handleLogout = async () => {
        setProfileOpen(false);
        try {
            await dispatch(logoutUser()).unwrap();
        } catch (e) {
            console.error('Logout failed', e);
        }
        navigate("/login");
    };

    const doProfileAction = (item) => {
        setProfileOpen(false);
        if (item.action === "logout") { handleLogout(); return; }
        navigate(item.path);
    };

    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Candidate";
    const userInitials = initials(firstName, lastName);
    const avatarSrc = user?.profile_picture || null;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <div className={`iv-nav-wrap ${scrolled ? "iv-scrolled" : ""}`}>

                {/* ───── Main pill ───── */}
                <nav className="iv-pill" role="navigation" aria-label="Main navigation">

                    {/* Logo */}
                    <Link to={isAuth ? "/home" : "/"} className="iv-logo" aria-label="IntraView home">
                        <img src={LOGO_URL} alt="IntraView" className="iv-logo-img" />
                    </Link>

                    {/* Divider */}
                    <div className="iv-sep" aria-hidden="true" />

                    {/* Nav links */}
                    <div className="iv-links" role="list">
                        {(isAuth ? AUTH_NAV : GUEST_NAV).map(({ label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                role="listitem"
                                className={`iv-link ${isActive(path) ? "iv-link--on" : ""}`}
                            >
                                {label}
                                {isActive(path) && <span className="iv-link-bar" aria-hidden="true" />}
                            </Link>
                        ))}
                    </div>

                    <div className="iv-flex-gap" />

                    {/* Right controls */}
                    <div className="iv-right">
                        {isAuth ? (
                            <>
                                {/* Token chip */}
                                <button
                                    className="iv-token"
                                    onClick={() => navigate("/candidate/wallet")}
                                    aria-label={`${tokenBalance} tokens — open wallet`}
                                >
                                    <Coins size={13} strokeWidth={2} aria-hidden="true" />
                                    <span className="iv-token-num">
                                        {tokenBalance !== null ? tokenBalance.toLocaleString() : "—"}
                                    </span>
                                    <span className="iv-token-lbl">tokens</span>
                                </button>

                                {/* Bell */}
                                <div className="iv-icon-wrap" ref={notifRef}>
                                    <button
                                        className={`iv-icon-btn ${notifOpen ? "iv-icon-btn--on" : ""}`}
                                        onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
                                        aria-label="Notifications"
                                        aria-expanded={notifOpen}
                                    >
                                        <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
                                        {unreadCount > 0 && (
                                            <span className="iv-badge" aria-label={`${unreadCount} unread`}>
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {notifOpen && (
                                        <div className="iv-drop" role="dialog" aria-label="Notifications">
                                            <div className="iv-drop-head">
                                                <span>Notifications</span>
                                                {unreadCount > 0 && (
                                                    <span className="iv-count-pill">{unreadCount} new</span>
                                                )}
                                            </div>
                                            {unreadCount === 0 ? (
                                                <div className="iv-drop-empty">
                                                    <Bell size={24} strokeWidth={1.2} aria-hidden="true" />
                                                    <p>All caught up</p>
                                                    <span>No new notifications</span>
                                                </div>
                                            ) : (
                                                <div className="iv-drop-body">
                                                    <Link
                                                        className="iv-view-all"
                                                        to="/candidate/notifications"
                                                        onClick={() => setNotifOpen(false)}
                                                    >
                                                        View all notifications →
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="iv-icon-wrap" ref={profileRef}>
                                    <button
                                        className={`iv-avatar-btn ${profileOpen ? "iv-avatar-btn--on" : ""}`}
                                        onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
                                        aria-label="Profile menu"
                                        aria-expanded={profileOpen}
                                    >
                                        {avatarSrc
                                            ? <img src={avatarSrc} alt={fullName} className="iv-avatar-img" />
                                            : <span className="iv-avatar-init" aria-hidden="true">{userInitials}</span>
                                        }
                                        <ChevronDown
                                            size={11}
                                            strokeWidth={2.5}
                                            className={`iv-chevron ${profileOpen ? "iv-chevron--up" : ""}`}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    {profileOpen && (
                                        <div className="iv-profile-drop" role="menu">
                                            <div className="iv-pd-head">
                                                <div className="iv-pd-avatar">
                                                    {avatarSrc
                                                        ? <img src={avatarSrc} alt={fullName} />
                                                        : <span aria-hidden="true">{userInitials}</span>
                                                    }
                                                </div>
                                                <div className="iv-pd-info">
                                                    <p className="iv-pd-name">{fullName}</p>
                                                    <p className="iv-pd-email">{user?.email || ""}</p>
                                                </div>
                                            </div>
                                            <div className="iv-pd-rule" />
                                            {PROFILE_ITEMS.map((item) => (
                                                <div key={item.label}>
                                                    {item.divider && <div className="iv-pd-rule" />}
                                                    <button
                                                        className={`iv-pd-item ${item.danger ? "iv-pd-item--red" : ""}`}
                                                        onClick={() => doProfileAction(item)}
                                                        role="menuitem"
                                                    >
                                                        <item.icon size={14} strokeWidth={1.8} aria-hidden="true" />
                                                        {item.label}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* ── Guest controls ── */
                            <>
                                <Link to="/login" className="iv-login-link">Log In</Link>
                                <Link to="/signup" className="iv-signup-btn">
                                    Sign Up
                                    <ArrowUpRight size={13} strokeWidth={2.5} aria-hidden="true" />
                                </Link>
                            </>
                        )}

                        {/* Hamburger — always visible on mobile */}
                        <button
                            className="iv-hamburger"
                            onClick={() => setMobileOpen((p) => !p)}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen
                                ? <X size={18} strokeWidth={2} aria-hidden="true" />
                                : <Menu size={18} strokeWidth={2} aria-hidden="true" />
                            }
                        </button>
                    </div>
                </nav>

                {/* ───── Mobile panel ───── */}
                <div
                    className={`iv-mobile ${mobileOpen ? "iv-mobile--open" : ""}`}
                    aria-hidden={!mobileOpen}
                >
                    <div className="iv-mobile-inner">
                        {isAuth ? (
                            <>
                                {/* User row */}
                                <div className="iv-m-user">
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt={fullName} className="iv-m-avatar" />
                                        : <span className="iv-m-init" aria-hidden="true">{userInitials}</span>
                                    }
                                    <div className="iv-m-info">
                                        <p className="iv-m-name">{fullName}</p>
                                        <p className="iv-m-email">{user?.email || "Candidate"}</p>
                                    </div>
                                    {tokenBalance !== null && (
                                        <div className="iv-m-token">
                                            <Coins size={11} aria-hidden="true" />
                                            <span>{tokenBalance.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="iv-m-rule" />

                                {AUTH_NAV.map(({ label, path, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`iv-m-link ${isActive(path) ? "iv-m-link--on" : ""}`}
                                    >
                                        <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                                        {label}
                                    </Link>
                                ))}

                                <div className="iv-m-rule" />

                                {PROFILE_ITEMS.map((item) =>
                                    item.action === "logout" ? (
                                        <button key="logout" className="iv-m-link iv-m-link--logout" onClick={handleLogout}>
                                            <item.icon size={15} strokeWidth={1.8} aria-hidden="true" />
                                            {item.label}
                                        </button>
                                    ) : (
                                        <Link key={item.label} to={item.path} className="iv-m-link">
                                            <item.icon size={15} strokeWidth={1.8} aria-hidden="true" />
                                            {item.label}
                                        </Link>
                                    )
                                )}
                            </>
                        ) : (
                            /* Guest mobile */
                            <>
                                {GUEST_NAV.map(({ label, path }) => (
                                    <Link key={path} to={path} className="iv-m-link">{label}</Link>
                                ))}
                                <div className="iv-m-rule" />
                                <Link to="/login" className="iv-m-link">Log In</Link>
                                <Link to="/signup" className="iv-m-link iv-m-link--signup">
                                    Sign Up <ArrowUpRight size={13} aria-hidden="true" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Page spacer — clears the fixed floating pill */}
            <div className="iv-spacer" aria-hidden="true" />

            {/* ─────────────────── STYLES ─────────────────── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Floating wrapper ───────────────────── */
        .iv-nav-wrap {
          position: fixed;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 1300px;
          z-index: 1000;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: top 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .iv-scrolled { top: 8px; }

        /* ── Pill ───────────────────────────────── */
        .iv-pill {
          display: flex;
          align-items: center;
          height: 62px;
          padding: 0 16px 0 12px;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.07);
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.06),
            0 1px 4px  rgba(0, 0, 0, 0.04);
          transition:
            box-shadow 0.25s ease,
            border-color 0.25s ease;
          gap: 4px;
        }
        .iv-scrolled .iv-pill {
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.10),
            0 2px 8px  rgba(0, 0, 0, 0.06);
          border-color: rgba(0,0,0,0.09);
        }

        /* ── Logo ───────────────────────────────── */
        .iv-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          text-decoration: none;
        }
        .iv-logo-img {
          height: 60px;
          width: auto;
          object-fit: contain;
          display: block;
          border-radius: 5px;
        }

        /* ── Vertical separator ─────────────────── */
        .iv-sep {
          width: 1px;
          height: 22px;
          background: #e5e7eb;
          margin: 0 12px;
          flex-shrink: 0;
        }

        /* ── Flex spacer ────────────────────────── */
        .iv-flex-gap { flex: 1 1 0; }

        /* ── Nav links ──────────────────────────── */
        .iv-links {
          display: flex;
          align-items: center;
          gap: 1px;
          overflow: hidden;
        }
        .iv-link {
          position: relative;
          padding: 7px 10px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #4b5563;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.14s, background 0.14s;
          letter-spacing: -0.1px;
        }
        .iv-link:hover {
          color: #111827;
          background: #f3f4f6;
        }
        .iv-link--on {
          color: #0d9488 !important;
          font-weight: 600;
          background: rgba(20, 184, 166, 0.09) !important;
        }
        .iv-link-bar {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          height: 2.5px;
          width: 16px;
          background: #14b8a6;
          border-radius: 99px;
          animation: barIn 0.2s ease;
        }
        @keyframes barIn {
          from { width: 0; opacity: 0; }
          to   { width: 16px; opacity: 1; }
        }

        /* ── Right zone ─────────────────────────── */
        .iv-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-left: 8px;
        }

        /* Token chip */
        .iv-token {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 99px;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .iv-token:hover {
          background: #ccfbf1;
          border-color: #2dd4bf;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(20,184,166,0.2);
        }
        .iv-token svg    { color: #0d9488; }
        .iv-token-num    { font-size: 12.5px; font-weight: 700; color: #0f766e; font-variant-numeric: tabular-nums; }
        .iv-token-lbl    { font-size: 10.5px; font-weight: 500; color: #2dd4bf; }

        /* Icon button */
        .iv-icon-wrap { position: relative; }
        .iv-icon-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #6b7280;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative;
          transition: background 0.14s, border-color 0.14s, color 0.14s;
        }
        .iv-icon-btn:hover,
        .iv-icon-btn--on {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }

        /* Notification badge */
        .iv-badge {
          position: absolute;
          top: -4px; right: -4px;
          min-width: 16px; height: 16px;
          padding: 0 3px;
          background: #ef4444;
          color: #fff;
          font-size: 9px; font-weight: 700;
          border-radius: 99px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #fff;
          animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* Dropdown shared */
        .iv-drop,
        .iv-profile-drop {
          position: absolute;
          top: calc(100% + 9px);
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05);
          animation: dropIn 0.16s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
          z-index: 10;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        /* Notif dropdown */
        .iv-drop { width: 304px; }
        .iv-drop-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 13px 15px 11px;
          font-size: 13.5px; font-weight: 700; color: #111827;
          border-bottom: 1px solid #f3f4f6;
        }
        .iv-count-pill {
          font-size: 10.5px; font-weight: 600; color: #0d9488;
          background: #f0fdfa; border: 1px solid #99f6e4;
          padding: 2px 8px; border-radius: 99px;
        }
        .iv-drop-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px 16px; gap: 6px; color: #9ca3af;
        }
        .iv-drop-empty p    { font-size: 13px; font-weight: 600; color: #374151; margin: 0; }
        .iv-drop-empty span { font-size: 11.5px; }
        .iv-drop-body { padding: 6px 0; }
        .iv-view-all {
          display: block; text-align: center;
          padding: 11px 15px;
          font-size: 12.5px; font-weight: 600; color: #14b8a6;
          text-decoration: none;
          border-top: 1px solid #f3f4f6;
          transition: color 0.13s;
        }
        .iv-view-all:hover { color: #0d9488; text-decoration: underline; }

        /* Avatar btn */
        .iv-avatar-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 8px 4px 4px;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 99px; cursor: pointer;
          transition: border-color 0.14s, background 0.14s;
        }
        .iv-avatar-btn:hover,
        .iv-avatar-btn--on {
          border-color: #14b8a6;
          background: #f0fdfa;
        }
        .iv-avatar-img {
          width: 28px; height: 28px;
          border-radius: 50%; object-fit: cover;
        }
        .iv-avatar-init {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #fff; font-size: 10.5px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 0.5px;
        }
        .iv-chevron {
          color: #9ca3af;
          transition: transform 0.2s ease;
        }
        .iv-chevron--up { transform: rotate(180deg); }

        /* Profile dropdown */
        .iv-profile-drop {
          width: 232px;
          padding: 6px;
        }
        .iv-pd-head {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 11px;
        }
        .iv-pd-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .iv-pd-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .iv-pd-avatar span { font-size: 12px; font-weight: 700; color: #fff; }
        .iv-pd-info { overflow: hidden; }
        .iv-pd-name {
          font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .iv-pd-email {
          font-size: 11px; color: #9ca3af; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .iv-pd-rule { height: 1px; background: #f3f4f6; margin: 3px 0; }
        .iv-pd-item {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 8px 11px;
          background: none; border: none;
          border-radius: 8px; cursor: pointer;
          font-size: 13px; font-weight: 500; color: #374151;
          text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.12s, color 0.12s;
        }
        .iv-pd-item:hover         { background: #f9fafb; color: #111827; }
        .iv-pd-item--red          { color: #ef4444 !important; }
        .iv-pd-item--red:hover    { background: #fef2f2 !important; }

        /* Guest CTA */
        .iv-login-link {
          padding: 7px 12px;
          font-size: 13px; font-weight: 500; color: #4b5563;
          text-decoration: none; border-radius: 9px;
          transition: color 0.13s, background 0.13s;
          white-space: nowrap;
        }
        .iv-login-link:hover { color: #111827; background: #f3f4f6; }

        .iv-signup-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 16px;
          background: #0d9488;
          color: #fff !important;
          font-size: 13px; font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(13,148,136,0.30);
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .iv-signup-btn:hover {
          background: #0f766e;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(13,148,136,0.38);
        }

        /* Hamburger */
        .iv-hamburger {
          display: none;
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid #e5e7eb; background: #fff;
          color: #374151;
          align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.13s, border-color 0.13s;
          flex-shrink: 0;
        }
        .iv-hamburger:hover { background: #f9fafb; border-color: #d1d5db; }

        /* ── Mobile panel ───────────────────────── */
        .iv-mobile {
          display: none;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.16,1,0.3,1);
          margin-top: 6px;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.09);
        }
        .iv-mobile--open { max-height: 680px; }
        .iv-mobile-inner { padding: 12px 12px 16px; }

        .iv-m-user {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 4px 12px;
        }
        .iv-m-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          object-fit: cover; flex-shrink: 0;
        }
        .iv-m-init {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: #fff; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .iv-m-info { flex: 1; min-width: 0; }
        .iv-m-name  { font-size: 13.5px; font-weight: 700; color: #111827; margin: 0 0 1px; }
        .iv-m-email { font-size: 11px; color: #9ca3af; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .iv-m-token {
          display: flex; align-items: center; gap: 4px;
          background: #f0fdfa; border: 1px solid #99f6e4;
          padding: 4px 9px; border-radius: 99px;
          font-size: 11.5px; font-weight: 700; color: #0f766e;
          white-space: nowrap; flex-shrink: 0;
        }
        .iv-m-token svg { color: #0d9488; }
        .iv-m-rule { height: 1px; background: #f3f4f6; margin: 4px 0; }
        .iv-m-link {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 12px; border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: #374151;
          text-decoration: none;
          width: 100%; background: none; border: none;
          cursor: pointer; text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.12s, color 0.12s;
        }
        .iv-m-link:hover           { background: #f9fafb; color: #111827; }
        .iv-m-link--on             { background: rgba(20,184,166,0.09) !important; color: #0d9488 !important; font-weight: 600; }
        .iv-m-link--logout         { color: #ef4444 !important; }
        .iv-m-link--logout:hover   { background: #fef2f2 !important; }
        .iv-m-link--signup         { color: #0d9488 !important; font-weight: 600; }
        .iv-m-link--signup:hover   { background: #f0fdfa !important; }

        /* ── Page spacer ────────────────────────── */
        .iv-spacer { height: 90px; }

        /* ── Responsive ─────────────────────────── */
        @media (max-width: 1200px) {
          .iv-link { font-size: 12.5px; padding: 6px 9px; }
        }
        @media (max-width: 1050px) {
          .iv-link { font-size: 12px; padding: 6px 8px; }
          .iv-token-lbl { display: none; }
        }
        @media (max-width: 900px) {
          .iv-links     { display: none; }
          .iv-sep       { display: none; }
          .iv-token     { display: none; }
          .iv-hamburger { display: flex; }
          .iv-mobile    { display: block; }
          .iv-nav-wrap  { width: calc(100% - 24px); }
        }
        @media (max-width: 600px) {
          .iv-pill { padding: 0 12px 0 10px; height: 56px; }
          .iv-logo-img { height: 38px; }
          .iv-nav-wrap { width: calc(100% - 16px); top: 8px; }
          .iv-spacer   { height: 76px; }
        }
      `}</style>
        </>
    );
}