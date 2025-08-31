import { useState, useEffect } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";

import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";

// ✅ Markdown Editor (opsiyonel açıklama için)
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

function DokumanCreate() {
  const user = UserData();

  const [dokuman, setDokuman] = useState({
    title: "",
    description: "",
    language: "",
    category: "",
    coverImage: "", // { file, preview }
    mainFile: "",   // File (pdf/doc/docx)
    inserteduser: parseInt(user?.user_id),
    status: "Taslak",
  });

  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([{ title: "", file: "" }]); // Bölümler
  const [errors, setErrors] = useState({});

  useEffect(() => {
    useAxios()
      .get(`course/category/`)
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleInputChange = (e) => {
    setDokuman((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditorChange = ({ text }) => {
    setDokuman((prev) => ({ ...prev, description: text }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors((p) => ({ ...p, coverImage: "Yalnızca JPG/PNG kabul edilir." }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDokuman((prev) => ({
        ...prev,
        coverImage: { file, preview: reader.result },
      }));
      setErrors((p) => ({ ...p, coverImage: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleMainFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const okTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!okTypes.includes(file.type)) {
      setErrors((p) => ({
        ...p,
        mainFile: "PDF/DOC/DOCX formatında bir dosya seçiniz.",
      }));
      return;
    }
    setDokuman((prev) => ({ ...prev, mainFile: file }));
    setErrors((p) => ({ ...p, mainFile: "" }));
  };

  // Bölüm işlemleri
  const handleSectionTitle = (idx, value) => {
    setSections((prev) => {
      const next = [...prev];
      next[idx].title = value;
      return next;
    });
  };

  const handleSectionFile = (idx, file) => {
    if (file && file.type !== "application/pdf") {
      setErrors((p) => ({ ...p, [`section_file_${idx}`]: "Yalnızca PDF kabul edilir." }));
      return;
    }
    setSections((prev) => {
      const next = [...prev];
      next[idx].file = file ?? "";
      return next;
    });
    setErrors((p) => ({ ...p, [`section_file_${idx}`]: "" }));
  };

  const addSection = () => setSections((prev) => [...prev, { title: "", file: "" }]);

  const removeSection = (idx) =>
    setSections((prev) => prev.filter((_, i) => i !== idx));

  const validateForm = () => {
    const v = {};
    if (!dokuman.title) v.title = "Başlık zorunludur.";
    if (!dokuman.category) v.category = "Kategori seçiniz.";
    if (!dokuman.language) v.language = "Dil seçiniz.";
    if (!dokuman.coverImage?.file) v.coverImage = "Kapak resmi yükleyiniz.";
    if (!dokuman.mainFile) v.mainFile = "Ana dokümanı (PDF/DOC/DOCX) yükleyiniz.";

    sections.forEach((s, i) => {
      if (!s.title) v[`section_title_${i}`] = "Bölüm adı zorunludur.";
      if (!s.file) v[`section_file_${i}`] = "Bölüm PDF dosyası ekleyiniz.";
    });

    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formdata = new FormData();
    formdata.append("title", dokuman.title);
    formdata.append("description", dokuman.description || "");
    formdata.append("language", dokuman.language);
    formdata.append("category", dokuman.category);
    formdata.append("inserteduser", parseInt(user?.user_id));
    formdata.append("status", dokuman.status || "Taslak");

    // Kapak ve ana dosya
    formdata.append("cover_image", dokuman.coverImage.file);
    formdata.append("file", dokuman.mainFile);

    // Bölümler
    sections.forEach((s, i) => {
      formdata.append(`sections[${i}][title]`, s.title);
      formdata.append(`sections[${i}][file]`, s.file);
    });

    // Endpoint örnek: eskepstajer/dokuman-create/
    await useAxios().post(`eskepstajer/dokuman-create/`, formdata);

    Swal.fire({
      icon: "success",
      title: "Doküman Başarıyla Oluşturuldu",
    });

    // İstersen formu temizle:
    // window.location.reload();
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
              <h2 className="mb-4">📄 Doküman Oluştur</h2>

              {/* Başlık */}
              <div className="mb-3">
                <label className="form-label">Başlık</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={dokuman.title}
                  onChange={handleInputChange}
                />
                {errors.title && <span className="text-danger">{errors.title}</span>}
              </div>

              {/* Durum (opsiyonel) */}
              <div className="mb-3">
                <label className="form-label">Durum</label>
                <select
                  className="form-select"
                  name="status"
                  value={dokuman.status}
                  onChange={handleInputChange}
                >
                  <option value="Taslak">Taslak</option>
                  <option value="İncelemede">İncelemede</option>
                  <option value="Yayında">Yayında</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>

              {/* Açıklama (Markdown) */}
              <div className="mb-3">
                <label className="form-label">Açıklama (Opsiyonel)</label>
                <MdEditor
                  value={dokuman.description}
                  style={{ height: "200px" }}
                  renderHTML={(text) => mdParser.render(text)}
                  onChange={handleEditorChange}
                />
              </div>

              {/* Kapak Resmi */}
              <div className="mb-3">
                <label className="form-label">Kapak Resmi</label>
                <input type="file" className="form-control" onChange={handleCoverChange} />
                {errors.coverImage && <span className="text-danger">{errors.coverImage}</span>}
                {dokuman.coverImage?.preview && (
                  <img
                    src={dokuman.coverImage.preview}
                    alt="Kapak Önizleme"
                    className="mt-2 rounded"
                    style={{ maxHeight: 150 }}
                  />
                )}
              </div>

              {/* Ana Doküman Dosyası */}
              <div className="mb-3">
                <label className="form-label">Ana Doküman (PDF/DOC/DOCX)</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleMainFileChange}
                />
                {errors.mainFile && <span className="text-danger">{errors.mainFile}</span>}
              </div>

              {/* Kategori */}
              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  name="category"
                  value={dokuman.category}
                  onChange={handleInputChange}
                >
                  <option value="">-------------</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="text-danger">{errors.category}</span>}
              </div>

              {/* Dil */}
              <div className="mb-3">
                <label className="form-label">Dil</label>
                <select
                  className="form-select"
                  name="language"
                  value={dokuman.language}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz</option>
                  <option value="TR">Türkçe</option>
                  <option value="EN">English</option>
                  <option value="AR">العربية</option>
                </select>
                {errors.language && <span className="text-danger">{errors.language}</span>}
              </div>

              {/* Bölümler */}
              <div className="mb-3">
                <h4>Bölümler</h4>
                {sections.map((s, idx) => (
                  <div key={idx} className="border p-2 rounded-3 mb-3 bg-light">
                    <input
                      type="text"
                      placeholder="Bölüm Adı"
                      className="form-control mb-2"
                      value={s.title}
                      onChange={(e) => handleSectionTitle(idx, e.target.value)}
                    />
                    {errors[`section_title_${idx}`] && (
                      <span className="text-danger">{errors[`section_title_${idx}`]}</span>
                    )}

                    <input
                      type="file"
                      className="form-control"
                      accept="application/pdf"
                      onChange={(e) => handleSectionFile(idx, e.target.files?.[0])}
                    />
                    {errors[`section_file_${idx}`] && (
                      <span className="text-danger">{errors[`section_file_${idx}`]}</span>
                    )}

                    <button
                      className="btn btn-danger mt-2"
                      type="button"
                      onClick={() => removeSection(idx)}
                    >
                      Bölümü Kaldır
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-100" onClick={addSection}>
                  + Yeni Bölüm
                </button>
              </div>

              <button className="btn btn-success w-100" type="submit">
                Doküman Oluştur
              </button>
            </form>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default DokumanCreate;
