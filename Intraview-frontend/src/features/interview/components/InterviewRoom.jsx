// // src/pages/InterviewRoom.js

// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { fetchZegoToken } from "../api/zegoTokenApi";
// import { joinRoom, leaveRoom } from "../services/zegoClient";

// function InterviewRoom() {
//   const { bookingId } = useParams();

//   const localContainerRef = useRef(null);
//   const remoteContainerRef = useRef(null);
//   const zegoContextRef = useRef(null);

//   const [tokenData, setTokenData] = useState(null);
//   const [loadingToken, setLoadingToken] = useState(true);
//   const [joinInProgress, setJoinInProgress] = useState(false);
//   const [joined, setJoined] = useState(false);
//   const [error, setError] = useState(null);

//   // 1) Fetch Zego token when page loads
//   useEffect(() => {
//     let isMounted = true;

//     async function loadToken() {
//       try {
//         setLoadingToken(true);
//         setError(null);
//         const data = await fetchZegoToken(bookingId);
//         if (!isMounted) return;
//         setTokenData(data);
//       } catch (e) {
//         if (!isMounted) return;
//         console.error(e);
//         setError(e.message || "Failed to load interview room token.");
//       } finally {
//         if (isMounted) {
//           setLoadingToken(false);
//         }
//       }
//     }

//     loadToken();

//     return () => {
//       isMounted = false;
//     };
//   }, [bookingId]);


//   async function handleJoin() {
//   if (!tokenData || joined) return;

//   try {
//     setJoinInProgress(true);
//     setError(null);

//     const localContainer = localContainerRef.current;
//     const remoteContainer = remoteContainerRef.current;

//     if (!localContainer || !remoteContainer) {
//       throw new Error("Video containers are not ready.");
//     }

//     // Join Zego room and setup streams
//     const ctx = await joinRoom(tokenData, localContainer, remoteContainer);
//     zegoContextRef.current = ctx;
//     setJoined(true);

//     // If camera failed, show it as a non-fatal warning
//     if (ctx.cameraError) {
//       setError(ctx.cameraError);
//     }
//   } catch (e) {
//     console.error(e);
//     setError(e.message || "Failed to join interview.");
//   } finally {
//     setJoinInProgress(false);
//   }
// }



//   // 3) Leave button handler
//   async function handleLeave() {
//     try {
//       await leaveRoom(zegoContextRef.current);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       zegoContextRef.current = null;
//       setJoined(false);
//       // Phase 3: call backend disconnect endpoint here.
//     }
//   }

//   // 4) Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (zegoContextRef.current) {
//         // fire and forget
//         leaveRoom(zegoContextRef.current);
//         zegoContextRef.current = null;
//       }
//     };
//   }, []);

//   // --- UI states
//   if (loadingToken) {
//     return <div className="p-4">Loading interview room...</div>;
//   }

//   if (error && !joined) {
//     return (
//       <div className="p-4 text-red-600">
//         Interview error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 flex flex-col gap-4">
//       <header className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">
//           Interview Room #{bookingId}
//         </h1>

//         <div className="flex gap-2">
//           {!joined ? (
//             <button
//               onClick={handleJoin}
//               disabled={joinInProgress || !tokenData}
//               className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//             >
//               {joinInProgress ? "Joining..." : "Join Interview"}
//             </button>
//           ) : (
//             <button
//               onClick={handleLeave}
//               className="px-4 py-2 bg-red-600 text-white rounded"
//             >
//               Leave Interview
//             </button>
//           )}
//         </div>
//       </header>

//       {error && joined && (
//         <div className="text-red-600">
//           {error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//         <div>
//           <h2 className="font-medium mb-2">Your Video</h2>
//           <div
//             ref={localContainerRef}
//             className="w-full aspect-video bg-black rounded overflow-hidden"
//           />
//         </div>

//         <div>
//           <h2 className="font-medium mb-2">Other Participant</h2>
//           <div
//             ref={remoteContainerRef}
//             className="w-full aspect-video bg-black rounded overflow-hidden"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InterviewRoom;


















// src/pages/InterviewRoom.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchZegoToken } from "../api/zegoTokenApi";
import {
  joinRoom,
  leaveRoom,
  setMicMuted,
  setCameraOn,
} from "../services/zegoClient";

function InterviewRoom() {
  const { bookingId } = useParams();

  const localContainerRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const zegoContextRef = useRef(null);

  const [tokenData, setTokenData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);

  const [joinInProgress, setJoinInProgress] = useState(false);
  const [joined, setJoined] = useState(false);

  const [error, setError] = useState(null); // fatal or warning depending on joined
  const [connectionStatus, setConnectionStatus] = useState("idle"); // LOGINING / CONNECTED / DISCONNECTED etc.
  const [hasLocalMedia, setHasLocalMedia] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // 1) Fetch Zego token when page loads
  useEffect(() => {
    let isMounted = true;

    async function loadToken() {
      try {
        setLoadingToken(true);
        setError(null);
        const data = await fetchZegoToken(bookingId);
        if (!isMounted) return;
        setTokenData(data);
      } catch (e) {
        if (!isMounted) return;
        console.error(e);
        setError(e.message || "Failed to load interview room token.");
      } finally {
        if (isMounted) {
          setLoadingToken(false);
        }
      }
    }

    loadToken();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // 2) Join button handler
  async function handleJoin() {
    if (!tokenData || joined) return;

    try {
      setJoinInProgress(true);
      setError(null);
      setConnectionStatus("connecting");

      const localContainer = localContainerRef.current;
      const remoteContainer = remoteContainerRef.current;

      if (!localContainer || !remoteContainer) {
        throw new Error("Video containers are not ready.");
      }

      const ctx = await joinRoom(
        tokenData,
        localContainer,
        remoteContainer,
        {
          onRoomStateUpdate: ({ state, errorCode }) => {
            // state strings vary by SDK version: e.g. "CONNECTING", "CONNECTED", "DISCONNECTED".
            setConnectionStatus(
              typeof state === "string" ? state.toLowerCase() : String(state)
            );

            if (state === "DISCONNECTED" && errorCode) {
              setError("Disconnected from interview. Please check your network.");
            }
          },
        }
      );

      zegoContextRef.current = ctx;
      setJoined(true);
      setHasLocalMedia(!!ctx.localStream);
      setIsMicMuted(false);
      setIsCameraOff(!ctx.localStream);

      if (ctx.cameraError) {
        // Non-fatal: show as inline warning while staying in the room
        setError(ctx.cameraError);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to join interview.");
      setConnectionStatus("error");
    } finally {
      setJoinInProgress(false);
    }
  }

  // 3) Leave button handler
  async function handleLeave() {
    try {
      await leaveRoom(zegoContextRef.current);
    } catch (e) {
      console.error(e);
    } finally {
      zegoContextRef.current = null;
      setJoined(false);
      setHasLocalMedia(false);
      setIsMicMuted(false);
      setIsCameraOff(false);
      setConnectionStatus("idle");
      setError(null); // clear any warnings when leaving
    }
  }

  // 4) Toggle mic
  function handleToggleMic() {
    const ctx = zegoContextRef.current;
    if (!joined || !ctx || !ctx.localStream) return;

    const next = !isMicMuted;
    setMicMuted(ctx, next);
    setIsMicMuted(next);
  }

  // 5) Toggle camera
  function handleToggleCamera() {
    const ctx = zegoContextRef.current;
    if (!joined || !ctx || !ctx.localStream) return;

    const nextOff = !isCameraOff;
    setCameraOn(ctx, !nextOff);
    setIsCameraOff(nextOff);
  }

  // 6) Cleanup on unmount
  useEffect(() => {
    return () => {
      if (zegoContextRef.current) {
        // fire and forget
        leaveRoom(zegoContextRef.current);
        zegoContextRef.current = null;
      }
    };
  }, []);

  // --- UI states

  if (loadingToken) {
    return <div className="p-4">Loading interview room...</div>;
  }

  // Fatal error before join
  if (error && !joined) {
    return (
      <div className="p-4 text-red-600">
        Interview error: {error}
      </div>
    );
  }

  const canControlLocal = joined && hasLocalMedia;

  return (
    <div className="p-4 flex flex-col gap-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            Interview Room #{bookingId}
          </h1>
          <div className="text-sm text-gray-600 mt-1">
            Status:{" "}
            <span className="font-medium">
              {connectionStatus === "idle" && "Not connected"}
              {connectionStatus === "connecting" && "Connecting..."}
              {connectionStatus === "logining" && "Logging in..."}
              {connectionStatus === "logined" && "Connected"}
              {connectionStatus === "connected" && "Connected"}
              {connectionStatus === "disconnected" && "Disconnected"}
              {!["idle","connecting","logining","logined","connected","disconnected"].includes(connectionStatus)
                && connectionStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {joined && (
            <>
              <button
                onClick={handleToggleMic}
                disabled={!canControlLocal}
                className={`px-3 py-2 rounded text-sm ${
                  isMicMuted
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-800"
                } disabled:opacity-50`}
              >
                {isMicMuted ? "Unmute Mic" : "Mute Mic"}
              </button>

              <button
                onClick={handleToggleCamera}
                disabled={!canControlLocal}
                className={`px-3 py-2 rounded text-sm ${
                  isCameraOff
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-800"
                } disabled:opacity-50`}
              >
                {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              </button>
            </>
          )}

          {!joined ? (
            <button
              onClick={handleJoin}
              disabled={joinInProgress || !tokenData}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {joinInProgress ? "Joining..." : "Join Interview"}
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Leave Interview
            </button>
          )}
        </div>
      </header>

      {/* Non-fatal warnings while joined (camera unavailable, disconnect, etc.) */}
      {error && joined && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <h2 className="font-medium mb-2">Your Video</h2>
          <div
            ref={localContainerRef}
            className="w-full aspect-video bg-black rounded overflow-hidden"
          />
          {joined && !hasLocalMedia && (
            <p className="mt-2 text-sm text-gray-400">
              No local camera stream (camera may be blocked or already in use).
            </p>
          )}
        </div>

        <div>
          <h2 className="font-medium mb-2">Other Participant</h2>
          <div
            ref={remoteContainerRef}
            className="w-full aspect-video bg-black rounded overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
}

export default InterviewRoom;
