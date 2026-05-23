// src/features/issues/slices/adminIssuesSlice.js









import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listAdminIssues,
  getAdminIssueDetail,
  updateIssueStatus,
  resolveIssue,
  applyAdminAction,
} from "../api/adminIssuesApi";

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchAdminIssues = createAsyncThunk(
  "adminIssues/fetchAdminIssues",
  async (filters, { rejectWithValue }) => {
    try {
      return await listAdminIssues(filters);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch issues." }
      );
    }
  }
);

export const fetchAdminIssueDetail = createAsyncThunk(
  "adminIssues/fetchAdminIssueDetail",
  async (issueId, { rejectWithValue }) => {
    try {
      return await getAdminIssueDetail(issueId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch issue detail." }
      );
    }
  }
);

export const updateAdminIssueStatus = createAsyncThunk(
  "adminIssues/updateStatus",
  async ({ issueId, payload }, { rejectWithValue }) => {
    try {
      return await updateIssueStatus(issueId, payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to update status." }
      );
    }
  }
);

export const resolveAdminIssue = createAsyncThunk(
  "adminIssues/resolveIssue",
  async ({ issueId, payload }, { rejectWithValue }) => {
    try {
      return await resolveIssue(issueId, payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to resolve issue." }
      );
    }
  }
);

export const applyAdminIssueAction = createAsyncThunk(
  "adminIssues/applyAction",
  async ({ issueId, payload }, { rejectWithValue }) => {
    try {
      return await applyAdminAction(issueId, payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to apply action." }
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  // List
  issues: [],
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  listLoading: false,
  listError: null,

  // Filters — kept in slice so filter bar stays in sync on page remount
  filters: {
    status: "",
    priority: "",
    issue_type: "",
    search: "",
  },

  // Detail
  selectedIssue: null,
  detailLoading: false,
  detailError: null,

  // Status update
  statusUpdateLoading: false,
  statusUpdateError: null,

  // Resolve
  resolveLoading: false,
  resolveError: null,

  // Admin action (refund, warn, ban, etc.)
  actionLoading: false,
  actionError: null,
  actionSuccess: false,

  // Action modal
  actionModal: {
    open: false,
    issueId: null,
    reporterRole: null, // "user" | "interviewer"
    againstRole: null,  // "user" | "interviewer"
  },
};

const adminIssuesSlice = createSlice({
  name: "adminIssues",
  initialState,
  reducers: {
    setAdminIssueFilters(state, action) {
      // Merge partial filter update
      state.filters = { ...state.filters, ...action.payload };
    },
    resetAdminIssueFilters(state) {
      state.filters = {
        status: "",
        priority: "",
        issue_type: "",
        search: "",
      };
    },
    openAdminActionModal(state, action) {
      const { issueId, reporterRole, againstRole } = action.payload;
      state.actionModal.open = true;
      state.actionModal.issueId = issueId;
      state.actionModal.reporterRole = reporterRole || null;
      state.actionModal.againstRole = againstRole || null;
      state.actionError = null;
      state.actionSuccess = false;
    },
    closeAdminActionModal(state) {
      state.actionModal.open = false;
      state.actionModal.issueId = null;
      state.actionModal.reporterRole = null;
      state.actionModal.againstRole = null;
      state.actionError = null;
      state.actionSuccess = false;
    },
    clearAdminSelectedIssue(state) {
      state.selectedIssue = null;
      state.detailError = null;
    },
    clearAdminActionState(state) {
      state.actionError = null;
      state.actionSuccess = false;
      state.actionLoading = false;
    },
    clearAdminStatusUpdateState(state) {
      state.statusUpdateError = null;
      state.statusUpdateLoading = false;
    },
    clearAdminResolveState(state) {
      state.resolveError = null;
      state.resolveLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ── fetchAdminIssues ──
    builder
      .addCase(fetchAdminIssues.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchAdminIssues.fulfilled, (state, action) => {
        state.listLoading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload?.results !== undefined) {
          state.issues = action.payload.results;
          state.pagination = {
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
          };
        } else {
          state.issues = action.payload ?? [];
          state.pagination = { count: state.issues.length, next: null, previous: null };
        }
      })
      .addCase(fetchAdminIssues.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    // ── fetchAdminIssueDetail ──
    builder
      .addCase(fetchAdminIssueDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedIssue = null;
      })
      .addCase(fetchAdminIssueDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedIssue = action.payload;
      })
      .addCase(fetchAdminIssueDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });

    // ── updateAdminIssueStatus ──
    builder
      .addCase(updateAdminIssueStatus.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateAdminIssueStatus.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        // Update detail view immediately
        state.selectedIssue = action.payload;
        // Patch the issue in list if it's there
        const idx = state.issues.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.issues[idx] = { ...state.issues[idx], ...action.payload };
      })
      .addCase(updateAdminIssueStatus.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
      });

    // ── resolveAdminIssue ──
    builder
      .addCase(resolveAdminIssue.pending, (state) => {
        state.resolveLoading = true;
        state.resolveError = null;
      })
      .addCase(resolveAdminIssue.fulfilled, (state, action) => {
        state.resolveLoading = false;
        state.selectedIssue = action.payload;
        const idx = state.issues.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.issues[idx] = { ...state.issues[idx], ...action.payload };
      })
      .addCase(resolveAdminIssue.rejected, (state, action) => {
        state.resolveLoading = false;
        state.resolveError = action.payload;
      });

    // ── applyAdminIssueAction ──
    builder
      .addCase(applyAdminIssueAction.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
      })
      .addCase(applyAdminIssueAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update detail and list
        state.selectedIssue = action.payload;
        const idx = state.issues.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.issues[idx] = { ...state.issues[idx], ...action.payload };
        // Close modal
        state.actionModal.open = false;
        state.actionModal.issueId = null;
      })
      .addCase(applyAdminIssueAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const {
  setAdminIssueFilters,
  resetAdminIssueFilters,
  openAdminActionModal,
  closeAdminActionModal,
  clearAdminSelectedIssue,
  clearAdminActionState,
  clearAdminStatusUpdateState,
  clearAdminResolveState,
} = adminIssuesSlice.actions;

export default adminIssuesSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectAdminIssues = (state) => state.adminIssues.issues;
export const selectAdminIssuesPagination = (state) => state.adminIssues.pagination;
export const selectAdminIssuesListLoading = (state) => state.adminIssues.listLoading;
export const selectAdminIssuesListError = (state) => state.adminIssues.listError;

export const selectAdminIssueFilters = (state) => state.adminIssues.filters;

export const selectAdminSelectedIssue = (state) => state.adminIssues.selectedIssue;
export const selectAdminDetailLoading = (state) => state.adminIssues.detailLoading;
export const selectAdminDetailError = (state) => state.adminIssues.detailError;

export const selectAdminStatusUpdateLoading = (state) => state.adminIssues.statusUpdateLoading;
export const selectAdminStatusUpdateError = (state) => state.adminIssues.statusUpdateError;

export const selectAdminResolveLoading = (state) => state.adminIssues.resolveLoading;
export const selectAdminResolveError = (state) => state.adminIssues.resolveError;

export const selectAdminActionLoading = (state) => state.adminIssues.actionLoading;
export const selectAdminActionError = (state) => state.adminIssues.actionError;
export const selectAdminActionSuccess = (state) => state.adminIssues.actionSuccess;

export const selectAdminActionModal = (state) => state.adminIssues.actionModal;