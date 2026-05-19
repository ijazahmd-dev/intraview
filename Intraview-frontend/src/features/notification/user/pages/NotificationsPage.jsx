// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   loadNotifications,
//   markOneRead,
//   markAllReadThunk,
// } from "../../notificationsSlice";
// import {
//   formatEventTitle,
//   formatRelativeTime,
// } from "../utils/notificationsHelpers";

// export default function NotificationsPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { items, isLoadingList, error } = useSelector(
//     (state) => state.notifications
//   );

//   useEffect(() => {
//     dispatch(loadNotifications({ page: 1, pageSize: 20, unreadOnly: false }));
//   }, [dispatch]);

//   const handleMarkAll = () => {
//     dispatch(markAllReadThunk());
//   };

//   const handleItemClick = (notification) => {
//     if (!notification.is_read) {
//       dispatch(markOneRead(notification.id));
//     }
//     const bookingId = notification.payload?.booking_id;
//     if (bookingId) {
//       navigate(`/interviews/${bookingId}`);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-lg font-semibold text-gray-900">
//           Notifications
//         </h1>
//         <button
//           className="text-xs text-blue-600 hover:text-blue-700"
//           type="button"
//           onClick={handleMarkAll}
//         >
//           Mark all as read
//         </button>
//       </div>

//       {isLoadingList && (
//         <div className="text-sm text-gray-500">Loading...</div>
//       )}

//       {error && (
//         <div className="text-sm text-red-500">
//           Failed to load notifications: {error}
//         </div>
//       )}

//       {!isLoadingList && !error && items.length === 0 && (
//         <div className="mt-6 text-sm text-gray-500">
//           You have no notifications yet.
//         </div>
//       )}

//       <ul className="mt-4 space-y-2">
//         {items.map((n) => (
//           <li key={n.id}>
//             <button
//               type="button"
//               onClick={() => handleItemClick(n)}
//               className={`w-full text-left px-4 py-3 rounded-md border text-sm transition ${
//                 n.is_read
//                   ? "bg-white border-gray-200 hover:bg-gray-50"
//                   : "bg-blue-50/60 border-blue-100 hover:bg-blue-50"
//               }`}
//             >
//               <div className="flex items-start justify-between gap-2">
//                 <div>
//                   <div className="text-[13px] font-semibold text-gray-900">
//                     {formatEventTitle(n)}
//                   </div>
//                   <div className="mt-1 text-[12px] text-gray-700">
//                     {n.body}
//                   </div>
//                   <div className="mt-1 text-[11px] text-gray-500 flex gap-2">
//                     {n.payload?.booking_id && (
//                       <span>Interview #{n.payload.booking_id}</span>
//                     )}
//                     {n.created_at && (
//                       <span>• {formatRelativeTime(n.created_at)}</span>
//                     )}
//                   </div>
//                 </div>
//                 {!n.is_read && (
//                   <span className="mt-1 inline-flex w-2 h-2 rounded-full bg-blue-500 shrink-0" />
//                 )}
//               </div>
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }























import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loadNotifications,
  markOneRead,
  markAllReadThunk,
} from "../../notificationsSlice";
import {
  formatEventTitle,
  formatRelativeTime,
} from "../utils/notificationsHelpers";

// ─── helpers ────────────────────────────────────────────────────────────────

function getAccentColor(eventType) {
  if (!eventType) return "#01696f";
  const t = eventType.toUpperCase();
  if (t.includes("PAYMENT") || t.includes("PAYOUT")) return "#d97706";
  if (t.includes("REMINDER")) return "#d97706";
  if (t.includes("RESCHEDULE")) return "#c2410c";
  return "#01696f";
}

function getEventIcon(eventType) {
  const t = (eventType || "").toUpperCase();

  if (t.includes("PAYMENT") || t.includes("PAYOUT"))
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );

  if (t.includes("FEEDBACK"))
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );

  if (t.includes("REMINDER") || t.includes("BOOKED"))
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );

  if (t.includes("RESCHEDULE"))
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    );

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

// ─── component ──────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoadingList, error } = useSelector(
    (state) => state.notifications
  );
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    dispatch(loadNotifications({ page: 1, pageSize: 50, unreadOnly: false }));
  }, [dispatch]);

  const handleMarkAll = () => dispatch(markAllReadThunk());

  // ✅ redirect_url fix
  const handleItemClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markOneRead(notification.id));
    }
    const redirectUrl = notification.payload?.redirect_url;
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    const bookingId = notification.payload?.booking_id;
    if (bookingId) {
      navigate(`/interviews/${bookingId}`);
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;
  const filtered =
    activeTab === "unread" ? items.filter((n) => !n.is_read) : items;

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#01696f] text-[#01696f] hover:bg-[#01696f] hover:text-white transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-[#01696f] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold ${
                    activeTab === "unread"
                      ? "bg-white text-[#01696f]"
                      : "bg-[#F5B800] text-gray-900"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoadingList && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-100 flex gap-4 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3.5 bg-gray-100 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoadingList && error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-4 text-sm text-red-600">
            Failed to load notifications.
          </div>
        )}

        {/* Empty state */}
        {!isLoadingList && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 px-6 py-16 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#f5f5f3] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs text-gray-400 max-w-[220px]">
              {activeTab === "unread"
                ? "Switch to All to see your full history."
                : "Activity from your interviews and payments will show up here."}
            </p>
          </div>
        )}

        {/* Notification list */}
        {!isLoadingList && !error && filtered.length > 0 && (
          <ul className="space-y-2">
            {filtered.map((n) => {
              const accent = getAccentColor(n.event_type);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left rounded-xl border transition-all group ${
                      n.is_read
                        ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        : "bg-[#fffbeb] border-[#F5B800]/30 hover:border-[#F5B800]/60 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4 px-4 py-4">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${accent}14`,
                          color: accent,
                        }}
                      >
                        {getEventIcon(n.event_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {formatEventTitle(n)}
                          </p>
                          {!n.is_read && (
                            <span className="inline-block w-2 h-2 rounded-full bg-[#F5B800] shrink-0 mt-1.5" />
                          )}
                        </div>

                        {(n.payload?.body || n.body) && (
                          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                            {n.payload?.body || n.body}
                          </p>
                        )}

                        <div className="mt-2 flex items-center flex-wrap gap-2">
                          {n.payload?.booking_id && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${accent}12`,
                                color: accent,
                              }}
                            >
                              Interview #{n.payload.booking_id}
                            </span>
                          )}
                          {n.created_at && (
                            <span className="text-[11px] text-gray-400">
                              {formatRelativeTime(n.created_at)}
                            </span>
                          )}
                          {n.is_read && (
                            <span className="text-[11px] text-gray-300 flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}