import axios from "axios";
import { getRefreshedToken, isAccessTokenExpired, setAuthUser } from "./auth";
import { API_BASE_URL } from "./constants";

const useAxios = () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    // Doğru kullanım: fonksiyon çağrılıyor
    if (!isAccessTokenExpired()) {
      return req;
    }

    try {
      const response = await getRefreshedToken(refreshToken);
      setAuthUser(response.access, response.refresh);
      req.headers.Authorization = `Bearer ${response.access}`;
    } catch (err) {
      console.error("Token yenileme başarısız", err);
      // Logout işlemi yapılabilir
    }

    return req;
  });

  return axiosInstance;
};

export default useAxios;
