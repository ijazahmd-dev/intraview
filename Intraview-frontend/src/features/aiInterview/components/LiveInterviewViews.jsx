// // src/features/aiInterview/components/LiveInterviewViews.jsx

// import { LiveKitVideoPanel } from "./LiveKitVideoPanel";
// import { useNavigate } from "react-router-dom";
// import { useAgentTranscript } from "../hooks/useAgentTranscript";
// import { AgentTranscriptPanel } from "./AgentTranscriptPanel"; 

// export function LoadingView({ message }) {
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

// export function ErrorView({ errorMessage, onStartNew }) {
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

// export function LobbyView({ sessionInfo, onJoin }) {
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
//             When you click join, we'll connect your microphone and start the AI
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

// export function ConnectingView({ sessionInfo }) {
//   return (
//     <div className="py-10 flex flex-col items-center text-center">
//       <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/40 flex items-center justify-center mb-3">
//         <span className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
//       </div>
//       <h2 className="text-sm font-semibold text-gray-50 mb-1">
//         Connecting to AI interviewer…
//       </h2>
//       <p className="text-[11px] text-gray-400 max-w-sm mb-4">
//         We're preparing your {sessionInfo.roundType.toLowerCase()} interview
//         for the {sessionInfo.roleName} role.
//       </p>
//       <p className="text-[11px] text-gray-500">
//         This will take just a moment. Please keep this tab open.
//       </p>
//     </div>
//   );
// }











// function LiveInterviewInner({
//   sessionInfo,
//   formattedTimeLeft,
//   onEnd,
//   isEnding,
//   avatarSession,
//   avatarError,
// }) {
//   const { currentQuestion, transcript, questionHistory } = useAgentTranscript();

//   return (
//     <div className="flex h-full flex-col gap-4">
//       <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <p className="text-[11px] text-slate-400 uppercase tracking-[0.24em]">
//               Live AI Interview
//             </p>
//             <p className="mt-1 text-sm font-semibold text-slate-50">
//               {sessionInfo.roleName} · {sessionInfo.roundType}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             {formattedTimeLeft && (
//               <div className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-[11px] font-semibold text-teal-200">
//                 Time left: {formattedTimeLeft}
//               </div>
//             )}
//             <button
//               type="button"
//               onClick={onEnd}
//               disabled={isEnding}
//               className={`rounded-xl px-3 py-2 text-[11px] font-semibold text-white ${
//                 isEnding
//                   ? "cursor-not-allowed bg-red-400 opacity-70"
//                   : "bg-red-500/90 hover:bg-red-500"
//               }`}
//             >
//               {isEnding ? "Ending..." : "End Interview"}
//             </button>
//           </div>
//         </div>
//         <div className="mt-4 grid gap-3 sm:grid-cols-2">
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
//             <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
//               Interviewer Mode
//             </p>
//             <p className="mt-2 text-sm text-slate-100">
//               {avatarSession?.enabled
//                 ? "Tavus avatar connected through LiveKit."
//                 : "Voice-only fallback is active."}
//             </p>
//             {avatarError ? (
//               <p className="mt-2 text-xs leading-relaxed text-amber-300">
//                 {avatarError}
//               </p>
//             ) : (
//               <p className="mt-2 text-xs leading-relaxed text-slate-400">
//                 Your existing Gemini, Deepgram, and Cartesia interview flow remains unchanged.
//               </p>
//             )}
//           </div>
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
//             <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
//               Session Status
//             </p>
//             <p className="mt-2 text-sm text-slate-100">
//               {sessionInfo.difficulty} · {sessionInfo.status}
//             </p>
//             <p className="mt-2 text-xs leading-relaxed text-slate-400">
//               Candidate audio and transcript capture continue on the same LiveKit room.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="min-h-0 flex-1">
//         <AgentTranscriptPanel
//           currentQuestion={currentQuestion}
//           transcript={transcript}
//           questionHistory={questionHistory}
//         />
//       </div>
//     </div>
//   );
// }











// export function LiveInterviewView({
//   sessionInfo,
//   formattedTimeLeft,
//   onEnd,
//   isConnected,
//   livekitServerUrl,
//   livekitToken,
//   uiState,
//   onRoomConnected,
//   onRoomDisconnected,
//   isEnding = false,
//   avatarSession,
//   avatarError,
// }) {
//   const shouldConnect = uiState === "CONNECTING" || uiState === "LIVE";

//   return (
//     <div className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
//       <LiveKitVideoPanel
//         serverUrl={livekitServerUrl}
//         token={livekitToken}
//         connect={shouldConnect}
//         onConnected={onRoomConnected}
//         onDisconnected={onRoomDisconnected}
//         avatarSession={avatarSession}
//         avatarError={avatarError}
//       >
//         <LiveInterviewInner
//           sessionInfo={sessionInfo}
//           formattedTimeLeft={formattedTimeLeft}
//           onEnd={onEnd}
//           isEnding={isEnding}
//           avatarSession={avatarSession}
//           avatarError={avatarError}
//         />
//       </LiveKitVideoPanel>
//     </div>
//   );
// }

// export function CompletedView({ sessionInfo, onBackToRoles, sessionId }) {
//   const navigate = useNavigate();

//   return (
//     <div className="py-10 flex flex-col items-center text-center">
//       <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mb-3">
//         <svg
//           className="w-5 h-5 text-emerald-400"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//         >
//           <path d="M20 6 9 17l-5-5" />
//         </svg>
//       </div>
//       <h2 className="text-sm font-semibold text-gray-50 mb-1">
//         Interview completed
//       </h2>
//       <p className="text-11px text-gray-400 max-w-sm mb-6">
//         Your mock interview for the{" "}
//         <span className="text-gray-200 font-medium">
//           {sessionInfo?.roleName}
//         </span>{" "}
//         role is finished. Your evaluation report is being generated.
//       </p>

//       <div className="flex items-center gap-3">
//         {sessionId && (
//           <button
//             type="button"
//             onClick={() =>
//               navigate(`/ai-interview/results/${sessionId}`)
//             }
//             className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white transition-colors"
//           >
//             View Results
//           </button>
//         )}
//         <button
//           type="button"
//           onClick={onBackToRoles}
//           className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 text-xs font-semibold text-gray-300 transition-colors"
//         >
//           Back to roles
//         </button>
//       </div>
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



























// src/features/aiInterview/components/LiveInterviewViews.jsx
// All component signatures, props, and logic identical to original.
// Only the visual presentation is redesigned.

import { LiveKitVideoPanel } from "./LiveKitVideoPanel";
import { useNavigate } from "react-router-dom";
import { useAgentTranscript } from "../hooks/useAgentTranscript";
import { AgentTranscriptPanel } from "./AgentTranscriptPanel";
import {
  AlertTriangle, CheckCircle2, ArrowRight,
  Clock, Layers, Zap, RefreshCw, ChevronRight,
} from "lucide-react";

// ── Shared info row ──────────────────────────────────────────
function InfoRow({ label, value, mono, highlight }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "7px 0",
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
      {/* Orbital loader */}
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 28 }}>
        {/* Outer ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid rgba(20,184,166,0.12)",
        }} />
        {/* Spinning dot */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 8, height: 8,
          marginTop: -4, marginLeft: -4,
          borderRadius: "50%",
          background: "var(--iv-teal)",
          boxShadow: "0 0 10px var(--iv-teal)",
          transformOrigin: "calc(-28px) center",
          animation: "iv-orbit 2s linear infinite",
        }} />
        {/* Center icon */}
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
        borderRadius: 99, padding: "5px 14px",
        marginBottom: 14,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--iv-teal)",
          animation: "iv-pulse-ring 1.8s ease-out infinite",
        }} />
        <span style={{
          fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 700,
          color: "var(--iv-teal)", letterSpacing: "0.12em",
        }}>
          CONNECTING
        </span>
      </div>

      <p style={{ fontSize: 13.5, color: "var(--iv-text-2)", margin: 0, maxWidth: 300 }}>
        {message}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ERROR VIEW
// ══════════════════════════════════════════════════════════════
export function ErrorView({ errorMessage, onStartNew }) {
  const msg = errorMessage ||
    "This interview session is no longer valid. It may have expired or never existed.";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "56px 24px", textAlign: "center",
      animation: "iv-fade-up 0.4s ease both",
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <AlertTriangle size={24} color="#ef4444" strokeWidth={1.8} />
      </div>

      <div style={{
        fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 700,
        color: "#ef4444", letterSpacing: "0.14em",
        marginBottom: 10,
      }}>
        SESSION UNAVAILABLE
      </div>

      <p style={{
        fontSize: 12.5, color: "var(--iv-text-2)",
        lineHeight: 1.65, maxWidth: 360, marginBottom: 24,
      }}>
        {msg}
      </p>

      <button
        onClick={onStartNew}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "10px 20px",
          background: "var(--iv-teal)", color: "#fff",
          border: "none", borderRadius: 10,
          fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(20,184,166,0.30)",
          transition: "background 0.15s",
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
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      animation: "iv-fade-up 0.5s ease both",
    }}
      className="iv-lobby-grid"
    >
      {/* Left: Briefing */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border)",
        borderRadius: 18, padding: "20px 22px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(20,184,166,0.10)",
            border: "1px solid rgba(20,184,166,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Layers size={13} color="var(--iv-teal)" />
          </div>
          <span style={{
            fontFamily: "var(--ff-tech)", fontSize: 10.5, fontWeight: 700,
            color: "var(--iv-text-2)", letterSpacing: "0.10em",
          }}>
            INTERVIEW BRIEFING
          </span>
        </div>

        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {LOBBY_TIPS.map((tip, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{
                fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700,
                color: "var(--iv-teal)", flexShrink: 0, marginTop: 2,
              }}>
                0{i + 1}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--iv-text-2)", lineHeight: 1.55 }}>
                {tip}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Right: Session summary + CTA */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border-teal)",
        borderRadius: 18, padding: "20px 22px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background accent */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 80% 0%, rgba(20,184,166,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(20,184,166,0.10)",
              border: "1px solid rgba(20,184,166,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Clock size={13} color="var(--iv-teal)" />
            </div>
            <span style={{
              fontFamily: "var(--ff-tech)", fontSize: 10.5, fontWeight: 700,
              color: "var(--iv-text-2)", letterSpacing: "0.10em",
            }}>
              SESSION SUMMARY
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <InfoRow label="Role" value={sessionInfo.roleName} />
            <InfoRow label="Round" value={sessionInfo.roundType} mono />
            <InfoRow label="Difficulty" value={sessionInfo.difficulty} mono />
            <InfoRow
              label="Duration"
              value={sessionInfo.durationMinutes ? `${sessionInfo.durationMinutes} min` : "N/A"}
            />
            <InfoRow label="Status" value={sessionInfo.status} mono highlight />
          </div>
        </div>

        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          position: "relative",
        }}>
          <p style={{ fontSize: 11.5, color: "var(--iv-text-3)", lineHeight: 1.5, margin: 0, maxWidth: 200 }}>
            Clicking "Join" connects your microphone and starts the AI experience.
          </p>
          <button
            onClick={onJoin}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 20px",
              background: "var(--iv-teal)", color: "#fff",
              border: "none", borderRadius: 11,
              fontFamily: "var(--ff-tech)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.06em", cursor: "pointer",
              boxShadow: "0 4px 18px rgba(20,184,166,0.35)",
              whiteSpace: "nowrap",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "var(--iv-teal-dk)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "var(--iv-teal)"; e.currentTarget.style.transform = "none"; }}
          >
            JOIN INTERVIEW
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .iv-lobby-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONNECTING VIEW
// ══════════════════════════════════════════════════════════════
export function ConnectingView({ sessionInfo }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", textAlign: "center",
      animation: "iv-fade-up 0.4s ease both",
    }}>
      {/* Pulsing ring */}
      <div style={{ position: "relative", width: 64, height: 64, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute", inset: -(i * 10),
              borderRadius: "50%",
              border: `1px solid rgba(20,184,166,${0.35 - i * 0.1})`,
              animation: `iv-pulse-ring ${1.8 + i * 0.4}s ${i * 0.3}s ease-out infinite`,
            }}
          />
        ))}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          background: "rgba(20,184,166,0.12)",
          border: "1px solid rgba(20,184,166,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Zap size={20} color="var(--iv-teal)" />
        </div>
      </div>

      <div style={{
        fontFamily: "var(--ff-tech)", fontSize: 11, fontWeight: 700,
        color: "var(--iv-teal)", letterSpacing: "0.14em", marginBottom: 8,
      }}>
        ESTABLISHING CONNECTION
      </div>

      <p style={{ fontSize: 13, color: "var(--iv-text-2)", margin: "0 0 6px", maxWidth: 320 }}>
        Preparing your <strong style={{ color: "var(--iv-text)" }}>{sessionInfo.roundType.toLowerCase()}</strong> interview
        for the <strong style={{ color: "var(--iv-text)" }}>{sessionInfo.roleName}</strong> role.
      </p>
      <p style={{ fontSize: 11.5, color: "var(--iv-text-3)", margin: 0 }}>
        Keep this tab open. This takes just a moment.
      </p>

      <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
        <span className="iv-typing-dot" />
        <span className="iv-typing-dot" />
        <span className="iv-typing-dot" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LIVE INTERVIEW INNER
// ══════════════════════════════════════════════════════════════
function LiveInterviewInner({
  sessionInfo,
  formattedTimeLeft,
  onEnd,
  isEnding,
  avatarSession,
  avatarError,
}) {
  const { currentQuestion, transcript, questionHistory } = useAgentTranscript();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>

      {/* Session info + timer + end — compact top strip */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border)",
        borderRadius: 14,
        padding: "10px 16px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        gap: 10, flexShrink: 0,
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: "var(--ff-tech)", fontSize: 9, fontWeight: 700,
            color: "var(--iv-text-3)", letterSpacing: "0.12em", margin: "0 0 2px",
          }}>
            {sessionInfo.roleCategory || "AI INTERVIEW"}
          </p>
          <p style={{
            fontSize: 12.5, fontWeight: 600, color: "var(--iv-text)",
            margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {sessionInfo.roleName}
            <span style={{ color: "var(--iv-text-3)", fontWeight: 400, marginLeft: 6 }}>
              · {sessionInfo.roundType}
            </span>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {formattedTimeLeft && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(20,184,166,0.08)",
              border: "1px solid rgba(20,184,166,0.20)",
              borderRadius: 99, padding: "5px 12px",
              fontFamily: "var(--ff-tech)", fontSize: 11.5, fontWeight: 700,
              color: "var(--iv-teal)", letterSpacing: "0.06em",
            }}>
              <Clock size={11} />
              {formattedTimeLeft}
            </div>
          )}
          <button
            onClick={onEnd}
            disabled={isEnding}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px",
              background: isEnding ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 9,
              fontFamily: "var(--ff-tech)", fontSize: 10.5, fontWeight: 700,
              color: isEnding ? "rgba(239,68,68,0.6)" : "#ef4444",
              cursor: isEnding ? "not-allowed" : "pointer",
              letterSpacing: "0.06em",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseOver={(e) => { if (!isEnding) e.currentTarget.style.background = "rgba(239,68,68,0.20)"; }}
            onMouseOut={(e) => { if (!isEnding) e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
          >
            {isEnding ? (
              <>
                <RefreshCw size={10} style={{ animation: "iv-orbit 1s linear infinite" }} />
                ENDING
              </>
            ) : "END"}
          </button>
        </div>
      </div>

      {/* Transcript panel — fills remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <AgentTranscriptPanel
          currentQuestion={currentQuestion}
          transcript={transcript}
          questionHistory={questionHistory}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LIVE INTERVIEW VIEW (wrapper — preserves LiveKit context)
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
}) {
  const shouldConnect = uiState === "CONNECTING" || uiState === "LIVE";

  return (
    <div style={{
      background: "var(--iv-bg-2)",
      border: "1px solid var(--iv-border)",
      borderRadius: 20,
      padding: "14px",
      height: "100%",
    }}>
      <LiveKitVideoPanel
        serverUrl={livekitServerUrl}
        token={livekitToken}
        connect={shouldConnect}
        onConnected={onRoomConnected}
        onDisconnected={onRoomDisconnected}
        avatarSession={avatarSession}
        avatarError={avatarError}
      >
        <LiveInterviewInner
          sessionInfo={sessionInfo}
          formattedTimeLeft={formattedTimeLeft}
          onEnd={onEnd}
          isEnding={isEnding}
          avatarSession={avatarSession}
          avatarError={avatarError}
        />
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
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "56px 24px", textAlign: "center",
      animation: "iv-fade-up 0.5s ease both",
    }}>
      {/* Success ring */}
      <div style={{ position: "relative", width: 72, height: 72, marginBottom: 24 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute", inset: -(i * 8),
              borderRadius: "50%",
              border: `1px solid rgba(34,197,94,${0.15 / i})`,
              animation: `iv-ripple ${1.5 + i * 0.5}s ${i * 0.3}s ease-out infinite`,
            }}
          />
        ))}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          background: "rgba(34,197,94,0.10)",
          border: "1.5px solid rgba(34,197,94,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle2 size={28} color="#22c55e" strokeWidth={1.8} />
        </div>
      </div>

      <div style={{
        fontFamily: "var(--ff-tech)", fontSize: 10, fontWeight: 700,
        color: "#22c55e", letterSpacing: "0.16em", marginBottom: 10,
      }}>
        INTERVIEW COMPLETE
      </div>

      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--iv-text)", marginBottom: 8 }}>
        Great work!
      </p>

      <p style={{ fontSize: 13, color: "var(--iv-text-2)", lineHeight: 1.6, maxWidth: 360, marginBottom: 28 }}>
        Your mock interview for the{" "}
        <span style={{ color: "var(--iv-text)", fontWeight: 600 }}>{sessionInfo?.roleName}</span>{" "}
        role is complete. Your evaluation report is being generated.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        {sessionId && (
          <button
            onClick={() => navigate(`/ai-interview/results/${sessionId}`)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 20px",
              background: "var(--iv-teal)", color: "#fff",
              border: "none", borderRadius: 10,
              fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(20,184,166,0.30)",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--iv-teal-dk)"}
            onMouseOut={(e) => e.currentTarget.style.background = "var(--iv-teal)"}
          >
            View Results <ArrowRight size={13} />
          </button>
        )}
        <button
          onClick={onBackToRoles}
          style={{
            padding: "10px 20px",
            background: "transparent", color: "var(--iv-text-2)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10,
            fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 500,
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; e.currentTarget.style.color = "var(--iv-text)"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "var(--iv-text-2)"; }}
        >
          Back to roles
        </button>
      </div>
    </div>
  );
}