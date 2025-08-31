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

function EskepStajerProjes() {
  const [projeler, setProjeler] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const user = useUserData();
  const headingId = "assignment-modal-title";
  const onClose = () => setModalIsOpen(false);

  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? f?.file ?? "#");
  const fileTitle = (f, i) =>
    f?.title ? f.title : f?.variant?.title ? f.variant.title : `Bölüm ${i + 1}`;
  const fileName = (f) =>
    (typeof f === "object" && (f?.filename || f?.name)) || undefined;

  const fetchData = () => {
    if (!user?.user_id) return;
    setFetching(true);
    useAxios()
      .get(`eskepstajer/proje-list/${user.user_id}/`)
      .then((res) => {
        setProjeler(res.data || []);
      })
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase().trim();
    if (!query) return fetchData();
    setProjeler((prev) =>
      (prev || []).filter((p) => (p.title || "").toLowerCase().includes(query))
    );
  };

  const openModal = (proje) => {
    // curriculum.variant_items (tercih edilen) + varsa tepe seviyedeki lectures
    const fromCurriculum =
      Array.isArray(proje?.curriculum)
        ? proje.curriculum.flatMap((sec) =>
            Array.isArray(sec?.variant_items) ? sec.variant_items : []
          )
        : [];

    const fromTopLectures = Array.isArray(proje?.lectures) ? proje.lectures : [];

    setSelectedFiles([...fromCurriculum, ...fromTopLectures]);
    setModalIsOpen(true);
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-2 col-md-4 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                <i className="fas fa-project-diagram"></i> Projelerim
              </h4>

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Proje Listesi</h3>
                    <span>
                      Staj sürecindeki proje çalışmalarınızı buradan takip edebilirsiniz.
                    </span>
                  </div>

                  <div className="card-body">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Projelerde Ara"
                      onChange={handleSearch}
                    />
                  </div>

                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Proje</th>
                          <th>Kayıt Tarihi</th>
                          <th>Bölümler</th>
                          <th>Durum</th>
                          <th>Koordinatör</th>
                          <th>Koordinatördeki Durumu</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeler?.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={p.image}
                                  alt="proje"
                                  className="rounded"
                                  style={{
                                    width: "100px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="ms-3">
                                  <h5>{p.title}</h5>
                                  <p>
                                    {p.language} - {p.level}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td>
                              {p.date ? moment(p.date).format("D MMM, YYYY") : "-"}
                            </td>

                            <td>
                              {Array.isArray(p?.curriculum)
                                ? p.curriculum.length
                                : Array.isArray(p?.lectures)
                                ? p.lectures.length
                                : "-"}
                            </td>

                            <td>{p.eskepProje_status || "-"}</td>
                            <td>{p.koordinator?.full_name || "-"}</td>
                            <td>{p.koordinator_eskepProje_status || "-"}</td>

                            <td>
                              <Link
                                to={`/eskep/edit-proje/${p.id}`}
                                className="btn btn-warning btn-sm"
                              >
                                Düzenle
                              </Link>
                              <button
                                className="btn btn-danger btn-sm ms-2"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bu projeyi silmek istediğinize emin misiniz?"
                                    )
                                  ) {
                                    useAxios()
                                      .delete(`/eskepstajer/proje/${p.id}/`)
                                      .then(() => fetchData());
                                  }
                                }}
                              >
                                Sil
                              </button>

                              {(Array.isArray(p?.curriculum) ||
                                Array.isArray(p?.lectures)) && (
                                <button
                                  className="btn btn-info btn-sm ms-2"
                                  onClick={() => openModal(p)}
                                >
                                  Bölümleri Görüntüle
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {projeler?.length < 1 && (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Proje bulunamadı
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

      {/* Modal (Kitap Tahlilleri sayfasındaki ile aynı stil) */}
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
            Bölüm Dosyaları
          </h3>
          <button
            className="iconBtn"
            aria-label="Kapat"
            onClick={() => setModalIsOpen(false)}
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
