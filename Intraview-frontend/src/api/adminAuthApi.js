import API from "../utils/axiosClient";

export const adminFetchUsers = async ({ page = 1, role, active, search }) => {
  const params = { page };

  if (role) params.role = role;
  if (active !== undefined && active !== "") params.is_active = active;
  if (search) params.search = search;

  const res = await API.get("/auth/admin/users/", { params });
  return res.data;
};

export const adminUpdateUser = async (id, data) => {
  const res = await API.patch(`/auth/admin/users/${id}/`, data);
  return res.data;
};

export const adminBlockUser = async (id) => {
  const res = await API.post(`/auth/admin/users/${id}/block/`);
  return res.data;
};

export const adminUnblockUser = async (id) => {
  const res = await API.post(`/auth/admin/users/${id}/unblock/`);
  return res.data;
};
