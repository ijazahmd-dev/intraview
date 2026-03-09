// src/features/feedback/candidate/candidateFeedbackSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import candidateFeedbackApi from './candidateFeedbackApi';
import { toast } from 'sonner';

// 1) Fetch all evaluations the candidate received
export const fetchCandidateEvaluations = createAsyncThunk(
  'candidateFeedback/fetchEvaluations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await candidateFeedbackApi.getMyEvaluations();
      // data is a plain list: [ {id, overall_score, ...}, ... ]
      return data;
    } catch (error) {
      const payload = error.response?.data || error.message;
      toast.error('Failed to load feedback from interviewers');
      return rejectWithValue(payload);
    }
  }
);

// 2) Fetch one evaluation detail
export const fetchCandidateEvaluationDetail = createAsyncThunk(
  'candidateFeedback/fetchEvaluationDetail',
  async (evaluationId, { rejectWithValue }) => {
    try {
      const data = await candidateFeedbackApi.getEvaluationDetail(evaluationId);
      return data;
    } catch (error) {
      const payload = error.response?.data || error.message;
      toast.error('Failed to load evaluation details');
      return rejectWithValue(payload);
    }
  }
);

// 3) Submit a review about an interviewer for a booking
export const submitInterviewerReview = createAsyncThunk(
  'candidateFeedback/submitInterviewerReview',
  async ({ bookingId, data }, { rejectWithValue }) => {
    try {
      const res = await candidateFeedbackApi.submitInterviewerReview(
        bookingId,
        data
      );
      // res = { message, review }
      toast.success('Review submitted successfully');
      return res;
    } catch (error) {
      const payload = error.response?.data || error.message;
      const msg =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        'Failed to submit review';
      toast.error(msg);
      return rejectWithValue(payload);
    }
  }
);

// 4) Fetch an existing review detail (if needed on a detail page)
export const fetchCandidateReviewDetail = createAsyncThunk(
  'candidateFeedback/fetchReviewDetail',
  async (reviewId, { rejectWithValue }) => {
    try {
      const data = await candidateFeedbackApi.getReviewDetail(reviewId);
      return data;
    } catch (error) {
      const payload = error.response?.data || error.message;
      toast.error('Failed to load your review');
      return rejectWithValue(payload);
    }
  }
);

const candidateFeedbackSlice = createSlice({
  name: 'candidateFeedback',
  initialState: {
    evaluations: [],          // list of CandidateEvaluationListSerializer
    evaluationsLoading: false,
    evaluationsError: null,

    evaluationDetail: null,   // CandidateEvaluationDetailSerializer
    evaluationDetailLoading: false,
    evaluationDetailError: null,

    reviewDetail: null,       // InterviewerReviewDetailSerializer
    reviewDetailLoading: false,
    reviewDetailError: null,

    submittingReview: false,
  },
  reducers: {
    clearCandidateFeedbackErrors: (state) => {
      state.evaluationsError = null;
      state.evaluationDetailError = null;
      state.reviewDetailError = null;
    },
    clearEvaluationDetail: (state) => {
      state.evaluationDetail = null;
    },
    clearReviewDetail: (state) => {
      state.reviewDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- Evaluations list ----
      .addCase(fetchCandidateEvaluations.pending, (state) => {
        state.evaluationsLoading = true;
        state.evaluationsError = null;
      })
      .addCase(fetchCandidateEvaluations.fulfilled, (state, action) => {
        state.evaluationsLoading = false;
        // backend returns plain list, not {results: []}
        state.evaluations = action.payload || [];
      })
      .addCase(fetchCandidateEvaluations.rejected, (state, action) => {
        state.evaluationsLoading = false;
        state.evaluationsError = action.payload;
        state.evaluations = [];
      })

      // ---- Evaluation detail ----
      .addCase(fetchCandidateEvaluationDetail.pending, (state) => {
        state.evaluationDetailLoading = true;
        state.evaluationDetailError = null;
      })
      .addCase(fetchCandidateEvaluationDetail.fulfilled, (state, action) => {
        state.evaluationDetailLoading = false;
        state.evaluationDetail = action.payload;
      })
      .addCase(fetchCandidateEvaluationDetail.rejected, (state, action) => {
        state.evaluationDetailLoading = false;
        state.evaluationDetailError = action.payload;
        state.evaluationDetail = null;
      })

      // ---- Submit interviewer review ----
      .addCase(submitInterviewerReview.pending, (state) => {
        state.submittingReview = true;
      })
      .addCase(submitInterviewerReview.fulfilled, (state, action) => {
        state.submittingReview = false;
        // action.payload = { message, review }
        state.reviewDetail = action.payload.review;
        // you could also update some local list if you add it later
      })
      .addCase(submitInterviewerReview.rejected, (state, action) => {
        state.submittingReview = false;
        state.reviewDetailError = action.payload;
      })

      // ---- Review detail ----
      .addCase(fetchCandidateReviewDetail.pending, (state) => {
        state.reviewDetailLoading = true;
        state.reviewDetailError = null;
      })
      .addCase(fetchCandidateReviewDetail.fulfilled, (state, action) => {
        state.reviewDetailLoading = false;
        state.reviewDetail = action.payload;
      })
      .addCase(fetchCandidateReviewDetail.rejected, (state, action) => {
        state.reviewDetailLoading = false;
        state.reviewDetailError = action.payload;
        state.reviewDetail = null;
      });
  },
});

export const {
  clearCandidateFeedbackErrors,
  clearEvaluationDetail,
  clearReviewDetail,
} = candidateFeedbackSlice.actions;

export default candidateFeedbackSlice.reducer;
