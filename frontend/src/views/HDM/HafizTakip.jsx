import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/HafizTakip.css";

const HafizTakip = () => {
  const [egitmen, setEgitmen] = useState(null);
  const [hafizlar, setHafizlar] = useState([]);
  const [hatalar, setHatalar] = useState([]);
  const [selectedHafizId, setSelectedHafizId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dersAtamalari, setDersAtamalari] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/egitmenler/1/")
      .then((res) => {
        setEgitmen(res.data);
        return axios.get(`http://localhost:8000/api/v1/hafizlar/?egitmen=${res.data.id}`);
      })
      .then((res) => setHafizlar(res.data))
      .catch((err) => console.error("Veri alınamadı", err));

    axios
      .get("http://localhost:8000/api/v1/ders-atamalari/")
      .then((res) => setDersAtamalari(res.data))
      .catch((err) => console.error("Tüm ders atamaları alınamadı", err));
  }, []);

  const handleSelectHafiz = (hafizId) => {
    setSelectedHafizId(hafizId);
    axios.get(`http://localhost:8000/api/v1/hatalar/?hafiz=${hafizId}`)
      .then((res) => setHatalar(res.data))
      .catch((err) => console.error("Hatalar alınamadı", err));

    axios.get(`http://localhost:8000/api/v1/ders-atamalari/?hafiz=${hafizId}`)
      .then((res) => setDersAtamalari(res.data))
      .catch((err) => console.error("Ders atamaları alınamadı", err));
  };

  const handleDersAtama = () => {
    if (!selectedHafizId || !selectedDate) {
      Swal.fire("Eksik bilgi", "Hafız ve tarih seçin.", "warning");
      return;
    }

    axios
      .post("http://localhost:8000/api/v1/ders-atamalari/", {
        hafiz: selectedHafizId,
        instructor: egitmen.id,
        baslangic: selectedDate.toISOString(),
        bitis: new Date(selectedDate.getTime() + 3600000).toISOString(),
        aciklama: "Yeni ders ataması",
        topic: "Ezber",
      })
      .then(() => {
        Swal.fire("Başarılı", "Ders atandı.", "success");
        handleSelectHafiz(selectedHafizId);
      })
      .catch((err) => Swal.fire("Hata", "Ders ataması başarısız: " + err, "error"));
  };

  const handleDeleteDers = (dersId) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu dersi silmek istiyor musunuz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Vazgeç"
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/v1/ders-atamalari/${dersId}/`)
          .then(() => {
            setDersAtamalari((prev) => prev.filter((d) => d.id !== dersId));
            Swal.fire("Silindi", "Ders başarıyla silindi.", "success");
          })
          .catch((err) => Swal.fire("Hata", "Silme işlemi başarısız: " + err, "error"));
      }
    });
  };

  const filteredDersler = dersAtamalari.filter((d) => {
    const dersDate = new Date(d.baslangic);
    return (
      dersDate.toDateString() === selectedDate.toDateString() &&
      (!selectedHafizId || d.hafiz === selectedHafizId)
    );
  });

  const getHafizName = (hafizId) => {
    const hafiz = hafizlar.find((h) => h.id === hafizId);
    return hafiz ? hafiz.full_name : "";
  };

  return (
    <>
      <HDMBaseHeader />
      <div className="container py-4">
        <Header />
        <div className="row mt-0 mt-md-4">
          <div className="col-md-2 col-12">
            <Sidebar />
          </div>
          <div className="col-md-10 col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-dark fw-bold">
                📘 Eğitmen: {egitmen?.full_name}
              </h2>
              <small className="text-muted"></small>
            </div>
            <div className="row g-4">
              <div className="col-md-3">
                <div className="border rounded p-3 shadow-sm bg-white h-100">
                  <h5 className="mb-3 text-primary">🧕 Hafızlar</h5>
                  {hafizlar.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => handleSelectHafiz(h.id)}
                      className={`btn btn-outline-primary w-100 mb-2 text-start ${selectedHafizId === h.id ? "active" : ""}`}
                    >
                      {h.full_name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-3 shadow-sm bg-white h-100">
                  <h5 className="text-center mb-3">🗓️ Ders Takvimi</h5>
                  <Calendar
                    className="custom-calendar"
                    onChange={setSelectedDate}
                    value={selectedDate}
                  />
                  <button
                    className="btn btn-success mt-3 w-100"
                    onClick={handleDersAtama}
                  >
                    ➕ Ders Ata
                  </button>
                  <hr />
                  <h6 className="text-center text-muted">🎓 Atanmış Dersler</h6>
                  {filteredDersler.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {filteredDersler.map((d) => (
                        <li
                          key={d.id}
                          className="list-group-item small d-flex justify-content-between align-items-start"
                        >
                          <div>
                            <strong>{new Date(d.baslangic).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                            : {d.topic}
                            <div className="text-muted small">
                              {getHafizName(d.hafiz)} - {new Date(d.baslangic).toLocaleDateString()}
                            </div>
                            {d.aciklama && (
                              <div className="text-muted small">{d.aciklama}</div>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteDers(d.id)}
                          >
                            Sil
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted text-center small">
                      Bu gün için ders atanmadı.
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3 shadow-sm bg-white h-100 overflow-auto">
                  <h5 className="mb-3 text-danger">📋 Hata Notları</h5>
                  {hatalar.length > 0 ? (
                    <ul className="list-group">
                      {hatalar.map((h) => (
                        <li key={h.id} className="list-group-item">
                          <strong>Sayfa {h.sayfa}:</strong> {h.aciklama}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">
                      Seçili hafıza ait hata kaydı yok.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HDMBaseFooter />
    </>
  );
};

export default HafizTakip;
