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

function DersSonuRaporuCreate() {
  const [derssonuraporu, setDersSonuRaporu] = useState({
    category: "",
    image: "",
    title: "",
    description: "",
    level: "",
    language: "",
    derssonuraporu_status: ""
  });

  const [category, setCategory] = useState([]);
  const [ckEditorData, setCKEditorData] = useState("");
  const [variants, setVariants] = useState([{ title: "", pdf: "" }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    useAxios().get(`course/category/`).then((res) => {
      setCategory(res.data);
    });
  }, []);

  const handleInputChange = (event) => {
    setDersSonuRaporu({
      ...derssonuraporu,
      [event.target.name]: event.target.value,
    });
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors({ ...errors, image: "Yalnızca jpg, jpeg veya png dosyaları kabul edilir." });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDersSonuRaporu({
            ...derssonuraporu,
            image: {
              file: file,
              preview: reader.result,
            },
          });
          setErrors({ ...errors, image: "" });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleVariantChange = (index, value) => {
    const updated = [...variants];
    updated[index].title = value;
    setVariants(updated);
  };

  const handlePDFChange = (index, file) => {
    const updated = [...variants];
    if (file && file.type !== "application/pdf") {
      setErrors({ ...errors, [`variant_pdf_${index}`]: "Yalnızca PDF dosyaları kabul edilir." });
    } else {
      updated[index].pdf = file;
      setVariants(updated);
      setErrors({ ...errors, [`variant_pdf_${index}`]: "" });
    }
  };

  const addVariant = () => {
    setVariants([...variants, { title: "", pdf: "" }]);
  };

  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!derssonuraporu.title) newErrors.title = "Başlık zorunludur.";
    if (!ckEditorData) newErrors.description = "Açıklama zorunludur.";
    if (!derssonuraporu.image.file) newErrors.image = "Kapak resmi yükleyiniz.";
    if (!derssonuraporu.category) newErrors.category = "Kategori seçiniz.";

    variants.forEach((variant, index) => {
      if (!variant.title) newErrors[`variant_title_${index}`] = "Bölüm adı zorunludur.";
      if (!variant.pdf) newErrors[`variant_pdf_${index}`] = "PDF dosyası ekleyiniz.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formdata = new FormData();
    formdata.append("title", derssonuraporu.title);
    formdata.append("hazirlayan", parseInt(UserData()?.user_id));
    formdata.append("derssonuraporu_status", derssonuraporu.derssonuraporu_status);
    formdata.append("image", derssonuraporu.image.file);
    formdata.append("description", ckEditorData);
    formdata.append("category", derssonuraporu.category);
    formdata.append("level", derssonuraporu.level);
    formdata.append("language", derssonuraporu.language);

    variants.forEach((variant, index) => {
      formdata.append(`variants[${index}][title]`, variant.title);
      formdata.append(`variants[${index}][pdf]`, variant.pdf);
    });

    await useAxios().post(`eskepstajer/derssonuraporu-create/`, formdata);
    Swal.fire({
      icon: "success",
      title: "Ders Sonu Raporu Başarıyla Oluşturuldu"
    });

    // form sıfırlama
    setDersSonuRaporu({
      category: "",
      image: "",
      title: "",
      description: "",
      level: "",
      language: "",
      derssonuraporu_status: ""
    });
    setCKEditorData("");
    setVariants([{ title: "", pdf: "" }]);
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
                  <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                  Yeni Ders Sonu Raporu Oluştur
                </h2>
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label">Rapor Başlığı</label>
                <input type="text" id="title" className="form-control" name="title" onChange={handleInputChange} value={derssonuraporu.title} />
                {errors.title && <span className="text-danger">{errors.title}</span>}
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">Rapor Durumu</label>
                <select id="status" className="form-select" name="derssonuraporu_status" onChange={handleInputChange} value={derssonuraporu.derssonuraporu_status}>
                  <option value="">Seçiniz</option>
                  <option value="İncelemede">İncelemede</option>
                  <option value="Pasif">Pasif</option>
                  <option value="Reddedilmiş">Reddedilmiş</option>
                  <option value="Taslak">Taslak</option>
                  <option value="Teslim Edildi">Teslim Edildi</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Rapor Açıklaması</label>
                <CKEditor editor={ClassicEditor} data={ckEditorData} onChange={handleCkEditorChange} />
                {errors.description && <span className="text-danger">{errors.description}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Kapak Resmi</label>
                <input type="file" className="form-control" onChange={handleImageChange} />
                {derssonuraporu.image.preview && (
                  <img src={derssonuraporu.image.preview} alt="Kapak" className="img-thumbnail mt-2" width="200" />
                )}
                {errors.image && <span className="text-danger">{errors.image}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select className="form-select" name="category" onChange={handleInputChange} value={derssonuraporu.category}>
                  <option value="">-------------</option>
                  {category.map((c, index) => (
                    <option key={index} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {errors.category && <span className="text-danger">{errors.category}</span>}
              </div>

              <fieldset className="mb-3">
                <legend>Bölümler</legend>
                {variants.map((variant, index) => (
                  <article key={index} className="border p-2 rounded-3 mb-3 bg-light">
                    <label className="form-label">Bölüm Adı</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={variant.title}
                      onChange={(e) => handleVariantChange(index, e.target.value)}
                    />
                    {errors[`variant_title_${index}`] && (
                      <span className="text-danger">{errors[`variant_title_${index}`]}</span>
                    )}

                    <label className="form-label">PDF Yükle</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="application/pdf"
                      onChange={(e) => handlePDFChange(index, e.target.files[0])}
                    />
                    {errors[`variant_pdf_${index}`] && (
                      <span className="text-danger">{errors[`variant_pdf_${index}`]}</span>
                    )}

                    <button className="btn btn-danger mt-2" type="button" onClick={() => removeVariant(index)}>
                      Bölümü Kaldır
                    </button>
                  </article>
                ))}
                <button className="btn btn-secondary w-100" type="button" onClick={addVariant}>+ Yeni Bölüm</button>
              </fieldset>

              <button className="btn btn-success w-100" type="submit">Ders Sonu Raporu Oluştur</button>
            </form>
          </div>
        </div>
      </main>
      <ESKEPBaseFooter />
    </>
  );
}

export default DersSonuRaporuCreate;
