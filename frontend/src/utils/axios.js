import axios from "axios";
import { API_BASE_URL, API_BASE_TEST_URL } from "./constants";

const normalizeBase = (u) => (u && u.endsWith("/") ? u : (u || "") + "/");
// const baseRaw =
//   API_BASE_URL || API_BASE_TEST_URL || "http://127.0.0.1:8000/api/v1/";
const baseRaw =API_BASE_URL;
const BASE_URL = normalizeBase(baseRaw);

/**
 * Bu instance'ı "auth gerektirmeyen" uçlar (login, register, public listeler)
 * için kullan. Yetkili istekler için useAxios() dönen instance'ı kullan.
 */
const apiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

export default apiInstance;


