import API from "../../utils/axiosClient"; // adjust path to where you export API

export async function fetchNotifications({
  page = 1,
  pageSize = 20,
  unreadOnly = false,
} = {}) {
  const params = {
    page,
    page_size: pageSize,
  };
  if (unreadOnly) {
    params.unread_only = "true";
  }

  const res = await API.get("/api/notifications/", { params });
  return res.data;
}

export async function fetchUnreadCount() {
  const res = await API.get("/api/notifications/unread-count/");
  return res.data;
}

export async function markNotificationRead(id) {
  const res = await API.post(`/api/notifications/${id}/mark-read/`, {});
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await API.post("/api/notifications/mark-all-read/", {});
  return res.data;
}