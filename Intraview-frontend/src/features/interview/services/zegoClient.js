
// // src/zego/zegoClient.js

// import { ZegoExpressEngine } from "zego-express-engine-webrtc";

// let engineSingleton = null;

// export function getEngine(appID) {
//   if (!engineSingleton) {
//     engineSingleton = new ZegoExpressEngine(Number(appID));
//   }
//   return engineSingleton;
// }

// /**
//  * Join a Zego room and set up local + remote streams.
//  *
//  * @param {object} tokenData - { app_id, token, room_id, user_id } from backend
//  * @param {HTMLElement} localContainer - DOM node for local video
//  * @param {HTMLElement} remoteContainer - DOM node for remote videos
//  * @param {object} [callbacks] - optional callbacks:
//  *   - onRoomStateUpdate({ roomID, state, errorCode })
//  *
//  * @returns {object} context - to be passed later to leaveRoom(), setMicMuted(), setCameraOn()
//  */
// export async function joinRoom(
//   tokenData,
//   localContainer,
//   remoteContainer,
//   callbacks = {}
// ) {
//   const { app_id, token, room_id, user_id } = tokenData;
//   const { onRoomStateUpdate } = callbacks;

//   if (!localContainer || !remoteContainer) {
//     throw new Error("Video containers not ready.");
//   }

//   const zg = getEngine(app_id);

//   // 1) Capability check
//   const sysReq = await zg.checkSystemRequirements();
//   if (!sysReq.webRTC) {
//     throw new Error("Current browser does not support WebRTC.");
//   }

//   // 2) Remote stream management
//   const remoteVideos = new Map();
//   let publishStreamID = `stream_${user_id}_${room_id}`;

//   const handleRoomStreamUpdate = async (roomID, updateType, streamList) => {
//     if (updateType === "ADD") {
//       for (const stream of streamList) {
//         // Don't subscribe to our own stream
//         if (stream.streamID === publishStreamID) continue;

//         try {
//           const remoteStream = await zg.startPlayingStream(stream.streamID);
//           const video = document.createElement("video");
//           video.srcObject = remoteStream;
//           video.autoplay = true;
//           video.playsInline = true;
//           video.style.width = "100%";
//           video.style.height = "100%";
//           video.style.objectFit = "cover";
//           remoteContainer.appendChild(video);

//           remoteVideos.set(stream.streamID, {
//             stream: remoteStream,
//             videoEl: video,
//           });
//         } catch (err) {
//           console.error("Failed to play remote stream", err);
//         }
//       }
//     } else if (updateType === "DELETE") {
//       for (const stream of streamList) {
//         const item = remoteVideos.get(stream.streamID);
//         if (item) {
//           try {
//             zg.stopPlayingStream(stream.streamID);
//           } catch (e) {
//             console.error("Error stopping remote stream", e);
//           }
//           if (item.videoEl && item.videoEl.parentNode) {
//             item.videoEl.parentNode.removeChild(item.videoEl);
//           }
//           remoteVideos.delete(stream.streamID);
//         }
//       }
//     }
//   };

//   const handleRoomStateUpdate = (roomID, state, errorCode, extendedData) => {
//     if (onRoomStateUpdate) {
//       onRoomStateUpdate({ roomID, state, errorCode, extendedData });
//     }
//   };

//   zg.on("roomStreamUpdate", handleRoomStreamUpdate);
//   zg.on("roomStateUpdate", handleRoomStateUpdate);

//   // 3) Login room with token (room join ≠ camera)
//   const loginResult = await zg.loginRoom(
//     room_id,
//     token,
//     {
//       userID: String(user_id),
//       userName: `user_${user_id}`,
//     },
//     {
//       userUpdate: true,
//     }
//   );

//   // Handle both boolean and object return styles
//   const loginOk =
//     loginResult === true ||
//     (typeof loginResult === "object" && loginResult.errorCode === 0);

//   if (!loginOk) {
//     zg.off("roomStreamUpdate", handleRoomStreamUpdate);
//     zg.off("roomStateUpdate", handleRoomStateUpdate);
//     throw new Error("Failed to login to Zego room.");
//   }

//   // 4) Try to get local camera/mic, but DON'T fail the room if this breaks
//   let localStream = null;
//   let localVideoEl = null;
//   let cameraError = null;

//   try {
//     localStream = await zg.createStream({
//       camera: true,
//       microphone: true,
//     });

//     localVideoEl = document.createElement("video");
//     localVideoEl.srcObject = localStream;
//     localVideoEl.autoplay = true;
//     localVideoEl.playsInline = true;
//     localVideoEl.muted = true; // avoid echo
//     localVideoEl.style.width = "100%";
//     localVideoEl.style.height = "100%";
//     localVideoEl.style.objectFit = "cover";

//     localContainer.appendChild(localVideoEl);

//     await zg.startPublishingStream(publishStreamID, localStream);
//   } catch (err) {
//     console.warn("Camera / microphone access failed:", err);
//     // Typical when another tab/app already holds the device.[web:285][web:294]
//     cameraError =
//       "Camera or microphone is unavailable (already in use or blocked). " +
//       "You are connected to the room with remote video only.";

//     // Important: do NOT throw here. Room is already joined.
//     localStream = null;
//     localVideoEl = null;
//     publishStreamID = null;
//   }

//   // 5) Context object for cleanup / future controls
//   const ctx = {
//     zg,
//     roomID: room_id,
//     localStream,
//     localVideoEl,
//     publishStreamID,
//     cameraError,
//     micMuted: false,
//     cameraOn: !!localStream,
//     cleanupEventsAndRemote: () => {
//       zg.off("roomStreamUpdate", handleRoomStreamUpdate);
//       zg.off("roomStateUpdate", handleRoomStateUpdate);
//       remoteVideos.forEach((item, streamID) => {
//         try {
//           zg.stopPlayingStream(streamID);
//         } catch (e) {
//           console.error("Error stopping remote stream during cleanup", e);
//         }
//         if (item.videoEl && item.videoEl.parentNode) {
//           item.videoEl.parentNode.removeChild(item.videoEl);
//         }
//       });
//       remoteVideos.clear();
//     },
//   };

//   return ctx;
// }

// /**
//  * Mute/unmute microphone by toggling audio tracks on the local MediaStream.
//  * This is the standard WebRTC pattern.[web:305]
//  */
// export function setMicMuted(ctx, muted) {
//   if (!ctx || !ctx.localStream) return;

//   ctx.localStream.getAudioTracks().forEach((track) => {
//     track.enabled = !muted;
//   });

//   ctx.micMuted = muted;
// }

// /**
//  * Turn camera on/off by toggling video tracks on the local MediaStream.[web:302]
//  * Remote side keeps the same stream; video frames pause/black out when off.
//  */
// export function setCameraOn(ctx, on) {
//   if (!ctx || !ctx.localStream) return;

//   ctx.localStream.getVideoTracks().forEach((track) => {
//     track.enabled = on;
//   });

//   ctx.cameraOn = on;
// }

// /**
//  * Leave room and fully clean up local/remote streams.
//  *
//  * @param {object} ctx - context returned from joinRoom()
//  */
// export async function leaveRoom(ctx) {
//   if (!ctx) return;

//   const {
//     zg,
//     roomID,
//     localStream,
//     localVideoEl,
//     publishStreamID,
//     cleanupEventsAndRemote,
//   } = ctx;

//   try {
//     if (publishStreamID && zg) {
//       await zg.stopPublishingStream(publishStreamID);
//     }
//   } catch (e) {
//     console.error("Error stopping publishing stream", e);
//   }

//   try {
//     if (localStream && zg) {
//       zg.destroyStream(localStream);
//     }
//   } catch (e) {
//     console.error("Error destroying local stream", e);
//   }

//   if (localVideoEl && localVideoEl.parentNode) {
//     localVideoEl.parentNode.removeChild(localVideoEl);
//   }

//   try {
//     if (cleanupEventsAndRemote) {
//       cleanupEventsAndRemote();
//     }
//   } catch (e) {
//     console.error("Error cleaning up remote streams", e);
//   }

//   try {
//     if (roomID && zg) {
//       await zg.logoutRoom(roomID);
//     }
//   } catch (e) {
//     console.error("Error logging out of room", e);
//   }
// }






















// // src/zego/zegoClient.js

// import { ZegoExpressEngine } from "zego-express-engine-webrtc";

// let engineSingleton = null;

// export function getEngine(appID) {
//   if (!engineSingleton) {
//     engineSingleton = new ZegoExpressEngine(Number(appID));
//   }
//   return engineSingleton;
// }

// /**
//  * Join a Zego room and set up local + remote streams.
//  *
//  * @param {object} tokenData - { app_id, token, room_id, user_id } from backend
//  * @param {HTMLElement} localContainer - DOM node for local video
//  * @param {HTMLElement} remoteContainer - DOM node for remote videos
//  * @param {object} [callbacks] - optional callbacks:
//  *   - onRoomStateUpdate({ roomID, state, errorCode, extendedData })
//  *
//  * @returns {object} context - to be passed later to leaveRoom(), setMicMuted(), setCameraOn(), screen-share helpers
//  */
// export async function joinRoom(
//   tokenData,
//   localContainer,
//   remoteContainer,
//   callbacks = {}
// ) {
//   const { app_id, token, room_id, user_id } = tokenData;
//   const { onRoomStateUpdate } = callbacks;

//   if (!localContainer || !remoteContainer) {
//     throw new Error("Video containers not ready.");
//   }

//   const zg = getEngine(app_id);

//   // 1) Capability check
//   const sysReq = await zg.checkSystemRequirements();
//   if (!sysReq.webRTC) {
//     throw new Error("Current browser does not support WebRTC.");
//   }

//   // 2) Remote stream management
//   const remoteVideos = new Map();
//   let publishStreamID = `stream_${user_id}_${room_id}`;

//   const handleRoomStreamUpdate = async (roomID, updateType, streamList) => {
//     if (updateType === "ADD") {
//       for (const stream of streamList) {
//         // Don't subscribe to our primary local stream
//         if (stream.streamID === publishStreamID) continue;

//         try {
//           const remoteStream = await zg.startPlayingStream(stream.streamID);
//           const video = document.createElement("video");
//           video.srcObject = remoteStream;
//           video.autoplay = true;
//           video.playsInline = true;
//           video.style.width = "100%";
//           video.style.height = "100%";
//           video.style.objectFit = "cover";
//           remoteContainer.appendChild(video);

//           remoteVideos.set(stream.streamID, {
//             stream: remoteStream,
//             videoEl: video,
//           });
//         } catch (err) {
//           console.error("Failed to play remote stream", err);
//         }
//       }
//     } else if (updateType === "DELETE") {
//       for (const stream of streamList) {
//         const item = remoteVideos.get(stream.streamID);
//         if (item) {
//           try {
//             zg.stopPlayingStream(stream.streamID);
//           } catch (e) {
//             console.error("Error stopping remote stream", e);
//           }
//           if (item.videoEl && item.videoEl.parentNode) {
//             item.videoEl.parentNode.removeChild(item.videoEl);
//           }
//           remoteVideos.delete(stream.streamID);
//         }
//       }
//     }
//   };

//   const handleRoomStateUpdate = (roomID, state, errorCode, extendedData) => {
//     if (onRoomStateUpdate) {
//       onRoomStateUpdate({ roomID, state, errorCode, extendedData });
//     }
//   };

//   zg.on("roomStreamUpdate", handleRoomStreamUpdate);
//   zg.on("roomStateUpdate", handleRoomStateUpdate);

//   // 3) Login room with token (room join ≠ camera)
//   const loginResult = await zg.loginRoom(
//     room_id,
//     token,
//     {
//       userID: String(user_id),
//       userName: `user_${user_id}`,
//     },
//     {
//       userUpdate: true,
//     }
//   );

//   // Handle both boolean and object return styles
//   const loginOk =
//     loginResult === true ||
//     (typeof loginResult === "object" && loginResult.errorCode === 0);

//   if (!loginOk) {
//     zg.off("roomStreamUpdate", handleRoomStreamUpdate);
//     zg.off("roomStateUpdate", handleRoomStateUpdate);
//     throw new Error("Failed to login to Zego room.");
//   }

//   // 4) Try to get local camera/mic, but DON'T fail the room if this breaks
//   let localStream = null;
//   let localVideoEl = null;
//   let cameraError = null;

//   try {
//     localStream = await zg.createStream({
//       camera: true,
//       microphone: true,
//     });

//     localVideoEl = document.createElement("video");
//     localVideoEl.srcObject = localStream;
//     localVideoEl.autoplay = true;
//     localVideoEl.playsInline = true;
//     localVideoEl.muted = true; // avoid echo
//     localVideoEl.style.width = "100%";
//     localVideoEl.style.height = "100%";
//     localVideoEl.style.objectFit = "cover";

//     localContainer.appendChild(localVideoEl);

//     await zg.startPublishingStream(publishStreamID, localStream);
//   } catch (err) {
//     console.warn("Camera / microphone access failed:", err);
//     cameraError =
//       "Camera or microphone is unavailable (already in use or blocked). " +
//       "You are connected to the room with remote video only.";

//     // Room is already joined; continue without local media
//     localStream = null;
//     localVideoEl = null;
//     publishStreamID = null;
//   }

//   // 5) Context object for cleanup / future controls
//   const ctx = {
//     zg,
//     roomID: room_id,
//     localStream,
//     localVideoEl,
//     publishStreamID,
//     cameraError,
//     micMuted: false,
//     cameraOn: !!localStream,

//     // Screen share fields
//     screenStream: null,
//     screenVideoEl: null,
//     screenStreamID: null,

//     cleanupEventsAndRemote: () => {
//       zg.off("roomStreamUpdate", handleRoomStreamUpdate);
//       zg.off("roomStateUpdate", handleRoomStateUpdate);
//       remoteVideos.forEach((item, streamID) => {
//         try {
//           zg.stopPlayingStream(streamID);
//         } catch (e) {
//           console.error("Error stopping remote stream during cleanup", e);
//         }
//         if (item.videoEl && item.videoEl.parentNode) {
//           item.videoEl.parentNode.removeChild(item.videoEl);
//         }
//       });
//       remoteVideos.clear();
//     },
//   };

//   return ctx;
// }

// /**
//  * Mute/unmute microphone by toggling audio tracks on the local MediaStream.
//  */
// export function setMicMuted(ctx, muted) {
//   if (!ctx || !ctx.localStream) return;

//   ctx.localStream.getAudioTracks().forEach((track) => {
//     track.enabled = !muted;
//   });

//   ctx.micMuted = muted;
// }

// /**
//  * Turn camera on/off by toggling video tracks on the local MediaStream.
//  * Remote side keeps the same stream; video frames pause when off.
//  */
// export function setCameraOn(ctx, on) {
//   if (!ctx || !ctx.localStream) return;

//   ctx.localStream.getVideoTracks().forEach((track) => {
//     track.enabled = on;
//   });

//   ctx.cameraOn = on;
// }

// /**
//  * Start screen sharing using the Screen Capture API (getDisplayMedia).[web:312][web:327]
//  * Publishes a second stream (screen) into the same room.
//  */
// export async function startScreenShare(ctx, screenContainer) {
//   if (!ctx || !ctx.zg) {
//     throw new Error("Zego context not ready.");
//   }
//   if (ctx.screenStream) {
//     return; // already sharing
//   }
//   if (!screenContainer) {
//     throw new Error("Screen container not ready.");
//   }

//   let screenStream;
//   try {
//     // Let Zego SDK create a screen-capture stream internally.[web:347]
//     screenStream = await ctx.zg.createStream({
//       screen: {
//         videoQuality: 2, // 2 = 1920×1080 in Zego docs; adjust if needed[web:347]
//         // audio: false, // add if you ever want system audio when supported
//       },
//     });
//   } catch (err) {
//     console.error("Failed to create Zego screen stream:", err);
//     // err.errorCode / err.extendedData come from Zego
//     const msg =
//       (err && err.extendedData) ||
//       (err && err.message) ||
//       "Screen sharing was cancelled or blocked.";
//     throw new Error(msg);
//   }

//   const videoEl = document.createElement("video");
//   videoEl.srcObject = screenStream;
//   videoEl.autoplay = true;
//   videoEl.playsInline = true;
//   videoEl.muted = true;
//   videoEl.style.width = "100%";
//   videoEl.style.height = "100%";
//   videoEl.style.objectFit = "contain";

//   screenContainer.appendChild(videoEl);

//   const screenStreamID = `screen_${ctx.roomID}_${Date.now()}`;
//   ctx.screenStream = screenStream;
//   ctx.screenVideoEl = videoEl;
//   ctx.screenStreamID = screenStreamID;

//   // For screen share Zego recommends VP8 codec on Web.[web:347]
//   await ctx.zg.startPublishingStream(screenStreamID, screenStream, {
//     videoCodec: "VP8",
//   });

//   // When user clicks "Stop sharing" in browser UI, end tracks -> auto cleanup.
//   const [track] = screenStream.getVideoTracks();
//   if (track) {
//     track.addEventListener("ended", () => {
//       stopScreenShare(ctx).catch((e) =>
//         console.error("Error stopping screen share on ended:", e)
//       );
//     });
//   }
// }


// /**
//  * Stop screen sharing and unpublish the screen stream.
//  */
// export async function stopScreenShare(ctx) {
//   if (!ctx || !ctx.zg || !ctx.screenStream) return;

//   try {
//     if (ctx.screenStreamID) {
//       await ctx.zg.stopPublishingStream(ctx.screenStreamID);
//     }
//   } catch (e) {
//     console.error("Error stopping screen share stream:", e);
//   }

//   try {
//     ctx.screenStream.getTracks().forEach((t) => t.stop());
//   } catch (e) {
//     console.error("Error stopping screen share tracks:", e);
//   }

//   if (ctx.screenVideoEl && ctx.screenVideoEl.parentNode) {
//     ctx.screenVideoEl.parentNode.removeChild(ctx.screenVideoEl);
//   }

//   ctx.screenStream = null;
//   ctx.screenVideoEl = null;
//   ctx.screenStreamID = null;
// }

// /**
//  * Leave room and fully clean up local/remote streams and screen share.
//  *
//  * @param {object} ctx - context returned from joinRoom()
//  */
// export async function leaveRoom(ctx) {
//   if (!ctx) return;

//   const {
//     zg,
//     roomID,
//     localStream,
//     localVideoEl,
//     publishStreamID,
//     cleanupEventsAndRemote,
//   } = ctx;

//   // Stop screen sharing if active
//   try {
//     await stopScreenShare(ctx);
//   } catch (e) {
//     console.error("Error stopping screen share during leave:", e);
//   }

//   try {
//     if (publishStreamID && zg) {
//       await zg.stopPublishingStream(publishStreamID);
//     }
//   } catch (e) {
//     console.error("Error stopping publishing stream", e);
//   }

//   try {
//     if (localStream && zg) {
//       zg.destroyStream(localStream);
//     }
//   } catch (e) {
//     console.error("Error destroying local stream", e);
//   }

//   if (localVideoEl && localVideoEl.parentNode) {
//     localVideoEl.parentNode.removeChild(localVideoEl);
//   }

//   try {
//     if (cleanupEventsAndRemote) {
//       cleanupEventsAndRemote();
//     }
//   } catch (e) {
//     console.error("Error cleaning up remote streams", e);
//   }

//   try {
//     if (roomID && zg) {
//       await zg.logoutRoom(roomID);
//     }
//   } catch (e) {
//     console.error("Error logging out of room", e);
//   }
// }



























// src/services/zegoClient.js

import { ZegoExpressEngine } from "zego-express-engine-webrtc";

let engineSingleton = null;

export function getEngine(appID) {
  if (!engineSingleton) {
    engineSingleton = new ZegoExpressEngine(Number(appID));
  }
  return engineSingleton;
}

/**
 * Join a Zego room.
 *
 * callbacks:
 *   onRoomStateUpdate({ roomID, state, errorCode, extendedData })
 *   onRemoteCountChange(count)   — fires whenever remote stream count changes.
 *                                  count > 0 means at least one remote participant
 *                                  is connected (even if audio-only).
 */
export async function joinRoom(tokenData, localContainer, remoteContainer, callbacks = {}) {
  const { app_id, token, room_id, user_id } = tokenData;
  const { onRoomStateUpdate, onRemoteCountChange } = callbacks;

  if (!localContainer || !remoteContainer) {
    throw new Error("Video containers not ready.");
  }

  const zg = getEngine(app_id);

  // 1) Capability check
  const sysReq = await zg.checkSystemRequirements();
  if (!sysReq.webRTC) throw new Error("Current browser does not support WebRTC.");

  // 2) Track ALL stream IDs we publish so we never subscribe to ourselves.
  //    Using a Set so camera, audio-only, and screen-share IDs are all tracked.
  const ownStreamIDs = new Set();

  // 3) Remote stream map: streamID → { stream, mediaEl, isAudioOnly }
  //    Audio-only remote streams use <audio> elements (invisible), NOT <video>.
  //    A <video> element with no video tracks renders as fully transparent —
  //    which makes the "Waiting for..." placeholder show through. <audio> avoids this.
  const remoteMedia = new Map();

  function fireRemoteCount() {
    onRemoteCountChange?.(remoteMedia.size);
  }

  const handleRoomStreamUpdate = async (roomID, updateType, streamList) => {
    if (updateType === "ADD") {
      for (const info of streamList) {
        if (ownStreamIDs.has(info.streamID)) continue;
        if (remoteMedia.has(info.streamID))  continue;

        try {
          const remoteStream = await zg.startPlayingStream(info.streamID);
          const hasVideo = remoteStream.getVideoTracks().length > 0;

          let mediaEl;
          if (hasVideo) {
            // Video stream — inject into remoteContainer
            mediaEl = document.createElement("video");
            mediaEl.srcObject    = remoteStream;
            mediaEl.autoplay     = true;
            mediaEl.playsInline  = true;
            mediaEl.style.cssText = [
              "position:absolute", "inset:0",
              "width:100%", "height:100%",
              "object-fit:cover",
            ].join(";");
            remoteContainer.appendChild(mediaEl);
          } else {
            // Audio-only stream — use <audio> so we don't get a transparent element
            // that blocks the "remote connected" detection.
            mediaEl = document.createElement("audio");
            mediaEl.srcObject = remoteStream;
            mediaEl.autoplay  = true;
            // Keep it off-screen but in the DOM
            mediaEl.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;";
            document.body.appendChild(mediaEl);
          }

          remoteMedia.set(info.streamID, { stream: remoteStream, mediaEl, isAudioOnly: !hasVideo });
          fireRemoteCount();
        } catch (err) {
          console.error("Failed to play remote stream", info.streamID, err);
        }
      }
    } else if (updateType === "DELETE") {
      for (const info of streamList) {
        const item = remoteMedia.get(info.streamID);
        if (item) {
          try { zg.stopPlayingStream(info.streamID); } catch (e) { console.error(e); }
          item.mediaEl?.parentNode?.removeChild(item.mediaEl);
          remoteMedia.delete(info.streamID);
          fireRemoteCount();
        }
      }
    }
  };

  const handleRoomStateUpdate = (roomID, state, errorCode, extendedData) => {
    onRoomStateUpdate?.({ roomID, state, errorCode, extendedData });
  };

  zg.on("roomStreamUpdate", handleRoomStreamUpdate);
  zg.on("roomStateUpdate",  handleRoomStateUpdate);

  // 4) Login to room
  const loginResult = await zg.loginRoom(
    room_id, token,
    { userID: String(user_id), userName: `user_${user_id}` },
    { userUpdate: true }
  );

  const loginOk = loginResult === true ||
    (typeof loginResult === "object" && loginResult.errorCode === 0);

  if (!loginOk) {
    zg.off("roomStreamUpdate", handleRoomStreamUpdate);
    zg.off("roomStateUpdate",  handleRoomStateUpdate);
    throw new Error("Failed to login to Zego room.");
  }

  // 5) Try camera + mic
  let localStream     = null;
  let localVideoEl    = null;
  let audioOnlyStream = null;
  let cameraStreamID  = null;
  let audioStreamID   = null;
  let cameraError     = null;

  const CAM_STREAM_ID   = `cam_${user_id}_${room_id}`;
  const AUDIO_STREAM_ID = `audio_${user_id}_${room_id}`;

  try {
    localStream = await zg.createStream({ camera: true, microphone: true });

    localVideoEl = document.createElement("video");
    localVideoEl.srcObject   = localStream;
    localVideoEl.autoplay    = true;
    localVideoEl.playsInline = true;
    localVideoEl.muted       = true; // prevent echo
    localVideoEl.style.cssText = "width:100%;height:100%;object-fit:cover;";
    localContainer.appendChild(localVideoEl);

    cameraStreamID = CAM_STREAM_ID;
    ownStreamIDs.add(cameraStreamID);
    await zg.startPublishingStream(cameraStreamID, localStream);
  } catch (err) {
    console.warn("Camera/mic failed:", err.message || err);
    cameraError = "Camera unavailable. You can try enabling it during the call.";
    localStream  = null;
    localVideoEl = null;

    // ── Audio-only fallback ──
    // Use native getUserMedia FIRST to test whether the microphone is
    // actually available, independent of Zego's implementation.
    // When the browser denies camera it does NOT automatically deny mic
    // on a separate request.
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      testStream.getTracks().forEach((t) => t.stop()); // release test tracks immediately

      // Mic is available — create the Zego audio-only stream
      audioOnlyStream = await zg.createStream({ camera: false, microphone: true });
      audioStreamID   = AUDIO_STREAM_ID;
      ownStreamIDs.add(audioStreamID);
      await zg.startPublishingStream(audioStreamID, audioOnlyStream);
      console.log("[ZegoClient] Audio-only stream published.");
    } catch (audioErr) {
      console.warn("[ZegoClient] Microphone also unavailable:", audioErr.message || audioErr);
      audioOnlyStream = null;
      audioStreamID   = null;
    }
  }

  // 6) Context object
  const ctx = {
    zg,
    roomID: room_id,
    userID: String(user_id),

    // Camera stream (null if camera unavailable)
    localStream,
    localVideoEl,
    cameraStreamID,

    // Audio-only stream (used when camera unavailable)
    audioOnlyStream,
    audioStreamID,

    // Getter: whichever audio source is currently active
    get activeAudioStream() {
      return this.localStream || this.audioOnlyStream || null;
    },

    cameraError,
    micMuted: false,
    cameraOn: !!localStream,

    // Screen share
    screenStream:   null,
    screenVideoEl:  null,
    screenStreamID: null,

    ownStreamIDs,

    cleanupEventsAndRemote: () => {
      zg.off("roomStreamUpdate", handleRoomStreamUpdate);
      zg.off("roomStateUpdate",  handleRoomStateUpdate);
      remoteMedia.forEach((item, streamID) => {
        try { zg.stopPlayingStream(streamID); } catch (e) { console.error(e); }
        item.mediaEl?.parentNode?.removeChild(item.mediaEl);
      });
      remoteMedia.clear();
    },
  };

  return ctx;
}

// ─── Mic mute/unmute ──────────────────────────────────────────────────────────
// Operates on whichever stream is active: camera stream or audio-only stream.
export function setMicMuted(ctx, muted) {
  if (!ctx) return;
  const stream = ctx.activeAudioStream;
  if (!stream) return;
  stream.getAudioTracks().forEach((t) => { t.enabled = !muted; });
  ctx.micMuted = muted;
}

// ─── Camera on/off ────────────────────────────────────────────────────────────
// Toggles video tracks only — does not affect audio.
export function setCameraOn(ctx, on) {
  if (!ctx || !ctx.localStream) return;
  ctx.localStream.getVideoTracks().forEach((t) => { t.enabled = on; });
  ctx.cameraOn = on;
}

// ─── Screen share ─────────────────────────────────────────────────────────────
export async function startScreenShare(ctx, screenContainer) {
  if (!ctx?.zg)      throw new Error("Zego context not ready.");
  if (ctx.screenStream) return; // already sharing
  if (!screenContainer) throw new Error("Screen container not ready.");

  let screenStream;
  try {
    screenStream = await ctx.zg.createStream({ screen: { videoQuality: 2 } });
  } catch (err) {
    const msg = err?.extendedData || err?.message || "Screen sharing was cancelled or blocked.";
    throw new Error(msg);
  }

  const videoEl = document.createElement("video");
  videoEl.srcObject    = screenStream;
  videoEl.autoplay     = true;
  videoEl.playsInline  = true;
  videoEl.muted        = true;
  videoEl.style.cssText = "width:100%;height:100%;object-fit:contain;";
  screenContainer.appendChild(videoEl);

  const screenStreamID = `screen_${ctx.roomID}_${ctx.userID}_${Date.now()}`;
  ctx.screenStream    = screenStream;
  ctx.screenVideoEl   = videoEl;
  ctx.screenStreamID  = screenStreamID;
  ctx.ownStreamIDs.add(screenStreamID);

  await ctx.zg.startPublishingStream(screenStreamID, screenStream, { videoCodec: "VP8" });

  // Auto-stop when user clicks browser "Stop sharing"
  const [track] = screenStream.getVideoTracks();
  track?.addEventListener("ended", () => stopScreenShare(ctx).catch(console.error));
}

export async function stopScreenShare(ctx) {
  if (!ctx?.zg || !ctx.screenStream) return;
  if (ctx.screenStreamID) {
    ctx.ownStreamIDs.delete(ctx.screenStreamID);
    try { await ctx.zg.stopPublishingStream(ctx.screenStreamID); } catch (e) { console.error(e); }
  }
  try { ctx.screenStream.getTracks().forEach((t) => t.stop()); } catch (e) { console.error(e); }
  ctx.screenVideoEl?.parentNode?.removeChild(ctx.screenVideoEl);
  ctx.screenStream    = null;
  ctx.screenVideoEl   = null;
  ctx.screenStreamID  = null;
}

// ─── Leave room ───────────────────────────────────────────────────────────────
export async function leaveRoom(ctx) {
  if (!ctx) return;

  try { await stopScreenShare(ctx); } catch (e) { console.error(e); }

  if (ctx.cameraStreamID && ctx.zg) {
    try { await ctx.zg.stopPublishingStream(ctx.cameraStreamID); } catch (e) { console.error(e); }
  }
  if (ctx.localStream && ctx.zg) {
    try { ctx.zg.destroyStream(ctx.localStream); } catch (e) { console.error(e); }
  }
  ctx.localVideoEl?.parentNode?.removeChild(ctx.localVideoEl);

  if (ctx.audioStreamID && ctx.zg) {
    try { await ctx.zg.stopPublishingStream(ctx.audioStreamID); } catch (e) { console.error(e); }
  }
  if (ctx.audioOnlyStream && ctx.zg) {
    try { ctx.zg.destroyStream(ctx.audioOnlyStream); } catch (e) { console.error(e); }
  }

  try { ctx.cleanupEventsAndRemote?.(); } catch (e) { console.error(e); }

  if (ctx.roomID && ctx.zg) {
    try { await ctx.zg.logoutRoom(ctx.roomID); } catch (e) { console.error(e); }
  }
}