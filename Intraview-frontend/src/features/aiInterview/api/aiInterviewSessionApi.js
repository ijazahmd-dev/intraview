// src/features/aiInterview/api/aiInterviewSessionApi.js

import API from "../../../utils/axiosClient"; // your base axios instance (with baseURL + withCredentials)

/**
 * Create a new AI interview session.
 * POST /api/ai-interview/session/start/
 */
export const startAiInterviewSession = (payload) => {
  // payload: { role_slug, round_type, difficulty, duration_minutes }
  return API.post("/api/ai-interview/session/start/", payload);
};

/**
 * Join an existing AI interview session.
 * GET /api/ai-interview/session/:id/join/
 * (We will use this in the live page in Phase 2.)
 */
export const joinAiInterviewSession = (sessionId) => {
  return API.get(`/api/ai-interview/session/${sessionId}/join/`);
};

/**
 * Simple ping for network checks.
 * GET /api/ai-interview/ping/
 * (Used in Phase 2 for latency check.)
 */
export const pingAiInterview = () => {
  return API.get("/api/ai-interview/ping/");
};


export const endAiInterviewSession = (sessionId, payload) => {
  return API.post(`/api/ai-interview/session/${sessionId}/end/`, payload);
};



/**
 * GET /api/ai-interview/session/<id>/
 * Returns session detail (status, role, times, etc.)
 */
export const getAiInterviewSessionDetail = (sessionId) =>
  API.get(`/api/ai-interview/session/${sessionId}/`);