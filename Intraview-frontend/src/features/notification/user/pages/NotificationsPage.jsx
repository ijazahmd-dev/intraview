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
import CandidateNavbar from "../../../../components/CandidateNavbar";

// ─── Color helpers ────────────────────────────────────────────────────────────

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

function getEventIcon(eventType) {
  const t = (eventType || "").toUpperCase();

  if (t.includes("PAYMENT") || t.includes("PAYOUT"))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    );

  if (t.includes("FEEDBACK"))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );

  if (t.includes("REMINDER") || t.includes("BOOKED"))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );

  if (t.includes("RESCHEDULE"))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    );

  if (t.includes("ISSUE"))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoadingList, error } = useSelector(
    (state) => state.notifications
  );

  // Fetch unread notifications on mount
  useEffect(() => {
    dispatch(loadNotifications({ page: 1, pageSize: 50, unreadOnly: false }));
  }, [dispatch]);

  // Only show unread items — when marked read they're removed from Redux immediately
  const unreadItems = items.filter((n) => !n.is_read);
  const unreadCount = unreadItems.length;

  const handleMarkAll = () => dispatch(markAllReadThunk());

  // Mark one as read — Redux removes it from items instantly
  const handleMarkOne = (e, notification) => {
    e.stopPropagation();
    dispatch(markOneRead(notification.id));
  };

  const handleItemClick = (notification) => {
    dispatch(markOneRead(notification.id));
    const redirectUrl = notification.payload?.redirect_url;
    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .np-root * { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* Card */
        .np-card {
          background: linear-gradient(135deg, #f0fdfa 0%, #fffbeb 100%);
          border-radius: 14px;
          border: 1.5px solid #14b8a6;
          transition: all 0.18s ease;
          cursor: pointer;
          width: 100%;
          text-align: left;
          position: relative;
          overflow: hidden;
          display: block;
        }
        .np-card:hover {
          border-color: #0d9488;
          box-shadow: 0 6px 24px rgba(20,184,166,0.15);
          transform: translateY(-1.5px);
        }

        /* Mark one read button */
        .np-mark-one {
          font-size: 11px;
          font-weight: 700;
          color: #14b8a6;
          background: rgba(20,184,166,0.08);
          border: 1.5px solid rgba(20,184,166,0.25);
          border-radius: 99px;
          padding: 3px 10px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .np-mark-one:hover {
          background: #14b8a6;
          color: #fff;
          border-color: #14b8a6;
        }

        /* Mark all button */
        .np-mark-all {
          font-size: 12.5px;
          font-weight: 700;
          color: #14b8a6;
          background: transparent;
          border: 1.5px solid #14b8a6;
          border-radius: 10px;
          padding: 7px 16px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .np-mark-all:hover {
          background: #14b8a6;
          color: #fff;
        }

        /* Shimmer skeleton */
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .np-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }

        /* Fade in per card */
        @keyframes np-fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .np-animate { animation: np-fadeIn 0.22s ease both; }
      `}</style>

      <div className="np-root max-w-2xl mx-auto px-4 pt-10 pb-20">

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            {/* Breadcrumb pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f0fdfa", border: "1.5px solid #99f6e4",
              borderRadius: 99, padding: "3px 12px", marginBottom: 10,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Inbox
              </span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
              Notifications
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 5, margin: "5px 0 0" }}>
              {unreadCount > 0 ? (
                <>
                  <span style={{ color: "#14b8a6", fontWeight: 700 }}>{unreadCount} unread</span>
                  <span> — you have new activity</span>
                </>
              ) : (
                "You're all caught up 🎉"
              )}
            </p>
          </div>

          {unreadCount > 0 && (
            <button type="button" onClick={handleMarkAll} className="np-mark-all">
              Mark all read
            </button>
          )}
        </div>

        {/* ── Stats strip ── */}
        {unreadCount > 0 && (
          <div style={{
            display: "flex", gap: 12, marginBottom: 24,
          }}>
            <div style={{
              flex: 1, background: "#fff", borderRadius: 12,
              border: "1.5px solid #e2e8f0", padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#14b8a6", margin: 0, lineHeight: 1 }}>{unreadCount}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Unread</p>
              </div>
            </div>
            <div style={{
              background: "linear-gradient(135deg,#14b8a6,#0d9488)",
              borderRadius: 12, padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer",
            }}
              onClick={handleMarkAll}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                Clear all
              </span>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {isLoadingList && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14,
                border: "1.5px solid #e2e8f0", padding: "16px 18px",
                display: "flex", gap: 14,
              }}>
                <div className="np-skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  <div className="np-skeleton" style={{ height: 13, width: "42%" }} />
                  <div className="np-skeleton" style={{ height: 11, width: "78%" }} />
                  <div className="np-skeleton" style={{ height: 10, width: "28%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!isLoadingList && error && (
          <div style={{
            background: "#fef2f2", border: "1.5px solid #fca5a5",
            borderRadius: 12, padding: "14px 18px",
            color: "#dc2626", fontSize: 13, fontWeight: 500,
          }}>
            ⚠️ Failed to load notifications. Please try again.
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoadingList && !error && unreadItems.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 20,
            border: "1.5px solid #e2e8f0",
            padding: "56px 24px",
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", gap: 12,
          }}>
            {/* Animated bell icon */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg,#f0fdfa 0%,#fffbeb 100%)",
              border: "2px solid #ccfbf1",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(20,184,166,0.12)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.6">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                You're all caught up!
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 260, margin: "6px auto 0", lineHeight: 1.5 }}>
                No unread notifications. Activity from your interviews and payments will appear here.
              </p>
            </div>
          </div>
        )}

        {/* ── Notification list (unread only) ── */}
        {!isLoadingList && !error && unreadItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {unreadItems.map((n, idx) => {
              const accent = getAccentColor(n.event_type);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className="np-card np-animate"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Accent left bar */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 4, background: accent,
                    borderRadius: "14px 0 0 14px",
                  }} />

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "15px 16px 15px 20px" }}>

                    {/* Icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      background: `${accent}18`,
                      color: accent,
                      border: `1.5px solid ${accent}35`,
                    }}>
                      {getEventIcon(n.event_type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Top row: title + mark read button */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.35 }}>
                          {formatEventTitle(n)}
                        </p>
                        <button
                          type="button"
                          className="np-mark-one"
                          onClick={(e) => handleMarkOne(e, n)}
                          title="Mark as read"
                        >
                          ✓ Mark read
                        </button>
                      </div>

                      {/* Body */}
                      {(n.payload?.body || n.body) && (
                        <p style={{ marginTop: 4, fontSize: 12.5, color: "#64748b", lineHeight: 1.55, margin: "4px 0 0" }}>
                          {n.payload?.body || n.body}
                        </p>
                      )}

                      {/* Meta row */}
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {n.payload?.booking_id && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 8px",
                            borderRadius: 99, background: `${accent}14`, color: accent,
                          }}>
                            Interview #{n.payload.booking_id}
                          </span>
                        )}
                        {n.created_at && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {formatRelativeTime(n.created_at)}
                          </span>
                        )}
                        {n.payload?.redirect_url && (
                          <span style={{
                            marginLeft: "auto", fontSize: 11, fontWeight: 700,
                            color: accent, display: "flex", alignItems: "center", gap: 3,
                          }}>
                            View details
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}