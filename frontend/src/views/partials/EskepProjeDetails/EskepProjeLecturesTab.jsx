import React, { useEffect } from "react";

function EskepProjeLecturesTab({ proje }) {
  useEffect(() => {
    if (proje?.proje_status) {
      console.log("POJE_STATUS:", proje);
    }
  }, [proje]);

  const renderStatusAlert = () => {
    switch (proje?.proje_status) {
      case "Teslim Edildi":
        return (
          <div className="alert alert-success" role="alert">
            Bu proje <strong>tamamlanmıştır</strong>. Değerlendirme ve notlar görüntülenebilir.
          </div>
        );
      case "İncelemede":
        return (
          <div className="alert alert-info" role="alert">
            Bu proje <strong>inceleme aşamasındadır</strong>. Sonuçlar yakında bildirilecektir.
          </div>
        );
      case "Reddedilmiş":
        return (
          <div className="alert alert-danger" role="alert">
            Bu proje <strong>reddedilmiştir</strong>. Lütfen açıklamaları kontrol ediniz ve tekrar gönderiniz.
          </div>
        );
      case "Taslak":
        return (
          <div className="alert alert-warning" role="alert">
            Bu proje şu an <strong>taslak aşamasındadır</strong>. Henüz teslim edilmemiştir.
          </div>
        );
      case "Pasif":
        return (
          <div className="alert alert-secondary" role="alert">
            Bu proje <strong>pasif durumdadır</strong>. Görüntüleme sınırlandırılmış olabilir.
          </div>
        );
      default:
        return (
          <div className="alert alert-light" role="alert">
            Durum bilgisi bulunamadı.
          </div>
        );
    }
  };

  return (
    <div className="tab-pane fade show active" id="course-pills-5" role="tabpanel">
      <h4 className="mb-3">Proje Durumu</h4>
      {renderStatusAlert()}
    </div>
  );
}

export default EskepProjeLecturesTab;
