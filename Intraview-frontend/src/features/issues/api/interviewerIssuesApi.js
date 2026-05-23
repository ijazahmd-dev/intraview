// src/features/issues/api/interviewerIssuesApi.js






import API from "../../../utils/axiosClient";

// ─── Interviewer Issues ──────────────────────────────────────────────────────

/**
 * Interviewer raises an issue for a completed booking.
 *
 * POST /api/issues/interviewer/bookings/<booking_id>/raise/
 *
 * @param {number} bookingId
 * @param {{ issue_type: string, description: string }} payload
 */
export const interviewerRaiseIssue = async (bookingId, { issue_type, description }) => {
  const res = await API.post(
    `/api/issues/interviewer/bookings/${bookingId}/raise/`,
    { issue_type, description }
  );
  return res.data;
};


/**
 * Get all issues raised by the logged-in interviewer.
 *
 * GET /api/issues/interviewer/my/
 */
export const getInterviewerMyIssues = async () => {
  const res = await API.get(`/api/issues/interviewer/my/`);
  return res.data;
};


/**
 * Get full detail of a single issue (interviewer view).
 * admin_notes are NOT returned — same safe serializer as candidate.
 *
 * GET /api/issues/interviewer/<issue_id>/
 *
 * @param {number} issueId
 */
export const getInterviewerIssueDetail = async (issueId) => {
  const res = await API.get(`/api/issues/interviewer/${issueId}/`);
  return res.data;
};