// src/features/adminSessions/redux/adminSessionsSlice.js
/**
 * Redux Slice — Admin Session Management
 * Pattern: same createAsyncThunk + {data, status, error} approach as adminDashboardSlice.js
 *
 * State shape:
 *   kpis          — KPI overview cards
 *   sessions      — paginated session list
 *   detail        — single session full inspection
 *   action        — last admin action result
 *   filters       — current filter/search/sort/pagination values
 *   selectedId    — booking_id of currently open drawer
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./adminSessionsApi";

// ── Helpers ──────────────────────────────────────────────────────

const section = () => ({ data: null, status: "idle", error: null });

function addThunkCases(builder, thunk, key) {
    builder
        .addCase(thunk.pending, (state) => {
            state[key].status = "loading";
            state[key].error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            state[key].status = "succeeded";
            state[key].data = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
            state[key].status = "failed";
            state[key].error = action.payload;
        });
}

// ── Async Thunks ──────────────────────────────────────────────────

export const fetchSessionKPIs = createAsyncThunk(
    "adminSessions/fetchKPIs",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getSessionOverview();
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch session KPIs");
        }
    }
);

export const fetchSessions = createAsyncThunk(
    "adminSessions/fetchSessions",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.getSessions(params);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch sessions");
        }
    }
);

export const fetchSessionDetail = createAsyncThunk(
    "adminSessions/fetchSessionDetail",
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await api.getSessionDetail(bookingId);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Failed to fetch session detail");
        }
    }
);

export const applySessionAction = createAsyncThunk(
    "adminSessions/applyAction",
    async ({ bookingId, action, note }, { rejectWithValue }) => {
        try {
            const res = await api.postSessionAction(bookingId, action, note);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || "Action failed");
        }
    }
);

// ── Initial State ─────────────────────────────────────────────────

const initialState = {
    kpis: section(),
    sessions: section(),           // { data: { results, count, total_pages, page, page_size } }
    detail: section(),             // full inspection object
    action: section(),             // last admin action result

    // selected session id (drives drawer open/close)
    selectedId: null,

    // filters — kept in Redux so filters survive tab changes
    filters: {
        status: "",
        payment_status: "",
        reschedule_status: "",
        start_date: "",
        end_date: "",
        search: "",
        ordering: "-created_at",
        page: 1,
        page_size: 20,
    },
};

// ── Slice ──────────────────────────────────────────────────────────

const adminSessionsSlice = createSlice({
    name: "adminSessions",
    initialState,
    reducers: {
        // open/close the detail drawer
        setSelectedSession: (state, action) => {
            state.selectedId = action.payload;
            if (action.payload === null) {
                state.detail = section(); // clear detail when drawer closes
            }
        },

        // update individual filter fields
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
            // reset to page 1 on any filter change (except page itself)
            if (key !== "page") state.filters.page = 1;
        },

        // bulk-reset all filters to defaults
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },

        // clear action state after use
        clearActionState: (state) => {
            state.action = section();
        },
    },
    extraReducers: (builder) => {
        addThunkCases(builder, fetchSessionKPIs, "kpis");
        addThunkCases(builder, fetchSessions, "sessions");
        addThunkCases(builder, fetchSessionDetail, "detail");
        addThunkCases(builder, applySessionAction, "action");
    },
});

export const { setSelectedSession, setFilter, resetFilters, clearActionState } =
    adminSessionsSlice.actions;

export default adminSessionsSlice.reducer;
