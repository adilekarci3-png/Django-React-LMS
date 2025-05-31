import axios from "axios";
import { getRefreshedToken, isAccessTokenExpired, setAuthUser } from "./auth";
import { API_BASE_URL } from "./constants";

const useAxios = () => {
  const refreshToken = localStorage.getItem("refresh_token");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  axiosInstance.interceptors.request.use(async (req) => {
    let accessToken = localStorage.getItem("access_token");

    // Token süresi dolmamışsa doğrudan ekle
    if (!isAccessTokenExpired()) {
      req.headers.Authorization = `Bearer ${accessToken}`;
      return req;
    }

    // Süresi dolmuşsa yeni token al
    try {
      const response = await getRefreshedToken(refreshToken);
      const newAccessToken = response.access;
      const newRefreshToken = response.refresh;

      // localStorage'a yaz
      setAuthUser(newAccessToken, newRefreshToken);

      // Yeni access token'ı isteğe ekle
      req.headers.Authorization = `Bearer ${newAccessToken}`;
      return req;
    } catch (error) {
      console.error("Token yenileme başarısız:", error);
      // Gerekirse logout işlemi yapılabilir
      return req; // yine de isteği geri döndür ama token olmayabilir
    }
  });

  return axiosInstance;
};

export default useAxios;
