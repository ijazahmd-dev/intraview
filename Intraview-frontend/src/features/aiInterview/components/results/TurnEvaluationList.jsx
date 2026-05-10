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
  return str
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TurnEvaluationList({ turns }) {
  if (!turns || turns.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No turns recorded for this session.
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
    <div className="rounded-xl bg-gray-900/70 border border-gray-800 overflow-hidden">
      {/* Turn header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Turn index badge */}
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-10px font-bold text-gray-300">
            {turn.turn_index ?? "?"}
          </div>

          {/* Question preview */}
          <p className="text-11px text-gray-200 truncate flex-1">
            {turn.question_text || "No question recorded"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Score or status badge */}
          {evalSuccess && evaluation?.score !== null ? (
            <ScoreRing score={evaluation.score} size={40} />
          ) : evalPending ? (
            <span className="px-2 py-0.5 rounded-full bg-gray-700 text-10px text-gray-400 font-semibold">
              Pending
            </span>
          ) : evalFailed ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-10px text-red-400 font-semibold">
              Failed
            </span>
          ) : null}

          {/* Confidence badge */}
          {evalSuccess && evaluation?.confidence && (
            <ConfidenceBadge confidence={evaluation.confidence} />
          )}

          {/* Expand chevron */}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Question + Answer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-10px font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Question
              </p>
              <p className="text-11px text-gray-300 leading-relaxed">
                {turn.question_text || "—"}
              </p>
            </div>
            <div>
              <p className="text-10px font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Your Answer
              </p>
              <p className="text-11px text-gray-300 leading-relaxed">
                {turn.answer_text || "—"}
              </p>
            </div>
          </div>

          {/* Evaluation detail */}
          {evalSuccess && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MiniSection
                title="Strengths"
                items={strengths}
                emptyText="None noted."
                dotColor="bg-emerald-400"
              />
              <MiniSection
                title="Weaknesses"
                items={weaknesses}
                emptyText="None noted."
                dotColor="bg-amber-400"
              />
              <MiniSection
                title="Suggestions"
                items={suggestions}
                emptyText="None noted."
                dotColor="bg-teal-400"
              />
            </div>
          )}

          {evalPending && (
            <p className="text-11px text-gray-500 italic">
              Evaluation is still being processed. Refresh in a moment.
            </p>
          )}

          {evalFailed && (
            <p className="text-11px text-red-400 italic">
              Evaluation unavailable for this turn.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MiniSection({ title, items, emptyText, dotColor }) {
  return (
    <div className="rounded-lg bg-gray-800/60 border border-gray-700/60 p-3">
      <p className="text-10px font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-10px text-gray-600 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-11px text-gray-300"
            >
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

function ConfidenceBadge({ confidence }) {
  const map = {
    high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const cls = map[confidence?.toLowerCase()] ?? map.medium;

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-10px font-semibold ${cls}`}
    >
      {confidence}
    </span>
  );
}