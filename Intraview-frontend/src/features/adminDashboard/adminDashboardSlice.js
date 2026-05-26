// src/features/adminDashboard/adminDashboardSlice.js
/**
 * Redux slice for Admin Dashboard
 * Follows the same createAsyncThunk + {data, status, error} pattern as progressSlice.js
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./adminDashboardApi";

// ── Async Thunks ─────────────────────────────────────────────

export const fetchOverview = createAsyncThunk(
    "adminDashboard/fetchOverview",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getOverview();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch overview");
        }
    }
);

export const fetchRevenue = createAsyncThunk(
    "adminDashboard/fetchRevenue",
    async (period = "monthly", { rejectWithValue }) => {
        try {
            const res = await api.getRevenue(period);
            return { period, data: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch revenue");
        }
    }
);

export const fetchInterviews = createAsyncThunk(
    "adminDashboard/fetchInterviews",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getInterviews();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch interviews");
        }
    }
);

export const fetchInterviewerHealth = createAsyncThunk(
    "adminDashboard/fetchInterviewerHealth",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getInterviewers();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch interviewer health");
        }
    }
);

export const fetchModeration = createAsyncThunk(
    "adminDashboard/fetchModeration",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getModeration();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch moderation");
        }
    }
);

export const fetchFinance = createAsyncThunk(
    "adminDashboard/fetchFinance",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getFinance();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch finance");
        }
    }
);

export const fetchSubscriptions = createAsyncThunk(
    "adminDashboard/fetchSubscriptions",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getSubscriptions();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch subscriptions");
        }
    }
);

export const fetchGrowth = createAsyncThunk(
    "adminDashboard/fetchGrowth",
    async (period = "monthly", { rejectWithValue }) => {
        try {
            const res = await api.getGrowth(period);
            return { period, data: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch growth");
        }
    }
);

// ── Helper to generate standard extraReducer cases ───────────
function addThunkCases(builder, thunk, key, extractData) {
    builder
        .addCase(thunk.pending, (state) => {
            state[key].status = "loading";
            state[key].error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            state[key].status = "succeeded";
            state[key].data = extractData ? extractData(action.payload) : action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
            state[key].status = "failed";
            state[key].error = action.payload;
        });
}

// ── Initial State ────────────────────────────────────────────
const section = () => ({ data: null, status: "idle", error: null });

const initialState = {
    overview: section(),
    revenue: { ...section(), period: "monthly" },
    interviews: section(),
    interviewerHealth: section(),
    moderation: section(),
    finance: section(),
    subscriptions: section(),
    growth: { ...section(), period: "monthly" },
};

// ── Slice ────────────────────────────────────────────────────
const adminDashboardSlice = createSlice({
    name: "adminDashboard",
    initialState,
    reducers: {
        setRevenuePeriod: (state, action) => {
            state.revenue.period = action.payload;
        },
        setGrowthPeriod: (state, action) => {
            state.growth.period = action.payload;
        },
    },
    extraReducers: (builder) => {
        addThunkCases(builder, fetchOverview, "overview");
        addThunkCases(builder, fetchRevenue, "revenue", (p) => p.data);
        addThunkCases(builder, fetchInterviews, "interviews");
        addThunkCases(builder, fetchInterviewerHealth, "interviewerHealth");
        addThunkCases(builder, fetchModeration, "moderation");
        addThunkCases(builder, fetchFinance, "finance");
        addThunkCases(builder, fetchSubscriptions, "subscriptions");
        addThunkCases(builder, fetchGrowth, "growth", (p) => p.data);
    },
});

export const { setRevenuePeriod, setGrowthPeriod } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
