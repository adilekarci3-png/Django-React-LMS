import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { Link, useParams } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";
import Toast from "../plugin/Toast";

function EskepOgrenciOdevEdit() {
  const api = useAxios();
  const { course_id } = useParams();

  // İstediğin takdirde burayı ogrenci endpointleriyle değiştirebilirsin
  const ENDPOINTS = {
    categories: () => `course/category/`,
    detail: (id) => `teacher/course-detail/${id}/`, // örn: ogrenci/odev-detail/${id}/
    update: (teacherId, id) => `teacher/course-update/${teacherId}/${id}/`, // örn: ogrenci/odev/${id}/ (PATCH)
    variantDelete: (variantId, teacherId, id) =>
      `teacher/course/variant-delete/${variantId}/${teacherId}/${id}/`,
    variantItemDelete: (variantId, itemId, teacherId, id) =>
      `teacher/course/variant-item-delete/${variantId}/${itemId}/${teacherId}/${id}/`,
  };

  const [course, setCourse] = useState({
    category: "", // id
    file: "",
    image: "", // string URL veya { file, preview }
    title: "",
    description: "",
    price: "",
    level: "",
    language: "",
    teacher_course_status: "",
  });

  const [categories, setCategories] = useState([]);
  const [ckData, setCkData] = useState("");
  const [variants, setVariants] = useState([
    { title: "", items: [{ title: "", description: "", file: "", preview: false }] },
  ]);

  const fetchCourseDetail = async () => {
    const [catRes, detailRes] = await Promise.all([
      api.get(ENDPOINTS.categories()),
      api.get(ENDPOINTS.detail(course_id)),
    ]);

    setCategories(catRes.data || []);

    const d = detailRes.data || {};
    setCourse({
      category: d.category?.id ?? d.category ?? "",
      file: "",
      image: d.image || "",
      title: d.title || "",
      description: d.description || "",
      price: d.price || "",
      level: d.level || "",
      language: d.language || "",
      teacher_course_status: d.teacher_course_status || "",
    });

    setVariants(Array.isArray(d.curriculum) ? d.curriculum : []);
    setCkData(d.description || "");
  };

  useEffect(() => {
    fetchCourseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course_id]);

  const handleCourseInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCkData(data);
  };

  const handleCourseImageChange = (e) => {
    const file = e.target.files?.[0];
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

  const handleCourseIntroVideoChange = (e) => {
    const file = e.target.files?.[0];
    setCourse((prev) => ({ ...prev, file: file || "" }));
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
      const items = [...(updated[variantIndex]?.items || [])];
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

  const removeVariant = async (index, variantId) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));

    if (variantId) {
      try {
        await api.delete(
          ENDPOINTS.variantDelete(variantId, UserData()?.teacher_id, course_id)
        );
        Toast().fire({ icon: "success", title: "Bölüm silindi" });
        fetchCourseDetail();
      } catch (e) {
        Toast().fire({ icon: "error", title: "Bölüm silinirken hata oluştu" });
      }
    }
  };

  const addItem = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        items: [
          ...(updated[variantIndex]?.items || []),
          { title: "", description: "", file: "", preview: false },
        ],
      };
      return updated;
    });
  };

  const removeItem = async (variantIndex, itemIndex, variantId, itemId) => {
    setVariants((prev) => {
      const updated = [...prev];
      const items = [...(updated[variantIndex]?.items || [])];
      items.splice(itemIndex, 1);
      updated[variantIndex] = { ...updated[variantIndex], items };
      return updated;
    });

    if (variantId && itemId) {
      try {
        await api.delete(
          ENDPOINTS.variantItemDelete(
            variantId,
            itemId,
            UserData()?.teacher_id,
            course_id
          )
        );
        Toast().fire({ icon: "success", title: "Bölüm içeriği silindi" });
        fetchCourseDetail();
      } catch (e) {
        Toast().fire({
          icon: "error",
          title: "Bölüm içeriği silinirken hata oluştu",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("title", course.title || "");
    formdata.append("description", ckData || "");
    formdata.append("category", course.category || "");
    formdata.append("price", course.price || "");
    formdata.append("level", course.level || "");
    formdata.append("language", course.language || "");
    formdata.append("teacher", parseInt(UserData()?.teacher_id) || "");

    if (course.file) {
      formdata.append("file", course.file);
    }

    // image: string ise eski url, obje ise yeni dosya
    if (course.image && typeof course.image === "object" && course.image.file) {
      formdata.append("image", course.image.file);
    }

    // Variants & items
    variants.forEach((variant, vIdx) => {
      // variant düz alanları
      formdata.append(
        `variants[${vIdx}][variant_title]`,
        String(variant.title || "")
      );
      if (variant.variant_id) {
        formdata.append(
          `variants[${vIdx}][variant_id]`,
          String(variant.variant_id)
        );
      }

      // items
      (variant.items || []).forEach((item, iIdx) => {
        formdata.append(
          `variants[${vIdx}][items][${iIdx}][title]`,
          String(item.title || "")
        );
        formdata.append(
          `variants[${vIdx}][items][${iIdx}][description]`,
          String(item.description || "")
        );
        if (item.file) {
          formdata.append(
            `variants[${vIdx}][items][${iIdx}][file]`,
            item.file
          );
        }
        formdata.append(
          `variants[${vIdx}][items][${iIdx}][preview]`,
          item.preview ? "true" : "false"
        );
        if (item.variant_item_id) {
          formdata.append(
            `variants[${vIdx}][items][${iIdx}][variant_item_id]`,
            String(item.variant_item_id)
          );
        }
      });
    });

    try {
      const res = await api.patch(
        ENDPOINTS.update(UserData()?.teacher_id, course_id),
        formdata
      );
      Swal.fire({
        icon: "success",
        title: "Ödev başarıyla güncellendi",
      });
      // İstersen burada sayfayı yenile veya yönlendir
      // navigate("/student/works/draft") gibi
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Güncelleme başarısız",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Bir hata oluştu.",
      });
    }
  };

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* SOL: Sidebar */}
            <div className="col-lg-3 col-md-4 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ: Form */}
            <form className="col-lg-9 col-md-8 col-12" onSubmit={handleSubmit}>
              <section className="py-4 py-lg-6 bg-primary rounded-3">
                <div className="container">
                  <div className="row">
                    <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                      <div className="d-lg-flex align-items-center justify-content-between">
                        <div className="mb-4 mb-lg-0">
                          <h1 className="text-white mb-1">Ödev Düzenle</h1>
                          <p className="mb-0 text-white lead">
                            Form verilerini doldurun ve ödevinizi güncelleyin.
                          </p>
                        </div>
                        <div>
                          <Link
                            to="/student/courses/"
                            className="btn"
                            style={{ backgroundColor: "white" }}
                          >
                            <i className="fas fa-arrow-left"></i> Ödev Listesine Dön
                          </Link>
                          <button type="submit" className="btn btn-dark ms-2">
                            Kaydet <i className="fas fa-check-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pb-8 mt-5">
                <div className="card mb-3">
                  {/* Temel Bilgiler */}
                  <div className="card-header border-bottom px-4 py-3">
                    <h4 className="mb-0">Temel Bilgiler</h4>
                  </div>

                  <div className="card-body">
                    <label className="form-label">Küçük Resim Önizleme</label>
                    <img
                      style={{
                        width: "100%",
                        height: 330,
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                      className="mb-4"
                      src={
                        (course.image && typeof course.image === "object" && course.image.preview) ||
                        (typeof course.image === "string" ? course.image : "") ||
                        "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                      }
                      alt="Ödev görseli"
                    />

                    <div className="mb-3">
                      <label htmlFor="courseThumbnail" className="form-label">
                        Ödev Küçük Resim
                      </label>
                      <input
                        id="courseThumbnail"
                        className="form-control"
                        type="file"
                        accept="image/*"
                        onChange={handleCourseImageChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="introvideo" className="form-label">
                        Tanıtım Videosu
                      </label>
                      <input
                        id="introvideo"
                        className="form-control"
                        type="file"
                        accept="video/*"
                        onChange={handleCourseIntroVideoChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="courseTitle" className="form-label">
                        Başlık
                      </label>
                      <input
                        id="courseTitle"
                        className="form-control"
                        type="text"
                        name="title"
                        value={course.title}
                        onChange={handleCourseInputChange}
                        placeholder="Ödev başlığı"
                        maxLength={60}
                      />
                      <small>En fazla 60 karakter olacak şekilde ödev başlığınızı yazın</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ödev Kategori</label>
                      <select
                        className="form-select"
                        name="category"
                        value={course.category || ""}
                        onChange={handleCourseInputChange}
                      >
                        <option value="">-------------</option>
                        {categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                      <small>Kategorileri seçerek insanların ödevlerinizi bulmasına yardımcı olun</small>
                    </div>

                    <div className="mb-3">
                      <select
                        className="form-select"
                        name="level"
                        value={course.level || ""}
                        onChange={handleCourseInputChange}
                      >
                        <option value="">Seviye Seçin</option>
                        <option value="Başlangıç">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="İleri Seviye">İleri Seviye</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <select
                        className="form-select"
                        name="language"
                        value={course.language || ""}
                        onChange={handleCourseInputChange}
                      >
                        <option value="">Dil Seçin</option>
                        <option value="Türkçe">Türkçe</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Arapça">Arapça</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ödev Açıklaması</label>
                      <CKEditor editor={ClassicEditor} data={ckData} onChange={handleCkEditorChange} />
                      <small>Ödevinizin kısa bir özeti.</small>
                    </div>
                  </div>

                  {/* Bölümler */}
                  <div className="card-header border-bottom px-4 py-3">
                    <h4 className="mb-0">Bölümler</h4>
                  </div>

                  <div className="card-body">
                    {variants?.map((variant, variantIndex) => (
                      <div
                        key={variant.variant_id ?? `v-${variantIndex}`}
                        className="border p-2 rounded-3 mb-3"
                        style={{ backgroundColor: "#ededed" }}
                      >
                        <div className="d-flex mb-4">
                          <input
                            type="text"
                            placeholder="Bölüm Adı"
                            required
                            value={variant.title || ""}
                            className="form-control"
                            onChange={(e) =>
                              handleVariantChange(variantIndex, "title", e.target.value)
                            }
                          />
                          <button
                            className="btn btn-danger ms-2"
                            type="button"
                            onClick={() => removeVariant(variantIndex, variant.variant_id || variant.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        {(variant.items || []).map((item, itemIndex) => {
                          const checkboxId = `preview-${variantIndex}-${itemIndex}`;
                          return (
                            <div
                              key={item.variant_item_id ?? `vi-${variantIndex}-${itemIndex}`}
                              className="mb-2 mt-2 shadow p-2 rounded-3"
                              style={{ border: "1px #bdbdbd solid" }}
                            >
                              <input
                                type="text"
                                placeholder="Bölüm Başlığı"
                                className="form-control me-1 mt-2"
                                value={item.title || ""}
                                onChange={(e) =>
                                  handleItemChange(variantIndex, itemIndex, "title", e.target.value)
                                }
                              />

                              <textarea
                                value={item.description || ""}
                                className="form-control mt-2"
                                placeholder="Bölüm Tanımı"
                                rows={4}
                                onChange={(e) =>
                                  handleItemChange(variantIndex, itemIndex, "description", e.target.value)
                                }
                              />

                              <div className="row d-flex align-items-center">
                                <div className="col-lg-8">
                                  <input
                                    type="file"
                                    className="form-control me-1 mt-2"
                                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,video/*"
                                    onChange={(e) =>
                                      handleItemChange(
                                        variantIndex,
                                        itemIndex,
                                        "file",
                                        e.target.files?.[0] || ""
                                      )
                                    }
                                  />
                                </div>
                                <div className="col-lg-4 d-flex align-items-center mt-2">
                                  <input
                                    id={checkboxId}
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={!!item.preview}
                                    onChange={(e) =>
                                      handleItemChange(variantIndex, itemIndex, "preview", e.target.checked)
                                    }
                                  />
                                  <label htmlFor={checkboxId} className="form-label mb-0">
                                    Önizleme
                                  </label>
                                </div>
                              </div>

                              <button
                                className="btn btn-sm btn-outline-danger me-2 mt-2"
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    variantIndex,
                                    itemIndex,
                                    variant.variant_id || variant.id,
                                    item.variant_item_id || item.id
                                  )
                                }
                              >
                                Bölüm Sil <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          );
                        })}

                        <button
                          className="btn btn-sm btn-primary mt-2"
                          type="button"
                          onClick={() => addItem(variantIndex)}
                        >
                          + Bölüm Ekle
                        </button>
                      </div>
                    ))}

                    <button
                      className="btn btn-sm btn-secondary w-100 mt-2"
                      type="button"
                      onClick={addVariant}
                    >
                      + Yeni Bölüm
                    </button>
                  </div>
                </div>

                <button className="btn btn-lg btn-success w-100 mt-2" type="submit">
                  Ödevi Güncelle <i className="fas fa-check-circle"></i>
                </button>
              </section>
            </form>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />
    </>
  );
}

export default EskepOgrenciOdevEdit;
