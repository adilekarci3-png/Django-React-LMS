import React from 'react';


function HDMBaseFooter() {
  return (
    <footer className="pt-lg-8 pt-5 footer" style={{ background: "linear-gradient(135deg, #1b4965,rgb(89, 117, 40))", color: "#ffffff", marginTop: "5rem" }}>
      <div className="container mt-lg-2">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-12 text-white">
            <div className="mb-4">
              <h1 className="text-white">HDM</h1>
              <p className="mt-4 text-white">
                HDM sistemi, hafız dinleme, ders planlama ve hataların takibini kolaylaştırmak için geliştirilmiş kapsamlı bir platformdur. Eğitmenler ve hafız adayları için etkili ve sade bir yönetim ortamı sunar.
              </p>
              <div className="fs-4 mt-4">
                <a href="#" className="me-2 text-white" style={{ transition: "color 0.3s" }}>
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="me-2 text-white" style={{ transition: "color 0.3s" }}>
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-white" style={{ transition: "color 0.3s" }}>
                  <i className="bi bi-github"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="offset-lg-1 col-lg-2 col-md-3 col-6">
            <div className="mb-4">
              <h4 className="text-white">Sistem</h4>
              <ul className="list-unstyled">
                <li><a href="#" className="nav-link text-white">Hakkında</a></li>
                <li><a href="#" className="nav-link text-white">Destek</a></li>
                <li><a href="#" className="nav-link text-white">Güncellemeler</a></li>
              </ul>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <div className="mb-4">
              <h4 className="text-white">Kaynaklar</h4>
              <ul className="list-unstyled">
                <li><a href="#" className="nav-link text-white">Yardım</a></li>
                <li><a href="#" className="nav-link text-white">Kullanım Kılavuzu</a></li>
                <li><a href="#" className="nav-link text-white">SSS</a></li>
              </ul>
            </div>
          </div>

          <div className="col-lg-3 col-md-12">
            <div className="mb-4">
              <h4 className="text-white">İletişim</h4>
              <p className="text-white">Cinnah Caddesi No:12 Çankaya / Ankara</p>
              <p className="text-white">Eposta: <a href="#" className="text-white">hdm@kuransistemi.org</a></p>
              <p className="text-white">Telefon: <span className="fw-semibold">+90 312 000 00 00</span></p>
            </div>
          </div>
        </div>

        <div className="row align-items-center g-0 border-top py-2 mt-6">
          <div className="col-md-10 col-12">
            <p className="text-white opacity-75">
              Copyright &copy; {new Date().getFullYear()} HDM Sistemi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HDMBaseFooter;
