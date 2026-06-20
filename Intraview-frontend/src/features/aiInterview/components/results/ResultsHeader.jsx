// src/features/aiInterview/components/results/ResultsHeader.jsx

export function ResultsHeader({
  sessionId,
  sessionStatus,
  onBack,
  onStartNew,
}) {
  return (
    <div className="mb-8">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-600 transition-colors mb-6 group"
      >


      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-7 h-7 text-teal-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Interview Results</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">
                Session{" "}
                <span className="text-gray-600 font-semibold">#{sessionId}</span>
              </span>
              {sessionStatus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                  {sessionStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartNew}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-sm font-semibold text-white transition-all duration-200 shadow-sm"
          style={{ boxShadow: "0 2px 10px rgba(20,184,166,0.3)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Interview
        </button>
      </div>
    </div>
  );
}