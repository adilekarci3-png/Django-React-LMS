import React from 'react';

function BaseFooter() {
  return (
    <footer className="pt-lg-8 pt-5 footer bg-primary text-light mt-5">
      <div className="container mt-lg-2">
        <div className="row">
          <div className="col-lg-4 col-md-6 col-12 text-light">
            {/* About company */}
            <div className="mb-4">
              <h1 className="fw-bold text-light">EHAD</h1>
              <p className="mt-4" style={{ fontSize: '1rem' }}>
                EHAD olarak 81 ildeki şube ve temsilciliklerimiz ile Kuran-ı Kerim’i sahih okuma dersleri, Hatimle Teravih Namazı kıldıranları ödüllendirme programları, Kur`an-ı Kerim Sahih ve Güzel Okuma yarışmaları, hafızlık öğrencilerine yaz ve kış dönemlerinde kamp programları, hafızlık yolu motivasyon seminerleri, hafızlık öğrencilerine çeşitli hediyeler takdim edilmesi ve ihtiyaç sahibi hafız ve hafız adaylarına imkanlarımız ölçüsünde burs verilmesi gibi bir çok hayırlı hizmetlere imza atıyoruz.
              </p>
              {/* Social Media */}
              <div className="fs-4 mt-4 d-flex justify-content-start">
                <a href="#" className="me-3 text-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                </a>
                <a href="#" className="me-3 text-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                </a>
                <a href="#" className="text-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="offset-lg-1 col-lg-2 col-md-3 col-6">
            <div className="mb-4">
              <h3 className="fw-bold text-light mb-3">Kuruluş</h3>
              <ul className="list-unstyled nav nav-footer flex-column">
                <li><a href="#" className="nav-link text-light">Hakkında</a></li>
                <li><a href="#" className="nav-link text-light">Bağış</a></li>
                <li><a href="#" className="nav-link text-light">EHAD Akademi</a></li>
                <li><a href="#" className="nav-link text-light">EHAD Akademisi Faaliyetleri</a></li>
                <li><a href="#" className="nav-link text-light">İletişim</a></li>
              </ul>
            </div>
          </div>

          {/* Support Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <div className="mb-4">
              <h3 className="fw-bold text-light mb-3">Destek</h3>
              <ul className="list-unstyled nav nav-footer flex-column">
                <li><a href="#" className="nav-link text-light">Yardım ve Destek</a></li>
                <li><a href="#" className="nav-link text-light">Eğitmen Başvurusu</a></li>
                <li><a href="#" className="nav-link text-light">FAQ’s</a></li>
                <li><a href="#" className="nav-link text-light">Ders</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-12">
            <div className="mb-4">
              <h3 className="fw-bold text-light mb-3">İletişimde Kalın</h3>
              <p>Anafartalar Cad. Gülhane İşhanı No: 62/33 Altındağ/Ankara</p>
              <p className="mb-1">
                Eposta: <a href="mailto:bilgi@ehad.org.tr" className="text-light">bilgi@ehad.org.tr</a>
              </p>
              <p>
                Telefon: <span className="fw-semibold">+90 312 324 00 34</span>
              </p>
              <div className="d-flex">
                <a href="#">
                  <img src="../../assets/images/svg/appstore.svg" alt="App Store" className="img-fluid" />
                </a>
                <a href="#" className="ms-2">
                  <img src="../../assets/images/svg/playstore.svg" alt="Play Store" className="img-fluid" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="row align-items-center g-0 border-top py-2 mt-6">
          <div className="col-md-10 col-12">
            <div className="d-lg-flex align-items-center">
              <div className="me-4">
                <span>&copy; 2025 EHAD</span>
              </div>
              <div>
                <nav className="nav nav-footer">
                  <a className="nav-link text-light ps-0" href="#">Gizlilik Politikası</a>
                  <a className="nav-link text-light px-2 px-md-3" href="#">Çerez Bildirimi</a>
                  <a className="nav-link text-light d-none d-lg-block" href="#">KKVK</a>
                  <a className="nav-link text-light" href="#">Kullanım Şartları</a>
                </nav>
              </div>
            </div>
          </div>

          {/* Language Dropdown */}
          <div className="col-12 col-md-2 d-md-flex justify-content-end">
            <div className="dropdown">
              <a href="#" className="dropdown-toggle text-body" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="fe fe-globe me-2 align-middle" /> Dil
              </a>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li><a className="dropdown-item" href="#">Türkçe</a></li>
                <li><a className="dropdown-item" href="#">İngilizce</a></li>
                <li><a className="dropdown-item" href="#">Arapça</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default BaseFooter;