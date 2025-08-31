import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import { FiFileText, FiExternalLink, FiDownload, FiX } from "react-icons/fi";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import useUserData from "../plugin/useUserData";
import "./css/ModalStyle.css"

function EskepStajerKitapTahlilis() {
  const [kitaptahlilis, setKitapTahlilis] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const user = useUserData();
  const headingId = "assignment-modal-title";
  const onClose = () => setModalIsOpen(false)
  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? "#");
  const fileTitle = (f, i) => (f?.title ? f.title : `Bölüm ${i + 1}`);
  const fileName = (f) => f?.filename || undefined;

  const fetchData = () => {
    setFetching(true);
    useAxios()
      .get(`eskepstajer/kitaptahlili-list/${user?.user_id}/`)
      .then((res) => {
        setKitapTahlilis(res.data);
        console.log(res.data);
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchData();
    } else {
      const filtered = kitaptahlilis.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
      setKitapTahlilis(filtered);
    }
  };

  const openModal = (files) => {
    setSelectedFiles(files);
    console.log(files);
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
                <i className="fas fa-chalkboard-user"></i> Kitap Tahlillerim
              </h4>

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Kitap Tahlilleri</h3>
                    <span>Panel sayfanızdan ödevlerinizi incelemeye hemen başlayın.</span>
                  </div>
                  <div className="card-body">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Kitap Tahlillerinde Ara"
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Dersler</th>
                          <th>Kayıt Tarihi</th>
                          <th>Bölümler</th>
                          <th>Kitap Tahlil Durumu</th>
                          <th>Hazırlayan</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kitaptahlilis?.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={c.image}
                                  alt="kitaptahlili"
                                  className="rounded"
                                  style={{ width: "100px", height: "70px", borderRadius: "50%", objectFit: "cover" }}
                                />
                                <div className="ms-3">
                                  <h5>{c.title}</h5>
                                  <p>{c.language} - {c.level}</p>
                                </div>
                              </div>
                            </td>
                            <td>{moment(c.date).format("D MMM, YYYY")}</td>
                            <td>{c.curriculum?.length || "-"}</td>
                            <td>{c.kitaptahlili_status}</td>
                            <td>{c.koordinator?.full_name}</td>
                            <td>
                              <Link to={`/eskep/edit-kitaptahlili/${c.id}`} className="btn btn-warning btn-sm">Düzenle</Link>
                              <button
                                className="btn btn-danger btn-sm ms-2"
                                onClick={() => {
                                  if (window.confirm("Bu ödevi silmek istediğinize emin misiniz?")) {
                                    useAxios().delete(`/eskepstajer/kitaptahlili/${c.id}/`).then(() => fetchData());
                                  }
                                }}
                              >Sil</button>
                              {c.curriculum?.length > 0 && (
                                <button
                                  className="btn btn-info btn-sm ms-2"
                                  onClick={() => {
                                    const files = c.curriculum.flatMap(item => item?.variant_items.map(i => i));
                                    openModal(files);
                                  }}
                                >Bölümleri Görüntüle</button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {kitaptahlilis?.length < 1 && <tr><td colSpan="5" className="text-center">Kitap Tahlili Bulunamadı</td></tr>}
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
      aria={{
        labelledby: headingId,
      }}
    >
      {selectedFiles.map((file, index) => (
        <>
        <div className="modalHeader">
        <h3 id={headingId} className="modalTitle">
          {file.title}
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
                    <div className="fileTitle">{fileTitle(file.variant, idx)}</div>                    
                    {fileName(file.file) && (
                      <div className="fileMeta">{fileName(file.file)}</div>
                    )}
                  </div>
                </div>
                <div className="fileActions">
                  <a
                    className="btn ghost"
                    href={safeUrl(file.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Yeni sekmede aç"
                  >
                    <FiExternalLink className="btnIcon" />
                    Önizle
                  </a>
                  <a
                    className="btn primary"
                    href={safeUrl(file.file)}
                    download={fileName(file.file)}
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
          <div className="emptyState">
            Henüz eklenmiş bölüm yok.
          </div>
        )}
      </div>
      </>
      ))}
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
