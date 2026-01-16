// src/store/slices/candidateWalletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import candidateWalletApi from './candidateWalletApi';

// Async Thunks
export const fetchWalletSummary = createAsyncThunk(
  'candidateWallet/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateWalletApi.getWalletSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wallet summary');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'candidateWallet/fetchTransactions',
  async ({ page = 1, pageSize = 20, type = null }, { rejectWithValue }) => {
    try {
      const response = await candidateWalletApi.getTransactions({ page, pageSize, type });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch transactions');
    }
  }
);

export const fetchWalletStats = createAsyncThunk(
  'candidateWallet/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateWalletApi.getWalletStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wallet stats');
    }
  }
);

const slice = createSlice({
  name: 'candidateWallet',
  initialState: {
    summary: null,
    transactions: {
      results: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    },
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
    // Summary
    builder
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
      // Stats
      .addCase(fetchWalletStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchWalletStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, clearError } = slice.actions;
export default slice.reducer;
