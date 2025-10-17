import React from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

function ESKEPBaseFooter() {
  return (
    <footer className="hdm-min-footer eskep-theme text-light">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-2">EHAD</h4>
            <p className="text-footer m-0">
              81 ilde şube ve temsilciliklerimizle sahih Kur’an eğitimi, kamp programları,
              yarışmalar ve motivasyon seminerleri düzenliyoruz.
            </p>
            <div className="d-flex gap-3 fs-5 mt-3">
              <a href="#" className="footer-link" aria-label="Facebook">
                <i className="bi bi-facebook" />
              </a>
              <a href="#" className="footer-link" aria-label="Twitter/X">
                <i className="bi bi-twitter" />
              </a>
              <a
                href="https://github.com"
                target="_blank" rel="noopener noreferrer"
                className="footer-link" aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white mb-2">Kuruluş</h6>
            <ul className="list-unstyled m-0">
              <li><Link to="/about-eskep" className="footer-link">Hakkında</Link></li>
              <li><Link to="/donate" className="footer-link">Bağış</Link></li>
              <li><Link to="/academy" className="footer-link">EHAD Akademi</Link></li>
              <li><Link to="/contact" className="footer-link">İletişim</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white mb-2">Destek</h6>
            <ul className="list-unstyled m-0">
              <li><Link to="/help" className="footer-link">Yardım ve Destek</Link></li>
              <li><Link to="/become-trainer" className="footer-link">Eğitmen Ol</Link></li>
              <li><Link to="/faq" className="footer-link">SSS</Link></li>
              <li><Link to="/courses" className="footer-link">Dersler</Link></li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h6 className="text-white mb-2">İletişimde Kalın</h6>
            <address className="m-0 text-footer">
              Anafartalar Cad. Gülhane İşhanı No: 62/33, Altındağ / Ankara
            </address>
            <p className="text-footer mt-2 mb-1">
              E-posta: <a href="mailto:bilgi@ehad.org.tr" className="footer-link">bilgi@ehad.org.tr</a>
            </p>
            <p className="text-footer m-0">
              Telefon: <span className="fw-semibold">+90 312 324 00 34</span>
            </p>
          </div>
        </div>

        <div className="row g-0 border-top py-2 mt-4">
          <div className="col-12 d-flex flex-column flex-md-row align-items-center justify-content-between">
            <small className="text-footer">© {new Date().getFullYear()} EHAD. Tüm hakları saklıdır.</small>
            <div className="d-flex gap-3">
              <Link to="/kvkk" className="footer-link small">KVKK</Link>
              <Link to="/terms" className="footer-link small">Kullanım Şartları</Link>
              <Link to="/privacy" className="footer-link small">Gizlilik</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ESKEPBaseFooter;
