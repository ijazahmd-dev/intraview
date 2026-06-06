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
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // PiP dimensions
  const PIP_W = 188, PIP_H = 112;
  // Anchor: right:16, bottom:80
  const ANCHOR_R = 16, ANCHOR_B = 80;

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el || !el.parentElement) return;
    const parentRect = el.parentElement.getBoundingClientRect();
    // Max offset to stay inside parent
    const minX = -(parentRect.width - PIP_W - ANCHOR_R);
    const maxX = ANCHOR_R;
    const minY = -(parentRect.height - PIP_H - ANCHOR_B);
    const maxY = ANCHOR_B;
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, minX, maxX, minY, maxY };
    setIsDragging(true);
    const onMove = (ev) => {
      if (!dragRef.current.dragging) return;
      let nx = dragRef.current.origX + (ev.clientX - dragRef.current.startX);
      let ny = dragRef.current.origY + (ev.clientY - dragRef.current.startY);
      nx = Math.max(dragRef.current.minX, Math.min(dragRef.current.maxX, nx));
      ny = Math.max(dragRef.current.minY, Math.min(dragRef.current.maxY, ny));
      // Snap to edges (20px threshold)
      if (Math.abs(nx - dragRef.current.minX) < 20) nx = dragRef.current.minX;
      if (Math.abs(nx - dragRef.current.maxX) < 20) nx = dragRef.current.maxX;
      if (Math.abs(ny - dragRef.current.minY) < 20) ny = dragRef.current.minY;
      if (Math.abs(ny - dragRef.current.maxY) < 20) ny = dragRef.current.maxY;
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      setIsDragging(false);
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
        bottom: ANCHOR_B,
        right: ANCHOR_R,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: PIP_W, height: PIP_H,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: isDragging
          ? "0 16px 48px rgba(0,0,0,0.75), 0 0 20px rgba(20,184,166,0.12) inset"
          : "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
        background: "rgba(6,11,20,0.85)",
        backdropFilter: "blur(16px)",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: 20,
        userSelect: "none",
        transition: isDragging ? "none" : "box-shadow 0.25s",
      }}
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

      {/* YOU label — only shown when track is live to avoid doubling with LiveKit name */}
      {!track && (
        <div style={{
          position: "absolute", left: 8, bottom: 7,
          background: "rgba(5,9,15,0.80)",
          backdropFilter: "blur(8px)",
          borderRadius: 99, padding: "2px 8px",
          fontFamily: "var(--ff-tech)",
          fontSize: 9, fontWeight: 600, color: "#7a9ab5", letterSpacing: "0.08em",
          pointerEvents: "none",
        }}>
          YOU
        </div>
      )}

      {/* Drag grip indicator */}
      <div style={{ position: "absolute", right: 8, top: 7, opacity: 0.4, pointerEvents: "none" }}>
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
function ControlsBar({ onEnd, isEnding }) {
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
      <div style={{ position: "absolute", left: 18 }} />

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

        {/* End interview — softer red, cleaner size */}
        <button
          onClick={onEnd}
          disabled={isEnding}
          title="End interview"
          style={{
            height: 44, padding: "0 20px", marginLeft: 6,
            borderRadius: 99, border: "none",
            background: isEnding ? "rgba(160,24,24,0.45)" : "rgba(210,32,32,0.72)",
            color: "#fff",
            display: "flex", alignItems: "center", gap: 7,
            cursor: isEnding ? "not-allowed" : "pointer",
            transition: "background 0.18s",
            fontFamily: "var(--ff-tech)", fontSize: 10.5, fontWeight: 700,
            letterSpacing: "0.08em",
            boxShadow: isEnding ? "none" : "0 3px 14px rgba(200,30,30,0.28)",
            opacity: isEnding ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!isEnding) e.currentTarget.style.background = "rgba(239,55,55,0.90)"; }}
          onMouseLeave={(e) => { if (!isEnding) e.currentTarget.style.background = "rgba(210,32,32,0.72)"; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v2.12a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 8.86a19.79 19.79 0 0 1-3.07-8.64A2 2 0 0 1 3.68 0h2.12a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.68 7.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
          {isEnding ? "ENDING…" : "END"}
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
          formattedTimeLeft={formattedTimeLeft}
        />
      </div>

      {/* Candidate floating PiP */}
      <CandidatePip track={candidateTrack} />

      <ControlsBar onEnd={onEnd} isEnding={isEnding} />
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