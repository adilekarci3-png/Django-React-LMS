// src/components/Egitmen/EgitmenMateryaller.jsx
import React, { useEffect, useMemo, useState } from "react";
import ReactPlayer from "react-player";
import moment from "moment";
import "moment/locale/tr";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

function EducatorMediaDashboard() {
  const api = useAxios();
  const user = useUserData();
  const userId = user?.user_id;

  // veri & ui state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtre/sort/arama
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | video | youtube | document
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest | title

  // grid/list görünüm
  const [view, setView] = useState("grid"); // grid | list

  // önizleme modal
  const [preview, setPreview] = useState(null); // { ...item } veya null

  const API = {
    list: `eskepinstructor/media-list/${userId}/`,
    detail: (id) => `eskepinstructor/media-detail/${id}/`,
  };

  useEffect(() => {
    moment.locale("tr");
  }, []);

  const fetchItems = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(API.list);
      setItems(res?.data || []);
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Materyaller alınamadı" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const counts = useMemo(() => {
    const c = { all: items.length, youtube: 0, video: 0, document: 0 };
    items.forEach((it) => {
      if (c[it.type] !== undefined) c[it.type] += 1;
    });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];

    // type filtrasyonu
    if (typeFilter !== "all") {
      list = list.filter((x) => x.type === typeFilter);
    }

    // arama
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((x) =>
        [x?.title, x?.description, x?.created_by_name]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      );
    }

    // sıralama
    list.sort((a, b) => {
      if (sortKey === "title") {
        return String(a.title || "").localeCompare(String(b.title || ""), "tr");
      }
      const da = new Date(a.created_at || a.date || 0).getTime();
      const db = new Date(b.created_at || b.date || 0).getTime();
      return sortKey === "newest" ? db - da : da - db;
    });

    return list;
  }, [items, typeFilter, query, sortKey]);

  const isVideo = (it) => it?.type === "video" || it?.type === "youtube";
  const playerUrl = (it) => (it?.type === "youtube" ? it?.youtube_url : it?.file);
  const canPlay = (it) => ReactPlayer.canPlay(playerUrl(it) || "");

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let i = -1;
    do {
      bytes = bytes / 1024;
      i++;
    } while (bytes >= 1024 && i < units.length - 1);
    return `${bytes.toFixed(1)} ${units[i]}`;
  };

  const handleDelete = async (it) => {
    if (!window.confirm(`"${it?.title}" içeriğini silmek istiyor musun?`)) return;
    try {
      await api.delete(API.detail(it.id));
      Toast().fire({ icon: "success", title: "Silindi" });
      fetchItems();
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Silinemedi" });
    }
  };

  // kart ortak aksiyon butonları
  const CardActions = ({ it }) => (
    <div className="d-flex gap-2 flex-wrap">
      {isVideo(it) && canPlay(it) && (
        <button className="btn btn-sm btn-outline-primary" onClick={() => setPreview(it)}>
          Önizle
        </button>
      )}

      {it?.type === "document" && it?.file && (
        <>
          <a className="btn btn-sm btn-outline-primary" href={it.file} target="_blank" rel="noreferrer">
            Aç
          </a>
          <a className="btn btn-sm btn-outline-secondary" href={it.file} download>
            İndir
          </a>
        </>
      )}

      {it?.type === "video" && it?.file && (
        <a className="btn btn-sm btn-outline-secondary" href={it.file} download>
          İndir
        </a>
      )}

      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(it)}>
        Sil
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center text-muted py-5">
      <div className="mb-2"><i className="bi bi-archive fs-1"></i></div>
      <div>Henüz içerik yok.</div>
    </div>
  );

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h4 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-collection-play me-2 text-primary"></i>
                  Materyallerim
                </h4>

                <div className="btn-group" role="group" aria-label="view">
                  <button className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("grid")}>
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                  <button className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("list")}>
                    <i className="bi bi-list"></i>
                  </button>
                </div>
              </div>

              {/* Filtre/arama/sıralama çubuğu */}
              <div className="card shadow-sm border-0 mb-3">
                <div className="card-body">
                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-4">
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                          className="form-control"
                          placeholder="Ara (başlık/açıklama)"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-5">
                      <div className="btn-group" role="group" aria-label="type">
                        <button
                          className={`btn btn-sm ${typeFilter === "all" ? "btn-secondary" : "btn-outline-secondary"}`}
                          onClick={() => setTypeFilter("all")}
                        >
                          Tümü ({counts.all})
                        </button>
                        <button
                          className={`btn btn-sm ${typeFilter === "video" ? "btn-secondary" : "btn-outline-secondary"}`}
                          onClick={() => setTypeFilter("video")}
                        >
                          Videolar ({counts.video})
                        </button>
                        <button
                          className={`btn btn-sm ${typeFilter === "youtube" ? "btn-secondary" : "btn-outline-secondary"}`}
                          onClick={() => setTypeFilter("youtube")}
                        >
                          YouTube ({counts.youtube})
                        </button>
                        <button
                          className={`btn btn-sm ${typeFilter === "document" ? "btn-secondary" : "btn-outline-secondary"}`}
                          onClick={() => setTypeFilter("document")}
                        >
                          Dokümanlar ({counts.document})
                        </button>
                      </div>
                    </div>

                    <div className="col-12 col-md-3">
                      <select className="form-select form-select-sm" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                        <option value="newest">Yeni ⇢ Eski</option>
                        <option value="oldest">Eski ⇢ Yeni</option>
                        <option value="title">Başlık A→Z</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste */}
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">Yükleniyor…</div>
                  ) : filtered.length === 0 ? (
                    <EmptyState />
                  ) : view === "grid" ? (
                    <div className="row g-3">
                      {filtered.map((it) => (
                        <div key={it.id} className="col-md-6 col-lg-4">
                          <div className="card h-100 shadow-sm">
                            {/* kapak/önizleme */}
                            <div className="ratio ratio-16x9 bg-light">
                              {isVideo(it) && canPlay(it) ? (
                                <ReactPlayer url={playerUrl(it)} width="100%" height="100%" controls={false} light />
                              ) : it.type === "document" ? (
                                <div className="d-flex align-items-center justify-content-center text-muted">
                                  <div className="text-center">
                                    <i className="bi bi-file-earmark-text fs-1 d-block"></i>
                                    <small>Doküman</small>
                                  </div>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center justify-content-center text-muted">
                                  <small>Önizleme yok</small>
                                </div>
                              )}
                            </div>

                            <div className="card-body d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <h6 className="mb-0">{it.title || "—"}</h6>
                                <span className="badge text-bg-secondary text-uppercase">{it.type}</span>
                              </div>
                              <p className="text-muted small mb-2">{it.description || "—"}</p>
                              <div className="text-muted small mb-3">
                                <i className="bi bi-clock me-1"></i>
                                {moment(it.created_at || it.date).format("DD MMM YYYY, HH:mm")}
                                {it.size ? <> • {formatSize(it.size)}</> : null}
                              </div>

                              <div className="mt-auto">
                                <CardActions it={it} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // list view
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: 52 }}></th>
                            <th>Başlık</th>
                            <th>Tip</th>
                            <th>Açıklama</th>
                            <th>Tarih</th>
                            <th>Boyut</th>
                            <th className="text-end">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((it) => (
                            <tr key={it.id}>
                              <td>
                                {isVideo(it) ? <i className="bi bi-play-btn"></i> : <i className="bi bi-file-earmark"></i>}
                              </td>
                              <td className="fw-semibold">{it.title || "—"}</td>
                              <td><span className="badge text-bg-secondary text-uppercase">{it.type}</span></td>
                              <td className="text-muted">{it.description || "—"}</td>
                              <td className="text-muted">{moment(it.created_at || it.date).format("DD MMM YYYY, HH:mm")}</td>
                              <td className="text-muted">{it.size ? formatSize(it.size) : "—"}</td>
                              <td className="text-end">
                                <div className="d-inline-flex gap-2">
                                  {isVideo(it) && canPlay(it) && (
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setPreview(it)}>
                                      Önizle
                                    </button>
                                  )}
                                  {it?.type === "document" && it?.file && (
                                    <>
                                      <a className="btn btn-sm btn-outline-primary" href={it.file} target="_blank" rel="noreferrer">
                                        Aç
                                      </a>
                                      <a className="btn btn-sm btn-outline-secondary" href={it.file} download>
                                        İndir
                                      </a>
                                    </>
                                  )}
                                  {it?.type === "video" && it?.file && (
                                    <a className="btn btn-sm btn-outline-secondary" href={it.file} download>
                                      İndir
                                    </a>
                                  )}
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(it)}>
                                    Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Önizleme Modal */}
      <div className={`modal fade ${preview ? "show d-block" : ""}`} tabIndex={-1} style={{ background: preview ? "rgba(0,0,0,.3)" : "transparent" }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">{preview?.title || "Önizleme"}</h6>
              <button className="btn-close" onClick={() => setPreview(null)} />
            </div>
            <div className="modal-body">
              {preview && isVideo(preview) && canPlay(preview) ? (
                <div className="ratio ratio-16x9">
                  <ReactPlayer url={playerUrl(preview)} width="100%" height="100%" controls />
                </div>
              ) : preview?.type === "document" && preview?.file ? (
                <div className="ratio ratio-16x9">
                  <iframe title="doc" src={preview.file} width="100%" height="100%" style={{ border: 0 }} />
                </div>
              ) : (
                <div className="text-center text-muted py-5">Önizleme yok</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPreview(null)}>Kapat</button>
              {preview?.file && (
                <a className="btn btn-primary" href={preview.file} download>İndir</a>
              )}
            </div>
          </div>
        </div>
      </div>

      <AkademiBaseFooter />
    </>
  );
}

export default EducatorMediaDashboard;
