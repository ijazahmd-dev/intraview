// src/features/aiInterview/pages/InterviewResultsPage.jsx

import { useEffect, useState } from "react";
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

export default function InterviewResultsPage() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { sessionEvaluations, finalReport } = useSelector(
    (state) => state.aiInterviewEvaluation
  );

  const [activeTab, setActiveTab] = useState("report"); // "report" | "turns"
  const [pollCount, setPollCount] = useState(0);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchSessionEvaluations(sessionId));
    dispatch(fetchSessionFinalReport(sessionId));

    return () => {
      dispatch(resetAllEvaluationState());
    };
  }, [sessionId, dispatch]);

  // ── Poll for final report if not ready yet (max 6 attempts, 10s apart) ──
  useEffect(() => {
    if (finalReport.status !== "not_ready") return;
    if (pollCount >= 6) return;

    const timer = setTimeout(() => {
      dispatch(fetchSessionFinalReport(sessionId));
      setPollCount((c) => c + 1);
    }, 10000);

    return () => clearTimeout(timer);
  }, [finalReport.status, pollCount, sessionId, dispatch]);

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
      <div className="flex items-center gap-2 mb-5 border-b border-gray-800">
        <TabButton
          active={activeTab === "report"}
          onClick={() => setActiveTab("report")}
        >
          Final Report
        </TabButton>
        <TabButton
          active={activeTab === "turns"}
          onClick={() => setActiveTab("turns")}
        >
          Turn Evaluations
          {sessionEvaluations.turns.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-700 text-10px font-semibold text-gray-300">
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
              maxPolls={6}
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
      className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto">
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
      className={`flex items-center gap-1 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
        active
          ? "border-teal-400 text-teal-300"
          : "border-transparent text-gray-500 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}