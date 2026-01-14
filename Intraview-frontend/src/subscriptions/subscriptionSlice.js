import { startTransition } from 'react';
import { subscriptionsApi } from './subscriptionsApi';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async () => {
    const response = await subscriptionsApi.getCurrentSubscription();
    return response.data;
  }
);

export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async () => {
    const response = await subscriptionsApi.getSubscriptionPlans();
    return response.data;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    current: null,
    plans: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Current subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;