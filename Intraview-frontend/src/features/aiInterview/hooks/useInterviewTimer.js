// // src/features/aiInterview/hooks/useInterviewTimer.js

// import { useEffect, useRef, useState } from "react";

// /**
//  * Manages the countdown timer for a live interview session.
//  *
//  * - Starts only when uiState is "LIVE".
//  * - Calls onExpire when countdown reaches 0.
//  * - Returns formattedTimeLeft string and raw timeLeftSec.
//  */
// export function useInterviewTimer({ uiState, initialSeconds, onExpire }) {
//   const [timeLeftSec, setTimeLeftSec] = useState(initialSeconds ?? null);
//   const hasExpiredRef = useRef(false);

//   // Sync initial value when join data loads
//   useEffect(() => {
//     if (initialSeconds !== null && initialSeconds !== undefined) {
//       setTimeLeftSec(initialSeconds);
//       hasExpiredRef.current = false;
//     }
//   }, [initialSeconds]);

//   // Countdown tick — only while LIVE
//   useEffect(() => {
//     if (uiState !== "LIVE") return;
//     if (timeLeftSec === null) return;

//     const interval = setInterval(() => {
//       setTimeLeftSec((prev) => {
//         if (prev === null) return prev;

//         if (prev <= 1) {
//           clearInterval(interval);
//           if (!hasExpiredRef.current) {
//             hasExpiredRef.current = true;
//             onExpire?.();
//           }
//           return 0;
//         }

//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [uiState, timeLeftSec === null]);

//   const formattedTimeLeft =
//     timeLeftSec !== null
//       ? `${Math.floor(timeLeftSec / 60)
//           .toString()
//           .padStart(2, "0")}:${(timeLeftSec % 60).toString().padStart(2, "0")}`
//       : null;

//   return { timeLeftSec, setTimeLeftSec, formattedTimeLeft };
// }



























// src/features/aiInterview/hooks/useInterviewTimer.js

import { useEffect, useRef, useState } from "react";

export function useInterviewTimer({ uiState, initialSeconds, onExpire }) {
  const [timeLeftSec, setTimeLeftSec] = useState(initialSeconds ?? null);
  const hasExpiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Always keep the ref pointing to the latest onExpire function
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Sync initial value when join data loads
  useEffect(() => {
    if (initialSeconds !== null && initialSeconds !== undefined) {
      setTimeLeftSec(initialSeconds);
      hasExpiredRef.current = false;
    }
  }, [initialSeconds]);

  // Countdown tick — only while LIVE
  useEffect(() => {
    if (uiState !== "LIVE") return;
    if (timeLeftSec === null) return;

    const interval = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev === null) return prev;

        if (prev <= 1) {
          clearInterval(interval);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpireRef.current?.(); // ← uses ref, always the latest function
          }
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [uiState, timeLeftSec === null]); // ← onExpire intentionally NOT here, using ref instead

  const formattedTimeLeft =
    timeLeftSec !== null
      ? `${Math.floor(timeLeftSec / 60)
          .toString()
          .padStart(2, "0")}:${(timeLeftSec % 60).toString().padStart(2, "0")}`
      : null;

  return { timeLeftSec, setTimeLeftSec, formattedTimeLeft };
}