// import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import { joinAiInterviewSessionThunk } from "../slice/aiInterviewSessionSlice";

// const UI_STATES = {
//   LOADING: "LOADING",
//   ERROR: "ERROR",
//   LOBBY: "LOBBY",
//   CONNECTING: "CONNECTING",
//   LIVE: "LIVE",
//   COMPLETED: "COMPLETED",
// };

// export default function LiveInterviewPage() {
//   const { sessionId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { join } = useSelector((state) => state.aiInterviewSession);

//   const [uiState, setUiState] = useState(UI_STATES.LOADING);
//   const [timeLeftSec, setTimeLeftSec] = useState(null); // seconds countdown

//   // Kick off join on mount
//   useEffect(() => {
//     if (!sessionId) return;
//     dispatch(joinAiInterviewSessionThunk(sessionId));
//   }, [sessionId, dispatch]);

//   // React to join status from Redux
//   useEffect(() => {
//     if (join.status === "joining") {
//       setUiState(UI_STATES.LOADING);
//     } else if (join.status === "error") {
//       setUiState(UI_STATES.ERROR);
//     } else if (join.status === "ready") {
//       setUiState(UI_STATES.LOBBY);
//       // prepare timeLeft from duration (but we only start counting when LIVE)
//       if (join.data?.duration_minutes) {
//         setTimeLeftSec(join.data.duration_minutes * 60);
//       }
//     }
//   }, [join.status, join.data]);

//   // Timer: start when we enter LIVE, stop when leaving LIVE/COMPLETED
//   useEffect(() => {
//     if (uiState !== UI_STATES.LIVE || timeLeftSec == null) return;

//     const interval = setInterval(() => {
//       setTimeLeftSec((prev) => {
//         if (prev == null) return prev;
//         if (prev <= 1) {
//           clearInterval(interval);
//           // When timer finishes, mark completed
//           setUiState(UI_STATES.COMPLETED);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [uiState, timeLeftSec]);

//   const handleBackToRoles = () => {
//     navigate("/ai-interview/roles");
//   };

//   const handleJoinInterview = () => {
//     // Later this will start LiveKit connection.
//     setUiState(UI_STATES.CONNECTING);

//     // Simulate connection delay for now
//     setTimeout(() => {
//       setUiState(UI_STATES.LIVE);
//     }, 1000);
//   };

//   const handleEndInterview = () => {
//     const confirmEnd = window.confirm(
//       "End this interview and leave the room?"
//     );
//     if (!confirmEnd) return;

//     setUiState(UI_STATES.COMPLETED);
//     // Later, you might also call a backend endpoint to mark session completed.
//   };

//   const sessionInfo = useMemo(() => {
//     const data = join.data;
//     if (!data) return null;
//     return {
//       roleName: data.role?.name || "N/A",
//       roleCategory: data.role?.category || null,
//       roundType: data.round_type || "N/A",
//       difficulty: data.difficulty || "N/A",
//       durationMinutes: data.duration_minutes || null,
//       status: data.status || "N/A",
//       roomName: data.livekit_room_name || "Not generated",
//     };
//   }, [join.data]);

//   const formattedTimeLeft = useMemo(() => {
//     if (timeLeftSec == null) return null;
//     const m = Math.floor(timeLeftSec / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (timeLeftSec % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   }, [timeLeftSec]);

//   return (
//     <div
//       className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <div className="max-w-4xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl p-5 sm:p-7">
//         {/* Header */}
//         <Header
//           sessionId={sessionId}
//           joinStatus={join.status}
//           uiState={uiState}
//           onBack={handleBackToRoles}
//         />
        

//         {/* Main content by uiState */}
//         {uiState === UI_STATES.LOADING && (
//           <LoadingView message="Connecting to your AI interview session..." />
//         )}

//         {uiState === UI_STATES.ERROR && (
//           <ErrorView
//             errorMessage={join.error}
//             onStartNew={handleBackToRoles}
//           />
//         )}

//         {uiState === UI_STATES.LOBBY && sessionInfo && (
//           <LobbyView
//             sessionInfo={sessionInfo}
//             onJoin={handleJoinInterview}
//           />
//         )}

//         {uiState === UI_STATES.CONNECTING && sessionInfo && (
//           <ConnectingView sessionInfo={sessionInfo} />
//         )}

//         {uiState === UI_STATES.LIVE && sessionInfo && (
//           <LiveInterviewView
//             sessionInfo={sessionInfo}
//             formattedTimeLeft={formattedTimeLeft}
//             onEnd={handleEndInterview}
//           />
//         )}

//         {uiState === UI_STATES.COMPLETED && sessionInfo && (
//           <CompletedView
//             sessionInfo={sessionInfo}
//             onBackToRoles={handleBackToRoles}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// /* -------------------- Sub components -------------------- */

// function Header({ sessionId, joinStatus, uiState, onBack }) {
//   const statusLabel =
//     joinStatus === "joining"
//       ? "Joining session"
//       : joinStatus === "ready"
//       ? "Ready"
//       : joinStatus === "error"
//       ? "Error"
//       : joinStatus;

//   return (
//     <div className="flex items-center justify-between gap-3 mb-4">
//       <div>
//         <button
//           onClick={onBack}
//           className="inline-flex items-center text-[11px] text-gray-400 hover:text-teal-300"
//         >
//           <svg
//             className="w-3.5 h-3.5 mr-1"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//           >
//             <path d="M15 19l-7-7 7-7" />
//           </svg>
//           Back to roles
//         </button>
//         <h1 className="mt-1 font-semibold text-sm sm:text-base text-gray-50">
//           AI Interview Session
//         </h1>
//         <p className="text-[11px] text-gray-500">
//           Session ID: <span className="text-gray-300">{sessionId}</span>
//         </p>
//       </div>
//       <div className="text-[11px] text-gray-400 text-right">
//         <div>
//           Status:{" "}
//           <span className="font-semibold text-emerald-400">
//             {statusLabel}
//           </span>
//         </div>
//         <div className="text-[10px] mt-0.5 text-gray-500">
//           UI: {uiState}
//         </div>
//       </div>
//     </div>
//   );
// }

// function LoadingView({ message }) {
//   return (
//     <div className="py-10 text-center text-sm text-gray-300">
//       <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-700 bg-gray-800/60 mb-3">
//         <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//         <span className="text-[11px] text-gray-200">Connecting</span>
//       </div>
//       <p>{message}</p>
//     </div>
//   );
// }

// function ErrorView({ errorMessage, onStartNew }) {
//   const displayMessage =
//     errorMessage ||
//     "This interview session is no longer valid. It may have expired or never existed.";

//   return (
//     <div className="py-10 flex flex-col items-center text-center">
//       <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mb-3">
//         <svg
//           className="w-5 h-5 text-red-400"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//         >
//           <path d="M12 9v4" />
//           <path d="M12 17h.01" />
//           <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
//         </svg>
//       </div>
//       <h2 className="text-sm font-semibold text-gray-50 mb-1">
//         Session unavailable
//       </h2>
//       <p className="text-[11px] text-gray-400 max-w-sm mb-4">
//         {displayMessage}
//       </p>
//       <button
//         type="button"
//         onClick={onStartNew}
//         className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white"
//       >
//         Start a new interview
//       </button>
//     </div>
//   );
// }

// function LobbyView({ sessionInfo, onJoin }) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//       {/* Left: Instructions */}
//       <div className="bg-gray-900/70 rounded-xl border border-gray-800 p-4">
//         <h2 className="text-sm font-semibold text-gray-50 mb-3">
//           Interview Instructions
//         </h2>
//         <ul className="space-y-2 text-[11px] text-gray-300">
//           <li>
//             1. Wait for the AI interviewer to introduce the interview and ask
//             your first question.
//           </li>
//           <li>
//             2. Speak your answers clearly. Every response is recorded and
//             analyzed for feedback.
//           </li>
//           <li>
//             3. Try to answer all questions to receive a complete analytics
//             report at the end.
//           </li>
//           <li>
//             4. Keep this tab open and avoid switching devices during the
//             interview.
//           </li>
//         </ul>
//       </div>

//       {/* Right: Session summary + join */}
//       <div className="bg-gray-900/70 rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
//         <div>
//           <h2 className="text-sm font-semibold text-gray-50 mb-3">
//             Session Summary
//           </h2>
//           <dl className="space-y-1 text-[11px] text-gray-300">
//             <Row label="Role" value={sessionInfo.roleName} />
//             <Row label="Round" value={sessionInfo.roundType} uppercase />
//             <Row label="Difficulty" value={sessionInfo.difficulty} uppercase />
//             <Row
//               label="Duration"
//               value={
//                 sessionInfo.durationMinutes
//                   ? `${sessionInfo.durationMinutes} mins`
//                   : "N/A"
//               }
//             />
//             <Row
//               label="Backend status"
//               value={sessionInfo.status}
//               uppercase
//               valueClass="text-emerald-400"
//             />
//             <Row
//               label="Room name"
//               value={sessionInfo.roomName}
//               valueClass="text-gray-500"
//             />
//           </dl>
//         </div>

//         <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between gap-3">
//           <p className="text-[11px] text-gray-400 max-w-xs">
//             When you click join, we’ll connect your microphone and start the AI
//             interview experience.
//           </p>
//           <button
//             type="button"
//             onClick={onJoin}
//             className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white"
//           >
//             Join AI Interview
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ConnectingView({ sessionInfo }) {
//   return (
//     <div className="py-10 flex flex-col items-center text-center">
//       <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/40 flex items-center justify-center mb-3">
//         <span className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
//       </div>
//       <h2 className="text-sm font-semibold text-gray-50 mb-1">
//         Connecting to AI interviewer…
//       </h2>
//       <p className="text-[11px] text-gray-400 max-w-sm mb-4">
//         We’re preparing your {sessionInfo.roundType.toLowerCase()} interview
//         for the {sessionInfo.roleName} role.
//       </p>
//       <p className="text-[11px] text-gray-500">
//         This will take just a moment. Please keep this tab open.
//       </p>
//     </div>
//   );
// }

// function LiveInterviewView({ sessionInfo, formattedTimeLeft, onEnd }) {
//   return (
//     <div className="bg-gray-900/70 rounded-xl border border-gray-800 p-4 sm:p-5">
//       {/* Top bar: role + timer */}
//       <div className="flex items-center justify-between gap-3 mb-4">
//         <div>
//           <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//             Live AI Interview
//           </p>
//           <p className="text-sm font-semibold text-gray-50">
//             {sessionInfo.roleName} · {sessionInfo.roundType}
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           {formattedTimeLeft && (
//             <div className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-[11px] font-semibold text-teal-300">
//               Time left: {formattedTimeLeft}
//             </div>
//           )}
//           <button
//             type="button"
//             onClick={onEnd}
//             className="px-3 py-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-[11px] font-semibold text-white"
//           >
//             End Interview
//           </button>
//         </div>
//       </div>

//       {/* Body: AI placeholder */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {/* AI "video" placeholder */}
//         <div className="md:col-span-2">
//           <div className="aspect-video rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
//             <div className="text-center px-4">
//               <p className="text-sm font-semibold text-gray-50 mb-1">
//                 AI interviewer is preparing your first question…
//               </p>
//               <p className="text-[11px] text-gray-400">
//                 In the real implementation, your AI interviewer video/voice and
//                 questions will appear here.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Right: Upcoming question / notes */}
//         <div className="md:col-span-1 flex flex-col gap-3">
//           <div className="rounded-xl bg-gray-800 border border-gray-700 p-3">
//             <p className="text-[11px] font-semibold text-gray-200 mb-1">
//               What to expect
//             </p>
//             <p className="text-[11px] text-gray-400">
//               You’ll hear a question, then you’ll have a few seconds to think
//               before answering out loud. Try to respond in 1–2 minutes per
//               question.
//             </p>
//           </div>
//           <div className="rounded-xl bg-gray-800 border border-gray-700 p-3">
//             <p className="text-[11px] font-semibold text-gray-200 mb-1">
//               Tip
//             </p>
//             <p className="text-[11px] text-gray-400">
//               Use STAR (Situation, Task, Action, Result) for behavioral
//               questions to structure your answers clearly.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CompletedView({ sessionInfo, onBackToRoles }) {
//   return (
//     <div className="py-10 flex flex-col items-center text-center">
//       <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mb-3">
//         <svg
//           className="w-5 h-5 text-emerald-400"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//         >
//           <path d="M20 6 9 17l-5-5" />
//         </svg>
//       </div>
//       <h2 className="text-sm font-semibold text-gray-50 mb-1">
//         Interview completed
//       </h2>
//       <p className="text-[11px] text-gray-400 max-w-sm mb-4">
//         Your mock interview for the {sessionInfo.roleName} role is finished.
//         Later we’ll show a detailed feedback report here.
//       </p>
//       <button
//         type="button"
//         onClick={onBackToRoles}
//         className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white"
//       >
//         Back to roles
//       </button>
//     </div>
//   );
// }

// function Row({ label, value, uppercase, valueClass }) {
//   return (
//     <div className="flex justify-between gap-3">
//       <dt className="text-gray-400">{label}</dt>
//       <dd
//         className={`text-right ${valueClass || ""} ${
//           uppercase ? "uppercase text-[10px] font-semibold" : ""
//         }`}
//       >
//         {value}
//       </dd>
//     </div>
//   );
// }






















// // src/pages/LiveInterviewPage.jsx

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { Room, RoomEvent, createLocalTracks } from "livekit-client"; // LiveKit JS SDK[web:36][web:69]

// import { joinAiInterviewSessionThunk } from "../slice/aiInterviewSessionSlice";

// import { LiveInterviewHeader } from "../components/LiveInterviewHeader";
// import {
//   LoadingView,
//   ErrorView,
//   LobbyView,
//   ConnectingView,
//   LiveInterviewView,
//   CompletedView,
// } from "../components/LiveInterviewViews";

// const UI_STATES = {
//   LOADING: "LOADING",
//   ERROR: "ERROR",
//   LOBBY: "LOBBY",
//   CONNECTING: "CONNECTING",
//   LIVE: "LIVE",
//   COMPLETED: "COMPLETED",
// };

// export default function LiveInterviewPage() {
//   const { sessionId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { join } = useSelector((state) => state.aiInterviewSession);

//   const [uiState, setUiState] = useState(UI_STATES.LOADING);
//   const [timeLeftSec, setTimeLeftSec] = useState(null); // seconds countdown
//   const [connectionError, setConnectionError] = useState(null);

//   // Keep a ref to the LiveKit room so we can disconnect on unmount
//   const roomRef = useRef(null);

//   // Kick off join on mount
//   useEffect(() => {
//     if (!sessionId) return;
//     dispatch(joinAiInterviewSessionThunk(sessionId));
//   }, [sessionId, dispatch]);

//   // React to join status from Redux
//   useEffect(() => {
//     if (join.status === "joining") {
//       setUiState(UI_STATES.LOADING);
//     } else if (join.status === "error") {
//       setUiState(UI_STATES.ERROR);
//     } else if (join.status === "ready") {
//       setUiState(UI_STATES.LOBBY);
//       if (join.data?.duration_minutes) {
//         setTimeLeftSec(join.data.duration_minutes * 60);
//       }
//     }
//   }, [join.status, join.data]);

//   // Timer: start when we enter LIVE, stop when leaving LIVE/COMPLETED
//   useEffect(() => {
//     if (uiState !== UI_STATES.LIVE || timeLeftSec == null) return;

//     const interval = setInterval(() => {
//       setTimeLeftSec((prev) => {
//         if (prev == null) return prev;
//         if (prev <= 1) {
//           clearInterval(interval);
//           setUiState(UI_STATES.COMPLETED);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [uiState, timeLeftSec]);

//   // Cleanup LiveKit room on unmount
//   useEffect(() => {
//     return () => {
//       if (roomRef.current) {
//         roomRef.current.disconnect();
//         roomRef.current = null;
//       }
//     };
//   }, []);

//   const handleBackToRoles = () => {
//     navigate("/ai-interview/roles");
//   };

//   const handleJoinInterview = async () => {
//     if (!join.data) return;

//     setConnectionError(null);
//     setUiState(UI_STATES.CONNECTING);

//     try {
//       const { livekit_server_url, livekit_token } = join.data;

//       const room = new Room();
//       roomRef.current = room;

//       // When the room disconnects (e.g., network, server), bring UI back to lobby
//       room.on(RoomEvent.Disconnected, () => {
//         roomRef.current = null;
//         setUiState((prev) =>
//           prev === UI_STATES.COMPLETED ? prev : UI_STATES.LOBBY
//         );
//       });

//       // Connect to LiveKit using the URL + token from your Django backend[web:36][web:69]
//       await room.connect(livekit_server_url, livekit_token);

//       // Publish local audio + video tracks
//       const tracks = await createLocalTracks({
//         audio: true,
//         video: { facingMode: "user" },
//       });
//       for (const track of tracks) {
//         await room.localParticipant.publishTrack(track);
//       }

//       setUiState(UI_STATES.LIVE);
//     } catch (err) {
//       console.error("Failed to connect to LiveKit room", err);
//       setConnectionError(
//         err?.message || "Failed to connect to the AI interview room."
//       );
//       // Show a structured error screen
//       setUiState(UI_STATES.ERROR);
//     }
//   };

//   const handleEndInterview = () => {
//     const confirmEnd = window.confirm(
//       "End this interview and leave the room?"
//     );
//     if (!confirmEnd) return;

//     if (roomRef.current) {
//       roomRef.current.disconnect();
//       roomRef.current = null;
//     }
//     setUiState(UI_STATES.COMPLETED);
//   };

//   const sessionInfo = useMemo(() => {
//     const data = join.data;
//     if (!data) return null;
//     return {
//       roleName: data.role?.name || "N/A",
//       roleCategory: data.role?.category || null,
//       roundType: data.round_type || "N/A",
//       difficulty: data.difficulty || "N/A",
//       durationMinutes: data.duration_minutes || null,
//       status: data.status || "N/A",
//       roomName: data.livekit_room_name || "Not generated",
//     };
//   }, [join.data]);

//   const formattedTimeLeft = useMemo(() => {
//     if (timeLeftSec == null) return null;
//     const m = Math.floor(timeLeftSec / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (timeLeftSec % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   }, [timeLeftSec]);

//   const isConnected = !!roomRef.current;

//   return (
//     <div
//       className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <div className="max-w-4xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl p-5 sm:p-7">
//         <LiveInterviewHeader
//           sessionId={sessionId}
//           joinStatus={join.status}
//           uiState={uiState}
//           onBack={handleBackToRoles}
//         />

//         {/* Dev-only debug: you can remove this later */}
//         {join.status === "ready" && join.data && (
//           <div className="mb-3 text-[10px] text-gray-500 break-all">
//             <div>LiveKit URL: {join.data.livekit_server_url}</div>
//             <div className="mt-1 opacity-70">
//               Token (dev only): {join.data.livekit_token}
//             </div>
//           </div>
//         )}

//         {/* Main content by uiState */}
//         {uiState === UI_STATES.LOADING && (
//           <LoadingView message="Connecting to your AI interview session..." />
//         )}

//         {uiState === UI_STATES.ERROR && (
//           <ErrorView
//             errorMessage={connectionError || join.error}
//             onStartNew={handleBackToRoles}
//           />
//         )}

//         {uiState === UI_STATES.LOBBY && sessionInfo && (
//           <LobbyView sessionInfo={sessionInfo} onJoin={handleJoinInterview} />
//         )}

//         {uiState === UI_STATES.CONNECTING && sessionInfo && (
//           <ConnectingView sessionInfo={sessionInfo} />
//         )}

//         {uiState === UI_STATES.LIVE && sessionInfo && (
//           <LiveInterviewView
//             sessionInfo={sessionInfo}
//             formattedTimeLeft={formattedTimeLeft}
//             onEnd={handleEndInterview}
//             isConnected={isConnected}
//           />
//         )}

//         {uiState === UI_STATES.COMPLETED && sessionInfo && (
//           <CompletedView
//             sessionInfo={sessionInfo}
//             onBackToRoles={handleBackToRoles}
//           />
//         )}
//       </div>
//     </div>
//   );
// }




















// // src/pages/LiveInterviewPage.jsx

// import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import { joinAiInterviewSessionThunk } from "../slice/aiInterviewSessionSlice";

// import { LiveInterviewHeader } from "../components/LiveInterviewHeader";
// import {
//   LoadingView,
//   ErrorView,
//   LobbyView,
//   ConnectingView,
//   LiveInterviewView,
//   CompletedView,
// } from "../components/LiveInterviewViews";

// const UI_STATES = {
//   LOADING: "LOADING",
//   ERROR: "ERROR",
//   LOBBY: "LOBBY",
//   CONNECTING: "CONNECTING",
//   LIVE: "LIVE",
//   COMPLETED: "COMPLETED",
// };

// export default function LiveInterviewPage() {
//   const { sessionId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { join } = useSelector((state) => state.aiInterviewSession);

//   const [uiState, setUiState] = useState(UI_STATES.LOADING);
//   const [timeLeftSec, setTimeLeftSec] = useState(null);
//   const [connectionError, setConnectionError] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // Kick off join on mount
//   useEffect(() => {
//     if (!sessionId) return;
//     dispatch(joinAiInterviewSessionThunk(sessionId));
//   }, [sessionId, dispatch]);

//   // React to join status from Redux
//   useEffect(() => {
//     if (join.status === "joining") {
//       setUiState(UI_STATES.LOADING);
//     } else if (join.status === "error") {
//       setUiState(UI_STATES.ERROR);
//     } else if (join.status === "ready") {
//       setUiState(UI_STATES.LOBBY);
//       if (join.data?.duration_minutes) {
//         setTimeLeftSec(join.data.duration_minutes * 60);
//       }
//     }
//   }, [join.status, join.data]);

//   // Timer: start when we are in LIVE state, stop on leave/completed
//   useEffect(() => {
//     if (uiState !== UI_STATES.LIVE || timeLeftSec == null) return;

//     const interval = setInterval(() => {
//       setTimeLeftSec((prev) => {
//         if (prev == null) return prev;
//         if (prev <= 1) {
//           clearInterval(interval);
//           setUiState(UI_STATES.COMPLETED);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [uiState, timeLeftSec]);

//   const handleBackToRoles = () => {
//     navigate("/ai-interview/roles");
//   };

//   const handleJoinInterview = () => {
//     if (!join.data) return;
//     setConnectionError(null);
//     setIsConnected(false);
//     // We move into CONNECTING; LiveKitVideoPanel will auto-connect using token+url.
//     setUiState(UI_STATES.CONNECTING);
//   };

//   const handleRoomConnected = () => {
//     setIsConnected(true);
//     setUiState(UI_STATES.LIVE);
//   };

//   const handleRoomDisconnected = () => {
//     setIsConnected(false);
//     // If we didn't complete manually, send user back to lobby
//     setUiState((prev) =>
//       prev === UI_STATES.COMPLETED ? prev : UI_STATES.LOBBY
//     );
//   };

//   const handleEndInterview = () => {
//     const confirmEnd = window.confirm(
//       "End this interview and leave the room?"
//     );
//     if (!confirmEnd) return;
//     setIsConnected(false);
//     setUiState(UI_STATES.COMPLETED);
//   };

//   const sessionInfo = useMemo(() => {
//     const data = join.data;
//     if (!data) return null;
//     return {
//       roleName: data.role?.name || "N/A",
//       roleCategory: data.role?.category || null,
//       roundType: data.round_type || "N/A",
//       difficulty: data.difficulty || "N/A",
//       durationMinutes: data.duration_minutes || null,
//       status: data.status || "N/A",
//       roomName: data.livekit_room_name || "Not generated",
//     };
//   }, [join.data]);

//   const formattedTimeLeft = useMemo(() => {
//     if (timeLeftSec == null) return null;
//     const m = Math.floor(timeLeftSec / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (timeLeftSec % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   }, [timeLeftSec]);

//   return (
//     <div
//       className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <div className="max-w-4xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl p-5 sm:p-7">
//         <LiveInterviewHeader
//           sessionId={sessionId}
//           joinStatus={join.status}
//           uiState={uiState}
//           onBack={handleBackToRoles}
//         />

//         {/* (Optional) dev-only debug for token & URL */}
//         {join.status === "ready" && join.data && (
//           <div className="mb-3 text-[10px] text-gray-500 break-all">
//             <div>LiveKit URL: {join.data.livekit_server_url}</div>
//             <div className="mt-1 opacity-70">
//               Token (dev only): {join.data.livekit_token}
//             </div>
//           </div>
//         )}

//         {/* Main content by uiState */}
//         {uiState === UI_STATES.LOADING && (
//           <LoadingView message="Connecting to your AI interview session..." />
//         )}

//         {uiState === UI_STATES.ERROR && (
//           <ErrorView
//             errorMessage={connectionError || join.error}
//             onStartNew={handleBackToRoles}
//           />
//         )}

//         {uiState === UI_STATES.LOBBY && sessionInfo && (
//           <LobbyView sessionInfo={sessionInfo} onJoin={handleJoinInterview} />
//         )}

//         {uiState === UI_STATES.CONNECTING && sessionInfo && (
//           <LiveInterviewView
//             sessionInfo={sessionInfo}
//             formattedTimeLeft={formattedTimeLeft}
//             onEnd={handleEndInterview}
//             isConnected={isConnected}
//             livekitServerUrl={join.data.livekit_server_url}
//             livekitToken={join.data.livekit_token}
//             uiState={uiState}
//             onRoomConnected={handleRoomConnected}
//             onRoomDisconnected={handleRoomDisconnected}
//           />
//         )}

//         {uiState === UI_STATES.LIVE && sessionInfo && (
//           <LiveInterviewView
//             sessionInfo={sessionInfo}
//             formattedTimeLeft={formattedTimeLeft}
//             onEnd={handleEndInterview}
//             isConnected={isConnected}
//             livekitServerUrl={join.data.livekit_server_url}
//             livekitToken={join.data.livekit_token}
//             uiState={uiState}
//             onRoomConnected={handleRoomConnected}
//             onRoomDisconnected={handleRoomDisconnected}
//           />
//         )}

//         {uiState === UI_STATES.COMPLETED && sessionInfo && (
//           <CompletedView
//             sessionInfo={sessionInfo}
//             onBackToRoles={handleBackToRoles}
//           />
//         )}
//       </div>
//     </div>
//   );
// }






















// // src/pages/LiveInterviewPage.jsx

// import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import { joinAiInterviewSessionThunk } from "../slice/aiInterviewSessionSlice";

// import { LiveInterviewHeader } from "../components/LiveInterviewHeader";
// import {
//   LoadingView,
//   ErrorView,
//   LobbyView,
//   ConnectingView,
//   LiveInterviewView,
//   CompletedView,
// } from "../components/LiveInterviewViews";

// const UI_STATES = {
//   LOADING: "LOADING",
//   ERROR: "ERROR",
//   LOBBY: "LOBBY",
//   CONNECTING: "CONNECTING",
//   LIVE: "LIVE",
//   COMPLETED: "COMPLETED",
// };

// export default function LiveInterviewPage() {
//   const { sessionId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { join } = useSelector((state) => state.aiInterviewSession);

//   const [uiState, setUiState] = useState(UI_STATES.LOADING);
//   const [timeLeftSec, setTimeLeftSec] = useState(null);
//   const [connectionError, setConnectionError] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // Kick off join on mount
//   useEffect(() => {
//     if (!sessionId) return;
//     dispatch(joinAiInterviewSessionThunk(sessionId));
//   }, [sessionId, dispatch]);

//   // React to join status from Redux
//   useEffect(() => {
//     if (join.status === "joining") {
//       setUiState(UI_STATES.LOADING);
//     } else if (join.status === "error") {
//       setUiState(UI_STATES.ERROR);
//     } else if (join.status === "ready") {
//       setUiState(UI_STATES.LOBBY);
//       if (join.data?.duration_minutes) {
//         setTimeLeftSec(join.data.duration_minutes * 60);
//       }
//     }
//   }, [join.status, join.data]);

//   // Timer only in LIVE
//   useEffect(() => {
//     if (uiState !== UI_STATES.LIVE || timeLeftSec == null) return;

//     const interval = setInterval(() => {
//       setTimeLeftSec((prev) => {
//         if (prev == null) return prev;
//         if (prev <= 1) {
//           clearInterval(interval);
//           setUiState(UI_STATES.COMPLETED);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [uiState, timeLeftSec]);

//   const handleBackToRoles = () => {
//     navigate("/ai-interview/roles");
//   };

//   const handleJoinInterview = () => {
//     if (!join.data) return;
//     setConnectionError(null);
//     setIsConnected(false);
//     setUiState(UI_STATES.CONNECTING); // this will cause LiveKitVideoPanel to connect
//   };

//   const handleRoomConnected = () => {
//     setIsConnected(true);
//     setUiState(UI_STATES.LIVE);
//   };

//   const handleRoomDisconnected = () => {
//     setIsConnected(false);
//     setUiState((prev) =>
//       prev === UI_STATES.COMPLETED ? prev : UI_STATES.LOBBY
//     );
//   };

//   const handleEndInterview = () => {
//     const confirmEnd = window.confirm(
//       "End this interview and leave the room?"
//     );
//     if (!confirmEnd) return;
//     setIsConnected(false);
//     setUiState(UI_STATES.COMPLETED);
//   };

//   const sessionInfo = useMemo(() => {
//     const data = join.data;
//     if (!data) return null;
//     return {
//       roleName: data.role?.name || "N/A",
//       roleCategory: data.role?.category || null,
//       roundType: data.round_type || "N/A",
//       difficulty: data.difficulty || "N/A",
//       durationMinutes: data.duration_minutes || null,
//       status: data.status || "N/A",
//       roomName: data.livekit_room_name || "Not generated",
//     };
//   }, [join.data]);

//   const formattedTimeLeft = useMemo(() => {
//     if (timeLeftSec == null) return null;
//     const m = Math.floor(timeLeftSec / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (timeLeftSec % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   }, [timeLeftSec]);

//   return (
//     <div
//       className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <div className="max-w-4xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl p-5 sm:p-7">
//         <LiveInterviewHeader
//           sessionId={sessionId}
//           joinStatus={join.status}
//           uiState={uiState}
//           onBack={handleBackToRoles}
//         />

//         {/* optional dev debug: URL + token */}
//         {join.status === "ready" && join.data && (
//           <div className="mb-3 text-[10px] text-gray-500 break-all">
//             <div>LiveKit URL: {join.data.livekit_server_url}</div>
//             <div className="mt-1 opacity-70">
//               Token (dev only): {join.data.livekit_token}
//             </div>
//           </div>
//         )}

//         {uiState === UI_STATES.LOADING && (
//           <LoadingView message="Connecting to your AI interview session..." />
//         )}

//         {uiState === UI_STATES.ERROR && (
//           <ErrorView
//             errorMessage={connectionError || join.error}
//             onStartNew={handleBackToRoles}
//           />
//         )}

//         {uiState === UI_STATES.LOBBY && sessionInfo && (
//           <LobbyView sessionInfo={sessionInfo} onJoin={handleJoinInterview} />
//         )}

//         {(uiState === UI_STATES.CONNECTING || uiState === UI_STATES.LIVE) &&
//           sessionInfo &&
//           join.data && (
//             <LiveInterviewView
//               sessionInfo={sessionInfo}
//               formattedTimeLeft={formattedTimeLeft}
//               onEnd={handleEndInterview}
//               isConnected={isConnected}
//               livekitServerUrl={join.data.livekit_server_url}
//               livekitToken={join.data.livekit_token}
//               uiState={uiState}
//               onRoomConnected={handleRoomConnected}
//               onRoomDisconnected={handleRoomDisconnected}
//             />
//           )}

//         {uiState === UI_STATES.COMPLETED && sessionInfo && (
//           <CompletedView
//             sessionInfo={sessionInfo}
//             onBackToRoles={handleBackToRoles}
//           />
//         )}
//       </div>
//     </div>
//   );
// }





















// // src/features/aiInterview/pages/LiveInterviewPage.jsx

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useInterviewTimer } from "../hooks/useInterviewTimer";

// import {
//   joinAiInterviewSessionThunk,
//   endAiInterviewSessionThunk,
// } from "../slice/aiInterviewSessionSlice";

// import { LiveInterviewHeader } from "../components/LiveInterviewHeader";
// import {
//   LoadingView,
//   ErrorView,
//   LobbyView,
//   ConnectingView,
//   LiveInterviewView,
//   CompletedView,
// } from "../components/LiveInterviewViews";

// const UI_STATES = {
//   LOADING: "LOADING",
//   ERROR: "ERROR",
//   LOBBY: "LOBBY",
//   CONNECTING: "CONNECTING",
//   LIVE: "LIVE",
//   COMPLETED: "COMPLETED",
// };

// export default function LiveInterviewPage() {
//   const { sessionId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { join, end } = useSelector((state) => state.aiInterviewSession);

//   const [uiState, setUiState] = useState(UI_STATES.LOADING);
//   const [timeLeftSec, setTimeLeftSec] = useState(null);
//   const [connectionError, setConnectionError] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // Prevent duplicate auto-end calls from timer
//   const hasAutoEndedRef = useRef(false);

//   // Kick off join on mount
//   useEffect(() => {
//     if (!sessionId) return;
//     dispatch(joinAiInterviewSessionThunk(sessionId));
//   }, [sessionId, dispatch]);

//   // React to join status from Redux + backend session status
//   // React to join status from Redux + backend session status
// useEffect(() => {
//   if (join.status === "joining") {
//     setUiState(UI_STATES.LOADING);
//     return;
//   }

//   if (join.status === "error") {
//     setUiState(UI_STATES.ERROR);
//     return;
//   }

//   if (join.status === "ready") {
//     const backendStatus = join.data?.status;

//     // Use backend authority for remaining time
//     const remainingFromBackend =
//       typeof join.data?.remaining_seconds === "number"
//         ? join.data.remaining_seconds
//         : join.data?.duration_minutes
//         ? join.data.duration_minutes * 60
//         : null;

//     setTimeLeftSec(remainingFromBackend);
//     hasAutoEndedRef.current = false;

//     if (backendStatus === "COMPLETED") {
//       setUiState(UI_STATES.COMPLETED);
//       return;
//     }

//     if (backendStatus === "CANCELLED" || backendStatus === "FAILED") {
//       setConnectionError(
//         `This interview session is ${backendStatus.toLowerCase()}.`
//       );
//       setUiState(UI_STATES.ERROR);
//       return;
//     }

//     // For READY or LIVE, go to lobby; LIVE will use remaining_seconds,
//     // so refresh + rejoin continues where it left off instead of restarting.
//     setUiState(UI_STATES.LOBBY);
//   }
// }, [join.status, join.data]);

//   // React to end status
//   useEffect(() => {
//     if (end.status === "success") {
//       setIsConnected(false);
//       setUiState(UI_STATES.COMPLETED);
//     } else if (end.status === "error") {
//       setConnectionError(end.error || "Failed to end interview.");
//       // Keep user in LIVE if end fails, do not silently complete
//     }
//   }, [end.status, end.error]);

//   // Timer only in LIVE
//   useEffect(() => {
//     if (uiState !== UI_STATES.LIVE || timeLeftSec == null) return;

//     const interval = setInterval(() => {
//       setTimeLeftSec((prev) => {
//         if (prev == null) return prev;

//         if (prev <= 1) {
//           clearInterval(interval);

//           // Backend-authoritative auto-end
//           if (!hasAutoEndedRef.current && join.data?.session_id) {
//             hasAutoEndedRef.current = true;
//             dispatch(
//               endAiInterviewSessionThunk({
//                 sessionId: join.data.session_id,
//                 reason: "COMPLETED",
//               })
//             );
//           }

//           return 0;
//         }

//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [uiState, timeLeftSec, dispatch, join.data]);

//   const handleBackToRoles = () => {
//     navigate("/ai-interview/roles");
//   };

//   const handleJoinInterview = () => {
//     if (!join.data) return;

//     const backendStatus = join.data.status;

//     // Do not allow entering if backend says final state
//     if (
//       backendStatus === "COMPLETED" ||
//       backendStatus === "CANCELLED" ||
//       backendStatus === "FAILED"
//     ) {
//       setConnectionError("This interview can no longer be started.");
//       setUiState(UI_STATES.ERROR);
//       return;
//     }

//     setConnectionError(null);
//     setIsConnected(false);
//     setUiState(UI_STATES.CONNECTING);
//   };

//   const handleRoomConnected = () => {
//     setIsConnected(true);
//     setUiState(UI_STATES.LIVE);
//   };

//   const handleRoomDisconnected = () => {
//     setIsConnected(false);

//     // If interview is already completed, do nothing.
//     if (uiState === UI_STATES.COMPLETED) return;

//     // If disconnect happens while connecting/live, show error instead of sending user back to lobby.
//     setConnectionError(
//       "Connection to the interview room was lost. Please refresh only if the backend still allows resuming this session."
//     );
//     setUiState(UI_STATES.ERROR);
//   };

//   const handleEndInterview = async () => {
//     const confirmEnd = window.confirm(
//       "End this interview and leave the room?"
//     );
//     if (!confirmEnd) return;
//     if (!join.data?.session_id) return;

//     try {
//       await dispatch(
//         endAiInterviewSessionThunk({
//           sessionId: join.data.session_id,
//           reason: "COMPLETED",
//         })
//       ).unwrap();
//     } catch (error) {
//       setConnectionError(
//         error?.detail || "Failed to end interview. Please try again."
//       );
//     }
//   };

//   const sessionInfo = useMemo(() => {
//     const data = join.data;
//     if (!data) return null;

//     return {
//       roleName: data.role?.name || "N/A",
//       roleCategory: data.role?.category || null,
//       roundType: data.round_type || "N/A",
//       difficulty: data.difficulty || "N/A",
//       durationMinutes: data.duration_minutes || null,
//       status: data.status || "N/A",
//       roomName: data.livekit_room_name || "Not generated",
//     };
//   }, [join.data]);

//   const formattedTimeLeft = useMemo(() => {
//     if (timeLeftSec == null) return null;
//     const m = Math.floor(timeLeftSec / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (timeLeftSec % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   }, [timeLeftSec]);

//   return (
//     <div
//       className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4"
//       style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
//     >
//       <div className="max-w-4xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl p-5 sm:p-7">
//         <LiveInterviewHeader
//           sessionId={sessionId}
//           joinStatus={join.status}
//           uiState={uiState}
//           onBack={handleBackToRoles}
//         />




//         {uiState === UI_STATES.LOADING && (
//           <LoadingView message="Connecting to your AI interview session..." />
//         )}

//         {uiState === UI_STATES.ERROR && (
//           <ErrorView
//             errorMessage={connectionError || join.error || end.error}
//             onStartNew={handleBackToRoles}
//           />
//         )}

//         {uiState === UI_STATES.LOBBY && sessionInfo && (
//           <LobbyView sessionInfo={sessionInfo} onJoin={handleJoinInterview} />
//         )}

//         {uiState === UI_STATES.CONNECTING && sessionInfo && (
//           <ConnectingView sessionInfo={sessionInfo} />
//         )}

//         {(uiState === UI_STATES.LIVE || uiState === UI_STATES.CONNECTING) &&
//           sessionInfo &&
//           join.data && (
//             <LiveInterviewView
//               sessionInfo={sessionInfo}
//               formattedTimeLeft={formattedTimeLeft}
//               onEnd={handleEndInterview}
//               isConnected={isConnected}
//               livekitServerUrl={join.data.livekit_server_url}
//               livekitToken={join.data.livekit_token}
//               uiState={uiState}
//               onRoomConnected={handleRoomConnected}
//               onRoomDisconnected={handleRoomDisconnected}
//               isEnding={end.status === "ending"}
//             />
//           )}

//         {uiState === UI_STATES.COMPLETED && sessionInfo && (
//           <CompletedView
//             sessionInfo={sessionInfo}
//             onBackToRoles={handleBackToRoles}
//           />
//         )}
//       </div>
//     </div>
//   );
// }






















// src/features/aiInterview/pages/LiveInterviewPage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAiInterviewAvatarSession,
  stopAiInterviewAvatarSession,
} from "../api/aiInterviewSessionApi";

import {
  joinAiInterviewSessionThunk,
  endAiInterviewSessionThunk,
} from "../slice/aiInterviewSessionSlice";

import { useInterviewTimer } from "../hooks/useInterviewTimer";

import { LiveInterviewHeader } from "../components/LiveInterviewHeader";
import {
  LoadingView,
  ErrorView,
  LobbyView,
  ConnectingView,
  LiveInterviewView,
  CompletedView,
} from "../components/LiveInterviewViews";

const UI_STATES = {
  LOADING: "LOADING",
  ERROR: "ERROR",
  LOBBY: "LOBBY",
  CONNECTING: "CONNECTING",
  LIVE: "LIVE",
  COMPLETED: "COMPLETED",
};

export default function LiveInterviewPage() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { join, end } = useSelector((state) => state.aiInterviewSession);

  const [uiState, setUiState] = useState(UI_STATES.LOADING);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [avatarSession, setAvatarSession] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const avatarStopRequestedRef = useRef(false);

  // Prevent duplicate auto-end calls from timer
  const hasAutoEndedRef = useRef(false);

  // ── Initial seconds derived from backend join data ──────────────────────
  const initialSeconds = useMemo(() => {
    if (!join.data) return null;
    if (typeof join.data.remaining_seconds === "number") {
      return join.data.remaining_seconds;
    }
    if (join.data.duration_minutes) {
      return join.data.duration_minutes * 60;
    }
    return null;
  }, [join.data]);

  // ── Timer hook — replaces manual setInterval logic ──────────────────────
  const { formattedTimeLeft } = useInterviewTimer({
    uiState,
    initialSeconds,
    onExpire: async () => {
      if (!hasAutoEndedRef.current && join.data?.session_id) {
        hasAutoEndedRef.current = true;
        try {
          await dispatch(
            endAiInterviewSessionThunk({
              sessionId: join.data.session_id,
              reason: "COMPLETED",
            })
          ).unwrap();
          // Navigation handled by end.status effect
        } catch {
          // Backend failed but timer is zero — still move to completed UI
          setIsConnected(false);
          setUiState(UI_STATES.COMPLETED);
        }
      }
    },
  });

  // ── Kick off join on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    dispatch(joinAiInterviewSessionThunk(sessionId));
  }, [sessionId, dispatch]);

  // ── React to join status from Redux + backend session status ────────────
  useEffect(() => {
    if (join.status === "joining") {
      setUiState(UI_STATES.LOADING);
      return;
    }

    if (join.status === "error") {
      setUiState(UI_STATES.ERROR);
      return;
    }

    if (join.status === "ready") {
      const backendStatus = join.data?.status;
      hasAutoEndedRef.current = false;

      if (backendStatus === "COMPLETED") {
        setUiState(UI_STATES.COMPLETED);
        return;
      }

      if (backendStatus === "CANCELLED" || backendStatus === "FAILED") {
        setConnectionError(
          `This interview session is ${backendStatus.toLowerCase()}.`
        );
        setUiState(UI_STATES.ERROR);
        return;
      }

      // For READY or LIVE — go to lobby.
      // LIVE sessions use remaining_seconds so a rejoin continues where it left off.
      setAvatarSession(join.data?.avatar_session ?? null);
      setAvatarError(null);
      avatarStopRequestedRef.current = false;
      setUiState(UI_STATES.LOBBY);
    }
  }, [join.status, join.data]);

  // ── React to end status ──────────────────────────────────────────────────
  useEffect(() => {
    if (end.status === "success") {
      setIsConnected(false);
      setUiState(UI_STATES.COMPLETED);
    } else if (end.status === "error") {
      setConnectionError(end.error || "Failed to end interview.");
      // Keep user in LIVE if end fails — do not silently complete
    }
  }, [end.status, end.error]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBackToRoles = () => {
    navigate("/ai-interview/roles");
  };

  const handleJoinInterview = () => {
    if (!join.data) return;

    const backendStatus = join.data.status;

    // Block entry if backend says the session is in a final state
    if (
      backendStatus === "COMPLETED" ||
      backendStatus === "CANCELLED" ||
      backendStatus === "FAILED"
    ) {
      setConnectionError("This interview can no longer be started.");
      setUiState(UI_STATES.ERROR);
      return;
    }

    setConnectionError(null);
    setIsConnected(false);
    setAvatarError(null);
    setUiState(UI_STATES.CONNECTING);

    if (join.data?.session_id) {
      void createAiInterviewAvatarSession(join.data.session_id)
        .then((response) => {
          setAvatarSession(response.data);
        })
        .catch((error) => {
          setAvatarError(
            error?.response?.data?.detail ||
              "Tavus avatar could not be started. Continuing with voice only."
          );
        });
    }
  };

  const handleRoomConnected = () => {
    setIsConnected(true);
    setUiState(UI_STATES.LIVE);
  };

  const handleRoomDisconnected = () => {
    setIsConnected(false);

    // If interview is already completed, do nothing
    if (uiState === UI_STATES.COMPLETED) return;

    // Any disconnect while live/connecting → show error
    setConnectionError(
      "Connection to the interview room was lost. Please refresh only if the backend still allows resuming this session."
    );
    setUiState(UI_STATES.ERROR);
  };

  const handleEndInterview = async () => {
    const confirmEnd = window.confirm(
      "End this interview and leave the room?"
    );
    if (!confirmEnd) return;
    if (!join.data?.session_id) return;

    try {
      if (!avatarStopRequestedRef.current) {
        avatarStopRequestedRef.current = true;
        await stopAiInterviewAvatarSession(join.data.session_id).catch(() => {});
      }
      await dispatch(
        endAiInterviewSessionThunk({
          sessionId: join.data.session_id,
          reason: "COMPLETED",
        })
      ).unwrap();
    } catch (error) {
      setConnectionError(
        error?.detail || "Failed to end interview. Please try again."
      );
    }
  };

  useEffect(() => {
    if (uiState !== UI_STATES.COMPLETED || !join.data?.session_id) return;
    if (avatarStopRequestedRef.current) return;

    avatarStopRequestedRef.current = true;
    void stopAiInterviewAvatarSession(join.data.session_id).catch(() => {});
  }, [uiState, join.data]);

  useEffect(() => {
    return () => {
      if (!join.data?.session_id || avatarStopRequestedRef.current) return;
      avatarStopRequestedRef.current = true;
      void stopAiInterviewAvatarSession(join.data.session_id).catch(() => {});
    };
  }, [join.data]);

  // ── Derived session info for child views ─────────────────────────────────

  const sessionInfo = useMemo(() => {
    const data = join.data;
    if (!data) return null;

    return {
      roleName: data.role?.name || "N/A",
      roleCategory: data.role?.category || null,
      roundType: data.round_type || "N/A",
      difficulty: data.difficulty || "N/A",
      durationMinutes: data.duration_minutes || null,
      status: data.status || "N/A",
      roomName: data.livekit_room_name || "Not generated",
    };
  }, [join.data]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <div className="max-w-4xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl p-5 sm:p-7">

        <LiveInterviewHeader
          sessionId={sessionId}
          joinStatus={join.status}
          uiState={uiState}
          onBack={handleBackToRoles}
        />

        {uiState === UI_STATES.LOADING && (
          <LoadingView message="Connecting to your AI interview session..." />
        )}

        {uiState === UI_STATES.ERROR && (
          <ErrorView
            errorMessage={connectionError || join.error || end.error}
            onStartNew={handleBackToRoles}
          />
        )}

        {uiState === UI_STATES.LOBBY && sessionInfo && (
          <LobbyView
            sessionInfo={sessionInfo}
            onJoin={handleJoinInterview}
          />
        )}

        {uiState === UI_STATES.CONNECTING && sessionInfo && (
          <ConnectingView sessionInfo={sessionInfo} />
        )}

        {(uiState === UI_STATES.LIVE || uiState === UI_STATES.CONNECTING) &&
          sessionInfo &&
          join.data && (
            <LiveInterviewView
              sessionInfo={sessionInfo}
              formattedTimeLeft={formattedTimeLeft}
              onEnd={handleEndInterview}
              isConnected={isConnected}
              livekitServerUrl={join.data.livekit_server_url}
              livekitToken={join.data.livekit_token}
              uiState={uiState}
              onRoomConnected={handleRoomConnected}
              onRoomDisconnected={handleRoomDisconnected}
              isEnding={end.status === "ending"}
              avatarSession={avatarSession}
              avatarError={avatarError}
            />
          )}

        {uiState === UI_STATES.COMPLETED && sessionInfo && (
          <CompletedView
            sessionInfo={sessionInfo}
            onBackToRoles={handleBackToRoles}
            sessionId={sessionId}
          />
        )}

      </div>
    </div>
  );
}
