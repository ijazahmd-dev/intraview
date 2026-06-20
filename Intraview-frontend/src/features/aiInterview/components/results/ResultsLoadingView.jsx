// src/features/aiInterview/components/results/ResultsLoadingView.jsx

export function ResultsLoadingView() {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-6">
      {/* Spinner */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-[3px] border-gray-200" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-teal-500 border-t-transparent animate-spin" />
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-gray-700 mb-1">Loading results…</p>
        <p className="text-sm text-gray-400">Fetching your interview performance data</p>
      </div>
    </div>
  );
}