function HafizBilgiDetailModal({ item, onClose }) {
  if (!item) return null;

  const renderField = (label, value) => (
    <div className="col-md-6">
      <label className="form-label fw-bold">{label}</label>
      <input type="text" className="form-control" value={value || "-"} readOnly />
    </div>
  );

  const renderTextarea = (label, value) => (
    <div className="col-12">
      <label className="form-label fw-bold">{label}</label>
      <textarea className="form-control" value={value || "-"} rows={3} readOnly />
    </div>
  );

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "#00000099" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">Hafız Detayı</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {renderField("Ad Soyad", item.full_name)}
              {renderField("Baba Adı", item.babaadi)}
              {renderField("TC No", item.tcno)}
              {renderField("Cep Tel", item.ceptel)}
              {renderField("Ev Tel", item.evtel)}
              {renderField("İş Tel", item.istel)}
              {renderField("Email", item.email)}
              {renderField("Adres", item.adres)}
              {renderField("İl", item.adresIl?.name)}
              {renderField("İlçe", item.adresIlce?.name)}
              {renderField("Hafızlık Bitirme Yılı", item.hafizlikbitirmeyili)}
              {renderField("Evli mi?", item.isMarried)}
              {renderField("Cinsiyet", item.gender)}
              {renderField("Yaş", item.yas)}
              {renderField("Hafızlık Yaptığı Kurs Adı", item.hafizlikyaptigikursadi)}
              {renderField("Hafızlık Kurs İli", item.hafizlikyaptigikursili?.name)}
              {renderField("Görev", item.gorev)}
              {renderField("Hafızlık Hoca Adı", item.hafizlikhocaadi)}
              {renderField("Hafızlık Hoca Soyadı", item.hafizlikhocasoyadi)}
              {renderField("Hafızlık Hoca Tel", item.hafizlikhocaceptel)}
              {renderField("Arkadaş Adı", item.hafizlikarkadasadi)}
              {renderField("Arkadaş Soyadı", item.hafizlikarkadasoyad)}
              {renderField("Arkadaş Tel", item.hafizlikarkadasceptel)}
              {renderField("Referans TC", item.referanstcno)}
              {renderField("Onay Durumu", item.onaydurumu)}
              {renderField("Aktif mi?", item.active ? "Evet" : "Hayır")}
              {renderField("İş", item.job?.name)}
              {renderField("Ülke", item.country?.name)}
              {renderField("Eğitmen", item.agent?.full_name)}
              {renderTextarea("Açıklama", item.description)}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HafizBilgiDetailModal;
