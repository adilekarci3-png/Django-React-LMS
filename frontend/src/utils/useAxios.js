import axios from "axios";
import { useAuthStore } from "../store/auth";
import {
  getRefreshedToken,
  isAccessTokenExpired,
  setAuthUser,
  logout,
} from "./auth";
import { API_BASE_URL } from "./constants";
import { API_BASE_TEST_URL } from "./constants";

// Oturum zaman aşımı (ms cinsinden)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let hasRedirected = false;

// Oturum süresi doldu mu?
const isSessionExpired = () => {
  
  const last = localStorage.getItem("last_user_activity");
  if (!last) return false;
  return Date.now() - parseInt(last, 10) > SESSION_TIMEOUT_MS;
};

// Son aktivite zamanını güncelle
const updateLastActivity = () => {
  localStorage.setItem("last_user_activity", Date.now().toString());
};

// Giriş sayfasına yönlendir (yalnızca bir kez)
const redirectToLogin = () => {
  if (!hasRedirected) {
    hasRedirected = true;
    logout();
    window.location.href = "/login";
  }
};

const useAxios = () => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_TEST_URL,
  });

  // Arka planda oturum zaman aşımı kontrolü
  if (!window.__SESSION_CHECK_STARTED__) {
    window.__SESSION_CHECK_STARTED__ = true;

    setInterval(() => {
      if (isSessionExpired()) {
        console.warn("🕒 Oturum süresi doldu.");
        redirectToLogin();
      }
    }, 60 * 1000);
  }

  // 🔐 Her istekten önce token kontrolü
  axiosInstance.interceptors.request.use(async (req) => {
  const state = useAuthStore.getState();

  // ⏳ Rehydrated olmadan asla işlem yapma
  if (!state.rehydrated) {
    console.warn("⏳ Rehydration bekleniyor, istek iptal.");
    throw new axios.Cancel("Rehydration tamamlanmadı");
  }

  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  updateLastActivity();
  
  if (!access || !refresh || isSessionExpired()) {
    redirectToLogin();
    throw new axios.Cancel("Token yok veya süresi doldu");
  }

  

  if (!isAccessTokenExpired(access)) {
    req.headers.Authorization = `Bearer ${access}`;
    return req;
  }

  try {
    const refreshed = await getRefreshedToken(refresh);
    setAuthUser(refreshed.access, refreshed.refresh);
    req.headers.Authorization = `Bearer ${refreshed.access}`;
    return req;
  } catch (err) {
    redirectToLogin();
    throw new axios.Cancel("Token yenileme başarısız");
  }
});

  return axiosInstance;
};

export default useAxios;
