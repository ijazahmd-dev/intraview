// src/features/aiInterview/api/aiInterviewHistoryApi.js

import API from "../../../utils/axiosClient";

/**
 * GET /api/ai-interview/sessions/history/
 *
 * params: { status, round_type, page, page_size }
 *
 * Response shape (DRF PageNumberPagination):
 * {
 *   count: number,
 *   next: string | null,
 *   previous: string | null,
 *   results: AIInterviewHistoryItem[]
 * }
 */
export const getMyAiInterviewHistory = (params = {}) =>
  API.get("/api/ai-interview/sessions/history/", { params });
