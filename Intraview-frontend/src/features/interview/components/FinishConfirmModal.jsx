// src/components/FinishConfirmModal.jsx
//
// Confirmation modal shown when a participant presses "Finish Interview".
// Keeps the confirmation logic out of InterviewRoom to keep things clean.
//
// Props:
//   isOpen    : bool   — controls visibility
//   onConfirm : fn()   — called when user confirms
//   onCancel  : fn()   — called when user cancels
//   loading   : bool   — disables buttons while the finish API call is in progress
//   role      : "candidate" | "interviewer"

import React, { useEffect } from "react";

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
  greenSoft:    "rgba(34,197,94,0.12)",
  greenBorder:  "rgba(34,197,94,0.35)",
  danger:       "#ef4444",
};
const FONT = "'Georgia', 'Times New Roman', serif";

export default function FinishConfirmModal({ isOpen, onConfirm, onCancel, loading, role }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isInterviewer = role === "interviewer";

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────────
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={s.backdrop}
    >
      {/* ── Modal card ── */}
      <div style={s.card} role="dialog" aria-modal="true">

        {/* Icon */}
        <div style={s.iconWrap}>
          <span style={{ fontSize: "32px" }}>✅</span>
        </div>

        {/* Heading */}
        <h2 style={s.title}>Finish Interview?</h2>

        {/* Body */}
        <p style={s.body}>
          {isInterviewer
            ? "You will leave the call and be taken to the evaluation page. The session will continue running until its scheduled end time."
            : "You will leave the call and be taken to the feedback page. The session will continue running until its scheduled end time."}
        </p>

        <p style={s.note}>
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div style={s.btnRow}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ ...s.cancelBtn, ...(loading ? s.disabled : {}) }}
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ ...s.confirmBtn, ...(loading ? s.disabled : {}) }}
          >
            {loading ? "Finishing…" : "Yes, Finish Interview"}
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: FONT,
  },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "40px 36px",
    maxWidth: "380px",
    width: "90%",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
    textAlign: "center",
  },
  iconWrap: {
    width: "72px", height: "72px", borderRadius: "50%",
    background: C.greenSoft, border: `1px solid ${C.greenBorder}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "4px",
  },
  title: {
    color: C.white, fontSize: "22px", fontWeight: "700",
    margin: 0, fontFamily: FONT, letterSpacing: "0.02em",
  },
  body: {
    color: C.muted, fontSize: "14px", lineHeight: "1.7",
    margin: 0, fontFamily: FONT,
  },
  note: {
    color: "rgba(239,68,68,0.7)", fontSize: "12px",
    margin: 0, fontFamily: FONT,
  },
  btnRow: {
    display: "flex", gap: "10px", width: "100%", marginTop: "6px",
  },
  cancelBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`,
    color: C.muted,
    borderRadius: "8px", padding: "12px",
    fontSize: "14px", cursor: "pointer", fontFamily: FONT,
  },
  confirmBtn: {
    flex: 2,
    background: C.greenSoft,
    border: `1px solid ${C.greenBorder}`,
    color: C.green,
    borderRadius: "8px", padding: "12px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: FONT,
  },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
};