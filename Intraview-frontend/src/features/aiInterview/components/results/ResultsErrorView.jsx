// src/features/aiInterview/components/results/ResultsErrorView.jsx

export function ResultsErrorView({ message, onBack, inline = false }) {
  const displayMessage =
    message || "Something went wrong while loading your results.";

  if (inline) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
        {displayMessage}
      </div>
    );
  }

  return (
    <div className="py-16 flex flex-col items-center text-center gap-4">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-50 mb-1">
          Could not load results
        </p>
        <p className="text-11px text-gray-400 max-w-sm">{displayMessage}</p>
      </div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-xs font-semibold text-white"
        >
          Back to roles
        </button>
      )}
    </div>
  );
}