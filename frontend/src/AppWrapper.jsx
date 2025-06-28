// src/AppWrapper.jsx
import { useState, useEffect } from "react";
import useAxios from "./utils/useAxios";
import UserData from "./views/plugin/UserData";
import apiInstance from "./utils/axios";
import { CartContext, ProfileContext } from "./views/plugin/Context";
import App from "./App"; // senin yukarıdaki App yapın

function AppWrapper() {
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const axiosJWT = useAxios();
  const user = UserData();

  useEffect(() => {
    apiInstance.get(`course/cart-list/${localStorage.getItem("cart_id")}/`).then((res) => {
      setCartCount(res.data?.length || 0);
    });

    if (user?.user_id) {
      axiosJWT
        .get(`user/profile/${user.user_id}/`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.warn("Profil alınamadı:", err));
    }
  }, [user?.user_id]);

  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <ProfileContext.Provider value={[profile, setProfile]}>
        <App />
      </ProfileContext.Provider>
    </CartContext.Provider>
  );
}

export default AppWrapper;
