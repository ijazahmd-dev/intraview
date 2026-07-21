// src/features/aiInterview/components/results/FinalReportCard.jsx

import { ScoreRing } from "./ScoreRing";

/**
 * report shape from backend:
 * {
 *   overall_score, summary,
 *   strengths, areas_for_improvement, recommendations,
 *   status, created_at
 * }
 */
function splitLines(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str.map((s) => String(s).trim()).filter(Boolean);
  if (typeof str === "string") {
    return str.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function scoreLabel(score) {
  if (score === null || score === undefined) return { text: "N/A", color: "text-gray-400" };
  if (score >= 8) return { text: "Excellent", color: "text-teal-600" };
  if (score >= 6) return { text: "Good", color: "text-yellow-600" };
  if (score >= 4) return { text: "Fair", color: "text-orange-500" };
  return { text: "Needs Work", color: "text-red-500" };
}

function formatSeconds(value) {
  const total = Number(value || 0);
  if (!total) return "0s";
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function FinalReportCard({ report }) {
  if (!report) return null;

  const strengths = splitLines(report.strengths);
  const areasForImprovement = splitLines(report.areas_for_improvement);
  const recommendations = splitLines(report.recommendations);
  const { text: perfLabel, color: perfColor } = scoreLabel(report.overall_score);
  const integritySummary = report.integrity_summary || {};
  const integrityRows = [
    {
      label: "Tab switches",
      value: integritySummary.tab_switch_count ?? 0,
      detail: formatSeconds(integritySummary.tab_switch_duration_seconds),
    },
    {
      label: "Window focus losses",
      value: integritySummary.window_focus_loss_count ?? 0,
      detail: formatSeconds(
        integritySummary.window_focus_loss_duration_seconds
      ),
    },
    {
      label: "Fullscreen exits",
      value: integritySummary.fullscreen_exit_count ?? 0,
      detail: null,
    },
    {
      label: "Face missing events",
      value: integritySummary.face_missing_count ?? 0,
      detail: formatSeconds(integritySummary.face_missing_duration_seconds),
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Hero score + summary card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />

        <div className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Score ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <ScoreRing score={report.overall_score} size={110} />
            <span className={`text-sm font-bold ${perfColor}`}>{perfLabel}</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

          {/* Summary */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-xs font-semibold text-teal-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                AI Summary
              </span>
              {report.created_at && (
                <span className="text-xs text-gray-400">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              )}
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-2">
              Overall Performance
            </h2>

            {report.summary ? (
              <p className="text-sm text-gray-600 leading-relaxed">
                {report.summary}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No summary available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Three column feedback grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeedbackSection
          title="Strengths"
          items={strengths}
          emptyText="No strengths recorded."
          accent="teal"
          icon={
            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <FeedbackSection
          title="Areas to Improve"
          items={areasForImprovement}
          emptyText="No areas flagged."
          accent="yellow"
          icon={
            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
            </svg>
          }
        />
        <FeedbackSection
          title="Recommendations"
          items={recommendations}
          emptyText="No recommendations."
          accent="gray"
          icon={
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </div>

      <IntegritySection
        summary={integritySummary}
        score={report.integrity_score}
        rows={integrityRows}
      />
    </div>
  );
}

const accentMap = {
  teal: {
    header: "bg-teal-50 border-teal-100",
    title: "text-teal-700",
    dot: "bg-teal-500",
    itemText: "text-gray-700",
    border: "border-teal-100",
  },
  yellow: {
    header: "bg-yellow-50 border-yellow-100",
    title: "text-yellow-700",
    dot: "bg-yellow-400",
    itemText: "text-gray-700",
    border: "border-yellow-100",
  },
  gray: {
    header: "bg-gray-50 border-gray-200",
    title: "text-gray-700",
    dot: "bg-gray-400",
    itemText: "text-gray-700",
    border: "border-gray-100",
  },
};

function FeedbackSection({ title, items, emptyText, accent = "teal", icon }) {
  const colors = accentMap[accent] ?? accentMap.teal;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${colors.border}`}>
      {/* Section header */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${colors.header}`}>
        {icon}
        <p className={`text-sm font-bold ${colors.title}`}>{title}</p>
        <span className="ml-auto text-xs font-semibold text-gray-400 bg-white/70 px-2 py-0.5 rounded-full border border-gray-100">
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 italic">{emptyText}</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`}
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function IntegritySection({ summary, score, rows }) {
  const totalEvents = Number(summary?.total_event_count || 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-slate-50">
        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-amber-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 8v4m0 4h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">Interview Integrity</p>
          <p className="text-xs text-slate-500">
            Neutral session signals recorded during the live interview.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Integrity Score
          </p>
          <p className="text-lg font-bold text-slate-900">
            {score ?? 100}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                {row.label}
              </p>
              <div className="flex items-end justify-between gap-3">
                <p className="text-2xl font-bold text-slate-900">{row.value}</p>
                {row.detail && (
                  <p className="text-xs text-slate-500 pb-1">{row.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600 leading-relaxed m-0">
            {totalEvents === 0
              ? "No integrity-related events were recorded for this session."
              : "These signals are provided as additional interview context only. They do not label intent or determine the evaluation outcome on their own."}
          </p>
        </div>
      </div>
    </div>
  );
}
