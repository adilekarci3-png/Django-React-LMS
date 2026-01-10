import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/tr";
import Modal from "react-modal";
import { FiFileText, FiExternalLink, FiDownload, FiX } from "react-icons/fi";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";

moment.locale("tr");

function EskepOgrenciKitapTahlilis() {
  const api = useAxios();
  const user = useUserData();

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const headingId = "book-modal-title";
  const onClose = () => setModalIsOpen(false);

  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? "#");
  const fileTitle = (f, i) => (f?.title ? f.title : `Bölüm ${i + 1}`);
  const fileName = (f) => f?.filename || undefined;

  const fetchData = async () => {
    if (!user?.user_id) return;
    setFetching(true);
    try {
      const res = await api.get(
        `eskepogrenci/kitaptahlili-list/${user.user_id}/`
      );
      const arr = Array.isArray(res.data) ? res.data : [];
      setItems(arr);
      setFiltered(arr);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // raporlarda olduğu gibi olası alanları topla
  const collectSections = (c) => {
    if (Array.isArray(c.sections) && c.sections.length) return c.sections;
    if (Array.isArray(c.variants) && c.variants.length) return c.variants;
    if (Array.isArray(c.files) && c.files.length) return c.files;
    if (Array.isArray(c.curriculum)) {
      return c.curriculum.flatMap((it) => it?.variant_items || []);
    }
    return [];
  };

  // arama + durum filtresi
  useEffect(() => {
    let list = [...items];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) =>
        (c.title || "").toLowerCase().includes(q)
      );
    }
    if (status !== "all") {
      list = list.filter(
        (c) =>
          (c.status || c.durum || "")
            .toString()
            .toLowerCase() === status.toLowerCase()
      );
    }
    setFiltered(list);
  }, [search, status, items]);

  const openModal = (files) => {
    setSelectedFiles(files || []);
    setModalIsOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Bu tahlili silmek istediğinize emin misiniz?");
    if (!ok) return;
    await api.delete(`/eskepogrenci/kitaptahlili/${id}/`);
    fetchData();
  };

  const renderStatus = (c) => {
    const val = (c.status || c.durum || "").toString().toLowerCase();
    if (val === "onaylandı" || val === "approved") {
      return (
        <span className="badge bg-success-subtle text-success border">
          Onaylandı
        </span>
      );
    }
    if (val === "beklemede" || val === "pending") {
      return (
        <span className="badge bg-warning-subtle text-warning border">
          Beklemede
        </span>
      );
    }
    if (val === "red" || val === "rejected") {
      return (
        <span className="badge bg-danger-subtle text-danger border">
          Reddedildi
        </span>
      );
    }
    return <span className="badge bg-light text-muted border">—</span>;
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4 g-4">
            {/* SOL */}
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            {/* SAĞ */}
            <div className="col-lg-9 col-md-8 col-12">
              {/* üst header */}
              <div
                className="p-4 mb-4 rounded-4"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(76,175,80,.12), rgba(0,123,255,.12))",
                  border: "1px solid rgba(0,0,0,.03)",
                }}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <h3 className="mb-1 d-flex align-items-center gap-2">
                      <i className="fas fa-book text-success"></i>
                      Kitap Tahlillerim
                    </h3>
                    <p className="mb-0 text-muted">
                      Gönderdiğiniz / size atanan kitap tahlillerini buradan
                      yönetebilirsiniz.
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold fs-4">{items.length}</div>
                    <div className="text-muted small">Toplam Tahlil</div>
                  </div>
                </div>
              </div>

              {/* filtre bar */}
              <div className="card mb-3 shadow-sm border-0">
                <div className="card-body d-flex flex-wrap gap-2 align-items-center justify-content-between">
                  <div className="input-group" style={{ maxWidth: 320 }}>
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="search"
                      className="form-control border-start-0"
                      placeholder="Kitap tahlilinde ara…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      style={{ minWidth: 160 }}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="all">Tüm durumlar</option>
                      <option value="onaylandı">Onaylandı</option>
                      <option value="beklemede">Beklemede</option>
                      <option value="red">Reddedildi</option>
                    </select>
                    <Link
                      to="/eskep/create-kitaptahlili/"
                      className="btn btn-success d-flex align-items-center gap-2"
                    >
                      <i className="fas fa-plus"></i> Yeni Tahlil
                    </Link>
                  </div>
                </div>
              </div>

              {/* tablo */}
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Kitap Tahlili Listesi</h5>
                    <small className="text-muted">
                      Filtrelenen: {filtered.length} • Toplam: {items.length}
                    </small>
                  </div>
                  {fetching && (
                    <span className="badge bg-secondary">Yükleniyor…</span>
                  )}
                </div>

                <div className="table-responsive" style={{ maxHeight: 540 }}>
                  <table className="table table-hover align-middle mb-0 text-nowrap">
                    <thead
                      className="table-light sticky-top"
                      style={{ top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th>Kitap Tahlili</th>
                        <th>Tarih</th>
                        <th>Bölüm</th>
                        <th>Durum</th>
                        <th>Koordinatör</th>
                        <th className="text-end">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!fetching && filtered.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <div className="text-muted">
                              Kayıt bulunamadı. Filtreleri değiştirin.
                            </div>
                          </td>
                        </tr>
                      )}

                      {filtered.map((c) => {
                        const sections = collectSections(c);
                        return (
                          <tr key={c.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={
                                    c.image ||
                                    c.cover ||
                                    "https://via.placeholder.com/90x60.png?text=Kitap"
                                  }
                                  alt="kitap"
                                  className="rounded"
                                  style={{
                                    width: "65px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="ms-3">
                                  <div className="fw-semibold">
                                    {c.title || "Başlıksız Tahlil"}
                                  </div>
                                  <div className="small text-muted">
                                    {(c.language || c.lang) ?? "—"} •{" "}
                                    {c.level ?? "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-nowrap">
                              {c.date
                                ? moment(c.date).format("D MMM YYYY")
                                : "-"}
                            </td>
                            <td>
                              <span className="badge bg-info-subtle text-info border">
                                {sections?.length || 0}
                              </span>
                            </td>
                            <td>{renderStatus(c)}</td>
                            <td className="text-nowrap">
                              {c.koordinator?.full_name ||
                                c.author?.full_name ||
                                "—"}
                            </td>
                            <td className="text-end">
                              <div className="btn-group">
                                <Link
                                  to={`/eskep/edit-kitaptahlili/${c.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                  title="Düzenle"
                                >
                                  <i className="fas fa-pen"></i>
                                </Link>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Sil"
                                  onClick={() => handleDelete(c.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                                {!!sections?.length && (
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    title="Bölümleri Görüntüle"
                                    onClick={() => openModal(sections)}
                                  >
                                    <i className="fas fa-folder-open"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="alert alert-light border mt-3">
                <strong>Not:</strong> Tahlile eklediğiniz her PDF/bölüm burada
                ayrı ayrı listelenir.
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />

      {/* MODAL */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        overlayClassName="modalOverlay"
        className="modalContent"
        shouldCloseOnOverlayClick
        aria={{ labelledby: headingId }}
      >
        <div className="modalHeader">
          <h3 id={headingId} className="modalTitle">
            Kitap Tahlili Dosyaları
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
                      <div className="fileTitle">
                        {fileTitle(file.variant || file, idx)}
                      </div>
                      {fileName(file.file || file) && (
                        <div className="fileMeta">
                          {fileName(file.file || file)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a
                      className="btn ghost"
                      href={safeUrl(file.file || file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Yeni sekmede aç"
                    >
                      <FiExternalLink className="btnIcon" />
                      Önizle
                    </a>
                    <a
                      className="btn primary"
                      href={safeUrl(file.file || file)}
                      download={fileName(file.file || file)}
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

export default EskepOgrenciKitapTahlilis;
