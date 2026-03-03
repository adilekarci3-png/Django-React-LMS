// EskepStajerCalismalarPages.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import {
  FiFileText,
  FiExternalLink,
  FiDownload,
  FiX,
  FiFolder,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiBook,
  FiClipboard,
  FiBookOpen,
  FiLayers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSlash,
  FiArchive,
} from "react-icons/fi";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";

Modal.setAppElement("#root");

// ---- helpers ----
const trLower = (s) => String(s ?? "").toLocaleLowerCase("tr").trim();

const normalizeStatusKey = (s) => {
  const t = trLower(s);
  if (t.includes("incele")) return "incelemede";
  if (t.includes("taslak")) return "taslak";
  if (t.includes("pasif")) return "pasif";
  if (t.includes("redd")) return "reddedildi";
  if (t.includes("teslim") || t.includes("onay") || t.includes("kabul") || t.includes("tamam"))
    return "teslimedildi";
  return t;
};

// Durum badge — sadece badge içi renkli, etrafı yok
const statusBadge = (status) => {
  const key = normalizeStatusKey(status);
  const map = {
    incelemede: { cls: "badge bg-info",       label: "İncelemede" },
    taslak:     { cls: "badge bg-secondary",  label: "Taslak" },
    pasif:      { cls: "badge bg-dark",       label: "Pasif" },
    reddedildi: { cls: "badge bg-danger",     label: "Reddedildi" },
    teslimedildi: { cls: "badge bg-success",  label: "Teslim Edildi" },
  };
  const entry = map[key];
  return entry
    ? <span className={entry.cls}>{entry.label}</span>
    : <span className="badge bg-light text-dark">{status || "—"}</span>;
};

// Tür badge — Ödev=success, Rapor=info, Kitap=warning, Proje=danger
const typeBadge = (type) => {
  switch (type) {
    case "ODEV":  return <span className="badge bg-success">Ödev</span>;
    case "RAPOR": return <span className="badge bg-info">Rapor</span>;
    case "KITAP": return <span className="badge bg-warning text-dark">Tahlil</span>;
    case "PROJE": return <span className="badge bg-danger">Proje</span>;
    default:      return null;
  }
};

// Sayfa başlığı ikonu — tipe göre
const PAGE_META = {
  ALL:   { icon: <FiLayers   className="me-2 text-secondary" />,                          label: "Tümü" },
  ODEV:  { icon: <FiBook     className="me-2 text-success"   />,                          label: "Ödevler" },
  RAPOR: { icon: <FiClipboard className="me-2 text-info"    />,                           label: "Ders Sonu Raporları" },
  KITAP: { icon: <FiBookOpen className="me-2 text-warning"   />,                          label: "Kitap Tahlilleri" },
  PROJE: { icon: <FiFileText className="me-2 text-danger"    />,                          label: "Projeler" },
};

// Durum ikonu (sayfa başlığı için)
const STATUS_META = {
  taslak:      { icon: <FiArchive     className="me-2 text-secondary" />, color: "text-secondary" },
  pasif:       { icon: <FiSlash       className="me-2 text-dark"      />, color: "text-dark" },
  reddedildi:  { icon: <FiAlertCircle className="me-2 text-danger"    />, color: "text-danger" },
  teslimedildi:{ icon: <FiCheckCircle className="me-2 text-success"   />, color: "text-success" },
  incelemede:  { icon: <FiClock       className="me-2 text-info"      />, color: "text-info" },
};

const LANG_MAP  = { Turkce: "Türkçe", Ingilizce: "İngilizce", Arapca: "Arapça" };
const LEVEL_MAP = { Baslangic: "Başlangıç", Orta: "Orta", "Ileri Seviye": "İleri Seviye" };
// ---- end helpers ----

function EskepStajerCalismalarByStatus({ statusLabel = "İncelemede", pageTitle = "Çalışmalarım" }) {
  const api  = useAxios();
  const user = useUserData();

  const [fetching, setFetching] = useState(true);
  const [error,    setError   ] = useState("");
  const [items,    setItems   ] = useState([]);

  // filtreler
  const [query,      setQuery     ] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFrom,   setDateFrom  ] = useState("");
  const [dateTo,     setDateTo    ] = useState("");

  // sayfalama
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal
  const [modalIsOpen,    setModalIsOpen   ] = useState(false);
  const [selectedFiles,  setSelectedFiles ] = useState([]);
  const headingId = "assignment-modal-title";
  const onClose = useCallback(() => setModalIsOpen(false), []);

  // Delete
  const [deletingKey, setDeletingKey] = useState(null);

  // --- dosya yardımcıları ---
  const safeUrl = (f) => {
    if (!f) return "#";
    if (typeof f === "string") return f;
    if (f?.url) return f.url;
    if (f?.file) return typeof f.file === "string" ? f.file : f.file?.url ?? "#";
    return "#";
  };
  const fileTitle = (f, i) => f?.title || f?.variant?.title || `Bölüm ${i + 1}`;
  const fileName  = (f) => {
    if (!f) return undefined;
    if (typeof f === "object") {
      if (f?.filename)        return f.filename;
      if (f?.name)            return f.name;
      if (f?.file?.filename)  return f.file.filename;
      if (f?.file?.name)      return f.file.name;
    }
    try {
      const u = new URL(safeUrl(f));
      return decodeURIComponent(u.pathname.split("/").pop());
    } catch { return undefined; }
  };

  const pickStatus = (x) => {
    const keys = [
      "odev_status", "status", "durum", "derssonuraporu_status",
      "kitaptahlili_status", "kitap_status", "rapor_status",
      "kitap_durum", "rapor_durum", "state", "statu",
      "work_status", "proje_status", "eskepProje_status",
    ];
    for (const k of keys) {
      if (x?.[k] !== undefined && x?.[k] !== null && x?.[k] !== "") return x[k];
    }
    return "—";
  };

  const normalize = (arr, type) =>
    (arr || []).map((x) => ({
      id:       x.id,
      type,
      title:    x.title || x.name || "—",
      image:    x.image || x.cover || "/img/default-course.png",
      language: x.language || x.lang || "—",
      level:    x.level || x.difficulty || "—",
      date:     x.date || x.created_at || x.created || x.updated_at || null,
      status:   pickStatus(x),
      owner:    x.koordinator?.full_name || x.author?.full_name || x.owner?.full_name || "—",
      sections: [
        ...(Array.isArray(x.curriculum) ? x.curriculum.flatMap((c) => c?.variant_items || []) : []),
        ...(Array.isArray(x.sections)   ? x.sections   : []),
        ...(Array.isArray(x.variants)   ? x.variants   : []),
        ...(Array.isArray(x.files)      ? x.files      : []),
        ...(Array.isArray(x.lectures)   ? x.lectures   : []),
      ],
    }));

  const fetchAll = useCallback(async () => {
    if (!user?.user_id) return;
    setFetching(true);
    setError("");
    try {
      const [odevRes, raporRes, kitapRes, projeRes] = await Promise.all([
        api.get(`eskepstajer/odev-list/${user.user_id}/`),
        api.get(`eskepstajer/derssonuraporu-list/${user.user_id}/`),
        api.get(`eskepstajer/kitaptahlili-list/${user.user_id}/`),
        api.get(`eskepstajer/proje-list/${user.user_id}/`),
      ]);
      const merged = [
        ...normalize(odevRes.data,  "ODEV"),
        ...normalize(raporRes.data, "RAPOR"),
        ...normalize(kitapRes.data, "KITAP"),
        ...normalize(projeRes.data, "PROJE"),
      ];
      const wanted = merged.filter(
        (it) => normalizeStatusKey(it.status) === normalizeStatusKey(statusLabel)
      );
      setItems(wanted);
      setPage(1);
    } catch {
      setError("Kayıtlar yüklenemedi.");
    } finally {
      setFetching(false);
    }
  }, [api, user?.user_id, statusLabel]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const editLink = (it) => {
    switch (it.type) {
      case "ODEV":  return `/eskep/edit-odev/${it.id}`;
      case "RAPOR": return `/eskep/edit-derssonuraporu/${it.id}`;
      case "KITAP": return `/eskep/edit-kitaptahlili/${it.id}`;
      case "PROJE": return `/eskep/edit-proje/${it.id}`;
      default:      return "#";
    }
  };

  const deleteEndpoint = (type, id) => {
    switch (type) {
      case "ODEV":  return `eskepstajer/odev-delete/${id}/`;
      case "RAPOR": return `eskepstajer/derssonuraporu-delete/${id}/`;
      case "KITAP": return `eskepstajer/kitaptahlili-delete/${id}/`;
      case "PROJE": return `eskepstajer/proje-delete/${id}/`;
      default:      return null;
    }
  };

  const handleDelete = async (it) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Silinsin mi?",
      text: "Bu kayıt kalıcı olarak silinecek.",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });
    if (!ask.isConfirmed) return;

    const key = `${it.type}-${it.id}`;
    const url = deleteEndpoint(it.type, it.id);
    if (!url) return;

    try {
      setDeletingKey(key);
      await api.delete(url);
      await fetchAll();
      Swal.fire({ icon: "success", title: "Silindi", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Silme başarısız" });
    } finally {
      setDeletingKey(null);
    }
  };

  // Filtreleme
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return items.filter((it) => {
      const matchesType  = typeFilter === "ALL" || it.type === typeFilter;
      const matchesQuery = !q
        || it.title.toLocaleLowerCase("tr").includes(q)
        || (it.language || "").toLocaleLowerCase("tr").includes(q)
        || (it.level    || "").toLocaleLowerCase("tr").includes(q)
        || (it.owner    || "").toLocaleLowerCase("tr").includes(q);
      const matchesFrom = !dateFrom || (it.date && moment(it.date).isSameOrAfter(moment(dateFrom)));
      const matchesTo   = !dateTo   || (it.date && moment(it.date).isSameOrBefore(moment(dateTo)));
      return matchesType && matchesQuery && matchesFrom && matchesTo;
    });
  }, [items, query, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const pageData   = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const onImgError = (e) => {
    e.currentTarget.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><rect width='72' height='72' fill='#e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-size='11'>no image</text></svg>`
      );
  };

  const statusMeta = STATUS_META[normalizeStatusKey(statusLabel)] || {};

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">

              {/* ── SAYFA BAŞLIĞI (üstte, bağımsız) ── */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                  {statusMeta.icon}
                  <h4 className="mb-0">{pageTitle}</h4>
                  <span className="text-muted small ms-1">
                    {fetching ? "" : `· ${filtered.length} kayıt`}
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  Durum: <strong className={statusMeta.color || ""}>{statusLabel}</strong>
                </p>
              </div>

              {/* ── FİLTRE + TABLO KARTI ── */}
              <div className="card mb-4">
                {/* Filtreler */}
                <div className="card-body border-bottom">
                  <div className="row g-2 align-items-end">
                    <div className="col-12 col-md-4">
                      <label className="form-label">Ara</label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden><FiSearch /></span>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Başlık / dil / seviye / koordinatör…"
                          value={query}
                          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                          aria-label="Çalışmalarda ara"
                        />
                      </div>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Tür</label>
                      <select
                        className="form-select"
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                      >
                        <option value="ALL">Tümü</option>
                        <option value="ODEV">Ödevler</option>
                        <option value="RAPOR">Ders Sonu Raporları</option>
                        <option value="KITAP">Kitap Tahlilleri</option>
                        <option value="PROJE">Projeler</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Başlangıç</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      />
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Bitiş</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      />
                    </div>

                    <div className="col-12 col-md-2 d-grid">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => { setQuery(""); setTypeFilter("ALL"); setDateFrom(""); setDateTo(""); setPage(1); }}
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tablo */}
                <div className="table-responsive overflow-y-hidden">
                  <table className="table table-sm mb-0 text-nowrap table-hover table-centered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tür</th>
                        <th>Başlık / Ders</th>
                        <th>Kayıt Tarihi</th>
                        <th>Bölümler</th>
                        <th>Durum</th>
                        <th>Kordinatör</th>
                        <th className="text-center">İşlemler</th>
                      </tr>
                    </thead>

                    <tbody>
                      {error && (
                        <tr>
                          <td colSpan={7} className="text-danger">{error}</td>
                        </tr>
                      )}

                      {fetching && Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`sk-${i}`}>
                          <td colSpan={7}>
                            <div className="placeholder-glow py-2">
                              <span className="placeholder col-1 me-2" />
                              <span className="placeholder col-3 me-2" />
                              <span className="placeholder col-2 me-2" />
                              <span className="placeholder col-1 me-2" />
                              <span className="placeholder col-1 me-2" />
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!fetching && !error && pageData.map((it) => (
                        <tr key={`${it.type}-${it.id}`}>
                          {/* Tür */}
                          <td>{typeBadge(it.type)}</td>

                          {/* Başlık */}
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={it.image}
                                onError={onImgError}
                                alt={`${it.title} görseli`}
                                className="rounded"
                                style={{ width: 52, height: 52, objectFit: "cover", flexShrink: 0 }}
                              />
                              <div className="ms-3">
                                <h6 className="mb-1 fw-semibold">{it.title}</h6>
                                <div className="text-muted small">
                                  {LANG_MAP[it.language] || it.language || "—"} · {LEVEL_MAP[it.level] || it.level || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tarih */}
                          <td>{it.date ? moment(it.date).format("D MMM YYYY") : "—"}</td>

                          {/* Bölümler */}
                          <td>{it.sections?.length || "—"}</td>

                          {/* Durum */}
                          <td>{statusBadge(it.status)}</td>

                          {/* Hazırlayan */}
                          <td>{it.owner}</td>

                          {/* İşlemler — sadece ikonlar, ortalı, sıkıştırılmış */}
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <Link
                                to={editLink(it)}
                                className="btn btn-sm btn-outline-warning icon-btn px-1 py-1"
                                title="Düzenle"
                              >
                                <FiEdit3 size={14} />
                              </Link>

                              {!!it.sections?.length && (
                                <button
                                  className="btn btn-sm btn-outline-info icon-btn px-1 py-1"
                                  onClick={() => { setSelectedFiles(it.sections); setModalIsOpen(true); }}
                                  title="Bölümleri Görüntüle"
                                >
                                  <FiFolder size={14} />
                                </button>
                              )}

                              <button
                                className="btn btn-sm btn-outline-danger icon-btn px-1 py-1"
                                disabled={deletingKey === `${it.type}-${it.id}`}
                                onClick={() => handleDelete(it)}
                                title="Kaydı sil"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!fetching && !error && pageData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="text-muted">
                              <FiFolder size={28} className="mb-2" />
                              <div className="fw-semibold">Kayıt bulunamadı</div>
                              <div className="small">Filtreleri temizleyip tekrar deneyin.</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sayfalama */}
                {!fetching && totalPages > 1 && (
                  <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="small text-muted">
                      {filtered.length} kayıt · {page}/{totalPages} sayfa
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Önceki
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Sonraki
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />

      {/* Bölümler Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={onClose}
        overlayClassName="modalOverlay"
        className="modalContent"
        shouldCloseOnOverlayClick
        aria={{ labelledby: headingId }}
      >
        <div className="modalHeader">
          <h3 id={headingId} className="modalTitle">Bölüm Dosyaları</h3>
          <button className="iconBtn" aria-label="Kapat" onClick={onClose}><FiX /></button>
        </div>

        <div className="modalBody">
          {selectedFiles?.length ? (
            <ul className="fileList" role="list">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="fileItem">
                  <div className="fileMain">
                    <span className="fileIcon" aria-hidden><FiFileText /></span>
                    <div className="fileTexts">
                      <div className="fileTitle">{fileTitle(file, idx)}</div>
                      {fileName(file) && <div className="fileMeta">{fileName(file)}</div>}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a className="btn ghost" href={safeUrl(file)} target="_blank" rel="noopener noreferrer" title="Önizle">
                      <FiExternalLink className="btnIcon" />Önizle
                    </a>
                    <a className="btn primary" href={safeUrl(file)} download={fileName(file)} title="İndir">
                      <FiDownload className="btnIcon" />İndir
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="emptyState">Henüz eklenmiş bölüm yok.</div>
          )}
        </div>

        <div className="modalFooter">
          <button className="btn outline" onClick={onClose}>Kapat</button>
        </div>
      </Modal>
    </>
  );
}

// --- 5 sayfa export'u ---
export function EskepStajerIncelemedeCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="İncelemede"
      pageTitle="İncelemede Olan Çalışmalarım"
    />
  );
}

export function EskepStajerTaslakCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="Taslak"
      pageTitle="Taslakta Olan Çalışmalarım"
    />
  );
}

export function EskepStajerPasifCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="Pasif"
      pageTitle="Pasifte Olan Çalışmalarım"
    />
  );
}

export function EskepStajerReddedilmisCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="Reddedilmiş"
      pageTitle="Reddedilmiş Çalışmalarım"
    />
  );
}

export function EskepStajerTeslimEdilmisCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="Teslim Edilmiş"
      pageTitle="Teslim Edilmiş Çalışmalarım"
    />
  );
}