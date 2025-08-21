import React from "react";
import { Link } from "react-router-dom";

function HomeHeader() {
  return (
    <header
      style={{
        background: "linear-gradient(to right, #0077b6, #023e8a)",
        color: "#fff",
        padding: "1rem 0",
      }}
    >
      <div className="container d-flex justify-content-between align-items-center">
        <h2 className="mb-0 fw-bold">
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            EHAD Akademi
          </Link>
        </h2>

        <nav>
          <Link to="/" className="mx-3 text-white text-decoration-none">
            Anasayfa
          </Link>
          <Link to="/about" className="mx-3 text-white text-decoration-none">
            Hakkımızda
          </Link>
          <Link to="/contact" className="mx-3 text-white text-decoration-none">
            İletişim
          </Link>
          <Link to="/login" className="btn btn-outline-light btn-sm mx-2">
            Giriş Yap
          </Link>
          <Link to="/register" className="btn btn-light btn-sm">
            Kayıt Ol
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default HomeHeader;
