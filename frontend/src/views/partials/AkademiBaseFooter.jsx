import React from "react";
import { Link } from "react-router-dom";

function AkademiBaseFooter() {
  const year = new Date().getFullYear();

  const orgLinks = [/* ... aynı ... */];
  const supportLinks = [/* ... aynı ... */];
  const socials = [/* ... aynı ... */];

  return (
    <footer className="akd-footer mt-5 akd-theme akd-theme--orchid">
      <div className="container py-5">
        {/* ... içerik aynı ... */}
      </div>

      {/* THEME & FOOTER STYLES */}
      <style>{`
        :root{
          --akd-bg-1:#023e8a; --akd-bg-2:#03045e; --akd-bg-3:#0077b6;
          --akd-fg:#eaf1ff; --akd-muted: rgba(255,255,255,.80);
          --akd-pill-grad: linear-gradient(90deg,#7aa2ff,#c0d0ff);
          --akd-card-bg: rgba(255,255,255,.88);
          --akd-shadow: 0 10px 30px rgba(2,62,138,.25);
          --akd-radius: 16px;
        }
        /* === ORCHID / MOR TEMA OVERRIDE === */
        .akd-theme.akd-theme--orchid{
          --akd-bg-1:#6d28d9; --akd-bg-2:#4c1d95; --akd-bg-3:#a21caf;
          --akd-fg:#ffffff; --akd-muted: rgba(255,255,255,.82);
          --akd-pill-grad: linear-gradient(90deg,#f0abfc,#fda4af);
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
        .brand-pill{ background: var(--akd-pill-grad); color:#0b1a2b; padding:.25rem .6rem; border-radius:999px; font-weight:800; letter-spacing:.02em; }
        .text-muted-100{ color: var(--akd-muted); }
        .footer-title{ color:#fff; font-weight:700; margin-bottom:.75rem; letter-spacing:.02em; }
        .footer-text{ color:rgba(255,255,255,.85); line-height:1.6; }
        .footer-link{ display:inline-block; padding:.25rem 0; color:rgba(255,255,255,.85); text-decoration:none; }
        .footer-link:hover{ color:#fff; text-decoration:underline; }
        .btn-icon-soft{ width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#0b1a2b; background:#ffffff; border:0; transition:.2s; }
        .btn-icon-soft:hover{ transform: translateY(-2px); filter: brightness(1.05); }
        .footer-hr{ border-color: rgba(255,255,255,.15); opacity:1; }
        .store-badge img{ height:36px; }
        @media (max-width: 991.98px){ .store-badge img{ height:32px; } }
      `}</style>
    </footer>
  );
}

export default AkademiBaseFooter;
