import { useEffect } from "react";
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

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoadingList, error } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(loadNotifications({ page: 1, pageSize: 20, unreadOnly: false }));
  }, [dispatch]);

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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Notifications
        </h1>
        <button
          className="text-xs text-blue-600 hover:text-blue-700"
          type="button"
          onClick={handleMarkAll}
        >
          Mark all as read
        </button>
      </div>

      {isLoadingList && (
        <div className="text-sm text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="text-sm text-red-500">
          Failed to load notifications: {error}
        </div>
      )}

      {!isLoadingList && !error && items.length === 0 && (
        <div className="mt-6 text-sm text-gray-500">
          You have no notifications yet.
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => handleItemClick(n)}
              className={`w-full text-left px-4 py-3 rounded-md border text-sm transition ${
                n.is_read
                  ? "bg-white border-gray-200 hover:bg-gray-50"
                  : "bg-blue-50/60 border-blue-100 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    {formatEventTitle(n)}
                  </div>
                  <div className="mt-1 text-[12px] text-gray-700">
                    {n.body}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 flex gap-2">
                    {n.payload?.booking_id && (
                      <span>Interview #{n.payload.booking_id}</span>
                    )}
                    {n.created_at && (
                      <span>• {formatRelativeTime(n.created_at)}</span>
                    )}
                  </div>
                </div>
                {!n.is_read && (
                  <span className="mt-1 inline-flex w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
