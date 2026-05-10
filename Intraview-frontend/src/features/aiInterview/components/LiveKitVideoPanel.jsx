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
import { useAgentParticipant } from "../hooks/useAgentParticipant";

/**
 * Inner grid — renders agent pinned large on top, candidate small below.
 * Falls back to a flat layout if the agent has not joined yet.
 */
function VideoGrid() {
  const { agentTracks, candidateTracks, isAgentPresent } =
    useAgentParticipant();

  // Flat fallback — agent not connected yet
  if (!isAgentPresent) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {candidateTracks.map((track) => (
          <div
            key={track.participant.identity}
            className="w-full max-w-md aspect-video rounded-xl overflow-hidden border border-gray-700"
          >
            <ParticipantTile trackRef={track} />
          </div>
        ))}
        {candidateTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <p className="text-11px">Waiting for participants…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {/* Agent tile — pinned large */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-teal-700/40 relative">
        {agentTracks.length > 0 ? (
          <ParticipantTile trackRef={agentTracks[0]} />
        ) : (
          <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-teal-900/60 border border-teal-700/40 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-teal-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <p className="text-11px text-teal-400">AI Interviewer</p>
            <p className="text-10px text-gray-500">Audio only</p>
          </div>
        )}
        {/* Agent label badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-gray-900/80 border border-teal-700/40 text-10px text-teal-300 font-semibold">
          AI Interviewer
        </div>
      </div>

      {/* Candidate tile — smaller below */}
      <div className="h-24 flex gap-2">
        {candidateTracks.map((track) => (
          <div
            key={track.participant.identity}
            className="flex-1 rounded-xl overflow-hidden border border-gray-700 relative"
          >
            <ParticipantTile trackRef={track} />
            <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded-full bg-gray-900/80 text-10px text-gray-300 font-semibold">
              You
            </div>
          </div>
        ))}
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
      <div className="flex flex-col h-full">
        {/* Video tiles */}
        <div className="flex-1 min-h-0">
          <VideoGrid />
        </div>

        {/* Minimal control bar — mic + camera only */}
        <div className="mt-2">
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

      {/*
        Children rendered inside LiveKitRoom context so hooks like
        useAgentTranscript (useDataChannel) have room context access.
      */}
      {children}
    </LiveKitRoom>
  );
}