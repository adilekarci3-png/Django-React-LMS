import { useState, useEffect } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import UserData from "../plugin/UserData";

// ✅ Markdown Editor
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

function DersSonuRaporuCreate() {
  
  const user = UserData(); 
  const [derssonuraporu, setDersSonuRaporu] = useState({
    category: "",
    image: "",
    title: "",
    description: "",
    level: "",
    language: "",
    inserteduser:parseInt(user?.user_id),
    derssonuraporu_status: "",
  });

  const [category, setCategory] = useState([]);
  const [variants, setVariants] = useState([{ title: "", pdf: "" }]);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    useAxios().get(`course/category/`).then((res) => {
      setCategory(res.data);
    });
  }, []);

  const handleDersSonuRaporuInputChange = (event) => {
    setDersSonuRaporu({
      ...derssonuraporu,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditorChange = ({ text }) => {
    setDersSonuRaporu({
      ...derssonuraporu,
      description: text,
    });
  };

  const handleDersSonuRaporuImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors({ ...errors, image: "Yalnızca resim dosyaları kabul edilir." });
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
    const updatedVariants = [...variants];
    updatedVariants[index].title = value;
    setVariants(updatedVariants);
  };

  const handlePDFChange = (index, file) => {
    const updatedVariants = [...variants];
    if (file && file.type !== "application/pdf") {
      setErrors({
        ...errors,
        [`variant_pdf_${index}`]: "Yalnızca PDF dosyaları kabul edilir.",
      });
    } else {
      updatedVariants[index].pdf = file;
      setVariants(updatedVariants);
      setErrors({ ...errors, [`variant_pdf_${index}`]: "" });
    }
  };

  const addVariant = () => {
    setVariants([...variants, { title: "", pdf: "" }]);
  };

  const removeVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!derssonuraporu.title) newErrors.title = "Ders Sonu Raporu başlığı zorunludur.";
    if (!derssonuraporu.description) newErrors.description = "Ders Sonu Raporu açıklaması zorunludur.";
    if (!derssonuraporu.image?.file) newErrors.image = "Kapak resmi yükleyiniz.";
    if (!derssonuraporu.category) newErrors.category = "Kategori seçiniz.";

    variants.forEach((variant, index) => {
      if (!variant.title)
        newErrors[`variant_title_${index}`] = "Bölüm adı zorunludur.";
      if (!variant.pdf)
        newErrors[`variant_pdf_${index}`] = "PDF dosyası ekleyiniz.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formdata = new FormData();
    formdata.append("title", derssonuraporu.title);
    formdata.append("inserteduser", parseInt(user?.user_id));
    formdata.append("derssonuraporu_status", derssonuraporu.derssonuraporu_status);
    formdata.append("image", derssonuraporu.image.file);
    formdata.append("description", derssonuraporu.description);
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
      title: "Ders Sonu Raporu Başarıyla Oluşturuldu",
    });
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
              <h2 className="mb-4">📘 Ders Sonu Raporu Oluştur</h2>

              <div className="mb-3">
                <label className="form-label">Ders Sonu Raporu Başlığı</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={derssonuraporu.title}
                  onChange={handleDersSonuRaporuInputChange}
                />
                {errors.title && <span className="text-danger">{errors.title}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Ders Sonu Raporu Durumu</label>
                <select
                  className="form-select"
                  name="derssonuraporu_status"
                  value={derssonuraporu.derssonuraporu_status}
                  onChange={handleDersSonuRaporuInputChange}
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
                <label className="form-label">Ders Sonu Raporu Açıklaması</label>
                <MdEditor
                  value={derssonuraporu.description}
                  style={{ height: "200px" }}
                  renderHTML={(text) => mdParser.render(text)}
                  onChange={handleEditorChange}
                />
                {errors.description && (
                  <span className="text-danger">{errors.description}</span>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Kapak Resmi</label>
                <input type="file" className="form-control" onChange={handleDersSonuRaporuImageChange} />
                {errors.image && <span className="text-danger">{errors.image}</span>}
              </div>

              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  name="category"
                  onChange={handleDersSonuRaporuInputChange}
                >
                  <option value="">-------------</option>
                  {category.map((c, index) => (
                    <option key={index} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="text-danger">{errors.category}</span>}
              </div>

              <div className="mb-3">
                <h4>Bölümler</h4>
                {variants.map((variant, index) => (
                  <div key={index} className="border p-2 rounded-3 mb-3 bg-light">
                    <input
                      type="text"
                      placeholder="Bölüm Adı"
                      className="form-control mb-2"
                      value={variant.title}
                      onChange={(e) => handleVariantChange(index, e.target.value)}
                    />
                    {errors[`variant_title_${index}`] && (
                      <span className="text-danger">
                        {errors[`variant_title_${index}`]}
                      </span>
                    )}

                    <input
                      type="file"
                      className="form-control"
                      accept="application/pdf"
                      onChange={(e) => handlePDFChange(index, e.target.files[0])}
                    />
                    {errors[`variant_pdf_${index}`] && (
                      <span className="text-danger">
                        {errors[`variant_pdf_${index}`]}
                      </span>
                    )}

                    <button
                      className="btn btn-danger mt-2"
                      type="button"
                      onClick={() => removeVariant(index)}
                    >
                      Bölümü Kaldır
                    </button>
                  </div>
                ))}
                <button className="btn btn-secondary w-100" type="button" onClick={addVariant}>
                  + Yeni Bölüm
                </button>
              </div>

              <button className="btn btn-success w-100" type="submit">
                Ders Sonu Raporu Oluştur
              </button>
            </form>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default DersSonuRaporuCreate;
