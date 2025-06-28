import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";

// Kullanıcı Giriş
export const login = async (email, password) => {
  try {
    const { data, status } = await axios.post(`user/token/`, {
      email,
      password,
    });

    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.detail || "Something went wrong",
    };
  }
};

// Kullanıcı Kayıt
export const register = async (full_name, email, password, password2) => {
  try {
    const { data } = await axios.post(`user/register/`, {
      full_name,
      email,
      password,
      password2,
    });

    await login(email, password);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        `${error.response?.data?.full_name || ""} - ${error.response?.data?.email || ""}` ||
        "Something went wrong",
    };
  }
};

// Çıkış
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  useAuthStore.getState().setUser(null);
};

// Kullanıcıyı Ayarla
export const setUser = async () => {
  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  if (!access_token || !refresh_token) {
    // Swal.fire("Uyarı", "Token bilgileri eksik.", "warning");
    return;
  }

  if (isAccessTokenExpired()) {
    try {
      const response = await getRefreshedToken(refresh_token);
      setAuthUser(response.access, response.refresh);
    } catch (err) {
      Swal.fire("Oturum Süresi Doldu", "Lütfen tekrar giriş yapınız", "error");
      logout();
    }
  } else {
    setAuthUser(access_token, refresh_token);
  }
};

// Token'ları localStorage'a kaydet ve kullanıcıyı ayarla
export const setAuthUser = (access_token, refresh_token) => {
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  try {
    const user = jwt_decode(access_token);
    if (user) {
      useAuthStore.getState().setUser(user);
    }
  } catch (error) {
    console.error("JWT decode hatası:", error);
  }

  useAuthStore.getState().setLoading(false);
};

// Token Yenileme
export const getRefreshedToken = async (refresh_token) => {
  const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh_token }),
  });

  if (!response.ok) {
    throw new Error("Token yenileme başarısız");
  }

  return await response.json(); // { access, refresh }
};

// Token süresi dolmuş mu kontrol et
export const isAccessTokenExpired = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (error) {
    return true; // decode hatasında expired gibi davran
  }
};
