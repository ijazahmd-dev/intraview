// import { useEffect, useState } from "react";
// import { ParticipantTile } from "@livekit/components-react";

// import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

// export function InterviewerAvatar({ avatarSession, avatarError }) {
//   const { interviewerTrack } = useInterviewerParticipant(avatarSession);
//   const [showFallback, setShowFallback] = useState(Boolean(avatarError));

//   useEffect(() => {
//     setShowFallback(Boolean(avatarError));
//   }, [avatarError]);

//   useEffect(() => {
//     if (interviewerTrack) {
//       setShowFallback(false);
//       return;
//     }

//     const timeoutId = window.setTimeout(() => {
//       setShowFallback(true);
//     }, 12000);

//     return () => window.clearTimeout(timeoutId);
//   }, [interviewerTrack]);

//   if (interviewerTrack) {
//     return (
//       <div className="relative h-full w-full rounded-[28px] overflow-hidden border border-teal-500/30 bg-slate-950 shadow-[0_24px_80px_rgba(8,145,178,0.12)]">
//         <ParticipantTile trackRef={interviewerTrack} />
//         <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-slate-950/80 px-3 py-1.5 text-[11px] font-semibold text-teal-100 backdrop-blur">
//           <span className="h-2 w-2 rounded-full bg-emerald-400" />
//           AI Interviewer
//         </div>
//       </div>
//     );
//   }

//   if (showFallback) {
//     return (
//       <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-6 text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
//           <svg
//             className="h-8 w-8"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.8"
//           >
//             <path d="M12 2a10 10 0 1 0 10 10" />
//             <path d="M12 8v4" />
//             <path d="M12 16h.01" />
//           </svg>
//         </div>
//         <div className="space-y-2">
//           <p className="text-sm font-semibold text-slate-100">
//             Visual interviewer unavailable
//           </p>
//           <p className="max-w-sm text-xs leading-relaxed text-slate-400">
//             {avatarError ||
//               "The interview will continue with the existing voice interviewer while Tavus reconnects."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-6 text-center">
//       <div className="flex h-16 w-16 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-300">
//         <svg
//           className="h-8 w-8 animate-pulse"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.8"
//         >
//           <path d="M12 6v6l4 2" />
//           <circle cx="12" cy="12" r="9" />
//         </svg>
//       </div>
//       <div className="space-y-2">
//         <p className="text-sm font-semibold text-slate-100">
//           Connecting visual interviewer
//         </p>
//         <p className="max-w-sm text-xs leading-relaxed text-slate-400">
//           Tavus is joining the room and syncing with the existing interviewer audio.
//         </p>
//       </div>
//     </div>
//   );
// }




























// src/features/aiInterview/components/InterviewerAvatar.jsx

import { useEffect, useState } from "react";
import { ParticipantTile } from "@livekit/components-react";
import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

// ── Equalizer bars — shown when AI is speaking / connected ───
function EqBars({ color = "#14b8a6" }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 2,
            background: color,
            animation: `iv-eq-bar 0.8s ${(i - 1) * 0.12}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Orbital loading ring ─────────────────────────────────────
function OrbitalRing({ size = 64, ringSize = 32, color = "#14b8a6", delay = "0s" }) {
  const center = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: "50%",
        border: `1px solid rgba(20,184,166,0.12)`,
      }} />
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        marginTop: -4, marginLeft: -4,
        width: 8, height: 8, borderRadius: "50%",
        background: color,
        transformOrigin: `calc(-${ringSize / 2}px) center`,
        animation: `iv-orbit 2.5s ${delay} linear infinite`,
        boxShadow: `0 0 8px ${color}`,
      }} />
    </div>
  );
}

export function InterviewerAvatar({ avatarSession, avatarError }) {
  const { interviewerTrack } = useInterviewerParticipant(avatarSession);
  const [showFallback, setShowFallback] = useState(Boolean(avatarError));

  useEffect(() => {
    setShowFallback(Boolean(avatarError));
  }, [avatarError]);

  useEffect(() => {
    if (interviewerTrack) {
      setShowFallback(false);
      return;
    }
    const t = window.setTimeout(() => setShowFallback(true), 12000);
    return () => window.clearTimeout(t);
  }, [interviewerTrack]);

  // ── Live avatar video ────────────────────────────────────────
  if (interviewerTrack) {
    return (
      <div
        className="iv-avatar-container iv-avatar-breathing iv-scanline-wrap"
        style={{
          position: "relative",
          width: "100%", height: "100%",
          borderRadius: 24,
          overflow: "hidden",
          border: "1.5px solid rgba(20,184,166,0.35)",
          background: "#060b14",
        }}
      >
        <ParticipantTile trackRef={interviewerTrack} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Ambient vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 100%, rgba(20,184,166,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Bottom name badge */}
        <div style={{
          position: "absolute", left: 14, bottom: 14,
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(5,9,15,0.82)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(20,184,166,0.25)",
          borderRadius: 99,
          padding: "6px 14px",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 8px #22c55e",
            animation: "iv-pulse-ring 1.8s ease-out infinite",
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "var(--ff-tech)",
            fontSize: 11, fontWeight: 600, color: "#c8e6e4",
            letterSpacing: "0.06em",
          }}>
            AI INTERVIEWER
          </span>
          <EqBars />
        </div>

        {/* Top-right status */}
        <div style={{
          position: "absolute", right: 14, top: 14,
          background: "rgba(5,9,15,0.75)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(20,184,166,0.20)",
          borderRadius: 8, padding: "4px 10px",
          fontFamily: "var(--ff-tech)",
          fontSize: 9.5, fontWeight: 700,
          color: "#14b8a6", letterSpacing: "0.14em",
        }}>
          LIVE
        </div>
      </div>
    );
  }

  // ── Error fallback ───────────────────────────────────────────
  if (showFallback) {
    return (
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 24,
        background: "linear-gradient(135deg, #0a0f1c 0%, #060b14 100%)",
        border: "1.5px solid rgba(245,158,11,0.20)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, padding: "32px 24px", textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
            <path d="M12 9v4" /><path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
          </svg>
        </div>
        <div>
          <p style={{ fontFamily: "var(--ff-tech)", fontSize: 14, fontWeight: 600, color: "#f0f6ff", margin: "0 0 8px" }}>
            Visual Interviewer Unavailable
          </p>
          <p style={{ fontSize: 12, color: "#7a9ab5", lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
            {avatarError || "The interview continues with voice only while the visual interviewer reconnects."}
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.20)",
          borderRadius: 99, padding: "6px 16px",
          fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 600,
          color: "#f59e0b", letterSpacing: "0.1em",
        }}>
          <span>VOICE ONLY MODE ACTIVE</span>
        </div>
      </div>
    );
  }

  // ── Connecting state ─────────────────────────────────────────
  return (
    <div style={{
      width: "100%", height: "100%",
      borderRadius: 24,
      background: "linear-gradient(135deg, #060d1a 0%, #05090f 100%)",
      border: "1.5px solid rgba(20,184,166,0.15)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 28, padding: "32px 24px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient background radial */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 60%, rgba(20,184,166,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Orbital rings */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <OrbitalRing size={120} ringSize={55} color="#14b8a6" delay="0s" />
        <OrbitalRing size={80} ringSize={35} color="#2dd4bf" delay="0.4s" />

        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(20,184,166,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 8v4l2 2" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: "var(--ff-tech)", fontSize: 14, fontWeight: 600, color: "#e8f0fe", margin: "0 0 8px" }}>
          Connecting Visual Interviewer
        </p>
        <p style={{ fontSize: 12, color: "#7a9ab5", lineHeight: 1.6, maxWidth: 260, margin: "0 0 16px" }}>
          Tavus is joining the room and syncing with the interviewer audio.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span className="iv-typing-dot" />
          <span className="iv-typing-dot" />
          <span className="iv-typing-dot" />
        </div>
      </div>
    </div>
  );
}