// EskepStajerOdevs.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import { FiFileText, FiExternalLink, FiDownload, FiX, FiSearch } from "react-icons/fi";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";
import "./css/eskep-stajer-projes.css"; // aynı görsel dil için

Modal.setAppElement("#root");

function EskepStajerOdevs() {
  const api = useAxios();
  const user = useUserData();

  // veri & görünüm durumları
  const [allOdevs, setAllOdevs] = useState([]);
  const [odevs, setOdevs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // filtreler
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // approved | pending | rejected | draft | all
  const [koorFilter, setKoorFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // sayfalama
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const headingId = "assignment-modal-title";
  const onClose = () => setModalIsOpen(false);

  // yardımcılar
  const safeUrl = (f) => {
    if (!f) return "#";
    if (typeof f === "string") return f;
    return f?.url || f?.file || "#";
  };
  const fileTitle = (f, i) => f?.variant?.title || f?.title || `Bölüm ${i + 1}`;
  const fileName = (f) => (typeof f === "object" ? f?.filename || f?.name : undefined);

  // status normalizasyonu (TR/EN)
  const normalizeStatus = (s) => {
    const t = String(s || "").toLowerCase();
    if (["approved", "onaylandı", "onaylandi", "tamamlandı", "tamamlandi", "completed"].includes(t)) return "approved";
    if (["pending", "bekliyor", "waiting"].includes(t)) return "pending";
    if (["rejected", "reddedildi", "red"].includes(t)) return "rejected";
    if (["draft", "taslak"].includes(t)) return "draft";
    return t || "";
  };

  const statusBadge = (s) => {
    const n = normalizeStatus(s);
    const map = {
      approved: "badge bg-success",
      pending: "badge bg-warning text-dark",
      rejected: "badge bg-danger",
      draft: "badge bg-secondary",
    };
    const cls = map[n] || "badge bg-light text-dark";
    return <span className={cls}>{s || "—"}</span>;
  };

  const fetchData = async () => {
    if (!user?.user_id) return;
    try {
      setFetching(true);
      setError("");
      const res = await api.get(`eskepstajer/odev-list/${user.user_id}/`);
      const data = Array.isArray(res.data) ? res.data : [];
      setAllOdevs(data);
      setOdevs(data);
      setPage(1);
    } catch (e) {
      console.error(e);
      setError("Ödevler yüklenirken bir sorun oluştu.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // Koordinatör filtre seçenekleri
  const koordinatorOptions = useMemo(() => {
    const set = new Set();
    (allOdevs || []).forEach((p) => {
      if (p?.koordinator?.full_name) set.add(p.koordinator.full_name);
    });
    return Array.from(set);
  }, [allOdevs]);

  // Arama (debounce)
  const searchRef = useRef(null);
  const onSearchChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(applyFilters, 300);
  };

  // Filtreleri uygula
  const applyFilters = () => {
    let data = [...allOdevs];

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      data = data.filter((p) => (p.title || "").toLowerCase().includes(qq));
    }
    if (statusFilter !== "all") {
      data = data.filter((p) => normalizeStatus(p?.odev_status) === statusFilter);
    }
    if (koorFilter !== "all") {
      data = data.filter((p) => (p?.koordinator?.full_name || "") === koorFilter);
    }
    if (dateFrom) {
      data = data.filter((p) => p.date && moment(p.date).isSameOrAfter(moment(dateFrom)));
    }
    if (dateTo) {
      data = data.filter((p) => p.date && moment(p.date).isSameOrBefore(moment(dateTo)));
    }

    setOdevs(data);
    setPage(1);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, koorFilter, dateFrom, dateTo, allOdevs]);

  const totalPages = Math.max(1, Math.ceil((odevs?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (odevs || []).slice(start, start + pageSize);
  }, [page, odevs]);

  const openModal = (curriculum) => {
    const files =
      curriculum?.flatMap((item) => item?.variant_items || [])?.filter(Boolean) || [];
    setSelectedFiles(files); // { variant?, file? } yapısı
    setModalIsOpen(true);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Bu ödevi silmek istediğinize emin misiniz?");
    if (!ok) return;
    try {
      await api.delete(`/eskepstajer/odev/${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Silme işlemi sırasında bir sorun oluştu.");
    }
  };

  // image placeholder
  const onImgError = (e) => {
    e.currentTarget.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='70'><rect width='100' height='70' fill='#e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-size='12'>no image</text></svg>`
      );
  };

  const filesExist = (p) => Array.isArray(p?.curriculum) && p.curriculum.length > 0;

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
                  <i className="fas fa-chalkboard-user me-2"></i> Ödevlerim
                </h4>
                <div className="text-muted small">
                  {fetching ? "Yükleniyor..." : `${odevs.length} kayıt`}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="mb-0">Ödev Listesi</h3>
                      <span className="text-muted">
                        Staj sürecindeki ödevlerinizi buradan takip edebilirsiniz.
                      </span>
                    </div>
                    <Link to="/eskep/create-odev" className="btn btn-primary">
                      + Yeni Ödev
                    </Link>
                  </div>
                </div>

                {/* Filtre Bar */}
                <div className="card-body">
                  <div className="row g-2 align-items-end eskep-filterbar">
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
                          onChange={onSearchChange}
                          aria-label="Ödev ara"
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
                        <option value="approved">Approved/Onaylandı</option>
                        <option value="pending">Pending/Bekliyor</option>
                        <option value="rejected">Rejected/Reddedildi</option>
                        <option value="draft">Draft/Taslak</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-3">
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

                    <div className="col-6 col-md-1">
                      <label className="form-label">Başlangıç</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        aria-label="Başlangıç tarihi"
                      />
                    </div>

                    <div className="col-6 col-md-1">
                      <label className="form-label">Bitiş</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        aria-label="Bitiş tarihi"
                      />
                    </div>

                    <div className="col-12 col-md-1 d-grid">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setQ("");
                          setStatusFilter("all");
                          setKoorFilter("all");
                          setDateFrom("");
                          setDateTo("");
                          setOdevs(allOdevs);
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
                  <table className="table mb-0 text-nowrap table-hover table-centered eskep-table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Ödev</th>
                        <th>Kayıt Tarihi</th>
                        <th>Bölümler</th>
                        <th>Durum</th>
                        <th>Koordinatör</th>
                        <th className="text-end">İşlemler</th>
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
                            <td colSpan="6">
                              <div className="skeleton-row" />
                            </td>
                          </tr>
                        ))}

                      {!fetching &&
                        !error &&
                        pageData.map((c) => (
                          <tr key={c.id}>
                            <td data-label="Ödev">
                              <div className="d-flex align-items-center">
                                <img
                                  src={c.image}
                                  onError={onImgError}
                                  alt={`${c.title || "ödev"} görseli`}
                                  className="rounded eskep-thumb"
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1">{c.title}</h6>
                                  <div className="text-muted small">
                                    {(c.language || "—")} · {(c.level || "—")}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td data-label="Kayıt">
                              {c.date ? moment(c.date).format("D MMM YYYY") : "—"}
                            </td>

                            <td data-label="Bölümler">
                              {Array.isArray(c?.curriculum) ? c.curriculum.length : 0}
                            </td>

                            <td data-label="Durum">{statusBadge(c?.odev_status)}</td>

                            <td data-label="Koordinatör">
                              {c?.koordinator?.full_name || "—"}
                            </td>

                            <td className="text-end" data-label="İşlemler">
                              <div className="btn-group" role="group" aria-label="İşlemler">
                                <Link
                                  to={`/eskep/edit-odev/${c.id}`}
                                  className="btn btn-sm btn-outline-warning"
                                  title="Düzenle"
                                >
                                  Düzenle
                                </Link>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => onDelete(c.id)}
                                  title="Sil"
                                >
                                  Sil
                                </button>
                                {filesExist(c) && (
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => openModal(c.curriculum)}
                                    title="Bölümleri Görüntüle"
                                  >
                                    Bölümler
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!fetching && !error && pageData.length < 1 && (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <div className="empty-state">
                              <div className="fw-semibold">Ödev bulunamadı</div>
                              <div className="text-muted small">
                                Filtreleri temizleyip tekrar deneyin.
                              </div>
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
                      {odevs.length} kayıt · {page}/{totalPages} sayfa
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

      {/* Modal */}
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
                      {fileName(file?.file) && (
                        <div className="fileMeta">{fileName(file?.file)}</div>
                      )}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a
                      className="btn ghost"
                      href={safeUrl(file?.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Yeni sekmede aç"
                    >
                      <FiExternalLink className="btnIcon" />
                      Önizle
                    </a>
                    <a
                      className="btn primary"
                      href={safeUrl(file?.file)}
                      download={fileName(file?.file)}
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

export default EskepStajerOdevs;
