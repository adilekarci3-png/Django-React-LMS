// import useUserData  from "../views/plugin/useUserData ";
import { useAuthStore } from "../store/auth";

const store = useAuthStore.getState(); // ✅ Hook değil, doğrudan store

export const API_BASE_URL = `http://127.0.0.1:8000/api/v1/`;
export const BASE_URL = `http://127.0.0.1:8000/`;
export const PAYPAL_CLIENT_ID = "test";

// Dinamik kullanıcı bilgileri (hook kullanılmadan)
export const userId = store?.allUserData?.user_id || null;
export const teacherId = store?.allUserData?.teacher_id || null;





