// src/partials/AkademiBaseFooter.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaFacebookF, FaTwitter } from "react-icons/fa";

function AkademiBaseFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="eskep-footer">
      <div className="eskep-container top">
        <div className="cols">
          <div>
            <h4>EHAD</h4>
            <p className="text">
              81 ilde şube ve temsilciliklerimizle sahih Kur’an eğitimi, kamp programları,
              yarışmalar ve motivasyon seminerleri düzenliyoruz.
            </p>
            <div className="eskep-social">
              <a href="#" aria-label="Facebook"><FaFacebookF size={14} /></a>
              <a href="#" aria-label="Twitter/X"><FaTwitter size={14} /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={16} /></a>
            </div>
          </div>

          <div>
            <h6>Kuruluş</h6>
            <div className="text">
              <div><Link className="link" to="/about-eskep">Hakkında</Link></div>
              <div><Link className="link" to="/donate">Bağış</Link></div>
              <div><Link className="link" to="/academy">EHAD Akademi</Link></div>
              <div><Link className="link" to="/contact">İletişim</Link></div>
            </div>
          </div>

          <div>
            <h6>Destek</h6>
            <div className="text">
              <div><Link className="link" to="/help">Yardım ve Destek</Link></div>
              <div><Link className="link" to="/become-trainer">Eğitmen Ol</Link></div>
              <div><Link className="link" to="/faq">SSS</Link></div>
              <div><Link className="link" to="/courses">Dersler</Link></div>
            </div>
          </div>

          <div>
            <h6>İletişimde Kalın</h6>
            <address>Anafartalar Cad. Gülhane İşhanı No: 62/33, Altındağ / Ankara</address>
            <p className="text" style={{ margin: "8px 0 4px" }}>
              E-posta: <a className="link" href="mailto:bilgi@ehad.org.tr">bilgi@ehad.org.tr</a>
            </p>
            <p className="text" style={{ margin: 0 }}>
              Telefon: <strong>+90 312 324 00 34</strong>
            </p>
          </div>
        </div>

        <div className="bottom">
          <small className="text">© {year} EHAD. Tüm hakları saklıdır.</small>
          <div className="legal">
            <Link className="link" to="/kvkk">KVKK</Link>
            <Link className="link" to="/terms">Kullanım Şartları</Link>
            <Link className="link" to="/privacy">Gizlilik</Link>
          </div>
        </div>
      </div>

      {/* Inline styles – aqua/teal, mor yok */}
      <style>{`
        .eskep-footer {
          color: #eaf6ff;
          background: linear-gradient(135deg, #007f91 0%, #0096c7 50%, #00b4d8 100%);
          position: relative;
          padding: 48px 0 24px;
          box-shadow: 0 8px 28px rgba(0, 150, 199, .25) inset;
        }
        .eskep-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .eskep-container.top { }
        .cols {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }
        .cols h4 {
          margin: 0 0 8px;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: .02em;
          color: #ffffff;
        }
        .cols h6 {
          margin: 0 0 10px;
          font-size: .95rem;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: #e3f7ff;
          opacity: .95;
        }
        .text {
          color: rgba(255,255,255,.9);
          line-height: 1.6;
        }
        .link {
          color: rgba(255,255,255,.92);
          text-decoration: none;
        }
        .link:hover { text-decoration: underline; color: #ffffff; }
        .eskep-social {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .eskep-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          color: #0b4960;
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
          transition: transform .15s ease, filter .15s ease;
        }
        .eskep-social a:hover { transform: translateY(-2px); filter: brightness(1.05); }

        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          border-top: 1px solid rgba(255,255,255,.18);
          margin-top: 28px;
          padding-top: 16px;
        }
        .legal {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        address { margin: 0; white-space: pre-line; color: rgba(255,255,255,.92); }

        /* Responsive */
        @media (max-width: 991.98px) {
          .cols { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (max-width: 575.98px) {
          .cols { grid-template-columns: 1fr; }
          .bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}

export default AkademiBaseFooter;
