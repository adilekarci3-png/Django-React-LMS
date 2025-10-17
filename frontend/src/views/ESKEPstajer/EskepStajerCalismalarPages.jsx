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
  FiFilter,
  FiFolder,
  FiSearch,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";
// (İsteğe bağlı) Proje sayfasındaki küçük stilleri burada da kullanmak isterseniz:
// import "./css/eskep-stajer-projes.css";

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

const statusBadgeClass = (status) => {
  switch (normalizeStatusKey(status)) {
    case "incelemede":
      return "badge bg-warning text-dark";
    case "taslak":
      return "badge bg-secondary";
    case "pasif":
      return "badge bg-dark";
    case "reddedildi":
      return "badge bg-danger";
    case "teslimedildi":
      return "badge bg-success";
    default:
      return "badge bg-light text-dark";
  }
};

const typeBadge = (type) => {
  switch (type) {
    case "ODEV":
      return <span className="badge bg-info">Ödev</span>;
    case "RAPOR":
      return <span className="badge bg-warning text-dark">Ders Sonu Raporu</span>;
    case "KITAP":
      return <span className="badge bg-success">Kitap Tahlili</span>;
    case "PROJE":
      return <span className="badge bg-primary">Proje</span>;
    default:
      return null;
  }
};

const LANG_MAP = { Turkce: "Türkçe", Ingilizce: "İngilizce", Arapca: "Arapça" };
const LEVEL_MAP = { Baslangic: "Başlangıç", Orta: "Orta", "Ileri Seviye": "İleri Seviye" };
// ---- end helpers ----

function EskepStajerCalismalarByStatus({ statusLabel = "İncelemede", pageTitle = "Çalışmalarım" }) {
  const api = useAxios();
  const user = useUserData();

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  // filtreler
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | ODEV | RAPOR | KITAP | PROJE
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // sayfalama
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const headingId = "assignment-modal-title";
  const onClose = useCallback(() => setModalIsOpen(false), []);

  // Delete
  const [deletingKey, setDeletingKey] = useState(null);

  // Güvenli yardımcılar
  const safeUrl = (f) => {
    if (!f) return "#";
    if (typeof f === "string") return f;
    if (f?.url) return f.url;
    if (f?.file) return typeof f.file === "string" ? f.file : f.file?.url ?? "#";
    return "#";
  };
  const fileTitle = (f, i) => (f?.title || f?.variant?.title || `Bölüm ${i + 1}`);
  const fileName = (f) => {
    if (!f) return undefined;
    if (typeof f === "object") {
      if (f?.filename) return f.filename;
      if (f?.name) return f.name;
      if (f?.file?.filename) return f.file.filename;
      if (f?.file?.name) return f.file.name;
    }
    try {
      const u = new URL(safeUrl(f));
      return decodeURIComponent(u.pathname.split("/").pop());
    } catch {
      return undefined;
    }
  };

  const pickStatus = (x) => {
    const keys = [
      "odev_status",
      "status",
      "durum",
      "derssonuraporu_status",
      "kitaptahlili_status",
      "kitap_status",
      "rapor_status",
      "kitap_durum",
      "rapor_durum",
      "state",
      "statu",
      "work_status",
      "proje_status",
      "eskepProje_status",
      "koordinator_eskepProje_status",
    ];
    for (const k of keys) {
      if (x?.[k] !== undefined && x?.[k] !== null && x?.[k] !== "") return x[k];
    }
    if (x?.meta?.status) return x.meta.status;
    return "—";
  };

  const normalize = (arr, type) =>
    (arr || []).map((x) => ({
      id: x.id,
      type,
      title: x.title || x.name || "—",
      image: x.image || x.cover || "/img/default-course.png",
      language: x.language || x.lang || "—",
      level: x.level || x.difficulty || "—",
      date: x.date || x.created_at || x.created || x.updated_at || null,
      status: pickStatus(x),
      owner: x.koordinator?.full_name || x.author?.full_name || x.owner?.full_name || "—",
      sections: [
        ...(Array.isArray(x.curriculum) ? x.curriculum.flatMap((c) => c?.variant_items || []) : []),
        ...(Array.isArray(x.sections) ? x.sections : []),
        ...(Array.isArray(x.variants) ? x.variants : []),
        ...(Array.isArray(x.files) ? x.files : []),
        ...(Array.isArray(x.lectures) ? x.lectures : []),
      ],
      raw: x,
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
        ...normalize(odevRes.data, "ODEV"),
        ...normalize(raporRes.data, "RAPOR"),
        ...normalize(kitapRes.data, "KITAP"),
        ...normalize(projeRes.data, "PROJE"),
      ];
      const wanted = merged.filter(
        (it) => normalizeStatusKey(it.status) === normalizeStatusKey(statusLabel)
      );
      setItems(wanted);
      setPage(1);
    } catch (e) {
      setError("Kayıtlar yüklenemedi.");
    } finally {
      setFetching(false);
    }
  }, [api, user?.user_id, statusLabel]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const deleteEndpointByType = (type, id) => {
    switch (type) {
      case "ODEV":
        return `eskepstajer/odev/${id}/`;
      case "RAPOR":
        return `eskepstajer/derssonuraporu/${id}/`;
      case "KITAP":
        return `eskepstajer/kitaptahlili/${id}/`;
      case "PROJE":
        return `eskepstajer/proje/${id}/`;
      default:
        return null;
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
    const url = deleteEndpointByType(it.type, it.id);
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

  // Arama + tür + tarih filtresi
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesType = typeFilter === "ALL" ? true : it.type === typeFilter;
      const matchesQuery =
        !q ||
        it.title.toLowerCase().includes(q) ||
        (it.language || "").toLowerCase().includes(q) ||
        (it.level || "").toLowerCase().includes(q) ||
        (it.owner || "").toLowerCase().includes(q);
      const matchesFrom = !dateFrom || (it.date && moment(it.date).isSameOrAfter(moment(dateFrom)));
      const matchesTo = !dateTo || (it.date && moment(it.date).isSameOrBefore(moment(dateTo)));
      return matchesType && matchesQuery && matchesFrom && matchesTo;
    });
  }, [items, query, typeFilter, dateFrom, dateTo]);

  // Sayfalama
  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (filtered || []).slice(start, start + pageSize);
  }, [filtered, page]);

  const onImgError = (e) => {
    e.currentTarget.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='70'><rect width='100' height='70' fill='#e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-size='12'>no image</text></svg>`
      );
  };

  const openModal = (secList) => {
    setSelectedFiles(secList || []);
    setModalIsOpen(true);
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* SOL: Sidebar */}
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ: İçerik */}
            <div className="col-lg-9 col-md-9 col-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h4 className="mb-0 d-flex align-items-center gap-2">
                  <i className="fas fa-chalkboard-user" />
                  {pageTitle}
                </h4>
                <div className="text-muted small">
                  {fetching ? "Yükleniyor..." : `${filtered.length} kayıt`}
                </div>
              </div>

              {/* Filtreler */}
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row g-2 align-items-end">
                    <div className="col-12 col-md-4">
                      <label className="form-label">Ara</label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden>
                          <FiSearch />
                        </span>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Başlık / dil / seviye / hazırlayan…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          aria-label="Çalışmalarda ara"
                        />
                      </div>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Tür</label>
                      <div className="d-flex align-items-center gap-2">
                        <FiFilter aria-hidden />
                        <select
                          className="form-select"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                        >
                          <option value="ALL">Tümü</option>
                          <option value="ODEV">Ödevler</option>
                          <option value="RAPOR">Ders Sonu Raporları</option>
                          <option value="KITAP">Kitap Tahlilleri</option>
                          <option value="PROJE">Projeler</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Başlangıç</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-md-2">
                      <label className="form-label">Bitiş</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-2 d-grid">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setQuery("");
                          setTypeFilter("ALL");
                          setDateFrom("");
                          setDateTo("");
                          setPage(1);
                        }}
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-header border-top">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="mb-0">Çalışmalar</h3>
                      <span className="text-muted">
                        Durum:{" "}
                        <strong className={statusBadgeClass(statusLabel)}>{statusLabel}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tablo */}
                <div className="table-responsive overflow-y-hidden">
                  <table className="table mb-0 text-nowrap table-hover table-centered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tür</th>
                        <th>Başlık / Ders</th>
                        <th>Kayıt Tarihi</th>
                        <th>Bölümler</th>
                        <th>Durum</th>
                        <th>Hazırlayan</th>
                        <th className="text-end">İşlemler</th>
                      </tr>
                    </thead>

                    <tbody>
                      {error && (
                        <tr>
                          <td colSpan={7} className="text-danger">
                            {error}
                          </td>
                        </tr>
                      )}

                      {fetching &&
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={`sk-${i}`}>
                            <td colSpan={7}>
                              <div className="placeholder-glow py-2">
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-3 me-2" />
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-1 me-2" />
                                <span className="placeholder col-1 me-2" />
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!fetching &&
                        !error &&
                        pageData.map((it) => (
                          <tr key={`${it.type}-${it.id}`}>
                            <td>{typeBadge(it.type)}</td>

                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={it.image}
                                  onError={onImgError}
                                  alt={`${it.title || "çalışma"} görseli`}
                                  className="rounded"
                                  style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }}
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1">{it.title}</h6>
                                  <div className="text-muted small">
                                    {(LANG_MAP[it.language] || it.language || "—")} · {(LEVEL_MAP[it.level] || it.level || "—")}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>{it.date ? moment(it.date).format("D MMM YYYY") : "—"}</td>
                            <td>{it.sections?.length || "-"}</td>

                            <td>
                              <span className={statusBadgeClass(it.status)}>{it.status}</span>
                            </td>

                            <td>{it.owner}</td>

                            <td className="text-end">
                              <div className="btn-group" role="group" aria-label="İşlemler">
                                {it.type === "ODEV" && (
                                  <Link to={`/eskep/edit-odev/${it.id}`} className="btn btn-sm btn-outline-warning">
                                    <FiEdit3 className="me-1" />
                                    Düzenle
                                  </Link>
                                )}
                                {it.type === "RAPOR" && (
                                  <Link to={`/eskep/edit-derssonuraporu/${it.id}`} className="btn btn-sm btn-outline-warning">
                                    <FiEdit3 className="me-1" />
                                    Düzenle
                                  </Link>
                                )}
                                {it.type === "KITAP" && (
                                  <Link to={`/eskep/edit-kitaptahlili/${it.id}`} className="btn btn-sm btn-outline-warning">
                                    <FiEdit3 className="me-1" />
                                    Düzenle
                                  </Link>
                                )}
                                {it.type === "PROJE" && (
                                  <Link to={`/eskep/edit-proje/${it.id}`} className="btn btn-sm btn-outline-warning">
                                    <FiEdit3 className="me-1" />
                                    Düzenle
                                  </Link>
                                )}

                                {!!it.sections?.length && (
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => openModal(it.sections)}
                                    title="Bölümleri Görüntüle"
                                  >
                                    <FiFolder className="me-1" />
                                    Bölümler
                                  </button>
                                )}

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={deletingKey === `${it.type}-${it.id}`}
                                  onClick={() => handleDelete(it)}
                                  title="Kaydı sil"
                                >
                                  <FiTrash2 className="me-1" />
                                  {deletingKey === `${it.type}-${it.id}` ? "Siliniyor..." : "Sil"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!fetching && !error && pageData.length < 1 && (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="text-muted">
                              <FiFolder className="mb-2" size={28} />
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
          <h3 id={headingId} className="modalTitle">
            Bölüm Dosyaları
          </h3>
          <button className="iconBtn" aria-label="Kapat" onClick={onClose} title="Kapat">
            <FiX />
          </button>
        </div>

        <div className="modalBody">
          {selectedFiles?.length ? (
            <ul className="fileList" role="list">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="fileItem">
                  <div className="fileMain">
                    <span className="fileIcon" aria-hidden>
                      <FiFileText />
                    </span>
                    <div className="fileTexts">
                      <div className="fileTitle">{fileTitle(file, idx)}</div>
                      {fileName(file) && <div className="fileMeta">{fileName(file)}</div>}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a
                      className="btn ghost"
                      href={safeUrl(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Yeni sekmede aç"
                    >
                      <FiExternalLink className="btnIcon" />
                      Önizle
                    </a>
                    <a
                      className="btn primary"
                      href={safeUrl(file)}
                      download={fileName(file)}
                      title="İndir"
                    >
                      <FiDownload className="btnIcon" />
                      İndir
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
          <button className="btn outline" onClick={onClose}>
            Kapat
          </button>
        </div>
      </Modal>
    </>
  );
}

// --- 5 sayfa (status + başlık) ---
export function EskepStajerTaslakCalismalar() {
  return (
    <EskepStajerCalismalarByStatus statusLabel="Taslak" pageTitle="Taslakta Olan Çalışmalarım" />
  );
}

export function EskepStajerPasifCalismalar() {
  return (
    <EskepStajerCalismalarByStatus statusLabel="Pasif" pageTitle="Pasifte Olan Çalışmalarım" />
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
      statusLabel="Teslim Edildi"
      pageTitle="Teslim Edilmiş Çalışmalarım"
    />
  );
}

export function EskepStajerIncelemedeCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="İncelemede"
      pageTitle="İncelemede Olan Çalışmalarım"
    />
  );
}
