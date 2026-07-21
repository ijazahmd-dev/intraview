import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

import { postAiInterviewIntegrityEvents } from "../api/aiInterviewSessionApi";

const EVENT_TYPES = {
  TAB_SWITCH: "TAB_SWITCH",
  WINDOW_FOCUS_LOSS: "WINDOW_FOCUS_LOSS",
  FULLSCREEN_EXIT: "FULLSCREEN_EXIT",
  FACE_MISSING: "FACE_MISSING",
};

const MEDIAPIPE_WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MEDIAPIPE_FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

const FLUSH_DELAY_MS = 1500;
const WARNING_DURATION_MS = 4500;
const WARNING_COOLDOWN_MS = 30000;
const FACE_CHECK_INTERVAL_MS = 1000;
const FACE_MISSING_THRESHOLD_MS = 6000;
const FOCUS_BLUR_SETTLE_MS = 150;

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `integrity-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toIso(ms) {
  return new Date(ms).toISOString();
}

function buildTimedEvent(eventType, startedAtMs, endedAtMs, metadata = {}) {
  const durationSeconds = Math.max(
    Math.round((Math.max(endedAtMs - startedAtMs, 0)) / 1000),
    0
  );

  return {
    client_event_id: createEventId(),
    event_type: eventType,
    started_at: toIso(startedAtMs),
    ended_at: toIso(endedAtMs),
    duration_seconds: durationSeconds,
    metadata,
  };
}

function buildInstantEvent(eventType, metadata = {}) {
  const now = Date.now();
  return {
    client_event_id: createEventId(),
    event_type: eventType,
    started_at: toIso(now),
    ended_at: toIso(now),
    duration_seconds: 0,
    metadata,
  };
}

async function postEvents(sessionId, events) {
  if (!sessionId || !events.length) {
    return;
  }

  await postAiInterviewIntegrityEvents(sessionId, { events });
}

export function InterviewIntegrityMonitor({ sessionId, enabled }) {
  const { cameraTrack, isCameraEnabled } = useLocalParticipant();
  const [warnings, setWarnings] = useState([]);

  const queuedEventsRef = useRef([]);
  const flushTimerRef = useRef(null);
  const flushInFlightRef = useRef(false);
  const warningCooldownRef = useRef({});

  const tabHiddenStartedAtRef = useRef(null);
  const tabSwitchCountRef = useRef(0);

  const focusLossStartedAtRef = useRef(null);
  const focusLossCountRef = useRef(0);
  const blurTimerRef = useRef(null);

  const fullscreenActiveRef = useRef(Boolean(document.fullscreenElement));

  const faceDetectorRef = useRef(null);
  const faceDetectIntervalRef = useRef(null);
  const faceVideoRef = useRef(null);
  const faceMissingPendingStartedAtRef = useRef(null);
  const faceMissingStartedAtRef = useRef(null);
  const faceDetectInFlightRef = useRef(false);

  const cameraTrackPublication = cameraTrack;
  const cameraMediaTrack = cameraTrackPublication?.track ?? null;

  const showWarning = useCallback((key, message) => {
    const now = Date.now();
    const lastShownAt = warningCooldownRef.current[key] ?? 0;

    if (now - lastShownAt < WARNING_COOLDOWN_MS) {
      return;
    }

    warningCooldownRef.current[key] = now;

    const warningId = createEventId();
    setWarnings((prev) => [
      ...prev.slice(-1),
      { id: warningId, message },
    ]);

    window.setTimeout(() => {
      setWarnings((prev) => prev.filter((item) => item.id !== warningId));
    }, WARNING_DURATION_MS);
  }, []);

  const flushQueuedEvents = useCallback(async () => {
    if (!sessionId || flushInFlightRef.current || !queuedEventsRef.current.length) {
      return;
    }

    flushInFlightRef.current = true;
    const batch = [...queuedEventsRef.current];
    queuedEventsRef.current = [];

    try {
      await postEvents(sessionId, batch);
    } catch (error) {
      queuedEventsRef.current = [...batch, ...queuedEventsRef.current];
      console.warn("Failed to post integrity events.", error);
    } finally {
      flushInFlightRef.current = false;
    }
  }, [sessionId]);

  const queueEvent = useCallback((eventPayload) => {
    queuedEventsRef.current.push(eventPayload);

    if (queuedEventsRef.current.length >= 3) {
      void flushQueuedEvents();
      return;
    }

    if (flushTimerRef.current) {
      return;
    }

    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null;
      void flushQueuedEvents();
    }, FLUSH_DELAY_MS);
  }, [flushQueuedEvents]);

  const finalizeTimedEvent = useCallback((ref, eventType, metadata = {}) => {
    if (!ref.current) {
      return;
    }

    const startedAtMs = ref.current;
    ref.current = null;

    queueEvent(
      buildTimedEvent(
        eventType,
        startedAtMs,
        Date.now(),
        metadata
      )
    );
  }, [queueEvent]);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }

      const pendingEvents = [];
      const now = Date.now();

      if (tabHiddenStartedAtRef.current) {
        pendingEvents.push(
          buildTimedEvent(
            EVENT_TYPES.TAB_SWITCH,
            tabHiddenStartedAtRef.current,
            now,
            { finalized_on_cleanup: true }
          )
        );
        tabHiddenStartedAtRef.current = null;
      }

      if (focusLossStartedAtRef.current) {
        pendingEvents.push(
          buildTimedEvent(
            EVENT_TYPES.WINDOW_FOCUS_LOSS,
            focusLossStartedAtRef.current,
            now,
            { finalized_on_cleanup: true }
          )
        );
        focusLossStartedAtRef.current = null;
      }

      if (faceMissingStartedAtRef.current) {
        pendingEvents.push(
          buildTimedEvent(
            EVENT_TYPES.FACE_MISSING,
            faceMissingStartedAtRef.current,
            now,
            { finalized_on_cleanup: true }
          )
        );
        faceMissingStartedAtRef.current = null;
      }

      if (queuedEventsRef.current.length || pendingEvents.length) {
        void postEvents(sessionId, [
          ...queuedEventsRef.current,
          ...pendingEvents,
        ]).catch(() => {});
        queuedEventsRef.current = [];
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (!tabHiddenStartedAtRef.current) {
          tabHiddenStartedAtRef.current = Date.now();
          tabSwitchCountRef.current += 1;
        }
        return;
      }

      if (!tabHiddenStartedAtRef.current) {
        return;
      }

      finalizeTimedEvent(tabHiddenStartedAtRef, EVENT_TYPES.TAB_SWITCH, {
        visibility_state: "visible",
      });

      if (tabSwitchCountRef.current === 1) {
        showWarning("tab-switch", "Please stay focused on the interview session.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, finalizeTimedEvent, showWarning]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleBlur = () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
      }

      blurTimerRef.current = window.setTimeout(() => {
        blurTimerRef.current = null;

        if (document.hidden || focusLossStartedAtRef.current) {
          return;
        }

        focusLossStartedAtRef.current = Date.now();
      }, FOCUS_BLUR_SETTLE_MS);
    };

    const handleFocus = () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }

      if (!focusLossStartedAtRef.current) {
        return;
      }

      focusLossCountRef.current += 1;
      finalizeTimedEvent(
        focusLossStartedAtRef,
        EVENT_TYPES.WINDOW_FOCUS_LOSS,
        { regained_focus: true }
      );

      if (focusLossCountRef.current > 1) {
        showWarning("window-focus", "Please keep the interview window active.");
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
    };
  }, [enabled, finalizeTimedEvent, showWarning]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleFullscreenChange = () => {
      const isFullscreenNow = Boolean(document.fullscreenElement);
      const wasFullscreen = fullscreenActiveRef.current;

      if (wasFullscreen && !isFullscreenNow) {
        queueEvent(
          buildInstantEvent(EVENT_TYPES.FULLSCREEN_EXIT, {
            warning_variant: "gentle",
          })
        );
        showWarning(
          "fullscreen-exit",
          "For the best interview experience, please remain in fullscreen mode."
        );
      }

      fullscreenActiveRef.current = isFullscreenNow;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, queueEvent, showWarning]);

  const handleFacePresence = useCallback((hasFace) => {
    const now = Date.now();

    if (hasFace) {
      faceMissingPendingStartedAtRef.current = null;
      finalizeTimedEvent(faceMissingStartedAtRef, EVENT_TYPES.FACE_MISSING, {
        face_detected_again: true,
      });
      return;
    }

    if (!faceMissingPendingStartedAtRef.current) {
      faceMissingPendingStartedAtRef.current = now;
      return;
    }

    if (
      !faceMissingStartedAtRef.current &&
      now - faceMissingPendingStartedAtRef.current >= FACE_MISSING_THRESHOLD_MS
    ) {
      faceMissingStartedAtRef.current = faceMissingPendingStartedAtRef.current;
      showWarning(
        "face-missing",
        "We cannot detect your face. Please return to the camera."
      );
    }
  }, [finalizeTimedEvent, showWarning]);

  useEffect(() => {
    if (
      !enabled ||
      !isCameraEnabled ||
      !cameraMediaTrack ||
      typeof cameraMediaTrack.attach !== "function"
    ) {
      return undefined;
    }

    let cancelled = false;

    const videoEl = document.createElement("video");
    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    videoEl.setAttribute("aria-hidden", "true");
    videoEl.style.position = "fixed";
    videoEl.style.width = "1px";
    videoEl.style.height = "1px";
    videoEl.style.opacity = "0";
    videoEl.style.pointerEvents = "none";
    videoEl.style.bottom = "0";
    videoEl.style.left = "0";
    document.body.appendChild(videoEl);
    faceVideoRef.current = videoEl;

    const attachedElement = cameraMediaTrack.attach(videoEl);

    const initializeDetector = async () => {
      try {
        await videoEl.play().catch(() => {});

        const vision = await FilesetResolver.forVisionTasks(
          MEDIAPIPE_WASM_ROOT
        );

        if (cancelled) {
          return;
        }

        faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_FACE_MODEL_URL,
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });

        faceDetectIntervalRef.current = window.setInterval(() => {
          if (
            cancelled ||
            faceDetectInFlightRef.current ||
            !faceDetectorRef.current ||
            !faceVideoRef.current
          ) {
            return;
          }

          if (document.hidden || !document.hasFocus()) {
            return;
          }

          const monitorVideo = faceVideoRef.current;
          if (
            monitorVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
            monitorVideo.videoWidth === 0 ||
            monitorVideo.videoHeight === 0
          ) {
            return;
          }

          faceDetectInFlightRef.current = true;

          try {
            const result = faceDetectorRef.current.detectForVideo(
              monitorVideo,
              performance.now()
            );
            const hasFace = (result?.detections?.length ?? 0) > 0;
            handleFacePresence(hasFace);
          } catch (error) {
            console.warn("Face detection failed during interview monitoring.", error);
          } finally {
            faceDetectInFlightRef.current = false;
          }
        }, FACE_CHECK_INTERVAL_MS);
      } catch (error) {
        console.warn("Interview face detector could not be initialized.", error);
      }
    };

    void initializeDetector();

    return () => {
      cancelled = true;
      faceDetectInFlightRef.current = false;
      faceMissingPendingStartedAtRef.current = null;

      if (faceDetectIntervalRef.current) {
        clearInterval(faceDetectIntervalRef.current);
        faceDetectIntervalRef.current = null;
      }

      if (faceDetectorRef.current) {
        faceDetectorRef.current.close?.();
        faceDetectorRef.current = null;
      }

      if (typeof cameraMediaTrack.detach === "function") {
        cameraMediaTrack.detach(attachedElement);
      }

      if (videoEl.parentNode) {
        videoEl.parentNode.removeChild(videoEl);
      }

      faceVideoRef.current = null;
    };
  }, [
    cameraMediaTrack,
    enabled,
    handleFacePresence,
    isCameraEnabled,
  ]);

  const hasWarnings = useMemo(() => warnings.length > 0, [warnings.length]);

  if (!hasWarnings) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 45,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
        width: "min(520px, calc(100% - 24px))",
      }}
    >
      {warnings.map((warning) => (
        <div
          key={warning.id}
          style={{
            background: "rgba(12,20,36,0.94)",
            border: "1px solid rgba(245,158,11,0.28)",
            borderRadius: 14,
            padding: "12px 16px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
            backdropFilter: "blur(14px)",
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 12px rgba(245,158,11,0.45)",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.55,
                color: "#e2e8f0",
              }}
            >
              {warning.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
