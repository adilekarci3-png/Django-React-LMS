import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function HafizDetay() {
  const { hafizId } = useParams();
  const [veri, setVeri] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/v1/hafiz/1/detay/`)
      .then((res) => setVeri(res.data))
      .catch((err) => console.error("Veri alınamadı:", err));
  }, [hafizId]);

  if (!veri) return <p className="text-center mt-4">Yükleniyor...</p>;

  return (
    <>
      <HDMBaseHeader />
      <div className="container py-4" style={{ maxWidth: "1380px" }}>
        <Header />
        <div className="row mt-3">
          <div className="col-md-3">
            <Sidebar />
          </div>
          <div className="col-md-9">
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-bold mb-2">{veri.full_name}</h2>
              <p className="text-muted mb-3">🎓 Eğitmeni: {veri.egitmen?.full_name}</p>

              {/* Aktif Dersler */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">📖 Aktif Dersleri</h3>
                {veri.dersler?.length === 0 ? (
                  <p className="text-muted">Aktif ders bulunmuyor.</p>
                ) : (
                  <ul className="list-group mt-2">
                    {veri.dersler.map((d) => (
                      <li key={d.id} className="list-group-item">
                        {new Date(d.start).toLocaleString()} – {d.topic}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Hatalar */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">⚠️ Hatalar</h3>
                {veri.hatalar?.length === 0 ? (
                  <p className="text-muted">Bu hafızın hatası bulunmamaktadır.</p>
                ) : (
                  <ul className="list-group mt-2">
                    {veri.hatalar?.map((h) => (
                      <li key={h.id} className="list-group-item">
                        {new Date(h.tarih).toLocaleDateString()} – {h.aciklama}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bırakılan Dersler */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">❌ Bırakılan Dersler</h3>
                {veri.birakilan_dersler?.length === 0 ? (
                  <p className="text-muted">Daha önce bırakılmış ders yok.</p>
                ) : (
                  <ul className="list-group mt-2">
                    {veri.birakilan_dersler?.map((d) => (
                      <li key={d.id} className="list-group-item text-muted">
                        {new Date(d.start_time).toLocaleString()} – {d.topic}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Derse Başla */}
              <button
                className="btn bg-green-100 text-green-700 border border-green-300 rounded px-3 py-2"
                onClick={() => navigate("/hdm/kuranoku")}
              >
                ▶️ Derse Başla
              </button>
            </div>
          </div>
        </div>
      </div>
      <HDMBaseFooter />
    </>
  );
}

export default HafizDetay;
