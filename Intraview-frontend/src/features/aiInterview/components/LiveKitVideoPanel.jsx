// src/features/aiInterview/components/LiveKitVideoPanel.jsx
// Google Meet / HireVue style:
//   - Headerless full-screen layout
//   - Floating draggable candidate PiP (bottom-right of avatar)
//   - Premium custom controls bar at bottom of avatar area
//   - 75/25 column split

import { useRef, useState, useCallback } from "react";
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { InterviewerAvatar } from "./InterviewerAvatar";
import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

// ── Icons ────────────────────────────────────────────────────
function MicIcon({ muted }) {
  return muted ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function CamIcon({ off }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
      <path d="M7.5 4H14a2 2 0 0 1 2 2v5" />
      <polygon points="23 7 16 12 23 17 23 7" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

// ── Draggable PiP candidate camera ───────────────────────────
function CandidatePip({ track }) {
  const containerRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    const onMove = (ev) => {
      if (!dragRef.current.dragging) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos]);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        bottom: 80,
        right: 16,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: 220, height: 132,
        borderRadius: 14,
        overflow: "hidden",
        border: "1.5px solid rgba(255,255,255,0.13)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.30)",
        background: "#060b14",
        cursor: "grab",
        zIndex: 20,
        userSelect: "none",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.70), 0 2px 8px rgba(0,0,0,0.30)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.30)"}
    >
      {track ? (
        <ParticipantTile
          trackRef={track}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 6,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(61,82,105,0.8)" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
          <span style={{ fontSize: 9.5, color: "rgba(61,82,105,0.7)" }}>Camera off</span>
        </div>
      )}

      {/* YOU label */}
      <div style={{
        position: "absolute", left: 8, bottom: 7,
        background: "rgba(5,9,15,0.80)",
        backdropFilter: "blur(8px)",
        borderRadius: 99,
        padding: "2px 8px",
        fontFamily: "var(--ff-tech)",
        fontSize: 9, fontWeight: 600, color: "#7a9ab5",
        letterSpacing: "0.08em",
        pointerEvents: "none",
      }}>
        YOU
      </div>

      {/* Drag indicator */}
      <div style={{
        position: "absolute", right: 8, top: 7,
        opacity: 0.4,
        pointerEvents: "none",
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#7a9ab5">
          <circle cx="9" cy="5" r="2" /><circle cx="15" cy="5" r="2" />
          <circle cx="9" cy="12" r="2" /><circle cx="15" cy="12" r="2" />
          <circle cx="9" cy="19" r="2" /><circle cx="15" cy="19" r="2" />
        </svg>
      </div>
    </div>
  );
}

// ── Premium Controls Bar ─────────────────────────────────────
function ControlsBar({ onEnd, isEnding, sessionId, formattedTimeLeft }) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  const toggleMic = () => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleCam = () => localParticipant?.setCameraEnabled(!isCameraEnabled);

  return (
    <div style={{
      position: "absolute",
      bottom: 0, left: 0, right: 0,
      height: 72,
      background: "linear-gradient(to top, rgba(5,9,15,0.96) 0%, rgba(5,9,15,0.82) 60%, transparent 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "0 20px",
      zIndex: 15,
    }}>
      {/* Session ID — left */}
      <div style={{
        position: "absolute", left: 18,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{
          fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 600,
          color: "rgba(61,82,105,0.8)", letterSpacing: "0.06em",
        }}>
          {sessionId ? `SESSION #${sessionId.slice(0, 6).toUpperCase()}` : "AI INTERVIEW"}
        </span>
        {formattedTimeLeft && (
          <>
            <span style={{ color: "rgba(61,82,105,0.4)", fontSize: 9 }}>·</span>
            <span style={{
              fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700,
              color: "rgba(20,184,166,0.75)", letterSpacing: "0.06em",
            }}>
              {formattedTimeLeft}
            </span>
          </>
        )}
      </div>

      {/* Center buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* Mic button */}
        <button
          onClick={toggleMic}
          title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          style={{
            width: 48, height: 48,
            borderRadius: "50%",
            border: isMicrophoneEnabled
              ? "1.5px solid rgba(255,255,255,0.14)"
              : "1.5px solid rgba(239,68,68,0.5)",
            background: isMicrophoneEnabled
              ? "rgba(255,255,255,0.09)"
              : "rgba(239,68,68,0.18)",
            color: isMicrophoneEnabled ? "#c8dbe8" : "#ef4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.18s",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isMicrophoneEnabled ? "rgba(255,255,255,0.15)" : "rgba(239,68,68,0.28)"}
          onMouseLeave={(e) => e.currentTarget.style.background = isMicrophoneEnabled ? "rgba(255,255,255,0.09)" : "rgba(239,68,68,0.18)"}
        >
          <MicIcon muted={!isMicrophoneEnabled} />
        </button>

        {/* Camera button */}
        <button
          onClick={toggleCam}
          title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          style={{
            width: 48, height: 48,
            borderRadius: "50%",
            border: isCameraEnabled
              ? "1.5px solid rgba(255,255,255,0.14)"
              : "1.5px solid rgba(239,68,68,0.5)",
            background: isCameraEnabled
              ? "rgba(255,255,255,0.09)"
              : "rgba(239,68,68,0.18)",
            color: isCameraEnabled ? "#c8dbe8" : "#ef4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.18s",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isCameraEnabled ? "rgba(255,255,255,0.15)" : "rgba(239,68,68,0.28)"}
          onMouseLeave={(e) => e.currentTarget.style.background = isCameraEnabled ? "rgba(255,255,255,0.09)" : "rgba(239,68,68,0.18)"}
        >
          <CamIcon off={!isCameraEnabled} />
        </button>

        {/* End interview */}
        <button
          onClick={onEnd}
          disabled={isEnding}
          title="End interview"
          style={{
            height: 48, padding: "0 22px",
            borderRadius: 99,
            border: "none",
            background: isEnding
              ? "rgba(180,30,30,0.55)"
              : "rgba(220,38,38,0.90)",
            color: "#fff",
            display: "flex", alignItems: "center", gap: 7,
            cursor: isEnding ? "not-allowed" : "pointer",
            transition: "all 0.18s",
            fontFamily: "var(--ff-tech)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.07em",
            boxShadow: isEnding ? "none" : "0 4px 16px rgba(220,38,38,0.35)",
            opacity: isEnding ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!isEnding) e.currentTarget.style.background = "rgba(239,68,68,1)"; }}
          onMouseLeave={(e) => { if (!isEnding) e.currentTarget.style.background = "rgba(220,38,38,0.90)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v2.12a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 8.86a19.79 19.79 0 0 1-3.07-8.64A2 2 0 0 1 3.68 0h2.12a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.68 7.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
          {isEnding ? "ENDING…" : "END INTERVIEW"}
        </button>
      </div>
    </div>
  );
}

// ── Video area: avatar + floating PiP + controls ─────────────
function VideoArea({ avatarSession, avatarError, onEnd, isEnding, sessionId, formattedTimeLeft }) {
  const { candidateTracks } = useInterviewerParticipant(avatarSession);
  const candidateTrack = candidateTracks[0] ?? null;

  return (
    <div style={{
      position: "relative",
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* AI Avatar — full area */}
      <div style={{ flex: 1, minHeight: 0, padding: "0 0 0 0", overflow: "hidden" }}>
        <InterviewerAvatar
          avatarSession={avatarSession}
          avatarError={avatarError}
        />
      </div>

      {/* Candidate floating PiP */}
      <CandidatePip track={candidateTrack} />

      {/* Controls overlay */}
      <ControlsBar
        onEnd={onEnd}
        isEnding={isEnding}
        sessionId={sessionId}
        formattedTimeLeft={formattedTimeLeft}
      />
    </div>
  );
}

// ── Main exported panel ───────────────────────────────────────
export function LiveKitVideoPanel({
  serverUrl,
  token,
  connect,
  onConnected,
  onDisconnected,
  avatarSession,
  avatarError,
  children,         // right panel (transcript)
  onEnd,
  isEnding,
  sessionId,
  formattedTimeLeft,
}) {
  if (!serverUrl || !token) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: 1, borderRadius: 16,
        background: "var(--iv-bg-3)",
        border: "1px solid rgba(239,68,68,0.20)",
      }}>
        <p style={{ fontSize: 12, color: "#ef4444" }}>
          LiveKit configuration missing. Cannot join room.
        </p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={serverUrl}
      token={token}
      connect={connect}
      video
      audio
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
    >
      {/* 75% avatar area | 25% right panel */}
      <div
        className="iv-main-grid"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: 10,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* LEFT: Avatar + PiP + controls */}
        <VideoArea
          avatarSession={avatarSession}
          avatarError={avatarError}
          onEnd={onEnd}
          isEnding={isEnding}
          sessionId={sessionId}
          formattedTimeLeft={formattedTimeLeft}
        />

        {/* RIGHT: Transcript panel (children) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}>
          {children}
        </div>
      </div>

      <RoomAudioRenderer />

      <style>{`
        @media (max-width: 900px) {
          .iv-main-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto;
          }
        }
      `}</style>
    </LiveKitRoom>
  );
}