import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";

function EgitmenDetay({ egitmenId }) {
  const [veri, setVeri] = useState(null);
  const [aktifHafizId, setAktifHafizId] = useState(null);
  const navigate = useNavigate();

  const handleYeniDersAta = () => {
    navigate("/hdm/hafiztakip");
  };
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/egitmen/1/detay/`)
      .then((res) => {
        setVeri(res.data);
        console.log("Eğitmen detay:", res.data);
      })
      .catch((err) => console.error("Veri alınamadı:", err));
  }, [egitmenId]);

  if (!veri) return <p className="text-center mt-4">Yükleniyor...</p>;

  const hafizaAitDersler = veri.dersler.filter((d) => d.hafiz === aktifHafizId);
  const handleHatalariGoster = (hafizId) => {
    console.log("Hatalar gösteriliyor:", hafizId);
    // modal veya ayrı bir view açılabilir
  };

  const handleDerstenBirak = (hafizId) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu hafızı gerçekten dersten bırakmak istiyor musunuz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, bırak",
      cancelButtonText: "Vazgeç",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/v1/ders-atamalari/${hafizId}/`)
          .then(() => {
            Swal.fire("Başarılı", "Hafız dersten bırakıldı.", "success");
            // örnek: liste yenileme veya state güncelleme
            // fetchEgitmenDetay();
          })
          .catch((err) => {
            Swal.fire("Hata", "İşlem başarısız: " + err.message, "error");
          });
      }
    });
  };
  return (
    <>
      <HDMBaseHeader />
      <div className="container py-4" style={{ maxWidth: "1380px" }}>
        <Header />
        <div className="row mt-3">
          {/* Sidebar */}
          <div className="col-md-3">
            <Sidebar />
          </div>
          {/* Ana İçerik */}
          <div className="col-md-9">
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-bold mb-4">
                {veri.full_name} ({veri.role})
              </h2>

              {/* Hafızlar */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">👤📖 Hafızlar</h3>
                {veri.hafizlar.length === 0 ? (
                  <p className="text-muted">Bu eğitmene bağlı hafız yok.</p>
                ) : (
                  <ul className="list-group mt-2">
                    {veri.hafizlar.map((h) => (
                      <li
                        key={h.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span className="fw-semibold">{h.full_name}</span>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn bg-blue-100 text-blue-800 border border-blue-300 rounded px-3 py-2"
                            style={{ fontSize: "0.85rem" }}
                            onClick={() =>
                              setAktifHafizId(
                                aktifHafizId === h.id ? null : h.id
                              )
                            }
                          >
                            📚 {aktifHafizId === h.id ? "Kapat" : "Dersler"}
                          </button>

                          <button
                            className="btn bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-3 py-2"
                            style={{ fontSize: "0.85rem" }}
                            onClick={() => handleHatalariGoster(h.id)}
                          >
                            ⚠️ Hatalar
                          </button>

                          <button
                            className="btn bg-red-100 text-red-700 border border-red-300 rounded px-3 py-2"
                            style={{ fontSize: "0.85rem" }}
                            onClick={() => handleDerstenBirak(h.id)}
                          >
                            ❌ Dersten Bırak
                          </button>

                          <button
                            className="btn bg-green-100 text-green-700 border border-green-300 rounded px-3 py-2"
                            style={{ fontSize: "0.85rem" }}
                            onClick={() => navigate("/hdm/kuranoku")}
                          >
                            ▶️ Derse Başla
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Seçili Hafıza Ait Dersler */}
              {aktifHafizId && (
                <div className="mb-4">
                  <h5 className="text-secondary">
                    📖 Seçili Hafıza Ait Dersler:
                  </h5>
                  {hafizaAitDersler.length === 0 ? (
                    <p className="text-muted">Bu hafıza ait ders yok.</p>
                  ) : (
                    <ul className="list-group mt-2">
                      {hafizaAitDersler.map((d) => (
                        <li key={d.id} className="list-group-item">
                          {new Date(d.start_time).toLocaleString()} - {d.topic}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Genel Ders Listesi */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">📚 Tüm Dersler</h3>
                {veri.dersler.length === 0 ? (
                  <p className="text-muted">Henüz ders atanmamış.</p>
                ) : (
                  <ul className="list-group mt-2">
                    {veri.dersler.map((d) => (
                      <li key={d.id} className="list-group-item">
                        {new Date(d.start_time).toLocaleString()} - {d.topic}{" "}
                        <span className="text-muted">({d.hafiz_adi})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button className="btn btn-primary" onClick={handleYeniDersAta}>
                ➕ Yeni Ders Ata
              </button>
            </div>
          </div>
        </div>
      </div>
      <HDMBaseFooter />
    </>
  );
}

export default EgitmenDetay;
