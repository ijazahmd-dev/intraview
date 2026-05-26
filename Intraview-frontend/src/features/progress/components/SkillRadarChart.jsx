// src/features/progress/components/SkillRadarChart.jsx
import { useSelector } from "react-redux";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: "#0f172a", borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    }}>
      <p style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 4px", fontWeight: 600 }}>{d?.skill}</p>
      <p style={{ color: "#14b8a6", fontWeight: 700, fontSize: 15, margin: 0 }}>
        {d?.score?.toFixed(1)} <span style={{ color: "#64748b", fontSize: 11, fontWeight: 400 }}>/ 5</span>
      </p>
    </div>
  );
};

const ScoreBadge = ({ label, score, color }) => {
  const pct = (score / 5) * 100;
  return (
    <div className="skill-badge">
      <div className="skill-badge-top">
        <span className="skill-badge-label">{label}</span>
        <span className="skill-badge-score" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div className="skill-badge-track">
        <div className="skill-badge-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

export default function SkillRadarChart() {
  const { data, status } = useSelector((s) => s.progress.skills);
  const loading = status === "loading" || status === "idle";

  if (loading) {
    return (
      <div className="radar-card">
        <div className="chart-header-row">
          <div>
            <div className="skel" style={{ width: 140, height: 18, borderRadius: 6, marginBottom: 8 }} />
            <div className="skel" style={{ width: 200, height: 12, borderRadius: 6 }} />
          </div>
        </div>
        <div className="skel" style={{ height: 260, borderRadius: 12, marginTop: 16 }} />
        <style>{`.skel{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  if (!data || data.total_evaluations === 0) {
    return (
      <div className="radar-card empty-state">
        <h3 className="chart-title">Skill Breakdown</h3>
        <p className="empty-msg">Complete peer interviews to see your skill radar.</p>
      </div>
    );
  }

  const radarData = [
    { skill: "Technical",      score: data.technical,       fullMark: 5 },
    { skill: "Communication",  score: data.communication,   fullMark: 5 },
    { skill: "Problem Solving",score: data.problem_solving, fullMark: 5 },
    { skill: "Confidence",     score: data.confidence,      fullMark: 5 },
  ];

  const SKILL_COLORS = ["#14b8a6", "#6366f1", "#0ea5e9", "#f59e0b"];

  return (
    <div className="radar-card">
      <div className="chart-header-row">
        <div>
          <h3 className="chart-title">Skill Breakdown</h3>
          <p className="chart-subtitle">
            Based on {data.total_evaluations} peer evaluation{data.total_evaluations !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overall-pill">
          <span>Overall</span>
          <strong>{data.overall.toFixed(1)}</strong>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            tickCount={4}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 4, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="skill-badges">
        {radarData.map((d, i) => (
          <ScoreBadge key={d.skill} label={d.skill} score={d.score} color={SKILL_COLORS[i]} />
        ))}
      </div>

      <style>{`
        .radar-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          animation: cardIn 0.4s 0.15s ease both;
        }
        .chart-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .chart-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }
        .chart-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }
        .overall-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 99px;
          padding: 4px 12px;
          font-size: 12px;
          color: #64748b;
        }
        .overall-pill strong {
          color: #14b8a6;
          font-size: 14px;
          font-weight: 700;
        }
        .skill-badges {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .skill-badge { padding: 10px 14px; background: #f8fafc; border-radius: 10px; }
        .skill-badge-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .skill-badge-label { font-size: 12px; color: #64748b; font-weight: 500; }
        .skill-badge-score { font-size: 14px; font-weight: 700; }
        .skill-badge-track {
          height: 4px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
        }
        .skill-badge-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 1s ease;
        }
        .empty-state { text-align: center; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
        .empty-msg { color: #94a3b8; font-size: 14px; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}