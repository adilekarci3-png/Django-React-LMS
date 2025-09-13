import { useState, useEffect, useMemo } from "react";
import { FiSave, FiPlus, FiTrash2, FiUpload, FiImage } from "react-icons/fi";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";
import "./css/odev-create.css";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";

// Markdown Editor
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

function OdevCreate() {
  const api = useAxios();
  const user = UserData();

  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState([]);

  const [odev, setOdev] = useState({
    category: "",
    image: "", // { file, preview }
    title: "",
    description: "",
    level: "",
    language: "",
    inserteduser: parseInt(user?.user_id),
    odev_status: "",
  });

  const [variants, setVariants] = useState([{ title: "", pdf: "" }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get(`course/category/`).then((res) => setCategory(res.data || []));
  }, [api]);

  const levelOptions = useMemo(
    () => ["Başlangic", "Orta", "Ileri Seviye"],
    []
  );
  const languageOptions = useMemo(
    () => ["Turkce", "Ingilizce"],
    []
  );

  const handleOdevInputChange = (e) => {
    const { name, value } = e.target;
    setOdev((s) => ({ ...s, [name]: value }));
  };

  const handleEditorChange = ({ text }) => {
    setOdev((s) => ({ ...s, description: text }));
  };

  const handleOdevImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors((er) => ({ ...er, image: "Yalnızca JPEG/PNG kabul edilir." }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setOdev((s) => ({ ...s, image: { file, preview: reader.result } }));
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
        copy[i].pdf = file || "";
        setErrors((er) => ({ ...er, [`variant_pdf_${i}`]: "" }));
      }
      return copy;
    });
  };
  const addVariant = () =>
    setVariants((arr) => [...arr, { title: "", pdf: "" }]);
  const removeVariant = (i) =>
    setVariants((arr) => arr.filter((_, idx) => idx !== i));

  const validateForm = () => {
    const er = {};
    if (!odev.title) er.title = "Ödev başlığı zorunludur.";
    if (!odev.description) er.description = "Ödev açıklaması zorunludur.";
    if (!odev.image?.file) er.image = "Kapak resmi yükleyiniz.";
    if (!odev.category) er.category = "Kategori seçiniz.";

    variants.forEach((v, i) => {
      if (!v.title) er[`variant_title_${i}`] = "Bölüm adı zorunludur.";
      if (!v.pdf) er[`variant_pdf_${i}`] = "PDF dosyası ekleyiniz.";
    });

    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formdata = new FormData();
    formdata.append("title", odev.title);
    formdata.append("inserteduser", parseInt(user?.user_id));
    formdata.append("odev_status", odev.odev_status || "");
    formdata.append("image", odev.image.file);
    formdata.append("description", odev.description);
    formdata.append("category", odev.category);
    formdata.append("level", odev.level || "");
    formdata.append("language", odev.language || "");

    variants.forEach((v, i) => {
      formdata.append(`variants[${i}][title]`, v.title);
      formdata.append(`variants[${i}][pdf]`, v.pdf);
    });

    try {
      setSubmitting(true);
      await api.post(`eskepstajer/odev-create/`, formdata);
      Swal.fire({ icon: "success", title: "Ödev başarıyla oluşturuldu" });
      // istersen burada formu sıfırlayabilirsin
    } catch (err) {
      Swal.fire({ icon: "error", title: "İşlem başarısız", text: "Lütfen tekrar deneyin." });
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
                  <h2 className="mb-0">📘 Ödev Oluştur</h2>
                </div>

                {/* Üst Bilgiler Kartı */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Genel Bilgiler</h5>
                    <small className="text-muted">
                      Başlık, durum ve açıklamayı doldurun.
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Ödev Başlığı</label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? "is-invalid" : ""}`}
                          name="title"
                          value={odev.title}
                          onChange={handleOdevInputChange}
                          placeholder="Örn. Django ORM Uygulaması"
                        />
                        {errors.title && (
                          <div className="invalid-feedback">{errors.title}</div>
                        )}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Ödev Durumu</label>
                        <select
                          className="form-select"
                          name="odev_status"
                          value={odev.odev_status}
                          onChange={handleOdevInputChange}
                        >
                          <option value="">Seçiniz</option>
                          <option value="İncelemede">İncelemede</option>
                          <option value="Pasif">Pasif</option>
                          <option value="Reddedilmiş">Reddedilmiş</option>
                          <option value="Taslak">Taslak</option>
                          <option value="Teslim Edildi">Teslim Edildi</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Ödev Açıklaması</label>
                        <MdEditor
                          value={odev.description}
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

                {/* Kategori / Seviye / Dil + Kapak Kartı */}
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
                          value={odev.category}
                          onChange={handleOdevInputChange}
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
                          className="form-select"
                          name="level"
                          value={odev.level}
                          onChange={handleOdevInputChange}
                        >
                          <option value="">Seçiniz</option>
                          {levelOptions.map((lv) => (
                            <option key={lv} value={lv}>{lv}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Dil</label>
                        <select
                          className="form-select"
                          name="language"
                          value={odev.language}
                          onChange={handleOdevInputChange}
                        >
                          <option value="">Seçiniz</option>
                          {languageOptions.map((lg) => (
                            <option key={lg} value={lg}>{lg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <div className={`upload-card ${errors.image ? "has-error" : ""}`}>
                          <div className="upload-left">
                            <div className="upload-icon">
                              {odev.image?.preview ? (
                                <img
                                  src={odev.image.preview}
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
                                JPEG/PNG yükleyin. Önerilen: 1200×630 px
                              </div>
                            </div>
                          </div>

                          <label className="btn btn-outline-primary mb-0">
                            <FiUpload className="me-2" />
                            Dosya Seç
                            <input
                              type="file"
                              className="d-none"
                              accept="image/png,image/jpeg"
                              onChange={handleOdevImageChange}
                            />
                          </label>
                        </div>
                        {errors.image && (
                          <div className="text-danger mt-1">{errors.image}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bölümler Kartı */}
                <div className="card mb-5">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">Bölümler</h5>
                      <small className="text-muted">
                        Her bölüm için ad ve PDF dosyası ekleyin.
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

                              <input
                                type="file"
                                className={`form-control mt-2 ${errors[`variant_pdf_${i}`] ? "is-invalid" : ""}`}
                                accept="application/pdf"
                                onChange={(e) => handleVariantPDF(i, e.target.files?.[0])}
                              />
                              {errors[`variant_pdf_${i}`] && (
                                <div className="invalid-feedback">
                                  {errors[`variant_pdf_${i}`]}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              className="btn btn-outline-danger variant-remove"
                              onClick={() => removeVariant(i)}
                              title="Bölümü kaldır"
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
                      title="Ödevi oluştur"
                    >
                      <FiSave className="me-2" />
                      {submitting ? "Kaydediliyor..." : "Ödevi Oluştur"}
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

export default OdevCreate;
