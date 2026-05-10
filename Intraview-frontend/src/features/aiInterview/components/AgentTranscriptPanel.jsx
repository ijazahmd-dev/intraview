// src/features/aiInterview/components/AgentTranscriptPanel.jsx

import { useEffect, useRef } from "react";

/**
 * Props:
 *   currentQuestion  — { text, turn_index } | null
 *   transcript       — array of { id, role, type, text, turn_index, timestamp }
 *   questionHistory  — array of past agent questions
 */
export function AgentTranscriptPanel({
  currentQuestion,
  transcript,
  questionHistory,
}) {
  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript to bottom on new messages
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript.length]);

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Current Question */}
      <div className="rounded-xl bg-gray-800 border border-teal-700/40 p-3 flex-shrink-0">
        <p className="text-10px font-semibold text-teal-400 uppercase tracking-wide mb-1.5">
          Current Question
        </p>
        {currentQuestion ? (
          <>
            {currentQuestion.turn_index !== null && (
              <p className="text-10px text-gray-500 mb-1">
                Q{currentQuestion.turn_index}
              </p>
            )}
            <p className="text-11px text-gray-100 leading-relaxed">
              {currentQuestion.text}
            </p>
          </>
        ) : (
          <p className="text-11px text-gray-500 italic">
            Waiting for first question…
          </p>
        )}
      </div>

      {/* Live Transcript */}
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-3 flex flex-col flex-1 min-h-0">
        <p className="text-10px font-semibold text-gray-400 uppercase tracking-wide mb-2 flex-shrink-0">
          Transcript
        </p>

        {transcript.length === 0 ? (
          <p className="text-11px text-gray-500 italic">
            Transcript will appear here as the interview progresses.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {transcript.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${
                  msg.role === "agent" ? "items-start" : "items-end"
                }`}
              >
                <span className="text-10px font-semibold text-gray-500">
                  {msg.role === "agent" ? "AI Interviewer" : "You"}
                  {msg.turn_index !== null ? ` · Q${msg.turn_index}` : ""}
                </span>
                <div
                  className={`max-w-[90%] px-2.5 py-1.5 rounded-lg text-11px leading-relaxed ${
                    msg.role === "agent"
                      ? "bg-gray-700 text-gray-100"
                      : "bg-teal-900/60 text-teal-100 border border-teal-700/30"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* Question History */}
      {questionHistory.length > 0 && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-3 flex-shrink-0">
          <p className="text-10px font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Previous Questions
          </p>
          <ol className="space-y-1.5">
            {questionHistory.map((q, i) => (
              <li key={q.id} className="flex gap-2 text-11px text-gray-400">
                <span className="text-gray-600 flex-shrink-0">
                  Q{q.turn_index ?? i + 1}.
                </span>
                <span className="leading-relaxed">{q.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}