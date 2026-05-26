// src/features/progress/components/InterviewHistory.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchInterviewHistory, setHistorySource, setHistoryPage } from "../progressSlice";
import { Users, Bot, ChevronLeft, ChevronRight, Calendar, Star, ThumbsUp } from "lucide-react";

const SOURCE_TABS = [
  { key: "all",  label: "All" },
  { key: "peer", label: "Peer" },
  { key: "ai",   label: "AI" },
];

const HIRE_COLORS = {
  YES:        { bg: "#f0fdf4", color: "#16a34a", label: "Hire" },
  NO:         { bg: "#fff1f2", color: "#e11d48", label: "No Hire" },
  MAYBE:      { bg: "#fffbeb", color: "#d97706", label: "Maybe" },
  STRONG_YES: { bg: "#f0fdf4", color: "#15803d", label: "Strong Hire" },
};

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function ScoreStars({ score }) {
  if (score == null) return <span className="no-score">No score</span>;
  const max = score > 5 ? 10 : 5;
  const normalized = (score / max) * 5;
  return (
    <div className="score-display">
      <Star size={13} fill="#f59e0b" stroke="none" />
      <span className="score-num">{score.toFixed(1)}</span>
      <span className="score-max">/ {max}</span>
    </div>
  );
}

function HistoryCard({ item, index }) {
  const isPeer = item.interview_type === "peer";
  const hire = item.hire_recommendation ? HIRE_COLORS[item.hire_recommendation] : null;

  return (
    <div className="history-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="hcard-icon-wrap" style={{ background: isPeer ? "#f5f3ff" : "#f0f9ff" }}>
        {isPeer
          ? <Users size={18} strokeWidth={1.8} color="#6366f1" />
          : <Bot size={18} strokeWidth={1.8} color="#0ea5e9" />
        }
      </div>

      <div className="hcard-body">
        <div className="hcard-top">
          <div>
            <p className="hcard-interviewer">{item.interviewer_name || "Unknown"}</p>
            <div className="hcard-meta">
              <Calendar size={11} />
              <span>{formatDate(item.completed_date)}</span>
              <span className={`type-chip ${isPeer ? "peer-chip" : "ai-chip"}`}>
                {isPeer ? "Peer" : "AI"}
              </span>
            </div>
          </div>
          <div className="hcard-right">
            <ScoreStars score={item.overall_score} />
            {hire && (
              <span className="hire-badge" style={{ background: hire.bg, color: hire.color }}>
                <ThumbsUp size={10} />
                {hire.label}
              </span>
            )}
          </div>
        </div>

        {item.feedback_summary && (
          <p className="hcard-summary">"{item.feedback_summary}"</p>
        )}
      </div>
    </div>
  );
}

export default function InterviewHistory() {
  const dispatch = useDispatch();
  const { data, status, source, page, count, next, previous } = useSelector(
    (s) => s.progress.history
  );
  const loading = status === "loading" || status === "idle";
  const totalPages = Math.ceil(count / 10) || 1;

  useEffect(() => {
    dispatch(fetchInterviewHistory({ source, page }));
  }, [source, page]);

  const handleSource = (s) => {
    dispatch(setHistorySource(s));
    dispatch(fetchInterviewHistory({ source: s, page: 1 }));
  };

  const handlePage = (p) => {
    dispatch(setHistoryPage(p));
    dispatch(fetchInterviewHistory({ source, page: p }));
  };

  return (
    <div className="history-section">
      <div className="history-header">
        <div>
          <h3 className="section-title">Interview History</h3>
          <p className="section-sub">
            {count > 0 ? `${count} interview${count !== 1 ? "s" : ""} completed` : "Your past sessions"}
          </p>
        </div>
        <div className="source-tabs">
          {SOURCE_TABS.map((t) => (
            <button
              key={t.key}
              className={`source-tab ${source === t.key ? "active" : ""}`}
              onClick={() => handleSource(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="history-list">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="history-card skeleton-hcard" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="skel skel-icon" />
              <div className="skel-body-wrap">
                <div className="skel skel-line" style={{ width: "40%", height: 14 }} />
                <div className="skel skel-line" style={{ width: "60%", height: 11, marginTop: 8 }} />
                <div className="skel skel-line" style={{ width: "80%", height: 11, marginTop: 10 }} />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="empty-history">
            <p>No interviews found for this filter.</p>
          </div>
        ) : (
          data.map((item, i) => (
            <HistoryCard key={`${item.interview_type}-${item.booking_id}`} item={item} index={i} />
          ))
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pg-btn"
            disabled={!previous}
            onClick={() => handlePage(page - 1)}
          >
            <ChevronLeft size={15} />
            Prev
          </button>
          <div className="pg-numbers">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`pg-num ${page === i + 1 ? "active-pg" : ""}`}
                onClick={() => handlePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className="pg-btn"
            disabled={!next}
            onClick={() => handlePage(page + 1)}
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      <style>{`
        .history-section {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          animation: cardIn 0.4s 0.25s ease both;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }
        .section-sub {
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
        .history-list { display: flex; flex-direction: column; gap: 10px; }
        .history-card {
          display: flex;
          gap: 14px;
          padding: 16px;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          background: #fafcfe;
          animation: cardIn 0.3s ease both;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .history-card:hover {
          border-color: #e0f2fe;
          box-shadow: 0 2px 12px rgba(14,165,233,0.07);
        }
        .hcard-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hcard-body { flex: 1; min-width: 0; }
        .hcard-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          flex-wrap: wrap;
        }
        .hcard-interviewer {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px;
        }
        .hcard-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #94a3b8;
        }
        .type-chip {
          padding: 2px 7px;
          border-radius: 99px;
          font-size: 10.5px;
          font-weight: 600;
          margin-left: 2px;
        }
        .peer-chip { background: #f5f3ff; color: #6366f1; }
        .ai-chip   { background: #f0f9ff; color: #0ea5e9; }
        .hcard-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          flex-shrink: 0;
        }
        .score-display {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .score-num { font-size: 14px; font-weight: 700; color: #0f172a; }
        .score-max { font-size: 11px; color: #94a3b8; }
        .no-score  { font-size: 12px; color: #cbd5e1; }
        .hire-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
        }
        .hcard-summary {
          font-size: 12px;
          color: #64748b;
          margin: 8px 0 0;
          font-style: italic;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        /* Skeleton */
        .skeleton-hcard { pointer-events: none; background: #f8fafc; }
        .skel {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
        .skel-icon { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
        .skel-body-wrap { flex: 1; }
        .skel-line { margin-bottom: 0; }
        /* Empty */
        .empty-history {
          text-align: center;
          padding: 48px 0;
          color: #94a3b8;
          font-size: 14px;
        }
        /* Pagination */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }
        .pg-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 7px 14px;
          border-radius: 9px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pg-btn:hover:not(:disabled) {
          border-color: #14b8a6;
          color: #14b8a6;
        }
        .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pg-numbers { display: flex; gap: 4px; }
        .pg-num {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .pg-num:hover { border-color: #14b8a6; color: #14b8a6; }
        .active-pg {
          background: #14b8a6 !important;
          border-color: #14b8a6 !important;
          color: #fff !important;
          font-weight: 700;
        }
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