import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";

export const login = async (email, password) => {
  try {
    const { data } = await axios.post("http://127.0.0.1:8000/api/v1/user/token/", { email, password });
    if (data.access && data.refresh) {
      setAuthUser(data.access, data.refresh);
      return { data, error: null };
    }
    return { data: null, error: "Geçersiz yanıt" };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.detail || "Giriş sırasında hata oluştu",
    };
  }
};

export const logout = () => {  
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  useAuthStore.getState().setUser(null);

  // Eğer açık sayfadaysa, yönlendirme yapma!
  if (!window.location.pathname.startsWith("/login")) {
    // window.location.href = "/login"; // ❗ İstersen bu satırı kaldır
  }
};

export const setUser = async () => { 
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  const setRehydrated = useAuthStore.getState().setRehydrated;

  if (!access || !refresh) {
    setRehydrated();
    return;
  }

  if (isAccessTokenExpired(access)) {
    try {
      const refreshed = await getRefreshedToken(refresh);
      setAuthUser(refreshed.access, refreshed.refresh);
    } catch {
      logout();
    }
  } else {
    setAuthUser(access, refresh);
  }

  setRehydrated();
};

export const setAuthUser = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);

  try {
    const decoded = jwt_decode(access);   
    if (decoded) {
      useAuthStore.getState().setUser(decoded, access);      
    }
  } catch (err) {
    console.error("JWT çözümleme hatası:", err);
  }
};

export const getRefreshedToken = async (refreshToken) => {
  const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) throw new Error("Token yenileme başarısız");
  return await response.json();
};

export const isAccessTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
};

export const register = async (full_name, email, password, password2) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/v1/user/register/", {
      full_name,
      email,
      password,
      password2,
    });

    // Kayıt başarılıysa otomatik login
    const { data, error } = await login(email, password);
    return { data: response.data, error };
  } catch (error) {
    const errData = error.response?.data || {};
    const errMsg =
      errData.full_name ||
      errData.email ||
      errData.non_field_errors ||
      errData.password ||
      "Kayıt sırasında bir hata oluştu";

    return {
      data: null,
      error: Array.isArray(errMsg) ? errMsg.join(" ") : errMsg,
    };
  }
};