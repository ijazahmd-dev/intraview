// src/features/issues/slices/interviewerIssuesSlice.js





import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  interviewerRaiseIssue,
  getInterviewerMyIssues,
  getInterviewerIssueDetail,
} from "../api/interviewerIssuesApi";

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchInterviewerMyIssues = createAsyncThunk(
  "interviewerIssues/fetchMyIssues",
  async (_, { rejectWithValue }) => {
    try {
      return await getInterviewerMyIssues();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch issues." }
      );
    }
  }
);

export const fetchInterviewerIssueDetail = createAsyncThunk(
  "interviewerIssues/fetchIssueDetail",
  async (issueId, { rejectWithValue }) => {
    try {
      return await getInterviewerIssueDetail(issueId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch issue detail." }
      );
    }
  }
);

export const raiseIssueAsInterviewer = createAsyncThunk(
  "interviewerIssues/raiseIssue",
  async ({ bookingId, issue_type, description }, { rejectWithValue }) => {
    try {
      return await interviewerRaiseIssue(bookingId, { issue_type, description });
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to raise issue." }
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  // List
  myIssues: [],
  listLoading: false,
  listError: null,

  // Detail
  selectedIssue: null,
  detailLoading: false,
  detailError: null,

  // Raise
  raiseLoading: false,
  raiseError: null,
  raiseSuccess: false,

  // Modal
  raiseModal: {
    open: false,
    bookingId: null,
  },
};

const interviewerIssuesSlice = createSlice({
  name: "interviewerIssues",
  initialState,
  reducers: {
    openInterviewerRaiseModal(state, action) {
      state.raiseModal.open = true;
      state.raiseModal.bookingId = action.payload;
      state.raiseError = null;
      state.raiseSuccess = false;
    },
    closeInterviewerRaiseModal(state) {
      state.raiseModal.open = false;
      state.raiseModal.bookingId = null;
      state.raiseError = null;
      state.raiseSuccess = false;
    },
    clearInterviewerSelectedIssue(state) {
      state.selectedIssue = null;
      state.detailError = null;
    },
    clearInterviewerRaiseState(state) {
      state.raiseError = null;
      state.raiseSuccess = false;
      state.raiseLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ── fetchInterviewerMyIssues ──
    builder
      .addCase(fetchInterviewerMyIssues.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchInterviewerMyIssues.fulfilled, (state, action) => {
        state.listLoading = false;
        state.myIssues = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchInterviewerMyIssues.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    // ── fetchInterviewerIssueDetail ──
    builder
      .addCase(fetchInterviewerIssueDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedIssue = null;
      })
      .addCase(fetchInterviewerIssueDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedIssue = action.payload;
      })
      .addCase(fetchInterviewerIssueDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });

    // ── raiseIssueAsInterviewer ──
    builder
      .addCase(raiseIssueAsInterviewer.pending, (state) => {
        state.raiseLoading = true;
        state.raiseError = null;
        state.raiseSuccess = false;
      })
      .addCase(raiseIssueAsInterviewer.fulfilled, (state, action) => {
        state.raiseLoading = false;
        state.raiseSuccess = true;
        state.myIssues = [action.payload, ...state.myIssues];
        state.raiseModal.open = false;
        state.raiseModal.bookingId = null;
      })
      .addCase(raiseIssueAsInterviewer.rejected, (state, action) => {
        state.raiseLoading = false;
        state.raiseError = action.payload;
      });
  },
});

export const {
  openInterviewerRaiseModal,
  closeInterviewerRaiseModal,
  clearInterviewerSelectedIssue,
  clearInterviewerRaiseState,
} = interviewerIssuesSlice.actions;

export default interviewerIssuesSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectInterviewerIssues = (state) => state.interviewerIssues.myIssues;
export const selectInterviewerIssuesListLoading = (state) => state.interviewerIssues.listLoading;
export const selectInterviewerIssuesListError = (state) => state.interviewerIssues.listError;

export const selectInterviewerSelectedIssue = (state) => state.interviewerIssues.selectedIssue;
export const selectInterviewerDetailLoading = (state) => state.interviewerIssues.detailLoading;
export const selectInterviewerDetailError = (state) => state.interviewerIssues.detailError;

export const selectInterviewerRaiseLoading = (state) => state.interviewerIssues.raiseLoading;
export const selectInterviewerRaiseError = (state) => state.interviewerIssues.raiseError;
export const selectInterviewerRaiseSuccess = (state) => state.interviewerIssues.raiseSuccess;

export const selectInterviewerRaiseModal = (state) => state.interviewerIssues.raiseModal;