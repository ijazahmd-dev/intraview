// src/features/issues/slices/issuesSlice.js






import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  candidateRaiseIssue,
  getCandidateMyIssues,
  getCandidateIssueDetail,
} from "../api/issuesApi";

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchCandidateMyIssues = createAsyncThunk(
  "issues/fetchCandidateMyIssues",
  async (_, { rejectWithValue }) => {
    try {
      return await getCandidateMyIssues();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch issues." }
      );
    }
  }
);

export const fetchCandidateIssueDetail = createAsyncThunk(
  "issues/fetchCandidateIssueDetail",
  async (issueId, { rejectWithValue }) => {
    try {
      return await getCandidateIssueDetail(issueId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch issue detail." }
      );
    }
  }
);

export const raiseIssueAsCandidate = createAsyncThunk(
  "issues/raiseIssueAsCandidate",
  async ({ bookingId, issue_type, description }, { rejectWithValue }) => {
    try {
      return await candidateRaiseIssue(bookingId, { issue_type, description });
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

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    openRaiseModal(state, action) {
      state.raiseModal.open = true;
      state.raiseModal.bookingId = action.payload;
      state.raiseError = null;
      state.raiseSuccess = false;
    },
    closeRaiseModal(state) {
      state.raiseModal.open = false;
      state.raiseModal.bookingId = null;
      state.raiseError = null;
      state.raiseSuccess = false;
    },
    clearCandidateSelectedIssue(state) {
      state.selectedIssue = null;
      state.detailError = null;
    },
    clearRaiseState(state) {
      state.raiseError = null;
      state.raiseSuccess = false;
      state.raiseLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ── fetchCandidateMyIssues ──
    builder
      .addCase(fetchCandidateMyIssues.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchCandidateMyIssues.fulfilled, (state, action) => {
        state.listLoading = false;
        state.myIssues = action.payload?.results ?? action.payload ?? [];
      })
      .addCase(fetchCandidateMyIssues.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    // ── fetchCandidateIssueDetail ──
    builder
      .addCase(fetchCandidateIssueDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedIssue = null;
      })
      .addCase(fetchCandidateIssueDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedIssue = action.payload;
      })
      .addCase(fetchCandidateIssueDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });

    // ── raiseIssueAsCandidate ──
    builder
      .addCase(raiseIssueAsCandidate.pending, (state) => {
        state.raiseLoading = true;
        state.raiseError = null;
        state.raiseSuccess = false;
      })
      .addCase(raiseIssueAsCandidate.fulfilled, (state, action) => {
        state.raiseLoading = false;
        state.raiseSuccess = true;
        // Prepend to list so it shows up immediately without refetch
        state.myIssues = [action.payload, ...state.myIssues];
        // Close modal
        state.raiseModal.open = false;
        state.raiseModal.bookingId = null;
      })
      .addCase(raiseIssueAsCandidate.rejected, (state, action) => {
        state.raiseLoading = false;
        state.raiseError = action.payload;
      });
  },
});

export const {
  openRaiseModal,
  closeRaiseModal,
  clearCandidateSelectedIssue,
  clearRaiseState,
} = issuesSlice.actions;

export default issuesSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectCandidateIssues = (state) => state.issues.myIssues;
export const selectCandidateIssuesListLoading = (state) => state.issues.listLoading;
export const selectCandidateIssuesListError = (state) => state.issues.listError;

export const selectCandidateSelectedIssue = (state) => state.issues.selectedIssue;
export const selectCandidateDetailLoading = (state) => state.issues.detailLoading;
export const selectCandidateDetailError = (state) => state.issues.detailError;

export const selectRaiseLoading = (state) => state.issues.raiseLoading;
export const selectRaiseError = (state) => state.issues.raiseError;
export const selectRaiseSuccess = (state) => state.issues.raiseSuccess;

export const selectRaiseModal = (state) => state.issues.raiseModal;