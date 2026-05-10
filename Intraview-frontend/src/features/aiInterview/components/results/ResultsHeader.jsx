// src/features/aiInterview/components/results/ResultsHeader.jsx

export function ResultsHeader({
  sessionId,
  sessionStatus,
  onBack,
  onStartNew,
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-11px text-gray-400 hover:text-teal-300 mb-2"
        >
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to roles
        </button>
        <h1 className="text-lg font-bold text-gray-50">Interview Results</h1>
        <p className="text-11px text-gray-500 mt-0.5">
          Session{" "}
          <span className="text-gray-300 font-medium">#{sessionId}</span>
          {sessionStatus && (
            <>
              {" "}
              ·{" "}
              <span className="text-emerald-400 font-semibold">
                {sessionStatus}
              </span>
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onStartNew}
        className="flex-shrink-0 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white transition-colors"
      >
        Start New Interview
      </button>
    </div>
  );
}