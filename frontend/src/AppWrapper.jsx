import { useEffect, useState } from "react";
import { useAuthStore } from "./store/auth";
import useAxios from "./utils/useAxios";
import { CartContext, ProfileContext } from "./views/plugin/Context";
import App from "./App";
import Loading from "./views/partials/Loading";
import { setUser } from "./utils/auth"; // ✅ Eklenmeli

function AppWrapper() {
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState(null);

  const axiosJWT = useAxios();
  const user = useAuthStore((state) => state.user?.());
  const rehydrated = useAuthStore((state) => state.rehydrated);

  // ✅ 1. Uygulama açıldığında JWT'den kullanıcıyı yükle
  useEffect(() => {
    setUser();
  }, []);

  // ✅ 2. rehydrated ve user geldiyse profil getir
  useEffect(() => {
    if (!rehydrated || !user?.user_id) return;

    axiosJWT
      .get(`user/profile/${user.user_id}/`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.warn("Profil alınamadı:", err));
  }, [rehydrated, user?.user_id]);

  // ✅ 3. Henüz rehydrate edilmediyse loading göster
  if (!rehydrated) return <Loading />;

  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <ProfileContext.Provider value={[profile, setProfile]}>
        <App />
      </ProfileContext.Provider>
    </CartContext.Provider>
  );
}

export default AppWrapper;
