import React from "react";
import "./css/hbs-theme.css";

function HBSBaseFooter() {
  return (
    <footer className="hdm-min-footer hbs-theme text-light">
      <div className="container mt-lg-2 py-5">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-12">
            <div className="mb-4">
              <h1 className="text-white">HBS</h1>
              <p className="mt-3 text-footer">
                HBS; hafız profilleri, ders planlama ve hata takibini kolaylaştıran bütünleşik bir platformdur.
              </p>
              <div className="fs-4 mt-3">
                <a href="#" className="me-2 footer-link"><i className="bi bi-facebook"></i></a>
                <a href="#" className="me-2 footer-link"><i className="bi bi-twitter"></i></a>
                <a href="#" className="footer-link"><i className="bi bi-github"></i></a>
              </div>
            </div>
          </div>

          <div className="offset-lg-1 col-lg-2 col-md-3 col-6">
            <div className="mb-4">
              <h4 className="text-white">Sistem</h4>
              <ul className="list-unstyled">
                <li><a href="#" className="footer-link">Hakkında</a></li>
                <li><a href="#" className="footer-link">Destek</a></li>
                <li><a href="#" className="footer-link">Güncellemeler</a></li>
              </ul>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <div className="mb-4">
              <h4 className="text-white">Kaynaklar</h4>
              <ul className="list-unstyled">
                <li><a href="#" className="footer-link">Yardım</a></li>
                <li><a href="#" className="footer-link">Kullanım Kılavuzu</a></li>
                <li><a href="#" className="footer-link">SSS</a></li>
              </ul>
            </div>
          </div>

          <div className="col-lg-3 col-md-12">
            <div className="mb-4">
              <h4 className="text-white">İletişim</h4>
              <p className="text-footer">Cinnah Caddesi No:12 Çankaya / Ankara</p>
              <p className="text-footer">Eposta: <a href="#" className="footer-link">hbs@ehad.org.tr</a></p>
              <p className="text-footer">Telefon: <span className="fw-semibold">+90 312 000 00 00</span></p>
            </div>
          </div>
        </div>

        <div className="row align-items-center g-0 border-top py-2 mt-4">
          <div className="col-md-10 col-12">
            <p className="text-footer m-0">
              Copyright &copy; {new Date().getFullYear()} HBS. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HBSBaseFooter;