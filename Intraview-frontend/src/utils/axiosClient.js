import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* ─────────────────────────────────────────────────────────────────────────────
   Token Refresh Interceptor
   ─────────────────────────────────────────────────────────────────────────────
   All tokens are stored as HttpOnly cookies — no JS access needed.
   The browser sends the right cookie automatically on every request.

   When a 401 is received, we hit the role-specific refresh endpoint.
   The backend will:
     1. Read the HttpOnly refresh cookie (e.g. "refresh_token")
     2. Validate it
     3. Set a new HttpOnly access cookie (e.g. "access_token")
   Then we silently retry the original request.

   Role → Refresh URL mapping:
     user        → /auth/user/token/refresh/
     admin       → /auth/admin/token/refresh/
     interviewer → /auth/interviewer/token/refresh/
───────────────────────────────────────────────────────────────────────────── */

const REFRESH_URL_MAP = {
  user: "/auth/user/token/refresh/",
  admin: "/auth/admin/token/refresh/",
  interviewer: "/auth/interviewer/token/refresh/",
};

// URLs that must NEVER trigger a refresh attempt to prevent infinite loops.
const NO_REFRESH_URLS = [
  "/auth/user/token/refresh/",
  "/auth/admin/token/refresh/",
  "/auth/interviewer/token/refresh/",
  "/auth/login/",
  "/auth/admin/login/",
  "/auth/interviewer/login/",
  "/auth/me/",
  "/auth/admin/me/",
  "/auth/interviewer/me/",
];

// Tracks whether a refresh is already in flight so we don't fire multiple
// parallel refresh requests (request queuing pattern).
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const onRefreshFailure = () => {
  refreshSubscribers = [];
};

function redirectToLogin(role) {
  const dest =
    role === "admin"
      ? "/admin/login"
      : role === "interviewer"
        ? "/interviewer/login"
        : "/login";
  window.location.href = dest;
}

API.interceptors.response.use(
  // Passthrough for all successful responses
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 Unauthorized errors
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Never retry refresh requests or auth endpoints — prevents loops
    const isNoRefreshUrl = NO_REFRESH_URLS.some((url) =>
      originalRequest.url?.includes(url)
    );
    if (originalRequest._retry || isNoRefreshUrl) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const role = localStorage.getItem("auth_role");
    const refreshUrl = REFRESH_URL_MAP[role];

    if (!refreshUrl) {
      // No role stored — user is not logged in
      console.warn("[AUTH] No auth_role found in localStorage, cannot refresh.");
      redirectToLogin(role);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // A refresh is already in flight — queue this request and wait
      return new Promise((resolve, reject) => {
        subscribeToRefresh(() => {
          // After the refresh succeeds, retry the original request
          API(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    // Start a new refresh
    isRefreshing = true;
    console.log(`[AUTH] Access token expired. Refreshing for role: "${role}" via ${refreshUrl}`);

    try {
      // POST to the role-specific refresh endpoint.
      // The browser sends the HttpOnly refresh cookie automatically.
      // The backend sets a new HttpOnly access cookie on success.
      await API.post(refreshUrl);

      console.log("[AUTH] Token refresh succeeded. Retrying original request.");
      isRefreshing = false;
      onRefreshSuccess();

      // Retry the original request — browser will now send the new access cookie
      return API(originalRequest);
    } catch (refreshError) {
      console.error(
        "[AUTH] Token refresh failed. Redirecting to login.",
        refreshError?.response?.status
      );
      isRefreshing = false;
      onRefreshFailure();
      localStorage.removeItem("auth_role");
      redirectToLogin(role);
      return Promise.reject(refreshError);
    }
  }
);

export default API;
