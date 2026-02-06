/**
 * Error Handler Service
 * 
 * Centralized error handling with user-friendly messages
 * and recovery suggestions.
 */

/**
 * Error types and their user-facing information
 */
export const ErrorTypes = {
  // Media errors
  PERMISSION_DENIED: {
    title: "Camera/Microphone Access Denied",
    message: "Please allow camera and microphone access to join the interview.",
    recovery: [
      "Click the camera icon in your browser's address bar",
      "Select 'Allow' for camera and microphone",
      "Refresh the page",
    ],
    severity: "critical",
  },
  DEVICE_NOT_FOUND: {
    title: "Camera or Microphone Not Found",
    message: "No camera or microphone detected.",
    recovery: [
      "Connect a camera or microphone",
      "Check device connections",
      "Ensure no other app is using the devices",
      "Refresh the page",
    ],
    severity: "critical",
  },
  DEVICE_IN_USE: {
    title: "Device Already in Use",
    message: "Your camera or microphone is being used by another application.",
    recovery: [
      "Close other applications using camera/microphone",
      "Close other browser tabs with video calls",
      "Refresh the page",
    ],
    severity: "critical",
  },

  // WebSocket errors
  WEBSOCKET_AUTH_FAILED: {
    title: "Authentication Failed",
    message: "Your session has expired. Please log in again.",
    recovery: ["Log in again", "Refresh the page"],
    severity: "critical",
  },
  WEBSOCKET_UNAUTHORIZED: {
    title: "Access Denied",
    message: "You are not authorized to join this interview.",
    recovery: ["Contact support if you believe this is an error"],
    severity: "critical",
  },
  WEBSOCKET_NOT_FOUND: {
    title: "Interview Not Found",
    message: "This interview session could not be found.",
    recovery: ["Check your interview link", "Contact support"],
    severity: "critical",
  },
  WEBSOCKET_CONNECTION_LOST: {
    title: "Connection Lost",
    message: "Lost connection to the server. Attempting to reconnect...",
    recovery: ["Check your internet connection", "Wait for automatic reconnection"],
    severity: "warning",
  },
  MAX_RETRIES_EXCEEDED: {
    title: "Connection Failed",
    message: "Could not reconnect after multiple attempts.",
    recovery: [
      "Check your internet connection",
      "Refresh the page",
      "Contact support if the problem persists",
    ],
    severity: "critical",
  },

  // WebRTC errors
  CONNECTION_FAILED: {
    title: "Connection Failed",
    message: "Could not establish video connection with the other participant.",
    recovery: [
      "Check your internet connection",
      "Disable VPN if active",
      "Try a different network",
      "Refresh the page",
    ],
    severity: "critical",
  },
  ICE_CONNECTION_FAILED: {
    title: "Poor Connection Quality",
    message: "Network connection quality is degraded.",
    recovery: [
      "Move closer to your WiFi router",
      "Close bandwidth-heavy applications",
      "Switch to a wired connection if possible",
    ],
    severity: "warning",
  },
  NEGOTIATION_FAILED: {
    title: "Setup Failed",
    message: "Failed to set up video connection.",
    recovery: ["Refresh the page", "Try again in a few moments"],
    severity: "critical",
  },

  // Generic
  UNKNOWN_ERROR: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred.",
    recovery: ["Refresh the page", "Contact support if the problem persists"],
    severity: "warning",
  },
};

/**
 * Map error type strings to error info
 */
export function getErrorInfo(errorType) {
  // Try exact match first
  if (ErrorTypes[errorType?.toUpperCase().replace(/-/g, "_")]) {
    return ErrorTypes[errorType.toUpperCase().replace(/-/g, "_")];
  }

  // Map common error types
  const typeMap = {
    "permission-denied": ErrorTypes.PERMISSION_DENIED,
    "device-not-found": ErrorTypes.DEVICE_NOT_FOUND,
    "device-in-use": ErrorTypes.DEVICE_IN_USE,
    "websocket-error": ErrorTypes.WEBSOCKET_CONNECTION_LOST,
    "websocket-closed": ErrorTypes.WEBSOCKET_CONNECTION_LOST,
    "max-retries-exceeded": ErrorTypes.MAX_RETRIES_EXCEEDED,
    "connection-failed": ErrorTypes.CONNECTION_FAILED,
    "ice-connection-failed": ErrorTypes.ICE_CONNECTION_FAILED,
    "negotiation-failed": ErrorTypes.NEGOTIATION_FAILED,
  };

  return typeMap[errorType] || ErrorTypes.UNKNOWN_ERROR;
}

/**
 * Format error for display
 */
export function formatError(error) {
  const errorInfo = getErrorInfo(error.type);

  return {
    title: errorInfo.title,
    message: error.message || errorInfo.message,
    recovery: errorInfo.recovery,
    severity: errorInfo.severity,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log error to console (and optionally to backend/analytics)
 */
export function logError(error, context = {}) {
  const formattedError = formatError(error);

  console.error("Interview Error:", {
    ...formattedError,
    context,
    originalError: error,
  });

  // TODO: Send to backend analytics/error tracking
  // Example: sendToSentry(formattedError, context);
}
