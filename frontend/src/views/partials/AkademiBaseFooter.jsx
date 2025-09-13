import React from "react";
import { Link } from "react-router-dom";

function AkademiBaseFooter() {
  const year = new Date().getFullYear();

  const orgLinks = [
    { label: "Hakkında", to: "/pages/about-us/" },
    { label: "Bağış", to: "/donate" },
    { label: "EHAD Akademi", to: "/akademi/courses" },
    { label: "EHAD Akademisi Bünyesinde Faaliyet", to: "/pages/activities/" },
    { label: "İletişim", to: "/contact" },
  ];

  const supportLinks = [
    { label: "Yardım ve Destek", to: "/support" },
    { label: "Eğitmen Ol", to: "/educator/apply" },
    { label: "Mobil Uygulama", to: "/apps" },
    { label: "SSS", to: "/faq" },
    { label: "Dersler", to: "/akademi/courses" }, // ad ve hedef sync
  ];

  const socials = [
    { icon: "bi-facebook", label: "Facebook", href: "#" },
    { icon: "bi-twitter-x", label: "X / Twitter", href: "#" },
    { icon: "bi-github", label: "GitHub", href: "#" },
    { icon: "bi-youtube", label: "YouTube", href: "#" },
    { icon: "bi-instagram", label: "Instagram", href: "#" },
  ];

  return (
    <footer className="akd-footer mt-5">
      <div className="container py-5">
        <div className="row g-4 align-items-start">
          {/* Brand & About */}
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-pill">EHAD</span>
              <span className="text-muted-100 small">akademi</span>
            </div>
            <p className="footer-text mb-4">
              EHAD olarak 81 ildeki şube ve temsilciliklerimiz ile Kur’ân-ı Kerim’i sahih okuma
              dersleri, Hatimle Teravih Namazı kıldıranları ödüllendirme programları, Kur’ân-ı
              Kerim Sahih ve Güzel Okuma yarışmaları, hafızlık kampları, motivasyon seminerleri ve
              burs destekleri gibi pek çok hayırlı hizmete imza atıyoruz.
            </p>

            <div className="d-flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.icon} className="btn btn-icon-soft" href={s.href} aria-label={s.label}>
                  <i className={`bi ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Kuruluş */}
          <div className="col-6 col-lg-3">
            <h5 className="footer-title">Kuruluş</h5>
            <ul className="list-unstyled m-0">
              {orgLinks.map((l) => (
                <li key={l.label}>
                  <Link className="footer-link" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div className="col-6 col-lg-2">
            <h5 className="footer-title">Destek</h5>
            <ul className="list-unstyled m-0">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link className="footer-link" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-2">
            <h5 className="footer-title">İletişim</h5>
            <address className="footer-text mb-3">
              Anafartalar Cad. Gülhane İşhanı No: 62/33
              <br />
              Altındağ / Ankara
            </address>
            <div className="small mb-1">
              <span className="text-muted-100">E-posta: </span>
              <a className="footer-link" href="mailto:bilgi@ehad.org.tr">
                bilgi@ehad.org.tr
              </a>
            </div>
            <div className="small mb-3">
              <span className="text-muted-100">Telefon: </span>
              <a className="footer-link" href="tel:+903123240034">
                +90 312 324 00 34
              </a>
            </div>

            <div className="d-flex gap-2">
              <a href="#" className="store-badge" aria-label="App Store">
                <img
                  src="/assets/images/svg/appstore.svg"
                  alt="App Store"
                  className="img-fluid"
                />
              </a>
              <a href="#" className="store-badge" aria-label="Google Play">
                <img
                  src="/assets/images/svg/playstore.svg"
                  alt="Google Play"
                  className="img-fluid"
                />
              </a>
            </div>
          </div>
        </div>

        <hr className="footer-hr my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p className="m-0 small text-muted-100">
            © {year} EHAD — Tüm hakları saklıdır.
          </p>
          <div className="d-flex gap-3 small">
            <Link to="/privacy" className="footer-link">Gizlilik</Link>
            <Link to="/terms" className="footer-link">Kullanım Şartları</Link>
            <a href="#" className="footer-link">Çerezler</a>
          </div>
        </div>
      </div>

      {/* THEME & FOOTER STYLES (Header ile %100 uyumlu) */}
      <style>{`
        :root{
          --akd-bg-1:#023e8a;
          --akd-bg-2:#03045e;
          --akd-bg-3:#0077b6;
          --akd-fg:#eaf1ff;
          --akd-muted: rgba(255,255,255,.80);
          --akd-pill-grad: linear-gradient(90deg,#7aa2ff,#c0d0ff);
          --akd-card-bg: rgba(255,255,255,.88);
          --akd-shadow: 0 10px 30px rgba(2,62,138,.25);
          --akd-radius: 16px;
        }

        .akd-footer{
          position: relative;
          color: var(--akd-fg);
          background:
            radial-gradient(1200px 400px at 80% -10%, rgba(255,255,255,.08), transparent 60%),
            radial-gradient(900px 300px at -10% 120%, rgba(255,255,255,.06), transparent 60%),
            linear-gradient(90deg, var(--akd-bg-1), var(--akd-bg-2) 40%, var(--akd-bg-3));
          box-shadow: var(--akd-shadow);
        }
        .brand-pill{
          background: var(--akd-pill-grad);
          color:#0b1a2b; padding:.25rem .6rem; border-radius:999px; font-weight:800; letter-spacing:.02em;
        }
        .text-muted-100{ color: var(--akd-muted); }
        .footer-title{
          color:#fff; font-weight:700; margin-bottom:.75rem; letter-spacing:.02em;
        }
        .footer-text{ color:rgba(255,255,255,.85); line-height:1.6; }
        .footer-link{
          display:inline-block; padding:.25rem 0; color:rgba(255,255,255,.85); text-decoration:none;
        }
        .footer-link:hover{ color:#fff; text-decoration:underline; }
        .btn-icon-soft{
          width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center;
          color:#0b1a2b; background:#ffffff; border:0; transition:.2s;
        }
        .btn-icon-soft:hover{ transform: translateY(-2px); filter: brightness(1.05); }
        .footer-hr{ border-color: rgba(255,255,255,.15); opacity:1; }
        .store-badge img{ height:36px; }
        @media (max-width: 991.98px){
          .store-badge img{ height:32px; }
        }
      `}</style>
    </footer>
  );
}

export default AkademiBaseFooter;
