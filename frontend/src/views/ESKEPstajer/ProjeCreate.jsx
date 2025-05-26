import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";

import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";

function ProjeCreate() {
  const [proje, setProje] = useState({
    category: "",
    image: "",
    title: "",
    description: "",
    level: "",
    language: "",
    proje_status: ""
  });

  const [category, setCategory] = useState([]);
  const [ckEditorData, setCKEditorData] = useState("");
  const [sections, setSections] = useState([{ title: "", pdf: "" }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    useAxios().get(`course/category/`).then((res) => setCategory(res.data));
  }, []);

  const handleInputChange = (e) => {
    setProje({ ...proje, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors({ ...errors, image: "Yalnızca jpg, jpeg veya png dosyaları kabul edilir." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProje({
        ...proje,
        image: {
          file,
          preview: reader.result
        }
      });
      setErrors({ ...errors, image: "" });
    };
    reader.readAsDataURL(file);
  };

  const handleSectionTitleChange = (index, value) => {
    const updated = [...sections];
    updated[index].title = value;
    setSections(updated);
  };

  const handleSectionPDFChange = (index, file) => {
    const updated = [...sections];
    if (file?.type !== "application/pdf") {
      setErrors({ ...errors, [`pdf_${index}`]: "PDF formatında olmalı." });
    } else {
      updated[index].pdf = file;
      setSections(updated);
      setErrors({ ...errors, [`pdf_${index}`]: "" });
    }
  };

  const addSection = () => setSections([...sections, { title: "", pdf: "" }]);
  const removeSection = (index) => setSections(sections.filter((_, i) => i !== index));

  const validateForm = () => {
    const errs = {};
    if (!proje.title) errs.title = "Proje başlığı zorunludur.";
    if (!ckEditorData) errs.description = "Açıklama zorunludur.";
    if (!proje.image?.file) errs.image = "Kapak görseli yükleyiniz.";
    if (!proje.category) errs.category = "Kategori seçiniz.";
    sections.forEach((s, i) => {
      if (!s.title) errs[`title_${i}`] = "Kısım başlığı zorunludur.";
      if (!s.pdf) errs[`pdf_${i}`] = "PDF dosyası gereklidir.";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formdata = new FormData();
    formdata.append("title", proje.title);
    formdata.append("hazirlayan", parseInt(UserData()?.user_id));
    formdata.append("proje_status", proje.proje_status);
    formdata.append("image", proje.image.file);
    formdata.append("description", ckEditorData);
    formdata.append("category", proje.category);
    formdata.append("level", proje.level);
    formdata.append("language", proje.language);

    sections.forEach((s, i) => {
      formdata.append(`sections[${i}][title]`, s.title);
      formdata.append(`sections[${i}][pdf]`, s.pdf);
    });

    await useAxios().post(`eskepstajer/proje-create/`, formdata);
    Swal.fire({ icon: "success", title: "Proje Başarıyla Kaydedildi" });

    setProje({
      category: "",
      image: "",
      title: "",
      description: "",
      level: "",
      language: "",
      proje_status: ""
    });
    setCKEditorData("");
    setSections([{ title: "", pdf: "" }]);
  };

  return (
    <>
      <ESKEPBaseHeader />
      <main className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <form className="col-lg-9 col-md-8 col-12" onSubmit={handleSubmit}>
              <div className="d-flex align-items-center mb-4">
                <h2 className="fw-bold text-dark mb-0">
                  <i className="bi bi-clipboard-check me-2 text-primary"></i>
                  Yeni Proje Oluştur
                </h2>
              </div>

              <div className="mb-3">
                <label className="form-label">Proje Başlığı</label>
                <input type="text" className="form-control" name="title" value={proje.title} onChange={handleInputChange} />
                {errors.title && <span className="text-danger">{errors.title}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Proje Durumu</label>
                <select className="form-select" name="proje_status" value={proje.proje_status} onChange={handleInputChange}>
                  <option value="">Seçiniz</option>
                  <option value="Taslak">Taslak</option>
                  <option value="Teslim Edildi">Teslim Edildi</option>
                  <option value="Reddedildi">Reddedildi</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Proje Açıklaması</label>
                <CKEditor editor={ClassicEditor} data={ckEditorData} onChange={(e, editor) => setCKEditorData(editor.getData())} />
                {errors.description && <span className="text-danger">{errors.description}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Kapak Görseli</label>
                <input type="file" className="form-control" onChange={handleImageChange} />
                {proje.image?.preview && (
                  <img src={proje.image.preview} alt="preview" className="img-thumbnail mt-2" width={200} />
                )}
                {errors.image && <span className="text-danger">{errors.image}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select className="form-select" name="category" value={proje.category} onChange={handleInputChange}>
                  <option value="">-------------</option>
                  {category.map((cat, i) => (
                    <option key={i} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
                {errors.category && <span className="text-danger">{errors.category}</span>}
              </div>

              <fieldset className="mb-4">
                <legend>Proje Kısımları</legend>
                {sections.map((section, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-light">
                    <label className="form-label">Kısım Başlığı</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={section.title}
                      onChange={(e) => handleSectionTitleChange(index, e.target.value)}
                    />
                    {errors[`title_${index}`] && <span className="text-danger">{errors[`title_${index}`]}</span>}

                    <label className="form-label">PDF Dosyası</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="application/pdf"
                      onChange={(e) => handleSectionPDFChange(index, e.target.files[0])}
                    />
                    {errors[`pdf_${index}`] && <span className="text-danger">{errors[`pdf_${index}`]}</span>}

                    <button type="button" className="btn btn-danger mt-2" onClick={() => removeSection(index)}>Kısmı Sil</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-100" onClick={addSection}>+ Yeni Kısım Ekle</button>
              </fieldset>

              <button className="btn btn-success w-100" type="submit">Projeyi Kaydet</button>
            </form>
          </div>
        </div>
      </main>
      <ESKEPBaseFooter />
    </>
  );
}

export default ProjeCreate;
