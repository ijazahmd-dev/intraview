import { useParticipants, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export function useInterviewerParticipant(avatarSession) {
  const participants = useParticipants();
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const expectedIdentity = avatarSession?.avatar_participant_identity || "";
  const expectedName = avatarSession?.avatar_participant_name || "";

  const interviewerParticipant =
    participants.find((participant) => {
      if (participant.isLocal) return false;
      if (expectedIdentity && participant.identity === expectedIdentity) return true;
      if (expectedName && participant.name === expectedName) return true;
      return false;
    }) ||
    participants.find((participant) => !participant.isLocal && participant.identity?.startsWith("agent:")) ||
    null;

  const interviewerTrack =
    cameraTracks.find((trackRef) => {
      if (!interviewerParticipant) return false;
      return trackRef.participant?.identity === interviewerParticipant.identity;
    }) || null;

  const candidateTracks = cameraTracks.filter(
    (trackRef) => trackRef.participant?.isLocal
  );

  return {
    interviewerParticipant,
    interviewerTrack,
    candidateTracks,
    isInterviewerPresent: interviewerParticipant !== null,
  };
}
