import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function HBSBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [setRoleData] = useAuthStore((state) => [state.setRoleData]);
  const [hasSubRole] = useAuthStore((state) => [state.hasSubRole]);
  const rehydrated = useAuthStore((state) => state.rehydrated);
  const [isLoggedIn, user, logout, roleData] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
    state.logout,
    state.roleData,
  ]);

  const api = useAxios();

  useEffect(() => {
    if (rehydrated && !isLoggedIn) {
      navigate("/login/");
    }
    const fetchRole = async () => {
      try {
        const res = await api.get(`user-role-detail/`);
        setRoleData(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Rol bilgisi alınamadı:", err);
      }
    };
    if (isLoggedIn()) fetchRole();
  }, [isLoggedIn, rehydrated]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search/?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    debugger;
    // navigate("/login");
  };

  return (
    <header
      style={{
        background: "linear-gradient(45deg, #3b82f6, #7c3aed)",
        color: "white",
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark fs-5">
        <div className="container">
          <Link className="navbar-brand" to="/">
            HBS
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Menüyü Aç/Kapat"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/about-hbs">
                  Hakkımızda
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">
                  İletişim
                </Link>
              </li>

              {isLoggedIn() && hasSubRole("HBSTemsilci") ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="hafizDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Hafız İşlemleri
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="hafizDropdown">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/hafizbilgi/create-hafizbilgi/"
                      >
                        Hafız Bilgi Ekle
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/hafizbilgi/list/">
                        Hafız Bilgileri
                      </Link>
                    </li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/hafizbilgi/create-hafizbilgi/"
                  >
                    Hafız Bilgi Ekle
                  </Link>
                </li>
              )}
            </ul>
            <div className="d-flex align-items-center gap-2">
              <input
                type="search"
                className="form-control form-control-lg me-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara"
              />
              <button
                className="btn btn-outline-light btn-lg"
                onClick={handleSearch}
              >
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
