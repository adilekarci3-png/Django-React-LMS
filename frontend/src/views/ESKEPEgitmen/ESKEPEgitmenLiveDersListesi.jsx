import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import Swal from "sweetalert2";
import Modal from "react-modal";
import ESKEPEgitmenAddCanliDersPopup from "./Popup/ESKEPEgitmenAddCanliDersPopup";

Modal.setAppElement("#root");

const ESKEPEgitmenLiveDersListesi = () => {
  const api = useAxios();
  const [lessons, setLessons] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchLessons = async () => {
    try {
      const res = await api.get("/live-lessons/");
      setLessons(res.data);
    } catch (error) {
      console.error("Veri alınamadı", error);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu canlı dersi silmek istiyor musunuz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (confirmed.isConfirmed) {
      try {
        await api.delete(`/live-lessons/${id}/`);
        fetchLessons();
        Swal.fire("Silindi", "Canlı ders silindi", "success");
      } catch (error) {
        console.error("Silme işlemi başarısız", error);
        Swal.fire("Hata", "Canlı ders silinemedi", "error");
      }
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3">
              <Sidebar />
            </div>
            <div className="col-lg-9">
              <div className="bg-white p-4 rounded shadow">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="text-primary fw-bold">📅 Canlı Dersler</h3>
                  <button
                    onClick={() => setModalIsOpen(true)}
                    className="btn btn-primary btn-sm"
                  >
                    Yeni Ders Ekle
                  </button>
                </div>
                {lessons.length === 0 ? (
                  <p>Henüz canlı ders eklenmemiş.</p>
                ) : (
                  <ul className="list-group">
                    {lessons.map((lesson) => (
                      <li key={lesson.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{lesson.title}</strong> —{" "}
                            {new Date(lesson.datetime).toLocaleString()}
                            <br />
                            <a
                              href={lesson.platform_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Bağlantı
                            </a>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setEditingId(lesson.id);
                                setModalIsOpen(true);
                              }}
                              className="btn btn-sm btn-warning me-2"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(lesson.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
  isOpen={modalIsOpen}
  onRequestClose={() => {
    setModalIsOpen(false);
    setEditingId(null);
  }}
  contentLabel="Canlı Ders Ekle"
  style={{
    content: {
      maxWidth: "800px",
      margin: "auto",
      height: "90%",
    },
  }}
>
  <button
    onClick={() => {
      setModalIsOpen(false);
      setEditingId(null);
    }}
    className="btn btn-sm btn-secondary mb-3"
  >
    Kapat
  </button>

  <ESKEPEgitmenAddCanliDersPopup
    lessonId={editingId}
    onSuccess={() => {
      setModalIsOpen(false);
      setEditingId(null);
      fetchLessons();
    }}
  />
</Modal>

      <ESKEPBaseFooter />
    </>
  );
};

export default ESKEPEgitmenLiveDersListesi;
