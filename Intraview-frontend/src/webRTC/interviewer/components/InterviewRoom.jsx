// /**
//  * Interview Room - Main component for video call
//  * 
//  * Orchestrates:
//  * - WebSocket signaling (useSignaling)
//  * - WebRTC peer connection (useWebRTC)
//  * - Connection quality monitoring (useConnectionQuality)
//  * - Error handling
//  */

// import { useParams } from "react-router-dom";
// import { useState, useCallback } from "react";
// import { useSignaling, SignalingState } from "../hooks/useSignaling";
// import { useWebRTC, WebRTCState } from "../hooks/useWebRTC";
// import { useConnectionQuality, QualityLevel } from "../hooks/useConnectionQuality";
// import VideoPlayer from "./VideoPlayer";
// import { logError, formatError } from "../services/errorHandler";

// export default function InterviewRoom() {
//   const { bookingId } = useParams();
//   const [error, setError] = useState(null);

//   /**
//    * Get JWT token from storage
//    */




//   /**
//    * Handle errors from signaling or WebRTC
//    */
//   const handleError = useCallback((error) => {
//     const formattedError = formatError(error);
//     setError(formattedError);
//     logError(error, { bookingId });
//   }, [bookingId]);

//   /**
//    * Initialize signaling (WebSocket)
//    */
//   const {
//     send: sendSignal,
//     signalingState,
//     error: signalingError,
//     isReconnecting,
//   } = useSignaling({
//     bookingId,
//     token: null,
//     onMessage: null, // Will be set below
//     onError: handleError,
//   });

//   /**
//    * Initialize WebRTC
//    */
//   const {
//     localVideoRef,
//     remoteVideoRef,
//     webrtcState,
//     peerJoined,
//     remoteStreamReceived,
//     isConnected,
//     isMediaReady,
//     handleOffer,
//     handleIncomingAnswer,
//     handleIceCandidate,
//     handlePeerJoined,
//     handlePeerLeft,
//   } = useWebRTC({
//     signalingService: { send: sendSignal },
//     onError: handleError,
//   });

//   /**
//    * Handle incoming signaling messages
//    * This connects signaling to WebRTC
//    */
//   const handleSignalingMessage = useCallback(
//     (message) => {
//       console.log("Handling signaling message:", message.type);

//       switch (message.type) {
//         case "peer-joined":
//           handlePeerJoined();
//           break;

//         case "peer-left":
//           handlePeerLeft();
//           break;

//         case "offer":
//           handleOffer(message.data);
//           break;

//         case "answer":
//           handleIncomingAnswer(message.data);
//           break;

//         case "ice-candidate":
//           handleIceCandidate(message.data);
//           break;

//         default:
//           console.warn("Unknown message type:", message.type);
//       }
//     },
//     [
//       handlePeerJoined,
//       handlePeerLeft,
//       handleOffer,
//       handleIncomingAnswer,
//       handleIceCandidate,
//     ]
//   );

//   /**
//    * Update signaling to use message handler
//    * (In real implementation, pass handleSignalingMessage to useSignaling)
//    */
//   // Note: You'll need to update useSignaling call above to:
//   // onMessage: handleSignalingMessage,

//   /**
//    * Monitor connection quality
//    */
//   const { quality, stats } = useConnectionQuality({
//     peerConnection: null, // Will be exposed from useWebRTC in future
//     enabled: isConnected,
//   });

//   /**
//    * Render connection status
//    */
//   const renderConnectionStatus = () => {
//     if (error && error.severity === "critical") {
//       return (
//         <div
//           style={{
//             padding: "20px",
//             backgroundColor: "#fee",
//             borderRadius: "8px",
//             marginBottom: "20px",
//           }}
//         >
//           <h3 style={{ margin: "0 0 10px 0", color: "#c00" }}>
//             {error.title}
//           </h3>
//           <p style={{ margin: "0 0 10px 0" }}>{error.message}</p>
//           {error.recovery && (
//             <div>
//               <strong>Steps to fix:</strong>
//               <ol style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
//                 {error.recovery.map((step, index) => (
//                   <li key={index}>{step}</li>
//                 ))}
//               </ol>
//             </div>
//           )}
//         </div>
//       );
//     }

//     if (signalingState === SignalingState.CONNECTING) {
//       return (
//         <div style={{ padding: "10px", textAlign: "center" }}>
//           <p>🔄 Connecting to server...</p>
//         </div>
//       );
//     }

//     if (isReconnecting) {
//       return (
//         <div
//           style={{
//             padding: "10px",
//             backgroundColor: "#fff3cd",
//             borderRadius: "8px",
//             marginBottom: "20px",
//           }}
//         >
//           <p style={{ margin: 0 }}>
//             🔄 Connection lost. Reconnecting...
//           </p>
//         </div>
//       );
//     }

//     if (webrtcState === WebRTCState.INITIALIZING_MEDIA) {
//       return (
//         <div style={{ padding: "10px", textAlign: "center" }}>
//           <p>📹 Setting up camera and microphone...</p>
//         </div>
//       );
//     }

//     if (isMediaReady && !peerJoined) {
//       return (
//         <div style={{ padding: "10px", textAlign: "center" }}>
//           <p>⏳ Waiting for other participant to join...</p>
//         </div>
//       );
//     }

//     if (peerJoined && !isConnected) {
//       return (
//         <div style={{ padding: "10px", textAlign: "center" }}>
//           <p>🔗 Connecting video...</p>
//         </div>
//       );
//     }

//     if (isConnected) {
//       return (
//         <div style={{ padding: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
//           <span style={{ fontSize: "20px" }}>✅</span>
//           <span>Connected</span>
//           {quality !== QualityLevel.UNKNOWN && (
//             <span
//               style={{
//                 marginLeft: "10px",
//                 padding: "4px 8px",
//                 borderRadius: "4px",
//                 fontSize: "12px",
//                 backgroundColor:
//                   quality === QualityLevel.EXCELLENT
//                     ? "#d4edda"
//                     : quality === QualityLevel.GOOD
//                     ? "#fff3cd"
//                     : "#f8d7da",
//                 color:
//                   quality === QualityLevel.EXCELLENT
//                     ? "#155724"
//                     : quality === QualityLevel.GOOD
//                     ? "#856404"
//                     : "#721c24",
//               }}
//             >
//               {quality.toUpperCase()}
//             </span>
//           )}
//         </div>
//       );
//     }

//     return null;
//   };

//   /**
//    * Don't render if critical error
//    */
//   if (error && error.severity === "critical") {
//     return (
//       <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
//         {renderConnectionStatus()}
//         <button
//           onClick={() => window.location.reload()}
//           style={{
//             padding: "10px 20px",
//             fontSize: "16px",
//             cursor: "pointer",
//           }}
//         >
//           Reload Page
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Interview Session</h2>

//       {/* Connection Status */}
//       {renderConnectionStatus()}

//       {/* Video Grid */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 1fr",
//           gap: "20px",
//           marginTop: "20px",
//         }}
//       >
//         {/* Local Video */}
//         <div>
//           <h3 style={{ marginBottom: "10px" }}>You</h3>
//           <VideoPlayer
//             videoRef={localVideoRef}
//             muted
//             isLocal
//             label="You"
//           />
//         </div>

//         {/* Remote Video */}
//         <div>
//           <h3 style={{ marginBottom: "10px" }}>
//             {peerJoined ? "Interviewer" : "Waiting..."}
//           </h3>
//           {peerJoined ? (
//             <VideoPlayer videoRef={remoteVideoRef} label="Interviewer" />
//           ) : (
//             <div
//               style={{
//                 backgroundColor: "#000",
//                 borderRadius: "12px",
//                 height: "400px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "#fff",
//               }}
//             >
//               Waiting for peer to join...
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Debug Info (remove in production) */}
//       {process.env.NODE_ENV === "development" && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             backgroundColor: "#f5f5f5",
//             borderRadius: "8px",
//             fontSize: "12px",
//           }}
//         >
//           <strong>Debug Info:</strong>
//           <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
//             <li>Signaling: {signalingState}</li>
//             <li>WebRTC: {webrtcState}</li>
//             <li>Peer Joined: {peerJoined ? "Yes" : "No"}</li>
//             <li>Connected: {isConnected ? "Yes" : "No"}</li>
//             <li>Remote Stream: {remoteStreamReceived ? "Yes" : "No"}</li>
//             {isConnected && (
//               <>
//                 <li>Quality: {quality}</li>
//                 <li>Packet Loss: {stats.packetLoss}%</li>
//                 <li>Jitter: {stats.jitter}ms</li>
//                 <li>Latency: {stats.latency}ms</li>
//                 <li>Bitrate: {stats.bitrate} kbps</li>
//               </>
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }



























import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useSignaling, SignalingState } from "../hooks/useSignaling";
import { useWebRTC, WebRTCState } from "../hooks/useWebRTC";
import { useConnectionQuality, QualityLevel } from "../hooks/useConnectionQuality";
import VideoPlayer from "./VideoPlayer";
import { logError, formatError } from "../services/errorHandler";
import { getBookingDetails } from "../services/interviewApi";

export default function InterviewRoom() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Handle errors from signaling or WebRTC
   */
  const handleError = useCallback((error) => {
    const formattedError = formatError(error);
    setError(formattedError);
    logError(error, { bookingId });
  }, [bookingId]);

  /**
   * Fetch booking details on mount
   */
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      
      const result = await getBookingDetails(bookingId);
      
      if (result.success) {
        setBookingData(result.data);
        setRole(result.data.user_role);
        console.log("✅ Booking loaded:", result.data);
        console.log("👤 Your role:", result.data.user_role);
      } else {
        handleError({
          type: "booking-not-found",
          message: result.error,
        });
      }
      
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId, handleError]);

  /**
   * Initialize signaling (WebSocket)
   */
  const handleSignalingMessage = useCallback((message) => {
    console.log("📨 Signaling message:", message.type);
    // Will be wired to WebRTC below
  }, []);

  const {
  socket, // ✅ Get socket from useSignaling
  send: sendSignal,
  signalingState,
  isReconnecting,
} = useSignaling({
  bookingId,
  token: null,
  onMessage: handleSignalingMessage,
  onError: handleError,
});

  /**
   * Initialize WebRTC
   */
  const {
    localVideoRef,
    remoteVideoRef,
    webrtcState,
    peerJoined,
    remoteStreamReceived,
    isConnected,
    isMediaReady,
    handleOffer,
    handleIncomingAnswer,
    handleIceCandidate,
    handlePeerJoined,
    handlePeerLeft,
  } = useWebRTC({
  socket: socket, // ✅ Pass socket directly
  role: role, // ✅ Pass role
  onError: handleError,
});

  /**
   * Wire signaling messages to WebRTC handlers
   */
  useEffect(() => {
    const handler = (message) => {
      switch (message.type) {
        case "peer-joined":
          handlePeerJoined();
          break;
        case "peer-left":
          handlePeerLeft();
          break;
        case "offer":
          handleOffer(message.data);
          break;
        case "answer":
          handleIncomingAnswer(message.data);
          break;
        case "ice-candidate":
          handleIceCandidate(message.data);
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    };

    // Update the signaling callback
    handleSignalingMessage.current = handler;
  }, [handlePeerJoined, handlePeerLeft, handleOffer, handleIncomingAnswer, handleIceCandidate]);

  /**
   * Monitor connection quality
   */
  const { quality, stats } = useConnectionQuality({
    peerConnection: null, // Will expose from useWebRTC later
    enabled: isConnected,
  });

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading Interview Room...</h2>
        <p>Please wait...</p>
      </div>
    );
  }

  /**
   * Critical error state
   */
  if (error && error.severity === "critical") {
    return (
      <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fee",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#c00" }}>
            {error.title}
          </h3>
          <p style={{ margin: "0 0 10px 0" }}>{error.message}</p>
          {error.recovery && (
            <div>
              <strong>Steps to fix:</strong>
              <ol style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
                {error.recovery.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Reload Page
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  /**
   * No booking data
   */
  if (!bookingData) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Failed to load booking details</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  /**
   * Render connection status banner
   */
  const renderConnectionStatus = () => {
    if (signalingState === SignalingState.CONNECTING) {
      return (
        <div style={{ padding: "10px", textAlign: "center", backgroundColor: "#e3f2fd" }}>
          <p style={{ margin: 0 }}>🔄 Connecting to server...</p>
        </div>
      );
    }

    if (isReconnecting) {
      return (
        <div style={{ padding: "10px", backgroundColor: "#fff3cd" }}>
          <p style={{ margin: 0 }}>🔄 Connection lost. Reconnecting...</p>
        </div>
      );
    }

    if (webrtcState === WebRTCState.INITIALIZING_MEDIA) {
      return (
        <div style={{ padding: "10px", textAlign: "center", backgroundColor: "#e8f5e9" }}>
          <p style={{ margin: 0 }}>📹 Setting up camera and microphone...</p>
        </div>
      );
    }

    if (isMediaReady && !peerJoined) {
      return (
        <div style={{ padding: "10px", textAlign: "center", backgroundColor: "#fff3cd" }}>
          <p style={{ margin: 0 }}>⏳ Waiting for {role === "candidate" ? "interviewer" : "candidate"} to join...</p>
        </div>
      );
    }

    if (peerJoined && !isConnected) {
      return (
        <div style={{ padding: "10px", textAlign: "center", backgroundColor: "#e3f2fd" }}>
          <p style={{ margin: 0 }}>🔗 Connecting video...</p>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div
          style={{
            padding: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#d4edda",
          }}
        >
          <span style={{ fontSize: "20px" }}>✅</span>
          <span>Connected</span>
          {quality !== QualityLevel.UNKNOWN && (
            <span
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                backgroundColor:
                  quality === QualityLevel.EXCELLENT
                    ? "#155724"
                    : quality === QualityLevel.GOOD
                    ? "#856404"
                    : "#721c24",
                color: "white",
              }}
            >
              {quality.toUpperCase()}
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  const peerName = role === "candidate" 
    ? bookingData.interviewer.name 
    : bookingData.candidate.name;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Interview Session</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Duration: {bookingData.duration_minutes} minutes | 
        Your role: <strong>{role}</strong>
      </p>

      {/* Connection Status */}
      {renderConnectionStatus()}

      {/* Video Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Local Video */}
        <div>
          <h3 style={{ marginBottom: "10px" }}>You</h3>
          <VideoPlayer videoRef={localVideoRef} muted isLocal label="You" />
        </div>

        {/* Remote Video */}
        <div>
          <h3 style={{ marginBottom: "10px" }}>
            {peerJoined ? peerName : "Waiting..."}
          </h3>
          {peerJoined ? (
            <VideoPlayer videoRef={remoteVideoRef} label={peerName} />
          ) : (
            <div
              style={{
                backgroundColor: "#000",
                borderRadius: "12px",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              Waiting for {role === "candidate" ? "interviewer" : "candidate"} to join...
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        >
          <strong>Debug Info:</strong>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            <li>Booking ID: {bookingData.id}</li>
            <li>Role: {role}</li>
            <li>Status: {bookingData.status}</li>
            <li>Signaling: {signalingState}</li>
            <li>WebRTC: {webrtcState}</li>
            <li>Peer Joined: {peerJoined ? "Yes" : "No"}</li>
            <li>Connected: {isConnected ? "Yes" : "No"}</li>
            {isConnected && (
              <>
                <li>Quality: {quality}</li>
                <li>Packet Loss: {stats.packetLoss}%</li>
                <li>Jitter: {stats.jitter}ms</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
