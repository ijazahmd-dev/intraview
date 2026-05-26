// src/features/progress/CandidateProgressPage.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  fetchOverviewStats,
  fetchGrowthAnalytics,
  fetchSkillBreakdown,
  fetchStrengthsWeaknesses,
  fetchInterviewHistory,
} from "../progressSlice";

import OverviewCards    from "../components/OverviewCards";
import GrowthChart      from "../components/GrowthChart";
import SkillRadarChart  from "../components/SkillRadarChart";
import ReadinessPanel   from "../components/ReadinessPanel";
import InterviewHistory from "../components/InterviewHistory";

export default function CandidateProgressPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOverviewStats());
    dispatch(fetchGrowthAnalytics("all"));
    dispatch(fetchSkillBreakdown());
    dispatch(fetchStrengthsWeaknesses());
    dispatch(fetchInterviewHistory({ source: "all", page: 1 }));
  }, [dispatch]);

  return (
    <div className="progress-page">
      {/* ─── Page Header ──────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <div className="page-tag">Career Growth</div>
            <h1 className="page-title">Progress Dashboard</h1>
            <p className="page-desc">
              Track your interview performance, spot weaknesses, and measure how
              interview-ready you are.
            </p>
          </div>
          <div className="header-badge">
            <div className="hbadge-icon">📈</div>
            <p className="hbadge-label">Your Growth Journey</p>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="progress-content">

        {/* 1. Overview */}
        <section className="section">
          <OverviewCards />
        </section>

        {/* 2. Growth Chart + Skill Radar side by side */}
        <section className="section two-col-section">
          <div className="col-grow">
            <GrowthChart />
          </div>
          <div className="col-fixed">
            <SkillRadarChart />
          </div>
        </section>

        {/* 3. Readiness + Strengths & Weaknesses */}
        <section className="section">
          <ReadinessPanel />
        </section>

        {/* 4. Interview History */}
        <section className="section">
          <InterviewHistory />
        </section>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        .progress-page {
          font-family: 'DM Sans', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* ── Header ──────────────────────────────── */
        .page-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0e4f4a 100%);
          padding: 40px 0 0;
          position: relative;
          overflow: hidden;
        }
        .page-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .page-header::after {
          content: '';
          position: absolute;
          bottom: -20px; left: 10%;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .page-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 36px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .page-tag {
          display: inline-block;
          background: rgba(20,184,166,0.2);
          color: #5eead4;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 12px;
          border-radius: 99px;
          margin-bottom: 12px;
          border: 1px solid rgba(20,184,166,0.25);
        }
        .page-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 10px;
          line-height: 1.15;
        }
        .page-desc {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          max-width: 480px;
          line-height: 1.6;
        }
        .header-badge {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(8px);
          flex-shrink: 0;
        }
        .hbadge-icon { font-size: 28px; }
        .hbadge-label { color: #cbd5e1; font-size: 13px; font-weight: 500; margin: 0; }

        /* ── Content ─────────────────────────────── */
        .progress-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 24px 60px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .section { width: 100%; }
        .two-col-section {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 16px;
        }
        .col-grow { min-width: 0; }
        .col-fixed { min-width: 0; }

        @media (max-width: 1024px) {
          .two-col-section {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .page-header-inner { padding: 0 16px 28px; }
          .progress-content  { padding: 20px 16px 48px; gap: 16px; }
          .header-badge      { display: none; }
        }
      `}</style>
    </div>
  );
}