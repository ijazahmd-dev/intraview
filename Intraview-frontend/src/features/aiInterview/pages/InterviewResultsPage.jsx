// src/features/aiInterview/pages/InterviewResultsPage.jsx

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchSessionEvaluations,
  fetchSessionFinalReport,
  resetAllEvaluationState,
} from "../slice/aiInterviewEvaluationSlice";

import { ResultsHeader } from "../components/results/ResultsHeader";
import { FinalReportCard } from "../components/results/FinalReportCard";
import { TurnEvaluationList } from "../components/results/TurnEvaluationList";
import { ResultsLoadingView } from "../components/results/ResultsLoadingView";
import { ResultsErrorView } from "../components/results/ResultsErrorView";
import { ReportNotReadyView } from "../components/results/ReportNotReadyView";

const MAX_POLLS = 12;       // up to 12 attempts
const POLL_INTERVAL = 8000; // every 8 seconds

export default function InterviewResultsPage() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { sessionEvaluations, finalReport } = useSelector(
    (state) => state.aiInterviewEvaluation
  );

  const [activeTab, setActiveTab] = useState("report");
  const [pollCount, setPollCount] = useState(0);

  // Use refs to track latest values without stale closures
  const finalReportStatusRef = useRef(finalReport.status);
  finalReportStatusRef.current = finalReport.status;

  const pollCountRef = useRef(pollCount);
  pollCountRef.current = pollCount;

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchSessionEvaluations(sessionId));
    dispatch(fetchSessionFinalReport(sessionId));

    return () => {
      dispatch(resetAllEvaluationState());
    };
  }, [sessionId, dispatch]);

  // ── Polling: interval-based, immune to intermediate "loading" states ──────
  // The old setTimeout approach stopped working when status flipped to "loading"
  // mid-poll. This interval uses refs so it always sees the latest status.
  useEffect(() => {
    const timer = setInterval(() => {
      const status = finalReportStatusRef.current;
      const count = pollCountRef.current;

      // Stop if done or max attempts reached
      if (status === "success" || status === "error" || count >= MAX_POLLS) {
        clearInterval(timer);
        return;
      }

      // Only fire a request when we're actually waiting
      if (status === "not_ready") {
        dispatch(fetchSessionFinalReport(sessionId));
        setPollCount((c) => c + 1);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [sessionId, dispatch]); // stable deps — refs handle dynamic values

  const handleBackToRoles = () => navigate("/ai-interview/roles");
  const handleStartNew = () => navigate("/ai-interview/roles");

  // ── Loading state — wait for evaluations at minimum ──────────────────────
  const isLoading =
    sessionEvaluations.status === "idle" ||
    sessionEvaluations.status === "loading";

  if (isLoading) {
    return (
      <PageShell>
        <ResultsLoadingView />
      </PageShell>
    );
  }

  if (sessionEvaluations.status === "error") {
    return (
      <PageShell>
        <ResultsErrorView
          message={sessionEvaluations.error}
          onBack={handleBackToRoles}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ResultsHeader
        sessionId={sessionId}
        sessionStatus={sessionEvaluations.sessionStatus}
        onBack={handleBackToRoles}
        onStartNew={handleStartNew}
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <TabButton
          active={activeTab === "report"}
          onClick={() => setActiveTab("report")}
        >
          📋 Final Report
        </TabButton>
        <TabButton
          active={activeTab === "turns"}
          onClick={() => setActiveTab("turns")}
        >
          🔍 Turn Evaluations
          {sessionEvaluations.turns.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold">
              {sessionEvaluations.turns.length}
            </span>
          )}
        </TabButton>
      </div>

      {/* Tab content */}
      {activeTab === "report" && (
        <>
          {finalReport.status === "loading" ||
          finalReport.status === "idle" ? (
            <ReportNotReadyView isLoading={true} />
          ) : finalReport.status === "not_ready" ? (
            <ReportNotReadyView
              isLoading={false}
              pollCount={pollCount}
              maxPolls={MAX_POLLS}
            />
          ) : finalReport.status === "error" ? (
            <ResultsErrorView
              message={finalReport.error}
              onBack={handleBackToRoles}
              inline
            />
          ) : (
            <FinalReportCard report={finalReport.data} />
          )}
        </>
      )}

      {activeTab === "turns" && (
        <TurnEvaluationList turns={sessionEvaluations.turns} />
      )}
    </PageShell>
  );
}

// ── Shared page shell ─────────────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Top gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {children}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
        active
          ? "bg-white text-teal-600 shadow-sm border border-teal-100"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}