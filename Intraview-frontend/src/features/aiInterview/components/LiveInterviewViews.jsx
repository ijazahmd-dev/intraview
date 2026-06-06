// src/features/aiInterview/components/LiveInterviewViews.jsx
// Headerless layout — everything lives inside the video/transcript panels.
// All non-live views (Lobby, Loading, Error, Completed) preserved.

import { LiveKitVideoPanel } from "./LiveKitVideoPanel";
import { useNavigate } from "react-router-dom";
import { useAgentTranscript } from "../hooks/useAgentTranscript";
import { AgentTranscriptPanel } from "./AgentTranscriptPanel";
import {
  AlertTriangle, CheckCircle2, ArrowRight,
  Clock, Layers, Zap, ChevronRight,
} from "lucide-react";

// ── Shared info row ──────────────────────────────────────────
function InfoRow({ label, value, mono, highlight }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "6px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 11.5, color: "var(--iv-text-3)", fontWeight: 400 }}>{label}</span>
      <span style={{
        fontSize: mono ? 11 : 12.5,
        fontFamily: mono ? "var(--ff-tech)" : "inherit",
        fontWeight: 600,
        color: highlight ? "var(--iv-teal)" : "var(--iv-text)",
        letterSpacing: mono ? "0.04em" : 0,
        textTransform: mono ? "uppercase" : "none",
      }}>
        {value}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LOADING VIEW
// ══════════════════════════════════════════════════════════════
export function LoadingView({ message }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "56px 24px", textAlign: "center",
      animation: "iv-fade-up 0.4s ease both",
    }}>
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 28 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid rgba(20,184,166,0.12)",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 8, height: 8, marginTop: -4, marginLeft: -4,
          borderRadius: "50%", background: "var(--iv-teal)",
          boxShadow: "0 0 10px var(--iv-teal)",
          transformOrigin: "calc(-28px) center",
          animation: "iv-orbit 2s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(20,184,166,0.10)",
            border: "1px solid rgba(20,184,166,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={14} color="var(--iv-teal)" strokeWidth={2} />
          </div>
        </div>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "rgba(20,184,166,0.06)",
        border: "1px solid rgba(20,184,166,0.15)",
        borderRadius: 99, padding: "5px 14px", marginBottom: 14,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--iv-teal)", animation: "iv-pulse-ring 1.8s ease-out infinite" }} />
        <span style={{ fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 700, color: "var(--iv-teal)", letterSpacing: "0.12em" }}>
          CONNECTING
        </span>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--iv-text-2)", margin: 0, maxWidth: 300 }}>{message}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ERROR VIEW
// ══════════════════════════════════════════════════════════════
export function ErrorView({ errorMessage, onStartNew }) {
  const msg = errorMessage || "This interview session is no longer valid. It may have expired or never existed.";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "56px 24px", textAlign: "center",
      animation: "iv-fade-up 0.4s ease both",
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
      }}>
        <AlertTriangle size={24} color="#ef4444" strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.14em", marginBottom: 10 }}>
        SESSION UNAVAILABLE
      </div>
      <p style={{ fontSize: 12.5, color: "var(--iv-text-2)", lineHeight: 1.65, maxWidth: 360, marginBottom: 24 }}>{msg}</p>
      <button
        onClick={onStartNew}
        style={{
          display: "flex", alignItems: "center", gap: 7, padding: "10px 20px",
          background: "var(--iv-teal)", color: "#fff", border: "none", borderRadius: 10,
          fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(20,184,166,0.30)", transition: "background 0.15s",
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "var(--iv-teal-dk)"}
        onMouseOut={(e) => e.currentTarget.style.background = "var(--iv-teal)"}
      >
        Start a new interview <ArrowRight size={14} />
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LOBBY VIEW
// ══════════════════════════════════════════════════════════════
const LOBBY_TIPS = [
  "Wait for the AI interviewer to introduce themselves and ask the first question.",
  "Speak your answers clearly. Every response is recorded and analyzed for feedback.",
  "Try to answer all questions to receive a complete analytics report at the end.",
  "Keep this tab open and avoid switching devices during the interview.",
];

export function LobbyView({ sessionInfo, onJoin }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, animation: "iv-fade-up 0.5s ease both" }} className="iv-lobby-grid">
      <div style={{ background: "var(--iv-bg-3)", border: "1px solid var(--iv-border)", borderRadius: 18, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(20,184,166,0.10)", border: "1px solid rgba(20,184,166,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers size={13} color="var(--iv-teal)" />
          </div>
          <span style={{ fontFamily: "var(--ff-tech)", fontSize: 10.5, fontWeight: 700, color: "var(--iv-text-2)", letterSpacing: "0.10em" }}>INTERVIEW BRIEFING</span>
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {LOBBY_TIPS.map((tip, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700, color: "var(--iv-teal)", flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
              <span style={{ fontSize: 12.5, color: "var(--iv-text-2)", lineHeight: 1.55 }}>{tip}</span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ background: "var(--iv-bg-3)", border: "1px solid var(--iv-border-teal)", borderRadius: 18, padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 0%, rgba(20,184,166,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(20,184,166,0.10)", border: "1px solid rgba(20,184,166,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={13} color="var(--iv-teal)" />
            </div>
            <span style={{ fontFamily: "var(--ff-tech)", fontSize: 10.5, fontWeight: 700, color: "var(--iv-text-2)", letterSpacing: "0.10em" }}>SESSION SUMMARY</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <InfoRow label="Role" value={sessionInfo.roleName} />
            <InfoRow label="Round" value={sessionInfo.roundType} mono />
            <InfoRow label="Difficulty" value={sessionInfo.difficulty} mono />
            <InfoRow label="Duration" value={sessionInfo.durationMinutes ? `${sessionInfo.durationMinutes} min` : "N/A"} />
            <InfoRow label="Status" value={sessionInfo.status} mono highlight />
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "relative" }}>
          <p style={{ fontSize: 11.5, color: "var(--iv-text-3)", lineHeight: 1.5, margin: 0, maxWidth: 200 }}>
            Clicking "Join" connects your microphone and starts the AI experience.
          </p>
          <button
            onClick={onJoin}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "11px 20px",
              background: "var(--iv-teal)", color: "#fff", border: "none", borderRadius: 11,
              fontFamily: "var(--ff-tech)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
              cursor: "pointer", boxShadow: "0 4px 18px rgba(20,184,166,0.35)", whiteSpace: "nowrap",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "var(--iv-teal-dk)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "var(--iv-teal)"; e.currentTarget.style.transform = "none"; }}
          >
            JOIN INTERVIEW <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <style>{`@media (max-width: 640px) { .iv-lobby-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONNECTING VIEW
// ══════════════════════════════════════════════════════════════
export function ConnectingView({ sessionInfo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", animation: "iv-fade-up 0.4s ease both" }}>
      <div style={{ position: "relative", width: 64, height: 64, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", inset: -(i * 10), borderRadius: "50%", border: `1px solid rgba(20,184,166,${0.35 - i * 0.1})`, animation: `iv-pulse-ring ${1.8 + i * 0.4}s ${i * 0.3}s ease-out infinite` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={20} color="var(--iv-teal)" />
        </div>
      </div>
      <div style={{ fontFamily: "var(--ff-tech)", fontSize: 11, fontWeight: 700, color: "var(--iv-teal)", letterSpacing: "0.14em", marginBottom: 8 }}>ESTABLISHING CONNECTION</div>
      <p style={{ fontSize: 13, color: "var(--iv-text-2)", margin: "0 0 6px", maxWidth: 320 }}>
        Preparing your <strong style={{ color: "var(--iv-text)" }}>{sessionInfo.roundType.toLowerCase()}</strong> interview for the <strong style={{ color: "var(--iv-text)" }}>{sessionInfo.roleName}</strong> role.
      </p>
      <p style={{ fontSize: 11.5, color: "var(--iv-text-3)", margin: 0 }}>Keep this tab open. This takes just a moment.</p>
      <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
        <span className="iv-typing-dot" /><span className="iv-typing-dot" /><span className="iv-typing-dot" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LIVE INTERVIEW INNER (right panel content only)
// ══════════════════════════════════════════════════════════════
function LiveInterviewInner({ sessionInfo }) {
  const { currentQuestion, agentTranscript } = useAgentTranscript();

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", gap: 10,
      overflow: "hidden", minHeight: 0,
    }}>
      {/* Role label at top of right panel */}
      <div style={{
        flexShrink: 0,
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border)",
        borderRadius: 12,
        padding: "10px 14px",
      }}>
        <p style={{
          fontFamily: "var(--ff-tech)", fontSize: 8.5, fontWeight: 700,
          color: "var(--iv-text-3)", letterSpacing: "0.12em", margin: "0 0 3px",
          textTransform: "uppercase",
        }}>
          {sessionInfo.roleCategory || "AI INTERVIEW"}
        </p>
        <p style={{
          fontSize: 13, fontWeight: 600, color: "var(--iv-text)",
          margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {sessionInfo.roleName}
          <span style={{ color: "var(--iv-text-3)", fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
            · {sessionInfo.roundType}
          </span>
        </p>
        <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--ff-tech)", fontSize: 8.5, fontWeight: 700,
            color: "var(--iv-text-3)", letterSpacing: "0.07em",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 5, padding: "2px 6px",
            textTransform: "uppercase",
          }}>
            {sessionInfo.difficulty}
          </span>
        </div>
      </div>

      {/* Transcript — fills remaining space */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <AgentTranscriptPanel
          currentQuestion={currentQuestion}
          agentTranscript={agentTranscript}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LIVE INTERVIEW VIEW (wrapper — passes extra props to panel)
// ══════════════════════════════════════════════════════════════
export function LiveInterviewView({
  sessionInfo,
  formattedTimeLeft,
  onEnd,
  isConnected,
  livekitServerUrl,
  livekitToken,
  uiState,
  onRoomConnected,
  onRoomDisconnected,
  isEnding = false,
  avatarSession,
  avatarError,
  sessionId,
}) {
  const shouldConnect = uiState === "CONNECTING" || uiState === "LIVE";

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <LiveKitVideoPanel
        serverUrl={livekitServerUrl}
        token={livekitToken}
        connect={shouldConnect}
        onConnected={onRoomConnected}
        onDisconnected={onRoomDisconnected}
        avatarSession={avatarSession}
        avatarError={avatarError}
        onEnd={onEnd}
        isEnding={isEnding}
        sessionId={sessionId}
        formattedTimeLeft={formattedTimeLeft}
      >
        <LiveInterviewInner sessionInfo={sessionInfo} />
      </LiveKitVideoPanel>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPLETED VIEW
// ══════════════════════════════════════════════════════════════
export function CompletedView({ sessionInfo, onBackToRoles, sessionId }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center", animation: "iv-fade-up 0.5s ease both" }}>
      <div style={{ position: "relative", width: 72, height: 72, marginBottom: 24 }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", inset: -(i * 8), borderRadius: "50%", border: `1px solid rgba(34,197,94,${0.15 / i})`, animation: `iv-ripple ${1.5 + i * 0.5}s ${i * 0.3}s ease-out infinite` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(34,197,94,0.10)", border: "1.5px solid rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 size={28} color="#22c55e" strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.16em", marginBottom: 10 }}>INTERVIEW COMPLETE</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--iv-text)", marginBottom: 8 }}>Great work!</p>
      <p style={{ fontSize: 13, color: "var(--iv-text-2)", lineHeight: 1.6, maxWidth: 360, marginBottom: 28 }}>
        Your mock interview for the{" "}
        <span style={{ color: "var(--iv-text)", fontWeight: 600 }}>{sessionInfo?.roleName}</span>{" "}
        role is complete. Your evaluation report is being generated.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        {sessionId && (
          <button
            onClick={() => navigate(`/ai-interview/results/${sessionId}`)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "var(--iv-teal)", color: "#fff", border: "none", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(20,184,166,0.30)", transition: "background 0.15s" }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--iv-teal-dk)"}
            onMouseOut={(e) => e.currentTarget.style.background = "var(--iv-teal)"}
          >
            View Results <ArrowRight size={13} />
          </button>
        )}
        <button
          onClick={onBackToRoles}
          style={{ padding: "10px 20px", background: "transparent", color: "var(--iv-text-2)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; e.currentTarget.style.color = "var(--iv-text)"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "var(--iv-text-2)"; }}
        >
          Back to roles
        </button>
      </div>
    </div>
  );
}