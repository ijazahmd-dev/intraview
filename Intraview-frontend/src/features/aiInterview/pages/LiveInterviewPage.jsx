
// // src/features/aiInterview/pages/LiveInterviewPage.jsx

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   createAiInterviewAvatarSession,
//   stopAiInterviewAvatarSession,
// } from "../api/aiInterviewSessionApi";

// import {
//   joinAiInterviewSessionThunk,
//   endAiInterviewSessionThunk,
// } from "../slice/aiInterviewSessionSlice";

// import { useInterviewTimer } from "../hooks/useInterviewTimer";

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
//   const [connectionError, setConnectionError] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [avatarSession, setAvatarSession] = useState(null);
//   const [avatarError, setAvatarError] = useState(null);
//   const avatarStopRequestedRef = useRef(false);

//   // Prevent duplicate auto-end calls from timer
//   const hasAutoEndedRef = useRef(false);

//   // ── Initial seconds derived from backend join data ──────────────────────
//   const initialSeconds = useMemo(() => {
//     if (!join.data) return null;
//     if (typeof join.data.remaining_seconds === "number") {
//       return join.data.remaining_seconds;
//     }
//     if (join.data.duration_minutes) {
//       return join.data.duration_minutes * 60;
//     }
//     return null;
//   }, [join.data]);

//   // ── Timer hook — replaces manual setInterval logic ──────────────────────
//   const { formattedTimeLeft } = useInterviewTimer({
//     uiState,
//     initialSeconds,
//     onExpire: async () => {
//       if (!hasAutoEndedRef.current && join.data?.session_id) {
//         hasAutoEndedRef.current = true;
//         try {
//           await dispatch(
//             endAiInterviewSessionThunk({
//               sessionId: join.data.session_id,
//               reason: "COMPLETED",
//             })
//           ).unwrap();
//           // Navigation handled by end.status effect
//         } catch {
//           // Backend failed but timer is zero — still move to completed UI
//           setIsConnected(false);
//           setUiState(UI_STATES.COMPLETED);
//         }
//       }
//     },
//   });

//   // ── Kick off join on mount ───────────────────────────────────────────────
//   useEffect(() => {
//     if (!sessionId) return;
//     dispatch(joinAiInterviewSessionThunk(sessionId));
//   }, [sessionId, dispatch]);

//   // ── React to join status from Redux + backend session status ────────────
//   useEffect(() => {
//     if (join.status === "joining") {
//       setUiState(UI_STATES.LOADING);
//       return;
//     }

//     if (join.status === "error") {
//       setUiState(UI_STATES.ERROR);
//       return;
//     }

//     if (join.status === "ready") {
//       const backendStatus = join.data?.status;
//       hasAutoEndedRef.current = false;

//       if (backendStatus === "COMPLETED") {
//         setUiState(UI_STATES.COMPLETED);
//         return;
//       }

//       if (backendStatus === "CANCELLED" || backendStatus === "FAILED") {
//         setConnectionError(
//           `This interview session is ${backendStatus.toLowerCase()}.`
//         );
//         setUiState(UI_STATES.ERROR);
//         return;
//       }

//       // For READY or LIVE — go to lobby.
//       // LIVE sessions use remaining_seconds so a rejoin continues where it left off.
//       setAvatarSession(join.data?.avatar_session ?? null);
//       setAvatarError(null);
//       avatarStopRequestedRef.current = false;
//       setUiState(UI_STATES.LOBBY);
//     }
//   }, [join.status, join.data]);

//   // ── React to end status ──────────────────────────────────────────────────
//   useEffect(() => {
//     if (end.status === "success") {
//       setIsConnected(false);
//       setUiState(UI_STATES.COMPLETED);
//     } else if (end.status === "error") {
//       setConnectionError(end.error || "Failed to end interview.");
//       // Keep user in LIVE if end fails — do not silently complete
//     }
//   }, [end.status, end.error]);

//   // ── Handlers ─────────────────────────────────────────────────────────────

//   const handleBackToRoles = () => {
//     navigate("/ai-interview/roles");
//   };

//   const handleJoinInterview = () => {
//     if (!join.data) return;

//     const backendStatus = join.data.status;

//     // Block entry if backend says the session is in a final state
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
//     setAvatarError(null);
//     setUiState(UI_STATES.CONNECTING);

//     if (join.data?.session_id) {
//       void createAiInterviewAvatarSession(join.data.session_id)
//         .then((response) => {
//           setAvatarSession(response.data);
//         })
//         .catch((error) => {
//           setAvatarError(
//             error?.response?.data?.detail ||
//             "Tavus avatar could not be started. Continuing with voice only."
//           );
//         });
//     }
//   };

//   const handleRoomConnected = () => {
//     setIsConnected(true);
//     setUiState(UI_STATES.LIVE);
//   };

//   const handleRoomDisconnected = () => {
//     setIsConnected(false);

//     // If interview is already completed, do nothing
//     if (uiState === UI_STATES.COMPLETED) return;

//     // Any disconnect while live/connecting → show error
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
//       if (!avatarStopRequestedRef.current) {
//         avatarStopRequestedRef.current = true;
//         await stopAiInterviewAvatarSession(join.data.session_id).catch(() => { });
//       }
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

//   useEffect(() => {
//     if (uiState !== UI_STATES.COMPLETED || !join.data?.session_id) return;
//     if (avatarStopRequestedRef.current) return;

//     avatarStopRequestedRef.current = true;
//     void stopAiInterviewAvatarSession(join.data.session_id).catch(() => { });
//   }, [uiState, join.data]);

//   useEffect(() => {
//     return () => {
//       if (!join.data?.session_id || avatarStopRequestedRef.current) return;
//       avatarStopRequestedRef.current = true;
//       void stopAiInterviewAvatarSession(join.data.session_id).catch(() => { });
//     };
//   }, [join.data]);

//   // ── Derived session info for child views ─────────────────────────────────

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

//   // ── Render ────────────────────────────────────────────────────────────────

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
//           <LobbyView
//             sessionInfo={sessionInfo}
//             onJoin={handleJoinInterview}
//           />
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
//               avatarSession={avatarSession}
//               avatarError={avatarError}
//             />
//           )}

//         {uiState === UI_STATES.COMPLETED && sessionInfo && (
//           <CompletedView
//             sessionInfo={sessionInfo}
//             onBackToRoles={handleBackToRoles}
//             sessionId={sessionId}
//           />
//         )}

//       </div>
//     </div>
//   );
// }


























// src/features/aiInterview/pages/LiveInterviewPage.jsx
// All logic preserved exactly. Only the outer container and layout structure are redesigned.

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
  LoadingView, ErrorView, LobbyView,
  ConnectingView, LiveInterviewView, CompletedView,
} from "../components/LiveInterviewViews";
import { AI_INTERVIEW_STYLES } from "../components/shared-styles";

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

  const { join, end } = useSelector((s) => s.aiInterviewSession);

  // ── All original state ────────────────────────────────────────────────────
  const [uiState, setUiState] = useState(UI_STATES.LOADING);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [avatarSession, setAvatarSession] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const avatarStopRequestedRef = useRef(false);
  const hasAutoEndedRef = useRef(false);

  // ── Initial seconds ───────────────────────────────────────────────────────
  const initialSeconds = useMemo(() => {
    if (!join.data) return null;
    if (typeof join.data.remaining_seconds === "number") return join.data.remaining_seconds;
    if (join.data.duration_minutes) return join.data.duration_minutes * 60;
    return null;
  }, [join.data]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const { formattedTimeLeft } = useInterviewTimer({
    uiState,
    initialSeconds,
    onExpire: async () => {
      if (!hasAutoEndedRef.current && join.data?.session_id) {
        hasAutoEndedRef.current = true;
        try {
          await dispatch(endAiInterviewSessionThunk({ sessionId: join.data.session_id, reason: "COMPLETED" })).unwrap();
        } catch {
          setIsConnected(false);
          setUiState(UI_STATES.COMPLETED);
        }
      }
    },
  });

  // ── Effects (all original logic) ──────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    dispatch(joinAiInterviewSessionThunk(sessionId));
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (join.status === "joining") { setUiState(UI_STATES.LOADING); return; }
    if (join.status === "error") { setUiState(UI_STATES.ERROR); return; }
    if (join.status === "ready") {
      const bs = join.data?.status;
      hasAutoEndedRef.current = false;
      if (bs === "COMPLETED") { setUiState(UI_STATES.COMPLETED); return; }
      if (bs === "CANCELLED" || bs === "FAILED") {
        setConnectionError(`This interview session is ${bs.toLowerCase()}.`);
        setUiState(UI_STATES.ERROR); return;
      }
      setAvatarSession(join.data?.avatar_session ?? null);
      setAvatarError(null);
      avatarStopRequestedRef.current = false;
      setUiState(UI_STATES.LOBBY);
    }
  }, [join.status, join.data]);

  useEffect(() => {
    if (end.status === "success") { setIsConnected(false); setUiState(UI_STATES.COMPLETED); }
    else if (end.status === "error") { setConnectionError(end.error || "Failed to end interview."); }
  }, [end.status, end.error]);

  useEffect(() => {
    if (uiState !== UI_STATES.COMPLETED || !join.data?.session_id) return;
    if (avatarStopRequestedRef.current) return;
    avatarStopRequestedRef.current = true;
    void stopAiInterviewAvatarSession(join.data.session_id).catch(() => { });
  }, [uiState, join.data]);

  useEffect(() => {
    return () => {
      if (!join.data?.session_id || avatarStopRequestedRef.current) return;
      avatarStopRequestedRef.current = true;
      void stopAiInterviewAvatarSession(join.data.session_id).catch(() => { });
    };
  }, [join.data]);

  // ── Handlers (all original) ───────────────────────────────────────────────
  const handleBackToRoles = () => navigate("/ai-interview/roles");

  const handleJoinInterview = () => {
    if (!join.data) return;
    const bs = join.data.status;
    if (bs === "COMPLETED" || bs === "CANCELLED" || bs === "FAILED") {
      setConnectionError("This interview can no longer be started.");
      setUiState(UI_STATES.ERROR); return;
    }
    setConnectionError(null); setIsConnected(false); setAvatarError(null);
    setUiState(UI_STATES.CONNECTING);
    if (join.data?.session_id) {
      void createAiInterviewAvatarSession(join.data.session_id)
        .then((r) => setAvatarSession(r.data))
        .catch((e) => setAvatarError(e?.response?.data?.detail || "Tavus avatar could not be started. Continuing with voice only."));
    }
  };

  const handleRoomConnected = () => { setIsConnected(true); setUiState(UI_STATES.LIVE); };
  const handleRoomDisconnected = () => {
    setIsConnected(false);
    if (uiState === UI_STATES.COMPLETED) return;
    setConnectionError("Connection to the interview room was lost. Please refresh only if the backend still allows resuming this session.");
    setUiState(UI_STATES.ERROR);
  };

  const handleEndInterview = async () => {
    if (!window.confirm("End this interview and leave the room?")) return;
    if (!join.data?.session_id) return;
    try {
      if (!avatarStopRequestedRef.current) {
        avatarStopRequestedRef.current = true;
        await stopAiInterviewAvatarSession(join.data.session_id).catch(() => { });
      }
      await dispatch(endAiInterviewSessionThunk({ sessionId: join.data.session_id, reason: "COMPLETED" })).unwrap();
    } catch (err) {
      setConnectionError(err?.detail || "Failed to end interview. Please try again.");
    }
  };

  // ── Derived session info ──────────────────────────────────────────────────
  const sessionInfo = useMemo(() => {
    const d = join.data;
    if (!d) return null;
    return {
      roleName: d.role?.name || "N/A",
      roleCategory: d.role?.category || null,
      roundType: d.round_type || "N/A",
      difficulty: d.difficulty || "N/A",
      durationMinutes: d.duration_minutes || null,
      status: d.status || "N/A",
      roomName: d.livekit_room_name || "Not generated",
    };
  }, [join.data]);

  // ── Layout helpers ────────────────────────────────────────────────────────
  const isFullScreen = uiState === UI_STATES.LIVE || uiState === UI_STATES.CONNECTING;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="iv-root iv-dot-grid"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Font + animation injection */}
      <style>{AI_INTERVIEW_STYLES}</style>
      <style>{`
        /* Ambient top-center glow — always present */
        .iv-root::after {
          content: '';
          position: fixed;
          top: -120px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse at 50% 30%, rgba(20,184,166,0.07) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .iv-page-main { position: relative; z-index: 1; }

        /* Non-live center card */
        .iv-center-card {
          background: rgba(12,20,36,0.92);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 100%;
          max-width: 720px;
        }

        /* Live full-screen content area */
        .iv-live-area {
          flex: 1;
          padding: 12px 16px 16px;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .iv-live-area > * { flex: 1; min-height: 0; }

        /* CONNECTING overlay pattern — both views stacked */
        .iv-connecting-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }
      `}</style>

      {/* ── Sticky header ──────────────────────────────── */}
      <LiveInterviewHeader
        sessionId={sessionId}
        joinStatus={join.status}
        uiState={uiState}
        onBack={handleBackToRoles}
      />

      {/* ── Content ──────────────────────────────────────── */}
      <main
        className="iv-page-main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ...(isFullScreen
            ? {}
            : { alignItems: "center", justifyContent: "center", padding: "24px 16px" }),
        }}
      >
        {/* ── NON-LIVE STATES — centered card ─────────── */}
        {!isFullScreen && (
          <div className="iv-center-card iv-fade-up" style={{ padding: "28px 28px" }}>
            {uiState === UI_STATES.LOADING && (
              <LoadingView message="Connecting to your AI interview session…" />
            )}

            {uiState === UI_STATES.ERROR && (
              <ErrorView
                errorMessage={connectionError || join.error || end.error}
                onStartNew={handleBackToRoles}
              />
            )}

            {uiState === UI_STATES.LOBBY && sessionInfo && (
              <LobbyView sessionInfo={sessionInfo} onJoin={handleJoinInterview} />
            )}

            {uiState === UI_STATES.COMPLETED && sessionInfo && (
              <CompletedView
                sessionInfo={sessionInfo}
                onBackToRoles={handleBackToRoles}
                sessionId={sessionId}
              />
            )}
          </div>
        )}

        {/* ── LIVE / CONNECTING STATES — full screen ─── */}
        {isFullScreen && (
          <div className="iv-live-area iv-fade-in">
            {/* ConnectingView sits above LiveInterviewView while room is connecting */}
            {uiState === UI_STATES.CONNECTING && sessionInfo && (
              <div style={{
                background: "rgba(12,20,36,0.92)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18, marginBottom: 12,
                backdropFilter: "blur(16px)",
                flexShrink: 0,
              }}>
                <ConnectingView sessionInfo={sessionInfo} />
              </div>
            )}

            {sessionInfo && join.data && (
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
          </div>
        )}
      </main>
    </div>
  );
}