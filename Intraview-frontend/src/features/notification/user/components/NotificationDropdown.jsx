import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { markAllReadThunk, markOneRead } from "../../notificationsSlice";
import {
  formatEventTitle,
  formatRelativeTime,
} from "../utils/notificationsHelpers";

export default function NotificationDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoadingList, error } = useSelector(
    (state) => state.notifications
  );

  const handleMarkAll = () => {
    dispatch(markAllReadThunk());
  };

  const handleItemClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markOneRead(notification.id));
    }

    const bookingId = notification.payload?.booking_id;
    if (bookingId) {
      navigate(`/interviews/${bookingId}`);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-800">
          Notifications
        </span>
        <button
          className="text-xs text-blue-600 hover:text-blue-700"
          onClick={handleMarkAll}
          type="button"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoadingList && (
          <div className="px-3 py-4 text-xs text-gray-500">Loading...</div>
        )}

        {error && (
          <div className="px-3 py-4 text-xs text-red-500">
            Failed to load notifications: {error}
          </div>
        )}

        {!isLoadingList && !error && items.length === 0 && (
          <div className="px-3 py-6 text-xs text-gray-500 text-center">
            You are all caught up.
          </div>
        )}

        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => handleItemClick(n)}
            className={`w-full text-left px-3 py-2 text-xs border-b border-gray-50 hover:bg-gray-50 transition ${
              n.is_read ? "bg-white" : "bg-blue-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold text-gray-800">
                  {formatEventTitle(n)}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-600">
                  {n.body}
                </div>
                <div className="mt-0.5 text-[10px] text-gray-400 flex gap-2">
                  {n.payload?.booking_id && (
                    <span>Interview #{n.payload.booking_id}</span>
                  )}
                  {n.created_at && (
                    <span>• {formatRelativeTime(n.created_at)}</span>
                  )}
                </div>
              </div>
              {!n.is_read && (
                <span className="mt-0.5 inline-flex w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="px-3 py-2 text-[11px] text-gray-500 bg-gray-50">
        <Link to="/notifications" className="text-blue-600 hover:text-blue-700 hover:underline" >
        View all
        </Link>

          
    
        
      </div>
    </div>
  );
}
