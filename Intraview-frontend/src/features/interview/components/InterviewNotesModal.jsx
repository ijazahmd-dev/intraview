// // src/components/InterviewNotesModal.jsx

// import React, { useEffect, useRef, useState, useCallback } from "react";

// function InterviewNotesModal({
//   isOpen,
//   onClose,
//   notesService,
//   initialContent = "",
// }) {
//   const [content, setContent] = useState(initialContent);
//   const [status, setStatus] = useState("idle"); // idle | saving | saved | error
//   const [saveTimeout, setSaveTimeout] = useState(null);
//   const textareaRef = useRef(null);

//   // Debounced autosave - saves 1.5s after user stops typing
//   const debouncedSave = useCallback(async (newContent) => {
//     if (!notesService) return;

//     setStatus("saving");
    
//     try {
//       await notesService.saveNotes(newContent);
//       setStatus("saved");
//     } catch (err) {
//       console.error("Autosave failed:", err);
//       setStatus("error");
//     }

//     // Clear "saved" status after 2s
//     setTimeout(() => {
//       if (status === "saved") setStatus("idle");
//     }, 2000);
//   }, [notesService, status]);

//   // Handle content changes with debounced autosave
//   useEffect(() => {
//     setContent(initialContent);
//   }, [initialContent]);

//   const handleContentChange = (e) => {
//     const newContent = e.target.value;
//     setContent(newContent);

//     // Clear previous timeout
//     if (saveTimeout) {
//       clearTimeout(saveTimeout);
//     }

//     // Set new debounced save
//     const timeout = setTimeout(() => {
//       debouncedSave(newContent);
//     }, 1500);

//     setSaveTimeout(timeout);
//   };

//   // Cleanup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (saveTimeout) clearTimeout(saveTimeout);
//     };
//   }, []);

//   // Focus textarea when modal opens
//   useEffect(() => {
//     if (isOpen && textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;
// //    the main div original style:  fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50
//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//       <div 
//         className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
//         style={{ minHeight: "300px", maxHeight: "500px" }}
//       >
//         {/* Header - draggable */}
//         <div className="p-4 border-b flex items-center justify-between cursor-move select-none bg-gray-50 rounded-t-lg">
//           <h3 className="font-semibold text-lg">Interview Notes</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-xl font-bold p-1 hover:bg-gray-200 rounded-full transition-colors"
//           >
//             ×
//           </button>
//         </div>

//         {/* Content area */}
//         <div className="flex-1 p-4 overflow-hidden flex flex-col">
//           <textarea
//             ref={textareaRef}
//             value={content}
//             onChange={handleContentChange}
//             placeholder="Take notes about the candidate..."
//             className="flex-1 w-full p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
//             rows="12"
//           />
//         </div>

//         {/* Status bar */}
//         <div className="p-3 border-t bg-gray-50 rounded-b-lg">
//           <div className="flex items-center justify-between text-xs">
//             <span className={`font-medium ${
//               status === "saving" ? "text-blue-600" :
//               status === "saved" ? "text-green-600" :
//               status === "error" ? "text-red-600" : "text-gray-500"
//             }`}>
//               {status === "saving" && "Saving..."}
//               {status === "saved" && "Saved"}
//               {status === "error" && "Save failed"}
//               {status === "idle" && "Unsaved changes will autosave"}
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={async () => {
//                   setStatus("saving");
//                   try {
//                     await debouncedSave(content);
//                   } catch (err) {
//                     setStatus("error");
//                   }
//                 }}
//                 className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Save Now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InterviewNotesModal;














// src/components/InterviewNotesModal.jsx

import React, { useEffect, useRef, useState, useCallback } from "react";

const C = {
  surface:      "#111827",
  surfaceHi:    "#1a2538",
  border:       "rgba(255,255,255,0.07)",
  accent:       "#3b82f6",
  accentSoft:   "rgba(59,130,246,0.15)",
  accentBorder: "rgba(59,130,246,0.35)",
  white:        "#f1f5f9",
  muted:        "#64748b",
  text:         "#cbd5e1",
  green:        "#22c55e",
  danger:       "#ef4444",
};

const FONT = "'Georgia', 'Times New Roman', serif";

function InterviewNotesModal({ isOpen, onClose, notesService, initialContent = "" }) {
  const [content,     setContent]     = useState(initialContent);
  const [status,      setStatus]      = useState("idle");
  const [charCount,   setCharCount]   = useState(initialContent.length);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const textareaRef = useRef(null);

  const doSave = useCallback(async (text) => {
    if (!notesService) return;
    setStatus("saving");
    try {
      await notesService.saveNotes(text);
      setStatus("saved");
      setTimeout(() => setStatus((s) => s === "saved" ? "idle" : s), 2500);
    } catch (err) {
      console.error("Autosave failed:", err);
      setStatus("error");
    }
  }, [notesService]);

  useEffect(() => {
    setContent(initialContent);
    setCharCount(initialContent.length);
  }, [initialContent]);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setCharCount(val.length);
    if (saveTimeout) clearTimeout(saveTimeout);
    setSaveTimeout(setTimeout(() => doSave(val), 1500));
  };

  useEffect(() => () => { if (saveTimeout) clearTimeout(saveTimeout); }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 80);
  }, [isOpen]);

  if (!isOpen) return null;

  const statusColor = { saving: C.accent, saved: C.green, error: C.danger, idle: C.muted }[status] ?? C.muted;
  const statusText  = { saving: "Saving…", saved: "✓ Saved", error: "Save failed", idle: "Autosaves as you type" }[status] ?? "";

  return (
    <div
      style={s.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={{ fontSize: "20px" }}>📋</span>
            <div>
              <h3 style={s.title}>Interview Notes</h3>
              <p style={s.subtitle}>Confidential · visible only to you</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn} title="Close">✕</button>
        </div>

        <div style={s.divider} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Take notes about the candidate — technical skills, communication, key observations…"
          style={s.textarea}
          spellCheck
        />

        {/* Footer */}
        <div style={s.footer}>
          <div style={s.footerLeft}>
            {status === "saving" && <span style={s.savingDot} />}
            <span style={{ ...s.statusText, color: statusColor }}>{statusText}</span>
            <span style={s.charCount}>{charCount} chars</span>
          </div>
          <button
            onClick={() => doSave(content)}
            disabled={status === "saving"}
            style={s.saveBtn}
          >
            Save now
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: FONT,
  },
  modal: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    overflow: "hidden",
  },
  header: {
    padding: "20px 22px 16px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    background: C.surfaceHi,
  },
  headerLeft: { display: "flex", alignItems: "flex-start", gap: "12px" },
  title: {
    color: C.white,
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 2px",
    letterSpacing: "0.02em",
    fontFamily: FONT,
  },
  subtitle: { color: C.muted, fontSize: "12px", margin: 0, fontFamily: FONT, letterSpacing: "0.03em" },
  closeBtn: {
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`,
    color: C.muted,
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "7px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  divider: {
    height: "1px",
    background: `linear-gradient(to right, transparent, ${C.border}, transparent)`,
  },
  textarea: {
    width: "100%",
    minHeight: "240px",
    maxHeight: "380px",
    background: "rgba(255,255,255,0.02)",
    border: "none",
    borderBottom: `1px solid ${C.border}`,
    color: C.text,
    fontSize: "14px",
    lineHeight: "1.75",
    padding: "18px 22px",
    resize: "vertical",
    outline: "none",
    fontFamily: FONT,
    boxSizing: "border-box",
    letterSpacing: "0.01em",
  },
  footer: {
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.surfaceHi,
  },
  footerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  savingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: C.accent,
    display: "inline-block",
    animation: "pulse 1s ease-in-out infinite",
  },
  statusText: { fontSize: "12px", fontFamily: FONT, transition: "color 0.3s" },
  charCount: { color: C.muted, fontSize: "11px", opacity: 0.65, fontFamily: FONT },
  saveBtn: {
    background: C.accentSoft,
    border: `1px solid ${C.accentBorder}`,
    color: "#93c5fd",
    fontSize: "12px",
    padding: "6px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontFamily: FONT,
    letterSpacing: "0.04em",
    fontWeight: "600",
    transition: "all 0.15s",
  },
};

export default InterviewNotesModal;