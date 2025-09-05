import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

const API_LIST   = "educator/documents/"; // GET ?instructor_id=<id>
const API_DETAIL = "educator/documents/"; // PATCH/DELETE `${id}/`

const ICON_BY_EXT = {
  pdf: "fa-file-pdf text-danger",
  doc: "fa-file-word text-primary",
  docx: "fa-file-word text-primary",
  ppt: "fa-file-powerpoint text-warning",
  pptx: "fa-file-powerpoint text-warning",
  xls: "fa-file-excel text-success",
  xlsx: "fa-file-excel text-success",
  txt: "fa-file-lines text-secondary",
  rtf: "fa-file-lines text-secondary",
  odt: "fa-file-lines text-secondary",
  csv: "fa-file-csv text-success",
  md: "fa-file-lines text-dark",
};

function prettyBytes(bytes = 0) {
  if (!bytes) return "—";
  const k = 1024, sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

export default function EducatorDocuments() {
  const api = useAxios();
  const user = useUserData();

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  // UI durumları
  const [q, setQ] = useState("");
  const [ext, setExt] = useState("all");
  const [onlyPublic, setOnlyPublic] = useState(false);
  const [view, setView] = useState("grid"); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState("created_at"); // 'created_at' | 'title' | 'file_size'
  const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'

  const load = async () => {
    try {
      setBusy(true);
      const r = await api.get(`${API_LIST}?instructor_id=${user?.user_id}`);
      setItems(Array.isArray(r.data) ? r.data : r.data?.results || []);
    } catch {
      Toast().fire({ icon: "error", title: "Dökümanlar alınamadı" });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!user?.user_id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const allExts = useMemo(() => {
    const set = new Set((items || []).map((x) => (x.extension || "").toLowerCase()).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    let list = (items || []);
    if (onlyPublic) list = list.filter((it) => it.is_public);
    if (ext !== "all") list = list.filter((it) => (it.extension || "").toLowerCase() === ext);
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((it) => {
        const t = (it.title || "").toLowerCase();
        const d = (it.description || "").toLowerCase();
        const tags = (it.tags || "").toLowerCase();
        return t.includes(needle) || d.includes(needle) || tags.includes(needle);
      });
    }
    // sort
    list = [...list].sort((a, b) => {
      let av, bv;
      if (sortBy === "title") {
        av = (a.title || "").toLowerCase(); bv = (b.title || "").toLowerCase();
      } else if (sortBy === "file_size") {
        av = Number(a.file_size || 0); bv = Number(b.file_size || 0);
      } else {
        av = new Date(a.created_at || 0).getTime(); bv = new Date(b.created_at || 0).getTime();
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [items, q, ext, onlyPublic, sortBy, sortDir]);

  const onDelete = async (id) => {
    if (!window.confirm("Bu dökümanı silmek istiyor musunuz?")) return;
    try {
      await api.delete(`${API_DETAIL}${id}/`);
      setItems((s) => s.filter((x) => x.id !== id));
      Toast().fire({ icon: "success", title: "Silindi" });
    } catch {
      Toast().fire({ icon: "error", title: "Silinemedi" });
    }
  };

  const togglePublic = async (row) => {
    try {
      const body = { is_public: !row.is_public };
      await api.patch(`${API_DETAIL}${row.id}/`, body);
      setItems((s) => s.map((x) => (x.id === row.id ? { ...x, ...body } : x)));
    } catch {
      Toast().fire({ icon: "error", title: "Güncellenemedi" });
    }
  };

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      Toast().fire({ icon: "success", title: "Bağlantı kopyalandı" });
    } catch {
      Toast().fire({ icon: "error", title: "Kopyalanamadı" });
    }
  };

  return (
    <>
      <AkademiBaseHeader />

      {/* HERO başlık + arama */}
      <div className="doc-hero">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div>
              <h1 className="text-white mb-1">Dökümanlarım</h1>
              <div className="text-white-50">Yüklediğiniz tüm materyalleri tek ekrandan yönetin.</div>
            </div>
            <div className="ms-auto d-flex gap-2">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  className="form-control border-0"
                  placeholder="Ara (başlık, açıklama, etiket)…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Link to="/educator/documents/create" className="btn btn-light btn-lg">
                <i className="bi bi-upload"></i> Yeni Yükle
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="pt-4 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              {/* FİLTRER BAR (sticky) */}
              <div className="doc-toolbar shadow-sm p-3 rounded-3 mb-3">
                <div className="row g-2 align-items-center">
                  <div className="col-md">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <select
                        className="form-select w-auto"
                        value={ext}
                        onChange={(e) => setExt(e.target.value)}
                      >
                        {allExts.map((x) => (
                          <option key={x} value={x}>
                            {x === "all" ? "Tüm Türler" : x.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="onlyPublic"
                          checked={onlyPublic}
                          onChange={(e) => setOnlyPublic(e.target.checked)}
                        />
                        <label htmlFor="onlyPublic" className="form-check-label">
                          Sadece herkese açık
                        </label>
                      </div>

                      <div className="vr d-none d-md-block" />

                      <div className="d-flex align-items-center gap-2">
                        <label className="small text-muted mb-0">Sırala:</label>
                        <select
                          className="form-select form-select-sm w-auto"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="created_at">Tarihe göre</option>
                          <option value="title">Başlığa göre</option>
                          <option value="file_size">Boyuta göre</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                          title={sortDir === "asc" ? "Artan" : "Azalan"}
                        >
                          <i className={`bi bi-sort-${sortDir === "asc" ? "down" : "up"}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <div className="btn-group">
                      <button
                        className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setView("grid")}
                        title="Kart görünümü"
                      >
                        <i className="bi bi-grid-3x3-gap"></i>
                      </button>
                      <button
                        className={`btn btn-sm ${view === "table" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setView("table")}
                        title="Tablo görünümü"
                      >
                        <i className="bi bi-list-ul"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* İÇERİK */}
              <div className="card p-3 shadow-sm">
                {busy ? (
                  // İskelet yükleyici
                  <div className="row g-3">
                    {Array.from({ length: view === "table" ? 6 : 8 }).map((_, i) => (
                      <div key={i} className={view === "table" ? "col-12" : "col-xl-3 col-lg-4 col-md-6"}>
                        <div className="placeholder-glow border rounded p-3">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="placeholder col-2" style={{ height: 38 }}></span>
                            <span className="placeholder col-7"></span>
                            <span className="placeholder col-2"></span>
                          </div>
                          <span className="placeholder col-12"></span>
                          <span className="placeholder col-10"></span>
                          <span className="placeholder col-8"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  // Boş durum
                  <div className="text-center py-5 text-muted">
                    <div className="display-6 mb-2">📁</div>
                    <div className="mb-2">Hiç döküman yok ya da filtreler çok dar.</div>
                    <div>
                      <Link to="/educator/documents/create" className="btn btn-primary">
                        Yeni Döküman Yükle
                      </Link>
                    </div>
                  </div>
                ) : view === "table" ? (
                  // TABLO GÖRÜNÜMÜ
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Dosya</th>
                          <th>Başlık</th>
                          <th>Etiketler</th>
                          <th>Boyut</th>
                          <th>Tarih</th>
                          <th className="text-end">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((doc) => {
                          const iconCls = ICON_BY_EXT[(doc.extension || "").toLowerCase()] || "fa-file text-secondary";
                          return (
                            <tr key={doc.id}>
                              <td className="text-nowrap">
                                <i className={`fa-solid ${iconCls} me-2`}></i>
                                <span className="badge text-bg-light">{(doc.extension || "").toUpperCase() || "—"}</span>
                              </td>
                              <td>
                                <div className="fw-semibold">{doc.title}</div>
                                <div className="small text-muted text-truncate" style={{ maxWidth: 420 }}>
                                  {doc.description || "—"}
                                </div>
                              </td>
                              <td className="small">
                                {doc.tags
                                  ? doc.tags.split(",").map((t, i) => (
                                      <span key={i} className="badge text-bg-light me-1">
                                        {t.trim()}
                                      </span>
                                    ))
                                  : "—"}
                              </td>
                              <td className="small">{prettyBytes(doc.file_size)}</td>
                              <td className="small">{fmtDate(doc.created_at)}</td>
                              <td className="text-end">
                                <div className="d-inline-flex align-items-center gap-2">
                                  <div className="form-check form-switch mb-0">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={!!doc.is_public}
                                      onChange={() => togglePublic(doc)}
                                      title="Herkese açık"
                                    />
                                  </div>
                                  <a
                                    href={doc.file}
                                    className="btn btn-sm btn-outline-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Görüntüle
                                  </a>
                                  <button className="btn btn-sm btn-outline-secondary" onClick={() => copyLink(doc.file)}>
                                    Kopyala
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(doc.id)}>
                                    Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // GRID KARTLAR
                  <div className="row g-3">
                    {filtered.map((doc) => {
                      const iconCls = ICON_BY_EXT[(doc.extension || "").toLowerCase()] || "fa-file text-secondary";
                      return (
                        <div key={doc.id} className="col-xxl-3 col-xl-4 col-md-6">
                          <div className="doc-card h-100">
                            <div className="d-flex align-items-start gap-2">
                              <div className="doc-icon">
                                <i className={`fa-solid ${iconCls}`}></i>
                              </div>
                              <div className="flex-1">
                                <div className="fw-semibold doc-title" title={doc.title}>
                                  {doc.title}
                                </div>
                                <div className="small text-muted">
                                  {(doc.extension || "").toUpperCase() || "—"} • {prettyBytes(doc.file_size)}
                                </div>
                              </div>
                              <div className="form-check form-switch ms-auto">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={!!doc.is_public}
                                  onChange={() => togglePublic(doc)}
                                  title="Herkese açık"
                                />
                              </div>
                            </div>

                            {doc.description && (
                              <div className="small text-muted mt-2 doc-desc">
                                {doc.description}
                              </div>
                            )}

                            <div className="mt-auto d-flex gap-2 pt-3">
                              <a
                                href={doc.file}
                                className="btn btn-sm btn-outline-primary w-100"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Görüntüle / İndir
                              </a>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => copyLink(doc.file)}
                                title="Bağlantıyı kopyala"
                              >
                                <i className="bi bi-link-45deg"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onDelete(doc.id)}
                                title="Sil"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>

                            {doc.tags && (
                              <div className="mt-2 small">
                                {doc.tags.split(",").map((t, i) => (
                                  <span key={i} className="badge text-bg-light me-1">
                                    {t.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />

      {/* Sayfaya özel stiller */}
      <style>{`
        .doc-hero{
          background: linear-gradient(90deg,#023e8a,#03045e 60%, #0077b6);
          padding: 28px 0;
        }
        .doc-toolbar{
          position: sticky; top: 12px; z-index: 5; background: #fff;
        }
        .doc-card{
          border: 1px solid #eef2f7; border-radius: 14px; padding: 14px;
          display: flex; flex-direction: column; background: #fff;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .doc-card:hover{ transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
        .doc-icon{
          width: 42px; height: 42px; border-radius: 12px; background: #f8fafc;
          display: grid; place-items: center; font-size: 20px;
        }
        .doc-title{ max-width: 22ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .doc-desc{
          max-height: 3.2em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .placeholder-glow .placeholder{ display:block; border-radius: 8px; }
      `}</style>
    </>
  );
}
