// src/pages/InterviewCompleted.jsx
//
// Shown after a participant presses "Finish Interview".
// Displays a success message and routes them to their role-specific feedback page.
//
// Expected route:  /interview/completed/:bookingId
// Navigation state (passed via router):
//   { role: "candidate" | "interviewer", bookingId: number }

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// ─── Design tokens (match InterviewRoom) ─────────────────────────────────────
const C = {
  bg:           "#0b1220",
  surface:      "#111827",
  surfaceHi:    "#1a2538",
  border:       "rgba(255,255,255,0.07)",
  accent:       "#3b82f6",
  accentSoft:   "rgba(59,130,246,0.18)",
  accentBorder: "rgba(59,130,246,0.38)",
  white:        "#f1f5f9",
  muted:        "#64748b",
  green:        "#22c55e",
  greenSoft:    "rgba(34,197,94,0.15)",
  greenBorder:  "rgba(34,197,94,0.35)",
};
const FONT = "'Georgia', 'Times New Roman', serif";

// ─── Inject keyframes ─────────────────────────────────────────────────────────
function injectKf() {
  if (document.getElementById("ic-kf")) return;
  const el = document.createElement("style");
  el.id = "ic-kf";
  el.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes checkPop {
      0%   { transform: scale(0);   opacity: 0; }
      60%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1);   opacity: 1; }
    }
  `;
  document.head.appendChild(el);
}

export default function InterviewCompleted() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();

  // Role + bookingId come from navigation state set by InterviewRoom
  const role       = location.state?.role      || "candidate";
  const resolvedId = location.state?.bookingId || bookingId;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    injectKf();
    // Slight delay so the animation feels intentional
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Feedback route per role ────────────────────────────────────────────────
  // Adjust these paths to match your actual React Router setup.
  function goToFeedback() {
    if (role === "interviewer") {
      // Interviewer evaluates the candidate
      navigate(`/interviewer/bookings/${resolvedId}/evaluate`);   
    } else {
      // Candidate reviews the interviewer
      navigate(`/candidate/bookings/${resolvedId}/review`);
    }
  }

  function goToDashboard() {
    navigate(role === "interviewer" ? "/interviewer/dashboard" : "/dashboard");
  }

  return (
    <div style={s.root}>
      <div style={{ ...s.card, opacity: visible ? 1 : 0, animation: visible ? "fadeUp 0.5s ease forwards" : "none" }}>

        {/* ── Check icon ── */}
        <div style={s.iconWrap}>
          <div style={s.iconCircle}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <polyline
                points="8,22 18,32 36,12"
                stroke={C.green} strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: "checkPop 0.5s 0.3s ease both" }}
              />
            </svg>
          </div>
        </div>

        {/* ── Heading ── */}
        <h1 style={s.title}>Interview Completed</h1>
        <p style={s.subtitle}>
          {role === "interviewer"
            ? "You have finished this interview session. You can now submit your evaluation for the candidate."
            : "You have finished this interview session. You can now submit your feedback for the interviewer."}
        </p>

        {/* ── Info pill ── */}
        <div style={s.infoPill}>
          <span style={s.infoDot} />
          <span style={s.infoText}>
            {role === "interviewer" ? "Interviewer" : "Candidate"} · Room #{resolvedId}
          </span>
        </div>

        {/* ── Note about session ── */}
        <div style={s.noteBox}>
          <span style={s.noteIcon}>ℹ</span>
          <p style={s.noteText}>
            The interview session will remain active until its scheduled end time.
            Other participants may still be connected.
          </p>
        </div>

        {/* ── Action buttons ── */}
        <div style={s.btnRow}>
          <button style={s.primaryBtn} onClick={goToFeedback}>
            {role === "interviewer" ? "Evaluate Candidate →" : "Give Feedback →"}
          </button>
          <button style={s.secondaryBtn} onClick={goToDashboard}>
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    width: "100vw", height: "100vh",
    background: `linear-gradient(145deg, ${C.bg} 0%, #0d1a30 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: FONT,
  },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "20px",
    padding: "52px 44px",
    maxWidth: "440px",
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
    textAlign: "center",
  },
  iconWrap: {
    marginBottom: "4px",
  },
  iconCircle: {
    width: "88px", height: "88px", borderRadius: "50%",
    background: C.greenSoft,
    border: `2px solid ${C.greenBorder}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "checkPop 0.5s 0.1s ease both",
  },
  title: {
    color: C.white, fontSize: "26px", fontWeight: "700",
    margin: 0, fontFamily: FONT, letterSpacing: "0.02em",
  },
  subtitle: {
    color: C.muted, fontSize: "14px", lineHeight: "1.7",
    margin: 0, fontFamily: FONT, maxWidth: "340px",
  },
  infoPill: {
    display: "flex", alignItems: "center", gap: "8px",
    background: C.accentSoft, border: `1px solid ${C.accentBorder}`,
    borderRadius: "20px", padding: "5px 16px",
  },
  infoDot: {
    width: "7px", height: "7px", borderRadius: "50%",
    background: C.accent, flexShrink: 0,
  },
  infoText: {
    color: "#93c5fd", fontSize: "12px", fontFamily: FONT, letterSpacing: "0.05em",
  },
  noteBox: {
    display: "flex", gap: "10px", alignItems: "flex-start",
    background: C.surfaceHi, border: `1px solid ${C.border}`,
    borderRadius: "10px", padding: "12px 16px",
    textAlign: "left",
  },
  noteIcon: {
    color: C.muted, fontSize: "15px", flexShrink: 0, lineHeight: "1.5",
  },
  noteText: {
    color: C.muted, fontSize: "13px", lineHeight: "1.6",
    margin: 0, fontFamily: FONT,
  },
  btnRow: {
    display: "flex", flexDirection: "column", gap: "10px",
    width: "100%", marginTop: "4px",
  },
  primaryBtn: {
    background: C.accent, color: C.white, border: "none",
    borderRadius: "10px", padding: "14px",
    fontSize: "15px", fontWeight: "600",
    cursor: "pointer", fontFamily: FONT,
    letterSpacing: "0.04em",
    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`,
    color: C.muted, borderRadius: "10px", padding: "13px",
    fontSize: "14px", cursor: "pointer", fontFamily: FONT,
  },
};