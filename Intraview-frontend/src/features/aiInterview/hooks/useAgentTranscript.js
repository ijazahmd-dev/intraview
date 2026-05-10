// src/features/aiInterview/hooks/useAgentTranscript.js

import { useEffect, useRef, useState } from "react";
import { useDataChannel } from "@livekit/components-react";

/**
 * Message shape from the agent data channel:
 * {
 *   role: "agent" | "user",
 *   type: "question" | "answer" | "remark",
 *   text: string,
 *   turn_index: number,
 * }
 */

export function useAgentTranscript() {
  const [messages, setMessages] = useState([]);
  const seenRef = useRef(new Set());

  const { message } = useDataChannel((msg) => {
    try {
      const raw = new TextDecoder().decode(msg.payload);
      const parsed = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed.text !== "string" ||
        !parsed.role ||
        !parsed.type
      ) {
        return;
      }

      // Deduplicate by turn_index + role + type to avoid replay on reconnect
      const key = `${parsed.role}-${parsed.type}-${parsed.turn_index ?? "x"}-${parsed.text.slice(0, 30)}`;
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);

      const entry = {
        id: key,
        role: parsed.role,       // "agent" | "user"
        type: parsed.type,       // "question" | "answer" | "remark"
        text: parsed.text.trim(),
        turn_index: parsed.turn_index ?? null,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, entry]);
    } catch {
      // Silently ignore non-JSON data channel messages
    }
  });

  // Derived: current question = last agent message of type "question"
  const currentQuestion = [...messages]
    .reverse()
    .find((m) => m.role === "agent" && m.type === "question") ?? null;

  // Derived: full chronological transcript (all messages)
  const transcript = messages;

  // Derived: question history = all agent questions except the current one
  const questionHistory = messages.filter(
    (m) =>
      m.role === "agent" &&
      m.type === "question" &&
      m.id !== currentQuestion?.id
  );

  const resetTranscript = () => {
    setMessages([]);
    seenRef.current = new Set();
  };

  return {
    messages,
    currentQuestion,
    transcript,
    questionHistory,
    resetTranscript,
  };
}