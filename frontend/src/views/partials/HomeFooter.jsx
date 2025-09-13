import React from "react";

function HomeFooter() {
  return (
    <footer
      style={{
        background: "#1e3a8a", // daha mat lacivert ton
        color: "#d1d5db",
        padding: "3rem 0",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h4 className="text-white">EHAD Akademi</h4>
            <p>
              81 ildeki temsilciliklerimiz ile Kur’an-ı Kerim’i sahih ve güzel okuma, hafızlık kamp programları, motivasyon seminerleri ve daha fazlasını sunuyoruz.
            </p>
          </div>

          <div className="col-md-4 mb-4">
            <h5 className="text-white">Bağlantılar</h5>
            <ul className="list-unstyled">
              <li><a href="/about-ehad" className="text-light text-decoration-none">Hakkımızda</a></li>
              <li><a href="/donate" className="text-light text-decoration-none">Bağış</a></li>
              <li><a href="/academy" className="text-light text-decoration-none">Akademi</a></li>
              <li><a href="/contact" className="text-light text-decoration-none">İletişim</a></li>
            </ul>
          </div>

          <div className="col-md-4">
            <h5 className="text-white">İletişim</h5>
            <p>
              Anafartalar Cad. Gülhane İşhanı No: 62/33<br />
              Altındağ / Ankara
            </p>
            <p>E-posta: bilgi@ehad.org.tr</p>
            <p>Telefon: +90 312 324 00 34</p>
          </div>
        </div>

        <div className="text-center pt-3 mt-3 border-top" style={{ borderColor: "#334155" }}>
          <small className="text-light">
            &copy; {new Date().getFullYear()} EHAD. Tüm hakları saklıdır.
          </small>
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
