// src/features/progress/components/ReadinessPanel.jsx
import { useSelector } from "react-redux";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const READINESS_LEVELS = [
  { min: 81, label: "Interview Strong", color: "#0ea5e9", bg: "#f0f9ff" },
  { min: 61, label: "Job Ready",        color: "#14b8a6", bg: "#f0fdfa" },
  { min: 31, label: "Improving",        color: "#f59e0b", bg: "#fffbeb" },
  { min: 0,  label: "Beginner",         color: "#94a3b8", bg: "#f8fafc" },
];

function getLevel(score) {
  return READINESS_LEVELS.find((l) => score >= l.min) || READINESS_LEVELS[3];
}

// SVG arc gauge
function Gauge({ score }) {
  const level = getLevel(score);
  const R = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalArc = 240;
  const pct = score / 100;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (fromDeg, toDeg) => {
    const x1 = cx + R * Math.cos(toRad(fromDeg));
    const y1 = cy + R * Math.sin(toRad(fromDeg));
    const x2 = cx + R * Math.cos(toRad(toDeg));
    const y2 = cy + R * Math.sin(toRad(toDeg));
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  };

  const fillEnd = startAngle + totalArc * pct;

  return (
    <svg viewBox="0 0 180 120" width="180" height="120">
      {/* Track */}
      <path
        d={arcPath(startAngle, endAngle)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Fill */}
      {score > 0 && (
        <path
          d={arcPath(startAngle, fillEnd)}
          fill="none"
          stroke={level.color}
          strokeWidth="10"
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      )}
      {/* Score text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="28" fontWeight="800" fill="#0f172a">
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#94a3b8">
        out of 100
      </text>
    </svg>
  );
}

export default function ReadinessPanel() {
  const overview = useSelector((s) => s.progress.overview);
  const strengths = useSelector((s) => s.progress.strengths);

  const loading =
    overview.status === "loading" ||
    overview.status === "idle" ||
    strengths.status === "loading" ||
    strengths.status === "idle";

  if (loading) {
    return (
      <div className="readiness-panel">
        {[1, 2].map((i) => (
          <div key={i} className="panel-half">
            <div className="skel" style={{ width: "60%", height: 18, borderRadius: 6, marginBottom: 8 }} />
            <div className="skel" style={{ width: "80%", height: 12, borderRadius: 6, marginBottom: 24 }} />
            <div className="skel" style={{ height: 120, borderRadius: 12 }} />
          </div>
        ))}
        <style>{`.skel{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  const score = overview.data?.readiness_score || 0;
  const level = getLevel(score);
  const sw = strengths.data;

  const levelSteps = [
    { pct: 80, label: "Interview Strong", color: "#0ea5e9" },
    { pct: 60, label: "Job Ready",        color: "#14b8a6" },
    { pct: 30, label: "Improving",        color: "#f59e0b" },
    { pct: 0,  label: "Beginner",         color: "#94a3b8" },
  ];

  return (
    <div className="readiness-panel">
      {/* LEFT — Gauge */}
      <div className="panel-half gauge-half" style={{ background: level.bg, borderColor: `${level.color}20` }}>
        <h3 className="panel-title">Interview Readiness</h3>
        <p className="panel-sub">Your overall preparation score</p>

        <div className="gauge-center">
          <Gauge score={score} />
          <span className="level-badge" style={{ color: level.color, background: `${level.color}15`, border: `1px solid ${level.color}30` }}>
            {level.label}
          </span>
        </div>

        <div className="level-steps">
          {levelSteps.map((s) => (
            <div key={s.label} className={`level-step ${score >= s.pct ? "reached" : ""}`}>
              <div className="level-dot" style={{ background: score >= s.pct ? s.color : "#e2e8f0" }} />
              <span style={{ color: score >= s.pct ? s.color : "#94a3b8" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Strengths & Weaknesses */}
      <div className="panel-half sw-half">
        <h3 className="panel-title">Strengths & Areas to Improve</h3>
        <p className="panel-sub">Based on your evaluation history</p>

        {!sw || (sw.strengths.length === 0 && sw.weaknesses.length === 0) ? (
          <p className="empty-sw">Complete peer interviews to see your analysis.</p>
        ) : (
          <div className="sw-columns">
            <div className="sw-col">
              <p className="sw-col-label strengths-label">
                <CheckCircle2 size={13} /> Strengths
              </p>
              {sw.strengths.length === 0 ? (
                <p className="sw-none">None yet</p>
              ) : (
                sw.strengths.map((s) => (
                  <div key={s.skill} className="sw-item strength-item">
                    <span className="sw-skill">{s.skill}</span>
                    <span className="sw-score strength-score">{s.score.toFixed(1)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="sw-divider" />
            <div className="sw-col">
              <p className="sw-col-label weaknesses-label">
                <AlertTriangle size={13} /> Needs Work
              </p>
              {sw.weaknesses.length === 0 ? (
                <p className="sw-none">None identified</p>
              ) : (
                sw.weaknesses.map((s) => (
                  <div key={s.skill} className="sw-item weakness-item">
                    <span className="sw-skill">{s.skill}</span>
                    <span className="sw-score weakness-score">{s.score.toFixed(1)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="threshold-note">
          Strength ≥ {sw?.thresholds?.strength ?? 4.0} &nbsp;·&nbsp; Needs Work &lt; {sw?.thresholds?.weakness ?? 3.0} &nbsp;(out of 5)
        </div>
      </div>

      <style>{`
        .readiness-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          animation: cardIn 0.4s 0.2s ease both;
        }
        @media (max-width: 768px) {
          .readiness-panel { grid-template-columns: 1fr; }
        }
        .panel-half {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .panel-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }
        .panel-sub {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 20px;
        }
        .gauge-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .level-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 99px;
          letter-spacing: 0.03em;
        }
        .level-steps {
          display: flex;
          justify-content: space-between;
          gap: 4px;
        }
        .level-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 500;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        .level-step.reached { opacity: 1; }
        .level-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          transition: background 0.3s;
        }
        /* SW */
        .sw-columns {
          display: flex;
          gap: 0;
        }
        .sw-col { flex: 1; }
        .sw-divider {
          width: 1px;
          background: #e2e8f0;
          margin: 0 20px;
        }
        .sw-col-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0 0 12px;
        }
        .strengths-label { color: #14b8a6; }
        .weaknesses-label { color: #f59e0b; }
        .sw-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 9px;
          margin-bottom: 6px;
          font-size: 13px;
        }
        .strength-item { background: #f0fdfa; }
        .weakness-item { background: #fffbeb; }
        .sw-skill { color: #374151; font-weight: 500; }
        .strength-score { color: #14b8a6; font-weight: 700; font-size: 13px; }
        .weakness-score { color: #f59e0b; font-weight: 700; font-size: 13px; }
        .sw-none { color: #94a3b8; font-size: 12px; font-style: italic; }
        .empty-sw { color: #94a3b8; font-size: 14px; margin-top: 24px; }
        .threshold-note {
          font-size: 11px;
          color: #cbd5e1;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}