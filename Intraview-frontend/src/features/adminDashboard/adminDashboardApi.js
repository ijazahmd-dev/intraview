// src/features/adminDashboard/adminDashboardApi.js
/**
 * API Service for Admin Dashboard
 * Follows the same pattern as progressApi.js
 */

import API from "../../utils/axiosClient";

const BASE = "/api/admin-dashboard";

export const getOverview = async () => {
    return await API.get(`${BASE}/overview/`);
};

export const getRevenue = async (period = "monthly") => {
    return await API.get(`${BASE}/revenue/?period=${period}`);
};

export const getInterviews = async () => {
    return await API.get(`${BASE}/interviews/`);
};

export const getInterviewers = async () => {
    return await API.get(`${BASE}/interviewers/`);
};

export const getModeration = async () => {
    return await API.get(`${BASE}/moderation/`);
};

export const getFinance = async () => {
    return await API.get(`${BASE}/finance/`);
};

export const getSubscriptions = async () => {
    return await API.get(`${BASE}/subscriptions/`);
};

export const getGrowth = async (period = "monthly") => {
    return await API.get(`${BASE}/growth/?period=${period}`);
};
