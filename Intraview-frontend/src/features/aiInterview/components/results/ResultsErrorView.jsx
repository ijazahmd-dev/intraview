// src/features/aiInterview/components/results/ResultsErrorView.jsx

export function ResultsErrorView({ message, onBack, inline = false }) {
  const displayMessage =
    message || "Something went wrong while loading your results.";

  if (inline) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">Report unavailable</p>
          <p className="text-sm text-gray-500">{displayMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-bold text-gray-900 mb-1">
          Could not load results
        </p>
        <p className="text-sm text-gray-500 max-w-sm">{displayMessage}</p>
      </div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-sm font-semibold text-white transition-all duration-200 shadow-sm"
          style={{ boxShadow: "0 2px 10px rgba(20,184,166,0.3)" }}
        >
          Back to roles
        </button>
      )}
    </div>
  );
}