

// // src/features/aiInterview/components/LiveKitVideoPanel.jsx

// import {
//   LiveKitRoom,
//   ParticipantTile,
//   RoomAudioRenderer,
//   ControlBar,
// } from "@livekit/components-react";
// import "@livekit/components-styles";
// import { InterviewerAvatar } from "./InterviewerAvatar";
// import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

// /**
//  * Inner grid — renders agent pinned large on top, candidate small below.
//  * Falls back to a flat layout if the agent has not joined yet.
//  */
// function VideoGrid({ avatarSession, avatarError }) {
//   const { candidateTracks } = useInterviewerParticipant(avatarSession);

//   return (
//     <div className="grid h-full min-h-[560px] grid-rows-[1fr_auto] gap-4">
//       <div className="min-h-0">
//         <InterviewerAvatar
//           avatarSession={avatarSession}
//           avatarError={avatarError}
//         />
//       </div>

//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//         {candidateTracks.map((track) => (
//           <div
//             key={track.participant.identity}
//             className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950"
//           >
//             <ParticipantTile trackRef={track} />
//             <div className="absolute left-3 bottom-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur">
//               You
//             </div>
//           </div>
//         ))}
//         {candidateTracks.length === 0 && (
//           <div className="flex min-h-32 items-center justify-center rounded-3xl border border-slate-800 bg-slate-950 px-4 text-center text-xs text-slate-500">
//             Waiting for your camera feed…
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /**
//  * LiveKitVideoPanel
//  *
//  * - Joins the LiveKit room when connect=true
//  * - Renders agent pinned large, candidate small below
//  * - Exposes the room via onConnected/onDisconnected callbacks
//  * - Children are passed through so the parent can nest useAgentTranscript
//  *   inside the LiveKitRoom context
//  */
// export function LiveKitVideoPanel({
//   serverUrl,
//   token,
//   connect,
//   onConnected,
//   onDisconnected,
//   avatarSession,
//   avatarError,
//   children,
// }) {
//   if (!serverUrl || !token) {
//     return (
//       <div className="aspect-video rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
//         <p className="text-11px text-red-400">
//           LiveKit configuration missing. Cannot join room.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <LiveKitRoom
//       data-lk-theme="default"
//       serverUrl={serverUrl}
//       token={token}
//       connect={connect}
//       video
//       audio
//       onConnected={onConnected}
//       onDisconnected={onDisconnected}
//     >
//       <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_380px]">
//         <div className="min-h-0">
//           <VideoGrid
//             avatarSession={avatarSession}
//             avatarError={avatarError}
//           />
//         </div>

//         <div className="flex min-h-0 flex-col gap-4">
//           {children}
//           <ControlBar
//             variation="minimal"
//             controls={{
//               microphone: true,
//               camera: true,
//               screenShare: false,
//               chat: false,
//               leave: false,
//               settings: false,
//             }}
//           />
//         </div>
//       </div>

//       {/* Room-wide audio playback */}
//       <RoomAudioRenderer />

//     </LiveKitRoom>
//   );
// }




























// src/features/aiInterview/components/LiveKitVideoPanel.jsx
// Preserved: all LiveKit hooks, room setup, ControlBar config, RoomAudioRenderer
// Redesigned: layout, visual container, grid proportions

import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { InterviewerAvatar } from "./InterviewerAvatar";
import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

// ── Video grid: AI avatar large left, candidate pip bottom ────
function VideoGrid({ avatarSession, avatarError }) {
  const { candidateTracks } = useInterviewerParticipant(avatarSession);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", gap: 10,
    }}>
      {/* ── AI Avatar (dominant) ───────────────── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <InterviewerAvatar
          avatarSession={avatarSession}
          avatarError={avatarError}
        />
      </div>

      {/* ── Candidate feed row ────────────────── */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {candidateTracks.map((track) => (
          <div
            key={track.participant.identity}
            style={{
              position: "relative",
              width: 160, height: 100,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#060b14",
              flexShrink: 0,
            }}
          >
            <ParticipantTile trackRef={track} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute", left: 8, bottom: 6,
              background: "rgba(5,9,15,0.80)",
              backdropFilter: "blur(8px)",
              borderRadius: 99,
              padding: "2px 8px",
              fontFamily: "var(--ff-tech)",
              fontSize: 9, fontWeight: 600, color: "#7a9ab5",
              letterSpacing: "0.08em",
            }}>
              YOU
            </div>
          </div>
        ))}

        {candidateTracks.length === 0 && (
          <div style={{
            width: 160, height: 100,
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.08)",
            background: "rgba(8,14,24,0.60)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 10.5, color: "var(--iv-text-3)" }}>
              Camera feed…
            </span>
          </div>
        )}
      </div>

      {/* ── Control bar ─────────────────────────── */}
      <div className="iv-control-bar" style={{ flexShrink: 0 }}>
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: false,
            chat: false,
            leave: false,
            settings: false,
          }}
        />
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────
export function LiveKitVideoPanel({
  serverUrl,
  token,
  connect,
  onConnected,
  onDisconnected,
  avatarSession,
  avatarError,
  children,
}) {
  if (!serverUrl || !token) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 400, borderRadius: 20,
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
    >
      {/* ── Main layout grid ──────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        gap: 12,
        height: "100%",
      }}
        className="iv-lk-grid"
      >
        {/* Left: video (AI avatar + candidate + controls) */}
        <div style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>
          <VideoGrid
            avatarSession={avatarSession}
            avatarError={avatarError}
          />
        </div>

        {/* Right: transcript panel passed as children */}
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 10, minHeight: 0, overflow: "hidden",
        }}>
          {children}
        </div>
      </div>

      <RoomAudioRenderer />

      <style>{`
        /* Force ControlBar into our dark theme */
        .iv-control-bar [class*="lk-control-bar"] {
          background: var(--iv-bg-3) !important;
          border: 1px solid var(--iv-border) !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          gap: 8px !important;
        }
        .iv-control-bar [class*="lk-button"] {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.07) !important;
          border-radius: 9px !important;
          color: var(--iv-text-2) !important;
        }
        .iv-control-bar [class*="lk-button"]:hover {
          background: rgba(20,184,166,0.10) !important;
          border-color: rgba(20,184,166,0.25) !important;
          color: var(--iv-teal) !important;
        }
        [data-lk-local-participant] [class*="lk-button-enabled"] {
          background: rgba(20,184,166,0.15) !important;
          border-color: rgba(20,184,166,0.30) !important;
        }

        @media (max-width: 900px) {
          .iv-lk-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </LiveKitRoom>
  );
}