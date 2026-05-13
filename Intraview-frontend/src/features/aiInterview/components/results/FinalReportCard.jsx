// src/features/aiInterview/components/results/FinalReportCard.jsx

import { ScoreRing } from "./ScoreRing";

/**
 * report shape from backend:
 * {
 *   overall_score, summary,
 *   strengths, areas_for_improvement, recommendations,
 *   status, created_at
 * }
 *
 * strengths / areas_for_improvement / recommendations are
 * newline-joined strings from backend — split them here.
 */
function splitLines(str) {
  if (!str) return [];
  
  // Already an array (backend sent JSON array)
  if (Array.isArray(str)) return str.map((s) => String(s).trim()).filter(Boolean);
  
  // Normal string case
  if (typeof str === "string") {
    return str.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  
  // Fallback for any other unexpected type
  return [];
}

export function FinalReportCard({ report }) {
  if (!report) return null;

  const strengths = splitLines(report.strengths);
  const areasForImprovement = splitLines(report.areas_for_improvement);
  const recommendations = splitLines(report.recommendations);

  return (
    <div className="space-y-4">
      {/* Score + summary */}
      <div className="rounded-xl bg-gray-900/70 border border-gray-800 p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <div className="flex-shrink-0">
          <ScoreRing score={report.overall_score} size={90} label="Overall" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-50 mb-1">
            Interview Summary
          </h2>
          {report.summary ? (
            <p className="text-11px text-gray-300 leading-relaxed">
              {report.summary}
            </p>
          ) : (
            <p className="text-11px text-gray-500 italic">
              No summary available.
            </p>
          )}
          <p className="text-10px text-gray-600 mt-2">
            Generated{" "}
            {report.created_at
              ? new Date(report.created_at).toLocaleString()
              : ""}
          </p>
        </div>
      </div>

      {/* Three column grid — strengths, areas, recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FeedbackSection
          title="Strengths"
          items={strengths}
          emptyText="No strengths recorded."
          iconColor="text-emerald-400"
          dotColor="bg-emerald-400"
        />
        <FeedbackSection
          title="Areas for Improvement"
          items={areasForImprovement}
          emptyText="No areas flagged."
          iconColor="text-amber-400"
          dotColor="bg-amber-400"
        />
        <FeedbackSection
          title="Recommendations"
          items={recommendations}
          emptyText="No recommendations."
          iconColor="text-teal-400"
          dotColor="bg-teal-400"
        />
      </div>
    </div>
  );
}

function FeedbackSection({ title, items, emptyText, dotColor }) {
  return (
    <div className="rounded-xl bg-gray-900/70 border border-gray-800 p-4">
      <p className="text-11px font-semibold text-gray-200 mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-11px text-gray-500 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-11px text-gray-300">
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
              />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}