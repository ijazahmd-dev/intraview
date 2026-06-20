// src/features/aiInterview/components/results/ReportNotReadyView.jsx

export function ReportNotReadyView({ isLoading, pollCount = 0, maxPolls = 12 }) {
  const dots = [0, 1, 2];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center gap-5">
      {/* Animated icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
          {isLoading ? (
            <div className="w-7 h-7 rounded-full border-[3px] border-teal-500 border-t-transparent animate-spin" />
          ) : (
            <svg
              className="w-8 h-8 text-teal-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          )}
        </div>

        {/* Pulsing ring */}
        {!isLoading && pollCount < maxPolls && (
          <div className="absolute inset-0 rounded-full border-2 border-teal-300 animate-ping opacity-30" />
        )}
      </div>

      {/* Text */}
      <div className="max-w-sm">
        <h3 className="text-base font-bold text-gray-900 mb-2">
          {isLoading ? "Loading your report…" : "Generating Your Report"}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your AI interview report is being prepared. This usually takes{" "}
          <span className="font-semibold text-teal-600">10–30 seconds</span> after your interview ends.
        </p>
      </div>

      {/* Progress / status */}
      {!isLoading && pollCount < maxPolls && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((pollCount / maxPolls) * 100, 95)}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {/* Animated dots */}
            <span className="flex gap-0.5">
              {dots.map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-teal-400 inline-block animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            Checking again shortly… (attempt {pollCount + 1} of {maxPolls})
          </div>
        </div>
      )}

      {!isLoading && pollCount >= maxPolls && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200">
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
          </svg>
          <p className="text-xs font-medium text-yellow-700">
            Taking longer than expected. Please refresh the page in a moment.
          </p>
        </div>
      )}
    </div>
  );
}