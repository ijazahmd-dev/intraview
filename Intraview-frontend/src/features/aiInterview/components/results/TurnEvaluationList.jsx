// src/features/aiInterview/components/results/TurnEvaluationList.jsx

import { useState } from "react";
import { ScoreRing } from "./ScoreRing";

/**
 * turns: array of AIInterviewTurnWithEvaluationSerializer shape:
 * {
 *   id, turn_index, question_text, answer_text,
 *   evaluation: { id, score, strengths, weaknesses,
 *                 suggestions, confidence, status } | null
 * }
 */
function splitLines(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str.map((s) => String(s).trim()).filter(Boolean);
  if (typeof str === "string") return str.split("\n").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function TurnEvaluationList({ turns }) {
  if (!turns || turns.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600 mb-1">No turns recorded</p>
        <p className="text-sm text-gray-400">No question turns were found for this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-sm font-semibold text-gray-700">
          {turns.length} question{turns.length !== 1 ? "s" : ""} in this session
        </p>
        <p className="text-xs text-gray-400">Click any card to expand</p>
      </div>

      {turns.map((turn) => (
        <TurnCard key={turn.id} turn={turn} />
      ))}
    </div>
  );
}

function TurnCard({ turn }) {
  const [expanded, setExpanded] = useState(false);
  const evaluation = turn.evaluation;

  const strengths = splitLines(evaluation?.strengths);
  const weaknesses = splitLines(evaluation?.weaknesses);
  const suggestions = splitLines(evaluation?.suggestions);

  const evalStatus = evaluation?.status ?? null;
  const evalPending =
    !evaluation || evalStatus === "PENDING" || evalStatus === "PROCESSING";
  const evalFailed = evalStatus === "FAILED";
  const evalSuccess = evalStatus === "SUCCESS";

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
        expanded ? "border-teal-200" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Turn header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Turn index badge */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              color: "white",
              boxShadow: "0 2px 8px rgba(20,184,166,0.3)",
            }}
          >
            {turn.turn_index ?? "?"}
          </div>

          {/* Question preview */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Question {turn.turn_index}
            </p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {turn.question_text || "No question recorded"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Score or status */}
          {evalSuccess && evaluation?.score !== null ? (
            <ScoreRing score={evaluation.score} size={44} />
          ) : evalPending ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              Pending
            </span>
          ) : evalFailed ? (
            <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-xs text-red-500 font-semibold">
              Failed
            </span>
          ) : null}

          {/* Confidence badge */}
          {evalSuccess && evaluation?.confidence && (
            <ConfidenceBadge confidence={evaluation.confidence} />
          )}

          {/* Expand chevron */}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${expanded ? "bg-teal-50" : "bg-gray-50"}`}>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180 text-teal-500" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {/* Q & A section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 pb-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
                Question
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {turn.question_text || "—"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Your Answer
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {turn.answer_text || "—"}
              </p>
            </div>
          </div>

          {/* Evaluation feedback */}
          {evalSuccess && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-5 pb-5">
              <MiniSection
                title="Strengths"
                items={strengths}
                emptyText="None noted."
                accent="teal"
              />
              <MiniSection
                title="Weaknesses"
                items={weaknesses}
                emptyText="None noted."
                accent="yellow"
              />
              <MiniSection
                title="Suggestions"
                items={suggestions}
                emptyText="None noted."
                accent="gray"
              />
            </div>
          )}

          {evalPending && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100">
                <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin flex-shrink-0" />
                <p className="text-sm text-gray-500">
                  Evaluation is still being processed. It will appear shortly.
                </p>
              </div>
            </div>
          )}

          {evalFailed && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 9v4M12 17h.01" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <p className="text-sm text-red-600">
                  Evaluation unavailable for this turn.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniSection({ title, items, emptyText, accent = "teal" }) {
  const accentMap = {
    teal: { dot: "bg-teal-500", title: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
    yellow: { dot: "bg-yellow-400", title: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
    gray: { dot: "bg-gray-400", title: "text-gray-500", bg: "bg-gray-50", border: "border-gray-100" },
  };
  const colors = accentMap[accent] ?? accentMap.teal;

  return (
    <div className={`rounded-xl border p-3.5 ${colors.bg} ${colors.border}`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-2.5 ${colors.title}`}>
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConfidenceBadge({ confidence }) {
  const map = {
    high: "bg-teal-50 text-teal-600 border-teal-200",
    medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
    low: "bg-red-50 text-red-500 border-red-200",
  };
  const cls = map[confidence?.toLowerCase()] ?? map.medium;

  return (
    <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>
      {confidence}
    </span>
  );
}