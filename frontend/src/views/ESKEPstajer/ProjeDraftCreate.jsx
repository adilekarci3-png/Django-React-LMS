// src/pages/ESKEP/Stajer/ProjeDraftCreate.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSave, FiUpload, FiImage, FiFileText } from "react-icons/fi";
import Sidebar from "../ESKEP/Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

// Markdown Editor
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

const MAX_IMAGE_MB = 5;

function ProjeDraftCreate() {
  const api = useAxios();
  const user = UserData();

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    language: "",
    plan_week_count: 5,
    image: null, // { file, preview }
    initial_draft_file: null,
    proje_status: "pending",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get("course/category/").then((res) => {
      setCategories(res.data || []);
    });
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = ({ text }) => {
    setForm((prev) => ({ ...prev, description: text }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Yalnızca JPEG/PNG/WEBP kabul edilir." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: `En fazla ${MAX_IMAGE_MB}MB yükleyin.` }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: { file, preview: reader.result } }));
      setErrors((prev) => ({ ...prev, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleDraftFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, initial_draft_file: file }));
    setErrors((prev) => ({ ...prev, initial_draft_file: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title?.trim()) newErrors.title = "Proje başlığı zorunludur.";
    if (!form.description?.trim()) newErrors.description = "Proje açıklaması (ön taslak) zorunludur.";
    if (!form.category) newErrors.category = "Kategori seçiniz.";
    if (!form.plan_week_count) newErrors.plan_week_count = "Kaç hafta süreceğini seçiniz.";
    if (!form.initial_draft_file) newErrors.initial_draft_file = "Ön taslak dosyası yükleyiniz.";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("level", form.level || "");
    fd.append("language", form.language || "");
    fd.append("plan_week_count", form.plan_week_count);
    fd.append("proje_status", form.proje_status);
    fd.append("inserteduser", parseInt(user?.user_id));

    if (form.image?.file) fd.append("image", form.image.file);
    if (form.initial_draft_file) fd.append("initial_draft_file", form.initial_draft_file);

    try {
      setSubmitting(true);
      await api.post("eskepstajer/proje-create/", fd);
      Swal.fire({
        icon: "success",
        title: "Ön taslak gönderildi",
        text: "Koordinatör onayladıktan sonra haftalık içerik ekranı açılacaktır.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "İşlem başarısız",
        text: err?.response?.data?.detail || "Lütfen tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">
              <form onSubmit={handleSubmit}>

                {/* Sayfa başlığı */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <h2 className="mb-0">
                    <i className="fas fa-file-alt text-primary me-2" />
                    Stajyer Projesi – Ön Taslak
                  </h2>
                  <Link to="/eskepstajer/projes" className="btn btn-light">
                    ← Listeye Dön
                  </Link>
                </div>

                {/* Bilgi notu */}
                <div className="alert alert-info d-flex align-items-start gap-2 mb-4">
                  <i className="fas fa-info-circle mt-1" />
                  <div>
                    Bu form <strong>bir defa</strong> doldurulur. Koordinatör onayladıktan sonra haftalık yükleme ekranı açılır.
                  </div>
                </div>

                {/* Genel Bilgiler */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Genel Bilgiler</h5>
                    <small className="text-muted">Başlık ve açıklamayı doldurun.</small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">

                      <div className="col-12">
                        <label className="form-label">Proje Başlığı</label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? "is-invalid" : ""}`}
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="Örn. Yapay Zeka ile Görüntü İşleme Projesi"
                        />
                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                      </div>

                      <div className="col-12">
                        <label className="form-label">Proje Açıklaması / Ön Taslak</label>
                        <MdEditor
                          value={form.description}
                          style={{ height: "260px" }}
                          renderHTML={(text) => mdParser.render(text)}
                          onChange={handleDescriptionChange}
                        />
                        {errors.description && (
                          <div className="text-danger mt-1">{errors.description}</div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Kapsam & Kapak */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Kapsam & Kapak</h5>
                    <small className="text-muted">Kategori, seviye, dil ve süreyi seçin. İsteğe bağlı kapak resmi yükleyin.</small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">

                      <div className="col-md-4">
                        <label className="form-label">Kategori</label>
                        <select
                          name="category"
                          className={`form-select ${errors.category ? "is-invalid" : ""}`}
                          value={form.category}
                          onChange={handleChange}
                        >
                          <option value="">-- seçiniz --</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                        {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Seviye <span className="text-muted small">(opsiyonel)</span></label>
                        <select
                          name="level"
                          className="form-select"
                          value={form.level}
                          onChange={handleChange}
                        >
                          <option value="">-- seçiniz --</option>
                          <option value="Baslangic">Başlangıç</option>
                          <option value="Orta">Orta</option>
                          <option value="Ileri Seviye">İleri Seviye</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Dil <span className="text-muted small">(opsiyonel)</span></label>
                        <select
                          name="language"
                          className="form-select"
                          value={form.language}
                          onChange={handleChange}
                        >
                          <option value="">-- seçiniz --</option>
                          <option value="Turkce">Türkçe</option>
                          <option value="Ingilizce">İngilizce</option>
                          <option value="Arapca">Arapça</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Planlanan Süre</label>
                        <select
                          name="plan_week_count"
                          className={`form-select ${errors.plan_week_count ? "is-invalid" : ""}`}
                          value={form.plan_week_count}
                          onChange={handleChange}
                        >
                          <option value={5}>5 Hafta</option>
                          <option value={7}>7 Hafta</option>
                        </select>
                        <div className="form-text">Staj dönemi boyunca kaç hafta içerik yükleyeceğini belirler.</div>
                        {errors.plan_week_count && (
                          <div className="invalid-feedback d-block">{errors.plan_week_count}</div>
                        )}
                      </div>

                      {/* Kapak Resmi */}
                      <div className="col-12">
                        <div className={`upload-card ${errors.image ? "has-error" : ""}`}>
                          <div className="upload-left">
                            <div className="upload-icon">
                              {form.image?.preview ? (
                                <img
                                  src={form.image.preview}
                                  alt="Kapak önizleme"
                                  className="cover-preview"
                                />
                              ) : (
                                <FiImage size={28} />
                              )}
                            </div>
                            <div>
                              <div className="fw-semibold">Kapak Resmi <span className="text-muted small fw-normal">(opsiyonel)</span></div>
                              <div className="text-muted small">
                                JPEG/PNG/WEBP yükleyin. En fazla {MAX_IMAGE_MB}MB. Önerilen: 1200×630 px
                              </div>
                            </div>
                          </div>
                          <label className="btn btn-outline-primary mb-0">
                            <FiUpload className="me-2" />
                            Dosya Seç
                            <input
                              type="file"
                              className="d-none"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                        {errors.image && <div className="text-danger mt-1">{errors.image}</div>}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Ön Taslak Dosyası */}
                <div className="card mb-5">
                  <div className="card-header">
                    <h5 className="mb-0">Ön Taslak Dosyası</h5>
                    <small className="text-muted">PDF, DOC veya PPTX formatında tek seferlik taslak dosyanızı yükleyin.</small>
                  </div>
                  <div className="card-body">
                    <div className={`upload-card ${errors.initial_draft_file ? "has-error" : ""}`}>
                      <div className="upload-left">
                        <div className="upload-icon">
                          <FiFileText size={28} className={form.initial_draft_file ? "text-success" : ""} />
                        </div>
                        <div>
                          <div className="fw-semibold">
                            {form.initial_draft_file
                              ? form.initial_draft_file.name
                              : "Taslak Dosyası"}
                          </div>
                          <div className="text-muted small">
                            {form.initial_draft_file
                              ? `${(form.initial_draft_file.size / 1024 / 1024).toFixed(2)} MB`
                              : "PDF, DOC, DOCX, PPTX kabul edilir."}
                          </div>
                        </div>
                      </div>
                      <label className="btn btn-outline-primary mb-0">
                        <FiUpload className="me-2" />
                        Dosya Seç
                        <input
                          type="file"
                          className="d-none"
                          onChange={handleDraftFileChange}
                        />
                      </label>
                    </div>
                    {errors.initial_draft_file && (
                      <div className="text-danger mt-1">{errors.initial_draft_file}</div>
                    )}
                  </div>
                </div>

                {/* Yapışkan alt çubuk */}
                <div className="sticky-savebar">
                  <div className="container-xxl d-flex justify-content-end py-2">
                    <button
                      className="btn btn-success btn-lg"
                      type="submit"
                      disabled={submitting}
                    >
                      <FiSave className="me-2" />
                      {submitting ? "Gönderiliyor..." : "Ön Taslağı Gönder"}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default ProjeDraftCreate;