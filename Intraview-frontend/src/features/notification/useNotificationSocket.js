/**
 * useNotificationSocket.js
 * ────────────────────────
 * Custom React hook that maintains a WebSocket connection to the backend
 * and keeps the Redux unread notification count in sync in real-time.
 *
 * Architecture
 * ────────────
 * 1. Calls GET /api/notifications/ws-token/ to obtain the raw JWT from
 *    the HttpOnly cookie (server reads the cookie, we never access it).
 * 2. Opens ws://localhost:8000/ws/notifications/?token=<value>
 * 3. On every {"type": "notification_unread_count", "count": N} message,
 *    dispatches setUnreadCount(N) to Redux.
 * 4. On close/error, reconnects with exponential back-off (max 5 attempts).
 * 5. Cleans up on unmount / when the user logs out.
 *
 * Usage
 * ─────
 * Call this hook ONCE at the app root (AppInner in App.jsx) so the
 * connection is global across all pages. Do NOT call it inside
 * per-page components — one connection per authenticated session is enough.
 *
 *   function AppInner() {
 *     useNotificationSocket();
 *     // ...
 *   }
 */

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCount } from "./notificationsSlice";
import API from "../../utils/axiosClient";

const WS_BASE_URL = "ws://localhost:8000";
const WS_PATH = "/ws/notifications/";
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 1500;  // 1.5s, 3s, 6s, 12s, 24s

export function useNotificationSocket() {
  const dispatch = useDispatch();

  // Detect whether any role is authenticated by checking the Redux stores.
  // We key off localStorage.auth_role because it is set on login by the
  // existing authSlice / interviewerAuthSlice / adminAuthSlice.
  const candidateUser = useSelector((s) => s.auth?.user ?? null);
  const interviewerUser = useSelector((s) => s.interviewerAuth?.user ?? null);
  const adminUser = useSelector((s) => s.adminAuth?.user ?? null);
  const isAuthenticated = !!(candidateUser || interviewerUser || adminUser);

  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const isMounted = useRef(true);
  const isConnecting = useRef(false);

  const connect = useCallback(async () => {
    // Guard: only one connection at a time
    if (!isMounted.current || isConnecting.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    isConnecting.current = true;

    // ── Step 1: Obtain the WS token via REST ──────────────────────────────
    let token;
    try {
      const res = await API.get("/api/notifications/ws-token/");
      token = res.data?.token;
    } catch (err) {
      isConnecting.current = false;
      // 401/403 → user not authenticated; silently exit (no reconnect spam)
      const httpStatus = err?.response?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        return;
      }
      // Other error (network issue, etc.) → schedule reconnect
      scheduleReconnect();
      return;
    }

    if (!token || !isMounted.current) {
      isConnecting.current = false;
      return;
    }

    // ── Step 2: Open WebSocket ────────────────────────────────────────────
    const url = `${WS_BASE_URL}${WS_PATH}?token=${encodeURIComponent(token)}`;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      isConnecting.current = false;
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;
    isConnecting.current = false;

    ws.onopen = () => {
      reconnectAttempts.current = 0; // reset back-off on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification_unread_count" && typeof data.count === "number") {
          dispatch(setUnreadCount(data.count));
        }
      } catch {
        // Malformed message — ignore
      }
    };

    ws.onerror = () => {
      // onclose will fire next; let it handle the reconnect
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      // code 4003 = server rejected (unauthenticated) → don't reconnect
      if (event.code === 4003) return;
      // Normal close (1000) or navigating away → don't reconnect
      if (event.code === 1000) return;
      // Any other close → schedule a reconnect
      if (isMounted.current) {
        scheduleReconnect();
      }
    };
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleReconnect = useCallback(() => {
    if (!isMounted.current) return;
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      // Give up after max attempts to avoid infinite loops
      return;
    }
    const delay = BASE_BACKOFF_MS * Math.pow(2, reconnectAttempts.current);
    reconnectAttempts.current += 1;

    reconnectTimer.current = setTimeout(() => {
      if (isMounted.current) {
        connect();
      }
    }, delay);
  }, [connect]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    if (isAuthenticated) {
      connect();
    }

    return () => {
      isMounted.current = false;
      // Clear any pending reconnect timer
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      // Close the WebSocket cleanly (code 1000 = normal close)
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [isAuthenticated, connect]);

  // Re-connect when the user logs in (isAuthenticated transitions false → true)
  // The effect above handles this via the isAuthenticated dependency.

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
