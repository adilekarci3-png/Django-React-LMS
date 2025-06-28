import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function HBSBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [setRoleData] = useAuthStore((state) => [state.setRoleData]);
  const [isLoggedIn, user, logout] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
    state.logout,
  ]);

  const api = useAxios();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await api.get(`user-role-detail/`);
        setRoleData(res.data); // ⬅ burada store'a yazılıyor
      } catch (err) {
        console.error("Rol bilgisi alınamadı:", err);
      }
    };
    if (isLoggedIn()) fetchRole();
  }, [isLoggedIn]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search/?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout(); // auth store'dan çıkışı tetikler
    navigate("/login"); // çıkış sonrası login sayfasına yönlendir
  };

  return (
    <header
      style={{
        background: "linear-gradient(45deg, #006d77, #83c5be)",
        color: "white",
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            HBS
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/hbs/about/">
                  Hakkımızda
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/hbs/contact/">
                  İletişim
                </Link>
              </li>
            </ul>
            <div className="d-flex align-items-center gap-2">
              <input
                type="search"
                className="form-control me-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara"
              />
              <button className="btn btn-outline-light" onClick={handleSearch}>
                Ara
              </button>

              {isLoggedIn() ? (
                <>
                  <Link to="/profile" className="btn btn-light">
                    Profil
                  </Link>
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-light">
                    Giriş Yap
                  </Link>
                  <Link to="/register" className="btn btn-outline-light">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HBSBaseHeader;
