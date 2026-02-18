// EskepStajerKitapTahlilis.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import {
  FiFileText,
  FiExternalLink,
  FiDownload,
  FiX,
  FiTrash2,
  FiEdit3,
  FiFolder,
  FiSearch
} from "react-icons/fi";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";
// İsteğe bağlı: küçük görsel iyileştirmeler için (skeleton, avatar, thumb vb.)
// varsa Projeler sayfasındaki css'i paylaşarak aynı stili kullanabilirsiniz.
// import "./css/eskep-stajer-projes.css";

Modal.setAppElement("#root");

function EskepStajerKitapTahlilis() {
  const api = useAxios();
  const user = useUserData();

  // Veri
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Filtreler
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [koorFilter, setKoorFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sayfalama
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const headingId = "kt-modal-title";
  const onClose = useCallback(() => setModalIsOpen(false), []);

  // Yardımcılar
  const LANG_MAP = useMemo(
    () => ({ Turkce: "Türkçe", Ingilizce: "İngilizce", Arapca: "Arapça" }),
    []
  );
  const LEVEL_MAP = useMemo(
    () => ({ Baslangic: "Başlangıç", Orta: "Orta", "Ileri Seviye": "İleri Seviye" }),
    []
  );
  const LANG_OPTIONS = useMemo(
    () => Object.entries(LANG_MAP).map(([value, label]) => ({ value, label })),
    [LANG_MAP]
  );
  const LEVEL_OPTIONS = useMemo(
    () => Object.entries(LEVEL_MAP).map(([value, label]) => ({ value, label })),
    [LEVEL_MAP]
  );
  const normLang = (v) => {
    const s = String(v || "").toLowerCase();
    if (s === "turkce" || s === "türkçe") return "Turkce";
    if (s === "ingilizce") return "Ingilizce";
    if (s === "arapca" || s === "arapça") return "Arapca";
    return "";
  };
  const normLevel = (v) => {
    const s = String(v || "").toLowerCase();
    if (s === "baslangic" || s === "başlangıç") return "Baslangic";
    if (s === "orta") return "Orta";
    if (s === "ileri seviye" || s === "ileri" || s === "ileri-seviye") return "Ileri Seviye";
    return "";
  };

  const safeUrl = (f) => {
    if (!f) return "#";
    if (typeof f === "string") return f;
    if (f?.url) return f.url;
    if (f?.file) return typeof f.file === "string" ? f.file : f.file?.url ?? "#";
    return "#";
  };
  const fileTitle = (f, i) => {
    if (!f) return `Bölüm ${i + 1}`;
    return f?.variant?.title || f?.title || `Bölüm ${i + 1}`;
    // bazı API'lerde variant_items elemanında "variant" altına başlık konabiliyor
  };
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

  const statusBadge = (s) => {
    const map = {
      "İncelemede": "badge bg-info",
      "Taslak": "badge bg-secondary",
      "Pasif": "badge bg-dark",
      "Reddedilmiş": "badge bg-danger",
      "Teslim Edildi": "badge bg-success",
      "Onaylandı": "badge bg-success",
      "Bekliyor": "badge bg-warning text-dark",
    };
    return map[s] || "badge bg-light text-dark";
  };

  const onImgError = (e) => {
    e.currentTarget.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='70'><rect width='100' height='70' fill='#e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-size='12'>no image</text></svg>`
      );
  };

  const filesExist = (p) =>
    (Array.isArray(p?.curriculum) && p.curriculum.length > 0) ||
    (Array.isArray(p?.lectures) && p.lectures.length > 0);

  // Veri çek
  const fetchData = useCallback(() => {
    if (!user?.user_id) return;
    setFetching(true);
    setError("");
    api
      .get(`eskepstajer/kitaptahlili-list/${user.user_id}/`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setAllItems(data);
        setItems(data);
        setPage(1);
      })
      .catch(() => setError("Kayıtlar yüklenemedi."))
      .finally(() => setFetching(false));
  }, [api, user?.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Koordinatör seçenekleri
  const koordinatorOptions = useMemo(() => {
    const s = new Set();
    (allItems || []).forEach((p) => {
      if (p?.koordinator?.full_name) s.add(p.koordinator.full_name);
    });
    return Array.from(s);
  }, [allItems]);

  // Filtre uygula
  useEffect(() => {
    let data = [...allItems];

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      data = data.filter((p) => (p.title || "").toLowerCase().includes(qq));
    }
    if (statusFilter !== "all") {
      data = data.filter(
        (p) => (p.kitaptahlili_status || "") === statusFilter
      );
    }
    if (koorFilter !== "all") {
      data = data.filter((p) => (p.koordinator?.full_name || "") === koorFilter);
    }
    if (langFilter !== "all") {
      data = data.filter((p) => normLang(p.language) === langFilter);
    }
    if (levelFilter !== "all") {
      data = data.filter((p) => normLevel(p.level) === levelFilter);
    }
    if (dateFrom) {
      data = data.filter((p) => p.date && moment(p.date).isSameOrAfter(moment(dateFrom)));
    }
    if (dateTo) {
      data = data.filter((p) => p.date && moment(p.date).isSameOrBefore(moment(dateTo)));
    }

    setItems(data);
    setPage(1);
  }, [q, statusFilter, koorFilter, langFilter, levelFilter, dateFrom, dateTo, allItems]);

  // Sayfalama
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (items || []).slice(start, start + pageSize);
  }, [page, items]);

  // Modal aç
  const openModal = (record) => {
    const fromCurriculum = Array.isArray(record?.curriculum)
      ? record.curriculum.flatMap((sec) =>
          Array.isArray(sec?.variant_items) ? sec.variant_items : []
        )
      : [];
    const fromTopLectures = Array.isArray(record?.lectures) ? record.lectures : [];
    setSelectedFiles([...fromCurriculum, ...fromTopLectures]);
    setModalIsOpen(true);
  };

  // Sil
  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Silinsin mi?",
      text: "Bu kayıt kalıcı olarak silinecek.",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });
    if (!ok.isConfirmed) return;

    try {
      await api.delete(`/eskepstajer/kitaptahlili-delete/${id}/`);
      Swal.fire({ icon: "success", title: "Silindi" });
      fetchData();
    } catch {
      Swal.fire({ icon: "error", title: "Silme başarısız" });
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h4 className="mb-0">
                  <i className="fas fa-book-open text-warning me-2" /> Kitap Tahlillerim
                </h4>
                <div className="text-muted small">
                  {fetching ? "Yükleniyor..." : `${items.length} kayıt`}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="mb-0">Kitap Tahlil Listesi</h3>
                      <span className="text-muted">
                        Staj sürecindeki tahlil çalışmalarınızı burdan takip edebilirsiniz.
                      </span>
                    </div>
                    <Link to="/eskep/create-kitaptahlili" className="btn btn-primary">
                      + Yeni Tahlil
                    </Link>
                  </div>
                </div>

                {/* Filtre Bar */}
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
                          placeholder="Başlığa göre ara"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          aria-label="Kitap tahlillerinde ara"
                        />
                      </div>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Durum</label>
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Duruma göre filtrele"
                      >
                        <option value="all">Tümü</option>
                        <option value="İncelemede">İncelemede</option>
                        <option value="Taslak">Taslak</option>
                        <option value="Pasif">Pasif</option>
                        <option value="Reddedilmiş">Reddedilmiş</option>
                        <option value="Teslim Edildi">Teslim Edildi</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Koordinatör</label>
                      <select
                        className="form-select"
                        value={koorFilter}
                        onChange={(e) => setKoorFilter(e.target.value)}
                        aria-label="Koordinatöre göre filtrele"
                      >
                        <option value="all">Tümü</option>
                        {koordinatorOptions.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Dil</label>
                      <select
                        className="form-select"
                        value={langFilter}
                        onChange={(e) => setLangFilter(e.target.value)}
                      >
                        <option value="all">Tümü</option>
                        {LANG_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Seviye</label>
                      <select
                        className="form-select"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                      >
                        <option value="all">Tümü</option>
                        {LEVEL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6 col-md-2">
                      <label className="form-label">Başlangıç</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        aria-label="Başlangıç tarihi"
                      />
                    </div>
                    <div className="col-6 col-md-2">
                      <label className="form-label">Bitiş</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        aria-label="Bitiş tarihi"
                      />
                    </div>

                    <div className="col-12 col-md-2 d-grid">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setQ("");
                          setStatusFilter("all");
                          setKoorFilter("all");
                          setLangFilter("all");
                          setLevelFilter("all");
                          setDateFrom("");
                          setDateTo("");
                          setItems(allItems);
                          setPage(1);
                        }}
                        title="Filtreleri temizle"
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tablo */}
                <div className="table-responsive overflow-y-hidden">
                  <table className="table mb-0 text-nowrap table-hover table-centered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Kitap Tahlili</th>
                        <th>Kayıt Tarihi</th>
                        <th>Bölümler</th>
                        <th>Durum</th>
                        <th>Koordinatör</th>
                        <th className="text-center">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {error && (
                        <tr>
                          <td colSpan={6} className="text-danger">
                            {error}
                          </td>
                        </tr>
                      )}

                      {fetching &&
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={`sk-${i}`}>
                            <td colSpan={6}>
                              <div className="placeholder-glow py-2">
                                <span className="placeholder col-2 me-2"></span>
                                <span className="placeholder col-3 me-2"></span>
                                <span className="placeholder col-2 me-2"></span>
                                <span className="placeholder col-1 me-2"></span>
                                <span className="placeholder col-1 me-2"></span>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!fetching &&
                        !error &&
                        pageData.map((c) => (
                          <tr key={c.id}>
                            <td data-label="Kitap Tahlili">
                              <div className="d-flex align-items-center">
                                <img
                                  src={c.image}
                                  onError={onImgError}
                                  alt={`${c.title || "kitap tahlili"} görseli`}
                                  className="rounded"
                                  style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }}
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1">{c.title}</h6>
                                  <div className="text-muted small">
                                    {(LANG_MAP[c.language] || c.language || "—")} · {(LEVEL_MAP[c.level] || c.level || "—")}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td data-label="Kayıt">
                              {c.date ? moment(c.date).format("D MMM YYYY") : "—"}
                            </td>

                            <td data-label="Bölümler">
                              {Array.isArray(c?.curriculum) ? c.curriculum.length : "-"}
                            </td>

                            <td data-label="Durum">
                              <span className={statusBadge(c.kitaptahlili_status)}>
                                {c.kitaptahlili_status || "—"}
                              </span>
                            </td>

                            <td data-label="Koordinatör">
                              {c.koordinator?.full_name || "—"}
                            </td>

                            <td className="text-center" data-label="İşlemler">
                              <div className="d-flex align-items-center justify-content-center gap-1">
                                <Link
                                  to={`/eskep/edit-kitaptahlili/${c.id}`}
                                  className="btn btn-sm btn-outline-warning icon-btn"
                                  title="Düzenle"
                                >
                                  <FiEdit3 size={15} />
                                </Link>

                                {filesExist(c) && (
                                  <button
                                    className="btn btn-sm btn-outline-info icon-btn"
                                    onClick={() => openModal(c)}
                                    title="Bölümleri Görüntüle"
                                  >
                                    <FiFolder size={15} />
                                  </button>
                                )}

                                 <button
                                  className="btn btn-sm btn-outline-danger icon-btn"
                                  onClick={() => handleDelete(c.id)}
                                  title="Sil"
                                >
                                  <FiTrash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!fetching && !error && pageData.length < 1 && (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
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
                      {items.length} kayıt · {page}/{totalPages} sayfa
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

      {/* Dosyalar Modal */}
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

export default EskepStajerKitapTahlilis;