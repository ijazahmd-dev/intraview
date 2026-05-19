// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { markAllReadThunk, markOneRead } from "../../notificationsSlice";
// import {
//   formatEventTitle,
//   formatRelativeTime,
// } from "../utils/notificationsHelpers";

// export default function NotificationDropdown() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { items, isLoadingList, error } = useSelector(
//     (state) => state.notifications
//   );

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
//     <div className="bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
//       <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
//         <span className="text-sm font-medium text-gray-800">
//           Notifications
//         </span>
//         <button
//           className="text-xs text-blue-600 hover:text-blue-700"
//           onClick={handleMarkAll}
//           type="button"
//         >
//           Mark all as read
//         </button>
//       </div>

//       <div className="max-h-80 overflow-y-auto">
//         {isLoadingList && (
//           <div className="px-3 py-4 text-xs text-gray-500">Loading...</div>
//         )}

//         {error && (
//           <div className="px-3 py-4 text-xs text-red-500">
//             Failed to load notifications: {error}
//           </div>
//         )}

//         {!isLoadingList && !error && items.length === 0 && (
//           <div className="px-3 py-6 text-xs text-gray-500 text-center">
//             You are all caught up.
//           </div>
//         )}

//         {items.map((n) => (
//           <button
//             key={n.id}
//             type="button"
//             onClick={() => handleItemClick(n)}
//             className={`w-full text-left px-3 py-2 text-xs border-b border-gray-50 hover:bg-gray-50 transition ${
//               n.is_read ? "bg-white" : "bg-blue-50/40"
//             }`}
//           >
//             <div className="flex items-start justify-between gap-2">
//               <div>
//                 <div className="text-[11px] font-semibold text-gray-800">
//                   {formatEventTitle(n)}
//                 </div>
//                 <div className="mt-0.5 text-[11px] text-gray-600">
//                   {n.body}
//                 </div>
//                 <div className="mt-0.5 text-[10px] text-gray-400 flex gap-2">
//                   {n.payload?.booking_id && (
//                     <span>Interview #{n.payload.booking_id}</span>
//                   )}
//                   {n.created_at && (
//                     <span>• {formatRelativeTime(n.created_at)}</span>
//                   )}
//                 </div>
//               </div>
//               {!n.is_read && (
//                 <span className="mt-0.5 inline-flex w-2 h-2 rounded-full bg-blue-500 shrink-0" />
//               )}
//             </div>
//           </button>
//         ))}
//       </div>

//       <div className="px-3 py-2 text-[11px] text-gray-500 bg-gray-50">
//         <Link to="/notifications" className="text-blue-600 hover:text-blue-700 hover:underline" >
//         View all
//         </Link>

          
    
        
//       </div>
//     </div>
//   );
// }
























import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { markAllReadThunk, markOneRead } from "../../notificationsSlice";
import {
  formatEventTitle,
  formatRelativeTime,
} from "../utils/notificationsHelpers";

// Icon: Bell dot (unread indicator)
function UnreadDot() {
  return (
    <span className="inline-block w-2 h-2 rounded-full bg-[#F5B800] shrink-0 mt-1" />
  );
}

// Per-event accent color for the left border
function getAccentColor(eventType) {
  if (!eventType) return "#01696f";
  const t = eventType.toUpperCase();
  if (t.includes("PAYMENT") || t.includes("PAYOUT")) return "#F5B800";
  if (t.includes("FEEDBACK")) return "#01696f";
  if (t.includes("REMINDER")) return "#F5B800";
  if (t.includes("RESCHEDULE")) return "#e07b00";
  return "#01696f";
}

export default function NotificationDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoadingList, error } = useSelector(
    (state) => state.notifications
  );

  const handleMarkAll = () => dispatch(markAllReadThunk());

  const handleItemClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markOneRead(notification.id));
    }

    // ✅ FIX: use redirect_url first, fallback to booking detail
    const redirectUrl = notification.payload?.redirect_url;
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    const bookingId = notification.payload?.booking_id;
    if (bookingId) {
      navigate(`/notifications}`);
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      style={{
        width: "360px",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 12px 32px -4px rgba(0,0,0,0.10)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#F5B800] text-[10px] font-bold text-gray-900">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="text-xs font-medium text-[#01696f] hover:text-[#0c4e54] transition-colors"
            onClick={handleMarkAll}
            type="button"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
        {isLoadingList && (
          <div className="flex flex-col gap-3 px-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoadingList && error && (
          <div className="px-4 py-5 text-xs text-red-500 text-center">
            Failed to load notifications.
          </div>
        )}

        {!isLoadingList && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-10 gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1.5"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-xs text-gray-400 font-medium">All caught up!</p>
            <p className="text-[11px] text-gray-300">
              No new notifications right now.
            </p>
          </div>
        )}

        {!isLoadingList &&
          !error &&
          items.map((n) => {
            const accent = getAccentColor(n.event_type);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleItemClick(n)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors group ${
                  n.is_read ? "bg-white" : "bg-[#fffbeb]"
                }`}
                style={{ borderLeft: `3px solid ${n.is_read ? "transparent" : accent}` }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${accent}18` }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accent}
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800 leading-snug">
                        {formatEventTitle(n)}
                      </p>
                      {!n.is_read && <UnreadDot />}
                    </div>
                    {n.payload?.body || n.body ? (
                      <p className="mt-0.5 text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                        {n.payload?.body || n.body}
                      </p>
                    ) : null}
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                      {n.payload?.booking_id && (
                        <>
                          <span
                            className="font-medium px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${accent}15`,
                              color: accent,
                            }}
                          >
                            #{n.payload.booking_id}
                          </span>
                          <span>·</span>
                        </>
                      )}
                      {n.created_at && (
                        <span>{formatRelativeTime(n.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="text-xs font-medium text-[#01696f] hover:text-[#0c4e54] transition-colors"
        >
          View all notifications →
        </button>
        <span className="text-[10px] text-gray-400">
          {items.length} total
        </span>
      </div>
    </div>
  );
}