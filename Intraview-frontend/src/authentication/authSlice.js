import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, getCurrentUser, logout, googleLogin } from "../api/authApi";


// Restore session from cookies
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCurrentUser();
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return null; // not logged in
      }
      return rejectWithValue(err.response?.data || "Failed to load user");
    } finally {
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await login(credentials);
      localStorage.setItem("auth_role", "user");
      // backend sets cookies; we just return user data if you send it
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

// Google Login
export const googleLoginUser = createAsyncThunk(
  "auth/googleLoginUser",
  async (idToken, { rejectWithValue }) => {
    try {
      const res = await googleLogin(idToken);
      localStorage.setItem("auth_role", "user");
      return res; // googleLogin function in authApi already returns res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || "Google login failed");
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await logout();
      localStorage.removeItem("auth_role");
      return;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    bootstrapped: false, // finished initial fetchUser
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchUser
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapped = true;
        state.user = action.payload; // null or user
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.bootstrapped = true;
        state.user = null;
        state.error = action.payload || "Failed to load user";
      });

    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload || state.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });

    // googleLoginUser
    builder
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload || state.user;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Google Login failed";
      });

    // logoutUser
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default authSlice.reducer;
