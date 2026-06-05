// src/features/aiInterview/components/LiveInterviewViews.jsx

import { LiveKitVideoPanel } from "./LiveKitVideoPanel";
import { useNavigate } from "react-router-dom";
import { useAgentTranscript } from "../hooks/useAgentTranscript";
import { AgentTranscriptPanel } from "./AgentTranscriptPanel"; 

export function LoadingView({ message }) {
  return (
    <div className="py-10 text-center text-sm text-gray-300">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-700 bg-gray-800/60 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-gray-200">Connecting</span>
      </div>
      <p>{message}</p>
    </div>
  );
}

export function ErrorView({ errorMessage, onStartNew }) {
  const displayMessage =
    errorMessage ||
    "This interview session is no longer valid. It may have expired or never existed.";

  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mb-3">
        <svg
          className="w-5 h-5 text-red-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
        </svg>
      </div>
      <h2 className="text-sm font-semibold text-gray-50 mb-1">
        Session unavailable
      </h2>
      <p className="text-[11px] text-gray-400 max-w-sm mb-4">
        {displayMessage}
      </p>
      <button
        type="button"
        onClick={onStartNew}
        className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white"
      >
        Start a new interview
      </button>
    </div>
  );
}

export function LobbyView({ sessionInfo, onJoin }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Left: Instructions */}
      <div className="bg-gray-900/70 rounded-xl border border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-50 mb-3">
          Interview Instructions
        </h2>
        <ul className="space-y-2 text-[11px] text-gray-300">
          <li>
            1. Wait for the AI interviewer to introduce the interview and ask
            your first question.
          </li>
          <li>
            2. Speak your answers clearly. Every response is recorded and
            analyzed for feedback.
          </li>
          <li>
            3. Try to answer all questions to receive a complete analytics
            report at the end.
          </li>
          <li>
            4. Keep this tab open and avoid switching devices during the
            interview.
          </li>
        </ul>
      </div>

      {/* Right: Session summary + join */}
      <div className="bg-gray-900/70 rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-50 mb-3">
            Session Summary
          </h2>
          <dl className="space-y-1 text-[11px] text-gray-300">
            <Row label="Role" value={sessionInfo.roleName} />
            <Row label="Round" value={sessionInfo.roundType} uppercase />
            <Row label="Difficulty" value={sessionInfo.difficulty} uppercase />
            <Row
              label="Duration"
              value={
                sessionInfo.durationMinutes
                  ? `${sessionInfo.durationMinutes} mins`
                  : "N/A"
              }
            />
            <Row
              label="Backend status"
              value={sessionInfo.status}
              uppercase
              valueClass="text-emerald-400"
            />
            <Row
              label="Room name"
              value={sessionInfo.roomName}
              valueClass="text-gray-500"
            />
          </dl>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 max-w-xs">
            When you click join, we'll connect your microphone and start the AI
            interview experience.
          </p>
          <button
            type="button"
            onClick={onJoin}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white"
          >
            Join AI Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConnectingView({ sessionInfo }) {
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/40 flex items-center justify-center mb-3">
        <span className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
      </div>
      <h2 className="text-sm font-semibold text-gray-50 mb-1">
        Connecting to AI interviewer…
      </h2>
      <p className="text-[11px] text-gray-400 max-w-sm mb-4">
        We're preparing your {sessionInfo.roundType.toLowerCase()} interview
        for the {sessionInfo.roleName} role.
      </p>
      <p className="text-[11px] text-gray-500">
        This will take just a moment. Please keep this tab open.
      </p>
    </div>
  );
}











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
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.24em]">
              Live AI Interview
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">
              {sessionInfo.roleName} · {sessionInfo.roundType}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {formattedTimeLeft && (
              <div className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-[11px] font-semibold text-teal-200">
                Time left: {formattedTimeLeft}
              </div>
            )}
            <button
              type="button"
              onClick={onEnd}
              disabled={isEnding}
              className={`rounded-xl px-3 py-2 text-[11px] font-semibold text-white ${
                isEnding
                  ? "cursor-not-allowed bg-red-400 opacity-70"
                  : "bg-red-500/90 hover:bg-red-500"
              }`}
            >
              {isEnding ? "Ending..." : "End Interview"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Interviewer Mode
            </p>
            <p className="mt-2 text-sm text-slate-100">
              {avatarSession?.enabled
                ? "Tavus avatar connected through LiveKit."
                : "Voice-only fallback is active."}
            </p>
            {avatarError ? (
              <p className="mt-2 text-xs leading-relaxed text-amber-300">
                {avatarError}
              </p>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Your existing Gemini, Deepgram, and Cartesia interview flow remains unchanged.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Session Status
            </p>
            <p className="mt-2 text-sm text-slate-100">
              {sessionInfo.difficulty} · {sessionInfo.status}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Candidate audio and transcript capture continue on the same LiveKit room.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <AgentTranscriptPanel
          currentQuestion={currentQuestion}
          transcript={transcript}
          questionHistory={questionHistory}
        />
      </div>
    </div>
  );
}











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
    <div className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
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

export function CompletedView({ sessionInfo, onBackToRoles, sessionId }) {
  const navigate = useNavigate();

  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mb-3">
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="text-sm font-semibold text-gray-50 mb-1">
        Interview completed
      </h2>
      <p className="text-11px text-gray-400 max-w-sm mb-6">
        Your mock interview for the{" "}
        <span className="text-gray-200 font-medium">
          {sessionInfo?.roleName}
        </span>{" "}
        role is finished. Your evaluation report is being generated.
      </p>

      <div className="flex items-center gap-3">
        {sessionId && (
          <button
            type="button"
            onClick={() =>
              navigate(`/ai-interview/results/${sessionId}`)
            }
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white transition-colors"
          >
            View Results
          </button>
        )}
        <button
          type="button"
          onClick={onBackToRoles}
          className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 text-xs font-semibold text-gray-300 transition-colors"
        >
          Back to roles
        </button>
      </div>
    </div>
  );
}
function Row({ label, value, uppercase, valueClass }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-400">{label}</dt>
      <dd
        className={`text-right ${valueClass || ""} ${
          uppercase ? "uppercase text-[10px] font-semibold" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
