

// // src/pages/InterviewRoom.jsx

// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   fetchZegoToken,
//   notifyDisconnect,
// } from "../api/zegoTokenApi";
// import {
//   joinRoom,
//   leaveRoom,
//   setMicMuted,
//   setCameraOn,
//   startScreenShare,
//   stopScreenShare,
// } from "../services/zegoClient";
// import { initializeChat } from "../services/zegoChatService";
// import { InterviewNotesService } from "../services/interviewNotesService";
// import InCallChat from "./InCallChat";
// import InterviewNotesModal from "./InterviewNotesModal";

// function InterviewRoom() {
//   const { bookingId } = useParams();

//   const localContainerRef = useRef(null);
//   const remoteContainerRef = useRef(null);
//   const screenShareContainerRef = useRef(null);
//   const zegoContextRef = useRef(null);
//   const chatRef = useRef(null); // { sendChat, sendReaction, destroy }
//   const notesServiceRef = useRef(null);

//   const [tokenData, setTokenData] = useState(null);
//   const [loadingToken, setLoadingToken] = useState(true);

//   const [joinInProgress, setJoinInProgress] = useState(false);
//   const [joined, setJoined] = useState(false);

//   const [error, setError] = useState(null); // fatal or warning depending on joined
//   const [connectionStatus, setConnectionStatus] = useState("idle");
//   const [hasLocalMedia, setHasLocalMedia] = useState(false);
//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [isCameraOff, setIsCameraOff] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);

//   const [messages, setMessages] = useState([]); // in-call chat messages
//   const [reactions, setReactions] = useState([]); // floating emoji overlay
//   const [isChatOpen, setIsChatOpen] = useState(true);

//   // Notes state
//   const [notesOpen, setNotesOpen] = useState(false);
//   const [notesContent, setNotesContent] = useState("");
//   const [notesStatus, setNotesStatus] = useState("idle"); // idle | loading | saving | saved

//   const isInterviewer = tokenData?.role === "interviewer";

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

//         // Map backend codes to friendly messages
//         switch (e.code) {
//           case "INTERVIEW_TOO_EARLY":
//             setError(
//               "This interview hasn't started yet. You can join a few minutes before the scheduled time."
//             );
//             break;
//           case "INTERVIEW_ENDED":
//             setError("This interview has already ended.");
//             break;
//           case "INTERVIEW_CANCELLED":
//             setError("This interview has been cancelled.");
//             break;
//           case "NO_PERMISSION":
//             setError("You don't have permission to join this interview.");
//             break;
//           default:
//             setError(e.message || "Failed to load interview room token.");
//         }
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

//   // 2) Join button handler
//   async function handleJoin() {
//     if (!tokenData || joined) return;

//     try {
//       setJoinInProgress(true);
//       setError(null);
//       setConnectionStatus("connecting");

//       const localContainer = localContainerRef.current;
//       const remoteContainer = remoteContainerRef.current;

//       if (!localContainer || !remoteContainer) {
//         throw new Error("Video containers are not ready.");
//       }

//       const ctx = await joinRoom(tokenData, localContainer, remoteContainer, {
//         onRoomStateUpdate: ({ state, errorCode }) => {
//           setConnectionStatus(
//             typeof state === "string" ? state.toLowerCase() : String(state)
//           );

//           if (state === "DISCONNECTED" && errorCode) {
//             setError("Disconnected from interview. Please check your network.");
//           }
//         },
//       });

//       zegoContextRef.current = ctx;
//       setJoined(true);
//       setHasLocalMedia(!!ctx.localStream);
//       setIsMicMuted(false);
//       setIsCameraOff(!ctx.localStream);
//       setMessages([]);
//       setReactions([]);

//       if (ctx.cameraError) {
//         // Non-fatal: show as inline warning while staying in the room
//         setError(ctx.cameraError);
//       }

//       // Initialize in-room chat once we're joined
//       const chat = initializeChat(
//         ctx,
//         {
//           userId: String(tokenData.user_id),
//           userName: `user_${tokenData.user_id}`,
//         },
//         {
//           onChatMessage: (msg) => {
//             setMessages((prev) => [...prev, msg]);
//           },
//           onReaction: (reaction) => {
//             const id =
//               reaction.id ||
//               `${reaction.senderId}-${reaction.ts}-${Math.random()
//                 .toString(36)
//                 .slice(2)}`;
//             const r = { ...reaction, id };

//             // Show as floating emoji
//             setReactions((prev) => [...prev, r]);
//             setTimeout(() => {
//               setReactions((prev) => prev.filter((x) => x.id !== id));
//             }, 2500);

//             // Also log to chat timeline
//             setMessages((prev) => [...prev, r]);
//           },
//         }
//       );

//       chatRef.current = chat;

//       // Initialize notes service (even if candidate; only interviewer will use it)
//       notesServiceRef.current = new InterviewNotesService(bookingId);
//     } catch (e) {
//       console.error(e);
//       setError(e.message || "Failed to join interview.");
//       setConnectionStatus("error");
//     } finally {
//       setJoinInProgress(false);
//     }
//   }

//   // 3) Leave button handler
//   async function handleLeave() {
//     try {
//       if (chatRef.current) {
//         chatRef.current.destroy();
//         chatRef.current = null;
//       }
//       if (zegoContextRef.current) {
//         await leaveRoom(zegoContextRef.current);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       zegoContextRef.current = null;
//       notesServiceRef.current = null;
//       setJoined(false);
//       setHasLocalMedia(false);
//       setIsMicMuted(false);
//       setIsCameraOff(false);
//       setConnectionStatus("idle");
//       setIsScreenSharing(false);
//       setMessages([]);
//       setReactions([]);
//       setNotesOpen(false);
//       setError(null); // clear warnings

//       // Best-effort backend disconnect notification
//       notifyDisconnect(bookingId);
//     }
//   }

//   // 4) Toggle mic
//   function handleToggleMic() {
//     const ctx = zegoContextRef.current;
//     if (!joined || !ctx || !ctx.localStream) return;

//     const next = !isMicMuted;
//     setMicMuted(ctx, next);
//     setIsMicMuted(next);
//   }

//   // 5) Toggle camera
//   function handleToggleCamera() {
//     const ctx = zegoContextRef.current;
//     if (!joined || !ctx || !ctx.localStream) return;

//     const nextOff = !isCameraOff;
//     setCameraOn(ctx, !nextOff);
//     setIsCameraOff(nextOff);
//   }

//   // 6) Toggle screen sharing
//   async function handleToggleScreenShare() {
//     const ctx = zegoContextRef.current;
//     if (!joined || !ctx) return;

//     const container = screenShareContainerRef.current;
//     if (!container) return;

//     if (!isScreenSharing) {
//       try {
//         await startScreenShare(ctx, container);
//         setIsScreenSharing(true);
//       } catch (e) {
//         console.error(e);
//         setError(e.message || "Failed to start screen sharing.");
//       }
//     } else {
//       try {
//         await stopScreenShare(ctx);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setIsScreenSharing(false);
//       }
//     }
//   }

//   // 7) Send chat message (called by InCallChat)
//   async function handleSendChat(text) {
//     const chat = chatRef.current;
//     const ctx = zegoContextRef.current;
//     if (!joined || !chat || !ctx) return;

//     const now = Date.now();
//     const localMessage = {
//       id: `local-${now}-${Math.random().toString(36).slice(2)}`,
//       type: "chat",
//       text,
//       senderId: String(tokenData.user_id),
//       senderName: `you`,
//       ts: now,
//     };

//     // Optimistic append
//     setMessages((prev) => [...prev, localMessage]);

//     try {
//       await chat.sendChat(text);
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   // 8) Send emoji reaction
//   async function handleSendReaction(emoji) {
//     const chat = chatRef.current;
//     const ctx = zegoContextRef.current;
//     if (!joined || !chat || !ctx) return;

//     const now = Date.now();
//     const id = `local-react-${now}-${Math.random().toString(36).slice(2)}`;
//     const localReaction = {
//       id,
//       type: "reaction",
//       emoji,
//       senderId: String(tokenData.user_id),
//       senderName: "you",
//       ts: now,
//     };

//     // Local effect
//     setReactions((prev) => [...prev, localReaction]);
//     setTimeout(() => {
//       setReactions((prev) => prev.filter((x) => x.id !== id));
//     }, 2500);

//     // Also log into chat timeline
//     setMessages((prev) => [...prev, localReaction]);

//     try {
//       await chat.sendReaction(emoji);
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   // 9) Notes: load existing content from backend
//   async function loadNotes() {
//     if (!notesServiceRef.current || !isInterviewer) return;

//     try {
//       setNotesStatus("loading");
//       const data = await notesServiceRef.current.fetchNotes();
//       setNotesContent(data.content || "");
//       setNotesStatus("idle");
//     } catch (e) {
//       console.error("Failed to load notes:", e);
//       setNotesStatus("idle");
//     }
//   }

//   async function handleToggleNotes() {
//     if (!isInterviewer) return;

//     const nextOpen = !notesOpen;
//     if (nextOpen && !notesOpen) {
//       await loadNotes();
//     }
//     setNotesOpen(nextOpen);
//   }

//   // 10) Cleanup on unmount (leave room + notify backend)
//   useEffect(() => {
//     async function cleanup() {
//       if (chatRef.current) {
//         try {
//           chatRef.current.destroy();
//         } catch (e) {
//           console.error(e);
//         } finally {
//           chatRef.current = null;
//         }
//       }

//       if (zegoContextRef.current) {
//         try {
//           await leaveRoom(zegoContextRef.current);
//         } catch (e) {
//           console.error(e);
//         } finally {
//           zegoContextRef.current = null;
//         }
//       }

//       notesServiceRef.current = null;

//       if (bookingId) {
//         notifyDisconnect(bookingId);
//       }
//     }

//     return () => {
//       cleanup();
//     };
//   }, [bookingId]);

//   // --- UI states

//   if (loadingToken) {
//     return <div className="p-4">Loading interview room...</div>;
//   }

//   // Fatal error before join
//   if (error && !joined) {
//     return (
//       <div className="p-4 text-red-600">
//         Interview error: {error}
//       </div>
//     );
//   }

//   const canControlLocal = joined && hasLocalMedia;

//   return (
//     <div className="p-4 flex flex-col md:flex-row gap-4">
//       {/* Left: video + controls */}
//       <div className="flex-1 flex flex-col gap-4">
//         <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <div>
//             <h1 className="text-xl font-semibold">
//               Interview Room #{bookingId}
//             </h1>
//             <div className="text-sm text-gray-600 mt-1">
//               Status:{" "}
//               <span className="font-medium">
//                 {connectionStatus === "idle" && "Not connected"}
//                 {connectionStatus === "connecting" && "Connecting..."}
//                 {connectionStatus === "logining" && "Logging in..."}
//                 {connectionStatus === "logined" && "Connected"}
//                 {connectionStatus === "connected" && "Connected"}
//                 {connectionStatus === "disconnected" && "Disconnected"}
//                 {![
//                   "idle",
//                   "connecting",
//                   "logining",
//                   "logined",
//                   "connected",
//                   "disconnected",
//                 ].includes(connectionStatus) && connectionStatus}
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 items-center">
//             {joined && (
//               <>
//                 <button
//                   onClick={handleToggleMic}
//                   disabled={!canControlLocal}
//                   className={`px-3 py-2 rounded text-sm ${
//                     isMicMuted
//                       ? "bg-gray-700 text-white"
//                       : "bg-gray-200 text-gray-800"
//                   } disabled:opacity-50`}
//                 >
//                   {isMicMuted ? "Unmute Mic" : "Mute Mic"}
//                 </button>

//                 <button
//                   onClick={handleToggleCamera}
//                   disabled={!canControlLocal}
//                   className={`px-3 py-2 rounded text-sm ${
//                     isCameraOff
//                       ? "bg-gray-700 text-white"
//                       : "bg-gray-200 text-gray-800"
//                   } disabled:opacity-50`}
//                 >
//                   {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
//                 </button>

//                 <button
//                   onClick={handleToggleScreenShare}
//                   className={`px-3 py-2 rounded text-sm ${
//                     isScreenSharing
//                       ? "bg-purple-600 text-white"
//                       : "bg-gray-200 text-gray-800"
//                   }`}
//                 >
//                   {isScreenSharing ? "Stop Share" : "Share Screen"}
//                 </button>

//                 {isInterviewer && (
//                   <button
//                     onClick={handleToggleNotes}
//                     className="px-3 py-2 rounded text-sm bg-green-100 text-green-800 hover:bg-green-200"
//                   >
//                     📝 Notes
//                   </button>
//                 )}
//               </>
//             )}

//             {!joined ? (
//               <button
//                 onClick={handleJoin}
//                 disabled={joinInProgress || !tokenData}
//                 className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//               >
//                 {joinInProgress ? "Joining..." : "Join Interview"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleLeave}
//                 className="px-4 py-2 bg-red-600 text-white rounded"
//               >
//                 Leave Interview
//               </button>
//             )}
//           </div>
//         </header>

//         {/* Non-fatal warnings while joined (camera unavailable, disconnect, etc.) */}
//         {error && joined && (
//           <div className="text-red-600">
//             {error}
//           </div>
//         )}

//         {/* Video area with floating reactions overlay */}
//         <div className="relative">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//             <div>
//               <h2 className="font-medium mb-2">Your Video</h2>
//               <div
//                 ref={localContainerRef}
//                 className="w-full aspect-video bg-black rounded overflow-hidden"
//               />
//               {joined && !hasLocalMedia && (
//                 <p className="mt-2 text-sm text-gray-400">
//                   No local camera stream (camera may be blocked or already in use).
//                 </p>
//               )}
//             </div>

//             <div>
//               <h2 className="font-medium mb-2">Other Participant</h2>
//               <div
//                 ref={remoteContainerRef}
//                 className="w-full aspect-video bg-black rounded overflow-hidden"
//               />
//             </div>
//           </div>

//           {/* Floating emoji overlay */}
//           {joined && reactions.length > 0 && (
//             <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//               {reactions.map((r) => (
//                 <span
//                   key={r.id}
//                   className="text-5xl animate-bounce drop-shadow-lg"
//                 >
//                   {r.emoji}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Screen share preview */}
//         {joined && (
//           <div className="mt-4">
//             <h2 className="font-medium mb-2">Your Screen (if sharing)</h2>
//             <div
//               ref={screenShareContainerRef}
//               className="w-full aspect-video bg-gray-900 rounded overflow-hidden"
//             />
//           </div>
//         )}

//         {/* Emoji bar */}
//         {joined && (
//           <div className="mt-3 flex gap-2">
//             {["👍", "👏", "😂", "😮", "❤️"].map((emoji) => (
//               <button
//                 key={emoji}
//                 type="button"
//                 onClick={() => handleSendReaction(emoji)}
//                 className="text-2xl hover:scale-110 transition-transform"
//               >
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Right: in-call chat panel */}
//       <InCallChat
//         messages={messages}
//         onSend={handleSendChat}
//         isOpen={isChatOpen}
//         onToggle={() => setIsChatOpen((o) => !o)}
//       />

//       {/* Interviewer notes modal (interviewer only) */}
//       {isInterviewer && (
//         <InterviewNotesModal
//           isOpen={notesOpen}
//           onClose={() => setNotesOpen(false)}
//           notesService={notesServiceRef.current}
//           initialContent={notesContent}
//         />
//       )}
//     </div>
//   );
// }

// export default InterviewRoom;




















// src/pages/InterviewRoom.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchZegoToken, notifyDisconnect } from "../api/zegoTokenApi";
import {
  joinRoom,
  leaveRoom,
  setMicMuted,
  setCameraOn,
  startScreenShare,
  stopScreenShare,
} from "../services/zegoClient";
import { initializeChat } from "../services/zegoChatService";
import { InterviewNotesService } from "../services/interviewNotesService";
import InCallChat from "./InCallChat";
import InterviewNotesModal from "./InterviewNotesModal";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           "#0b1220",
  surface:      "#111827",
  surfaceHi:    "#1a2538",
  border:       "rgba(255,255,255,0.07)",
  accent:       "#3b82f6",
  accentSoft:   "rgba(59,130,246,0.18)",
  accentBorder: "rgba(59,130,246,0.38)",
  white:        "#f1f5f9",
  muted:        "#64748b",
  danger:       "#ef4444",
  dangerSoft:   "rgba(239,68,68,0.18)",
  dangerBorder: "rgba(239,68,68,0.4)",
  green:        "#22c55e",
};
const FONT   = "'Georgia', 'Times New Roman', serif";
const EMOJIS = ["👍", "👏", "🎉", "😂", "😮", "❤️", "🔥", "👀"];

function injectKeyframes() {
  if (document.getElementById("ir-kf")) return;
  const el = document.createElement("style");
  el.id = "ir-kf";
  el.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes floatFade {
      0%   { transform: translateY(0)      scale(1);    opacity: 1; }
      70%  { transform: translateY(-180px) scale(1.05); opacity: 0.7; }
      100% { transform: translateY(-300px) scale(0.8);  opacity: 0; }
    }
  `;
  document.head.appendChild(el);
}

// ─── Control button ───────────────────────────────────────────────────────────
function CtrlBtn({ icon, label, active, danger, accent, disabled, onClick }) {
  const mod = (danger && active) ? s.ctrlDanger
            : (accent && active) ? s.ctrlAccent : {};
  return (
    <button
      onClick={onClick} disabled={disabled} title={label}
      style={{ ...s.ctrl, ...mod, ...(disabled ? s.ctrlDisabled : {}) }}
    >
      <span style={{ fontSize: "19px", lineHeight: 1 }}>{icon}</span>
      <span style={s.ctrlLabel}>{label}</span>
    </button>
  );
}

// ─── Emoji picker ─────────────────────────────────────────────────────────────
function EmojiPickerBtn({ onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      {open && (
        <div style={s.emojiPicker}>
          {EMOJIS.map((e) => (
            <button key={e} style={s.emojiPickerBtn}
              onClick={() => { onPick(e);  }}>{e}</button>
          ))}
        </div>
      )}
      <button style={s.ctrl} title="Reactions" onClick={() => setOpen((o) => !o)}>
        <span style={{ fontSize: "19px", lineHeight: 1 }}>😊</span>
        <span style={s.ctrlLabel}>React</span>
      </button>
    </div>
  );
}

// ─── Floating emoji reaction ──────────────────────────────────────────────────
function FloatingEmoji({ emoji, onDone }) {
  const left = useRef(10 + Math.random() * 78).current;
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <span style={{
      position: "absolute", bottom: "16px", left: `${left}%`,
      fontSize: "26px", pointerEvents: "none", userSelect: "none",
      animation: "floatFade 2.6s ease-out forwards",
      zIndex: 9, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
    }}>{emoji}</span>
  );
}

// ─── Draggable PiP ────────────────────────────────────────────────────────────
function DraggablePip({ children, controlBarHeight = 76 }) {
  const PIP_W = 192;
  const PIP_H = Math.round(PIP_W * 9 / 16);

  const [pos, setPos]      = useState(null);
  const wrapRef            = useRef(null);
  const dragging           = useRef(false);
  const startMouse         = useRef({ x: 0, y: 0 });
  const startPos           = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPos({
      x: window.innerWidth  - 20 - PIP_W,
      y: window.innerHeight - controlBarHeight - 12 - PIP_H,
    });
  }, []);

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current   = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current   = { ...pos };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !pos) return;
      const w = wrapRef.current?.offsetWidth  || PIP_W;
      const h = wrapRef.current?.offsetHeight || PIP_H;
      setPos({
        x: Math.max(8, Math.min(window.innerWidth  - w - 8, startPos.current.x + (e.clientX - startMouse.current.x))),
        y: Math.max(8, Math.min(window.innerHeight - h - 8, startPos.current.y + (e.clientY - startMouse.current.y))),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [pos]);

  if (!pos) return null;

  return (
    <div
      ref={wrapRef}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: `${PIP_W}px`,
        aspectRatio: "16/9",
        borderRadius: "10px",
        overflow: "hidden",
        border: `2px solid ${C.accentBorder}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        background: C.surfaceHi,
        zIndex: 15,
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function InterviewRoom() {
  const { bookingId } = useParams();

  // Zego video container refs — always mounted, never hidden
  const localContainerRef       = useRef(null);
  const remoteContainerRef      = useRef(null);
  const screenShareContainerRef = useRef(null);
  const zegoContextRef          = useRef(null);
  const chatRef                 = useRef(null);
  const notesServiceRef         = useRef(null);

  const [tokenData,        setTokenData]        = useState(null);
  const [loadingToken,     setLoadingToken]     = useState(true);
  const [joinInProgress,   setJoinInProgress]   = useState(false);
  const [joined,           setJoined]           = useState(false);
  const [error,            setError]            = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("idle");

  // ── Independent media state ──
  // hasCameraStream: we have a camera+mic MediaStream published
  // hasAudioStream:  we have an audio-only MediaStream published
  // isMicMuted:      microphone track is disabled
  // isCameraOff:     camera track is disabled (but stream still exists)
  // cameraRetrying:  mid-session camera acquisition in progress
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [hasAudioStream,  setHasAudioStream]  = useState(false);
  const [isMicMuted,      setIsMicMuted]      = useState(false);
  const [isCameraOff,     setIsCameraOff]     = useState(false);
  const [cameraRetrying,  setCameraRetrying]  = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // ── Remote participant state ──
  // remoteStreamCount: how many remote streams are active.
  // > 0 means someone is connected, even if they have no camera (audio-only).
  const [remoteStreamCount, setRemoteStreamCount] = useState(0);

  const [messages,     setMessages]     = useState([]);
  const [reactions,    setReactions]    = useState([]);
  const [isChatOpen,   setIsChatOpen]   = useState(true);
  const [notesOpen,    setNotesOpen]    = useState(false);
  const [notesContent, setNotesContent] = useState("");

  const isInterviewer = tokenData?.role === "interviewer";

  useEffect(() => { injectKeyframes(); }, []);

  // ── Token fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoadingToken(true); setError(null);
        const data = await fetchZegoToken(bookingId);
        if (alive) setTokenData(data);
      } catch (e) {
        if (!alive) return;
        const msgs = {
          INTERVIEW_TOO_EARLY: "This interview hasn't started yet.",
          INTERVIEW_ENDED:     "This interview has already ended.",
          INTERVIEW_CANCELLED: "This interview has been cancelled.",
          NO_PERMISSION:       "You don't have permission to join this interview.",
        };
        setError(msgs[e.code] || e.message || "Failed to load interview room.");
      } finally { if (alive) setLoadingToken(false); }
    }
    load();
    return () => { alive = false; };
  }, [bookingId]);

  // ── Join ────────────────────────────────────────────────────────────────────
  async function handleJoin() {
    if (!tokenData || joined) return;
    try {
      setJoinInProgress(true); setError(null);
      setConnectionStatus("connecting");

      const localEl  = localContainerRef.current;
      const remoteEl = remoteContainerRef.current;
      if (!localEl || !remoteEl) throw new Error("Video containers are not ready.");

      const ctx = await joinRoom(tokenData, localEl, remoteEl, {
        onRoomStateUpdate: ({ state, errorCode }) => {
          setConnectionStatus(typeof state === "string" ? state.toLowerCase() : String(state));
          if (state === "DISCONNECTED" && errorCode)
            setError("Disconnected from interview. Please check your network.");
        },
        // Fired by zegoClient whenever remote stream count changes
        onRemoteCountChange: (count) => {
          setRemoteStreamCount(count);
        },
      });

      zegoContextRef.current = ctx;
      setJoined(true);
      setMessages([]); setReactions([]); setRemoteStreamCount(0);

      const gotCamera = !!ctx.localStream;
      const gotAudio  = !!ctx.audioOnlyStream;
      setHasCameraStream(gotCamera);
      setHasAudioStream(gotAudio);
      setIsMicMuted(false);
      setIsCameraOff(!gotCamera);

      if (ctx.cameraError) {
        setError(ctx.cameraError);
        // Auto-dismiss after 5s so it doesn't stay permanently
        setTimeout(() => setError((prev) => prev === ctx.cameraError ? null : prev), 5000);
      }

      const chat = initializeChat(
        ctx,
        { userId: String(tokenData.user_id), userName: `user_${tokenData.user_id}` },
        {
          onChatMessage: (msg) => setMessages((p) => [...p, msg]),
          onReaction: (reaction) => {
            const id = reaction.id ||
              `${reaction.senderId}-${reaction.ts}-${Math.random().toString(36).slice(2)}`;
            setReactions((p) => [...p, { ...reaction, id }]);
            setMessages((p) => [...p, { ...reaction, id }]);
          },
        }
      );
      chatRef.current      = chat;
      notesServiceRef.current = new InterviewNotesService(bookingId);
    } catch (e) {
      setError(e.message || "Failed to join interview.");
      setConnectionStatus("error");
    } finally { setJoinInProgress(false); }
  }

  // ── Camera retry mid-session ─────────────────────────────────────────────────
  //
  // CRITICAL FIX: We do NOT destroy the audio-only stream BEFORE confirming
  // the camera works. Previous bug: destroy audio → camera fails → no audio at all.
  //
  // New order:
  //   1. Try to acquire camera+mic stream
  //   2. ONLY if that succeeds: stop/destroy audio-only stream
  //   3. If camera fails: keep audio-only stream intact (mic still works)
  async function handleCameraRetry() {
    const ctx = zegoContextRef.current;
    if (!ctx?.zg) return;
    setCameraRetrying(true);
    try {
      const zg = ctx.zg;

      // Step 1: Try to create camera+mic stream FIRST
      const stream = await zg.createStream({ camera: true, microphone: true });
      // ↑ If this throws, we catch below and keep audio-only intact

      // Step 2: Camera worked — now safely stop audio-only
      if (ctx.audioStreamID) {
        ctx.ownStreamIDs.delete(ctx.audioStreamID);
        try { await zg.stopPublishingStream(ctx.audioStreamID); } catch (_) {}
      }
      if (ctx.audioOnlyStream) {
        try { zg.destroyStream(ctx.audioOnlyStream); } catch (_) {}
        ctx.audioOnlyStream = null;
        ctx.audioStreamID   = null;
      }

      // Step 3: Inject video element into PiP container
      const el = localContainerRef.current;
      if (el) {
        el.innerHTML = ""; // clear old video elements
        const video = document.createElement("video");
        video.srcObject    = stream;
        video.autoplay     = true;
        video.playsInline  = true;
        video.muted        = true;
        video.style.cssText = "width:100%;height:100%;object-fit:cover;";
        el.appendChild(video);
        ctx.localVideoEl = video;
      }

      // Step 4: Publish the new camera stream
      const streamID = `cam_${tokenData.user_id}_${ctx.roomID}_${Date.now()}`;
      ctx.localStream    = stream;
      ctx.cameraStreamID = streamID;
      ctx.ownStreamIDs.add(streamID);
      await zg.startPublishingStream(streamID, stream);

      setHasCameraStream(true);
      setHasAudioStream(false); // audio-only replaced by camera stream
      setIsCameraOff(false);
      setIsMicMuted(false);
      setError(null);
    } catch (err) {
      // Camera STILL unavailable — audio-only stream was NOT touched, mic still works
      console.warn("[CameraRetry] Failed:", err.message || err);
      setError("Camera still unavailable. Close any other app using it and try again.");
      setTimeout(() => setError(null), 6000);
    } finally {
      setCameraRetrying(false);
    }
  }

  // ── Leave ───────────────────────────────────────────────────────────────────
  async function handleLeave() {
    try {
      chatRef.current?.destroy(); chatRef.current = null;
      if (zegoContextRef.current) await leaveRoom(zegoContextRef.current);
    } catch (e) { console.error(e); }
    finally {
      zegoContextRef.current   = null;
      notesServiceRef.current  = null;
      setJoined(false);
      setHasCameraStream(false); setHasAudioStream(false);
      setIsMicMuted(false);      setIsCameraOff(false);
      setConnectionStatus("idle"); setIsScreenSharing(false);
      setRemoteStreamCount(0);
      setMessages([]);    setReactions([]);
      setNotesOpen(false); setError(null);
      notifyDisconnect(bookingId);
    }
  }

  // ── Mic toggle ───────────────────────────────────────────────────────────────
  function handleToggleMic() {
    const ctx = zegoContextRef.current;
    if (!joined || !ctx) return;
    if (!ctx.activeAudioStream) return; // no audio stream at all
    const next = !isMicMuted;
    setMicMuted(ctx, next);
    setIsMicMuted(next);
  }

  // ── Camera toggle ────────────────────────────────────────────────────────────
  async function handleToggleCamera() {
    const ctx = zegoContextRef.current;
    if (!joined || !ctx) return;
    if (!hasCameraStream) {
      // No camera stream — attempt to acquire one
      await handleCameraRetry();
      return;
    }
    // Toggle video tracks on existing stream
    const nextOff = !isCameraOff;
    setCameraOn(ctx, !nextOff);
    setIsCameraOff(nextOff);
  }

  // ── Screen share ─────────────────────────────────────────────────────────────
  async function handleToggleScreenShare() {
    const ctx = zegoContextRef.current;
    if (!joined || !ctx) return;
    const container = screenShareContainerRef.current;
    if (!container) return;
    if (!isScreenSharing) {
      try {
        await startScreenShare(ctx, container);
        setIsScreenSharing(true);
      } catch (e) {
        const msg = e.message?.toLowerCase() || "";
        if (!msg.includes("permission") && !msg.includes("cancel") &&
            !msg.includes("notallowed") && !msg.includes("not allowed")) {
          setError(e.message || "Screen sharing failed.");
          setTimeout(() => setError(null), 5000);
        }
      }
    } else {
      try { await stopScreenShare(ctx); } catch (e) { console.error(e); }
      finally { setIsScreenSharing(false); }
    }
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────
  async function handleSendChat(text) {
    if (!joined || !chatRef.current) return;
    const now = Date.now();
    setMessages((p) => [...p, {
      id: `local-${now}-${Math.random().toString(36).slice(2)}`,
      type: "chat", text,
      senderId: String(tokenData.user_id), senderName: "you", ts: now,
    }]);
    try { await chatRef.current.sendChat(text); } catch (e) { console.error(e); }
  }

  // ── Reactions ─────────────────────────────────────────────────────────────────
  async function handleSendReaction(emoji) {
    if (!joined || !chatRef.current) return;
    const now = Date.now();
    const id  = `lr-${now}-${Math.random().toString(36).slice(2)}`;
    const r   = { id, type: "reaction", emoji,
                  senderId: String(tokenData.user_id), senderName: "you", ts: now };
    setReactions((p) => [...p, r]);
    setMessages((p)  => [...p, r]);
    try { await chatRef.current.sendReaction(emoji); } catch (e) { console.error(e); }
  }

  // ── Notes ─────────────────────────────────────────────────────────────────────
  async function handleToggleNotes() {
    if (!isInterviewer) return;
    if (!notesOpen && notesServiceRef.current) {
      try {
        const data = await notesServiceRef.current.fetchNotes();
        setNotesContent(data.content || "");
      } catch (e) { console.error(e); }
    }
    setNotesOpen((o) => !o);
  }

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      chatRef.current?.destroy();
      if (zegoContextRef.current) leaveRoom(zegoContextRef.current).catch(console.error);
      if (bookingId) notifyDisconnect(bookingId);
    };
  }, [bookingId]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const getInitials = (n = "") =>
    n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const localUserName  = tokenData ? `User ${tokenData.user_id}` : "You";
  const remoteUserName = isInterviewer ? "Candidate" : "Interviewer";

  const connLabel = {
    idle: "Not connected", connecting: "Connecting…",
    logining: "Authenticating…", logined: "Connected",
    connected: "Connected", disconnected: "Disconnected",
    error: "Connection error",
  }[connectionStatus] ?? connectionStatus;

  const isConnected   = ["logined", "connected"].includes(connectionStatus);
  const hasMic        = hasCameraStream || hasAudioStream;
  const camIsOn       = hasCameraStream && !isCameraOff;
  const remotePresent = remoteStreamCount > 0; // someone connected, even audio-only
  const showOverlay   = loadingToken || !joined;

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // Room layout is always in the DOM so Zego refs always point to real nodes.
  // Overlay sits on top until joined.
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* ═══ ROOM LAYOUT — always mounted ══════════════════════════════════ */}
      <div style={{ ...s.roomLayout, visibility: joined ? "visible" : "hidden" }}>

        <div style={s.videoCol}>

          {/* ── Main stage: remote video ── */}
          <div style={s.mainStage}>

            {/* Zego appends remote <video> elements here */}
            <div ref={remoteContainerRef} style={s.remoteSlot} />

            {/*
              Placeholder — shown when remote has NOT connected yet.
              When remote is audio-only, remoteStreamCount > 0 so we show
              the "connected, audio only" state instead of "waiting".
              When remote has video, the <video> element in remoteSlot covers this.
            */}
            {!remotePresent && (
              <div style={s.stagePlaceholder}>
                <div style={s.stagePlaceholderAvatar}>{getInitials(remoteUserName)}</div>
                <p style={s.stagePlaceholderLabel}>Waiting for {remoteUserName}…</p>
              </div>
            )}

            {/* Remote connected but audio-only (no video stream) */}
            {remotePresent && remoteStreamCount > 0 && (
              // This is only visible when there's NO <video> element covering it.
              // Once a video stream arrives, the <video> in remoteSlot covers this.
              <div style={s.stagePlaceholder} /* zIndex 1, behind video at zIndex 2 */>
                <div style={s.stagePlaceholderAvatar}>{getInitials(remoteUserName)}</div>
                <p style={s.stagePlaceholderLabel}>{remoteUserName} connected · audio only</p>
              </div>
            )}

            <div style={s.nameBadge}>{remoteUserName}</div>

            {isScreenSharing && (
              <div style={s.screenBanner}>
                <span style={s.screenBannerDot} /> Sharing your screen
              </div>
            )}

            {/* Floating emoji reactions */}
            {reactions.map((r) => (
              <FloatingEmoji
                key={r.id} emoji={r.emoji}
                onDone={() => setReactions((p) => p.filter((x) => x.id !== r.id))}
              />
            ))}

            {error && joined && (
              <div style={s.warningBanner}>⚠ {error}</div>
            )}
          </div>

          {/* ── Draggable self-view PiP ── */}
          <DraggablePip controlBarHeight={76}>
            {/*
              localContainerRef: Zego injects local <video> here.
              Always in DOM. Hidden (display:none) when camera is off.
              The Zego video element stays mounted even when hidden.
            */}
            <div
              ref={localContainerRef}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                display: camIsOn ? "block" : "none",
              }}
            />
            {!camIsOn && (
              <div style={s.pipOff}>
                <span style={s.pipInitials}>{getInitials(localUserName)}</span>
              </div>
            )}
            <div style={s.pipLabel}>You</div>
            {isMicMuted && <div style={s.pipMuted}>🔇</div>}
            <div style={s.pipDragHint} title="Drag to move">⠿</div>
          </DraggablePip>

          {/* ── Control bar ── */}
          <div style={s.controlBar}>
            <div style={s.cbLeft}>
              <span style={s.cbRoomId}>Room #{bookingId}</span>
              <span style={{ ...s.cbDot, background: isConnected ? C.green : C.muted }} />
              <span style={s.cbStatus}>{connLabel}</span>
            </div>

            <div style={s.cbCentre}>
              {/*
                Mic:
                  disabled only when joined AND there's genuinely no audio stream at all.
                  Works via camera stream OR audio-only stream.
              */}
              <CtrlBtn
                icon={isMicMuted ? "🔇" : "🎤"}
                label={isMicMuted ? "Unmute" : "Mute"}
                active={isMicMuted} danger
                disabled={!joined || !hasMic}
                onClick={handleToggleMic}
              />

              {/*
                Camera:
                  When no camera stream: button says "Start cam" (red).
                  Clicking triggers handleCameraRetry.
                  When camera stream exists: toggle on/off normally.
              */}
              <CtrlBtn
                icon={cameraRetrying ? "⏳" : camIsOn ? "📹" : "📷"}
                label={cameraRetrying ? "Trying…" : camIsOn ? "Stop cam" : "Start cam"}
                active={!camIsOn} danger
                disabled={!joined || cameraRetrying}
                onClick={handleToggleCamera}
              />

              {/* Screen share — completely independent of camera/mic */}
              <CtrlBtn
                icon="🖥" label={isScreenSharing ? "Stop" : "Present"}
                active={isScreenSharing} accent
                disabled={!joined}
                onClick={handleToggleScreenShare}
              />

              <CtrlBtn
                icon="💬" label="Chat"
                active={isChatOpen} accent
                onClick={() => setIsChatOpen((o) => !o)}
              />

              {isInterviewer && (
                <CtrlBtn
                  icon="📋" label="Notes"
                  active={notesOpen} accent
                  onClick={handleToggleNotes}
                />
              )}

              <EmojiPickerBtn onPick={handleSendReaction} />
            </div>

            <div style={s.cbRight}>
              <button style={s.leaveBtn} onClick={handleLeave}>Leave</button>
            </div>
          </div>

          {/* Screen-share container — tiny, off-screen but mounted */}
          <div ref={screenShareContainerRef} style={s.offscreen} />
        </div>

        {isChatOpen && (
          <InCallChat
            messages={messages}
            onSend={handleSendChat}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen((o) => !o)}
          />
        )}
      </div>

      {/* ═══ OVERLAY ══════════════════════════════════════════════════════════ */}
      {showOverlay && (
        <div style={s.overlay}>
          <div style={s.overlayCard}>
            {loadingToken && (
              <><div style={s.spinner} /><p style={s.overlayMuted}>Preparing interview room…</p></>
            )}
            {!loadingToken && error && !joined && (
              <>
                <div style={{ fontSize: "36px" }}>⚠</div>
                <h2 style={s.overlayTitle}>Unable to join</h2>
                <p style={s.overlayMuted}>{error}</p>
              </>
            )}
            {!loadingToken && !error && !joined && (
              <>
                <div style={s.lobbyBrand}>
                  <span style={s.lobbyBrandDot} />
                  <span style={s.lobbyBrandName}>InterviewSuite</span>
                </div>
                <div style={s.lobbyAvatar}>{getInitials(localUserName)}</div>
                <h1 style={s.overlayTitle}>Ready to join?</h1>
                <p style={s.overlayMuted}>Interview Room #{bookingId}</p>
                {tokenData && (
                  <div style={s.lobbyRoleBadge}>
                    {tokenData.role === "interviewer" ? "Interviewer" : "Candidate"}
                  </div>
                )}
                <button
                  onClick={handleJoin}
                  disabled={joinInProgress || !tokenData}
                  style={{ ...s.joinBtn, ...(joinInProgress || !tokenData ? s.joinBtnDisabled : {}) }}
                >
                  {joinInProgress ? "Joining…" : "Join Interview"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isInterviewer && (
        <InterviewNotesModal
          isOpen={notesOpen}
          onClose={() => setNotesOpen(false)}
          notesService={notesServiceRef.current}
          initialContent={notesContent}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    position: "relative", width: "100vw", height: "100vh",
    background: C.bg, overflow: "hidden", fontFamily: FONT,
  },
  roomLayout: { display: "flex", width: "100%", height: "100%" },
  videoCol: {
    flex: 1, display: "flex", flexDirection: "column",
    position: "relative", minWidth: 0,
  },
  mainStage: { flex: 1, position: "relative", background: "#06090f", overflow: "hidden" },
  remoteSlot: {
    // Zego appends remote <video> here — must be absolute+full, zIndex above placeholder
    position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2,
  },
  stagePlaceholder: {
    position: "absolute", inset: 0, zIndex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "14px",
  },
  stagePlaceholderAvatar: {
    width: "96px", height: "96px", borderRadius: "50%",
    background: C.surfaceHi, border: `1px solid ${C.border}`,
    color: C.muted, fontSize: "34px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT,
  },
  stagePlaceholderLabel: {
    color: C.muted, fontSize: "14px", fontFamily: FONT, letterSpacing: "0.04em", margin: 0,
  },
  nameBadge: {
    position: "absolute", bottom: "16px", left: "16px", zIndex: 5,
    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
    color: C.white, fontSize: "13px", padding: "4px 14px",
    borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)",
    fontFamily: FONT, letterSpacing: "0.04em",
  },
  screenBanner: {
    position: "absolute", top: "16px", left: "50%",
    transform: "translateX(-50%)", zIndex: 5,
    background: C.accentSoft, border: `1px solid ${C.accentBorder}`,
    color: "#93c5fd", fontSize: "13px", padding: "6px 18px",
    borderRadius: "20px", display: "flex", alignItems: "center",
    gap: "6px", backdropFilter: "blur(8px)", fontFamily: FONT,
  },
  screenBannerDot: {
    width: "7px", height: "7px", borderRadius: "50%",
    background: C.accent, display: "inline-block",
  },
  warningBanner: {
    position: "absolute", top: "14px", left: "50%",
    transform: "translateX(-50%)", zIndex: 7,
    background: C.dangerSoft, border: `1px solid ${C.dangerBorder}`,
    color: "#fca5a5", fontSize: "13px", padding: "7px 20px",
    borderRadius: "20px", backdropFilter: "blur(8px)",
    whiteSpace: "nowrap", fontFamily: FONT,
  },
  pipOff: {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: C.surfaceHi,
  },
  pipInitials: { color: C.accent, fontSize: "26px", fontWeight: "700", fontFamily: FONT },
  pipLabel: {
    position: "absolute", bottom: "6px", left: "8px", zIndex: 2,
    color: C.white, fontSize: "11px",
    background: "rgba(0,0,0,0.55)", padding: "2px 8px", borderRadius: "10px",
  },
  pipMuted: {
    position: "absolute", top: "6px", right: "6px", zIndex: 2,
    fontSize: "13px", background: "rgba(0,0,0,0.6)", borderRadius: "50%",
    width: "22px", height: "22px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  pipDragHint: {
    position: "absolute", top: "5px", left: "50%", transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.25)", fontSize: "14px", userSelect: "none", zIndex: 2,
  },
  controlBar: {
    height: "76px", flexShrink: 0,
    background: C.surface, borderTop: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", gap: "8px", zIndex: 20,
  },
  cbLeft:   { display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" },
  cbRoomId: { color: C.muted, fontSize: "13px", letterSpacing: "0.04em", fontFamily: FONT },
  cbDot:    { width: "7px", height: "7px", borderRadius: "50%", display: "inline-block", flexShrink: 0 },
  cbStatus: { color: C.muted, fontSize: "12px" },
  cbCentre: { display: "flex", alignItems: "center", gap: "4px" },
  cbRight:  { minWidth: "160px", display: "flex", justifyContent: "flex-end" },
  ctrl: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
    borderRadius: "10px", color: C.white, padding: "7px 12px",
    cursor: "pointer", transition: "all 0.15s", minWidth: "52px", fontFamily: FONT,
  },
  ctrlLabel:    { fontSize: "10px", color: C.muted, fontFamily: FONT, letterSpacing: "0.03em", whiteSpace: "nowrap" },
  ctrlDanger:   { background: C.dangerSoft, border: `1px solid ${C.dangerBorder}` },
  ctrlAccent:   { background: C.accentSoft, border: `1px solid ${C.accentBorder}` },
  ctrlDisabled: { opacity: 0.35, cursor: "not-allowed" },
  emojiPicker: {
    position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
    transform: "translateX(-50%)",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: "12px", padding: "10px",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "4px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100,
  },
  emojiPickerBtn: {
    background: "none", border: "none", fontSize: "22px",
    cursor: "pointer", borderRadius: "8px", padding: "6px",
  },
  leaveBtn: {
    background: C.danger, color: C.white, border: "none",
    borderRadius: "8px", padding: "10px 22px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", fontFamily: FONT,
    letterSpacing: "0.04em", boxShadow: "0 4px 16px rgba(239,68,68,0.3)",
  },
  offscreen: {
    position: "absolute", width: "1px", height: "1px",
    overflow: "hidden", opacity: 0, pointerEvents: "none", bottom: 0, right: 0,
  },
  overlay: {
    position: "absolute", inset: 0, zIndex: 50,
    background: `linear-gradient(145deg, ${C.bg} 0%, #0d1a30 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT,
  },
  overlayCard: {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: "16px", padding: "52px 44px", textAlign: "center",
    maxWidth: "380px", width: "100%",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  overlayTitle: {
    color: C.white, fontSize: "24px", fontWeight: "600",
    margin: 0, fontFamily: FONT, letterSpacing: "0.02em",
  },
  overlayMuted: { color: C.muted, fontSize: "14px", margin: 0, lineHeight: "1.6", fontFamily: FONT },
  spinner: {
    width: "36px", height: "36px",
    border: `3px solid ${C.surfaceHi}`, borderTop: `3px solid ${C.accent}`,
    borderRadius: "50%", animation: "spin 0.9s linear infinite",
  },
  lobbyBrand:     { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  lobbyBrandDot:  { width: "8px", height: "8px", borderRadius: "50%", background: C.accent, display: "inline-block" },
  lobbyBrandName: { color: C.muted, fontSize: "12px", fontFamily: FONT, letterSpacing: "0.12em", textTransform: "uppercase" },
  lobbyAvatar: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: C.accentSoft, border: `2px solid ${C.accentBorder}`,
    color: C.accent, fontSize: "28px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT,
  },
  lobbyRoleBadge: {
    background: C.accentSoft, border: `1px solid ${C.accentBorder}`,
    color: "#93c5fd", fontSize: "12px", padding: "4px 14px",
    borderRadius: "20px", fontFamily: FONT, letterSpacing: "0.06em",
  },
  joinBtn: {
    marginTop: "8px", background: C.accent, color: C.white,
    border: "none", borderRadius: "8px", padding: "13px 40px",
    fontSize: "15px", fontWeight: "600", cursor: "pointer",
    fontFamily: FONT, letterSpacing: "0.04em",
    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
  },
  joinBtnDisabled: { opacity: 0.45, cursor: "not-allowed" },
};

export default InterviewRoom;