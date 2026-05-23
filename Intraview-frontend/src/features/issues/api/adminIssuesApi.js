//  src/features/issues/api/adminIssuesApi.js



import API from "../../../utils/axiosClient";

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * Fetch paginated, filtered list of all issues (admin only).
 *
 * @param {Object} filters
 * @param {string} [filters.status]
 * @param {string} [filters.priority]
 * @param {string} [filters.issue_type]
 * @param {string} [filters.search]      - booking ID or user email
 */
export const listAdminIssues = async (filters = {}) => {
  const params = {};

  if (filters.status)     params.status     = filters.status;
  if (filters.priority)   params.priority   = filters.priority;
  if (filters.issue_type) params.issue_type = filters.issue_type;
  if (filters.search)     params.search     = filters.search;

  const res = await API.get(`/api/issues/admin/`, { params });
  return res.data;
};


/**
 * Get full detail of a single issue for admin.
 *
 * @param {number} issueId
 */
export const getAdminIssueDetail = async (issueId) => {
  const res = await API.get(`/api/issues/admin/${issueId}/`);
  return res.data;
};


/**
 * Update only the status + admin_notes on an issue.
 *
 * @param {number} issueId
 * @param {Object} payload
 * @param {string} payload.status
 * @param {string} [payload.admin_notes]
 */
export const updateIssueStatus = async (issueId, payload) => {
  const res = await API.patch(`/api/issues/admin/${issueId}/status/`, payload);
  return res.data;
};


/**
 * Mark issue as resolved with a written resolution.
 *
 * @param {number} issueId
 * @param {Object} payload
 * @param {string} payload.resolution
 * @param {string} [payload.action_taken]
 */
export const resolveIssue = async (issueId, payload) => {
  const res = await API.post(`/api/issues/admin/${issueId}/resolve/`, payload);
  return res.data;
};


/**
 * Apply a high-level admin action on an issue
 * (refund, warn, suspend, ban, reject).
 *
 * @param {number} issueId
 * @param {Object} payload
 * @param {string} payload.action_type       - one of ADMIN_ACTION_TYPES
 * @param {number} [payload.amount]          - for PARTIAL_REFUND (tokens)
 * @param {number} [payload.percent]         - for PARTIAL_REFUND (1–100)
 * @param {number} [payload.target_user_id]  - usually against_user.id
 */
export const applyAdminAction = async (issueId, payload) => {
  const res = await API.post(`/api/issues/admin/${issueId}/action/`, payload);
  return res.data;
};