import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import Loading from "../views/partials/Loading";

function PrivateRoute({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn());
  const rehydrated = useAuthStore((state) => state.rehydrated);

  if (!rehydrated) {
    return <Loading />; // 🔁 Zustand hazır değilse yükleniyor göster
  }

  return isLoggedIn ? children : <Navigate to="/login/" replace />;
}

export default PrivateRoute;
