import { useEffect, useRef, useState } from "react";
import "./css/CardImage.css";

import resim1 from "./image/resim1.png";
import resim2 from "./image/resim2.png";
import resim3 from "./image/resim3.png";
import resim4 from "./image/resim4.png";

const cards = [
  {
    id: 1,
    image: resim1,
    style: { top: "-20px", left: "-120px", rotate: "-4deg", width: "450px" },
  },
  {
    id: 2,
    image: resim2,
    style: { top: "-170px", left: "140px", rotate: "1.5deg", width: "380px" },
  },
  {
    id: 3,
    image: resim3,
    style: { top: "-580px", left: "300px", rotate: "3deg", width: "430px" },
  },
  {
    id: 4,
    image: resim4,
    style: { top: "-620px", left: "-120px", rotate: "8deg", width: "400px" },
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=700&q=85",
    style: {
      top: "-880px",
      left: "300px",
      rotate: "-2.5deg",
      width: "410px",
    },
  },
];

export default function ScatteredCards() {
  const [order, setOrder] = useState(cards.map((c) => c.id));
  const [focused, setFocused] = useState(null);

  // ✅ SADECE EKLENEN KISIM (scroll ile görünür olunca animasyon)
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect(); // 1 kere görünsün
        }
      },
      {
        threshold: 0.25, // %25 görünür olunca
        rootMargin: "0px 0px -12% 0px", // biraz orta hissi
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  // ✅ EK BİTTİ

  const bringToFront = (id) => {
    setFocused(id);
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
  };

  return (
    // ✅ sadece class eklendi: cardimage-reveal + is-visible
    <div
      ref={wrapRef}
      className={`wrapper cardimage-reveal ${visible ? "is-visible" : ""}`}
    >
      <h2 className="title">Modüllerle daha düzenli bir hayat</h2>
      <div className="title-underline" />

      <div className="scene">
        {cards.map((card) => {
          const zIndex = order.indexOf(card.id) + 1;
          const isFocused = focused === card.id;
          return (
            <div
              key={card.id}
              className={`card${isFocused ? " focused" : ""}`}
              onClick={() => bringToFront(card.id)}
              style={{
                top: card.style.top,
                left: card.style.left,
                width: isFocused
                  ? `${parseInt(card.style.width) * 1.18}px`
                  : card.style.width,
                zIndex,
                transform: isFocused
                  ? `rotate(0deg) translateY(-10px)`
                  : `rotate(${card.style.rotate})`,
              }}
            >
              <img src={card.image} alt={`Modül ${card.id}`} />
            </div>
          );
        })}
      </div>

      <div className="desc-block">
        <p>
          <strong>Gerçek hız,</strong> daha az veri girişi, akıllı yapay zeka ve
          hızlı bir kullanıcı arayüzünü deneyimleyin. Tüm işlemler 90 mili
          saniyeden daha kısa sürede tamamlanır, yani göz açıp kapayıncaya dek.
        </p>
        <div className="cta-row">
          <span className="cta-arrow">↙</span>
          <button className="cta-btn" type="button">
            <span className="play-icon">▶</span>
            Demo ile Keşfedin
          </button>
        </div>
      </div>
    </div>
  );
}
