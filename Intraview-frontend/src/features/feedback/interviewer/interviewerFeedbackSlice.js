

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

export const updateEvaluation = createAsyncThunk(
  'feedback/updateEvaluation',
  async ({ evaluationId, data }, { rejectWithValue }) => {
    try {
      const response = await feedbackApi.updateEvaluation(evaluationId, data);
      toast.success('Evaluation updated successfully!');
      return response; // full detail payload
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.error ||
        'Failed to update evaluation';
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

        // Handle both: plain list OR paginated `{ results: [...] }`
        if (Array.isArray(action.payload)) {
          // Backend returns a simple list
          state.evaluations = action.payload;
        } else if (Array.isArray(action.payload?.results)) {
          // Backend returns `{ results: [...] }`
          state.evaluations = action.payload.results;
        } else {
          // Fallback
          state.evaluations = [];
        }
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
      })

      // Update evaluation
      .addCase(updateEvaluation.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateEvaluation.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;

        // Replace in list by id, if present
        const idx = state.evaluations.findIndex(e => e.id === updated.id);
        if (idx >= 0) {
          state.evaluations[idx] = updated;
        }

        // Keep detail view in sync
        state.selectedEvaluation = updated;
      })
      .addCase(updateEvaluation.rejected, (state, action) => {
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
