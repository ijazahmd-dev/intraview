import API from "../../../utils/axiosClient";

/**
 * API Service for Candidate Progress Dashboard
 */

export const getOverviewStats = async () => {
    return await API.get("/progress/dashboard/overview/");
};

export const getGrowthAnalytics = async (source = "all") => {
    return await API.get(`/progress/dashboard/growth/?source=${source}`);
};

export const getSkillBreakdown = async () => {
    return await API.get("/progress/dashboard/skills/");
};

export const getStrengthsWeaknesses = async () => {
    return await API.get("/progress/dashboard/strengths-weaknesses/");
};

export const getInterviewHistory = async (source = "all", page = 1) => {
    return await API.get(`/progress/dashboard/history/?source=${source}&page=${page}`);
};
