import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaFacebookF, FaTwitter } from "react-icons/fa";
import "./css/eskep-aqua.css";

/** ESKEP – Yeni Footer (4 kolon, yüksek kontrast, responsive) */
export default function ESKEPBaseFooter() {
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
              <a href="#" aria-label="Facebook"><FaFacebookF size={14}/></a>
              <a href="#" aria-label="Twitter/X"><FaTwitter size={14}/></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={16}/></a>
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
            <p className="text" style={{margin: "8px 0 4px"}}>
              E-posta: <a className="link" href="mailto:bilgi@ehad.org.tr">bilgi@ehad.org.tr</a>
            </p>
            <p className="text" style={{margin: 0}}>
              Telefon: <strong>+90 312 324 00 34</strong>
            </p>
          </div>
        </div>

        <div className="bottom">
          <small className="text">© {new Date().getFullYear()} EHAD. Tüm hakları saklıdır.</small>
          <div className="legal">
            <Link className="link" to="/kvkk">KVKK</Link>
            <Link className="link" to="/terms">Kullanım Şartları</Link>
            <Link className="link" to="/privacy">Gizlilik</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
