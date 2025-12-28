import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminLogin, adminLogout, fetchAdminMe } from "../api/adminApi";
import API from "../utils/axiosClient";

export const fetchAdmin = createAsyncThunk(
  "adminAuth/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAdminMe();
      return data;
    } catch (err) {
      if (err.response?.status === 401) {
        return null;
      }
      return rejectWithValue(err.response?.data || "Failed to load admin");
    } finally {
    }
  }
);

export const loginAdmin = createAsyncThunk(
  "adminAuth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await adminLogin(credentials);
      localStorage.setItem("auth_role", "admin");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Admin login failed");
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  "adminAuth/logoutAdmin",
  async (_, { rejectWithValue }) => {
    try {
      await adminLogout();
      localStorage.removeItem("auth_role");
      return;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Admin logout failed");
    }
  }
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    admin: null,
    loading: false,
    bootstrapped: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchAdmin
    builder
      .addCase(fetchAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        console.log("🔑 fetchAdmin result:", action.payload); 
        state.loading = false;
        state.bootstrapped = true;
        state.admin = action.payload;
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.loading = false;
        state.bootstrapped = true;
        state.admin = null;
        state.error = action.payload || "Failed to load admin";
      });

    // loginAdmin
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        console.log("🔑 loginAdmin result:", action.payload);
        state.loading = false;
        state.bootstrapped = true;
        state.admin = action.payload.user || action.payload;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Admin login failed";
      });

    // logoutAdmin
    builder.addCase(logoutAdmin.fulfilled, (state) => {
      state.admin = null;
    });
  },
});

export default adminAuthSlice.reducer;
