// KitapTahliliEdit.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";

// Markdown
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

const MAX_IMAGE_MB = 5;

function KitapTahliliEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const user = UserData();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState([]);
  const [errors, setErrors] = useState({});

  // Django CHOICES ile birebir (KEY -> Label)
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

  // Backend label dönerse normalize et -> KEY'e çevir
  const normLang = (v) => {
    const s = String(v || "").toLowerCase();
    if (s === "turkce" || s === "türkçe") return "Turkce";
    if (s === "ingilizce") return "Ingilizce";
    if (s === "arapca" || s === "arapça") return "Arapca";
    return s || "";
  };
  const normLevel = (v) => {
    const s = String(v || "").toLowerCase();
    if (s === "baslangic" || s === "başlangıç") return "Baslangic";
    if (s === "orta") return "Orta";
    if (s === "ileri seviye" || s === "ileri" || s === "ileri-seviye") return "Ileri Seviye";
    return s || "";
  };

  // Form
  const [kitaptahlili, setKitapTahlili] = useState({
    id: null,
    category: "",
    image: "", // mevcut URL
    title: "",
    description: "",
    level: "",
    language: "",
    inserteduser: null,
    kitaptahlili_status: "",
  });

  // Yeni seçilen kapak resmi
  const [imageFile, setImageFile] = useState(null);
  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : kitaptahlili.image || ""),
    [imageFile, kitaptahlili.image]
  );

  // Variant’lar: {id?, title, pdfFile?, existingUrl?}
  const [variants, setVariants] = useState([
    { id: undefined, title: "", pdfFile: null, existingUrl: "" },
  ]);
  // Silinecek mevcut variant id’leri
  const [variantsToDelete, setVariantsToDelete] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, ktRes] = await Promise.all([
          api.get("course/category/"),
          api.get(`eskepstajer/kitaptahlili-detail/${user?.user_id}/${id}/`),
        ]);
        setCategory(catRes.data || []);

        const d = ktRes.data || {};
        setKitapTahlili({
          id: d.id,
          category: d?.category?.id ?? "",
          image: d.image ?? "",
          title: d.title ?? "",
          description: d.description ?? "",
          level: normLevel(d.level ?? ""),
          language: normLang(d.language ?? ""),
          inserteduser: parseInt(user?.user_id),
          kitaptahlili_status: d.kitaptahlili_status ?? "",
        });

        // curriculum → variant_items → file
        const v = (d.curriculum || []).map((c) => {
          const firstItem = (c.variant_items || [])[0];
          const fileVal = firstItem?.file;
          const url = typeof fileVal === "string" ? fileVal : fileVal?.url ?? "";
          return {
            id: c.id, // curriculum (VariantKitapTahlili) id
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
          title: "Kitap Tahlili yüklenemedi",
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
    setKitapTahlili((s) => ({ ...s, [name]: value }));
  };

  const handleEditorChange = ({ text }) => {
    setKitapTahlili((s) => ({ ...s, description: text }));
  };

  const onImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type)) {
      setErrors((er) => ({ ...er, image: "Yalnızca JPEG/PNG/WEBP kabul edilir." }));
      return;
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: `En fazla ${MAX_IMAGE_MB}MB yükleyin.` }));
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
    setVariants((arr) => [
      ...arr,
      { id: undefined, title: "", pdfFile: null, existingUrl: "" },
    ]);
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
    if (!kitaptahlili.title?.trim()) er.title = "Kitap Tahlili başlığı zorunludur.";
    if (!kitaptahlili.description?.trim()) er.description = "Kitap Tahlili açıklaması zorunludur.";
    if (!kitaptahlili.category) er.category = "Kategori seçiniz.";
    if (!kitaptahlili.language) er.language = "Dil seçiniz.";
    if (!kitaptahlili.level) er.level = "Seviye seçiniz.";

    variants.forEach((v, i) => {
      if (!v.title?.trim()) er[`variant_title_${i}`] = "Bölüm adı zorunludur.";
      // Mevcut PDF korunabilir → yeni seçim zorunlu değil
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
      fd.append("title", kitaptahlili.title);
      if (user?.user_id) fd.append("inserteduser", parseInt(user.user_id)); // backend isteği
      fd.append("kitaptahlili_status", kitaptahlili.kitaptahlili_status || "");
      fd.append("description", kitaptahlili.description || "");
      fd.append("category", kitaptahlili.category || "");
      // Backend KEY'leri ile gönder
      fd.append("level", kitaptahlili.level || "");
      fd.append("language", kitaptahlili.language || "");

      // Kapak resmi değiştiyse gönder
      if (imageFile) fd.append("image", imageFile);

      // Variant’lar
      variants.forEach((v, i) => {
        if (v.id) fd.append(`variants[${i}][id]`, v.id); // mevcutsa id
        fd.append(`variants[${i}][title]`, v.title);
        if (v.pdfFile) fd.append(`variants[${i}][pdf]`, v.pdfFile); // sadece değiştiyse dosya ekle
      });

      // Silinecekler
      if (variantsToDelete.length) {
        variantsToDelete.forEach((vid) => fd.append("variants_to_delete[]", vid));
      }

      await api.put(`eskepstajer/kitaptahlili-edit/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({ icon: "success", title: "Kitap Tahlili güncellendi" });
      navigate("/eskepstajer/kitaptahlileris"); // rotayı projenize göre güncelleyin
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
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <form className="col-lg-9 col-md-9 col-12" onSubmit={handleSubmit}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h2 className="mb-0">✏️ Kitap Tahlili Düzenle</h2>
                <Link to="/stajer/kitaptahlillerim" className="btn btn-light">
                  ← Listeye Dön
                </Link>
              </div>

              {loading ? (
                <div className="card">
                  <div className="card-body">
                    <p className="mb-0">Yükleniyor…</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Genel Bilgiler */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="mb-0">Genel Bilgiler</h5>
                      <small className="text-muted">Başlık, durum ve açıklamayı güncelleyin.</small>
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
                            onChange={onChange}
                            placeholder="Örn. Bir Bilim İnsanının Romanı Tahlili"
                          />
                          {errors.title && (
                            <div className="invalid-feedback">{errors.title}</div>
                          )}
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Durum</label>
                          <select
                            className="form-select"
                            name="kitaptahlili_status"
                            value={kitaptahlili.kitaptahlili_status}
                            onChange={onChange}
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
                            style={{ height: 240 }}
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
                        Kategori, seviye, dil ve kapak resmini düzenleyin.
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
                            className={`form-select ${errors.level ? "is-invalid" : ""}`}
                            name="level"
                            value={kitaptahlili.level || ""}
                            onChange={onChange}
                          >
                            <option value="">Seçiniz</option>
                            {LEVEL_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          {errors.level && (
                            <div className="invalid-feedback">{errors.level}</div>
                          )}
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Dil</label>
                          <select
                            className={`form-select ${errors.language ? "is-invalid" : ""}`}
                            name="language"
                            value={kitaptahlili.language || ""}
                            onChange={onChange}
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
                          <label className="form-label">Kapak Resmi</label>
                          <input
                            type="file"
                            className={`form-control ${errors.image ? "is-invalid" : ""}`}
                            accept="image/png,image/jpeg,image/webp"
                            onChange={onImageChange}
                          />
                          {imagePreview && (
                            <div className="mt-2">
                              <img
                                src={imagePreview}
                                alt="Kitap Tahlili kapağı"
                                style={{ maxWidth: 260, borderRadius: 8 }}
                              />
                            </div>
                          )}
                          {errors.image && (
                            <div className="invalid-feedback d-block">{errors.image}</div>
                          )}
                          <div className="form-text">
                            JPEG/PNG/WEBP; en fazla {MAX_IMAGE_MB}MB. Önerilen: 1200×630 px
                          </div>
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
                          Bölüm başlığını güncelleyin; yeni PDF yüklerseniz mevcut dosyanın yerini alır.
                        </small>
                      </div>
                      <button className="btn btn-secondary" type="button" onClick={addVariant}>
                        + Yeni Bölüm
                      </button>
                    </div>

                    <div className="card-body">
                      <div className="row g-3">
                        {variants.map((v, idx) => (
                          <div key={idx} className="col-12">
                            <div className="border p-3 rounded-3 bg-light">
                              <div className="mb-2">
                                <label className="form-label">Bölüm Adı</label>
                                <input
                                  type="text"
                                  className={`form-control ${errors[`variant_title_${idx}`] ? "is-invalid" : ""}`}
                                  placeholder="Bölüm Adı"
                                  value={v.title}
                                  onChange={(e) => handleVariantTitle(idx, e.target.value)}
                                />
                                {errors[`variant_title_${idx}`] && (
                                  <div className="invalid-feedback">
                                    {errors[`variant_title_${idx}`]}
                                  </div>
                                )}
                              </div>

                              {v.existingUrl && !v.pdfFile && (
                                <div className="mb-2">
                                  <a href={v.existingUrl} target="_blank" rel="noopener noreferrer">
                                    Mevcut PDF’i görüntüle
                                  </a>
                                </div>
                              )}

                              <label className="form-label">PDF (isteğe bağlı yeni yükleme)</label>
                              <input
                                type="file"
                                className={`form-control ${errors[`variant_pdf_${idx}`] ? "is-invalid" : ""}`}
                                accept="application/pdf"
                                onChange={(e) => handleVariantFile(idx, e.target.files?.[0])}
                              />
                              {errors[`variant_pdf_${idx}`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`variant_pdf_${idx}`]}
                                </div>
                              )}

                              <div className="d-flex gap-2 mt-3">
                                <button
                                  className="btn btn-outline-danger"
                                  type="button"
                                  onClick={() => removeVariant(idx)}
                                >
                                  Bölümü Kaldır
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Kaydet */}
                  <div className="d-grid">
                    <button
                      className="btn btn-success btn-lg"
                      type="submit"
                      disabled={saving}
                      aria-busy={saving}
                    >
                      {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default KitapTahliliEdit;
