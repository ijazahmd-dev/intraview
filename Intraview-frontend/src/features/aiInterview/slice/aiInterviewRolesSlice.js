// src/features/aiInterview/slice/aiInterviewRolesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFeaturedRoles, searchRoles } from "../api/aiInterviewApi";

// --- Thunks ---

export const fetchFeaturedRoles = createAsyncThunk(
  "aiInterviewRoles/fetchFeaturedRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFeaturedRoles(15);
      return response.data; // [{id, name, slug, category}, ...]
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to load featured roles." }
      );
    }
  }
);

export const fetchSearchRoles = createAsyncThunk(
  "aiInterviewRoles/fetchSearchRoles",
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchRoles(query, 10);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to search roles." }
      );
    }
  }
);

// --- Slice ---

const aiInterviewRolesSlice = createSlice({
  name: "aiInterviewRoles",
  initialState: {
    featured: [],
    featuredLoading: false,
    featuredError: null,

    searchResults: [],
    searchLoading: false,
    searchError: null,
  },
  reducers: {
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchLoading = false;
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    // Featured
    builder
      .addCase(fetchFeaturedRoles.pending, (state) => {
        state.featuredLoading = true;
        state.featuredError = null;
      })
      .addCase(fetchFeaturedRoles.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedRoles.rejected, (state, action) => {
        state.featuredLoading = false;
        state.featuredError = action.payload?.detail || "Failed to load roles.";
      });

    // Search
    builder
      .addCase(fetchSearchRoles.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(fetchSearchRoles.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchRoles.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError =
          action.payload?.detail || "Failed to search for roles.";
      });
  },
});

export const { clearSearchResults } = aiInterviewRolesSlice.actions;
export default aiInterviewRolesSlice.reducer;