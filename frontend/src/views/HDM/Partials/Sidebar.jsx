import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="card shadow-sm p-3 bg-white h-100">
      <h5 className="fw-bold mb-3 text-primary">📚 Menü</h5>
      <ul className="list-unstyled">
        <li className="mb-2">
          <Link className="btn btn-light w-100 text-start" to="/hdm/dashboard">
            <i className="bi bi-house-door me-2"></i> Ana Panel
          </Link>
        </li>
        <li className="mb-2">
          <Link className="btn btn-light w-100 text-start" to="/hdm/hafizlar">
            <i className="fas fa-users me-2"></i> Hafızlarım
          </Link>
        </li>
        <li className="mb-2">
          <Link className="btn btn-light w-100 text-start" to="/hdm/dersler">
            <i className="fas fa-calendar-alt me-2"></i> Dersler
          </Link>
        </li>
        <li className="mb-2">
          <Link className="btn btn-light w-100 text-start" to="/hdm/hatalar">
            <i className="fas fa-exclamation-triangle me-2"></i> Hatalar
          </Link>
        </li>
        <li className="mb-2">
          <Link className="btn btn-light w-100 text-start" to="/hdm/profil">
            <i className="fas fa-user-cog me-2"></i> Profil
          </Link>
        </li>
        <li>
          <Link className="btn btn-danger w-100 text-start" to="/logout">
            <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
