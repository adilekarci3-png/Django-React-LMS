import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Swal from "sweetalert2";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

// ⬇️ Markdown editor & parser
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

function AkademiCourseCreate() {
  const [course, setCourse] = useState({
    category: 0,
    file: "",
    image: "",
    title: "",
    description: "",
    price: "",
    level: "",
    language: "",
    teacher_course_status: "",
  });

  const [category, setCategory] = useState([]);

  // Markdown state: mdValue = markdown, htmlValue = HTML (formda kullanacağız)
  const mdParser = useMemo(() => new MarkdownIt({ linkify: true, breaks: true }), []);
  const [mdValue, setMdValue] = useState("");
  const [htmlValue, setHtmlValue] = useState("");

  const [variants, setVariants] = useState([
    {
      title: "",
      items: [{ title: "", description: "", file: "", preview: false }],
    },
  ]);

  const api = useAxios(); // stable
  const user = useUserData();

  // --- Fetch categories once (no infinite loop) ---
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await api.get("course/category/", {
          signal: controller.signal,
        });
        setCategory(data);
      } catch (e) {
        if (e?.name !== "CanceledError") console.error(e);
      }
    })();
    return () => controller.abort();
  }, []); // <- empty deps; api is stable anyway

  const handleCourseInputChange = (event) => {
    const { name, type, value, checked } = event.target;
    setCourse((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "category" ? Number(value || 0) : value,
    }));
  };

  const handleCourseImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCourse((prev) => ({
        ...prev,
        image: { file, preview: reader.result },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCourseIntroVideoChange = (event) => {
    const file = event.target.files?.[0] || "";
    setCourse((prev) => ({ ...prev, file }));
  };

  const handleVariantChange = (index, propertyName, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [propertyName]: value };
      return updated;
    });
  };

  const handleItemChange = (variantIndex, itemIndex, propertyName, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      const items = [...updated[variantIndex].items];
      items[itemIndex] = { ...items[itemIndex], [propertyName]: value };
      updated[variantIndex] = { ...updated[variantIndex], items };
      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { title: "", items: [{ title: "", description: "", file: "", preview: false }] },
    ]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        items: [
          ...updated[variantIndex].items,
          { title: "", description: "", file: "", preview: false },
        ],
      };
      return updated;
    });
  };

  const removeItem = (variantIndex, itemIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        items: updated[variantIndex].items.filter((_, i) => i !== itemIndex),
      };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("title", course.title);
    if (course.image && course.image.file) {
      formdata.append("image", course.image.file);
    }
    // HTML olarak gönderiyoruz
    formdata.append("description", htmlValue);
    formdata.append("category", String(course.category || 0));
    formdata.append("price", String(course.price || ""));
    formdata.append("level", course.level || "");
    formdata.append("language", course.language || "");

    if (user?.teacher_id) {
      formdata.append("teacher", Number(user.teacher_id));
    }

    if (course.file) {
      formdata.append("file", course.file);
    }

    // (Opsiyonel) Ham markdown'ı da göndermek istersen yorumdan çıkar:
    // formdata.append("description_markdown", mdValue);

    // Variants & Items
    variants.forEach((variant, variantIndex) => {
      formdata.append(`variants[${variantIndex}][variant_title]`, variant.title ?? "");

      variant.items.forEach((item, itemIndex) => {
        const base = `variants[${variantIndex}][items][${itemIndex}]`;
        formdata.append(`${base}[title]`, item.title ?? "");
        formdata.append(`${base}[description]`, item.description ?? "");
        formdata.append(`${base}[preview]`, String(!!item.preview));
        if (item.file instanceof File) {
          formdata.append(`${base}[file]`, item.file);
        }
      });
    });

    await api.post(`teacher/course-create/`, formdata);

    Swal.fire({ icon: "success", title: "Kurs Başarılı Bir Şekilde Oluşturuldu" });
  };

  const imagePreview = typeof course.image === "string" ? "" : course.image.preview;

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Üst header */}
          <Header />

          {/* Grid: Sidebar + Form yanyana (md+) */}
          <div className="row g-4 mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <form onSubmit={handleSubmit}>
                <section className="py-4 py-lg-6 bg-primary rounded-3">
                  <div className="container">
                    <div className="row">
                      <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                          {/* Sol kısım: Başlık + açıklama */}
                          <div>
                            <h1 className="text-white fw-bold mb-1">
                              <i className="fas fa-plus-circle me-2"></i> Yeni Kurs Ekleyin
                            </h1>
                            <p className="mb-0 text-white-50">
                              Alanları doldurun ve kursunuzu oluşturun
                            </p>
                          </div>

                          {/* Sağ kısım: buton */}
                          <div>
                            <Link
                              to="/instructor/courses/"
                              className="btn btn-outline-light d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
                            >
                              <i className="fas fa-arrow-left"></i>
                              <span>Kursa Dön</span>
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </section>

                <section className="pb-8 mt-5">
                  <div className="card mb-3">
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Temel Bilgiler</h4>
                    </div>
                    <div className="card-body">
                      {/* ÜST SATIR: Sol (küçük resim) + Sağ (form alanları) */}
                      <div className="row g-4">
                        {/* SOL: Küçük resim ve yükleme */}
                        <div className="col-12 col-md-5 col-lg-4">
                          <label htmlFor="courseThumbnail" className="form-label fw-semibold">Küçük Resim</label>

                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              {/* 16:9 oranlı önizleme kutusu */}
                              <div className="ratio ratio-16x9 rounded position-relative" style={{ backgroundColor: "#f8f9fa" }}>
                                <img
                                  src={imagePreview || "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"}
                                  alt="course cover preview"
                                  className="w-100 h-100 rounded"
                                  style={{ objectFit: "cover" }}
                                />
                                {/* Overlay aksiyonlar */}
                                <div
                                  className="position-absolute bottom-0 start-0 end-0 p-2 d-flex gap-2 justify-content-end"
                                  style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 100%)" }}
                                >
                                  <label htmlFor="courseThumbnail" className="btn btn-sm btn-light">
                                    <i className="fas fa-upload me-1" /> Değiştir
                                  </label>
                                  {imagePreview && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={() => {
                                        // resmi sıfırla
                                        setCourse((s) => ({ ...s, image: "" }));
                                      }}
                                    >
                                      <i className="fas fa-times me-1" /> Kaldır
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Dosya girişi (gizli) */}
                              <input
                                id="courseThumbnail"
                                className="form-control d-none"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleCourseImageChange}
                              />

                              {/* Yardım metni */}
                              <small className="text-muted d-block mt-2">
                                Önerilen oran <strong>16:9</strong>, en az <strong>1280×720</strong>. PNG/JPG (maks. 3 MB).
                              </small>
                            </div>
                          </div>

                          {/* Tanıtım videosu */}
                          <div className="mt-3">
                            <label htmlFor="introvideo" className="form-label fw-semibold">Tanıtım Videosu</label>
                            <input
                              id="introvideo"
                              className="form-control"
                              type="file"
                              name="file"
                              accept="video/*"
                              onChange={handleCourseIntroVideoChange}
                            />
                            <small className="text-muted">MP4 önerilir. Maks. 100 MB.</small>
                          </div>
                        </div>

                        {/* SAĞ: Form alanları */}
                        <div className="col-12 col-md-7 col-lg-8">
                          {/* Başlık + karakter sayacı */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <label htmlFor="courseTitle" className="form-label fw-semibold mb-0">Başlık</label>
                              <small className="text-muted">{(course.title || "").length}/60</small>
                            </div>
                            <input
                              id="courseTitle"
                              className="form-control"
                              type="text"
                              name="title"
                              maxLength={60}
                              placeholder="Örn. Modern React ile Proje Geliştirme"
                              value={course.title}
                              onChange={handleCourseInputChange}
                            />
                            <small className="text-muted">En fazla 60 karakter olacak şekilde kurs başlığınızı yazın.</small>
                          </div>

                          {/* Kategori – Seviye – Dil (aynı satırda) */}
                          <div className="row g-3">
                            <div className="col-12 col-lg-6">
                              <label className="form-label fw-semibold">Kurs Kategorisi</label>
                              <select
                                className="form-select"
                                name="category"
                                value={course.category || 0}
                                onChange={handleCourseInputChange}
                              >
                                <option value={0}>-------------</option>
                                {category?.map((c) => (
                                  <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                              </select>
                              <small className="text-muted">Kategoriler, kursunuzun bulunabilirliğini artırır.</small>
                            </div>

                            <div className="col-6 col-lg-3">
                              <label className="form-label fw-semibold">Seviye</label>
                              <select
                                className="form-select"
                                name="level"
                                value={course.level}
                                onChange={handleCourseInputChange}
                              >
                                <option value="">Seçin</option>
                                <option value="Baslangic">Başlangıç</option>
                                <option value="Orta">Orta</option>
                                <option value="Ileri Seviye">İleri</option>
                              </select>
                            </div>

                            <div className="col-6 col-lg-3">
                              <label className="form-label fw-semibold">Dil</label>
                              <select
                                className="form-select"
                                name="language"
                                value={course.language}
                                onChange={handleCourseInputChange}
                              >
                                <option value="">Seçin</option>
                                <option value="Turkce">Türkçe</option>
                                <option value="Ingilizce">İngilizce</option>
                                <option value="Arapca">Arapça</option>
                              </select>
                            </div>
                          </div>

                          {/* Açıklama (Markdown Editor) */}
                          <div className="mt-3">
                            <label className="form-label fw-semibold">Kurs Açıklaması</label>
                            <div className="border rounded">
                              <MdEditor
                                value={mdValue}
                                style={{ height: 320 }}
                                renderHTML={(text) => mdParser.render(text)}
                                onChange={({ text }) => {
                                  setMdValue(text);                 // markdown
                                  setHtmlValue(mdParser.render(text)); // HTML
                                }}
                                config={{
                                  view: { menu: true, md: true, html: true },
                                  canView: { fullScreen: true, hideMenu: true },
                                }}
                              />
                            </div>
                            <small className="text-muted">
                              Markdown destekli: **kalın**, *italik*, listeler, kod blokları, tablolar vb.
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Dersler</h4>
                    </div>

                    <div className="card-body ">
                      {variants.map((variant, variantIndex) => (
                        <div key={`variant-${variantIndex}`} className="border p-2 rounded-3 mb-3" style={{ backgroundColor: "#ededed" }}>
                          <div className="d-flex mb-4">
                            <input
                              type="text"
                              placeholder="Bölüm Adı"
                              required
                              className="form-control"
                              value={variant.title}
                              onChange={(e) => handleVariantChange(variantIndex, "title", e.target.value)}
                            />
                            <button className="btn btn-danger ms-2" type="button" onClick={() => removeVariant(variantIndex)}>
                              <i className="fas fa-trash" />
                            </button>
                          </div>

                          {variant.items.map((item, itemIndex) => (
                            <div key={`variant-${variantIndex}-item-${itemIndex}`} className="mb-2 mt-2 shadow p-2 rounded-3" style={{ border: "1px #bdbdbd solid" }}>
                              <input
                                type="text"
                                placeholder="Ders Başlığı"
                                className="form-control me-1 mt-2"
                                name="title"
                                value={item.title}
                                onChange={(e) => handleItemChange(variantIndex, itemIndex, "title", e.target.value)}
                              />
                              <textarea
                                name="description"
                                cols={30}
                                className="form-control mt-2"
                                placeholder="Ders Tanımı"
                                rows={4}
                                value={item.description}
                                onChange={(e) => handleItemChange(variantIndex, itemIndex, "description", e.target.value)}
                              />
                              <div className="row d-flex align-items-center">
                                <div className="col-lg-8">
                                  <input
                                    type="file"
                                    className="form-control me-1 mt-2"
                                    name="file"
                                    onChange={(e) => handleItemChange(variantIndex, itemIndex, "file", e.target.files?.[0] || "")}
                                  />
                                </div>
                                <div className="col-lg-4 d-flex align-items-center mt-2">
                                  <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    id={`preview-${variantIndex}-${itemIndex}`}
                                    checked={!!item.preview}
                                    onChange={(e) => handleItemChange(variantIndex, itemIndex, "preview", e.target.checked)}
                                  />
                                  <label htmlFor={`preview-${variantIndex}-${itemIndex}`} className="form-check-label">Önizleme</label>
                                </div>
                              </div>
                              <button className="btn btn-sm btn-outline-danger me-2 mt-2" type="button" onClick={() => removeItem(variantIndex, itemIndex)}>
                                Dersi Sil <i className="fas fa-trash" />
                              </button>
                            </div>
                          ))}

                          <button className="btn btn-sm btn-primary mt-2" type="button" onClick={() => addItem(variantIndex)}>
                            + Ders Ekleyin
                          </button>
                        </div>
                      ))}

                      <button className="btn btn-sm btn-secondary w-100 mt-2" type="button" onClick={addVariant}>
                        + Yeni Bölüm
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-lg btn-success w-100 mt-2" type="submit">
                    Kurs Oluştur <i className="fas fa-check-circle" />
                  </button>
                </section>
              </form>
            </div>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </>
  );
}

export default AkademiCourseCreate;
