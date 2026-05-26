// src/features/progress/components/OverviewCards.jsx
import { useSelector } from "react-redux";
import { TrendingUp, Users, Bot, Clock, Star, Zap } from "lucide-react";

const READINESS_CONFIG = {
  BEGINNER: { label: "Beginner", color: "#94a3b8", bg: "#f1f5f9", bar: "#94a3b8" },
  IMPROVING: { label: "Improving", color: "#f59e0b", bg: "#fffbeb", bar: "#f59e0b" },
  JOB_READY: { label: "Job Ready", color: "#14b8a6", bg: "#f0fdfa", bar: "#14b8a6" },
  INTERVIEW_STRONG: { label: "Interview Strong", color: "#0ea5e9", bg: "#f0f9ff", bar: "#0ea5e9" },
};

const StatCard = ({ icon: Icon, label, value, sub, accent, delay }) => (
  <div
    className="stat-card"
    style={{
      animationDelay: `${delay}ms`,
      "--accent": accent,
    }}
  >
    <div className="card-icon-wrap">
      <Icon size={20} strokeWidth={1.8} />
    </div>
    <div className="card-body">
      <p className="card-label">{label}</p>
      <p className="card-value">{value}</p>
      {sub && <p className="card-sub">{sub}</p>}
    </div>
  </div>
);

export default function OverviewCards() {
  const { data, status } = useSelector((s) => s.progress.overview);
  const loading = status === "loading" || status === "idle";

  if (loading) {
    return (
      <div className="overview-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="stat-card skeleton-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="skel skel-icon" />
            <div className="skel-body">
              <div className="skel skel-label" />
              <div className="skel skel-value" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const readiness = READINESS_CONFIG[data.readiness_level] || READINESS_CONFIG.BEGINNER;
  const scoreDisplay =
    data.average_overall_score > 0
      ? `${data.average_overall_score.toFixed(1)} / 5`
      : "—";

  return (
    <div className="overview-grid">
      <StatCard
        icon={TrendingUp}
        label="Total Sessions"
        value={data.total_sessions_attended}
        sub="All interviews"
        accent="#14b8a6"
        delay={0}
      />
      <StatCard
        icon={Users}
        label="Peer Sessions"
        value={data.peer_sessions_count}
        sub="With interviewers"
        accent="#6366f1"
        delay={80}
      />
      <StatCard
        icon={Bot}
        label="AI Sessions"
        value={data.ai_sessions_count}
        sub="AI-powered mocks"
        accent="#0ea5e9"
        delay={160}
      />
      <StatCard
        icon={Star}
        label="Avg Score"
        value={scoreDisplay}
        sub="Overall rating"
        accent="#f59e0b"
        delay={240}
      />
      <StatCard
        icon={Clock}
        label="Hours Practiced"
        value={`${data.total_practice_hours}h`}
        sub="Total practice time"
        accent="#10b981"
        delay={320}
      />

      {/* Readiness Card — special */}
      <div
        className="stat-card readiness-card"
        style={{
          animationDelay: "400ms",
          "--accent": readiness.color,
          background: readiness.bg,
          borderColor: `${readiness.color}30`,
        }}
      >
        <div className="card-icon-wrap" style={{ background: `${readiness.color}18`, color: readiness.color }}>
          <Zap size={20} strokeWidth={1.8} />
        </div>
        <div className="card-body">
          <p className="card-label">Interview Readiness</p>
          <p className="card-value" style={{ color: readiness.color }}>
            {data.readiness_score}%
          </p>
          <div className="readiness-bar-wrap">
            <div className="readiness-bar-track">
              <div
                className="readiness-bar-fill"
                style={{
                  width: `${data.readiness_score}%`,
                  background: readiness.color,
                }}
              />
            </div>
            <span className="readiness-badge" style={{ color: readiness.color }}>
              {readiness.label}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          animation: cardIn 0.4s ease both;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .card-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: color-mix(in srgb, var(--accent, #14b8a6) 12%, transparent);
          color: var(--accent, #14b8a6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-body { flex: 1; min-width: 0; }
        .card-label {
          font-size: 11.5px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 4px;
        }
        .card-value {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.1;
          margin: 0 0 4px;
          font-variant-numeric: tabular-nums;
        }
        .card-sub {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }
        .readiness-bar-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .readiness-bar-track {
          flex: 1;
          height: 5px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
        }
        .readiness-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 1s ease;
        }
        .readiness-badge {
          font-size: 10.5px;
          font-weight: 600;
          white-space: nowrap;
        }
        /* Skeleton */
        .skeleton-card { pointer-events: none; }
        .skel {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
        .skel-icon { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; }
        .skel-body { flex: 1; }
        .skel-label { height: 10px; width: 60%; margin-bottom: 10px; }
        .skel-value { height: 26px; width: 50%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}