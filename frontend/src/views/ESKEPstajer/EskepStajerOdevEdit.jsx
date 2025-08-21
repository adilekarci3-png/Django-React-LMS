import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import moment from "moment";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import { FiFileText, FiExternalLink, FiDownload, FiX, FiUpload } from "react-icons/fi";
import "./css/ModalStyle.css";

Modal.setAppElement("#root"); // erişilebilirlik

const headingId = "assignment-modal-title-edit";

export default function EskepStajerOdevEdit() {
  const { id } = useParams();
  const api = useAxios();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Form state
  const [form, setForm] = useState({
    title: "",
    language: "",
    level: "",
    date: "",
    odev_status: "",
    koordinator: null, // { id, full_name } olabilir
    image: "",          // URL
  });
  const [imageFile, setImageFile] = useState(null); // yeni seçilen dosya
  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return form.image || "";
  }, [imageFile, form.image]);

  const onClose = () => setModalIsOpen(false);
  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? "#");
  const fileTitle = (f, i) => (f?.title ? f.title : `Bölüm ${i + 1}`);
  const fileName = (f) => f?.filename || undefined;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/eskepstajer/odev/${id}/`);
      setForm({
        title: data?.title ?? "",
        language: data?.language ?? "",
        level: data?.level ?? "",
        date: data?.date ? moment(data.date).format("YYYY-MM-DD") : "",
        odev_status: data?.odev_status ?? "",
        koordinator: data?.koordinator ?? null,
        image: data?.image ?? "",
      });

      // curriculum -> variant_items -> file listesine dönüştür
      const files = (data?.curriculum || [])
        .flatMap((item) => (item?.variant_items || []).map((vi) => vi.file))
        .filter(Boolean);
      setSelectedFiles(files);

    } catch (e) {
      setError(e?.response?.data?.detail || "Ödev yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // cleanup image object url
    return () => {
      if (imageFile) URL.revokeObjectURL(imageFile);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Görsel seçilmişse FormData, değilse JSON ile güncelle
      if (imageFile) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("language", form.language);
        fd.append("level", form.level);
        fd.append("date", form.date || "");
        fd.append("odev_status", form.odev_status);
        if (form.koordinator?.id) fd.append("koordinator", form.koordinator.id);
        fd.append("image", imageFile);

        await api.put(`/eskepstajer/odev/${id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(`/eskepstajer/odev/${id}/`, {
          title: form.title,
          language: form.language,
          level: form.level,
          date: form.date || null,
          odev_status: form.odev_status,
          koordinator: form.koordinator?.id ?? null,
          image: form.image || null, // backend kabul ediyorsa
        });
      }

      alert("Ödev güncellendi.");
      navigate(-1); // listeye dön
    } catch (e) {
      setError(e?.response?.data?.detail || "Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const openFilesModal = () => setModalIsOpen(true);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="mb-0">
                  <i className="fas fa-pen-to-square"></i> Ödev Düzenle
                </h4>
                <Link to="/stajer/odevlerim" className="btn btn-light btn-sm">
                  ← Listeye Dön
                </Link>
              </div>

              {loading && <p className="mt-3 p-3">Yükleniyor…</p>}
              {!loading && (
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Ödev Bilgileri</h5>
                    <small className="text-muted">
                      Zorunlu alanlar * ile işaretlidir.
                    </small>
                  </div>
                  <div className="card-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSave} noValidate>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="title" className="form-label">
                            Başlık *
                          </label>
                          <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            className="form-control"
                            value={form.title}
                            onChange={onChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="language" className="form-label">
                            Dil
                          </label>
                          <input
                            id="language"
                            name="language"
                            type="text"
                            className="form-control"
                            value={form.language}
                            onChange={onChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="level" className="form-label">
                            Seviye
                          </label>
                          <input
                            id="level"
                            name="level"
                            type="text"
                            className="form-control"
                            value={form.level}
                            onChange={onChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="date" className="form-label">
                            Kayıt Tarihi
                          </label>
                          <input
                            id="date"
                            name="date"
                            type="date"
                            className="form-control"
                            value={form.date}
                            onChange={onChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label htmlFor="odev_status" className="form-label">
                            Ödev Durumu
                          </label>
                          <select
                            id="odev_status"
                            name="odev_status"
                            className="form-select"
                            value={form.odev_status}
                            onChange={onChange}
                            aria-describedby="statusHelp"
                          >
                            <option value="">Seçiniz</option>
                            <option value="Taslak">Taslak</option>
                            <option value="Yayınlandı">Yayınlandı</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                          </select>
                          <div id="statusHelp" className="form-text">
                            Yayınlanan ödevler öğrenci panelinde görünür.
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="image" className="form-label">
                            Kapak Görseli
                          </label>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              style={{
                                width: 120,
                                height: 80,
                                borderRadius: 8,
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                display: "grid",
                                placeItems: "center",
                                background: "#fafafa",
                              }}
                            >
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Ödev görsel önizleme"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <span className="text-muted">Önizleme</span>
                              )}
                            </div>

                            <label className="btn btn-outline-secondary mb-0" htmlFor="imageInput">
                              <FiUpload className="me-1" />
                              Görsel Seç
                            </label>
                            <input
                              id="imageInput"
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={onImageChange}
                            />
                          </div>
                          {form.image && !imageFile && (
                            <div className="form-text">Mevcut: {form.image}</div>
                          )}
                        </div>

                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-info btn-sm"
                            onClick={openFilesModal}
                            aria-describedby="filesHelp"
                          >
                            Bölümleri Görüntüle
                          </button>
                          <div id="filesHelp" className="form-text">
                            Bu ödeve ait yüklenmiş bölüm dosyalarını görüntüleyin/indirin.
                          </div>
                        </div>
                      </div>

                      <hr className="my-4" />
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                          aria-busy={saving}
                        >
                          {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                        <Link to="/stajer/odevlerim" className="btn btn-light">
                          İptal
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />

      {/* Dosya Modalı */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={onClose}
        overlayClassName="modalOverlay"
        className="modalContent"
        shouldCloseOnOverlayClick
        aria={{ labelledby: headingId }}
      >
        <div className="modalHeader">
          <h3 id={headingId} className="modalTitle">Ödev Bölümleri</h3>
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
          <button className="btn outline" onClick={onClose}>Kapat</button>
        </div>
      </Modal>
    </>
  );
}
