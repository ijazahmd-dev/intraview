// src/features/issues/api/issuesApi.js





import API from "../../../utils/axiosClient";

// ─── Candidate Issues ────────────────────────────────────────────────────────

/**
 * Candidate raises an issue for a completed booking.
 *
 * POST /api/issues/candidate/bookings/<booking_id>/raise/
 *
 * @param {number} bookingId
 * @param {{ issue_type: string, description: string }} payload
 */
export const candidateRaiseIssue = async (bookingId, { issue_type, description }) => {
  const res = await API.post(
    `/api/issues/candidate/bookings/${bookingId}/raise/`,
    { issue_type, description }
  );
  return res.data;
};


/**
 * Get all issues raised by the logged-in candidate.
 *
 * GET /api/issues/candidate/my/
 */
export const getCandidateMyIssues = async () => {
  const res = await API.get(`/api/issues/candidate/my/`);
  return res.data;
};


/**
 * Get full detail of a single issue (candidate view).
 * admin_notes are NOT returned by this endpoint — safe for candidate.
 *
 * GET /api/issues/candidate/<issue_id>/
 *
 * @param {number} issueId
 */
export const getCandidateIssueDetail = async (issueId) => {
  const res = await API.get(`/api/issues/candidate/${issueId}/`);
  return res.data;
};