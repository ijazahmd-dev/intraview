// src/features/aiInterview/components/results/ResultsLoadingView.jsx

export function ResultsLoadingView() {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      <p className="text-sm text-gray-400">Loading your interview results…</p>
    </div>
  );
}