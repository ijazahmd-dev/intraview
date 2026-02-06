/**
 * Connection Quality Monitor
 * 
 * Tracks WebRTC connection statistics and provides quality indicators.
 * Monitors: packet loss, jitter, latency, bitrate
 * 
 * Quality Levels:
 * - excellent: < 2% packet loss, < 30ms jitter
 * - good: 2-5% packet loss, 30-100ms jitter
 * - poor: > 5% packet loss, > 100ms jitter
 */

import { useEffect, useState, useRef, useCallback } from "react";

export const QualityLevel = {
  EXCELLENT: "excellent",
  GOOD: "good",
  POOR: "poor",
  UNKNOWN: "unknown",
};

export function useConnectionQuality({ peerConnection, enabled = true }) {
  const [quality, setQuality] = useState(QualityLevel.UNKNOWN);
  const [stats, setStats] = useState({
    packetLoss: 0,
    jitter: 0,
    latency: 0,
    bitrate: 0,
  });

  const intervalRef = useRef(null);
  const previousStatsRef = useRef(null);

  /**
   * Calculate quality level from stats
   */
  const calculateQuality = useCallback((currentStats) => {
    const { packetLoss, jitter } = currentStats;

    if (packetLoss < 2 && jitter < 30) {
      return QualityLevel.EXCELLENT;
    } else if (packetLoss < 5 && jitter < 100) {
      return QualityLevel.GOOD;
    } else {
      return QualityLevel.POOR;
    }
  }, []);

  /**
   * Parse WebRTC stats and extract metrics
   */
  const parseStats = useCallback((statsReport) => {
    let packetLoss = 0;
    let jitter = 0;
    let latency = 0;
    let bitrate = 0;

    statsReport.forEach((report) => {
      // Inbound RTP (receiving video/audio)
      if (report.type === "inbound-rtp" && report.mediaType === "video") {
        // Calculate packet loss percentage
        if (report.packetsReceived && report.packetsLost) {
          const totalPackets = report.packetsReceived + report.packetsLost;
          packetLoss = (report.packetsLost / totalPackets) * 100;
        }

        // Jitter (ms)
        if (report.jitter) {
          jitter = report.jitter * 1000; // Convert to ms
        }

        // Calculate bitrate (kbps)
        if (previousStatsRef.current && report.bytesReceived) {
          const prevReport = previousStatsRef.current.get(report.id);
          if (prevReport) {
            const bytesDiff = report.bytesReceived - prevReport.bytesReceived;
            const timeDiff = report.timestamp - prevReport.timestamp;
            if (timeDiff > 0) {
              bitrate = (bytesDiff * 8) / timeDiff; // kbps
            }
          }
        }
      }

      // Candidate pair (for latency)
      if (report.type === "candidate-pair" && report.state === "succeeded") {
        if (report.currentRoundTripTime) {
          latency = report.currentRoundTripTime * 1000; // Convert to ms
        }
      }
    });

    return {
      packetLoss: Math.round(packetLoss * 10) / 10, // Round to 1 decimal
      jitter: Math.round(jitter),
      latency: Math.round(latency),
      bitrate: Math.round(bitrate),
    };
  }, []);

  /**
   * Collect and analyze stats
   */
  const collectStats = useCallback(async () => {
    if (!peerConnection || peerConnection.connectionState !== "connected") {
      return;
    }

    try {
      const statsReport = await peerConnection.getStats();
      const currentStats = parseStats(statsReport);

      setStats(currentStats);
      setQuality(calculateQuality(currentStats));

      // Store for next comparison
      previousStatsRef.current = statsReport;
    } catch (error) {
      console.error("Failed to collect stats:", error);
    }
  }, [peerConnection, parseStats, calculateQuality]);

  /**
   * Start monitoring when peer connection is active
   */
  useEffect(() => {
    if (!enabled || !peerConnection) {
      return;
    }

    // Collect stats every 2 seconds
    intervalRef.current = setInterval(() => {
      collectStats();
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, peerConnection, collectStats]);

  return {
    quality,
    stats,
    isMonitoring: enabled && !!peerConnection,
  };
}
