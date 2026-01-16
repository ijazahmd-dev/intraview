// src/store/slices/adminTokenPackSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminTokenPackApi from './adminTokenPackApi';

export const fetchTokenPacks = createAsyncThunk(
  'adminTokenPack/fetchTokenPacks',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await adminTokenPackApi.getTokenPacks(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch token packs');
    }
  }
);

export const createTokenPack = createAsyncThunk(
  'adminTokenPack/createTokenPack',
  async (packData, { rejectWithValue }) => {
    try {
      const response = await adminTokenPackApi.createTokenPack(packData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create token pack');
    }
  }
);

export const updateTokenPack = createAsyncThunk(
  'adminTokenPack/updateTokenPack',
  async ({ id, packData }, { rejectWithValue }) => {
    try {
      const response = await adminTokenPackApi.updateTokenPack(id, packData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update token pack');
    }
  }
);

const slice = createSlice({
  name: 'adminTokenPack',
  initialState: {
    packs: {
      results: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    },
    selectedPack: null,
    loading: false,
    error: null,
    filters: {
      active: null,
      min_price: null,
      max_price: null,
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.packs.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPack: (state, action) => {
      state.selectedPack = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokenPacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenPacks.fulfilled, (state, action) => {
        state.loading = false;
        state.packs = {
          ...action.payload,
          totalPages: Math.ceil(action.payload.count / action.payload.page_size),
        };
      })
      .addCase(fetchTokenPacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTokenPack.fulfilled, (state, action) => {
        state.packs.results.unshift(action.payload);
        state.packs.count += 1;
        state.error = null;
      })
      .addCase(updateTokenPack.fulfilled, (state, action) => {
        const index = state.packs.results.findIndex(pack => pack.id === action.payload.id);
        if (index !== -1) {
          state.packs.results[index] = action.payload;
        }
        state.selectedPack = action.payload;
        state.error = null;
      });
  },
});

export const { setFilters, clearError, setSelectedPack } = slice.actions;
export default slice.reducer;
