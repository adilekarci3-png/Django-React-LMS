// src/components/Egitmen/EgitmenMateryaller.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

moment.locale("tr");

const TYPE_LABEL = {
  video: "Video",
  youtube: "YouTube",
  document: "Doküman",
};

const TYPE_BADGE = {
  video: "text-bg-primary",
  youtube: "text-bg-danger",
  document: "text-bg-secondary",
};

// Basit uzantı → tip kestirimi (dosya için)
const guessTypeFromFile = (urlOrName = "") => {
  const u = urlOrName.toLowerCase();
  const videoExt = [".mp4", ".mov", ".m4v", ".webm", ".ogg", ".ogv"];
  const docExt = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"];
  if (videoExt.some((e) => u.endsWith(e))) return "video";
  if (docExt.some((e) => u.endsWith(e))) return "document";
  // bilinmiyorsa varsayılanı video yapalım (ReactPlayer oynatabiliyorsa önizlenecek)
  return "video";
};

function EducatorMediaDashboard() {
  const api = useAxios();
  const user = useUserData();
  const userId = user?.user_id;

  // veri & ui state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // filtre/sort/arama
  const [queryRaw, setQueryRaw] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | video | youtube | document
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest | title

  // grid/list görünüm (localStorage)
  const [view, setView] = useState(() => localStorage.getItem("media:view") || "grid");
  useEffect(() => localStorage.setItem("media:view", view), [view]);

  // önizleme modal
  const [preview, setPreview] = useState(null);

  // --- BACKEND URL’LERİ: verdiğin şemaya göre ---
  const API = {
    linkList: "educator/video/link/",                  // GET (opsiyonel ?instructor_id=)
    linkCreate: "educator/video/link/create/",         // POST
    linkUpdate: (id) => `educator/video/link/${id}/update/`,  // PATCH/PUT
    linkDelete: (id) => `educator/video/link/${id}/delete/`,  // DELETE

    fileList: "educator/video/",                       // GET (opsiyonel ?instructor_id=)
    fileCreate: "educator/video/create/",              // POST (file upload)
    fileUpdate: (id) => `educator/video/${id}/update/`,
    fileDelete: (id) => `educator/video/${id}/delete/`,

    // document uçları şimdilik video ile aynı view’lara bağlı (senin url’de öyle tanımlı)
    docList: "educator/document/",
    docCreate: "educator/document/create/",
    docUpdate: (id) => `educator/document/${id}/update/`,
    docDelete: (id) => `educator/document/${id}/delete/`,
  };

  // Link ve file listelerini çekip tek listeye normalize eder
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const params = userId ? { params: { instructor_id: userId } } : undefined;

      const [linkRes, fileRes, docRes] = await Promise.allSettled([
        api.get(API.linkList, params),
        api.get(API.fileList, params),
        // document uçları ayrı tutuluyorsa kullan; yoksa fallback olarak boş liste
        api.get(API.docList, params).catch(() => ({ data: [] })),
      ]);

      const links = linkRes.status === "fulfilled" ? linkRes.value?.data || [] : [];
      const files = fileRes.status === "fulfilled" ? fileRes.value?.data || [] : [];
      const docsRaw = docRes.status === "fulfilled" ? docRes.value?.data || [] : [];

      // --- normalize ---
      // Link (YouTube): EducatorVideoLinkSerializer -> { id, title, description, videoUrl, created_at, instructor }
      const normLinks = links.map((x) => ({
        id: x.id,
        _kind: "link",                 // delete/update endpoint seçimi için
        type: "youtube",
        title: x.title,
        description: x.description,
        youtube_url: x.videoUrl,
        file: null,
        size: null,
        created_at: x.created_at,
        created_by_name: x?.instructor?.full_name || "",
      }));

      // File (video doküman karışık gelebilir): EducatorVideoSerializer -> { id, title, description, file, file_size, created_at, instructor }
      const normFiles = files.map((x) => {
        const t = guessTypeFromFile(x.file);
        return {
          id: x.id,
          _kind: t === "document" ? "document" : "file",
          type: t,
          title: x.title,
          description: x.description,
          youtube_url: null,
          file: x.file,
          size: x.file_size ?? null,
          created_at: x.created_at,
          created_by_name: x?.instructor?.full_name || "",
        };
      });

      // Eğer document endpointi ayrı bir liste dönüyorsa onu da ekle
      const normDocs = docsRaw.map((x) => ({
        id: x.id,
        _kind: "document",
        type: "document",
        title: x.title,
        description: x.description,
        youtube_url: null,
        file: x.file,
        size: x.file_size ?? null,
        created_at: x.created_at,
        created_by_name: x?.instructor?.full_name || "",
      }));

      setItems([...normLinks, ...normFiles, ...normDocs]);
    } catch (e) {
      console.error(e);
      setLoadError("Materyaller alınamadı");
      Toast().fire({ icon: "error", title: "Materyaller alınamadı" });
    } finally {
      setLoading(false);
    }
  }, [api, API.linkList, API.fileList, API.docList, userId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // arama için küçük debounce
  useEffect(() => {
    const t = setTimeout(() => setQuery(queryRaw.trim()), 250);
    return () => clearTimeout(t);
  }, [queryRaw]);

  const counts = useMemo(() => {
    const c = { all: items.length, youtube: 0, video: 0, document: 0 };
    items.forEach((it) => { if (c[it.type] !== undefined) c[it.type] += 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];

    // type filtrasyonu
    if (typeFilter !== "all") list = list.filter((x) => x.type === typeFilter);

    // arama
    if (query) {
      const q = query.toLowerCase();
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
    do { bytes = bytes / 1024; i++; } while (bytes >= 1024 && i < units.length - 1);
    return `${bytes.toFixed(1)} ${units[i]}`;
  };

  const handleDelete = async (it) => {
    if (!window.confirm(`"${it?.title}" içeriğini silmek istiyor musun?`)) return;
    try {
      // doğru endpoint’i seç
      if (it._kind === "link") {
        await api.delete(API.linkDelete(it.id));
      } else if (it._kind === "document") {
        // document uçlarını ayrı tutuyorsan
        await api.delete(API.docDelete(it.id));
      } else {
        await api.delete(API.fileDelete(it.id));
      }
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

  const EmptyState = ({ title = "Henüz içerik yok.", subtitle = "Yüklemeden sonra burada göreceksiniz." }) => (
    <div className="text-center text-muted py-5">
      <div className="mb-2"><i className="bi bi-archive fs-1"></i></div>
      <div className="fw-semibold">{title}</div>
      <div className="small">{subtitle}</div>
    </div>
  );

  const SkeletonGrid = () => (
    <div className="row g-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="ratio ratio-16x9 bg-light placeholder"></div>
            <div className="card-body">
              <div className="placeholder-glow">
                <span className="placeholder col-8"></span>
              </div>
              <div className="placeholder-glow mt-2">
                <span className="placeholder col-12"></span>
                <span className="placeholder col-6 ms-2"></span>
              </div>
              <div className="mt-3 d-flex gap-2">
                <span className="btn btn-sm disabled placeholder col-3"></span>
                <span className="btn btn-sm disabled placeholder col-3"></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />

          <div className="row mt-0 mt-md-4 g-4">
            <div className="col-lg-3 col-md-4 col-12">
              <div className="position-sticky" style={{ top: 88 }}>
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-2 p-md-3">
                    <Sidebar />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              {/* Üst araç çubuğu */}
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <h4 className="mb-0 d-flex align-items-center">
                    <i className="bi bi-collection-play me-2 text-primary"></i>
                    Materyallerim
                  </h4>
                  {loading && <span className="badge text-bg-secondary">Yükleniyor</span>}
                  {loadError && <span className="badge text-bg-danger">{loadError}</span>}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group" role="group" aria-label="view">
                    <button className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("grid")} title="Izgara">
                      <i className="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("list")} title="Liste">
                      <i className="bi bi-list"></i>
                    </button>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary" onClick={fetchItems} title="Yenile">
                    <i className="bi bi-arrow-clockwise"></i>
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
                          placeholder="Ara (başlık, açıklama, hazırlayan)"
                          value={queryRaw}
                          onChange={(e) => setQueryRaw(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-5">
                      <div className="d-flex flex-wrap gap-2">
                        {[
                          { key: "all", label: `Tümü (${counts.all})` },
                          { key: "video", label: `Videolar (${counts.video})` },
                          { key: "youtube", label: `YouTube (${counts.youtube})` },
                          { key: "document", label: `Dokümanlar (${counts.document})` },
                        ].map((f) => (
                          <button
                            key={f.key}
                            className={`btn btn-sm ${typeFilter === f.key ? "btn-secondary" : "btn-outline-secondary"}`}
                            onClick={() => setTypeFilter(f.key)}
                          >
                            {f.label}
                          </button>
                        ))}
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
                    <SkeletonGrid />
                  ) : filtered.length === 0 ? (
                    <EmptyState title={items.length ? "Kriterlere uyan içerik yok." : "Henüz içerik yok."} />
                  ) : view === "grid" ? (
                    <div className="row g-3">
                      {filtered.map((it) => (
                        <div key={it.id} className="col-md-6 col-lg-4">
                          <div className="card h-100 shadow-sm rounded-3 overflow-hidden">
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
                                <h6 className="mb-0 text-truncate" title={it.title || "—"}>{it.title || "—"}</h6>
                                <span className={`badge ${TYPE_BADGE[it.type] || "text-bg-secondary"} text-uppercase`}>
                                  {TYPE_LABEL[it.type] || it.type}
                                </span>
                              </div>

                              <p className="text-muted small mb-2" title={it.description || ""}>
                                {it.description || "—"}
                              </p>

                              <div className="small text-muted d-flex flex-wrap gap-2 mb-3">
                                <span><i className="bi bi-clock me-1"></i>{moment(it.created_at || it.date).format("DD MMM YYYY, HH:mm")}</span>
                                {it.created_by_name && <span>• {it.created_by_name}</span>}
                                {it.size ? <span>• {formatSize(it.size)}</span> : null}
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
                            <th>Hazırlayan</th>
                            <th>Boyut</th>
                            <th className="text-end">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((it) => (
                            <tr key={it.id}>
                              <td className="text-muted">
                                {isVideo(it) ? <i className="bi bi-play-btn"></i> : <i className="bi bi-file-earmark"></i>}
                              </td>
                              <td className="fw-semibold">{it.title || "—"}</td>
                              <td><span className={`badge ${TYPE_BADGE[it.type] || "text-bg-secondary"} text-uppercase`}>{TYPE_LABEL[it.type] || it.type}</span></td>
                              <td className="text-muted">{it.description || "—"}</td>
                              <td className="text-muted">{moment(it.created_at || it.date).format("DD MMM YYYY, HH:mm")}</td>
                              <td className="text-muted">{it.created_by_name || "—"}</td>
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
      <Modal show={!!preview} size="xl" onHide={() => setPreview(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{preview?.title || "Önizleme"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreview(null)}>Kapat</Button>
          {preview?.file && (
            <Button as="a" href={preview.file} download>
              İndir
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <AkademiBaseFooter />
    </>
  );
}

export default EducatorMediaDashboard;
