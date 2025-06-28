// GÜNCELLENMİŞ useAxios.js - Otomatik token yenileme, güvenli çıkış, session timeout ve düzenli oturum kontrolü

import axios from "axios";
import { getRefreshedToken, isAccessTokenExpired, setAuthUser, logout } from "./auth";
import { API_BASE_URL } from "./constants";

const useAxios = () => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  // Session timeout ayarı (örn. 30 dakika)
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  const lastActivityKey = "last_user_activity";

  const isSessionExpired = () => {
    const lastActivity = localStorage.getItem(lastActivityKey);
    if (!lastActivity) return false;
    const now = Date.now();
    return now - parseInt(lastActivity, 10) > SESSION_TIMEOUT_MS;
  };

  const updateLastActivity = () => {
    localStorage.setItem(lastActivityKey, Date.now().toString());
  };

  // Oturum kontrolü belirli aralıklarla yapılır (örnek: 1 dk)
  setInterval(() => {
    if (isSessionExpired()) {
      console.warn("Oturum zaman aşımı - kontrol aralığında çıkış yapılıyor.");
      logout();
      localStorage.removeItem(lastActivityKey);
      window.location.href = "/login";
    }
  }, 60 * 1000); // her 60 saniyede bir kontrol

  axiosInstance.interceptors.request.use(async (req) => {
    let accessToken = localStorage.getItem("access_token");
    let refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      console.warn("Token bilgisi eksik. Oturum kapatılıyor.");
      logout();
      window.location.href = "/login";
      return req;
    }

    if (isSessionExpired()) {
      console.warn("Oturum zaman aşımına uğradı. Çıkış yapılıyor.");
      logout();
      localStorage.removeItem(lastActivityKey);
      window.location.href = "/login";
      return req;
    }

    updateLastActivity();

    if (!isAccessTokenExpired()) {
      req.headers.Authorization = `Bearer ${accessToken}`;
      return req;
    }

    try {
      const response = await getRefreshedToken(refreshToken);
      const newAccessToken = response.access;
      const newRefreshToken = response.refresh;

      setAuthUser(newAccessToken, newRefreshToken);
      req.headers.Authorization = `Bearer ${newAccessToken}`;
      return req;
    } catch (err) {
      console.error("Token yenileme başarısız:", err);
      logout();
      localStorage.removeItem(lastActivityKey);
      window.location.href = "/login";
      return req;
    }
  });

  return axiosInstance;
};

export default useAxios;
