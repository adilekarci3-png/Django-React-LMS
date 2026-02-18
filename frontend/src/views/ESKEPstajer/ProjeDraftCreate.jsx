// src/pages/ESKEP/Stajer/ProjeDraftCreate.jsx
import { useState, useEffect } from "react";
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

function ProjeDraftCreate() {
  const api = useAxios();
  const user = UserData();

  const [categories, setCategories] = useState([]);

  // sadece ilk taslak için gereken alanlar
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    language: "",
    plan_week_count: 5, // 5 veya 7
    image: null,
    initial_draft_file: null,
    proje_status: "pending", // ilk gönderim için pending
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get("course/category/").then((res) => {
      setCategories(res.data || []);
    });
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = ({ text }) => {
    setForm((prev) => ({ ...prev, description: text }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Yalnızca resim dosyaları kabul edilir.",
      }));
      return;
    }
    setForm((prev) => ({ ...prev, image: file }));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleDraftFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // pdf, docx, pptx vs kabul edilebilir
    setForm((prev) => ({ ...prev, initial_draft_file: file }));
    setErrors((prev) => ({ ...prev, initial_draft_file: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Proje başlığı zorunludur.";
    if (!form.description)
      newErrors.description = "Proje açıklaması (ön taslak) zorunludur.";
    if (!form.category) newErrors.category = "Kategori seçiniz.";
    if (!form.initial_draft_file)
      newErrors.initial_draft_file = "Ön taslak dosyası yükleyiniz.";
    if (!form.plan_week_count)
      newErrors.plan_week_count = "Kaç hafta süreceğini seçiniz (5 veya 7).";

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
    fd.append("proje_status", form.proje_status); // pending
    fd.append("inserteduser", parseInt(user?.user_id)); // stajyer id

    if (form.image) {
      fd.append("image", form.image);
    }
    if (form.initial_draft_file) {
      fd.append("initial_draft_file", form.initial_draft_file);
    }

    // backend: POST eskepstajer/proje-create/
    const res = await api.post("eskepstajer/proje-create/", fd);

    // backend'in projeyi dönmesi gerekiyor (id'yi almak için)
    const created = res.data;
    Swal.fire({
      icon: "success",
      title: "Ön taslak gönderildi",
      text: "Koordinatör onayladıktan sonra haftalık içerik ekranı açılacaktır.",
    });

    // istersen otomatik haftalık sayfaya git
    // window.location.href = `/eskep/proje-weekly/${created.id}`;
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
           <div className="col-lg-9 col-md-8 col-12" >
            <form onSubmit={handleSubmit}>
              <h2 className="mb-4">📘 Stajer Projesi – Ön Taslak</h2>
              <p className="text-muted mb-4">
                Bu form sadece <strong>bir defa</strong> doldurulur. Koordinatör
                onayladıktan sonra haftalık yükleme ekranı açılır.
              </p>

              <div className="mb-3">
                <label className="form-label">Proje Başlığı</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && (
                  <span className="text-danger">{errors.title}</span>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Proje Açıklaması / Ön Taslak</label>
                <MdEditor
                  value={form.description}
                  style={{ height: "200px" }}
                  renderHTML={(text) => mdParser.render(text)}
                  onChange={handleDescriptionChange}
                />
                {errors.description && (
                  <span className="text-danger">{errors.description}</span>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">-- seçiniz --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-danger">{errors.category}</span>
                )}
              </div>

              {/* Planlanan hafta sayısı */}
              <div className="mb-3">
                <label className="form-label">Planlanan Süre</label>
                <select
                  name="plan_week_count"
                  className="form-select"
                  value={form.plan_week_count}
                  onChange={handleChange}
                >
                  <option value={5}>5 Hafta</option>
                  <option value={7}>7 Hafta</option>
                </select>
                <small className="text-muted">
                  Staj dönemi boyunca kaç hafta içerik yükleyeceğini burada belirliyorsun.
                </small>
                {errors.plan_week_count && (
                  <span className="text-danger d-block">
                    {errors.plan_week_count}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Kapak Resmi (opsiyonel)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {errors.image && (
                  <span className="text-danger">{errors.image}</span>
                )}
              </div>

              {/* Tek seferlik ön taslak dosyası */}
              <div className="mb-3">
                <label className="form-label">Ön Taslak Dosyası (PDF/DOC vb.)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleDraftFileChange}
                  // accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                {errors.initial_draft_file && (
                  <span className="text-danger">
                    {errors.initial_draft_file}
                  </span>
                )}
              </div>

              <button type="submit" className="btn btn-success w-100">
                Ön Taslağı Gönder
              </button>
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
