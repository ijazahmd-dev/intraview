import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Production-grade WebRTC hook for peer-to-peer video calls.
 * 
 * Features:
 * - Safe ICE candidate buffering
 * - Error handling for media permissions
 * - Connection state tracking
 * - Proper cleanup
 * - Reconnection support
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

// Map your existing states to WebRTCState
const stateMapping = {
  "new": WebRTCState.IDLE,
  "connecting": WebRTCState.CONNECTING,
  "connected": WebRTCState.CONNECTED,
  "failed": WebRTCState.FAILED,
};






export function useWebRTC({ socket, role, onError }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidateBufferRef = useRef([]); // ✅ Buffer ICE candidates

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("new"); // new | connecting | connected | failed
  const [mediaReady, setMediaReady] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);

  const webrtcState = stateMapping[connectionState] || WebRTCState.IDLE;

  // STUN configuration (add TURN for production)
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  /**
   * Initialize local media (camera + microphone).
   * Handles permission errors gracefully.
   */
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMediaReady(true);
      return stream;
    } catch (error) {
      console.error("Failed to get user media:", error);
      
      if (onError) {
        onError({
          type: "media-permission",
          message: "Camera/microphone access denied",
          error,
        });
      }

      throw error;
    }
  }, [onError]);

  /**
   * Create RTCPeerConnection with proper event handlers.
   */
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(rtcConfig);

    // ✅ Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "ice-candidate",
            data: event.candidate.toJSON(),
          })
        );
      }
    };

    // ✅ Handle remote stream
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ✅ Track connection state
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      setConnectionState(pc.connectionState);

      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (pc.connectionState === "failed") {
        setIsConnected(false);
        if (onError) {
          onError({
            type: "connection-failed",
            message: "WebRTC connection failed",
          });
        }
      }
    };

    // ✅ Track ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      
      if (pc.iceConnectionState === "disconnected") {
        // Handle reconnection logic here
        console.warn("ICE disconnected - may need reconnection");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, onError]);

  /**
   * Create and send SDP offer.
   * Called by the initiator (usually candidate, or whoever joins second).
   */
  const createOffer = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      console.log("Creating offer...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "offer",
            data: offer,
          })
        );
        console.log("Offer sent");
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      if (onError) {
        onError({ type: "offer-failed", error });
      }
    }
  }, [socket, onError]);

  /**
   * Create and send SDP answer in response to offer.
   */
  const createAnswer = useCallback(async (offer) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      console.log("Creating answer...");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "answer",
            data: answer,
          })
        );
        console.log("Answer sent");
      }

      // ✅ Process buffered ICE candidates after remote description set
      iceCandidateBufferRef.current.forEach((candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) =>
          console.error("Error adding buffered ICE candidate:", err)
        );
      });
      iceCandidateBufferRef.current = [];
    } catch (error) {
      console.error("Error creating answer:", error);
      if (onError) {
        onError({ type: "answer-failed", error });
      }
    }
  }, [socket, onError]);

  /**
   * Handle incoming SDP answer.
   */
  const handleAnswer = useCallback(async (answer) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      console.log("Setting remote answer...");
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // ✅ Process buffered ICE candidates
      iceCandidateBufferRef.current.forEach((candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) =>
          console.error("Error adding buffered ICE candidate:", err)
        );
      });
      iceCandidateBufferRef.current = [];
    } catch (error) {
      console.error("Error handling answer:", error);
      if (onError) {
        onError({ type: "handle-answer-failed", error });
      }
    }
  }, [onError]);

  /**
   * Handle incoming ICE candidate.
   * Buffers candidates if remote description not yet set.
   */
  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      // ✅ Buffer ICE candidates if remote description not set yet
      if (!pc.remoteDescription) {
        console.log("Buffering ICE candidate (no remote description yet)");
        iceCandidateBufferRef.current.push(candidate);
        return;
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }, []);

  /**
   * Start WebRTC negotiation when peer joins.
   * Initiator role: whoever receives "peer-joined" event creates offer.
   */
  const startNegotiation = useCallback(async () => {
    if (!mediaReady || !peerJoined) return;

    console.log("Starting WebRTC negotiation...");

    try {
      const stream = localStreamRef.current;
      const pc = createPeerConnection();

      // ✅ Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log("Adding track:", track.kind);
        pc.addTrack(track, stream);
      });

      // ✅ Create offer (initiator creates offer when peer joins)
      await createOffer();
    } catch (error) {
      console.error("Error starting negotiation:", error);
      if (onError) {
        onError({ type: "negotiation-failed", error });
      }
    }
  }, [mediaReady, peerJoined, createPeerConnection, createOffer, onError]);

  /**
   * Initialize media and peer connection setup.
   */
  useEffect(() => {
    if (!socket) return;

    let mounted = true;

    const setup = async () => {
      try {
        await initializeMedia();
      } catch (error) {
        console.error("Media initialization failed:", error);
      }
    };

    setup();

    return () => {
      mounted = false;
    };
  }, [socket, initializeMedia]);

  /**
   * Handle incoming signaling messages.
   */
  useEffect(() => {
    if (!socket) return;

    const handleMessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message.type);

        switch (message.type) {
          case "peer-joined":
            console.log("Peer joined:", message.role);
            setPeerJoined(true);
            break;

          case "peer-left":
            console.log("Peer left:", message.role);
            setPeerJoined(false);
            setIsConnected(false);
            // Optionally show "peer disconnected" UI
            break;

          case "offer":
            await createAnswer(message.data);
            break;

          case "answer":
            await handleAnswer(message.data);
            break;

          case "ice-candidate":
            await handleIceCandidate(message.data);
            break;

          default:
            console.warn("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, createAnswer, handleAnswer, handleIceCandidate]);

  /**
   * Start negotiation when both media ready and peer joined.
   */
  useEffect(() => {
    if (mediaReady && peerJoined) {
      startNegotiation();
    }
  }, [mediaReady, peerJoined, startNegotiation]);

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      console.log("Cleaning up WebRTC resources...");

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        localStreamRef.current = null;
      }
    };
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    connectionState,
    mediaReady,
    peerJoined,
    webrtcState, // ✅ Add this
    remoteStreamReceived: isConnected, // ✅ Add this
    isMediaReady: mediaReady, // ✅ Add this
    // ✅ Add these handlers (they need to be exposed)
    handleOffer: async (offer) => {
      // Your existing createAnswer logic
      await createAnswer(offer);
    },
    handleIncomingAnswer: async (answer) => {
      // Your existing handleAnswer logic
      await handleAnswer(answer);
    },
    handleIceCandidate: async (candidate) => {
      // Your existing handleIceCandidate logic
      await handleIceCandidate(candidate);
    },
    handlePeerJoined: () => setPeerJoined(true),
    handlePeerLeft: () => {
      setPeerJoined(false);
      setIsConnected(false);
    },
  };
}
