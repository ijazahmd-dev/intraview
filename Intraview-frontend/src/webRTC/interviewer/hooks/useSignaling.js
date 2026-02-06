/**
 * Signaling Hook - Manages WebSocket connection with automatic reconnection
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state tracking
 * - Message queue during disconnection
 * - Error handling with user-friendly codes
 * - Clean separation from WebRTC logic
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { ReconnectionManager } from "../utils/reconnectionManager";

/**
 * WebSocket connection states
 */
export const SignalingState = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  FAILED: "failed",
};

/**
 * User-friendly error messages mapped from WebSocket close codes
 */
const ERROR_MESSAGES = {
  4001: "Authentication failed. Please log in again.",
  4003: "You are not authorized to join this interview.",
  4004: "Interview not found.",
  4009: "Interview is not available at this time.",
  1006: "Connection lost. Attempting to reconnect...",
};

export function useSignaling({
  bookingId,
  token,
  onMessage,
  onError,
  onStateChange,
}) {
  const socketRef = useRef(null);
  const reconnectionManagerRef = useRef(null);
  const messageQueueRef = useRef([]);
  const intentionalCloseRef = useRef(false);

  const [signalingState, setSignalingState] = useState(SignalingState.DISCONNECTED);
  const [error, setError] = useState(null);

  /**
   * Build WebSocket URL based on environment
   */
  const getWebSocketUrl = useCallback(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = "localhost:8000"; 
    return `${wsProtocol}//${wsHost}/ws/interview/${bookingId}/`;
}, [bookingId]);

  /**
   * Update signaling state and notify parent
   */
  const updateState = useCallback((newState) => {
    setSignalingState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  /**
   * Send message through WebSocket
   * Queues message if currently disconnected
   */
  const send = useCallback((message) => {
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = typeof message === "string" ? message : JSON.stringify(message);
      socket.send(payload);
      console.log("Sent message:", message.type || "unknown");
    } else {
      console.warn("WebSocket not ready, queueing message:", message.type);
      messageQueueRef.current.push(message);
    }
  }, []);

  /**
   * Flush queued messages after reconnection
   */
  const flushMessageQueue = useCallback(() => {
    const queue = messageQueueRef.current;
    if (queue.length === 0) return;

    console.log(`Flushing ${queue.length} queued messages`);
    queue.forEach((message) => send(message));
    messageQueueRef.current = [];
  }, [send]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    // Don't create duplicate connections
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      console.log("WebSocket already exists, skipping connection");
      return;
    }

    const wsUrl = getWebSocketUrl();
    console.log("Connecting to WebSocket:", wsUrl);

    updateState(
      reconnectionManagerRef.current?.isActive()
        ? SignalingState.RECONNECTING
        : SignalingState.CONNECTING
    );

    const socket = new WebSocket(wsUrl);

    // ✅ Connection opened
    socket.onopen = () => {
      console.log("WebSocket connected");
      socketRef.current = socket;
      updateState(SignalingState.CONNECTED);
      setError(null);

      // Reset reconnection manager
      if (reconnectionManagerRef.current) {
        reconnectionManagerRef.current.reset();
      }

      // Flush any queued messages
      flushMessageQueue();
    };

    // ✅ Message received
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message.type || "unknown");

        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    // ❌ Connection error
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      updateState(SignalingState.FAILED);

      const errorMsg = "Connection error occurred";
      setError(errorMsg);

      if (onError) {
        onError({
          type: "websocket-error",
          message: errorMsg,
          raw: error,
        });
      }
    };

    // 🚪 Connection closed
    socket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);

      // Clear socket reference
      socketRef.current = null;

      // If intentional close, don't reconnect
      if (intentionalCloseRef.current) {
        console.log("Intentional close, not reconnecting");
        updateState(SignalingState.DISCONNECTED);
        return;
      }

      // Map close code to user-friendly message
      const errorMsg = ERROR_MESSAGES[event.code] || "Connection lost";
      setError(errorMsg);

      if (onError) {
        onError({
          type: "websocket-closed",
          code: event.code,
          message: errorMsg,
        });
      }

      // Attempt reconnection
      if (!reconnectionManagerRef.current) {
        reconnectionManagerRef.current = new ReconnectionManager();
      }

      const scheduled = reconnectionManagerRef.current.scheduleReconnect(() => {
        connect();
      });

      if (scheduled) {
        updateState(SignalingState.RECONNECTING);
      } else {
        updateState(SignalingState.FAILED);
        if (onError) {
          onError({
            type: "max-retries-exceeded",
            message: "Failed to reconnect after multiple attempts",
          });
        }
      }
    };

    socketRef.current = socket;
  }, [getWebSocketUrl, updateState, flushMessageQueue, onMessage, onError]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    console.log("Disconnecting WebSocket");
    intentionalCloseRef.current = true;

    // Cancel any pending reconnection
    if (reconnectionManagerRef.current) {
      reconnectionManagerRef.current.cancel();
    }

    // Close socket
    if (socketRef.current) {
      socketRef.current.close(1000, "Client disconnect");
      socketRef.current = null;
    }

    updateState(SignalingState.DISCONNECTED);
  }, [updateState]);

  /**
   * Initialize connection on mount
   */

  // useEffect(() => {
  //   if (!bookingId || !token) {
  //     console.warn("Missing bookingId or token, skipping WebSocket connection");
  //     return;
  //   }

  //   intentionalCloseRef.current = false;
  //   connect();

  //   return () => {
  //     disconnect();
  //   };
  // }, [bookingId, token]);


  useEffect(() => {
    if (!bookingId) {
    console.warn("Missing bookingId, skipping WebSocket connection");
    return;
  }

  intentionalCloseRef.current = false;
  connect();

  return () => {
    disconnect();
  };
}, [bookingId]);  // Note: connect/disconnect not in deps to avoid recreating

  return {
    send,
    disconnect,
    signalingState,
    error,
    isConnected: signalingState === SignalingState.CONNECTED,
    isReconnecting: signalingState === SignalingState.RECONNECTING,
  };
}
