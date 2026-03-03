// KitapTahliliCreate.jsx
import { useState, useEffect, useMemo } from "react";
import { Link , useNavigate} from "react-router-dom";
import { FiSave, FiPlus, FiTrash2, FiUpload, FiImage } from "react-icons/fi";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";

import "./css/odev-create.css";

// ✅ Markdown Editor
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

const MAX_IMAGE_MB = 5;

function KitapTahliliCreate() {
  const api = useAxios();
  const navigate = useNavigate();

  // Hem hook hem fallback (ortama göre biri boş olabilir)
  const userHook = useUserData();
  const userFallback = UserData?.() || {};
  const user = userHook?.user_id ? userHook : userFallback;

  // === Dil & Seviye (Django CHOICES ile birebir) ===
  const LANG_MAP = useMemo(
    () => ({ Turkce: "Türkçe", Ingilizce: "İngilizce", Arapca: "Arapça" }),
    []
  );
  const LEVEL_MAP = useMemo(
    () => ({ Baslangic: "Başlangıç", Orta: "Orta", "Ileri Seviye": "İleri Seviye" }),
    []
  );
  const LANGUAGE_OPTIONS = useMemo(
    () => Object.entries(LANG_MAP).map(([value, label]) => ({ value, label })),
    [LANG_MAP]
  );
  const LEVEL_OPTIONS = useMemo(
    () => Object.entries(LEVEL_MAP).map(([value, label]) => ({ value, label })),
    [LEVEL_MAP]
  );

  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState([]);

  const [kitaptahlili, setKitapTahlili] = useState({
    category: "",
    image: null, // { file, preview }
    title: "",
    description: "",
    level: "",
    language: "",
    kitaptahlili_status: "",
  });

  const [variants, setVariants] = useState([{ title: "", pdf: null }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get(`course/category/`).then((res) => setCategory(res.data || []));
  }, [api]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setKitapTahlili((s) => ({ ...s, [name]: value }));
  };

  const handleEditorChange = ({ text }) => {
    setKitapTahlili((s) => ({ ...s, description: text }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setErrors((er) => ({ ...er, image: "Yalnızca JPEG/PNG/WEBP kabul edilir." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: `En fazla ${MAX_IMAGE_MB}MB yükleyin.` }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setKitapTahlili((s) => ({ ...s, image: { file, preview: reader.result } }));
      setErrors((er) => ({ ...er, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleVariantTitle = (i, val) => {
    setVariants((arr) => {
      const copy = [...arr];
      copy[i].title = val;
      return copy;
    });
  };

  const handleVariantPDF = (i, file) => {
    setVariants((arr) => {
      const copy = [...arr];
      if (file && file.type !== "application/pdf") {
        setErrors((er) => ({
          ...er,
          [`variant_pdf_${i}`]: "Yalnızca PDF dosyaları kabul edilir.",
        }));
      } else {
        copy[i].pdf = file || null;
        setErrors((er) => ({ ...er, [`variant_pdf_${i}`]: "" }));
      }
      return copy;
    });
  };

  const addVariant = () => setVariants((arr) => [...arr, { title: "", pdf: null }]);

  const removeVariant = (i) =>
    setVariants((arr) => {
      if (arr.length === 1) return arr; // en az 1 bölüm kalsın
      return arr.filter((_, idx) => idx !== i);
    });

  const validateForm = () => {
    const er = {};
    if (!kitaptahlili.title?.trim()) er.title = "Kitap Tahlili başlığı zorunludur.";
    if (!kitaptahlili.description?.trim()) er.description = "Kitap Tahlili açıklaması zorunludur.";
    if (!kitaptahlili.image?.file) er.image = "Kapak resmi yükleyiniz.";
    if (!kitaptahlili.category) er.category = "Kategori seçiniz.";
    if (!kitaptahlili.level) er.level = "Seviye seçiniz.";
    if (!kitaptahlili.language) er.language = "Dil seçiniz.";

    variants.forEach((v, i) => {
      if (!v.title?.trim()) er[`variant_title_${i}`] = "Bölüm adı zorunludur.";
      if (!v.pdf) er[`variant_pdf_${i}`] = "PDF dosyası ekleyiniz.";
    });

    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const resetForm = () => {
    setKitapTahlili({
      category: "",
      image: null,
      title: "",
      description: "",
      level: "",
      language: "",
      kitaptahlili_status: "",
    });
    setVariants([{ title: "", pdf: null }]);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("title", kitaptahlili.title);
    if (user?.user_id) fd.append("inserteduser", parseInt(user.user_id));
    fd.append("kitaptahlili_status", kitaptahlili.kitaptahlili_status || "");
    fd.append("image", kitaptahlili.image.file);
    fd.append("description", kitaptahlili.description);
    fd.append("category", kitaptahlili.category);
    // Backend KEY'leriyle gönder (Baslangic/Orta/Ileri Seviye — Turkce/Ingilizce/Arapca)
    fd.append("level", kitaptahlili.level);
    fd.append("language", kitaptahlili.language);

    variants.forEach((v, i) => {
      fd.append(`variants[${i}][title]`, v.title);
      fd.append(`variants[${i}][pdf]`, v.pdf);
    });

    try {
      setSubmitting(true);
      await api.post(`eskepstajer/kitaptahlili-create/`, fd);
      Swal.fire({ icon: "success", title: "Kitap Tahlili başarıyla oluşturuldu" });
      resetForm();
      navigate("/eskepstajer/kitaptahlileris");
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
            {/* Daha dar bir sidebar (sayfa genişlesin) */}
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">
              <form onSubmit={handleSubmit}>
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <h2 className="mb-0">
                    <i className="fas fa-book-open text-warning me-2" />
                    Kitap Tahlili Oluştur</h2>
                  <Link to="/eskepstajer/kitaptahlileris" className="btn btn-light">
                     ← Listeye Dön
                  </Link>
                </div>

                {/* Genel Bilgiler */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Genel Bilgiler</h5>
                    <small className="text-muted">Başlık, durum ve açıklamayı doldurun.</small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Başlık</label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? "is-invalid" : ""}`}
                          name="title"
                          value={kitaptahlili.title}
                          onChange={handleInput}
                          placeholder="Örn. Bir Bilim İnsanının Romanı Tahlili"
                        />
                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Durum</label>
                        <select
                          className="form-select"
                          name="kitaptahlili_status"
                          value={kitaptahlili.kitaptahlili_status}
                          onChange={handleInput}
                        >
                          <option value="">Seçiniz</option>
                          <option value="İncelemede">İncelemede</option>
                          <option value="Taslak">Taslak</option>
                          <option value="Pasif">Pasif</option>
                          <option value="Reddedilmiş">Reddedilmiş</option>
                          <option value="Teslim Edildi">Teslim Edildi</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Açıklama</label>
                        <MdEditor
                          value={kitaptahlili.description}
                          style={{ height: 260 }}
                          renderHTML={(text) => mdParser.render(text)}
                          onChange={handleEditorChange}
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
                    <small className="text-muted">
                      Kategori, seviye, dil seçin ve bir kapak resmi yükleyin.
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Kategori</label>
                        <select
                          className={`form-select ${errors.category ? "is-invalid" : ""}`}
                          name="category"
                          value={kitaptahlili.category}
                          onChange={handleInput}
                        >
                          <option value="">Seçiniz</option>
                          {category.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <div className="invalid-feedback">{errors.category}</div>
                        )}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Seviye</label>
                        <select
                          className={`form-select ${errors.level ? "is-invalid" : ""}`}
                          name="level"
                          value={kitaptahlili.level}
                          onChange={handleInput}
                        >
                          <option value="">Seçiniz</option>
                          {LEVEL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {errors.level && <div className="invalid-feedback">{errors.level}</div>}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Dil</label>
                        <select
                          className={`form-select ${errors.language ? "is-invalid" : ""}`}
                          name="language"
                          value={kitaptahlili.language}
                          onChange={handleInput}
                        >
                          <option value="">Seçiniz</option>
                          {LANGUAGE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {errors.language && (
                          <div className="invalid-feedback">{errors.language}</div>
                        )}
                      </div>

                      <div className="col-12">
                        <div className={`upload-card ${errors.image ? "has-error" : ""}`}>
                          <div className="upload-left">
                            <div className="upload-icon">
                              {kitaptahlili.image?.preview ? (
                                <img
                                  src={kitaptahlili.image.preview}
                                  alt="Kapak önizleme"
                                  className="cover-preview"
                                />
                              ) : (
                                <FiImage size={28} />
                              )}
                            </div>
                            <div>
                              <div className="fw-semibold">Kapak Resmi</div>
                              <div className="text-muted small">
                                JPEG/PNG/WEBP yükleyin. En fazla {MAX_IMAGE_MB}MB. Önerilen:
                                1200×630 px
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
                              onChange={onImageChange}
                            />
                          </label>
                        </div>
                        {errors.image && <div className="text-danger mt-1">{errors.image}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bölümler */}
                <div className="card mb-5">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">Bölümler</h5>
                      <small className="text-muted">
                        Her bölüm için ad ve PDF dosyası ekleyin (en az 1 bölüm).
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={addVariant}
                      title="Yeni bölüm ekle"
                    >
                      <FiPlus className="me-1" />
                      Yeni Bölüm
                    </button>
                  </div>

                  <div className="card-body">
                    <div className="row g-3">
                      {variants.map((v, i) => (
                        <div key={i} className="col-12">
                          <div className="variant-card">
                            <div className="variant-index">{i + 1}</div>
                            <div className="variant-fields">
                              <input
                                type="text"
                                className={`form-control ${errors[`variant_title_${i}`] ? "is-invalid" : ""}`}
                                placeholder="Bölüm Adı"
                                value={v.title}
                                onChange={(e) => handleVariantTitle(i, e.target.value)}
                              />
                              {errors[`variant_title_${i}`] && (
                                <div className="invalid-feedback">
                                  {errors[`variant_title_${i}`]}
                                </div>
                              )}

                              <div className="mt-2 d-flex gap-2 align-items-center">
                                <input
                                  type="file"
                                  className={`form-control ${errors[`variant_pdf_${i}`] ? "is-invalid" : ""}`}
                                  accept="application/pdf"
                                  onChange={(e) => handleVariantPDF(i, e.target.files?.[0])}
                                />
                                {v.pdf && (
                                  <span className="small text-muted">{v.pdf.name}</span>
                                )}
                              </div>
                              {errors[`variant_pdf_${i}`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`variant_pdf_${i}`]}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              className="btn btn-outline-danger variant-remove"
                              onClick={() => removeVariant(i)}
                              title="Bölümü kaldır"
                              disabled={variants.length === 1}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Yapışkan alt çubuk (Kaydet) */}
                <div className="sticky-savebar">
                  <div className="container-xxl d-flex justify-content-end py-2">
                    <button
                      className="btn btn-success btn-lg"
                      type="submit"
                      disabled={submitting}
                      title="Kitap tahlilini oluştur"
                    >
                      <FiSave className="me-2" />
                      {submitting ? "Kaydediliyor..." : "Kitap Tahlili Oluştur"}
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

export default KitapTahliliCreate;
