import axios from "axios";

/* =========================
   🔥 SINGLE SOURCE OF TRUTH
   Reads from environment (.env) so the SAME code works on
   localhost, your Wi-Fi/LAN IP, and your live production server.

   - Local dev:   set VITE_API_URL in frontend/.env
                  (see frontend/.env.example)
   - Production:  set VITE_API_URL in your hosting provider's
                  environment variables before/while building,
                  e.g. VITE_API_URL=https://api.yourdomain.com
========================= */
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API = `${BASE_URL}/api`;

/* ✅ AXIOS INSTANCE */
export const axiosInstance = axios.create({
  baseURL: API,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    /* ✅ ATTACH TOKEN */
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /* ✅ HANDLE FORM DATA (AUTO) */
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    /* 🔐 TOKEN EXPIRED / INVALID */
    if (status === 401 || status === 403) {
      console.log("🔴 AUTH ERROR - TOKEN INVALID/EXPIRED");

      localStorage.removeItem("token");

      /* 🚫 Prevent multiple redirects */
      if (!window.location.pathname.includes("/login")) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
