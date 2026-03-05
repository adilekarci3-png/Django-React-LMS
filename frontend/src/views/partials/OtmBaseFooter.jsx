import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaFacebookF, FaTwitter } from "react-icons/fa";

/** OTM – Footer (kırmızı tema, Akademi/ESKEP footer ile aynı yapı) */
export default function OTMBaseFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="otm-footer">
      <div className="otm-footer__container">
        <div className="otm-footer__cols">

          {/* Sütun 1 */}
          <div>
            <div className="otm-footer__brand">
              <span className="otm-footer__brand-mark">
                <i className="bi bi-people-fill"></i>
              </span>
              OTM
            </div>
            <p className="otm-footer__text">
              81 ilde şube ve temsilciliklerimizle sahih Kur'an eğitimi, kamp programları,
              yarışmalar ve motivasyon seminerleri düzenliyoruz.
            </p>
            <div className="otm-footer__social">
              <a href="#" aria-label="Facebook"><FaFacebookF size={14} /></a>
              <a href="#" aria-label="Twitter/X"><FaTwitter size={14} /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub size={16} />
              </a>
            </div>
          </div>

          {/* Sütun 2 */}
          <div>
            <h6 className="otm-footer__col-title">Kuruluş</h6>
            <div className="otm-footer__text">
              <div><Link className="otm-footer__link" to="/about-otm">Hakkında</Link></div>
              <div><Link className="otm-footer__link" to="/donate">Bağış</Link></div>
              <div><Link className="otm-footer__link" to="/academy">Eğitim Portalı Akademi</Link></div>
              <div><Link className="otm-footer__link" to="/otm/contact">İletişim</Link></div>
            </div>
          </div>

          {/* Sütun 3 */}
          <div>
            <h6 className="otm-footer__col-title">Destek</h6>
            <div className="otm-footer__text">
              <div><Link className="otm-footer__link" to="/help">Yardım ve Destek</Link></div>
              <div><Link className="otm-footer__link" to="/become-trainer">Eğitmen Ol</Link></div>
              <div><Link className="otm-footer__link" to="/faq">SSS</Link></div>
              <div><Link className="otm-footer__link" to="/courses">Dersler</Link></div>
            </div>
          </div>

          {/* Sütun 4 */}
          <div>
            <h6 className="otm-footer__col-title">İletişimde Kalın</h6>
            <address className="otm-footer__text">
              Anafartalar Cad. Gülhane İşhanı No: 62/33, Altındağ / Ankara
            </address>
            <p className="otm-footer__text" style={{ margin: "8px 0 4px" }}>
              E-posta:{" "}
              <a className="otm-footer__link" href="mailto:bilgi@ehad.org.tr">
                bilgi@sinaps.org.tr
              </a>
            </p>
            <p className="otm-footer__text" style={{ margin: 0 }}>
              Telefon: <strong>+90 312 324 00 34</strong>
            </p>
          </div>
        </div>

        {/* Alt şerit */}
        <div className="otm-footer__bottom">
          <small className="otm-footer__text">© {year} Eğitim Portalı · Tüm hakları saklıdır</small>
          <div className="otm-footer__legal">
            <Link className="otm-footer__link" to="/kvkk">KVKK</Link>
            <Link className="otm-footer__link" to="/terms">Kullanım Şartları</Link>
            <Link className="otm-footer__link" to="/privacy">Gizlilik</Link>
          </div>
        </div>
      </div>

      <style>{`
        .otm-footer {
          background: linear-gradient(135deg, #7f0000 0%, #b71c1c 50%, #e53935 100%);
          color: #fff0f0;
          padding: 48px 0 24px;
          box-shadow: 0 8px 28px rgba(127,0,0,0.25) inset;
        }

        .otm-footer__container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 48px;
        }

        .otm-footer__brand {
          display: flex; align-items: center; gap: 8px;
          font-weight: 900; font-size: 1.05rem;
          color: #fff; margin-bottom: 10px;
        }
        .otm-footer__brand-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.20);
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff; font-size: 14px;
          border: 1px solid rgba(255,255,255,0.25);
        }

        .otm-footer__cols {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px;
        }

        .otm-footer__col-title {
          font-size: .78rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: #ffcdd2;
          font-weight: 800;
          margin: 0 0 12px;
        }

        .otm-footer__text {
          color: rgba(255,240,240,0.88);
          line-height: 1.75;
          font-size: 0.9rem;
        }

        .otm-footer__link {
          color: rgba(255,240,240,0.88);
          text-decoration: none;
          transition: color .15s;
        }
        .otm-footer__link:hover {
          color: #fff; text-decoration: underline;
        }

        .otm-footer__social {
          display: flex; gap: 8px; margin-top: 12px;
        }
        .otm-footer__social a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.22);
          transition: transform .15s, background .15s;
        }
        .otm-footer__social a:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.25);
        }

        .otm-footer__bottom {
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,0.18);
          margin-top: 32px; padding-top: 18px;
          font-size: 0.82rem;
        }

        .otm-footer__legal {
          display: flex; gap: 16px; flex-wrap: wrap;
        }

        .otm-footer address { font-style: normal; }

        @media (max-width: 991.98px) {
          .otm-footer__cols { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .otm-footer__container { padding: 0 24px; }
        }
        @media (max-width: 575.98px) {
          .otm-footer__cols { grid-template-columns: 1fr; }
          .otm-footer__bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}