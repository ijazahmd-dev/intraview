import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // IMPORTANT for cookie auth
});


let isRefreshing = false;
let refreshPromise = null;

const refreshMap = {
  user: "/auth/user/token/refresh/",
  admin: "/auth/admin/token/refresh/",
  interviewer: "/auth/interviewer/token/refresh/",
};

// URLs that must NEVER trigger refresh
const NO_REFRESH_URLS = [
  "/auth/me/",
  "/auth/admin/me/",
  "/auth/interviewer/me/",
  "/auth/login/",
  "/auth/admin/login/",
  "/auth/interviewer/login/",
  "/auth/user/token/refresh/",
  "/auth/admin/token/refresh/",
  "/auth/interviewer/token/refresh/",
];

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("the interceptor is starting......")
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ❌ Do not retry forbidden URLs
    if (
      originalRequest._retry ||
      NO_REFRESH_URLS.some((url) => originalRequest.url?.includes(url))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const role = localStorage.getItem("auth_role");
    const refreshUrl = refreshMap[role];

    console.log(
      "[AUTH] 401 detected → attempting refresh",
      { role, refreshUrl, originalUrl: originalRequest.url }
    );

    if (!refreshUrl) {
      redirectToLogin(role);
      return Promise.reject(error);
    }

    try {
      if (!isRefreshing) {
        console.log("[AUTH] Starting token refresh request...");
        isRefreshing = true;
        refreshPromise = API.post(refreshUrl);
      }

      await refreshPromise;
      console.log("[AUTH] Token refreshed successfully → retrying original request");
      isRefreshing = false;
      refreshPromise = null;

      return API(originalRequest);
    } catch (refreshError) {
      console.log(
        "[AUTH] Token refresh FAILED → redirecting to login",
        refreshError.response?.status
      );
      isRefreshing = false;
      refreshPromise = null;
      localStorage.removeItem("auth_role");
      redirectToLogin(role);
      return Promise.reject(refreshError);
    }
  }
);

function redirectToLogin(role) {
  window.location.href =
    role === "admin"
      ? "/admin/login"
      : role === "interviewer"
      ? "/interviewer/login"
      : "/login";
}



export default API;
