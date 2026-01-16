// src/store/slices/adminInterviewerSubscriptionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminInterviewerSubscriptionApi from '../subscriptions/adminInterviewerSubscriptionApi';

export const fetchPlans = createAsyncThunk(
  'adminInterviewerSubscription/fetchPlans',
  async ({ page = 1, pageSize = 20, active = null }, { rejectWithValue }) => {
    try {
      const response = await adminInterviewerSubscriptionApi.getPlans({ page, pageSize, active });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch interviewer plans');
    }
  }
);

export const createPlan = createAsyncThunk(
  'adminInterviewerSubscription/createPlan',
  async (planData, { rejectWithValue }) => {
    try {
      const response = await adminInterviewerSubscriptionApi.createPlan(planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create interviewer plan');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'adminInterviewerSubscription/updatePlan',
  async ({ id, planData }, { rejectWithValue }) => {
    try {
      const response = await adminInterviewerSubscriptionApi.updatePlan(id, planData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update interviewer plan');
    }
  }
);

export const activatePlan = createAsyncThunk(
  'adminInterviewerSubscription/activatePlan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminInterviewerSubscriptionApi.activatePlan(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to activate interviewer plan');
    }
  }
);

export const deactivatePlan = createAsyncThunk(
  'adminInterviewerSubscription/deactivatePlan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminInterviewerSubscriptionApi.deactivatePlan(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to deactivate interviewer plan');
    }
  }
);

const slice = createSlice({
  name: 'adminInterviewerSubscription',
  initialState: {
    plans: {
      results: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    },
    selectedPlan: null,
    loading: false,
    error: null,
    filters: { active: null },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters.active = action.payload;
      state.plans.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = {
          ...action.payload,
          totalPages: Math.ceil(action.payload.count / action.payload.page_size),
        };
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.plans.results.unshift(action.payload);
        state.plans.count += 1;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const index = state.plans.results.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans.results[index] = action.payload;
        }
        state.selectedPlan = action.payload;
        state.error = null;
      })
      .addCase(activatePlan.fulfilled, (state, action) => {
        const index = state.plans.results.findIndex(plan => plan.id === action.meta.arg);
        if (index !== -1) {
          state.plans.results[index].is_active = true;
        }
        state.error = null;
      })
      .addCase(deactivatePlan.fulfilled, (state, action) => {
        const index = state.plans.results.findIndex(plan => plan.id === action.meta.arg);
        if (index !== -1) {
          state.plans.results[index].is_active = false;
        }
        state.error = null;
      });
  },
});

export const { setFilter, clearError, setSelectedPlan } = slice.actions;
export default slice.reducer;
