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
//  *
//  * @returns {object} context - to be passed later to leaveRoom()
//  */
// export async function joinRoom(tokenData, localContainer, remoteContainer) {
//   const { app_id, token, room_id, user_id } = tokenData;

//   if (!localContainer || !remoteContainer) {
//     throw new Error("Video containers not ready.");
//   }

//   const zg = getEngine(app_id);

//   // Optional but recommended: browser capability check.[web:171]
//   const sysReq = await zg.checkSystemRequirements();
//   if (!sysReq.webRTC) {
//     throw new Error("Current browser does not support WebRTC.");
//   }

//   // --- Remote stream management
//   const remoteVideos = new Map();

//   const handleRoomStreamUpdate = async (roomID, updateType, streamList) => {
//     if (updateType === "ADD") {
//       for (const stream of streamList) {
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

//           remoteVideos.set(stream.streamID, { stream: remoteStream, videoEl: video });
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

//   zg.on("roomStreamUpdate", handleRoomStreamUpdate);

//   // --- Login room with token
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

//   if (loginResult !== true) {
//     zg.off("roomStreamUpdate", handleRoomStreamUpdate);
//     throw new Error("Failed to login to Zego room.");
//   }

//   // --- Local stream
//   const localStream = await zg.createStream({
//     camera: true,
//     microphone: true,
//   });

//   const localVideo = document.createElement("video");
//   localVideo.srcObject = localStream;
//   localVideo.autoplay = true;
//   localVideo.playsInline = true;
//   localVideo.muted = true; // avoid echo locally
//   localVideo.style.width = "100%";
//   localVideo.style.height = "100%";
//   localVideo.style.objectFit = "cover";

//   localContainer.appendChild(localVideo);

//   const publishStreamID = `stream_${user_id}_${room_id}`;
//   await zg.startPublishingStream(publishStreamID, localStream);

//   // Context object for cleanup / future controls
//   return {
//     zg,
//     roomID: room_id,
//     localStream,
//     localVideoEl: localVideo,
//     publishStreamID,
//     cleanupRemote: () => {
//       zg.off("roomStreamUpdate", handleRoomStreamUpdate);
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
// }

// /**
//  * Leave room and fully clean up local/remote streams.
//  *
//  * @param {object} ctx - context returned from joinRoom()
//  */
// export async function leaveRoom(ctx) {
//   if (!ctx) return;

//   const { zg, roomID, localStream, localVideoEl, publishStreamID, cleanupRemote } = ctx;

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
//     if (cleanupRemote) {
//       cleanupRemote();
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















// src/zego/zegoClient.js

import { ZegoExpressEngine } from "zego-express-engine-webrtc";

let engineSingleton = null;

export function getEngine(appID) {
  if (!engineSingleton) {
    engineSingleton = new ZegoExpressEngine(Number(appID));
  }
  return engineSingleton;
}

/**
 * Join a Zego room and set up local + remote streams.
 *
 * @param {object} tokenData - { app_id, token, room_id, user_id } from backend
 * @param {HTMLElement} localContainer - DOM node for local video
 * @param {HTMLElement} remoteContainer - DOM node for remote videos
 *
 * @returns {object} context - to be passed later to leaveRoom()
 */
export async function joinRoom(tokenData, localContainer, remoteContainer) {
  const { app_id, token, room_id, user_id } = tokenData;

  if (!localContainer || !remoteContainer) {
    throw new Error("Video containers not ready.");
  }

  const zg = getEngine(app_id);

  // 1) Capability check
  const sysReq = await zg.checkSystemRequirements();
  if (!sysReq.webRTC) {
    throw new Error("Current browser does not support WebRTC.");
  }

  // 2) Remote stream management
  const remoteVideos = new Map();

  let publishStreamID = `stream_${user_id}_${room_id}`;

  const handleRoomStreamUpdate = async (roomID, updateType, streamList) => {
    if (updateType === "ADD") {
      for (const stream of streamList) {
        // Don't subscribe to our own published stream
        if (stream.streamID === publishStreamID) continue;

        try {
          const remoteStream = await zg.startPlayingStream(stream.streamID);
          const video = document.createElement("video");
          video.srcObject = remoteStream;
          video.autoplay = true;
          video.playsInline = true;
          video.style.width = "100%";
          video.style.height = "100%";
          video.style.objectFit = "cover";
          remoteContainer.appendChild(video);

          remoteVideos.set(stream.streamID, {
            stream: remoteStream,
            videoEl: video,
          });
        } catch (err) {
          console.error("Failed to play remote stream", err);
        }
      }
    } else if (updateType === "DELETE") {
      for (const stream of streamList) {
        const item = remoteVideos.get(stream.streamID);
        if (item) {
          try {
            zg.stopPlayingStream(stream.streamID);
          } catch (e) {
            console.error("Error stopping remote stream", e);
          }
          if (item.videoEl && item.videoEl.parentNode) {
            item.videoEl.parentNode.removeChild(item.videoEl);
          }
          remoteVideos.delete(stream.streamID);
        }
      }
    }
  };

  zg.on("roomStreamUpdate", handleRoomStreamUpdate);

  // 3) Login room with token (room join ≠ camera)
  const loginResult = await zg.loginRoom(
    room_id,
    token,
    {
      userID: String(user_id),
      userName: `user_${user_id}`,
    },
    {
      userUpdate: true,
    }
  );

  // Handle both boolean and object return styles
  const loginOk =
    loginResult === true ||
    (typeof loginResult === "object" && loginResult.errorCode === 0);

  if (!loginOk) {
    zg.off("roomStreamUpdate", handleRoomStreamUpdate);
    throw new Error("Failed to login to Zego room.");
  }

  // 4) Try to get local camera/mic, but DON'T fail the room if this breaks
  let localStream = null;
  let localVideoEl = null;
  let cameraError = null;

  try {
    localStream = await zg.createStream({
      camera: true,
      microphone: true,
    });

    localVideoEl = document.createElement("video");
    localVideoEl.srcObject = localStream;
    localVideoEl.autoplay = true;
    localVideoEl.playsInline = true;
    localVideoEl.muted = true; // avoid echo
    localVideoEl.style.width = "100%";
    localVideoEl.style.height = "100%";
    localVideoEl.style.objectFit = "cover";

    localContainer.appendChild(localVideoEl);

    await zg.startPublishingStream(publishStreamID, localStream);
  } catch (err) {
    console.warn("Camera / microphone access failed:", err);
    // Typical when device is already in use or blocked.[web:285]
    cameraError =
      "Camera or microphone is unavailable (already in use or blocked). " +
      "You are connected to the room with remote video only.";

    // Important: do NOT throw here. Room is already joined.
    localStream = null;
    localVideoEl = null;
    publishStreamID = null;
  }

  // 5) Context object for cleanup / future controls
  return {
    zg,
    roomID: room_id,
    localStream,
    localVideoEl,
    publishStreamID,
    cameraError,
    cleanupRemote: () => {
      zg.off("roomStreamUpdate", handleRoomStreamUpdate);
      remoteVideos.forEach((item, streamID) => {
        try {
          zg.stopPlayingStream(streamID);
        } catch (e) {
          console.error("Error stopping remote stream during cleanup", e);
        }
        if (item.videoEl && item.videoEl.parentNode) {
          item.videoEl.parentNode.removeChild(item.videoEl);
        }
      });
      remoteVideos.clear();
    },
  };
}

/**
 * Leave room and fully clean up local/remote streams.
 *
 * @param {object} ctx - context returned from joinRoom()
 */
export async function leaveRoom(ctx) {
  if (!ctx) return;

  const {
    zg,
    roomID,
    localStream,
    localVideoEl,
    publishStreamID,
    cleanupRemote,
  } = ctx;

  try {
    if (publishStreamID && zg) {
      await zg.stopPublishingStream(publishStreamID);
    }
  } catch (e) {
    console.error("Error stopping publishing stream", e);
  }

  try {
    if (localStream && zg) {
      zg.destroyStream(localStream);
    }
  } catch (e) {
    console.error("Error destroying local stream", e);
  }

  if (localVideoEl && localVideoEl.parentNode) {
    localVideoEl.parentNode.removeChild(localVideoEl);
  }

  try {
    if (cleanupRemote) {
      cleanupRemote();
    }
  } catch (e) {
    console.error("Error cleaning up remote streams", e);
  }

  try {
    if (roomID && zg) {
      await zg.logoutRoom(roomID);
    }
  } catch (e) {
    console.error("Error logging out of room", e);
  }
}
