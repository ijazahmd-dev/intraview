import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationsApi";

export const loadUnreadCount = createAsyncThunk(
  "notifications/loadUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUnreadCount();
      return data.count;
    } catch (err) {
      // 403 means the user is not authenticated (e.g. cookie expired).
      // Treat this silently as 0 rather than an error to avoid noise.
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        return 0;
      }
      return rejectWithValue(err?.message || "Failed to load unread count");
    }
  }
);

export const loadNotifications = createAsyncThunk(
  "notifications/loadNotifications",
  async ({ page = 1, pageSize = 20, unreadOnly = false } = {}) => {
    const data = await fetchNotifications({ page, pageSize, unreadOnly });
    // DRF paginated format
    const items = data.results || data;
    return {
      items,
      count: data.count ?? items.length,
      next: data.next,
      previous: data.previous,
      page,
      pageSize,
    };
  }
);

export const markOneRead = createAsyncThunk(
  "notifications/markOneRead",
  async (id) => {
    const data = await markNotificationRead(id);
    return data;
  }
);

export const markAllReadThunk = createAsyncThunk(
  "notifications/markAllRead",
  async () => {
    await markAllNotificationsRead();
    return;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    isLoadingList: false,
    isLoadingCount: false,
    page: 1,
    pageSize: 20,
    hasMore: false,
    error: null,
    dropdownOpen: false,
  },
  reducers: {
    setDropdownOpen(state, action) {
      state.dropdownOpen = action.payload;
    },
    // Synchronous action for WebSocket-pushed count updates
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUnreadCount
      .addCase(loadUnreadCount.pending, (state) => {
        state.isLoadingCount = true;
      })
      .addCase(loadUnreadCount.fulfilled, (state, action) => {
        state.isLoadingCount = false;
        state.unreadCount = action.payload;
      })
      .addCase(loadUnreadCount.rejected, (state, action) => {
        state.isLoadingCount = false;
        state.error = action.error.message;
      })

      // loadNotifications
      .addCase(loadNotifications.pending, (state) => {
        state.isLoadingList = true;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.items = action.payload.items; // replace list (no duplicates)
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.hasMore = !!action.payload.next;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.isLoadingList = false;
        state.error = action.error.message;
      })

      // markOneRead — immediately remove from items list so it disappears instantly
      .addCase(markOneRead.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.filter((n) => n.id !== updated.id);
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })

      // markAllRead — immediately clear items list and zero the count
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
      });
  },
});

export const { setDropdownOpen, setUnreadCount, removeItem } = notificationsSlice.actions;
export default notificationsSlice.reducer;