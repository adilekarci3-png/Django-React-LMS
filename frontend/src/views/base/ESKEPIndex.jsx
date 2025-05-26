import React from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import "./css/GirisPage.css";
import eskepImage from "./images/1.png";

function EskepGiris() {
  return (
    <>
      <ESKEPBaseHeader />
      <section className="hafizlik-asymmetrical-section">
        <div className="hafizlik-asymmetrical-container">
          <div className="hafizlik-asymmetrical-header">
            EHAD Staj ve Kariyer Eğitimi Programı
          </div>
          <div className="hafizlik-asymmetrical-image-wrapper">
            <img src={eskepImage} alt="ESKEP" className="hafizlik-asymmetrical-image" />
          </div>
          <div className="hafizlik-asymmetrical-subtitle">
            Staj, proje ve kariyer gelişim süreçlerinizi profesyonel bir platformda yönetin.
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default EskepGiris;
