// src/components/InCallChat.jsx

import React, { useEffect, useRef, useState } from "react";

/**
 * In-call chat panel UI.
 *
 * Props:
 *  - messages: Array<{
 *      id: string;
 *      type: "chat" | "reaction";
 *      text?: string;
 *      emoji?: string;
 *      senderName: string;
 *      ts: number;
 *    }>
 *  - onSend: (text: string) => void
 *  - isOpen: boolean
 *  - onToggle: () => void
 */
function InCallChat({ messages, onSend, isOpen, onToggle }) {
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="w-full md:w-80 md:border-l mt-4 md:mt-0 md:pl-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">In-call messages</h2>
        <button
          type="button"
          className="text-sm text-blue-600"
          onClick={onToggle}
        >
          {isOpen ? "Hide" : "Show"}
        </button>
      </div>

      {!isOpen ? (
        <p className="text-sm text-gray-500">
          Chat is hidden. Click &quot;Show&quot; to view messages.
        </p>
      ) : (
        <>
          <div
            ref={listRef}
            className="h-64 overflow-y-auto border rounded p-2 bg-gray-50"
          >
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">
                Messages you send will appear here.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="mb-1 text-sm">
                  <span className="font-semibold mr-1">
                    {m.senderName || "User"}
                  </span>
                  <span className="text-gray-500 text-xs mr-1">
                    {new Date(m.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {m.type === "chat" ? (
                    <span>{m.text}</span>
                  ) : (
                    <span>{m.emoji}</span>
                  )}
                </div>
              ))
            )}
          </div>

          <form
            className="mt-2 flex gap-2"
            onSubmit={handleSubmit}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message to everyone"
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default InCallChat;
