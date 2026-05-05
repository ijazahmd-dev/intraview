// // src/store/aiInterviewSessionSlice.js

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import {
//   startAiInterviewSession,
//   joinAiInterviewSession as joinAiInterviewSessionApi,
//   pingAiInterview,
// } from "../api/aiInterviewSessionApi";
// import { getRoleDetail } from "../api/aiInterviewApi";

// // Load role details for the setup page
// export const fetchAiInterviewRole = createAsyncThunk(
//   "aiInterviewSession/fetchRole",
//   async (slug, { rejectWithValue }) => {
//     try {
//       const res = await getRoleDetail(slug);
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || { detail: "Failed to load role." }
//       );
//     }
//   }
// );

// // Create a new session (POST /session/start/)
// export const createAiInterviewSession = createAsyncThunk(
//   "aiInterviewSession/createSession",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const res = await startAiInterviewSession(payload);
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || { detail: "Failed to start session." }
//       );
//     }
//   }
// );

// // Network ping (GET /ping/)
// export const checkAiInterviewNetwork = createAsyncThunk(
//   "aiInterviewSession/checkNetwork",
//   async (_, { rejectWithValue }) => {
//     const start = performance.now();
//     try {
//       const res = await pingAiInterview();
//       const latency = performance.now() - start;
//       return {
//         ok: res.data?.status === "ok",
//         latencyMs: latency,
//       };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || { detail: "Network check failed." }
//       );
//     }
//   }
// );

// // Join existing session (GET /session/:id/join/)
// export const joinAiInterviewSessionThunk = createAsyncThunk(
//   "aiInterviewSession/joinSession",
//   async (sessionId, { rejectWithValue }) => {
//     try {
//       const res = await joinAiInterviewSessionApi(sessionId);
//       return res.data; // { session_id, role, round_type, ...}
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || { detail: "Failed to join session." }
//       );
//     }
//   }
// );

// const initialState = {
//   role: null,
//   roleLoading: false,
//   roleError: null,

//   config: {
//     roundType: null,
//     difficulty: null,
//     durationMinutes: null,
//   },

//   systemCheck: {
//     browserOk: false,
//     micPermission: "pending", // "pending" | "granted" | "denied"
//     cameraPermission: "pending",
//     micActivityOk: false,
//     networkOk: false,
//     networkLatencyMs: null,
//   },

//   session: {
//     id: null,
//     status: "idle", // "idle" | "creating" | "ready" | "error"
//     createError: null,
//     data: null,
//   },

//   join: {
//     status: "idle", // "idle" | "joining" | "ready" | "error"
//     data: null,
//     error: null,
//   },
// };

// const aiInterviewSessionSlice = createSlice({
//   name: "aiInterviewSession",
//   initialState,
//   reducers: {
//     resetAiInterviewSessionState() {
//       return initialState;
//     },
//     setConfigField(state, action) {
//       const { field, value } = action.payload;
//       state.config[field] = value;
//     },
//     setSystemCheckField(state, action) {
//       const { field, value } = action.payload;
//       state.systemCheck[field] = value;
//     },
//   },
//   extraReducers: (builder) => {
//     // Role fetch
//     builder
//       .addCase(fetchAiInterviewRole.pending, (state) => {
//         state.roleLoading = true;
//         state.roleError = null;
//         state.role = null;
//       })
//       .addCase(fetchAiInterviewRole.fulfilled, (state, action) => {
//         state.roleLoading = false;
//         state.role = action.payload;
//       })
//       .addCase(fetchAiInterviewRole.rejected, (state, action) => {
//         state.roleLoading = false;
//         state.roleError =
//           action.payload?.detail || "Could not load interview role.";
//       });

//     // Session creation
//     builder
//       .addCase(createAiInterviewSession.pending, (state) => {
//         state.session.status = "creating";
//         state.session.createError = null;
//       })
//       .addCase(createAiInterviewSession.fulfilled, (state, action) => {
//         state.session.status = "ready";
//         state.session.data = action.payload;
//         state.session.id = action.payload.id;
//       })
//       .addCase(createAiInterviewSession.rejected, (state, action) => {
//         state.session.status = "error";
//         state.session.createError =
//           action.payload?.detail || "Failed to start AI interview.";
//       });

//     // Network check
//     builder
//       .addCase(checkAiInterviewNetwork.pending, (state) => {
//         state.systemCheck.networkOk = false;
//         state.systemCheck.networkLatencyMs = null;
//       })
//       .addCase(checkAiInterviewNetwork.fulfilled, (state, action) => {
//         const { ok, latencyMs } = action.payload;
//         state.systemCheck.networkLatencyMs = latencyMs;
//         // Define "OK" as < 800ms latency & backend responded with status=ok
//         state.systemCheck.networkOk = ok && latencyMs < 800;
//       })
//       .addCase(checkAiInterviewNetwork.rejected, (state) => {
//         state.systemCheck.networkOk = false;
//         state.systemCheck.networkLatencyMs = null;
//       });

//     // Join session
//     builder
//       .addCase(joinAiInterviewSessionThunk.pending, (state) => {
//         state.join.status = "joining";
//         state.join.error = null;
//       })
//       .addCase(joinAiInterviewSessionThunk.fulfilled, (state, action) => {
//         state.join.status = "ready";
//         state.join.data = action.payload;
//       })
//       .addCase(joinAiInterviewSessionThunk.rejected, (state, action) => {
//         state.join.status = "error";
//         state.join.error =
//           action.payload?.detail || "Failed to join AI interview session.";
//       });
//   },
// });

// export const {
//   resetAiInterviewSessionState,
//   setConfigField,
//   setSystemCheckField,
// } = aiInterviewSessionSlice.actions;

// export default aiInterviewSessionSlice.reducer;























// src/store/aiInterviewSessionSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  startAiInterviewSession,
  joinAiInterviewSession as joinAiInterviewSessionApi,
  endAiInterviewSession as endAiInterviewSessionApi,
  pingAiInterview,
} from "../api/aiInterviewSessionApi";
import { getRoleDetail } from "../api/aiInterviewApi";

// Load role details for the setup page
export const fetchAiInterviewRole = createAsyncThunk(
  "aiInterviewSession/fetchRole",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await getRoleDetail(slug);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to load role." }
      );
    }
  }
);

// Create a new session (POST /session/start/)
export const createAiInterviewSession = createAsyncThunk(
  "aiInterviewSession/createSession",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await startAiInterviewSession(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to start session." }
      );
    }
  }
);

// Network ping (GET /ping/)
export const checkAiInterviewNetwork = createAsyncThunk(
  "aiInterviewSession/checkNetwork",
  async (_, { rejectWithValue }) => {
    const start = performance.now();
    try {
      const res = await pingAiInterview();
      const latency = performance.now() - start;
      return {
        ok: res.data?.status === "ok",
        latencyMs: latency,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Network check failed." }
      );
    }
  }
);

// Join existing session (GET /session/:id/join/)
export const joinAiInterviewSessionThunk = createAsyncThunk(
  "aiInterviewSession/joinSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const res = await joinAiInterviewSessionApi(sessionId);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to join session." }
      );
    }
  }
);

// End existing session (POST /session/:id/end/)
export const endAiInterviewSessionThunk = createAsyncThunk(
  "aiInterviewSession/endSession",
  async ({ sessionId, reason = "COMPLETED" }, { rejectWithValue }) => {
    try {
      const res = await endAiInterviewSessionApi(sessionId, { reason });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to end session." }
      );
    }
  }
);

const initialState = {
  role: null,
  roleLoading: false,
  roleError: null,

  config: {
    roundType: null,
    difficulty: null,
    durationMinutes: null,
  },

  systemCheck: {
    browserOk: false,
    micPermission: "pending", // "pending" | "granted" | "denied"
    cameraPermission: "pending",
    micActivityOk: false,
    networkOk: false,
    networkLatencyMs: null,
  },

  session: {
    id: null,
    status: "idle", // "idle" | "creating" | "ready" | "error"
    createError: null,
    data: null,
  },

  join: {
    status: "idle", // "idle" | "joining" | "ready" | "error"
    data: null,
    error: null,
  },

  end: {
    status: "idle", // "idle" | "ending" | "success" | "error"
    data: null,
    error: null,
  },
};

const aiInterviewSessionSlice = createSlice({
  name: "aiInterviewSession",
  initialState,
  reducers: {
    resetAiInterviewSessionState() {
      return initialState;
    },
    setConfigField(state, action) {
      const { field, value } = action.payload;
      state.config[field] = value;
    },
    setSystemCheckField(state, action) {
      const { field, value } = action.payload;
      state.systemCheck[field] = value;
    },
  },
  extraReducers: (builder) => {
    // Role fetch
    builder
      .addCase(fetchAiInterviewRole.pending, (state) => {
        state.roleLoading = true;
        state.roleError = null;
        state.role = null;
      })
      .addCase(fetchAiInterviewRole.fulfilled, (state, action) => {
        state.roleLoading = false;
        state.role = action.payload;
      })
      .addCase(fetchAiInterviewRole.rejected, (state, action) => {
        state.roleLoading = false;
        state.roleError =
          action.payload?.detail || "Could not load interview role.";
      });

    // Session creation
    builder
      .addCase(createAiInterviewSession.pending, (state) => {
        state.session.status = "creating";
        state.session.createError = null;
      })
      .addCase(createAiInterviewSession.fulfilled, (state, action) => {
        state.session.status = "ready";
        state.session.data = action.payload;
        state.session.id = action.payload.id;
      })
      .addCase(createAiInterviewSession.rejected, (state, action) => {
        state.session.status = "error";
        state.session.createError =
          action.payload?.detail || "Failed to start AI interview.";
      });

    // Network check
    builder
      .addCase(checkAiInterviewNetwork.pending, (state) => {
        state.systemCheck.networkOk = false;
        state.systemCheck.networkLatencyMs = null;
      })
      .addCase(checkAiInterviewNetwork.fulfilled, (state, action) => {
        const { ok, latencyMs } = action.payload;
        state.systemCheck.networkLatencyMs = latencyMs;
        state.systemCheck.networkOk = ok && latencyMs < 800;
      })
      .addCase(checkAiInterviewNetwork.rejected, (state) => {
        state.systemCheck.networkOk = false;
        state.systemCheck.networkLatencyMs = null;
      });

    // Join session
    builder
      .addCase(joinAiInterviewSessionThunk.pending, (state) => {
        state.join.status = "joining";
        state.join.error = null;
      })
      .addCase(joinAiInterviewSessionThunk.fulfilled, (state, action) => {
        state.join.status = "ready";
        state.join.data = action.payload;
      })
      .addCase(joinAiInterviewSessionThunk.rejected, (state, action) => {
        state.join.status = "error";
        state.join.error =
          action.payload?.detail || "Failed to join AI interview session.";
      });

    // End session
    builder
      .addCase(endAiInterviewSessionThunk.pending, (state) => {
        state.end.status = "ending";
        state.end.error = null;
      })
      .addCase(endAiInterviewSessionThunk.fulfilled, (state, action) => {
        state.end.status = "success";
        state.end.data = action.payload;

        // Keep join/session data in sync with backend final state
        if (state.join.data) {
          state.join.data.status = action.payload.status;
          state.join.data.ended_at = action.payload.ended_at;
          state.join.data.started_at = action.payload.started_at;
        }

        if (state.session.data && state.session.data.id === action.payload.id) {
          state.session.data.status = action.payload.status;
          state.session.data.ended_at = action.payload.ended_at;
          state.session.data.started_at = action.payload.started_at;
        }
      })
      .addCase(endAiInterviewSessionThunk.rejected, (state, action) => {
        state.end.status = "error";
        state.end.error =
          action.payload?.detail || "Failed to end AI interview session.";
      });
  },
});

export const {
  resetAiInterviewSessionState,
  setConfigField,
  setSystemCheckField,
} = aiInterviewSessionSlice.actions;

export default aiInterviewSessionSlice.reducer;