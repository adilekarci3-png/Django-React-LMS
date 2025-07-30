// src/views/plugin/Loading.jsx
import React from "react";

function Loading() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-3">Oturum yükleniyor...</p>
    </div>
  );
}

export default Loading;
