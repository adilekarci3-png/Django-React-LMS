import React from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import "./css/GirisPage.css";
import hafizlikImage from "./images/4.png";

function HafizBilgiIndex() {
  return (
    <>
      <BaseHeader />
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
      <BaseFooter />
    </>
  );
}

export default HafizBilgiIndex;