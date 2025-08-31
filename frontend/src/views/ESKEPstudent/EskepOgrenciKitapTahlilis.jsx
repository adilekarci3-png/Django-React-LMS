import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import { FiFileText, FiExternalLink, FiDownload, FiX } from "react-icons/fi";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";

function EskepOgrenciKitapTahlilis() {
  const api = useAxios();
  const user = useUserData();

  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const headingId = "book-modal-title";
  const onClose = () => setModalIsOpen(false);

  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? "#");
  const fileTitle = (f, i) => (f?.title ? f.title : `Bölüm ${i + 1}`);
  const fileName = (f) => f?.filename || undefined;

  const fetchData = async () => {
    if (!user?.user_id) return;
    setFetching(true);
    try {
      const res = await api.get(`eskepogrenci/kitaptahlili-list/${user.user_id}/`);
      setItems(res.data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchData();
    } else {
      const filtered = items.filter((c) => (c.title || "").toLowerCase().includes(query));
      setItems(filtered);
    }
  };

  const openModal = (files) => {
    setSelectedFiles(files || []);
    setModalIsOpen(true);
  };

  const collectSections = (c) => {
    if (Array.isArray(c.sections) && c.sections.length) return c.sections;
    if (Array.isArray(c.variants) && c.variants.length) return c.variants;
    if (Array.isArray(c.files) && c.files.length) return c.files;
    if (Array.isArray(c.curriculum)) {
      return c.curriculum.flatMap((it) => it?.variant_items || []);
    }
    return [];
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                <i className="fas fa-book"></i> Kitap Tahlillerim
              </h4>

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Kitap Tahlilleri</h3>
                    <span>Panel sayfanızdan tahlillerinizi inceleyebilirsiniz.</span>
                  </div>
                  <div className="card-body">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Tahlillerde ara"
                      onChange={handleSearch}
                    />
                  </div>

                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Başlık</th>
                          <th>Kayıt Tarihi</th>
                          <th>Bölümler</th>
                          <th>Durum</th>
                          <th>Hazırlayan</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items?.map((c) => {
                          const sections = collectSections(c);
                          return (
                            <tr key={c.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={c.image || c.cover}
                                    alt="kitap"
                                    className="rounded"
                                    style={{
                                      width: "100px",
                                      height: "70px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div className="ms-3">
                                    <h5>{c.title}</h5>
                                    <p className="mb-0 text-muted">
                                      {(c.language || c.lang) ?? "—"} - {c.level ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td>{c.date ? moment(c.date).format("D MMM, YYYY") : "-"}</td>
                              <td>{sections?.length || "-"}</td>
                              <td>{c.status || c.durum || "-"}</td>
                              <td>{c.koordinator?.full_name || c.author?.full_name || "—"}</td>
                              <td>
                                <Link
                                  to={`/eskep/edit-kitaptahlili/${c.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  Düzenle
                                </Link>
                                <button
                                  className="btn btn-danger btn-sm ms-2"
                                  onClick={() => {
                                    if (window.confirm("Bu tahlili silmek istediğinize emin misiniz?")) {
                                      api.delete(`/eskepogrenci/kitaptahlili/${c.id}/`).then(() => fetchData());
                                    }
                                  }}
                                >
                                  Sil
                                </button>
                                {!!sections?.length && (
                                  <button
                                    className="btn btn-info btn-sm ms-2"
                                    onClick={() => openModal(sections)}
                                  >
                                    Bölümleri Görüntüle
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {items?.length < 1 && (
                          <tr>
                            <td colSpan="6" className="text-center">
                              Kayıt bulunamadı
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        overlayClassName="modalOverlay"
        className="modalContent"
        shouldCloseOnOverlayClick
        aria={{ labelledby: headingId }}
      >
        <div className="modalHeader">
          <h3 id={headingId} className="modalTitle">Bölüm Dosyaları</h3>
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
                    <span className="fileIcon" aria-hidden><FiFileText /></span>
                    <div className="fileTexts">
                      <div className="fileTitle">{fileTitle(file.variant || file, idx)}</div>
                      {fileName(file.file || file) && (
                        <div className="fileMeta">{fileName(file.file || file)}</div>
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
          <button className="btn outline" onClick={onClose}>Kapat</button>
        </div>
      </Modal>
    </>
  );
}

export default EskepOgrenciKitapTahlilis;
