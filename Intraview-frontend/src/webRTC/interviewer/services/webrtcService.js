/**
 * WebRTC Hook - Production-grade peer connection management
 * 
 * Features:
 * - Robust media initialization with error handling
 * - ICE candidate buffering (prevents race conditions)
 * - Clear connection state tracking
 * - Proper cleanup on unmount
 * - Integration with signaling layer
 * - Reconnection-ready architecture
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getUserMedia,
  createPeerConnection,
  addTracksToConnection,
  stopMediaStream,
  closePeerConnection,
  createOffer,
  createAnswer,
  handleAnswer,
  addIceCandidate,
} from "../services/webrtcService";

/**
 * WebRTC connection states
 */
export const WebRTCState = {
  IDLE: "idle",
  INITIALIZING_MEDIA: "initializing-media",
  MEDIA_READY: "media-ready",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  FAILED: "failed",
};

export function useWebRTC({ signalingService, onError }) {
  // Refs for WebRTC objects
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const sendersRef = useRef([]);
  const iceCandidateBufferRef = useRef([]);

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // State
  const [webrtcState, setWebrtcState] = useState(WebRTCState.IDLE);
  const [peerJoined, setPeerJoined] = useState(false);
  const [remoteStreamReceived, setRemoteStreamReceived] = useState(false);

  /**
   * Initialize local media (camera + microphone)
   */
  const initializeMedia = useCallback(async () => {
    if (localStreamRef.current) {
      console.log("Media already initialized");
      return localStreamRef.current;
    }

    setWebrtcState(WebRTCState.INITIALIZING_MEDIA);

    try {
      const stream = await getUserMedia();
      localStreamRef.current = stream;

      // Attach to video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setWebrtcState(WebRTCState.MEDIA_READY);
      console.log("Local media initialized successfully");

      return stream;
    } catch (error) {
      console.error("Media initialization failed:", error);
      setWebrtcState(WebRTCState.FAILED);

      if (onError) {
        onError({
          type: error.type || "media-error",
          message: error.message,
          stage: "media-initialization",
        });
      }

      throw error;
    }
  }, [onError]);

  /**
   * Setup peer connection with event handlers
   */
  const setupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      console.log("Peer connection already exists");
      return peerConnectionRef.current;
    }

    console.log("Setting up peer connection");
    const pc = createPeerConnection();

    // ✅ Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingService) {
        signalingService.send({
          type: "ice-candidate",
          data: event.candidate.toJSON(),
        });
        console.log("ICE candidate sent");
      }
    };

    // ✅ Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);

      switch (pc.iceConnectionState) {
        case "failed":
        case "disconnected":
          console.warn("ICE connection issue detected");
          if (onError) {
            onError({
              type: "ice-connection-failed",
              message: "Connection quality degraded",
              stage: "ice-connection",
            });
          }
          break;
        case "closed":
          setWebrtcState(WebRTCState.DISCONNECTED);
          break;
        default:
          break;
      }
    };

    // ✅ Handle overall connection state
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);

      switch (pc.connectionState) {
        case "connecting":
          setWebrtcState(WebRTCState.CONNECTING);
          break;
        case "connected":
          setWebrtcState(WebRTCState.CONNECTED);
          console.log("✅ WebRTC connection established");
          break;
        case "disconnected":
          setWebrtcState(WebRTCState.DISCONNECTED);
          break;
        case "failed":
          setWebrtcState(WebRTCState.FAILED);
          if (onError) {
            onError({
              type: "connection-failed",
              message: "Video connection failed",
              stage: "peer-connection",
            });
          }
          break;
        case "closed":
          setWebrtcState(WebRTCState.DISCONNECTED);
          break;
        default:
          break;
      }
    };

    // ✅ Handle remote track (peer's video/audio)
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind);

      if (event.streams && event.streams[0]) {
        // Attach remote stream to video element
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteStreamReceived(true);
          console.log("Remote stream attached to video element");
        }
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [signalingService, onError]);

  /**
   * Add local tracks to peer connection
   */
  const addLocalTracks = useCallback(() => {
    const pc = peerConnectionRef.current;
    const stream = localStreamRef.current;

    if (!pc || !stream) {
      console.error("Cannot add tracks: PC or stream missing");
      return;
    }

    console.log("Adding local tracks to peer connection");
    const senders = addTracksToConnection(pc, stream);
    sendersRef.current = senders;
  }, []);

  /**
   * Start negotiation (create offer)
   */
  const startNegotiation = useCallback(async () => {
    const pc = peerConnectionRef.current;

    if (!pc) {
      console.error("Cannot start negotiation: no peer connection");
      return;
    }

    try {
      console.log("Starting negotiation (creating offer)");
      const offer = await createOffer(pc);

      // Send offer via signaling
      if (signalingService) {
        signalingService.send({
          type: "offer",
          data: offer,
        });
        console.log("Offer sent via signaling");
      }
    } catch (error) {
      console.error("Negotiation failed:", error);
      if (onError) {
        onError({
          type: "negotiation-failed",
          message: error.message,
          stage: "offer-creation",
        });
      }
    }
  }, [signalingService, onError]);

  /**
   * Handle incoming offer (create answer)
   */
  const handleOffer = useCallback(
    async (offer) => {
      const pc = peerConnectionRef.current;

      if (!pc) {
        console.error("Cannot handle offer: no peer connection");
        return;
      }

      try {
        console.log("Handling incoming offer");
        const answer = await createAnswer(pc, offer);

        // Send answer via signaling
        if (signalingService) {
          signalingService.send({
            type: "answer",
            data: answer,
          });
          console.log("Answer sent via signaling");
        }

        // Flush buffered ICE candidates
        flushIceCandidates();
      } catch (error) {
        console.error("Failed to handle offer:", error);
        if (onError) {
          onError({
            type: "answer-failed",
            message: error.message,
            stage: "answer-creation",
          });
        }
      }
    },
    [signalingService, onError]
  );

  /**
   * Handle incoming answer
   */
  const handleIncomingAnswer = useCallback(
    async (answer) => {
      const pc = peerConnectionRef.current;

      if (!pc) {
        console.error("Cannot handle answer: no peer connection");
        return;
      }

      try {
        console.log("Handling incoming answer");
        await handleAnswer(pc, answer);

        // Flush buffered ICE candidates
        flushIceCandidates();
      } catch (error) {
        console.error("Failed to handle answer:", error);
        if (onError) {
          onError({
            type: "handle-answer-failed",
            message: error.message,
            stage: "answer-handling",
          });
        }
      }
    },
    [onError]
  );

  /**
   * Handle incoming ICE candidate
   * Buffers if remote description not yet set
   */
  const handleIceCandidate = useCallback(
    async (candidate) => {
      const pc = peerConnectionRef.current;

      if (!pc) {
        console.error("Cannot handle ICE candidate: no peer connection");
        return;
      }

      // Buffer ICE candidates if remote description not set yet
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        console.log("Buffering ICE candidate (no remote description yet)");
        iceCandidateBufferRef.current.push(candidate);
        return;
      }

      // Add ICE candidate immediately
      try {
        await addIceCandidate(pc, candidate);
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    },
    []
  );

  /**
   * Flush buffered ICE candidates after remote description is set
   */
  const flushIceCandidates = useCallback(() => {
    const pc = peerConnectionRef.current;
    const buffer = iceCandidateBufferRef.current;

    if (!pc || buffer.length === 0) return;

    console.log(`Flushing ${buffer.length} buffered ICE candidates`);

    buffer.forEach(async (candidate) => {
      try {
        await addIceCandidate(pc, candidate);
      } catch (error) {
        console.error("Failed to add buffered ICE candidate:", error);
      }
    });

    // Clear buffer
    iceCandidateBufferRef.current = [];
  }, []);

  /**
   * Handle peer joined event
   */
  const handlePeerJoined = useCallback(() => {
    console.log("Peer joined - preparing to negotiate");
    setPeerJoined(true);
  }, []);

  /**
   * Handle peer left event
   */
  const handlePeerLeft = useCallback(() => {
    console.log("Peer left");
    setPeerJoined(false);
    setRemoteStreamReceived(false);

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  /**
   * Initialize media on mount
   */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await initializeMedia();
      } catch (error) {
        console.error("Failed to initialize media:", error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [initializeMedia]);

  /**
   * Setup peer connection when media is ready
   */
  useEffect(() => {
    if (webrtcState === WebRTCState.MEDIA_READY && !peerConnectionRef.current) {
      setupPeerConnection();
      addLocalTracks();
    }
  }, [webrtcState, setupPeerConnection, addLocalTracks]);

  /**
   * Start negotiation when peer joins
   */
  useEffect(() => {
    if (
      peerJoined &&
      webrtcState === WebRTCState.MEDIA_READY &&
      peerConnectionRef.current
    ) {
      console.log("Both conditions met - starting negotiation");
      startNegotiation();
    }
  }, [peerJoined, webrtcState, startNegotiation]);

  /**
   * Subscribe to signaling messages
   */
  useEffect(() => {
    if (!signalingService) return;

    // This will be handled by InterviewRoom in Part 3
    // For now, we expose handlers that Room will call
  }, [signalingService]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log("Cleaning up WebRTC resources");

      // Stop local stream
      stopMediaStream(localStreamRef.current);
      localStreamRef.current = null;

      // Close peer connection
      closePeerConnection(peerConnectionRef.current);
      peerConnectionRef.current = null;

      // Clear refs
      sendersRef.current = [];
      iceCandidateBufferRef.current = [];
    };
  }, []);

  return {
    // Video element refs
    localVideoRef,
    remoteVideoRef,

    // State
    webrtcState,
    peerJoined,
    remoteStreamReceived,
    isConnected: webrtcState === WebRTCState.CONNECTED,
    isMediaReady: webrtcState === WebRTCState.MEDIA_READY || webrtcState === WebRTCState.CONNECTED,

    // Handlers (to be called by InterviewRoom based on signaling messages)
    handleOffer,
    handleIncomingAnswer,
    handleIceCandidate,
    handlePeerJoined,
    handlePeerLeft,
  };
}
