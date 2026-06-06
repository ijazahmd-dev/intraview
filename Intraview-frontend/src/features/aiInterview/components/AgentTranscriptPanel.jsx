// src/features/aiInterview/components/AgentTranscriptPanel.jsx
// Agent-only transcript — clean, internally scrollable, never grows page height.

import { useEffect, useRef } from "react";
import { MessageSquare, Mic } from "lucide-react";

/**
 * Props:
 *   currentQuestion  — { text, turn_index } | null
 *   agentTranscript  — array of agent-only messages { id, role, type, text, turn_index }
 *
 * Only interviewer questions are shown. Candidate answers are excluded.
 */
export function AgentTranscriptPanel({ currentQuestion, agentTranscript }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentTranscript.length]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
      height: "100%",
      minHeight: 0,
      overflow: "hidden",
    }}>

      {/* ── Current Question ────────────────────── */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border-teal)",
        borderLeft: "3px solid var(--iv-teal)",
        borderRadius: 12,
        padding: "11px 13px",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Label row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--iv-teal)",
            boxShadow: "0 0 5px var(--iv-teal)",
            animation: currentQuestion ? "iv-blink-live 2s ease infinite" : "none",
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "var(--ff-tech)", fontSize: 9, fontWeight: 700,
            color: "var(--iv-teal)", letterSpacing: "0.13em",
          }}>
            CURRENT QUESTION
            {currentQuestion?.turn_index != null && (
              <span style={{ color: "var(--iv-text-3)", marginLeft: 5 }}>
                · Q{currentQuestion.turn_index}
              </span>
            )}
          </span>
        </div>

        {currentQuestion ? (
          <p style={{
            fontSize: 12.5, color: "var(--iv-text)", lineHeight: 1.6,
            margin: 0, position: "relative",
          }}>
            {currentQuestion.text}
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 11.5, color: "var(--iv-text-3)", fontStyle: "italic" }}>
              Waiting for first question
            </span>
            <span className="iv-typing-dot" />
            <span className="iv-typing-dot" />
            <span className="iv-typing-dot" />
          </div>
        )}
      </div>

      {/* ── Interviewer Questions History (scrollable) ─ */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border)",
        borderRadius: 12,
        padding: "11px 13px",
        display: "flex", flexDirection: "column",
        flex: 1, minHeight: 0, overflow: "hidden",
      }}>
        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 9, flexShrink: 0,
        }}>
          <MessageSquare size={11} color="var(--iv-text-3)" />
          <span style={{
            fontFamily: "var(--ff-tech)", fontSize: 9, fontWeight: 700,
            color: "var(--iv-text-3)", letterSpacing: "0.11em",
          }}>
            INTERVIEWER QUESTIONS
          </span>
          {agentTranscript.length > 0 && (
            <span style={{
              marginLeft: "auto",
              fontFamily: "var(--ff-tech)", fontSize: 8.5, fontWeight: 600,
              color: "var(--iv-text-3)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 4, padding: "1px 5px",
            }}>
              {agentTranscript.length}
            </span>
          )}
        </div>

        {agentTranscript.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 9, textAlign: "center",
          }}>
            <Mic size={20} color="var(--iv-text-3)" strokeWidth={1.5} />
            <p style={{ fontSize: 11, color: "var(--iv-text-3)", margin: 0, fontStyle: "italic" }}>
              Questions will appear here
            </p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="iv-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingRight: 4,
              minHeight: 0,
            }}
          >
            {agentTranscript.map((msg, idx) => {
              const isActive = currentQuestion && msg.id === currentQuestion.id;
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{
                      fontFamily: "var(--ff-tech)", fontSize: 8.5, fontWeight: 700,
                      color: isActive ? "var(--iv-teal)" : "var(--iv-text-3)",
                      letterSpacing: "0.08em",
                    }}>
                      {msg.turn_index != null ? `Q${msg.turn_index}` : `Q${idx + 1}`}
                    </span>
                    {isActive && (
                      <span style={{
                        fontSize: 7.5,
                        background: "rgba(20,184,166,0.12)",
                        border: "1px solid rgba(20,184,166,0.28)",
                        borderRadius: 4,
                        padding: "1px 5px",
                        color: "var(--iv-teal)",
                        fontFamily: "var(--ff-tech)",
                        fontWeight: 700,
                        letterSpacing: "0.09em",
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{
                    padding: "11px 14px",
                    borderRadius: isActive ? "4px 12px 12px 12px" : "4px 10px 10px 10px",
                    background: isActive
                      ? "rgba(20,184,166,0.09)"
                      : "rgba(255,255,255,0.03)",
                    border: isActive
                      ? "1px solid rgba(20,184,166,0.22)"
                      : "1px solid rgba(255,255,255,0.04)",
                    fontSize: 12, lineHeight: 1.6,
                    color: isActive ? "#c8e6e4" : "var(--iv-text-2)",
                    transition: "all 0.25s",
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}