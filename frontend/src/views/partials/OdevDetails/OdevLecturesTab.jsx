import React, { useEffect } from "react";

function OdevStatusTab({ odev }) {
  useEffect(() => {
    if (odev?.odev_status) {
      console.log("ODEV_STATUS:", odev);
    }
  }, [odev]);

  const renderStatusAlert = () => {
    switch (odev?.odev_status) {
      case "Teslim Edildi":
        return (
          <div className="alert alert-success" role="alert">
            Bu ödev <strong>tamamlanmıştır</strong>. Değerlendirme ve notlar görüntülenebilir.
          </div>
        );
      case "İncelemede":
        return (
          <div className="alert alert-info" role="alert">
            Bu ödev <strong>inceleme aşamasındadır</strong>. Sonuçlar yakında bildirilecektir.
          </div>
        );
      case "Reddedilmiş":
        return (
          <div className="alert alert-danger" role="alert">
            Bu ödev <strong>reddedilmiştir</strong>. Lütfen açıklamaları kontrol ediniz ve tekrar gönderiniz.
          </div>
        );
      case "Taslak":
        return (
          <div className="alert alert-warning" role="alert">
            Bu ödev şu an <strong>taslak aşamasındadır</strong>. Henüz teslim edilmemiştir.
          </div>
        );
      case "Pasif":
        return (
          <div className="alert alert-secondary" role="alert">
            Bu ödev <strong>pasif durumdadır</strong>. Görüntüleme sınırlandırılmış olabilir.
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
      <h4 className="mb-3">Ödev Durumu</h4>
      {renderStatusAlert()}
    </div>
  );
}

export default OdevStatusTab;
