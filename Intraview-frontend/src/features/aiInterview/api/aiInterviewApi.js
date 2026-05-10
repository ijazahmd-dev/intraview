// src/features/aiInterview/api/aiInterviewApi.js

import API from "../../../utils/axiosClient"; // <-- adjust path to your base axios file

// GET /api/ai-interview/roles/featured/
export const getFeaturedRoles = (limit = 15) => {
  return API.get("/api/ai-interview/roles/featured/", {
    params: { limit },
  });
};

// GET /api/ai-interview/roles/search/?q=...&limit=10
export const searchRoles = (query, limit = 10) => {
  return API.get("/api/ai-interview/roles/search/", {
    params: { q: query, limit },
  });
};

// GET /api/ai-interview/roles/:slug/
export const getRoleDetail = (slug) => {
  return API.get(`/api/ai-interview/roles/${slug}/`);
};