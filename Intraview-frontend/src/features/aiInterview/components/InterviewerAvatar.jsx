import { useEffect, useState } from "react";
import { ParticipantTile } from "@livekit/components-react";

import { useInterviewerParticipant } from "../hooks/useInterviewerParticipant";

export function InterviewerAvatar({ avatarSession, avatarError }) {
  const { interviewerTrack } = useInterviewerParticipant(avatarSession);
  const [showFallback, setShowFallback] = useState(Boolean(avatarError));

  useEffect(() => {
    setShowFallback(Boolean(avatarError));
  }, [avatarError]);

  useEffect(() => {
    if (interviewerTrack) {
      setShowFallback(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowFallback(true);
    }, 12000);

    return () => window.clearTimeout(timeoutId);
  }, [interviewerTrack]);

  if (interviewerTrack) {
    return (
      <div className="relative h-full w-full rounded-[28px] overflow-hidden border border-teal-500/30 bg-slate-950 shadow-[0_24px_80px_rgba(8,145,178,0.12)]">
        <ParticipantTile trackRef={interviewerTrack} />
        <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-slate-950/80 px-3 py-1.5 text-[11px] font-semibold text-teal-100 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          AI Interviewer
        </div>
      </div>
    );
  }

  if (showFallback) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-100">
            Visual interviewer unavailable
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-slate-400">
            {avatarError ||
              "The interview will continue with the existing voice interviewer while Tavus reconnects."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-300">
        <svg
          className="h-8 w-8 animate-pulse"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-100">
          Connecting visual interviewer
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-slate-400">
          Tavus is joining the room and syncing with the existing interviewer audio.
        </p>
      </div>
    </div>
  );
}
