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

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";
import "./css/eskep-stajer-projes.css"; // yeni küçük eklemeler (aşağıda)

function EskepStajerProjes() {
  const api = useAxios();
  const user = useUserData();

  const [allProjeler, setAllProjeler] = useState([]);
  const [projeler, setProjeler] = useState([]);
  const [fetching, setFetching] = useState(true);

  // filtreler
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
  const onClose = useCallback(() => setModalIsOpen(false), []);

  // yardımcılar
  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? f?.file ?? "#");
  const fileTitle = (f, i) =>
    f?.title ? f.title : f?.variant?.title ? f.variant.title : `Bölüm ${i + 1}`;
  const fileName = (f) =>
    (typeof f === "object" && (f?.filename || f?.name)) || undefined;

  const statusBadge = (s) => {
    const map = {
      Approved: "badge bg-success",
      Pending: "badge bg-warning text-dark",
      Rejected: "badge bg-danger",
      Draft: "badge bg-secondary",
    };
    return map[s] || "badge bg-light text-dark";
  };

  const fetchData = useCallback(() => {
    if (!user?.user_id) return;
    setFetching(true);
    api
      .get(`eskepstajer/proje-list/${user.user_id}/`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setAllProjeler(data);
        setProjeler(data);
        setPage(1);
      })
      .finally(() => setFetching(false));
  }, [api, user?.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // benzersiz koordinator listesi (filtre için)
  const koordinatorOptions = useMemo(() => {
    const set = new Set();
    (allProjeler || []).forEach((p) => {
      if (p?.koordinator?.full_name) set.add(p.koordinator.full_name);
    });
    return Array.from(set);
  }, [allProjeler]);

  // arama + filtreleri tek noktada uygula (debounce benzeri)
  useEffect(() => {
    let data = [...allProjeler];

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      data = data.filter((p) =>
        (p.title || "").toLowerCase().includes(qq)
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((p) => (p.eskepProje_status || "").toLowerCase() === statusFilter);
    }
    if (koorFilter !== "all") {
      data = data.filter((p) => (p.koordinator?.full_name || "") === koorFilter);
    }
    if (dateFrom) {
      data = data.filter((p) => p.date && moment(p.date).isSameOrAfter(moment(dateFrom)));
    }
    if (dateTo) {
      data = data.filter((p) => p.date && moment(p.date).isSameOrBefore(moment(dateTo)));
    }

    setProjeler(data);
    setPage(1);
  }, [q, statusFilter, koorFilter, dateFrom, dateTo, allProjeler]);

  const totalPages = Math.max(1, Math.ceil((projeler?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (projeler || []).slice(start, start + pageSize);
  }, [page, projeler]);

  const openModal = (proje) => {
    const fromCurriculum = Array.isArray(proje?.curriculum)
      ? proje.curriculum.flatMap((sec) =>
          Array.isArray(sec?.variant_items) ? sec.variant_items : []
        )
      : [];
    const fromTopLectures = Array.isArray(proje?.lectures) ? proje.lectures : [];
    setSelectedFiles([...fromCurriculum, ...fromTopLectures]);
    setModalIsOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;
    api.delete(`/eskepstajer/proje/${id}/`).then(() => fetchData());
  };

  // image placeholder
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
                  <i className="fas fa-project-diagram me-2"></i> Projelerim
                </h4>
                <div className="text-muted small">
                  {fetching ? "Yükleniyor..." : `${projeler.length} kayıt`}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="mb-0">Proje Listesi</h3>
                      <span className="text-muted">
                        Staj sürecindeki proje çalışmalarınızı buradan takip edebilirsiniz.
                      </span>
                    </div>
                    <Link to="/eskep/create-proje" className="btn btn-primary">
                      + Yeni Proje
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
                          onChange={(e) => setQ(e.target.value)}
                          aria-label="Proje ara"
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
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="draft">Draft</option>
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
                          setProjeler(allProjeler);
                          setPage(1);
                        }}
                        title="Filtreleri temizle"
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tablo / Liste */}
                <div className="table-responsive overflow-y-hidden">
                  <table className="table mb-0 text-nowrap table-hover table-centered eskep-table">
                    <thead className="table-light">
                      <tr>
                        <th>Proje</th>
                        <th>Kayıt Tarihi</th>
                        <th>Bölümler</th>
                        <th>Durum</th>
                        <th>Koordinatör</th>
                        <th>Koordinatördeki Durumu</th>
                        <th className="text-end">İşlemler</th>
                      </tr>
                    </thead>

                    <tbody>
                      {fetching &&
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={`sk-${i}`}>
                            <td colSpan="7">
                              <div className="skeleton-row" />
                            </td>
                          </tr>
                        ))}

                      {!fetching &&
                        pageData.map((p) => (
                          <tr key={p.id}>
                            <td data-label="Proje">
                              <div className="d-flex align-items-center">
                                <img
                                  src={p.image}
                                  onError={onImgError}
                                  alt={`${p.title || "proje"} görseli`}
                                  className="rounded eskep-thumb"
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1">{p.title}</h6>
                                  <div className="text-muted small">
                                    {(p.language || "-")} · {(p.level || "-")}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td data-label="Kayıt">
                              {p.date ? moment(p.date).format("D MMM YYYY") : "-"}
                            </td>

                            <td data-label="Bölümler">
                              {Array.isArray(p?.curriculum)
                                ? p.curriculum.length
                                : Array.isArray(p?.lectures)
                                ? p.lectures.length
                                : "-"}
                            </td>

                            <td data-label="Durum">
                              <span className={statusBadge(p.eskepProje_status)}>
                                {p.eskepProje_status || "—"}
                              </span>
                            </td>

                            <td data-label="Koordinatör">
                              <div className="d-flex align-items-center">
                                <div className="eskep-avatar">
                                  {(p?.koordinator?.full_name || "?")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <span className="ms-2">
                                  {p.koordinator?.full_name || "-"}
                                </span>
                              </div>
                            </td>

                            <td data-label="Koordinatör Durumu">
                              {p.koordinator_eskepProje_status || "-"}
                            </td>

                            <td className="text-end" data-label="İşlemler">
                              <div className="btn-group" role="group" aria-label="İşlemler">
                                <Link
                                  to={`/eskep/edit-proje/${p.id}`}
                                  className="btn btn-sm btn-outline-warning"
                                  title="Düzenle"
                                >
                                  <FiEdit3 className="me-1" />
                                  Düzenle
                                </Link>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(p.id)}
                                  title="Sil"
                                >
                                  <FiTrash2 className="me-1" />
                                  Sil
                                </button>

                                {filesExist(p) && (
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => openModal(p)}
                                    title="Bölümleri Görüntüle"
                                  >
                                    <FiFolder className="me-1" />
                                    Bölümler
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!fetching && pageData.length < 1 && (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="empty-state">
                              <FiFolder size={28} className="mb-2" />
                              <div className="fw-semibold">Proje bulunamadı</div>
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
                      {projeler.length} kayıt · {page}/{totalPages} sayfa
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
          <button
            className="iconBtn"
            aria-label="Kapat"
            onClick={onClose}
            title="Kapat"
          >
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
                      {fileName(file) && (
                        <div className="fileMeta">{fileName(file)}</div>
                      )}
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

export default EskepStajerProjes;
