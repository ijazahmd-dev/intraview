import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tokenApi } from "./tokensApi";


export const fetchTokenPacks = createAsyncThunk(
  'tokens/fetchPacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tokenApi.getTokenPacks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch token packs');
    }
  }
);

const tokenSlice = createSlice({
  name: 'tokens',
  initialState: {
    packs: [],
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
      .addCase(fetchTokenPacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenPacks.fulfilled, (state, action) => {
        state.loading = false;
        state.packs = action.payload;
      })
      .addCase(fetchTokenPacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = tokenSlice.actions;
export default tokenSlice.reducer;
