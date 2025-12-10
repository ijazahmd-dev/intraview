import API from "../utils/axiosClient";

// ADMIN LOGIN
export const adminLogin = async ({ email, password }) => {
  const res = await API.post("/auth/admin/login/", { email, password });
  return res.data;
};

// ADMIN LOGOUT
export const adminLogout = async () => {
  const res = await API.post("/auth/admin/logout/");
  return res.data;
};

// FETCH LOGGED-IN ADMIN USER (optional)
export const fetchAdminMe = async () => {
  const res = await API.get("/auth/admin/me/"); // We'll set this up via protected route
  return res.data;
};
