import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as progressApi from "./progressApi";

/**
 * Async Thunks
 */
export const fetchOverviewStats = createAsyncThunk(
    "progress/fetchOverview",
    async (_, { rejectWithValue }) => {
        try {
            const response = await progressApi.getOverviewStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch overview stats"
            );
        }
    }
);

export const fetchGrowthAnalytics = createAsyncThunk(
    "progress/fetchGrowth",
    async (source = "all", { rejectWithValue }) => {
        try {
            const response = await progressApi.getGrowthAnalytics(source);
            return { source, data: response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch growth analytics"
            );
        }
    }
);

export const fetchSkillBreakdown = createAsyncThunk(
    "progress/fetchSkills",
    async (_, { rejectWithValue }) => {
        try {
            const response = await progressApi.getSkillBreakdown();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch skill breakdown"
            );
        }
    }
);

export const fetchStrengthsWeaknesses = createAsyncThunk(
    "progress/fetchStrengths",
    async (_, { rejectWithValue }) => {
        try {
            const response = await progressApi.getStrengthsWeaknesses();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch strengths/weaknesses"
            );
        }
    }
);

export const fetchInterviewHistory = createAsyncThunk(
    "progress/fetchHistory",
    async ({ source = "all", page = 1 }, { rejectWithValue }) => {
        try {
            const response = await progressApi.getInterviewHistory(source, page);
            return {
                source,
                page,
                data: response.data.results || response.data,
                count: response.data.count || 0,
                next: response.data.next,
                previous: response.data.previous,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch interview history"
            );
        }
    }
);

const initialState = {
    overview: { data: null, status: "idle", error: null },
    growth: { data: [], status: "idle", error: null, source: "all" },
    skills: { data: null, status: "idle", error: null },
    strengths: { data: null, status: "idle", error: null },
    history: {
        data: [],
        status: "idle",
        error: null,
        source: "all",
        page: 1,
        count: 0,
        next: null,
        previous: null,
    },
};

const progressSlice = createSlice({
    name: "progress",
    initialState,
    reducers: {
        setGrowthSource: (state, action) => {
            state.growth.source = action.payload;
        },
        setHistorySource: (state, action) => {
            state.history.source = action.payload;
            state.history.page = 1; // Reset to page 1 on source change
        },
        setHistoryPage: (state, action) => {
            state.history.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Overview
            .addCase(fetchOverviewStats.pending, (state) => {
                state.overview.status = "loading";
                state.overview.error = null;
            })
            .addCase(fetchOverviewStats.fulfilled, (state, action) => {
                state.overview.status = "succeeded";
                state.overview.data = action.payload;
            })
            .addCase(fetchOverviewStats.rejected, (state, action) => {
                state.overview.status = "failed";
                state.overview.error = action.payload;
            })
            // Growth
            .addCase(fetchGrowthAnalytics.pending, (state) => {
                state.growth.status = "loading";
                state.growth.error = null;
            })
            .addCase(fetchGrowthAnalytics.fulfilled, (state, action) => {
                state.growth.status = "succeeded";
                state.growth.data = action.payload.data;
                state.growth.source = action.payload.source;
            })
            .addCase(fetchGrowthAnalytics.rejected, (state, action) => {
                state.growth.status = "failed";
                state.growth.error = action.payload;
            })
            // Skills
            .addCase(fetchSkillBreakdown.pending, (state) => {
                state.skills.status = "loading";
                state.skills.error = null;
            })
            .addCase(fetchSkillBreakdown.fulfilled, (state, action) => {
                state.skills.status = "succeeded";
                state.skills.data = action.payload;
            })
            .addCase(fetchSkillBreakdown.rejected, (state, action) => {
                state.skills.status = "failed";
                state.skills.error = action.payload;
            })
            // Strengths
            .addCase(fetchStrengthsWeaknesses.pending, (state) => {
                state.strengths.status = "loading";
                state.strengths.error = null;
            })
            .addCase(fetchStrengthsWeaknesses.fulfilled, (state, action) => {
                state.strengths.status = "succeeded";
                state.strengths.data = action.payload;
            })
            .addCase(fetchStrengthsWeaknesses.rejected, (state, action) => {
                state.strengths.status = "failed";
                state.strengths.error = action.payload;
            })
            // History
            .addCase(fetchInterviewHistory.pending, (state) => {
                state.history.status = "loading";
                state.history.error = null;
            })
            .addCase(fetchInterviewHistory.fulfilled, (state, action) => {
                state.history.status = "succeeded";
                state.history.data = action.payload.data;
                state.history.source = action.payload.source;
                state.history.page = action.payload.page;
                state.history.count = action.payload.count;
                state.history.next = action.payload.next;
                state.history.previous = action.payload.previous;
            })
            .addCase(fetchInterviewHistory.rejected, (state, action) => {
                state.history.status = "failed";
                state.history.error = action.payload;
            });
    },
});

export const { setGrowthSource, setHistorySource, setHistoryPage } = progressSlice.actions;

export default progressSlice.reducer;
