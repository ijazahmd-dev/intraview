import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import interviewerApi from "../api/interviewerApi";



/* ------------------ THUNKS ------------------ */

export const fetchInterviewerStatus = createAsyncThunk(
  "interviewer/status",
  async (_, thunkAPI) => {
    try {
      return await interviewerApi.getStatus();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const submitInterviewerApplication = createAsyncThunk(
  "interviewer/apply",
  async (formData, thunkAPI) => {
    try {
      return await interviewerApi.apply(formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchEligibility = createAsyncThunk(
  "interviewer/eligibility",
  async (_, thunkAPI) => {
    try {
      return await interviewerApi.getEligibility();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/* ------------------ SLICE ------------------ */

const interviewerSlice = createSlice({
  name: "interviewer",
  initialState: {
    eligibility: null, // {can_apply, status?, previous_rejection_reason?}
    loadingEligibility: false,
    status: "IDLE", // NOT_APPLIED | PENDING | APPROVED_NOT_ONBOARDED | ACTIVE | REJECTED
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviewerStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInterviewerStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status;
      })
      .addCase(fetchInterviewerStatus.rejected, (state, action) => {
        state.loading = false;
        state.status = "NOT_APPLIED";
      })
      .addCase(submitInterviewerApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitInterviewerApplication.fulfilled, (state) => {
        state.loading = false;
        state.status = "PENDING";
      })
      .addCase(submitInterviewerApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEligibility.pending, (state) => {
        state.loadingEligibility = true;
      })
      .addCase(fetchEligibility.fulfilled, (state, action) => {
        state.loadingEligibility = false;
        state.eligibility = action.payload;
      })
      .addCase(fetchEligibility.rejected, (state) => {
        state.loadingEligibility = false;
        state.eligibility = null;
      });
  },
});

export default interviewerSlice.reducer;
