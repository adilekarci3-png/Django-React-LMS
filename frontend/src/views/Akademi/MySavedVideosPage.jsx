// src/pages/MySavedVideosPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import { savedVideosApi } from "../../api/savedVideosApi";
import { useAuthStore } from "../../store/auth";

export default function MySavedVideosPage() {
  const { listSaved, removeSaved } = savedVideosApi();
  const [isLoggedIn, rehydrated] = useAuthStore((s) => [s.isLoggedIn(), s.rehydrated]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const rows = await listSaved();
      // Beklenen: [{id, kind: 'link'|'file', title, description, watch, thumb, created_at}, ...]
      setItems(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rehydrated) return;
    if (!isLoggedIn) return;
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehydrated, isLoggedIn]);

  const onRemove = async (savedId) => {
    if (!window.confirm("Listenden kaldırmak istiyor musun?")) return;
    try {
      await removeSaved(savedId);
      await loadSaved();
    } catch {
      alert("Kaldırma başarısız.");
    }
  };

  if (rehydrated && !isLoggedIn) {
    return (
      <>
        <AkademiBaseHeader />
        <section className="pt-5 pb-5 bg-light">
          <div className="container">
            <div className="bg-white p-5 rounded shadow text-center">
              <h3 className="mb-3">Kayıtlı Videolarım</h3>
              <p>Videoları görmek için lütfen giriş yapın.</p>
              <Link to="/login/" className="btn btn-primary">
                Giriş Yap
              </Link>
            </div>
          </div>
        </section>
        <AkademiBaseFooter />
      </>
    );
  }

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <div className="mb-3">
            <Header />
          </div>

          <div className="row mt-0 mt-md-4">
            {/* Sidebar */}
            <div className="col-lg-3">
              <Sidebar />
            </div>

            {/* İçerik */}
            <div className="col-lg-9">
              <div className="bg-white p-5 rounded shadow">
                <h3 className="mb-4 text-primary fw-bold">⭐ Kayıtlı Videolarım</h3>

                {loading ? (
                  <div>Yükleniyor...</div>
                ) : items.length === 0 ? (
                  <div className="alert alert-light">
                    Listeniz boş. <Link to="/videos">Tüm videolara göz atın</Link> ve ekleyin.
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-3 g-3">
                    {items.map((item) => (
                      <div className="col" key={item.id}>
                        <div className="card h-100 shadow-sm">
                          {item.kind === "link" ? (
                            item.thumb ? (
                              <a href={item.watch} target="_blank" rel="noreferrer">
                                <img src={item.thumb} className="card-img-top" alt={item.title} />
                              </a>
                            ) : (
                              <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center">
                                <span className="text-muted">Önizleme yok</span>
                              </div>
                            )
                          ) : (
                            <div className="ratio ratio-16x9 bg-dark">
                              {item.watch ? (
                                <video
                                  src={item.watch}
                                  preload="metadata"
                                  controls={false}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center text-white-50">
                                  Önizleme yok
                                </div>
                              )}
                            </div>
                          )}

                          <div className="card-body d-flex flex-column">
                            <div className="d-flex align-items-center justify-content-between">
                              <h6
                                className="card-title mb-0"
                                title={item.title}
                                style={{ lineHeight: "1.2em", overflow: "hidden" }}
                              >
                                {item.title}
                              </h6>
                              <span className="badge text-bg-secondary">
                                {item.kind === "link" ? "YouTube" : "Dosya"}
                              </span>
                            </div>

                            <p className="card-text small text-muted mt-2" style={{ flexGrow: 1 }}>
                              {(item.description || "").slice(0, 100)}
                              {item.description && item.description.length > 100 ? "…" : ""}
                            </p>

                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <a
                                className="btn btn-outline-primary btn-sm"
                                href={item.watch || "#"}
                                target="_blank"
                                rel="noreferrer"
                              >
                                İzle
                              </a>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => onRemove(item.id)}
                              >
                                Listeden Kaldır
                              </button>
                            </div>
                          </div>

                          <div className="card-footer small text-muted">
                            {new Date(item.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}
