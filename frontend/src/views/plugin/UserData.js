import jwtDecode from "jwt-decode";

function UserData() {
  const access_token = localStorage.getItem("access_token");

  if (!access_token) return null;

  try {
    const decoded = jwtDecode(access_token);
    // Token süresi kontrolü (isteğe bağlı)
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) {
      console.warn("Access token süresi dolmuş.");
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token decode hatası:", error);
    return null;
  }
}

export default UserData;
