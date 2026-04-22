import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationsApi";

export const loadUnreadCount = createAsyncThunk(
  "notifications/loadUnreadCount",
  async () => {
    const data = await fetchUnreadCount();
    return data.count;
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

      // markOneRead
      .addCase(markOneRead.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((n) => n.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
        if (state.unreadCount > 0 && updated.is_read) {
          state.unreadCount -= 1;
        }
      })

      // markAllRead
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.items = state.items.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString(),
        }));
        state.unreadCount = 0;
      });
  },
});

export const { setDropdownOpen } = notificationsSlice.actions;
export default notificationsSlice.reducer;