// src/features/aiInterview/slice/aiInterviewEvaluationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSessionEvaluations,
  getTurnEvaluation,
  getSessionFinalReport,
} from "../api/aiInterviewEvaluationApi";

// ─── Thunks ────────────────────────────────────────────────────────────────

/**
 * Fetch all turns + nested evaluations for a session.
 * Used on the post-interview results page and live interview panel.
 */
export const fetchSessionEvaluations = createAsyncThunk(
  "aiInterviewEvaluation/fetchSessionEvaluations",
  async (sessionId, { rejectWithValue }) => {
    try {
      const res = await getSessionEvaluations(sessionId);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ?? "Failed to load session evaluations."
      );
    }
  }
);

/**
 * Fetch evaluation for a single turn.
 * Used for per-turn detail drawer or tooltip.
 */
export const fetchTurnEvaluation = createAsyncThunk(
  "aiInterviewEvaluation/fetchTurnEvaluation",
  async (turnId, { rejectWithValue }) => {
    try {
      const res = await getTurnEvaluation(turnId);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ?? "Failed to load turn evaluation."
      );
    }
  }
);

/**
 * Fetch the final report for a completed session.
 * Returns 202 if not ready yet — handled by status field.
 */
export const fetchSessionFinalReport = createAsyncThunk(
  "aiInterviewEvaluation/fetchSessionFinalReport",
  async (sessionId, { rejectWithValue }) => {
    try {
      const res = await getSessionFinalReport(sessionId);
      return res.data;
    } catch (error) {
      // 202 means report is still generating — not a real error
      if (error.response?.status === 202) {
        return rejectWithValue({ notReady: true });
      }
      return rejectWithValue(
        error.response?.data?.detail ?? "Failed to load final report."
      );
    }
  }
);

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState = {
  // Session-wide evaluations (all turns + nested evaluations)
  sessionEvaluations: {
    status: "idle", // idle | loading | success | error
    sessionId: null,
    sessionStatus: null,
    turns: [],        // array of turn objects with nested evaluation
    error: null,
  },

  // Single turn evaluation (for detail view)
  turnEvaluation: {
    status: "idle", // idle | loading | success | error
    turnId: null,
    data: null,
    error: null,
  },

  // Final session report
  finalReport: {
    status: "idle", // idle | loading | success | error | not_ready
    sessionId: null,
    data: null,
    error: null,
  },
};

// ─── Slice ──────────────────────────────────────────────────────────────────

const aiInterviewEvaluationSlice = createSlice({
  name: "aiInterviewEvaluation",
  initialState,
  reducers: {
    resetSessionEvaluations(state) {
      state.sessionEvaluations = initialState.sessionEvaluations;
    },
    resetTurnEvaluation(state) {
      state.turnEvaluation = initialState.turnEvaluation;
    },
    resetFinalReport(state) {
      state.finalReport = initialState.finalReport;
    },
    resetAllEvaluationState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── fetchSessionEvaluations ──────────────────────────────────────────
    builder
      .addCase(fetchSessionEvaluations.pending, (state) => {
        state.sessionEvaluations.status = "loading";
        state.sessionEvaluations.error = null;
      })
      .addCase(fetchSessionEvaluations.fulfilled, (state, action) => {
        state.sessionEvaluations.status = "success";
        state.sessionEvaluations.sessionId = action.payload.session_id;
        state.sessionEvaluations.sessionStatus = action.payload.status;
        state.sessionEvaluations.turns = action.payload.turns ?? [];
        state.sessionEvaluations.error = null;
      })
      .addCase(fetchSessionEvaluations.rejected, (state, action) => {
        state.sessionEvaluations.status = "error";
        state.sessionEvaluations.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load evaluations.";
      });

    // ── fetchTurnEvaluation ──────────────────────────────────────────────
    builder
      .addCase(fetchTurnEvaluation.pending, (state, action) => {
        state.turnEvaluation.status = "loading";
        state.turnEvaluation.turnId = action.meta.arg;
        state.turnEvaluation.data = null;
        state.turnEvaluation.error = null;
      })
      .addCase(fetchTurnEvaluation.fulfilled, (state, action) => {
        state.turnEvaluation.status = "success";
        state.turnEvaluation.data = action.payload;
        state.turnEvaluation.error = null;
      })
      .addCase(fetchTurnEvaluation.rejected, (state, action) => {
        state.turnEvaluation.status = "error";
        state.turnEvaluation.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load turn evaluation.";
      });

    // ── fetchSessionFinalReport ──────────────────────────────────────────
    builder
      .addCase(fetchSessionFinalReport.pending, (state) => {
        state.finalReport.status = "loading";
        state.finalReport.error = null;
      })
      .addCase(fetchSessionFinalReport.fulfilled, (state, action) => {
        state.finalReport.status = "success";
        state.finalReport.sessionId = action.payload.session;
        state.finalReport.data = action.payload;
        state.finalReport.error = null;
      })
      .addCase(fetchSessionFinalReport.rejected, (state, action) => {
        if (action.payload?.notReady) {
          state.finalReport.status = "not_ready";
          state.finalReport.error = null;
        } else {
          state.finalReport.status = "error";
          state.finalReport.error =
            typeof action.payload === "string"
              ? action.payload
              : "Failed to load final report.";
        }
      });
  },
});

export const {
  resetSessionEvaluations,
  resetTurnEvaluation,
  resetFinalReport,
  resetAllEvaluationState,
} = aiInterviewEvaluationSlice.actions;

export default aiInterviewEvaluationSlice.reducer;