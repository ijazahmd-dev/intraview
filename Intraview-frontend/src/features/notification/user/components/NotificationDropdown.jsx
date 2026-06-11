import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { markAllReadThunk, markOneRead } from "../../notificationsSlice";
import {
  formatEventTitle,
  formatRelativeTime,
} from "../utils/notificationsHelpers";

// ── Accent color per event type ───────────────────────────────────────────────
function getAccentColor(eventType) {
  if (!eventType) return "#14b8a6";
  const t = eventType.toUpperCase();
  if (t.includes("PAYMENT") || t.includes("PAYOUT")) return "#f59e0b";
  if (t.includes("REMINDER")) return "#f59e0b";
  if (t.includes("RESCHEDULE")) return "#f97316";
  if (t.includes("FEEDBACK")) return "#14b8a6";
  if (t.includes("ISSUE")) return "#ef4444";
  return "#14b8a6";
}

// ── Event icon per type ───────────────────────────────────────────────────────
function getEventIcon(eventType) {
  const t = (eventType || "").toUpperCase();

  if (t.includes("PAYMENT") || t.includes("PAYOUT"))
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    );

  if (t.includes("FEEDBACK"))
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );

  if (t.includes("REMINDER") || t.includes("BOOKED"))
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );

  if (t.includes("RESCHEDULE"))
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    );

  // default bell
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NotificationDropdown({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoadingList, error } = useSelector(
    (state) => state.notifications
  );

  // Only show unread notifications in the dropdown
  const unreadItems = items.filter((n) => !n.is_read);
  const unreadCount = unreadItems.length;

  const handleMarkAll = () => dispatch(markAllReadThunk());

  const handleMarkOne = (e, notification) => {
    e.stopPropagation(); // don't trigger the row click
    dispatch(markOneRead(notification.id));
  };

  const handleItemClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markOneRead(notification.id));
    }
    if (onClose) onClose();
    const redirectUrl = notification.payload?.redirect_url;
    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nd-wrap {
          animation: dropIn 0.18s ease both;
          width: 380px;
          border-radius: 16px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 20px 48px rgba(0,0,0,0.12);
          background: #fff;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }
        .nd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 12px;
          background: linear-gradient(135deg, #f0fdfa 0%, #fff 60%);
          border-bottom: 1.5px solid #e2e8f0;
        }
        .nd-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nd-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: #14b8a6;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }
        .nd-mark-all {
          font-size: 11px;
          font-weight: 700;
          color: #14b8a6;
          background: #f0fdfa;
          border: 1.5px solid #99f6e4;
          border-radius: 8px;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nd-mark-all:hover {
          background: #14b8a6;
          color: #fff;
          border-color: #14b8a6;
        }
        .nd-list {
          max-height: 380px;
          overflow-y: auto;
        }
        .nd-list::-webkit-scrollbar { width: 4px; }
        .nd-list::-webkit-scrollbar-track { background: transparent; }
        .nd-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .nd-item {
          position: relative;
          width: 100%;
          text-align: left;
          border: none;
          background: #fffbeb;
          border-bottom: 1px solid #fef3c7;
          padding: 12px 14px 12px 16px;
          cursor: pointer;
          transition: background 0.15s;
          display: block;
        }
        .nd-item:hover { background: #fef9f0; }
        .nd-item:last-child { border-bottom: none; }
        .nd-item-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: 0;
        }
        .nd-item-inner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .nd-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .nd-content { flex: 1; min-width: 0; }
        .nd-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
        .nd-item-title { font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.35; margin: 0; }
        .nd-item-body  { font-size: 11.5px; color: #64748b; margin: 3px 0 0; line-height: 1.45; }
        .nd-meta { display: flex; align-items: center; gap: 6px; margin-top: 5px; flex-wrap: wrap; }
        .nd-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 99px;
          letter-spacing: 0.02em;
        }
        .nd-time { font-size: 10px; color: #94a3b8; }
        .nd-mark-one {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: nowrap;
          margin-top: 1px;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .nd-mark-one:hover { color: #14b8a6; }
        .nd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 16px;
          gap: 8px;
          text-align: center;
        }
        .nd-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0fdfa, #fef9f0);
          border: 2px solid #ccfbf1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nd-footer {
          padding: 10px 16px;
          border-top: 1.5px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nd-view-all {
          font-size: 12px;
          font-weight: 700;
          color: #14b8a6;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s;
        }
        .nd-view-all:hover { color: #0d9488; }
        @keyframes slideOut {
          from { opacity: 1; transform: scaleY(1); max-height: 200px; }
          to   { opacity: 0; transform: scaleY(0); max-height: 0; padding: 0; }
        }
      `}</style>

      <div className="nd-wrap">
        {/* Header */}
        <div className="nd-header">
          <span className="nd-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifications
            {unreadCount > 0 && (
              <span className="nd-badge">{unreadCount}</span>
            )}
          </span>
          {unreadCount > 0 && (
            <button className="nd-mark-all" type="button" onClick={handleMarkAll}>
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="nd-list">
          {/* Loading skeleton */}
          {isLoadingList && (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", flexShrink: 0,
                    backgroundImage: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                    backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ height: 11, width: "55%", borderRadius: 4, background: "#f1f5f9",
                      backgroundImage: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                      backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite" }} />
                    <div style={{ height: 10, width: "85%", borderRadius: 4, background: "#f1f5f9",
                      backgroundImage: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                      backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoadingList && error && (
            <div style={{ padding: "14px 16px", fontSize: 12, color: "#ef4444", textAlign: "center" }}>
              Failed to load notifications.
            </div>
          )}

          {/* Empty state */}
          {!isLoadingList && !error && unreadItems.length === 0 && (
            <div className="nd-empty">
              <div className="nd-empty-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>All caught up! 🎉</p>
              <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0 }}>No unread notifications right now.</p>
            </div>
          )}

          {/* Notification items — only unread */}
          {!isLoadingList && !error && unreadItems.map((n) => {
            const accent = getAccentColor(n.event_type);
            return (
              <button
                key={n.id}
                type="button"
                className="nd-item"
                onClick={() => handleItemClick(n)}
              >
                {/* Accent left border */}
                <div className="nd-item-accent" style={{ background: accent }} />

                <div className="nd-item-inner">
                  {/* Icon */}
                  <div
                    className="nd-icon"
                    style={{ background: `${accent}18`, color: accent, border: `1.5px solid ${accent}30` }}
                  >
                    {getEventIcon(n.event_type)}
                  </div>

                  {/* Content */}
                  <div className="nd-content">
                    <div className="nd-row">
                      <p className="nd-item-title">{formatEventTitle(n)}</p>
                      <button
                        type="button"
                        className="nd-mark-one"
                        onClick={(e) => handleMarkOne(e, n)}
                        title="Mark as read"
                      >
                        ✓ Read
                      </button>
                    </div>

                    {(n.payload?.body || n.body) && (
                      <p className="nd-item-body">
                        {(n.payload?.body || n.body).length > 70
                          ? (n.payload?.body || n.body).slice(0, 70) + "…"
                          : (n.payload?.body || n.body)}
                      </p>
                    )}

                    <div className="nd-meta">
                      {n.payload?.booking_id && (
                        <span
                          className="nd-tag"
                          style={{ background: `${accent}15`, color: accent }}
                        >
                          #{n.payload.booking_id}
                        </span>
                      )}
                      {n.created_at && (
                        <span className="nd-time">{formatRelativeTime(n.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="nd-footer">
          <button
            type="button"
            className="nd-view-all"
            onClick={() => { navigate("/notifications"); if (onClose) onClose(); }}
          >
            View all notifications
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <span style={{ fontSize: 10, color: "#cbd5e1" }}>
            {unreadCount} unread
          </span>
        </div>
      </div>
    </>
  );
}