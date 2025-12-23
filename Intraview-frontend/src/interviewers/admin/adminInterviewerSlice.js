import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../../api/adminInterviewerApi";

export const getApplications = createAsyncThunk(
  "adminInterviewer/getApplications",
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.fetchInterviewerApplications(status);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getApplicationDetail = createAsyncThunk(
  "adminInterviewer/getApplicationDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.fetchInterviewerApplicationDetail(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const reviewApplication = createAsyncThunk(
  "adminInterviewer/reviewApplication",
  async ({ id, action, rejection_reason }, { rejectWithValue }) => {
    try {
      const res = await api.reviewInterviewerApplication(id, {
        action,
        rejection_reason,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

/* ---------------- Slice ---------------- */

const adminInterviewerSlice = createSlice({
  name: "adminInterviewer",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    listLoading: false,
    detailLoading: false,
    reviewLoading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- LIST -------- */
      .addCase(getApplications.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(getApplications.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.results || [];
      })
      .addCase(getApplications.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload;
      })

      /* -------- DETAIL -------- */
      .addCase(getApplicationDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getApplicationDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(getApplicationDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      /* -------- REVIEW -------- */
      .addCase(reviewApplication.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(reviewApplication.fulfilled, (state) => {
        state.reviewLoading = false;
      })
      .addCase(reviewApplication.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelected } = adminInterviewerSlice.actions;
export default adminInterviewerSlice.reducer;