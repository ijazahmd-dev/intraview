import * as api from './interviewerAuthApi';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";



export const loginInterviewer = createAsyncThunk(
  "interviewerAuth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.interviewerLogin(credentials);
      localStorage.setItem("auth_role", "interviewer");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

    export const logoutInterviewer = createAsyncThunk(
    "interviewerAuth/logout",
    async (_, { rejectWithValue }) => {
    try {
    const res = await api.interviewerLogout();
    localStorage.removeItem("auth_role");
    return res.data;
    } catch (err) {
    return rejectWithValue(err.response?.data);
    }
    }
    );

const interviewerAuthSlice = createSlice({
  name: "interviewerAuth",
  initialState: {
    loading: false,
    error: null,
    interviewerStatus: null,
  },
  reducers: {
    clearInterviewerAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginInterviewer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginInterviewer.fulfilled, (state, action) => {
        state.loading = false;
        state.interviewerStatus = action.payload.interviewer_status;
      })
      .addCase(loginInterviewer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Login failed" };
      })
      .addCase(logoutInterviewer.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.interviewerStatus = null;
        })
        .addCase(logoutInterviewer.rejected, (state, action) => {
        state.error = action.payload || { message: "Logout failed" };
        })
        .addCase(logoutInterviewer.pending, (state) => {
        state.loading = true;
        state.error = null;
        });
  },
});

export const { clearInterviewerAuthError } =
  interviewerAuthSlice.actions;

export default interviewerAuthSlice.reducer;