import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaFacebookF, FaTwitter } from "react-icons/fa";

function AkademiBaseFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="akd-footer">
      <div className="akd-footer__container">
        <div className="akd-footer__cols">
          <div>
            <div className="akd-footer__brand">
              <span className="akd-footer__brand-mark">
                <i className="bi bi-mortarboard-fill"></i>
              </span>
              Eğitim Portalı
            </div>
            <p className="akd-footer__text">
              81 ilde şube ve temsilciliklerimizle sahih Kur'an eğitimi, kamp programları,
              yarışmalar ve motivasyon seminerleri düzenliyoruz.
            </p>
            <div className="akd-footer__social">
              <a href="#" aria-label="Facebook"><FaFacebookF size={14} /></a>
              <a href="#" aria-label="Twitter/X"><FaTwitter size={14} /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub size={16} />
              </a>
            </div>
          </div>

          <div>
            <h6 className="akd-footer__col-title">Kuruluş</h6>
            <div className="akd-footer__text">
              <div><Link className="akd-footer__link" to="/about-eskep">Hakkında</Link></div>
              <div><Link className="akd-footer__link" to="/donate">Bağış</Link></div>
              <div><Link className="akd-footer__link" to="/academy">Eğitim Portalı Akademi</Link></div>
              <div><Link className="akd-footer__link" to="/contact">İletişim</Link></div>
            </div>
          </div>

          <div>
            <h6 className="akd-footer__col-title">Destek</h6>
            <div className="akd-footer__text">
              <div><Link className="akd-footer__link" to="/help">Yardım ve Destek</Link></div>
              <div><Link className="akd-footer__link" to="/become-trainer">Eğitmen Ol</Link></div>
              <div><Link className="akd-footer__link" to="/faq">SSS</Link></div>
              <div><Link className="akd-footer__link" to="/courses">Dersler</Link></div>
            </div>
          </div>

          <div>
            <h6 className="akd-footer__col-title">İletişimde Kalın</h6>
            <address className="akd-footer__text">
              Anafartalar Cad. Gülhane İşhanı No: 62/33, Altındağ / Ankara
            </address>
            <p className="akd-footer__text" style={{ margin: "8px 0 4px" }}>
              E-posta:{" "}
              <a className="akd-footer__link" href="mailto:bilgi@ehad.org.tr">
                bilgi@egitimportali.com
              </a>
            </p>
            <p className="akd-footer__text" style={{ margin: 0 }}>
              Telefon: <strong>+90 312 324 00 34</strong>
            </p>
          </div>
        </div>

        <div className="akd-footer__bottom">
          <small className="akd-footer__text">© {year} Eğitim Portalı · Tüm hakları saklıdır</small>
          <div className="akd-footer__legal">
            <Link className="akd-footer__link" to="/kvkk">KVKK</Link>
            <Link className="akd-footer__link" to="/terms">Kullanım Şartları</Link>
            <Link className="akd-footer__link" to="/privacy">Gizlilik</Link>
          </div>
        </div>
      </div>

      <style>{`
        .akd-footer {
          background: #fff;
          border-top: 1px solid #e4ede9;
          color: #52756a;
          padding: 48px 0 24px;
        }

        .akd-footer__container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 48px;
        }

        .akd-footer__brand {
          display: flex; align-items: center; gap: 8px;
          font-weight: 900; font-size: 1.05rem;
          color: #111c17; margin-bottom: 10px;
        }
        .akd-footer__brand-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: #16a05a;
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff; font-size: 14px;
        }

        .akd-footer__cols {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px;
        }

        .akd-footer__col-title {
          font-size: .78rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: #16a05a;
          font-weight: 800;
          margin: 0 0 12px;
        }

        .akd-footer__text {
          color: #52756a;
          line-height: 1.75;
          font-size: 0.9rem;
        }

        .akd-footer__link {
          color: #52756a;
          text-decoration: none;
          transition: color .15s;
        }
        .akd-footer__link:hover { color: #0d7a42; text-decoration: underline; }

        .akd-footer__social {
          display: flex; gap: 8px; margin-top: 12px;
        }
        .akd-footer__social a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 10px;
          background: #e8f5ef; color: #16a05a;
          border: 1px solid #d1eddf;
          transition: transform .15s, background .15s;
        }
        .akd-footer__social a:hover {
          transform: translateY(-2px);
          background: #d1eddf;
        }

        .akd-footer__bottom {
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; flex-wrap: wrap;
          border-top: 1px solid #e4ede9;
          margin-top: 32px; padding-top: 18px;
          font-size: 0.82rem;
        }

        .akd-footer__legal {
          display: flex; gap: 16px; flex-wrap: wrap;
        }

        address { font-style: normal; }

        @media (max-width: 991.98px) {
          .akd-footer__cols { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .akd-footer__container { padding: 0 24px; }
        }
        @media (max-width: 575.98px) {
          .akd-footer__cols { grid-template-columns: 1fr; }
          .akd-footer__bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}

export default AkademiBaseFooter;