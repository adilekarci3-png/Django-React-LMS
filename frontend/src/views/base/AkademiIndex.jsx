import React from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import "./css/GirisPage.css";
import hafizlikImage from "./images/2.png";

function AkademiIndex() {
  return (
    <>
      <BaseHeader />
      <section className="hafizlik-asymmetrical-section">
        <div className="hafizlik-asymmetrical-container">
          <div className="hafizlik-asymmetrical-header">
            EHAD AKADEMİ
          </div>
          <div className="hafizlik-asymmetrical-image-wrapper">
            <img src={hafizlikImage} alt="Hafızlık Bilgi Sistemi" className="hafizlik-asymmetrical-image" />
          </div>
          <div className="hafizlik-asymmetrical-subtitle">
          Kadim İlim Yolculuğunu Dijital Dünyanın İmkanlarıyla Buluşturan Eğitim Platformu
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default AkademiIndex;