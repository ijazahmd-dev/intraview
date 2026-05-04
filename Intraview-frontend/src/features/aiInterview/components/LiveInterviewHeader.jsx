// src/components/ai-interview/LiveInterviewHeader.jsx

export function LiveInterviewHeader({ sessionId, joinStatus, uiState, onBack }) {
  const statusLabel =
    joinStatus === "joining"
      ? "Joining session"
      : joinStatus === "ready"
      ? "Ready"
      : joinStatus === "error"
      ? "Error"
      : joinStatus || "Idle";

  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center text-[11px] text-gray-400 hover:text-teal-300"
        >
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to roles
        </button>
        <h1 className="mt-1 font-semibold text-sm sm:text-base text-gray-50">
          AI Interview Session
        </h1>
        <p className="text-[11px] text-gray-500">
          Session ID: <span className="text-gray-300">{sessionId}</span>
        </p>
      </div>
      <div className="text-[11px] text-gray-400 text-right">
        <div>
          Status:{" "}
          <span className="font-semibold text-emerald-400">
            {statusLabel}
          </span>
        </div>
        <div className="text-[10px] mt-0.5 text-gray-500">
          UI: {uiState}
        </div>
      </div>
    </div>
  );
}