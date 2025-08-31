// src/components/partials/Proje/EskepProjeStatusTab.jsx
import React, { useEffect } from "react";

// TR küçük harf ve normalize
const trLower = (s) => String(s ?? "").toLocaleLowerCase("tr").trim();
const normalizeStatusKey = (s) => {
  const t = trLower(s);
  if (t.includes("incele")) return "incelemede";
  if (t.includes("taslak")) return "taslak";
  if (t.includes("pasif")) return "pasif";
  if (t.includes("redd"))  return "reddedildi";
  if (t.includes("teslim") || t.includes("onay") || t.includes("kabul") || t.includes("tamam"))
    return "teslimedildi";
  return t || "—";
};

// Birden çok olası alan adından statüyü seç
const pickStatus = (p) =>
  p?.eskepProje_status ??
  p?.proje_status ??
  p?.status ??
  p?.durum ??
  "—";

// Koordinatör statüsü (varsa)
const pickKoordinatorStatus = (p) =>
  p?.koordinator_eskepProje_status ?? p?.koordinator_status ?? null;

function EskepProjeStatusTab({ eskepproje }) {
  const status = pickStatus(eskepproje);
  const koordStatus = pickKoordinatorStatus(eskepproje);

  useEffect(() => {
    if (status) {
      console.log("PROJE_STATUS:", status, eskepproje);
    }
  }, [status, eskepproje]);

  const renderAlertByStatus = (rawStatus, label = "Proje") => {
    const key = normalizeStatusKey(rawStatus);

    switch (key) {
      case "teslimedildi":
        return (
          <div className="alert alert-success" role="alert">
            Bu {label} <strong>tamamlanmıştır / teslim edilmiştir</strong>. Değerlendirme ve notlar görüntülenebilir.
          </div>
        );
      case "incelemede":
        return (
          <div className="alert alert-info" role="alert">
            Bu {label} <strong>inceleme aşamasındadır</strong>. Sonuçlar yakında bildirilecektir.
          </div>
        );
      case "reddedildi":
        return (
          <div className="alert alert-danger" role="alert">
            Bu {label} <strong>reddedilmiştir</strong>. Açıklamaları kontrol ederek tekrar gönderiniz.
          </div>
        );
      case "taslak":
        return (
          <div className="alert alert-warning" role="alert">
            Bu {label} şu an <strong>taslak</strong> durumundadır. Henüz teslim edilmemiştir.
          </div>
        );
      case "pasif":
        return (
          <div className="alert alert-secondary" role="alert">
            Bu {label} <strong>pasif</strong> durumdadır. Erişim veya görünürlük kısıtlı olabilir.
          </div>
        );
      default:
        return (
          <div className="alert alert-light" role="alert">
            {label} durumu için bilgi bulunamadı.
          </div>
        );
    }
  };

  return (
    <div className="tab-pane fade show active" id="proje-status-pane" role="tabpanel">
      <h4 className="mb-3">Proje Durumu</h4>
      {renderAlertByStatus(status, "Proje")}

      {koordStatus ? (
        <>
          <h5 className="mt-4 mb-2">Koordinatör Durumu</h5>
          {renderAlertByStatus(koordStatus, "Koordinatör onayı")}
        </>
      ) : null}
    </div>
  );
}

export default EskepProjeStatusTab;
