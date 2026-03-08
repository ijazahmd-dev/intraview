

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import feedbackApi from './feedbackInterviewerApi';
import { toast } from 'sonner';

export const fetchMyEvaluations = createAsyncThunk(
  'feedback/fetchMyEvaluations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await feedbackApi.getMyEvaluations();
      console.log(response, "this is the evaluations oblect.")
      return response;
    } catch (error) {
      toast.error('Failed to load evaluations');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitEvaluation = createAsyncThunk(
  'feedback/submitEvaluation',
  async ({ bookingId, data }, { rejectWithValue }) => {
    try {
      const response = await feedbackApi.submitEvaluation(bookingId, data);
      toast.success('Evaluation submitted successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.non_field_errors?.[0] || 
                     error.response?.data?.error || 
                     'Failed to submit evaluation';
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    evaluations: [],
    loading: false,
    error: null,
    submitting: false,
    selectedEvaluation: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEvaluation: (state, action) => {
      state.selectedEvaluation = action.payload;
    },
    clearSelectedEvaluation: (state) => {
      state.selectedEvaluation = null;
    },
    refetchEvaluations: (state) => {
      state.loading = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch evaluations
      .addCase(fetchMyEvaluations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEvaluations.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluations = action.payload.results || [];
      })
      .addCase(fetchMyEvaluations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit evaluation
      .addCase(submitEvaluation.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitEvaluation.fulfilled, (state, action) => {
        state.submitting = false;
        // Add/update in list
        const index = state.evaluations.findIndex(e => e.booking_id === action.meta.arg.bookingId);
        if (index >= 0) {
          state.evaluations[index] = action.payload.evaluation;
        } else {
          state.evaluations.unshift(action.payload.evaluation);
        }
      })
      .addCase(submitEvaluation.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  setSelectedEvaluation, 
  clearSelectedEvaluation, 
  refetchEvaluations 
} = feedbackSlice.actions;

export default feedbackSlice.reducer;
