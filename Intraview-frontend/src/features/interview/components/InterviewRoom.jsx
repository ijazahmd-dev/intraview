// src/pages/InterviewRoom.js

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchZegoToken } from "../api/zegoTokenApi";
import { joinRoom, leaveRoom } from "../services/zegoClient";

function InterviewRoom() {
  const { bookingId } = useParams();

  const localContainerRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const zegoContextRef = useRef(null);

  const [tokenData, setTokenData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [joinInProgress, setJoinInProgress] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  // 1) Fetch Zego token when page loads
  useEffect(() => {
    let isMounted = true;

    async function loadToken() {
      try {
        setLoadingToken(true);
        setError(null);
        const data = await fetchZegoToken(bookingId);
        if (!isMounted) return;
        setTokenData(data);
      } catch (e) {
        if (!isMounted) return;
        console.error(e);
        setError(e.message || "Failed to load interview room token.");
      } finally {
        if (isMounted) {
          setLoadingToken(false);
        }
      }
    }

    loadToken();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // 2) Join button handler
  // async function handleJoin() {
  //   if (!tokenData || joined) return;

  //   try {
  //     setJoinInProgress(true);
  //     setError(null);

  //     const localContainer = localContainerRef.current;
  //     const remoteContainer = remoteContainerRef.current;

  //     if (!localContainer || !remoteContainer) {
  //       throw new Error("Video containers are not ready.");
  //     }

  //     // Join Zego room and setup streams
  //     const ctx = await joinRoom(tokenData, localContainer, remoteContainer);
  //     zegoContextRef.current = ctx;
  //     setJoined(true);
  //   } catch (e) {
  //     console.error(e);
  //     setError(e.message || "Failed to join interview.");
  //   } finally {
  //     setJoinInProgress(false);
  //   }
  // }

  async function handleJoin() {
  if (!tokenData || joined) return;

  try {
    setJoinInProgress(true);
    setError(null);

    const localContainer = localContainerRef.current;
    const remoteContainer = remoteContainerRef.current;

    if (!localContainer || !remoteContainer) {
      throw new Error("Video containers are not ready.");
    }

    // Join Zego room and setup streams
    const ctx = await joinRoom(tokenData, localContainer, remoteContainer);
    zegoContextRef.current = ctx;
    setJoined(true);

    // If camera failed, show it as a non-fatal warning
    if (ctx.cameraError) {
      setError(ctx.cameraError);
    }
  } catch (e) {
    console.error(e);
    setError(e.message || "Failed to join interview.");
  } finally {
    setJoinInProgress(false);
  }
}



  // 3) Leave button handler
  async function handleLeave() {
    try {
      await leaveRoom(zegoContextRef.current);
    } catch (e) {
      console.error(e);
    } finally {
      zegoContextRef.current = null;
      setJoined(false);
      // Phase 3: call backend disconnect endpoint here.
    }
  }

  // 4) Cleanup on unmount
  useEffect(() => {
    return () => {
      if (zegoContextRef.current) {
        // fire and forget
        leaveRoom(zegoContextRef.current);
        zegoContextRef.current = null;
      }
    };
  }, []);

  // --- UI states
  if (loadingToken) {
    return <div className="p-4">Loading interview room...</div>;
  }

  if (error && !joined) {
    return (
      <div className="p-4 text-red-600">
        Interview error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Interview Room #{bookingId}
        </h1>

        <div className="flex gap-2">
          {!joined ? (
            <button
              onClick={handleJoin}
              disabled={joinInProgress || !tokenData}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {joinInProgress ? "Joining..." : "Join Interview"}
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Leave Interview
            </button>
          )}
        </div>
      </header>

      {error && joined && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <h2 className="font-medium mb-2">Your Video</h2>
          <div
            ref={localContainerRef}
            className="w-full aspect-video bg-black rounded overflow-hidden"
          />
        </div>

        <div>
          <h2 className="font-medium mb-2">Other Participant</h2>
          <div
            ref={remoteContainerRef}
            className="w-full aspect-video bg-black rounded overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
}

export default InterviewRoom;
