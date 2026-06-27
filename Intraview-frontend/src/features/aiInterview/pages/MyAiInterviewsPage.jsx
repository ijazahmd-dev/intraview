// src/features/aiInterview/pages/MyAiInterviewsPage.jsx

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMyAiInterviewHistory,
  setHistoryFilters,
  resetHistory,
} from "../slice/aiInterviewHistorySlice";
import CandidateNavbar from "../../../components/CandidateNavbar";
import CandidateFooter from "../../../components/CandidateFooter";

// ── Design tokens (matches the rest of the candidate area) ───────────────────
const C = {
  teal: "#0BB5A0",
  tealDark: "#099688",
  tealLight: "#E6F8F6",
  tealBorder: "#B3E8E3",
  yellow: "#F5C518",
  yellowLight: "#FEFAE8",
  yellowBorder: "#EDD87A",
  dark: "#111827",
  gray50: "#F5F5F5",
  gray100: "#F0F0F0",
  grayBorder: "#E0E0E0",
  white: "#FFFFFF",
  text: "#1F2937",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
};

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  COMPLETED: { bg: C.tealLight, color: C.tealDark, border: C.tealBorder, label: "Completed" },
  LIVE: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Live" },
  READY: { bg: C.yellowLight, color: "#92400E", border: C.yellowBorder, label: "Ready" },
  CREATED: { bg: C.yellowLight, color: "#92400E", border: C.yellowBorder, label: "Created" },
  CANCELLED: { bg: "#FEF2F2", color: "#9F1239", border: "#FECDD3", label: "Cancelled" },
  FAILED: { bg: "#FEF2F2", color: "#9F1239", border: "#FECDD3", label: "Failed" },
};

const ROUND_LABELS = {
  WARMUP: "Warm-up",
  BEHAVIORAL: "Behavioral",
  ROLE_RELATED: "Role Related",
  CODING: "Coding",
};

const DIFFICULTY_LABELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  PROFESSIONAL: "Professional",
};

// ── Small components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    bg: C.gray100, color: C.textMuted, border: C.grayBorder, label: status,
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function ScoreChip({ score }) {
  if (score === null || score === undefined) {
    return <span style={{ fontSize: 13, color: C.textLight }}>—</span>;
  }
  const num = Number(score);
  const color = num >= 7.5 ? C.tealDark : num >= 5 ? "#B45309" : "#B91C1C";
  return (
    <span style={{ fontSize: 15, fontWeight: 800, color }}>
      {num.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 500, color: C.textLight }}> / 10</span>
    </span>
  );
}

function PillTag({ label }) {
  return (
    <span style={{
      display: "inline-block",
      background: C.gray50, border: `1px solid ${C.grayBorder}`,
      padding: "2px 9px", borderRadius: 999,
      fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.03em",
    }}>{label}</span>
  );
}

// ── Session row card ──────────────────────────────────────────────────────────
function SessionRow({ session, onViewReport }) {
  const [hovered, setHovered] = useState(false);
  const hasReport = session.status === "COMPLETED" && session.overall_score !== null;
  const showReportBtn = session.status === "COMPLETED";

  const date = session.created_at
    ? new Date(session.created_at).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    })
    : "—";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white,
        border: `1.5px solid ${hovered ? C.teal : C.grayBorder}`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 16,
        transition: "all 0.18s ease",
        boxShadow: hovered
          ? "0 4px 20px rgba(11,181,160,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Role + tags */}
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: C.dark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {session.role_name || "Unknown Role"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          <PillTag label={ROUND_LABELS[session.round_type] || session.round_type} />
          <PillTag label={DIFFICULTY_LABELS[session.difficulty] || session.difficulty} />
          <PillTag label={`${session.duration_minutes} min`} />
        </div>
      </div>

      {/* Date */}
      <div style={{ textAlign: "center", minWidth: 90 }}>
        <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{date}</p>
      </div>

      {/* Status */}
      <div style={{ textAlign: "center", minWidth: 110 }}>
        <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</p>
        <StatusBadge status={session.status} />
      </div>

      {/* Score */}
      <div style={{ textAlign: "center", minWidth: 80 }}>
        <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</p>
        <ScoreChip score={session.overall_score} />
      </div>

      {/* Action */}
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        {showReportBtn ? (
          <button
            onClick={() => onViewReport(session.id)}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background: hasReport
                ? `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`
                : C.gray100,
              color: hasReport ? C.white : C.textMuted,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "\"DM Sans\", sans-serif",
              boxShadow: hasReport ? "0 2px 10px rgba(11,181,160,0.25)" : "none",
            }}
            onMouseEnter={e => { if (hasReport) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {hasReport ? "View Report" : "Report Pending"}
          </button>
        ) : (
          <span style={{ fontSize: 12, color: C.textLight, fontStyle: "italic" }}>No report</span>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ navigate }) {
  return (
    <div style={{
      background: C.white, border: `1.5px dashed ${C.grayBorder}`,
      borderRadius: 20, padding: "64px 24px", textAlign: "center",
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: C.tealLight, border: `2px solid ${C.tealBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <svg width="32" height="32" fill="none" stroke={C.teal} strokeWidth="1.6" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.7-1.407 2.412a15.064 15.064 0 01-4.794-1.853M5 14.5l-1.402 1.402c-1 1-.03 2.7 1.408 2.412a15.064 15.064 0 004.794-1.853" />
        </svg>
      </div>

      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: C.dark }}>
        No AI interviews yet
      </h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: C.textMuted, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
        Start your first AI interview to receive personalised feedback and track your progress over time.
      </p>

      <button
        onClick={() => navigate("/ai-interview/roles")}
        style={{
          padding: "12px 28px", borderRadius: 12, border: "none",
          background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`,
          color: C.white, fontSize: 14, fontWeight: 700,
          cursor: "pointer", fontFamily: "\"DM Sans\", sans-serif",
          boxShadow: "0 4px 16px rgba(11,181,160,0.3)",
        }}
      >
        Start AI Interview
      </button>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      background: "#FEF2F2", border: "1px solid #FECDD3",
      borderRadius: 16, padding: "40px 24px", textAlign: "center",
    }}>
      <svg width="40" height="40" fill="none" stroke="#EF4444" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 12px", display: "block" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
      </svg>
      <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#9F1239" }}>Failed to load interviews</p>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#B91C1C" }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          padding: "9px 22px", borderRadius: 10, border: "none",
          background: "#EF4444", color: C.white, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "\"DM Sans\", sans-serif",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

// ── Pagination controls ───────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${C.grayBorder}`,
          background: page <= 1 ? C.gray50 : C.white,
          color: page <= 1 ? C.textLight : C.text,
          cursor: page <= 1 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}
      >‹</button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: `1px solid ${p === page ? C.teal : C.grayBorder}`,
            background: p === page ? C.teal : C.white,
            color: p === page ? C.white : C.text,
            fontWeight: p === page ? 700 : 500,
            cursor: "pointer", fontSize: 13,
          }}
        >{p}</button>
      ))}

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${C.grayBorder}`,
          background: page >= totalPages ? C.gray50 : C.white,
          color: page >= totalPages ? C.textLight : C.text,
          cursor: page >= totalPages ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}
      >›</button>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: C.white, border: `1px solid ${C.grayBorder}`,
          borderRadius: 16, padding: "20px 24px",
          display: "flex", gap: 16, alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: "50%", height: 16, borderRadius: 6, background: C.gray100, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ width: "30%", height: 11, borderRadius: 6, background: C.gray50, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          {[90, 110, 80].map((w, j) => (
            <div key={j} style={{ width: w, height: 36, borderRadius: 8, background: C.gray100, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function MyAiInterviewsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, data, error, filters } = useSelector(
    (state) => state.aiInterviewHistory
  );

  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "");
  const [roundFilter, setRoundFilter] = useState(filters.round_type || "");
  const [page, setPage] = useState(filters.page || 1);

  const load = useCallback((overrides = {}) => {
    const params = {
      page,
      page_size: PAGE_SIZE,
      ...(statusFilter && { status: statusFilter }),
      ...(roundFilter && { round_type: roundFilter }),
      ...overrides,
    };
    dispatch(fetchMyAiInterviewHistory(params));
  }, [dispatch, page, statusFilter, roundFilter]);

  useEffect(() => {
    load();
    return () => { dispatch(resetHistory()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters or page change
  useEffect(() => {
    const params = {
      page,
      page_size: PAGE_SIZE,
      ...(statusFilter && { status: statusFilter }),
      ...(roundFilter && { round_type: roundFilter }),
    };
    dispatch(fetchMyAiInterviewHistory(params));
    dispatch(setHistoryFilters({ status: statusFilter, round_type: roundFilter, page }));
  }, [statusFilter, roundFilter, page, dispatch]);

  // Client-side role name search filter
  const results = (data.results || []).filter(s =>
    !localSearch || s.role_name?.toLowerCase().includes(localSearch.toLowerCase())
  );

  const totalPages = Math.ceil((data.count || 0) / PAGE_SIZE);

  const handleViewReport = (sessionId) => {
    navigate(`/ai-interview/results/${sessionId}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; }
        body { font-family: "DM Sans", sans-serif; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: C.gray50, fontFamily: "\"DM Sans\", sans-serif" }}>
        <CandidateNavbar />

        <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "40px 16px 64px" }}>

          {/* ── Page header ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
              {/* Teal accent bar */}
              <span style={{ width: 5, height: 36, background: C.teal, borderRadius: 3, flexShrink: 0 }} />
              <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.dark, letterSpacing: "-0.02em" }}>
                  My AI Interviews
                </h1>
                <p style={{ margin: "3px 0 0", fontSize: 14, color: C.textMuted }}>
                  Review your past AI interview sessions and access detailed reports.
                </p>
              </div>
            </div>

            {/* Summary pill */}
            {status === "success" && data.count > 0 && (
              <div style={{
                marginTop: 12, marginLeft: 19,
                display: "inline-flex", alignItems: "center", gap: 6,
                background: C.tealLight, border: `1px solid ${C.tealBorder}`,
                borderRadius: 999, padding: "4px 12px",
                fontSize: 12, fontWeight: 700, color: C.tealDark,
              }}>
                <svg width="13" height="13" fill="none" stroke={C.tealDark} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {data.count} session{data.count !== 1 ? "s" : ""} total
              </div>
            )}
          </div>

          {/* ── Filter bar ── */}
          <div style={{
            background: C.white, border: `1px solid ${C.grayBorder}`,
            borderRadius: 16, padding: "16px 20px",
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
            marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>

            {/* Search by role name */}
            <div style={{ flex: "1 1 220px", position: "relative", minWidth: 180 }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="15" height="15" fill="none" stroke={C.textLight} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by role…"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                style={{
                  width: "100%", paddingLeft: 34, paddingRight: 14,
                  paddingTop: 9, paddingBottom: 9,
                  border: `1.5px solid ${C.grayBorder}`, borderRadius: 10,
                  fontSize: 13, color: C.text, background: C.gray50, outline: "none",
                  fontFamily: "\"DM Sans\", sans-serif", transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = C.teal)}
                onBlur={e => (e.target.style.borderColor = C.grayBorder)}
              />
            </div>

            {/* Status filter */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                style={{
                  padding: "9px 32px 9px 14px", border: `1.5px solid ${C.grayBorder}`,
                  borderRadius: 10, fontSize: 13, color: C.text,
                  background: C.gray50, appearance: "none", cursor: "pointer",
                  fontFamily: "\"DM Sans\", sans-serif", outline: "none",
                }}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FAILED">Failed</option>
                <option value="LIVE">Live</option>
              </select>
              <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="13" height="13" fill="none" stroke={C.textLight} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Round type filter */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <select
                value={roundFilter}
                onChange={e => { setRoundFilter(e.target.value); setPage(1); }}
                style={{
                  padding: "9px 32px 9px 14px", border: `1.5px solid ${C.grayBorder}`,
                  borderRadius: 10, fontSize: 13, color: C.text,
                  background: C.gray50, appearance: "none", cursor: "pointer",
                  fontFamily: "\"DM Sans\", sans-serif", outline: "none",
                }}
              >
                <option value="">All Rounds</option>
                <option value="WARMUP">Warm-up</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="ROLE_RELATED">Role Related</option>
                <option value="CODING">Coding</option>
              </select>
              <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="13" height="13" fill="none" stroke={C.textLight} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Clear filters */}
            {(statusFilter || roundFilter || localSearch) && (
              <button
                onClick={() => { setStatusFilter(""); setRoundFilter(""); setLocalSearch(""); setPage(1); }}
                style={{
                  padding: "9px 16px", borderRadius: 10,
                  border: `1px solid ${C.grayBorder}`,
                  background: C.white, color: C.textMuted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "\"DM Sans\", sans-serif",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* ── Content area ── */}
          {status === "loading" && <LoadingSkeleton />}

          {status === "error" && (
            <ErrorState message={error} onRetry={() => load()} />
          )}

          {status === "success" && results.length === 0 && (
            data.count === 0
              ? <EmptyState navigate={navigate} />
              : (
                <div style={{ background: C.white, border: `1px dashed ${C.grayBorder}`, borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.textMuted }}>No results match your filters.</p>
                  <button
                    onClick={() => { setStatusFilter(""); setRoundFilter(""); setLocalSearch(""); }}
                    style={{
                      marginTop: 14, padding: "8px 18px", borderRadius: 10,
                      border: `1px solid ${C.grayBorder}`, background: C.white,
                      color: C.teal, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >Clear filters</button>
                </div>
              )
          )}

          {status === "success" && results.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.map(session => (
                  <SessionRow key={session.id} session={session} onViewReport={handleViewReport} />
                ))}
              </div>

              {/* Pagination — only if no local search (search filters client-side) */}
              {!localSearch && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          )}
        </main>

        <CandidateFooter />
      </div>
    </>
  );
}
