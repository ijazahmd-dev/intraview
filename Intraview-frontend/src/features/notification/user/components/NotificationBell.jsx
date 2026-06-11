import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadUnreadCount,
  loadNotifications,
  setDropdownOpen,
} from "../../notificationsSlice";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell({ variant = "circular" }) {
  const dispatch = useDispatch();
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const dropdownOpen = useSelector((state) => state.notifications.dropdownOpen);

  // Initial REST fetch on mount — ensures count is correct even if WS
  // hasn't connected yet. Real-time updates come via useNotificationSocket
  // mounted globally in App.jsx.
  useEffect(() => {
    dispatch(loadUnreadCount());
  }, [dispatch]);

  const toggleDropdown = () => {
    const next = !dropdownOpen;
    dispatch(setDropdownOpen(next));
    if (next) {
      // Limit dropdown to 10 latest notifications
      dispatch(loadNotifications({ page: 1, pageSize: 10, unreadOnly: false }));
    }
  };

  return (
    <div className="relative">
      {variant === "pill" ? (
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm relative"
          onClick={toggleDropdown}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
          onClick={toggleDropdown}
        >
          <span className="sr-only">Notifications</span>
          <svg
            className="w-5 h-5 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <NotificationDropdown />
        </div>
      )}
    </div>
  );
}
