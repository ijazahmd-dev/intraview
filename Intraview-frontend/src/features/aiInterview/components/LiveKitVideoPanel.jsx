// // src/components/ai-interview/LiveKitVideoPanel.jsx

// import {
//   LiveKitRoom,
//   VideoConference,
//   RoomAudioRenderer,
// } from "@livekit/components-react";
// import "@livekit/components-styles"; // include once globally[web:66][web:74]

// /**
//  * LiveKitVideoPanel is responsible only for:
//  * - connecting to the LiveKit room when uiState says so
//  * - rendering the default VideoConference layout
//  * - notifying parent when connected/disconnected
//  */
// export function LiveKitVideoPanel({
//   serverUrl,
//   token,
//   uiState,
//   onConnected,
//   onDisconnected,
// }) {
//   if (!serverUrl || !token) {
//     return (
//       <div className="aspect-video rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
//         <p className="text-[11px] text-red-400">
//           LiveKit configuration missing. Cannot join room.
//         </p>
//       </div>
//     );
//   }

//   // We connect only when the user has clicked Join and is in CONNECTING or LIVE state.
//   const shouldConnect = uiState === "CONNECTING" || uiState === "LIVE";

//   return (
//     <LiveKitRoom
//       data-lk-theme="default"
//       serverUrl={serverUrl}
//       token={token}
//       connect={shouldConnect}
//       video
//       audio
//       // These callbacks let the parent update uiState & flags.[web:66][web:67]
//       onConnected={onConnected}
//       onDisconnected={onDisconnected}
//     >
//       <VideoConference />
//       <RoomAudioRenderer />
//     </LiveKitRoom>
//   );
// }






















// // src/features/aiInterview/components/LiveKitVideoPanel.jsx

// import {
//   LiveKitRoom,
//   GridLayout,
//   ParticipantTile,
//   RoomAudioRenderer,
//   ControlBar,
//   useTracks,
// } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import "@livekit/components-styles";

// /**
//  * Internal grid renderer: shows all camera tracks in a responsive grid.
//  */
// function VideoGrid() {
//   // All camera tracks (with placeholders for participants without video)[web:114]
//   const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);

//   return (
//     <div className="w-full h-full">
//       <GridLayout tracks={tracks}>
//         <ParticipantTile />
//       </GridLayout>
//     </div>
//   );
// }

// /**
//  * LiveKitVideoPanel handles:
//  *  - joining the room (when connect=true)
//  *  - rendering participant tiles
//  *  - rendering a minimal control bar (mic + camera only)
//  *  - playing room-wide audio
//  * It intentionally does NOT show Leave, Chat, or ScreenShare controls.
//  */
// export function LiveKitVideoPanel({
//   serverUrl,
//   token,
//   connect,
//   onConnected,
//   onDisconnected,
// }) {
//   if (!serverUrl || !token) {
//     return (
//       <div className="aspect-video rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
//         <p className="text-[11px] text-red-400">
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
//       <div className="flex flex-col h-full">
//         {/* Video tiles */}
//         <div className="flex-1 min-h-0">
//           <VideoGrid />
//         </div>

//         {/* Minimal control bar: mic + camera only, no leave/chat/share[web:82][web:81] */}
//         <div className="mt-2">
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

//         <RoomAudioRenderer />
//       </div>
//     </LiveKitRoom>
//   );
// }





















// src/features/aiInterview/components/LiveKitVideoPanel.jsx

import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { InterviewerAvatar } from "./InterviewerAvatar";
import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

/**
 * Inner grid — renders agent pinned large on top, candidate small below.
 * Falls back to a flat layout if the agent has not joined yet.
 */
function VideoGrid({ avatarSession, avatarError }) {
  const { candidateTracks } = useInterviewerParticipant(avatarSession);

  return (
    <div className="grid h-full min-h-[560px] grid-rows-[1fr_auto] gap-4">
      <div className="min-h-0">
        <InterviewerAvatar
          avatarSession={avatarSession}
          avatarError={avatarError}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {candidateTracks.map((track) => (
          <div
            key={track.participant.identity}
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950"
          >
            <ParticipantTile trackRef={track} />
            <div className="absolute left-3 bottom-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur">
              You
            </div>
          </div>
        ))}
        {candidateTracks.length === 0 && (
          <div className="flex min-h-32 items-center justify-center rounded-3xl border border-slate-800 bg-slate-950 px-4 text-center text-xs text-slate-500">
            Waiting for your camera feed…
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * LiveKitVideoPanel
 *
 * - Joins the LiveKit room when connect=true
 * - Renders agent pinned large, candidate small below
 * - Exposes the room via onConnected/onDisconnected callbacks
 * - Children are passed through so the parent can nest useAgentTranscript
 *   inside the LiveKitRoom context
 */
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
      <div className="aspect-video rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
        <p className="text-11px text-red-400">
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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <div className="min-h-0">
          <VideoGrid
            avatarSession={avatarSession}
            avatarError={avatarError}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          {children}
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

      {/* Room-wide audio playback */}
      <RoomAudioRenderer />

    </LiveKitRoom>
  );
}
