


// // src/features/aiInterview/components/LiveInterviewHeader.jsx

// const UI_STATES = {
//   LOADING: "LOADING",
//   ERROR: "ERROR",
//   LOBBY: "LOBBY",
//   CONNECTING: "CONNECTING",
//   LIVE: "LIVE",
//   COMPLETED: "COMPLETED",
// };

// export function LiveInterviewHeader({ sessionId, joinStatus, uiState, onBack }) {
//   let statusLabel;

//   // User-facing status should follow the UI state, not internal Redux flags.
//   if (uiState === UI_STATES.LIVE) {
//     statusLabel = "Live";
//   } else if (uiState === UI_STATES.CONNECTING || uiState === UI_STATES.LOADING) {
//     statusLabel = "Connecting";
//   } else if (uiState === UI_STATES.LOBBY) {
//     statusLabel = "Ready to join";
//   } else if (uiState === UI_STATES.COMPLETED) {
//     statusLabel = "Completed";
//   } else if (uiState === UI_STATES.ERROR) {
//     statusLabel = "Error";
//   } else {
//     // Fallback to raw joinStatus for debugging
//     statusLabel = joinStatus || "Idle";
//   }

//   return (
//     <div className="flex items-center justify-between gap-3 mb-4">
//       <div>
//         {/* <button
//           onClick={onBack}
//           className="inline-flex items-center text-[11px] text-gray-400 hover:text-teal-300"
//         >
//           <svg
//             className="w-3.5 h-3.5 mr-1"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//           >
//             <path d="M15 19l-7-7 7-7" />
//           </svg>
//           Back to roles
//         </button> */}
//         <h1 className="mt-1 font-semibold text-sm sm:text-base text-gray-50">
//           AI Interview Session
//         </h1>
//         <p className="text-[11px] text-gray-500">
//           Session ID: <span className="text-gray-300">{sessionId}</span>
//         </p>
//       </div>
//       <div className="text-[11px] text-gray-400 text-right">
//         <div>
//           Status:{" "}
//           <span className="font-semibold text-emerald-400">
//             {statusLabel}
//           </span>
//         </div>
//         <div className="text-[10px] mt-0.5 text-gray-500">
//           UI: {uiState}
//         </div>
//       </div>
//     </div>
//   );
// }





















// src/features/aiInterview/components/LiveInterviewHeader.jsx

import { ArrowLeft } from "lucide-react";


const UI_STATES = {
  LOADING: "LOADING",
  ERROR: "ERROR",
  LOBBY: "LOBBY",
  CONNECTING: "CONNECTING",
  LIVE: "LIVE",
  COMPLETED: "COMPLETED",
};

const STATUS_CFG = {
  LIVE: { label: "LIVE", color: "#22c55e", pulse: true, blink: true },
  CONNECTING: { label: "CONNECTING", color: "#14b8a6", pulse: true, blink: false },
  LOADING: { label: "LOADING", color: "#7a9ab5", pulse: true, blink: false },
  LOBBY: { label: "READY TO JOIN", color: "#3b82f6", pulse: false, blink: false },
  COMPLETED: { label: "COMPLETED", color: "#22c55e", pulse: false, blink: false },
  ERROR: { label: "ERROR", color: "#ef4444", pulse: false, blink: false },
};

export function LiveInterviewHeader({ sessionId, joinStatus, uiState, onBack }) {
  let statusLabel;
  if (uiState === UI_STATES.LIVE) statusLabel = "LIVE";
  else if (uiState === UI_STATES.CONNECTING || uiState === UI_STATES.LOADING) statusLabel = "CONNECTING";
  else if (uiState === UI_STATES.LOBBY) statusLabel = "LOBBY";
  else if (uiState === UI_STATES.COMPLETED) statusLabel = "COMPLETED";
  else if (uiState === UI_STATES.ERROR) statusLabel = "ERROR";
  else statusLabel = joinStatus?.toUpperCase() || "IDLE";

  const cfg = STATUS_CFG[statusLabel] || STATUS_CFG.LOBBY;

  return (
    <>

      <header
        className="iv-glass-header"
        style={{
          background: "rgba(5,9,15,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="iv-header-inner">
          {/* Left: back + brand */}
          <div className="iv-header-left">
            <button
              onClick={onBack}
              className="iv-back-btn"
              title="Back to roles"
            >
              <ArrowLeft size={15} strokeWidth={2} />
            </button>
            <div className="iv-brand">
              <div className="iv-brand-mark">In</div>
              <span className="iv-brand-name">IntraView</span>
            </div>
            <div className="iv-header-divider" />
            <span className="iv-header-label">AI Interview Session</span>
          </div>

          {/* Center: status */}
          <div className="iv-header-center">
            <div className="iv-status-chip" style={{ borderColor: `${cfg.color}35`, background: `${cfg.color}10` }}>
              <div className="iv-status-dot-wrap">
                {cfg.pulse && (
                  <span
                    className="iv-status-ring"
                    style={{ background: cfg.color }}
                  />
                )}
                <span
                  className="iv-status-dot"
                  style={{
                    background: cfg.color,
                    animation: cfg.blink ? "iv-blink-live 1s ease infinite" : "none",
                  }}
                />
              </div>
              <span
                className="iv-status-label"
                style={{ color: cfg.color, fontFamily: "var(--ff-tech)" }}
              >
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Right: session ID */}
          <div className="iv-header-right">
            <span className="iv-session-id">
              Session{" "}
              <span style={{ color: "var(--iv-text)", fontFamily: "var(--ff-tech)", fontSize: 11 }}>
                {sessionId ? `#${sessionId.slice(0, 8)}…` : "—"}
              </span>
            </span>
          </div>
        </div>
      </header>

      <style>{`
        .iv-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 52px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }
        .iv-header-left  { display: flex; align-items: center; gap: 12px; }
        .iv-header-center { display: flex; align-items: center; justify-content: center; }
        .iv-header-right  { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }

        .iv-back-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: var(--iv-text-2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
        }
        .iv-back-btn:hover {
          border-color: var(--iv-teal);
          color: var(--iv-teal);
          background: var(--iv-teal-glow);
        }

        .iv-brand { display: flex; align-items: center; gap: 6px; }
        .iv-brand-mark {
          width: 24px; height: 24px; border-radius: 6px;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-tech); font-size: 10px; font-weight: 700;
          color: #fff;
        }
        .iv-brand-name {
          font-family: var(--ff-tech);
          font-size: 13px; font-weight: 700;
          color: var(--iv-text);
          letter-spacing: -0.2px;
        }

        .iv-header-divider {
          width: 1px; height: 16px;
          background: rgba(255,255,255,0.08);
          margin: 0 4px;
        }
        .iv-header-label {
          font-size: 11.5px; color: var(--iv-text-3);
          font-weight: 500;
        }

        .iv-status-chip {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 99px;
          border: 1px solid;
        }
        .iv-status-dot-wrap {
          position: relative;
          width: 8px; height: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .iv-status-ring {
          position: absolute; inset: -3px;
          border-radius: 50%;
          opacity: 0.5;
          animation: iv-pulse-ring 1.8s ease-out infinite;
        }
        .iv-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          flex-shrink: 0; position: relative; z-index: 1;
        }
        .iv-status-label {
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.12em;
        }

        .iv-session-id {
          font-size: 10.5px; color: var(--iv-text-3);
          font-weight: 400;
        }

        @media (max-width: 640px) {
          .iv-header-right  { display: none; }
          .iv-header-label  { display: none; }
          .iv-header-divider { display: none; }
        }
      `}</style>
    </>
  );
}