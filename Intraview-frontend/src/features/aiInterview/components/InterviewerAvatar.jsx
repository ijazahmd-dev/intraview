// src/features/aiInterview/components/InterviewerAvatar.jsx
// Redesigned: no duplicate labels, speaking-aware EQ bars, clean fallback states.

import { useEffect, useRef, useState } from "react";
import { ParticipantTile, useIsSpeaking } from "@livekit/components-react";
import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

// EQ bars — only animate when active=true
function EqBars({ active = false }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 16 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 2,
            background: active ? "#2dd4bf" : "rgba(20,184,166,0.35)",
            height: active ? undefined : 4,
            animation: active ? `iv-eq-bar 0.8s ${(i - 1) * 0.12}s ease-in-out infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Separate child component so useIsSpeaking is ONLY called when we have a
 * real participant object — never with null/undefined (which throws).
 */
function SpeakingBadge({ participant }) {
  const isSpeaking = useIsSpeaking(participant);
  return (
    <div style={{
      position: "absolute", left: 16, bottom: 16,
      display: "flex", alignItems: "center", gap: 8,
      background: "rgba(5,9,15,0.78)",
      backdropFilter: "blur(12px)",
      border: isSpeaking
        ? "1px solid rgba(20,184,166,0.50)"
        : "1px solid rgba(255,255,255,0.10)",
      borderRadius: 99,
      padding: "6px 12px 6px 10px",
      transition: "border-color 0.3s",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "#22c55e",
        boxShadow: "0 0 7px #22c55e",
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "var(--ff-tech)",
        fontSize: 10.5, fontWeight: 700, color: "#c8e6e4",
        letterSpacing: "0.07em",
      }}>
        AI INTERVIEWER
      </span>
      <EqBars active={isSpeaking} />
    </div>
  );
}

export function InterviewerAvatar({ avatarSession, avatarError }) {
  const { interviewerParticipant, interviewerTrack } = useInterviewerParticipant(avatarSession);
  const [showFallback, setShowFallback] = useState(Boolean(avatarError));
  const timerRef = useRef(null);

  useEffect(() => {
    setShowFallback(Boolean(avatarError));
  }, [avatarError]);

  useEffect(() => {
    if (interviewerTrack) {
      setShowFallback(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = window.setTimeout(() => setShowFallback(true), 12000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [interviewerTrack]);

  // ── LIVE AVATAR VIDEO ────────────────────────────────────────
  if (interviewerTrack) {
    return (
      <div
        className="iv-avatar-breathing iv-scanline-wrap"
        style={{
          position: "relative",
          width: "100%", height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          border: "1.5px solid rgba(20,184,166,0.30)",
          background: "#060b14",
        }}
      >
        <ParticipantTile
          trackRef={interviewerTrack}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Ambient vignette bottom */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(5,9,15,0.55) 0%, transparent 45%)",
          pointerEvents: "none",
        }} />

        {/* Bottom-left: speaking-aware badge (hook is safely inside child) */}
        <SpeakingBadge participant={interviewerParticipant} />

        {/* Top-right: LIVE chip */}
        <div style={{
          position: "absolute", right: 14, top: 14,
          background: "rgba(5,9,15,0.72)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(34,197,94,0.35)",
          borderRadius: 7, padding: "3px 9px",
          fontFamily: "var(--ff-tech)",
          fontSize: 9, fontWeight: 800,
          color: "#22c55e", letterSpacing: "0.18em",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px #22c55e",
            animation: "iv-blink-live 1.5s ease infinite",
          }} />
          LIVE
        </div>
      </div>
    );
  }

  // ── ERROR FALLBACK (avatar failed) ─────────────────────────
  if (showFallback) {
    return (
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 20,
        background: "linear-gradient(160deg, #0b1120 0%, #060b14 100%)",
        border: "1.5px solid rgba(245,158,11,0.18)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, padding: "32px 24px", textAlign: "center",
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
            <path d="M12 9v4" /><path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
          </svg>
        </div>
        <div>
          <p style={{ fontFamily: "var(--ff-tech)", fontSize: 13.5, fontWeight: 600, color: "#e8f0fe", margin: "0 0 8px" }}>
            Voice-Only Mode Active
          </p>
          <p style={{ fontSize: 12, color: "#7a9ab5", lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
            {avatarError || "Visual interviewer unavailable. Interview continues with voice only."}
          </p>
        </div>
        {/* Voice waveform indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.18)",
          borderRadius: 99, padding: "6px 14px",
          fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700,
          color: "#f59e0b", letterSpacing: "0.10em",
        }}>
          VOICE ONLY
        </div>
      </div>
    );
  }

  // ── CONNECTING STATE ────────────────────────────────────────
  return (
    <div style={{
      width: "100%", height: "100%",
      borderRadius: 20,
      background: "linear-gradient(160deg, #080f1e 0%, #05090f 100%)",
      border: "1.5px solid rgba(20,184,166,0.13)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 24, padding: "32px 24px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 60%, rgba(20,184,166,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Orbital rings */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{
            position: "absolute",
            inset: i * -14,
            borderRadius: "50%",
            border: `1px solid rgba(20,184,166,${0.18 - i * 0.06})`,
            animation: `iv-pulse-ring ${2.2 + i * 0.6}s ${i * 0.4}s ease-out infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          background: "rgba(20,184,166,0.10)",
          border: "1px solid rgba(20,184,166,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
      </div>

      <div>
        <p style={{
          fontFamily: "var(--ff-tech)", fontSize: 13, fontWeight: 700,
          color: "#c8e6e4", margin: "0 0 6px", letterSpacing: "0.04em",
        }}>
          Joining Interview Room
        </p>
        <p style={{ fontSize: 12, color: "#3d5269", lineHeight: 1.55, maxWidth: 240, margin: "0 0 14px" }}>
          AI interviewer is connecting…
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
          <span className="iv-typing-dot" />
          <span className="iv-typing-dot" />
          <span className="iv-typing-dot" />
        </div>
      </div>
    </div>
  );
}