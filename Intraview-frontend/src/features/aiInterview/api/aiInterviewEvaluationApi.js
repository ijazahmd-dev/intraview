// src/features/aiInterview/api/aiInterviewEvaluationApi.js

import API from "../../../utils/axiosClient";

/**
 * GET /api/ai-interview/session/<id>/evaluations/
 * Returns all turns for the session with nested evaluation data.
 */
export const getSessionEvaluations = (sessionId) =>
  API.get(`/api/ai-interview/session/${sessionId}/evaluations/`);

/**
 * GET /api/ai-interview/turns/<turn_id>/evaluation/
 * Returns evaluation for a single turn.
 */
export const getTurnEvaluation = (turnId) =>
  API.get(`/api/ai-interview/turns/${turnId}/evaluation/`);

/**
 * GET /api/ai-interview/session/<id>/report/
 * Returns the final report for a completed session.
 */
export const getSessionFinalReport = (sessionId) =>
  API.get(`/api/ai-interview/session/${sessionId}/report/`);