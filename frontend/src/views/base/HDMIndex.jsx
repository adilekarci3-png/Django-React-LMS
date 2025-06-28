import React from "react";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import "./css/GirisPage.css";
import hafizlikImage from "./images/3.png";

function HDMIndex() { 

  return (
    <>
      <HDMBaseHeader />
      <section className="hafizlik-asymmetrical-section">
        <div className="hafizlik-asymmetrical-container">
          <div className="hafizlik-asymmetrical-header">
          Hafızlık Dinleme Merkezi
          </div>
          <div className="hafizlik-asymmetrical-image-wrapper">
            <img src={hafizlikImage} alt="Hafızlık Bilgi Sistemi" className="hafizlik-asymmetrical-image" />
          </div>
          <div className="hafizlik-asymmetrical-subtitle">
          Her Okuma Bir Dua, Her Dinleme Bir Destek
          </div>
        </div>
      </section>
      <HDMBaseFooter />
    </>
  );
}

export default HDMIndex;