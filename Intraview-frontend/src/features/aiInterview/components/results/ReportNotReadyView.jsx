// src/features/aiInterview/components/results/ReportNotReadyView.jsx

export function ReportNotReadyView({ isLoading, pollCount = 0, maxPolls = 6 }) {
  return (
    <div className="rounded-xl bg-gray-900/70 border border-gray-800 p-8 flex flex-col items-center text-center gap-4">
      {isLoading ? (
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-teal-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-50 mb-1">
          Report is being generated
        </p>
        <p className="text-11px text-gray-400 max-w-sm">
          Your final report is being prepared by the AI. This usually takes
          10–30 seconds after your interview ends.
        </p>
      </div>

      {!isLoading && pollCount < maxPolls && (
        <p className="text-10px text-gray-500">
          Checking again in 10 seconds… (attempt {pollCount + 1} of {maxPolls})
        </p>
      )}

      {!isLoading && pollCount >= maxPolls && (
        <p className="text-10px text-gray-500">
          Taking longer than expected. Try refreshing this page in a moment.
        </p>
      )}
    </div>
  );
}