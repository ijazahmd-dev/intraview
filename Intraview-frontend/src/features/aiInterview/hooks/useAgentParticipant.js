// src/features/aiInterview/hooks/useAgentParticipant.js

import { useTracks, useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";

/**
 * Identifies which participant is the AI agent and which is the local candidate.
 *
 * The agent is identified by:
 *   1. participant.identity starts with "agent:"
 *   2. OR participant.metadata parsed as JSON has name === "AI Interviewer"
 *
 * Returns:
 *   agentTracks   — camera tracks belonging to the agent participant
 *   candidateTracks — camera tracks belonging to the local candidate
 *   agentParticipant — the agent Participant object (or null)
 *   isAgentPresent — boolean
 */
export function useAgentParticipant() {
  const participants = useParticipants();

  const allTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const agentParticipant =
    participants.find((p) => {
      if (p.identity?.startsWith("agent:")) return true;
      try {
        const meta = JSON.parse(p.metadata ?? "{}");
        return meta?.name === "AI Interviewer";
      } catch {
        return false;
      }
    }) ?? null;

  const isAgentPresent = agentParticipant !== null;

  const agentTracks = allTracks.filter(
    (t) =>
      agentParticipant &&
      t.participant?.identity === agentParticipant.identity
  );

  const candidateTracks = allTracks.filter(
    (t) =>
      !agentParticipant ||
      t.participant?.identity !== agentParticipant.identity
  );

  return {
    agentTracks,
    candidateTracks,
    agentParticipant,
    isAgentPresent,
  };
}