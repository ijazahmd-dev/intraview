// src/features/aiInterview/slice/aiInterviewHistorySlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyAiInterviewHistory } from "../api/aiInterviewHistoryApi";

// ── Thunk ────────────────────────────────────────────────────────────────────

export const fetchMyAiInterviewHistory = createAsyncThunk(
  "aiInterviewHistory/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getMyAiInterviewHistory(params);
      return res.data; // { count, next, previous, results }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to load AI interview history."
      );
    }
  }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  status: "idle",       // "idle" | "loading" | "success" | "error"
  data: {
    count: 0,
    next: null,
    previous: null,
    results: [],
  },
  error: null,

  // Active filter values (kept in Redux so the page can restore them on back-nav)
  filters: {
    status: "",
    round_type: "",
    search: "",
    page: 1,
  },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const aiInterviewHistorySlice = createSlice({
  name: "aiInterviewHistory",
  initialState,
  reducers: {
    setHistoryFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetHistory() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAiInterviewHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyAiInterviewHistory.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
      })
      .addCase(fetchMyAiInterviewHistory.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      });
  },
});

export const { setHistoryFilters, resetHistory } =
  aiInterviewHistorySlice.actions;

export default aiInterviewHistorySlice.reducer;
