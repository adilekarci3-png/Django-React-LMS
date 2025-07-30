import { useAuthStore } from "../../store/auth";

function UserData() {
  const rehydrated = useAuthStore((state) => state.rehydrated);
  const allUserData = useAuthStore((state) => state.allUserData);

  if (!rehydrated) return null; // store hazır değil
  return allUserData;
}

export default UserData;