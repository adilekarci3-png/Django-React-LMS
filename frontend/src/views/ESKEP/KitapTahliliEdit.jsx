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

function KitapTahliliEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const user = UserData();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState([]);
  const [errors, setErrors] = useState({});

  // Form
  const [kitaptahlili, setKitapTahlili] = useState({
    id: null,
    category: "",
    image: "",     // mevcut URL
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
  const [variants, setVariants] = useState([{ id: undefined, title: "", pdfFile: null, existingUrl: "" }]);
  // Silinecek mevcut variant id’leri
  const [variantsToDelete, setVariantsToDelete] = useState([]);

  useEffect(() => {
    const load = async () => {
      debugger;
      console.log(user);
      setLoading(true);
      try {
        const [catRes, kitaptahliliRes] = await Promise.all([
          api.get("course/category/"),
          api.get(`eskepstajer/kitaptahlili-detail/${user?.user_id}/${id}/`)
        ]);
        console.log(catRes);
        console.log(kitaptahliliRes);
        setCategory(catRes.data || []);

        const d = kitaptahliliRes.data || {};
        setKitapTahlili({
          id: d.id,
          category: d.category.id ?? "",
          image: d.image ?? "",
          title: d.title ?? "",
          description: d.description ?? "",
          level: d.level ?? "",
          language: d.language ?? "",
          inserteduser: parseInt(user?.user_id),
          kitaptahlili_status: d.kitaptahlili_status ?? "",
        });

        // curriculum → variant_items → file
        // Beklenen şekli: file = { id?, title?, url?, filename? } veya düz string URL
        const v = (d.curriculum || []).map((c) => {
          const firstItem = (c.variant_items || [])[0];
          const fileVal = firstItem?.file;
          const url = typeof fileVal === "string" ? fileVal : (fileVal?.url ?? "");
          return {
            id: c.id,                               // DOĞRU: curriculum (VariantKitapTahlili) id
            title: c.title || firstItem?.title || "",
            pdfFile: null,
            existingUrl: url,
          };
        });

        setVariants(v.length ? v : [{ id: undefined, title: "", pdfFile: null, existingUrl: "" }]);
        setVariantsToDelete([]);

      } catch (e) {
        Swal.fire({ icon: "error", title: "Kitap Tahlili yüklenemedi", text: e?.response?.data?.detail || "" });
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
      setErrors((er) => ({ ...er, [`variant_pdf_${idx}`]: "Yalnızca PDF dosyaları kabul edilir." }));
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
    if (!kitaptahlili.title) er.title = "Kitap Tahlili başlığı zorunludur.";
    if (!kitaptahlili.description) er.description = "Kitap Tahlili açıklaması zorunludur.";
    if (!kitaptahlili.category) er.category = "Kategori seçiniz.";

    variants.forEach((v, i) => {
      if (!v.title) er[`variant_title_${i}`] = "Bölüm adı zorunludur.";
      // Not: mevcut PDF’i korumaya izin veriyoruz → yeni seçim zorunlu değil
      if (!v.pdfFile && !v.existingUrl) er[`variant_pdf_${i}`] = "PDF gereklidir (yeni yükleyin veya mevcut kalsın).";
    });

    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    debugger;
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      debugger;
      const fd = new FormData();
      fd.append("title", kitaptahlili.title);
      fd.append("inserteduser", parseInt(user?.user_id)); // backend böyle istiyordu
      fd.append("kitaptahlili_status", kitaptahlili.kitaptahlili_status || "");
      fd.append("description", kitaptahlili.description || "");
      fd.append("category", kitaptahlili.category || "");
      fd.append("level", kitaptahlili.level || "");
      fd.append("language", kitaptahlili.language || "");

      // Kapak resmi değiştiyse gönder
      if (imageFile) fd.append("image", imageFile);

      // Variant’lar: id varsa gönderiyoruz; pdfFile varsa yeni dosyayı gönderiyoruz.
      variants.forEach((v, i) => {
        if (v.id) fd.append(`variants[${i}][id]`, v.id);               // mevcutsa id
        fd.append(`variants[${i}][title]`, v.title);                   // başlık zorunlu
        if (v.pdfFile) fd.append(`variants[${i}][pdf]`, v.pdfFile);    // yalnızca değiştiyse dosya ekle
        // mevcut PDF korunacaksa dosya eklemiyoruz; backend mevcutu tutmalı
      });

      // Silinecekler
      if (variantsToDelete.length) {
        variantsToDelete.forEach((vid) => fd.append("variants_to_delete[]", vid));
      }

      await api.put(`eskepstajer/kitaptahlili-edit/${id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({ icon: "success", title: "Kitap Tahlili güncellendi" });
      navigate("/eskepstajer/kitaptahlileris");
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
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <form className="col-lg-9 col-md-8 col-12" onSubmit={handleSubmit}>
              <div className="d-flex align-items-center justify-content-between">
                <h2 className="mb-4">✏️ Kitap Tahlili Düzenle</h2>
                <Link to="/stajer/kitaptahlillerim" className="btn btn-light">← Listeye Dön</Link>
              </div>

              {loading ? (
                <p>Yükleniyor…</p>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">Kitap Tahlili Başlığı</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={kitaptahlili.title}
                      onChange={onChange}
                    />
                    {errors.title && <span className="text-danger">{errors.title}</span>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Kitap Tahlili Durumu</label>
                    <select
                      className="form-select"
                      name="kitaptahlili_status"
                      value={kitaptahlili.kitaptahlili_status}
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

                  <div className="mb-3">
                    <label className="form-label">Kitap Tahlili Açıklaması</label>
                    <MdEditor
                      value={kitaptahlili.description}
                      style={{ height: "200px" }}
                      renderHTML={(text) => mdParser.render(text)}
                      onChange={handleEditorChange}
                    />
                    {errors.description && <span className="text-danger">{errors.description}</span>}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Kapak Resmi</label>
                      <input type="file" className="form-control" onChange={onImageChange} />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Kitap Tahlili kapağı"
                            style={{ maxWidth: 240, borderRadius: 8 }}
                          />
                        </div>
                      )}
                      {errors.image && <span className="text-danger">{errors.image}</span>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Kategori</label>
                      <select
                        className="form-select"
                        name="category"
                        value={kitaptahlili.category}
                        onChange={onChange}
                      >
                        <option value="">-------------</option>
                        {category.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                      {errors.category && <span className="text-danger">{errors.category}</span>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Dil</label>
                      <select
                        className="form-select"
                        name="language"
                        value={kitaptahlili.language || ""}
                        onChange={onChange}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Turkce">Türkçe</option>
                        <option value="Ingilizce">İngilizce</option>
                        <option value="Arapca">Arapça</option>
                      </select>
                      {errors.language && <span className="text-danger">{errors.language}</span>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Seviye</label>
                      <select
                        className="form-select"
                        name="level"
                        value={kitaptahlili.level || ""}
                        onChange={onChange}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Baslangic">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="Ileri Seviye">İleri Seviye</option>
                      </select>
                      {errors.level && <span className="text-danger">{errors.level}</span>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4>Bölümler</h4>
                    {variants.map((v, idx) => (
                      <div key={idx} className="border p-2 rounded-3 mb-3 bg-light">
                        <div className="mb-2">
                          <input
                            type="text"
                            placeholder="Bölüm Adı"
                            className="form-control"
                            value={v.title}
                            onChange={(e) => handleVariantTitle(idx, e.target.value)}
                          />
                          {errors[`variant_title_${idx}`] && (
                            <span className="text-danger">{errors[`variant_title_${idx}`]}</span>
                          )}
                        </div>

                        {v.existingUrl && !v.pdfFile && (
                          <div className="mb-2">
                            <a href={v.existingUrl} target="_blank" rel="noopener noreferrer">
                              Mevcut PDF’i görüntüle
                            </a>
                          </div>
                        )}

                        <input
                          type="file"
                          className="form-control"
                          accept="application/pdf"
                          onChange={(e) => handleVariantFile(idx, e.target.files?.[0])}
                        />
                        {errors[`variant_pdf_${idx}`] && (
                          <span className="text-danger">{errors[`variant_pdf_${idx}`]}</span>
                        )}

                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => removeVariant(idx)}
                          >
                            Bölümü Kaldır
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className="btn btn-secondary w-100" type="button" onClick={addVariant}>
                      + Yeni Bölüm
                    </button>
                  </div>

                  <button className="btn btn-success w-100" type="submit" disabled={saving} aria-busy={saving}>
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
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
