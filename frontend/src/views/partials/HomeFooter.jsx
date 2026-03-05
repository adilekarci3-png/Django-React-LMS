import React from "react";
import { Link } from "react-router-dom";

function HomeFooter() {
  return (
    <footer className="footer-wrap text-light mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <h4 className="text-white mb-3">Sinaps</h4>
            <p className="text-footer">
              81 ilde temsilciliklerimizle Kur’an-ı Kerim’i sahih ve güzel okuma,
              hafızlık kamp programları, motivasyon seminerleri ve daha fazlası.
            </p>
            <div className="tiny-badges d-flex gap-2 mt-3">
              <span className="tiny-badge">Hafızlık</span>
              <span className="tiny-badge">Seminer</span>
              <span className="tiny-badge">Akademi</span>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white mb-3">Bağlantılar</h6>
            <ul className="list-unstyled m-0">
              <li><Link to="/about-ehad" className="footer-link">Hakkımızda</Link></li>
              <li><Link to="/donate" className="footer-link">Bağış</Link></li>
              <li><Link to="/academy" className="footer-link">Akademi</Link></li>
              <li><Link to="/contact" className="footer-link">İletişim</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-white mb-3">İletişim</h6>
            <address className="m-0 text-footer">
              Anafartalar Cad. Gülhane İşhanı No: 62/33<br />
              Altındağ / Ankara
            </address>
            <p className="text-footer mt-2 mb-1">E-posta: <a href="mailto:bilgi@ehad.org.tr" className="footer-link">bilgi@sinaps.org.tr</a></p>
            <p className="text-footer m-0">Telefon: <a href="tel:+903123240034" className="footer-link">+90 312 324 00 34</a></p>
          </div>

          <div className="col-md-3">
            <h6 className="text-white mb-3">Bülten</h6>
            <p className="text-footer">Etkinlik ve duyurular için e-posta adresinizi bırakın.</p>
            <form className="d-flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                className="form-control form-control-sm footer-input"
                placeholder="ornek@mail.com"
                aria-label="Bülten e-posta"
              />
              <button className="btn btn-grad btn-sm" type="submit">Kaydol</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom py-3">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <small className="text-footer">&copy; {new Date().getFullYear()} Sinaps. Tüm hakları saklıdır.</small>
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

export default HomeFooter;
