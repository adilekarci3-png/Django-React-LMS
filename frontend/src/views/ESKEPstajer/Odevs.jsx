import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function Odevs() {
  const [odevs, setOdevs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchData = () => {
    setFetching(true);
    useAxios()
      .get(`eskepstajer/odev-list/${UserData()?.user_id}/`)
      .then((res) => {
        setOdevs(res.data);
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
      const filtered = odevs.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
      setOdevs(filtered);
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
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                <i className="fas fa-chalkboard-user"></i> Ödevlerim
              </h4>

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Ödevler</h3>
                    <span>Panel sayfanızdan ödevlerinizi incelemeye hemen başlayın.</span>
                  </div>
                  <div className="card-body">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Ödevlerinde Ara"
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
                          <th>Ödev Durumu</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {odevs?.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={c.image}
                                  alt="odev"
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
                            <td>{c.odev_status}</td>
                            <td>
                              <Link to={`/odev/duzenle/${c.id}`} className="btn btn-warning btn-sm">Düzenle</Link>
                              <button
                                className="btn btn-danger btn-sm ms-2"
                                onClick={() => {
                                  if (window.confirm("Bu ödevi silmek istediğinize emin misiniz?")) {
                                    useAxios().delete(`/eskepstajer/odev/${c.id}/`).then(() => fetchData());
                                  }
                                }}
                              >Sil</button>
                              {c.curriculum?.length > 0 && (
                                <button
                                  className="btn btn-info btn-sm ms-2"
                                  onClick={() => {
                                    const files = c.curriculum.flatMap(item => item.items.map(i => i.file));
                                    openModal(files);
                                  }}
                                >Bölümleri Görüntüle</button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {odevs?.length < 1 && <tr><td colSpan="5" className="text-center">Ödev Bulunamadı</td></tr>}
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
  style={{
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Arka plana opaklık efekti
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    content: {
      width: "400px",
      maxHeight: "300px",
      margin: "auto",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      backgroundColor: "#fff"
    }
  }}
>
  <h3 style={{ marginBottom: "10px" }}>Ödev Bölümleri</h3>
  <ul style={{ listStyle: "none", padding: 0, maxHeight: "150px", overflowY: "auto" }}>
    {selectedFiles.map((file, index) => (
      
      <li key={index} style={{ marginBottom: "5px" }}>
        {file.title}
        <a 
          href={file} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}
        >
          Bölüm {index + 1}
        </a>
      </li>
    ))}
  </ul>
  <button 
    onClick={() => setModalIsOpen(false)} 
    style={{
      marginTop: "15px",
      padding: "8px 16px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer"
    }}
  >
    Kapat
  </button>
</Modal>

    </>
  );
}

export default Odevs;
