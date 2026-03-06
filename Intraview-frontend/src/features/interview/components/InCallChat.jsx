// // src/components/InCallChat.jsx

// import React, { useEffect, useRef, useState } from "react";

// /**
//  * In-call chat panel UI.
//  *
//  * Props:
//  *  - messages: Array<{
//  *      id: string;
//  *      type: "chat" | "reaction";
//  *      text?: string;
//  *      emoji?: string;
//  *      senderName: string;
//  *      ts: number;
//  *    }>
//  *  - onSend: (text: string) => void
//  *  - isOpen: boolean
//  *  - onToggle: () => void
//  */
// function InCallChat({ messages, onSend, isOpen, onToggle }) {
//   const [input, setInput] = useState("");
//   const listRef = useRef(null);

//   function handleSubmit(e) {
//     e.preventDefault();
//     const trimmed = input.trim();
//     if (!trimmed) return;
//     onSend(trimmed);
//     setInput("");
//   }

//   // Auto scroll to bottom when new messages arrive
//   useEffect(() => {
//     const el = listRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   }, [messages]);

//   return (
//     <div className="w-full md:w-80 md:border-l mt-4 md:mt-0 md:pl-4">
//       <div className="flex items-center justify-between mb-2">
//         <h2 className="font-medium">In-call messages</h2>
//         <button
//           type="button"
//           className="text-sm text-blue-600"
//           onClick={onToggle}
//         >
//           {isOpen ? "Hide" : "Show"}
//         </button>
//       </div>

//       {!isOpen ? (
//         <p className="text-sm text-gray-500">
//           Chat is hidden. Click &quot;Show&quot; to view messages.
//         </p>
//       ) : (
//         <>
//           <div
//             ref={listRef}
//             className="h-64 overflow-y-auto border rounded p-2 bg-gray-50"
//           >
//             {messages.length === 0 ? (
//               <p className="text-sm text-gray-500">
//                 Messages you send will appear here.
//               </p>
//             ) : (
//               messages.map((m) => (
//                 <div key={m.id} className="mb-1 text-sm">
//                   <span className="font-semibold mr-1">
//                     {m.senderName || "User"}
//                   </span>
//                   <span className="text-gray-500 text-xs mr-1">
//                     {new Date(m.ts).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                   {m.type === "chat" ? (
//                     <span>{m.text}</span>
//                   ) : (
//                     <span>{m.emoji}</span>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>

//           <form
//             className="mt-2 flex gap-2"
//             onSubmit={handleSubmit}
//           >
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Send a message to everyone"
//               className="flex-1 border rounded px-2 py-1 text-sm"
//             />
//             <button
//               type="submit"
//               className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
//               disabled={!input.trim()}
//             >
//               Send
//             </button>
//           </form>
//         </>
//       )}
//     </div>
//   );
// }

// export default InCallChat;





















// src/components/InCallChat.jsx

import React, { useEffect, useRef, useState } from "react";

const C = {
  bg:           "#0b1220",
  surface:      "#111827",
  surfaceHi:    "#1a2538",
  border:       "rgba(255,255,255,0.07)",
  accent:       "#3b82f6",
  accentSoft:   "rgba(59,130,246,0.18)",
  accentBorder: "rgba(59,130,246,0.28)",
  white:        "#f1f5f9",
  muted:        "#64748b",
  text:         "#cbd5e1",
};

const FONT = "'Georgia', 'Times New Roman', serif";

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

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const getInitial = (name = "") => (name[0] || "?").toUpperCase();

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.headerTitle}>In-call messages</span>
        <button onClick={onToggle} style={s.closeBtn} title="Close chat">✕</button>
      </div>

      {/* Message list */}
      <div ref={listRef} style={s.list}>
        {messages.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: "28px" }}>💬</span>
            <p style={s.emptyText}>Messages you send will appear here</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={s.row}>
              <div style={{
                ...s.avatar,
                background: m.senderName === "you" ? C.accentSoft : "rgba(100,116,139,0.2)",
                border: `1px solid ${m.senderName === "you" ? C.accentBorder : "rgba(100,116,139,0.3)"}`,
                color: m.senderName === "you" ? C.accent : C.muted,
              }}>
                {getInitial(m.senderName)}
              </div>
              <div style={s.msgBody}>
                <div style={s.meta}>
                  <span style={s.sender}>
                    {m.senderName === "you" ? "You" : (m.senderName || "User")}
                  </span>
                  <span style={s.time}>
                    {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {m.type === "chat" ? (
                  <div style={{
                    ...s.bubble,
                    ...(m.senderName === "you" ? s.bubbleSelf : s.bubbleOther),
                  }}>
                    {m.text}
                  </div>
                ) : (
                  <div style={s.reactionRow}>
                    <span style={{ fontSize: "20px" }}>{m.emoji}</span>
                    <span style={s.reactionLabel}>reacted</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={s.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message…"
          style={s.input}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          style={{ ...s.sendBtn, ...(!input.trim() ? s.sendBtnDisabled : {}) }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}

const s = {
  panel: {
    width: "300px",
    flexShrink: 0,
    background: C.surface,
    borderLeft: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    fontFamily: FONT,
    height: "100%",
  },
  header: {
    padding: "18px 18px 14px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  headerTitle: {
    color: C.white,
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "0.03em",
    fontFamily: FONT,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: C.muted,
    fontSize: "15px",
    cursor: "pointer",
    padding: "3px 6px",
    borderRadius: "6px",
    lineHeight: 1,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    scrollbarWidth: "thin",
    scrollbarColor: `${C.surfaceHi} transparent`,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "10px",
    opacity: 0.5,
  },
  emptyText: { color: C.muted, fontSize: "13px", textAlign: "center", margin: 0, fontFamily: FONT },
  row: { display: "flex", gap: "9px", alignItems: "flex-start" },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
    fontFamily: FONT,
  },
  msgBody: { flex: 1, minWidth: 0 },
  meta: { display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "4px" },
  sender: { color: C.text, fontSize: "12px", fontWeight: "600", fontFamily: FONT },
  time: { color: C.muted, fontSize: "10px" },
  bubble: {
    fontSize: "13px",
    lineHeight: "1.55",
    padding: "7px 11px",
    borderRadius: "10px",
    wordBreak: "break-word",
    display: "inline-block",
    maxWidth: "100%",
    fontFamily: FONT,
  },
  bubbleSelf: {
    background: C.accentSoft,
    border: `1px solid ${C.accentBorder}`,
    color: "#bfdbfe",
  },
  bubbleOther: {
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`,
    color: C.text,
  },
  reactionRow: { display: "flex", alignItems: "center", gap: "6px" },
  reactionLabel: { color: C.muted, fontSize: "12px", fontStyle: "italic", fontFamily: FONT },
  inputRow: {
    padding: "12px 14px",
    borderTop: `1px solid ${C.border}`,
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`,
    borderRadius: "20px",
    color: C.white,
    fontSize: "13px",
    padding: "9px 14px",
    outline: "none",
    fontFamily: FONT,
  },
  sendBtn: {
    background: C.accent,
    border: "none",
    borderRadius: "50%",
    color: C.white,
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "13px",
    flexShrink: 0,
    boxShadow: "0 2px 10px rgba(59,130,246,0.3)",
    transition: "all 0.15s",
  },
  sendBtnDisabled: { opacity: 0.35, cursor: "not-allowed", boxShadow: "none" },
};

export default InCallChat;