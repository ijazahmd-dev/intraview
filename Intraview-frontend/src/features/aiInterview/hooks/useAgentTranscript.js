// src/features/aiInterview/hooks/useAgentTranscript.js

import { useRef, useState } from "react";
import { useDataChannel } from "@livekit/components-react";

/**
 * Listens to the LiveKit data channel for agent-sent JSON messages.
 *
 * Agent message shapes (_send_data in runtime.py):
 *   { type: "question", index: number, text: string, total: number }
 *   { type: "answer",   index: number, question: string, answer: string, is_followup: boolean }
 *   { type: "state",    state: string, current_index: number, max_questions: number }
 *   { type: "info",     reason: string, message: string }
 */
export function useAgentTranscript() {
  const seenRef = useRef(new Set());
  const [messages, setMessages] = useState([]);

  useDataChannel((msg) => {
    try {
      const raw = new TextDecoder().decode(msg.payload);
      const parsed = JSON.parse(raw);

      if (!parsed || !parsed.type) return;

      // We only care about question and answer events for the transcript.
      if (parsed.type !== "question" && parsed.type !== "answer") return;

      // Deduplicate: type + index + first 40 chars of content.
      const content =
        parsed.type === "question"
          ? (parsed.text ?? "")
          : (parsed.answer ?? "");
      const key = `${parsed.type}-${parsed.index ?? "x"}-${content.slice(0, 40)}`;

      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);

      if (parsed.type === "question") {
        const entry = {
          id: key,
          role: "agent",
          type: "question",
          text: (parsed.text ?? "").trim(),
          turn_index: parsed.index ?? null,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, entry]);
      } else if (parsed.type === "answer") {
        const entry = {
          id: key,
          role: "user",
          type: "answer",
          text: (parsed.answer ?? "").trim(),
          turn_index: parsed.index ?? null,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, entry]);
      }
    } catch {
      // Silently ignore non-JSON or malformed data channel messages
    }
  });

  // Current question = last agent question message
  const currentQuestion =
    [...messages].reverse().find((m) => m.role === "agent" && m.type === "question") ?? null;

  // Full transcript = all messages in order
  const transcript = messages;

  // Question history = all agent questions except the current one
  const questionHistory = messages.filter(
    (m) => m.role === "agent" && m.type === "question" && m.id !== currentQuestion?.id
  );

  const resetTranscript = () => {
    setMessages([]);
    seenRef.current = new Set();
  };

  return { messages, currentQuestion, transcript, questionHistory, resetTranscript };
}