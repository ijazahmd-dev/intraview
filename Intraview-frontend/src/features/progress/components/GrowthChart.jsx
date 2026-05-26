// src/features/progress/components/GrowthChart.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { fetchGrowthAnalytics, setGrowthSource } from "../progressSlice";

const SOURCES = [
  { key: "all", label: "All" },
  { key: "peer", label: "Peer" },
  { key: "ai", label: "AI" },
];

const LINES = {
  peer: [
    { key: "overall_score",        label: "Overall",        color: "#14b8a6" },
    { key: "technical_score",      label: "Technical",      color: "#6366f1" },
    { key: "communication_score",  label: "Communication",  color: "#f59e0b" },
    { key: "problem_solving_score",label: "Problem Solving",color: "#0ea5e9" },
    { key: "confidence_score",     label: "Confidence",     color: "#10b981" },
  ],
  ai: [
    { key: "overall_score", label: "Overall", color: "#14b8a6" },
  ],
  all: [
    { key: "overall_score", label: "Overall", color: "#14b8a6" },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", borderRadius: 12, padding: "12px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)", minWidth: 160,
    }}>
      <p style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 8px", fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
          <span style={{ color: p.color, fontSize: 12 }}>{p.name}</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>
            {p.value != null ? p.value.toFixed(1) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function GrowthChart() {
  const dispatch = useDispatch();
  const { data, status, source } = useSelector((s) => s.progress.growth);
  const loading = status === "loading" || status === "idle";

  useEffect(() => {
    dispatch(fetchGrowthAnalytics(source));
  }, [source]);

  const handleSource = (s) => {
    dispatch(setGrowthSource(s));
    dispatch(fetchGrowthAnalytics(s));
  };

  // Filter data by source
  const filtered = source === "all"
    ? data
    : data.filter((d) => d.source === source);

  // Group by month (merge peer+ai into single points when source=all)
  const byMonth = {};
  filtered.forEach((d) => {
    if (!byMonth[d.month]) byMonth[d.month] = { month: d.month };
    Object.assign(byMonth[d.month], d);
  });
  const chartData = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  const lines = LINES[source] || LINES.all;
  const isEmpty = !loading && chartData.length === 0;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Score Progression</h3>
          <p className="chart-subtitle">Track your improvement over time</p>
        </div>
        <div className="source-tabs">
          {SOURCES.map((s) => (
            <button
              key={s.key}
              className={`source-tab ${source === s.key ? "active" : ""}`}
              onClick={() => handleSource(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-body">
        {loading ? (
          <div className="chart-loader">
            <div className="loader-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : isEmpty ? (
          <div className="chart-empty">
            <p>No data yet. Complete some interviews to see your growth!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const [y, m] = v.split("-");
                  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${y.slice(2)}`;
                }}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickCount={6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 16 }}
              />
              {lines.map((l) => (
                <Line
                  key={l.key}
                  type="monotone"
                  dataKey={l.key}
                  name={l.label}
                  stroke={l.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>{`
        .chart-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          animation: cardIn 0.4s 0.1s ease both;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
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
        .source-tabs {
          display: flex;
          gap: 4px;
          background: #f8fafc;
          border-radius: 10px;
          padding: 4px;
        }
        .source-tab {
          padding: 6px 14px;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          color: #64748b;
          background: transparent;
          transition: all 0.15s;
        }
        .source-tab.active {
          background: #fff;
          color: #14b8a6;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .chart-body { min-height: 300px; display: flex; align-items: center; }
        .chart-body > * { flex: 1; }
        .chart-loader, .chart-empty {
          width: 100%; min-height: 300px;
          display: flex; align-items: center; justify-content: center;
        }
        .chart-empty p { color: #94a3b8; font-size: 14px; }
        .loader-dots { display: flex; gap: 6px; }
        .loader-dots span {
          width: 8px; height: 8px; border-radius: 50%;
          background: #14b8a6;
          animation: bounce 0.8s infinite;
        }
        .loader-dots span:nth-child(2) { animation-delay: 0.15s; background: #6366f1; }
        .loader-dots span:nth-child(3) { animation-delay: 0.3s; background: #0ea5e9; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}