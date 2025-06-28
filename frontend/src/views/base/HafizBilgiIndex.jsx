import React from "react";

import HBSBaseHeader from "../partials/HBSBaseHeader";

import HBSBaseFooter from "../partials/HBSBaseFooter";
import "./css/GirisPage.css";
import hafizlikImage from "./images/4.png";

function HafizBilgiIndex() {
  return (
    <>
      <HBSBaseHeader />
      <section className="hafizlik-asymmetrical-section">
        <div className="hafizlik-asymmetrical-container">
          <div className="hafizlik-asymmetrical-header">
            Hafızlar Bilgi Sistemi
          </div>
          <div className="hafizlik-asymmetrical-image-wrapper">
            <img src={hafizlikImage} alt="Hafızlık Bilgi Sistemi" className="hafizlik-asymmetrical-image" />
          </div>
          <div className="hafizlik-asymmetrical-subtitle">
            Hafız adaylarının eğitim ve gelişim süreçlerini izleyebileceğiniz, modern ve dijital yönetim sistemi.
          </div>
        </div>
      </section>
      <HBSBaseFooter />
    </>
  );
}

export default HafizBilgiIndex;