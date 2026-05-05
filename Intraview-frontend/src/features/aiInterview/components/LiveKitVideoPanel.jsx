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






















// src/components/ai-interview/LiveKitVideoPanel.jsx

import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

/**
 * Internal grid renderer: shows all camera tracks in a responsive grid.
 */
function VideoGrid() {
  // All camera tracks (with placeholders for participants without video)[web:114]
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);

  return (
    <div className="w-full h-full">
      <GridLayout tracks={tracks}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}

/**
 * LiveKitVideoPanel handles:
 *  - joining the room (when connect=true)
 *  - rendering participant tiles
 *  - rendering a minimal control bar (mic + camera only)
 *  - playing room-wide audio
 * It intentionally does NOT show Leave, Chat, or ScreenShare controls.
 */
export function LiveKitVideoPanel({
  serverUrl,
  token,
  connect,
  onConnected,
  onDisconnected,
}) {
  if (!serverUrl || !token) {
    return (
      <div className="aspect-video rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
        <p className="text-[11px] text-red-400">
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

        {/* Minimal control bar: mic + camera only, no leave/chat/share[web:82][web:81] */}
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

        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}