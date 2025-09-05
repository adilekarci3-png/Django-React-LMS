import axios from "axios";
import { useAuthStore } from "../store/auth";
import {
  getRefreshedToken,     // refresh token ile yeni access alan helper
  isAccessTokenExpired,  // JWT exp kontrolü
  setAuthUser,           // yeni access/refresh'i kaydet
  logout,                // localStorage + store temizliği
} from "./auth";
import { API_BASE_URL, API_BASE_TEST_URL } from "./constants";

/* =================== Ayarlar =================== */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 dk
let hasRedirected = false;

/* =================== Base URL =================== */
const normalizeBase = (u) => (u && u.endsWith("/") ? u : (u || "") + "/");
const baseRaw =
  API_BASE_URL || API_BASE_TEST_URL || "http://127.0.0.1:8000/api/v1/";
const BASE_URL = normalizeBase(baseRaw);

/* =================== Yardımcılar =================== */
const updateLastActivity = () =>
  localStorage.setItem("last_user_activity", Date.now().toString());

const isSessionExpired = () => {
  const last = localStorage.getItem("last_user_activity");
  if (!last) return false;
  return Date.now() - parseInt(last, 10) > SESSION_TIMEOUT_MS;
};

const redirectToLogin = () => {
  if (!hasRedirected) {
    hasRedirected = true;
    logout();
    // replace: geri tuşunda boş sayfa/loop olmasın
    window.location.replace("/login/");
  }
};

// Axios iptalini standart şekilde fırlat
const cancelRequest = (message) => {
  const err = new Error(message || "Request canceled");
  err.name = "CanceledError";
  err.code = "ERR_CANCELED";
  return Promise.reject(err);
};

/* =================== Tekil axios instance =================== */
let axiosInstance = null;
let requestInterceptorId = null;
let responseInterceptorId = null;
let sessionCheckStarted = false;

// 401/419 durumunda aynı anda birden çok refresh denemesini
// engellemek için paylaşılan promise
let refreshingPromise = null;
const runRefreshOnce = async (refreshToken) => {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      const refreshed = await getRefreshedToken(refreshToken);
      setAuthUser(refreshed.access, refreshed.refresh);
      return refreshed.access;
    })().finally(() => {
      refreshingPromise = null;
    });
  }
  return refreshingPromise;
};

const ensureInstance = () => {
  if (!axiosInstance) {
    axiosInstance = axios.create({ baseURL: BASE_URL });
  }

  // ---- Request Interceptor ----
  if (!requestInterceptorId) {
    requestInterceptorId = axiosInstance.interceptors.request.use(async (req) => {
      const state = useAuthStore.getState();

      // Rehydration bitmeden istek atma (ilk renderlarda yarış koşulu olur)
      if (!state.rehydrated) {
        console.warn("⏳ Rehydration bekleniyor, istek iptal.");
        return cancelRequest("Rehydration tamamlanmadı");
      }

      updateLastActivity();

      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      // Token yoksa veya oturum zaman aşımı olduysa
      if (!access || !refresh || isSessionExpired()) {
        redirectToLogin();
        return cancelRequest("Token yok veya oturum süresi doldu");
      }

      // Access hâlâ geçerliyse direkt ekle
      if (!isAccessTokenExpired(access)) {
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${access}`;
        return req;
      }

      // Geçersiz access → refresh dene (tek sefer, concurrency güvenli)
      try {
        const newAccess = await runRefreshOnce(refresh);
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${newAccess}`;
        return req;
      } catch (e) {
        redirectToLogin();
        return cancelRequest("Token yenileme başarısız");
      }
    });
  }

  // ---- Response Interceptor (ek güvenlik) ----
  if (!responseInterceptorId) {
    responseInterceptorId = axiosInstance.interceptors.response.use(
      (r) => r,
      async (error) => {
        const status = error?.response?.status;
        const original = error.config || {};

        // 401/419 → bir kere refresh dene; olmazsa logout
        if ((status === 401 || status === 419) && !original._retry) {
          original._retry = true;

          const refresh = localStorage.getItem("refresh_token");
          if (!refresh) {
            redirectToLogin();
            return Promise.reject(error);
          }

          try {
            const newAccess = await runRefreshOnce(refresh);
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newAccess}`;
            return axiosInstance(original);
          } catch {
            redirectToLogin();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ---- Arka planda oturum zaman aşımı kontrolü ----
  if (!sessionCheckStarted) {
    sessionCheckStarted = true;
    setInterval(() => {
      if (isSessionExpired()) {
        console.warn("🕒 Oturum süresi doldu.");
        redirectToLogin();
      }
    }, 60 * 1000);
  }

  return axiosInstance;
};

/* =================== Hook =================== */
const useAxios = () => {
  return ensureInstance(); // her çağrıda tekil instance
};

export default useAxios;
