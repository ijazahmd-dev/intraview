// // src/features/aiInterview/components/AgentTranscriptPanel.jsx

// import { useEffect, useRef } from "react";

// /**
//  * Props:
//  *   currentQuestion  — { text, turn_index } | null
//  *   transcript       — array of { id, role, type, text, turn_index, timestamp }
//  *   questionHistory  — array of past agent questions
//  */
// export function AgentTranscriptPanel({
//   currentQuestion,
//   transcript,
//   questionHistory,
// }) {
//   const transcriptEndRef = useRef(null);

//   // Auto-scroll transcript to bottom on new messages
//   useEffect(() => {
//     transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [transcript.length]);

//   return (
//     <div className="flex flex-col gap-3 h-full">

//       {/* Current Question */}
//       <div className="rounded-xl bg-gray-800 border border-teal-700/40 p-3 flex-shrink-0">
//         <p className="text-10px font-semibold text-teal-400 uppercase tracking-wide mb-1.5">
//           Current Question
//         </p>
//         {currentQuestion ? (
//           <>
//             {currentQuestion.turn_index !== null && (
//               <p className="text-10px text-gray-500 mb-1">
//                 Q{currentQuestion.turn_index}
//               </p>
//             )}
//             <p className="text-11px text-gray-100 leading-relaxed">
//               {currentQuestion.text}
//             </p>
//           </>
//         ) : (
//           <p className="text-11px text-gray-500 italic">
//             Waiting for first question…
//           </p>
//         )}
//       </div>

//       {/* Live Transcript */}
//       <div className="rounded-xl bg-gray-800 border border-gray-700 p-3 flex flex-col flex-1 min-h-0">
//         <p className="text-10px font-semibold text-gray-400 uppercase tracking-wide mb-2 flex-shrink-0">
//           Transcript
//         </p>

//         {transcript.length === 0 ? (
//           <p className="text-11px text-gray-500 italic">
//             Transcript will appear here as the interview progresses.
//           </p>
//         ) : (
//           <div className="flex-1 overflow-y-auto space-y-2 pr-1">
//             {transcript.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex flex-col gap-0.5 ${
//                   msg.role === "agent" ? "items-start" : "items-end"
//                 }`}
//               >
//                 <span className="text-10px font-semibold text-gray-500">
//                   {msg.role === "agent" ? "AI Interviewer" : "You"}
//                   {msg.turn_index !== null ? ` · Q${msg.turn_index}` : ""}
//                 </span>
//                 <div
//                   className={`max-w-[90%] px-2.5 py-1.5 rounded-lg text-11px leading-relaxed ${
//                     msg.role === "agent"
//                       ? "bg-gray-700 text-gray-100"
//                       : "bg-teal-900/60 text-teal-100 border border-teal-700/30"
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//             <div ref={transcriptEndRef} />
//           </div>
//         )}
//       </div>

//       {/* Question History */}
//       {questionHistory.length > 0 && (
//         <div className="rounded-xl bg-gray-800 border border-gray-700 p-3 flex-shrink-0">
//           <p className="text-10px font-semibold text-gray-400 uppercase tracking-wide mb-2">
//             Previous Questions
//           </p>
//           <ol className="space-y-1.5">
//             {questionHistory.map((q, i) => (
//               <li key={q.id} className="flex gap-2 text-11px text-gray-400">
//                 <span className="text-gray-600 flex-shrink-0">
//                   Q{q.turn_index ?? i + 1}.
//                 </span>
//                 <span className="leading-relaxed">{q.text}</span>
//               </li>
//             ))}
//           </ol>
//         </div>
//       )}
//     </div>
//   );
// }




























// src/features/aiInterview/components/AgentTranscriptPanel.jsx

import { useEffect, useRef } from "react";
import { MessageSquare, History, Mic } from "lucide-react";

/**
 * Props:
 *   currentQuestion  — { text, turn_index } | null
 *   transcript       — array of { id, role, type, text, turn_index, timestamp }
 *   questionHistory  — array of past agent questions
 */
export function AgentTranscriptPanel({ currentQuestion, transcript, questionHistory }) {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript.length]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      gap: 10, height: "100%",
    }}>

      {/* ── Current Question ──────────────────────────── */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border-teal)",
        borderLeft: "3px solid var(--iv-teal)",
        borderRadius: 14,
        padding: "14px 16px",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient top glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 10,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--iv-teal)",
            boxShadow: "0 0 6px var(--iv-teal)",
            animation: currentQuestion ? "iv-blink-live 2s ease infinite" : "none",
          }} />
          <span style={{
            fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700,
            color: "var(--iv-teal)", letterSpacing: "0.14em",
          }}>
            CURRENT QUESTION
            {currentQuestion?.turn_index != null && (
              <span style={{ color: "var(--iv-text-3)", marginLeft: 6 }}>
                Q{currentQuestion.turn_index}
              </span>
            )}
          </span>
        </div>

        {currentQuestion ? (
          <p style={{
            fontSize: 13, color: "var(--iv-text)", lineHeight: 1.65,
            margin: 0, position: "relative",
          }}>
            {currentQuestion.text}
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--iv-text-3)", fontStyle: "italic" }}>
              Waiting for first question
            </span>
            <span className="iv-typing-dot" />
            <span className="iv-typing-dot" />
            <span className="iv-typing-dot" />
          </div>
        )}
      </div>

      {/* ── Live Transcript ───────────────────────────── */}
      <div style={{
        background: "var(--iv-bg-3)",
        border: "1px solid var(--iv-border)",
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex", flexDirection: "column",
        flex: 1, minHeight: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 12, flexShrink: 0,
        }}>
          <MessageSquare size={12} color="var(--iv-text-3)" />
          <span style={{
            fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700,
            color: "var(--iv-text-3)", letterSpacing: "0.12em",
          }}>
            LIVE TRANSCRIPT
          </span>
        </div>

        {transcript.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 10, textAlign: "center",
          }}>
            <Mic size={22} color="var(--iv-text-3)" strokeWidth={1.5} />
            <p style={{ fontSize: 12, color: "var(--iv-text-3)", margin: 0, fontStyle: "italic" }}>
              Transcript will appear as the interview progresses
            </p>
          </div>
        ) : (
          <div
            className="iv-scrollbar"
            style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 2 }}
          >
            {transcript.map((msg) => {
              const isAgent = msg.role === "agent";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isAgent ? "flex-start" : "flex-end",
                    gap: 3,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--ff-tech)", fontSize: 9, fontWeight: 600,
                    color: isAgent ? "var(--iv-teal)" : "var(--iv-text-3)",
                    letterSpacing: "0.08em",
                  }}>
                    {isAgent ? "AI INTERVIEWER" : "YOU"}
                    {msg.turn_index != null && ` · Q${msg.turn_index}`}
                  </span>
                  <div style={{
                    maxWidth: "88%",
                    padding: "8px 12px",
                    borderRadius: isAgent ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                    background: isAgent
                      ? "rgba(20,184,166,0.08)"
                      : "rgba(255,255,255,0.05)",
                    border: isAgent
                      ? "1px solid rgba(20,184,166,0.18)"
                      : "1px solid rgba(255,255,255,0.06)",
                    fontSize: 12, lineHeight: 1.6,
                    color: isAgent ? "#c8e6e4" : "var(--iv-text)",
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* ── Question History ──────────────────────────── */}
      {questionHistory.length > 0 && (
        <div style={{
          background: "var(--iv-bg-3)",
          border: "1px solid var(--iv-border)",
          borderRadius: 14,
          padding: "12px 16px",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            marginBottom: 10,
          }}>
            <History size={11} color="var(--iv-text-3)" />
            <span style={{
              fontFamily: "var(--ff-tech)", fontSize: 9.5, fontWeight: 700,
              color: "var(--iv-text-3)", letterSpacing: "0.12em",
            }}>
              PREVIOUS QUESTIONS
            </span>
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {questionHistory.map((q, i) => (
              <li key={q.id} style={{
                display: "flex", gap: 10,
                fontSize: 11.5, color: "var(--iv-text-3)", lineHeight: 1.5,
              }}>
                <span style={{
                  fontFamily: "var(--ff-tech)", fontSize: 9.5,
                  color: "var(--iv-teal)", flexShrink: 0, marginTop: 1, fontWeight: 600,
                }}>
                  Q{q.turn_index ?? i + 1}
                </span>
                <span>{q.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}