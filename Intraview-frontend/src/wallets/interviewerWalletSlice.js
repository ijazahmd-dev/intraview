// src/store/slices/interviewerWalletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import interviewerWalletApi from './interviewerWalletApi';

// Async Thunks
export const fetchWalletSummary = createAsyncThunk(
  'interviewerWallet/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewerWalletApi.getWalletSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wallet summary');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'interviewerWallet/fetchTransactions',
  async ({ page = 1, pageSize = 20, type = null }, { rejectWithValue }) => {
    try {
      console.log('🌐 Calling API:', { page, pageSize, type }); // DEBUG
      const response = await interviewerWalletApi.getTransactions({ page, pageSize, type });
      console.log('🌐 API Response:', response.data); // DEBUG
      return response.data;
    } catch (error) {
      console.error('💥 EXACT API ERROR:', error.response?.status, error.response?.data, error.message); // REVEAL REAL ERROR
      return rejectWithValue(error.response?.data?.detail || error.message || 'API failed');
    }
  }
);

export const fetchEarnings = createAsyncThunk(
  'interviewerWallet/fetchEarnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewerWalletApi.getEarnings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch earnings');
    }
  }
);

export const fetchWalletStats = createAsyncThunk(
  'interviewerWallet/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewerWalletApi.getWalletStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wallet stats');
    }
  }
);

const slice = createSlice({
  name: 'interviewerWallet',
  initialState: {
    summary: null,
    transactions: {
      results: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    },
    earnings: null,
    stats: null,
    loading: false,
    error: null,
    filters: { type: null },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters.type = action.payload;
      state.transactions.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchWalletSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchWalletSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = {
          ...action.payload,
          totalPages: Math.ceil(action.payload.count / action.payload.page_size),
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Earnings
      .addCase(fetchEarnings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.loading = false;
        state.earnings = action.payload;
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Stats
      .addCase(fetchWalletStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setFilter, clearError } = slice.actions;
export default slice.reducer;
