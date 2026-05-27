// src/features/adminSessions/redux/adminSessionsApi.js
/**
 * API calls for Admin Session Management.
 * Follows the exact same pattern as adminDashboardApi.js — uses shared axiosClient.
 */

import API from "../../../utils/axiosClient";

const BASE = "/api/admin-dashboard/sessions";

/** Feature 1 — KPI overview */
export const getSessionOverview = async () =>
    await API.get(`${BASE}/overview/`);

/** Feature 2 — Paginated session list with filters */
export const getSessions = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.payment_status) query.set("payment_status", params.payment_status);
    if (params.reschedule_status) query.set("reschedule_status", params.reschedule_status);
    if (params.start_date) query.set("start_date", params.start_date);
    if (params.end_date) query.set("end_date", params.end_date);
    if (params.search) query.set("search", params.search);
    if (params.ordering) query.set("ordering", params.ordering);
    if (params.page) query.set("page", params.page);
    if (params.page_size) query.set("page_size", params.page_size);
    return await API.get(`${BASE}/?${query.toString()}`);
};

/** Feature 3 — Full session detail */
export const getSessionDetail = async (bookingId) =>
    await API.get(`${BASE}/${bookingId}/`);

/** Feature 4 — Admin action on a session */
export const postSessionAction = async (bookingId, action, note = "") =>
    await API.post(`${BASE}/${bookingId}/action/`, { action, note });
