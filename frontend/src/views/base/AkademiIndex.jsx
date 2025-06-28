import React from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import "./css/GirisPage.css";
import hafizlikImage from "./images/2.png";

function AkademiIndex() {
  return (
    <>
      <AkademiBaseHeader />
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
      <AkademiBaseFooter />
    </>
  );
}

export default AkademiIndex;