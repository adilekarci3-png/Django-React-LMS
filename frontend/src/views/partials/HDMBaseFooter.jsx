import React from "react";
import { Link } from "react-router-dom";
import "./css/HDMGirisPage.css";
function HDMBaseFooter() {
  return (
    <footer className="hdm-min-footer text-light">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="text-white mb-2">HDM</h5>
            <p className="text-footer m-0">
              Hafız dinleme, planlama ve hata takibini modern bir akışla birleştirir.
            </p>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="text-white mb-2">Sistem</h6>
            <ul className="list-unstyled m-0">
              <li><Link className="footer-link" to="/about-hdm">Hakkında</Link></li>
              <li><Link className="footer-link" to="/support">Destek</Link></li>
              <li><Link className="footer-link" to="/changelog">Güncellemeler</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="text-white mb-2">Kaynaklar</h6>
            <ul className="list-unstyled m-0">
              <li><Link className="footer-link" to="/docs">Kullanım Kılavuzu</Link></li>
              <li><Link className="footer-link" to="/help">Yardım</Link></li>
              <li><Link className="footer-link" to="/faq">SSS</Link></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="text-white mb-2">İletişim</h6>
            <p className="text-footer m-0">Cinnah Cd. No:12 Çankaya / Ankara</p>
            <p className="text-footer m-0">E: <a href="mailto:hdm@kuransistemi.org" className="footer-link">hdm@kuransistemi.org</a></p>
            <p className="text-footer m-0">T: +90 312 000 00 00</p>
          </div>
        </div>
      </div>
      <div className="hdm-min-footer__bottom">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <small className="text-footer">© {new Date().getFullYear()} HDM. Tüm hakları saklıdır.</small>
          <div className="d-flex gap-3">
            <Link to="/kvkk" className="footer-link small">KVKK</Link>
            <Link to="/terms" className="footer-link small">Kullanım Şartları</Link>
            <Link to="/privacy" className="footer-link small">Gizlilik</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HDMBaseFooter;
