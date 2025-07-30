import { useAuthStore } from "../../store/auth";

export default function useUserData() {
  const rehydrated = useAuthStore((state) => state.rehydrated);
  const allUserData = useAuthStore((state) => state.allUserData);

  return rehydrated ? allUserData : null;
}