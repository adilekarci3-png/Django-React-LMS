import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";
import "./css/odev-create.css";
import { FiSave, FiPlus, FiTrash2, FiUpload, FiImage } from "react-icons/fi";
// Markdown
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

function DersSonuRaporuEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const user = UserData();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState([]);
  const [errors, setErrors] = useState({});

  // Form
  const [derssonuraporu, setDersSonuRaporu] = useState({
    id: null,
    category: "",
    image: "", // mevcut URL
    title: "",
    description: "",
    level: "",
    language: "",
    inserteduser: null,
    derssonuraporu_status: "",
  });

  // Yeni seçilen kapak resmi
  const [imageFile, setImageFile] = useState(null);
  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : derssonuraporu.image || ""),
    [imageFile, derssonuraporu.image]
  );

  // Variant’lar: {id?, title, pdfFile?, existingUrl?}
  const [variants, setVariants] = useState([
    { id: undefined, title: "", pdfFile: null, existingUrl: "" },
  ]);
  // Silinecek mevcut variant id’leri
  const [variantsToDelete, setVariantsToDelete] = useState([]);

  // Seçenekler (sabitlere uygun)
  const levelOptions = useMemo(
    () => ["Baslangic", "Orta", "Ileri Seviye"],
    []
  );
  const languageOptions = useMemo(
    () => ["Turkce", "Ingilizce", "Arapca"],
    []
  );
  const displayLabel = (val) => {
    const map = {
      Baslangic: "Başlangıç",
      Orta: "Orta",
      "Ileri Seviye": "İleri Seviye",
      Turkce: "Türkçe",
      Ingilizce: "İngilizce",
      Arapca: "Arapça",
    };
    return map[val] || val;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, raporRes] = await Promise.all([
          api.get("course/category/"),
          api.get(`eskepstajer/derssonuraporu-detail/${user?.user_id}/${id}/`),
        ]);
        setCategory(catRes.data || []);

        const d = raporRes.data || {};
        setDersSonuRaporu({
          id: d.id,
          category: d.category?.id ?? "",
          image: d.image ?? "",
          title: d.title ?? "",
          description: d.description ?? "",
          level: d.level ?? "",
          language: d.language ?? "",
          inserteduser: parseInt(user?.user_id),
          derssonuraporu_status: d.derssonuraporu_status ?? "",
        });

        // curriculum → variant_items → file
        const v = (d.curriculum || []).map((c) => {
          const firstItem = (c.variant_items || [])[0];
          const fileVal = firstItem?.file;
          const url = typeof fileVal === "string" ? fileVal : firstItem?.file?.url ?? "";
          return {
            id: c.id,
            title: c.title || firstItem?.title || "",
            pdfFile: null,
            existingUrl: url,
          };
        });
        setVariants(
          v.length ? v : [{ id: undefined, title: "", pdfFile: null, existingUrl: "" }]
        );
        setVariantsToDelete([]);
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Ders Sonu Raporu yüklenemedi",
          text: e?.response?.data?.detail || "",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      if (imageFile) URL.revokeObjectURL(imageFile);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setDersSonuRaporu((s) => ({ ...s, [name]: value }));
  };

  const handleEditorChange = ({ text }) => {
    setDersSonuRaporu((s) => ({ ...s, description: text }));
  };

  const onImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(f.type)) {
      setErrors((er) => ({ ...er, image: "Yalnızca resim dosyaları kabul edilir." }));
      return;
    }
    setImageFile(f);
    setErrors((er) => ({ ...er, image: "" }));
  };

  // Variant helpers
  const handleVariantTitle = (idx, val) => {
    setVariants((arr) => arr.map((v, i) => (i === idx ? { ...v, title: val } : v)));
  };
  const handleVariantFile = (idx, file) => {
    if (file && file.type !== "application/pdf") {
      setErrors((er) => ({
        ...er,
        [`variant_pdf_${idx}`]: "Yalnızca PDF dosyaları kabul edilir.",
      }));
      return;
    }
    setVariants((arr) => arr.map((v, i) => (i === idx ? { ...v, pdfFile: file || null } : v)));
    setErrors((er) => ({ ...er, [`variant_pdf_${idx}`]: "" }));
  };
  const addVariant = () => {
    setVariants((arr) => [...arr, { id: undefined, title: "", pdfFile: null, existingUrl: "" }]);
  };
  const removeVariant = (idx) => {
    setVariants((arr) => {
      const removed = arr[idx];
      if (removed?.id) setVariantsToDelete((ls) => [...ls, removed.id]); // curriculum id
      const copy = [...arr];
      copy.splice(idx, 1);
      return copy.length ? copy : [{ id: undefined, title: "", pdfFile: null, existingUrl: "" }];
    });
  };

  const validate = () => {
    const er = {};
    if (!derssonuraporu.title) er.title = "Ders Sonu Raporu başlığı zorunludur.";
    if (!derssonuraporu.description) er.description = "Ders Sonu Raporu açıklaması zorunludur.";
    if (!derssonuraporu.category) er.category = "Kategori seçiniz.";

    variants.forEach((v, i) => {
      if (!v.title) er[`variant_title_${i}`] = "Bölüm adı zorunludur.";
      if (!v.pdfFile && !v.existingUrl)
        er[`variant_pdf_${i}`] = "PDF gereklidir (yeni yükleyin veya mevcut kalsın).";
    });

    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", derssonuraporu.title);
      fd.append("inserteduser", parseInt(user?.user_id));
      fd.append("derssonuraporu_status", derssonuraporu.derssonuraporu_status || "");
      fd.append("description", derssonuraporu.description || "");
      fd.append("category", derssonuraporu.category || "");
      fd.append("level", derssonuraporu.level || "");
      fd.append("language", derssonuraporu.language || "");

      if (imageFile) fd.append("image", imageFile);

      variants.forEach((v, i) => {
        if (v.id) fd.append(`variants[${i}][id]`, v.id);
        fd.append(`variants[${i}][title]`, v.title);
        if (v.pdfFile) fd.append(`variants[${i}][pdf]`, v.pdfFile);
      });

      if (variantsToDelete.length) {
        variantsToDelete.forEach((vid) => fd.append("variants_to_delete[]", vid));
      }

      await api.put(`eskepstajer/derssonuraporu-edit/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({ icon: "success", title: "Ders Sonu Raporu güncellendi" });
      navigate("/eskepstajer/derssonuraporus");
    } catch (e2) {
      Swal.fire({
        icon: "error",
        title: "Kaydetme hatası",
        text: e2?.response?.data?.detail || "Bir sorun oluştu.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sol: Sidebar */}
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* Sağ: Form */}
            <div className="col-lg-9 col-md-9 col-12">
              <form onSubmit={handleSubmit}>
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <h2 className="mb-0">✏️ Ders Sonu Raporu Düzenle</h2>
                  <Link to="/eskepstajer/derssonuraporus" className="btn btn-light">
                    ← Listeye Dön
                  </Link>
                </div>

                {loading ? (
                  <p>Yükleniyor…</p>
                ) : (
                  <>
                    {/* Genel Bilgiler */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">Genel Bilgiler</h5>
                        <small className="text-muted">
                          Başlık, durum ve açıklamayı güncelleyin.
                        </small>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-8">
                            <label className="form-label">Rapor Başlığı</label>
                            <input
                              type="text"
                              className={`form-control ${errors.title ? "is-invalid" : ""}`}
                              name="title"
                              value={derssonuraporu.title}
                              onChange={onChange}
                            />
                            {errors.title && (
                              <div className="invalid-feedback">{errors.title}</div>
                            )}
                          </div>

                          <div className="col-md-4">
                            <label className="form-label">Durum</label>
                            <select
                              className="form-select"
                              name="derssonuraporu_status"
                              value={derssonuraporu.derssonuraporu_status}
                              onChange={onChange}
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
                            <label className="form-label">Açıklama</label>
                            <MdEditor
                              value={derssonuraporu.description}
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
                          Kategori, seviye, dil ve kapak görselini düzenleyin.
                        </small>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label">Kategori</label>
                            <select
                              className={`form-select ${errors.category ? "is-invalid" : ""}`}
                              name="category"
                              value={derssonuraporu.category}
                              onChange={onChange}
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
                              value={derssonuraporu.level || ""}
                              onChange={onChange}
                            >
                              <option value="">Seçiniz</option>
                              {levelOptions.map((lv) => (
                                <option key={lv} value={lv}>
                                  {displayLabel(lv)}
                                </option>
                              ))}
                            </select>
                            {errors.level && <span className="text-danger">{errors.level}</span>}
                          </div>

                          <div className="col-md-4">
                            <label className="form-label">Dil</label>
                            <select
                              className="form-select"
                              name="language"
                              value={derssonuraporu.language || ""}
                              onChange={onChange}
                            >
                              <option value="">Seçiniz</option>
                              {languageOptions.map((lg) => (
                                <option key={lg} value={lg}>
                                  {displayLabel(lg)}
                                </option>
                              ))}
                            </select>
                            {errors.language && (
                              <span className="text-danger">{errors.language}</span>
                            )}
                          </div>

                          <div className="col-12">
                            <div className={`upload-card ${errors.image ? "has-error" : ""}`}>
                              <div className="upload-left">
                                <div className="upload-icon">
                                  {imagePreview ? (
                                    <img
                                      src={imagePreview}
                                      alt="Kapak önizleme"
                                      className="cover-preview"
                                    />
                                  ) : derssonuraporu.image ? (
                                    <img
                                      src={derssonuraporu.image}
                                      alt="Kapak"
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
                            Her bölüm için ad ve (gerekliyse) yeni PDF dosyası seçin.
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
                                    className={`form-control ${
                                      errors[`variant_title_${i}`] ? "is-invalid" : ""
                                    }`}
                                    placeholder="Bölüm Adı"
                                    value={v.title}
                                    onChange={(e) => handleVariantTitle(i, e.target.value)}
                                  />
                                  {errors[`variant_title_${i}`] && (
                                    <div className="invalid-feedback">
                                      {errors[`variant_title_${i}`]}
                                    </div>
                                  )}

                                  {v.existingUrl && !v.pdfFile && (
                                    <div className="mt-2">
                                      <a
                                        href={v.existingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Mevcut PDF’i görüntüle
                                      </a>
                                    </div>
                                  )}

                                  <input
                                    type="file"
                                    className={`form-control mt-2 ${
                                      errors[`variant_pdf_${i}`] ? "is-invalid" : ""
                                    }`}
                                    accept="application/pdf"
                                    onChange={(e) => handleVariantFile(i, e.target.files?.[0])}
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

                    {/* Sticky savebar */}
                    <div className="sticky-savebar">
                      <div className="container-xxl d-flex justify-content-end py-2">
                        <button
                          className="btn btn-success btn-lg"
                          type="submit"
                          disabled={saving}
                          title="Değişiklikleri kaydet"
                        >
                          <FiSave className="me-2" />
                          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default DersSonuRaporuEdit;
