// src/features/aiInterview/pages/LiveInterviewPage.jsx
// Headerless full-screen interview page.
// height: 100vh, overflow: hidden — no page scrolling ever.

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import {
  LoadingView, ErrorView, LobbyView,
  ConnectingView, LiveInterviewView, CompletedView, CompletingView,
} from "../components/LiveInterviewViews";
import { AI_INTERVIEW_STYLES } from "../components/shared-styles";
import { ArrowLeft } from "lucide-react";

const UI_STATES = {
  LOADING: "LOADING",
  ERROR: "ERROR",
  LOBBY: "LOBBY",
  CONNECTING: "CONNECTING",
  LIVE: "LIVE",
  COMPLETING: "COMPLETING",  // post-closing, 3-second transition delay
  COMPLETED: "COMPLETED",
};

// Minimal back-button bar for non-live states (not a full header)
function BackBar({ onBack, uiState }) {
  const statusColor = {
    LOADING: "#7a9ab5",
    ERROR: "#ef4444",
    LOBBY: "#3b82f6",
    COMPLETING: "#f59e0b",
    COMPLETED: "#22c55e",
  }[uiState] || "#7a9ab5";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px",
      height: 48,
      background: "rgba(5,9,15,0.94)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      backdropFilter: "blur(16px)",
      flexShrink: 0,
    }}>
      {/* <button
        onClick={onBack}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "transparent",
          border: "none", color: "var(--iv-text-3)",
          cursor: "pointer", fontSize: 12,
          fontFamily: "var(--ff-body)", fontWeight: 500,
          padding: "4px 0",
          transition: "color 0.15s",
        }}
        onMouseOver={(e) => e.currentTarget.style.color = "var(--iv-text)"}
        onMouseOut={(e) => e.currentTarget.style.color = "var(--iv-text-3)"}
      >
        <ArrowLeft size={14} />
        Back to roles
      </button> */}

      {/* Branding */}
      {/* <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: "linear-gradient(135deg, #14b8a6, #0d9488)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--ff-tech)", fontSize: 9, fontWeight: 700, color: "#fff",
        }}>In</div>
        <span style={{ fontFamily: "var(--ff-tech)", fontSize: 12.5, fontWeight: 700, color: "var(--iv-text)" }}>
          IntraView
        </span>
      </div> */}

      {/* Status indicator */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: `${statusColor}10`,
        border: `1px solid ${statusColor}35`,
        borderRadius: 99, padding: "4px 11px",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: statusColor,
        }} />
        <span style={{ fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700, color: statusColor, letterSpacing: "0.10em" }}>
          {uiState}
        </span>
      </div>
    </div>
  );
}

export default function LiveInterviewPage() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { join, end } = useSelector((s) => s.aiInterviewSession);

  const [uiState, setUiState] = useState(UI_STATES.LOADING);
  const uiStateRef = useRef(UI_STATES.LOADING); // always current — safe to read in event callbacks
  const setUiStateSynced = (next) => {
    uiStateRef.current = next;
    setUiState(next);
  };
  const [connectionError, setConnectionError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [avatarSession, setAvatarSession] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const avatarStopRequestedRef = useRef(false);
  const hasAutoEndedRef = useRef(false);

  const initialSeconds = useMemo(() => {
    if (!join.data) return null;
    if (typeof join.data.remaining_seconds === "number") return join.data.remaining_seconds;
    if (join.data.duration_minutes) return join.data.duration_minutes * 60;
    return null;
  }, [join.data]);

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

  // ── Auto-end: fires after agent emits interview_complete event ──────────
  //
  // The agent emits this AFTER:
  //   1. Closing speech has fully played
  //   2. Backend has been marked COMPLETED
  //   3. Final report generation has been queued
  //
  // We wait 3 seconds so the candidate has a moment to absorb the
  // end of the interview before the room closes — feels professional.
  //
  const handleInterviewComplete = useCallback(async () => {
    if (hasAutoEndedRef.current) return;  // idempotency guard
    hasAutoEndedRef.current = true;

    // Show transition screen while we wait
    setUiStateSynced(UI_STATES.COMPLETING);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (!join.data?.session_id) {
      setIsConnected(false);
      setUiState(UI_STATES.COMPLETED);
      return;
    }

    try {
      // Stop avatar first so it doesn't keep talking
      if (!avatarStopRequestedRef.current) {
        avatarStopRequestedRef.current = true;
        await stopAiInterviewAvatarSession(join.data.session_id).catch(() => {});
      }
      await dispatch(endAiInterviewSessionThunk({ sessionId: join.data.session_id, reason: "COMPLETED" })).unwrap();
    } catch {
      // Graceful fallback — still show completed state
      setIsConnected(false);
      setUiState(UI_STATES.COMPLETED);
    }
  }, [join.data, dispatch]);


  useEffect(() => {
    if (!sessionId) return;
    dispatch(joinAiInterviewSessionThunk(sessionId));
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (join.status === "joining") { setUiStateSynced(UI_STATES.LOADING); return; }
    if (join.status === "error") { setUiStateSynced(UI_STATES.ERROR); return; }
    if (join.status === "ready") {
      const bs = join.data?.status;
      hasAutoEndedRef.current = false;
      if (bs === "COMPLETED") { setUiStateSynced(UI_STATES.COMPLETED); return; }
      if (bs === "CANCELLED" || bs === "FAILED") {
        setConnectionError(`This interview session is ${bs.toLowerCase()}.`);
        setUiStateSynced(UI_STATES.ERROR); return;
      }
      setAvatarSession(join.data?.avatar_session ?? null);
      setAvatarError(null);
      avatarStopRequestedRef.current = false;
      setUiStateSynced(UI_STATES.LOBBY);
    }
  }, [join.status, join.data]);

  useEffect(() => {
    if (end.status === "success") { setIsConnected(false); setUiStateSynced(UI_STATES.COMPLETED); }
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

  const handleRoomConnected = () => { setIsConnected(true); setUiStateSynced(UI_STATES.LIVE); };
  const handleRoomDisconnected = () => {
    setIsConnected(false);
    // Do not treat a disconnect as an error during the auto-end flow.
    // COMPLETING = 3-second transition delay before endSession API call.
    // COMPLETED  = session already ended normally.
    // Both cases disconnect the LiveKit room intentionally.
    const current = uiStateRef.current;
    if (current === UI_STATES.COMPLETED || current === UI_STATES.COMPLETING) return;
    setConnectionError("Connection to the interview room was lost. Please refresh only if the backend still allows resuming this session.");
    setUiStateSynced(UI_STATES.ERROR);
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

  const isLiveOrConnecting = (
    uiState === UI_STATES.LIVE ||
    uiState === UI_STATES.CONNECTING ||
    uiState === UI_STATES.COMPLETING  // keep room mounted during 3s transition
  );

  return (
    <div
      className="iv-root iv-dot-grid"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{AI_INTERVIEW_STYLES}</style>
      <style>{`
        .iv-root::after {
          content: '';
          position: fixed;
          top: -120px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse at 50% 30%, rgba(20,184,166,0.06) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        /* Non-live centered card */
        .iv-center-card {
          background: rgba(12,20,36,0.92);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 100%; max-width: 720px;
        }
        .iv-live-area {
          flex: 1; min-height: 0; overflow: hidden;
          padding: 10px 12px 12px;
          display: flex; flex-direction: column;
          position: relative; z-index: 1;
        }
        .iv-nonlive-area {
          flex: 1; min-height: 0; overflow-y: auto;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px; position: relative; z-index: 1;
        }
      `}</style>

      {/* Minimal back bar — only for non-live states */}
      {!isLiveOrConnecting && (
        <BackBar onBack={handleBackToRoles} uiState={uiState} />
      )}

      {/* NON-LIVE STATES */}
      {!isLiveOrConnecting && (
        <div className="iv-nonlive-area">
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
        </div>
      )}

      {/* LIVE / CONNECTING STATES — full screen, no header */}
      {isLiveOrConnecting && (
        <div className="iv-live-area iv-fade-in">
          {/* Connecting overlay (transparent, non-blocking) */}
          {uiState === UI_STATES.CONNECTING && sessionInfo && (
            <div style={{
              position: "absolute",
              top: 10, left: 12, right: 12,
              background: "rgba(12,20,36,0.96)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 18,
              backdropFilter: "blur(16px)",
              zIndex: 30,
              pointerEvents: "none",
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
              isEnding={end.status === "ending" || uiState === UI_STATES.COMPLETING}
              avatarSession={avatarSession}
              avatarError={avatarError}
              sessionId={sessionId}
              onInterviewComplete={handleInterviewComplete}
            />
          )}

          {/* COMPLETING overlay — shown over the live room during 3s delay */}
          {uiState === UI_STATES.COMPLETING && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(5,9,15,0.85)",
              backdropFilter: "blur(18px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 40,
              animation: "iv-fade-in 0.4s ease both",
            }}>
              <div className="iv-center-card" style={{ padding: "36px 28px", maxWidth: 400 }}>
                <CompletingView />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}