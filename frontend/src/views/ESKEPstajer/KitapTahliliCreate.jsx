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

function KitapTahliliCreate() {
  const [kitaptahlili, setKitapTahlili] = useState({
    category: "",
    image: "",
    title: "",
    description: "",
    level: "",
    language: "",
    hazirlayan: "",
    kitaptahlili_status: ""
  });

  const [category, setCategory] = useState([]);
  const [ckEdtitorData, setCKEditorData] = useState("");
  const [variants, setVariants] = useState([{ title: "", pdf: "" }]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    useAxios().get(`course/category/`).then((res) => {
      setCategory(res.data);
    });
  }, []);

  const handleKitapTahliliInputChange = (event) => {
    setKitapTahlili({
      ...kitaptahlili,
      [event.target.name]: event.target.value,
    });
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
  };

  const handleKitapTahliliImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors({ ...errors, image: "Yalnızca jpg, jpeg veya png dosyaları kabul edilir." });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setKitapTahlili({
            ...kitaptahlili,
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
      setErrors({ ...errors, [`variant_pdf_${index}`]: "Yalnızca PDF dosyaları kabul edilir." });
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
    if (!kitaptahlili.title) newErrors.title = "Kitap Tahlili başlığı zorunludur.";
    if (!ckEdtitorData) newErrors.description = "Kitap Tahlili açıklaması zorunludur.";
    if (!kitaptahlili.image.file) newErrors.image = "Kapak resmi yükleyiniz.";
    if (!kitaptahlili.category) newErrors.category = "Kategori seçiniz.";

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
    formdata.append("title", kitaptahlili.title);
    formdata.append("hazirlayan", parseInt(UserData()?.user_id));
    formdata.append("kitaptahlili_status", kitaptahlili.kitaptahlili_status);
    formdata.append("image", kitaptahlili.image.file);
    formdata.append("description", ckEdtitorData);
    formdata.append("category", kitaptahlili.category);
    formdata.append("level", kitaptahlili.level);
    formdata.append("language", kitaptahlili.language);
    formdata.append("teacher", parseInt(UserData()?.user_id));

    variants.forEach((variant, index) => {
      formdata.append(`variants[${index}][title]`, variant.title);
      formdata.append(`variants[${index}][pdf]`, variant.pdf);
    });

    await useAxios().post(`eskepstajer/kitaptahlili-create/`, formdata);
    Swal.fire({
      icon: "success",
      title: "Kitap Tahlili Başarıyla Oluşturuldu"
    });

    // form reset
    setKitapTahlili({
      category: "",
      image: "",
      title: "",
      description: "",
      level: "",
      language: "",
      hazirlayan: "",
      kitaptahlili_status: ""
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
                  <i className="bi bi-journal-text me-2 text-primary"></i>
                  Yeni Kitap Tahlili Oluştur
                </h2>
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label">Kitap Tahlili Başlığı</label>
                <input type="text" id="title" className="form-control" name="title" onChange={handleKitapTahliliInputChange} value={kitaptahlili.title} />
                {errors.title && <span className="text-danger">{errors.title}</span>}
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">Kitap Tahlili Durumu</label>
                <select id="status" className="form-select" name="kitaptahlili_status" onChange={handleKitapTahliliInputChange} value={kitaptahlili.kitaptahlili_status}>
                  <option value="">Seçiniz</option>
                  <option value="İncelemede">İncelemede</option>
                  <option value="Pasif">Pasif</option>
                  <option value="Reddedilmiş">Reddedilmiş</option>
                  <option value="Taslak">Taslak</option>
                  <option value="Teslim Edildi">Teslim Edildi</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Kitap Tahlili Açıklaması</label>
                <CKEditor editor={ClassicEditor} data={ckEdtitorData} onChange={handleCkEditorChange} />
                {errors.description && <span className="text-danger">{errors.description}</span>}
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">Kapak Resmi</label>
                <input type="file" id="image" className="form-control" onChange={handleKitapTahliliImageChange} />
                {kitaptahlili.image.preview && (
                  <img src={kitaptahlili.image.preview} alt="Kapak" className="img-thumbnail mt-2" width="200" />
                )}
                {errors.image && <span className="text-danger">{errors.image}</span>}
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">Kategori</label>
                <select id="category" className="form-select" name="category" onChange={handleKitapTahliliInputChange} value={kitaptahlili.category}>
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
                    <label htmlFor={`variant-title-${index}`} className="form-label">Bölüm Adı</label>
                    <input
                      type="text"
                      id={`variant-title-${index}`}
                      placeholder="Bölüm Adı"
                      className="form-control mb-2"
                      value={variant.title}
                      onChange={(e) => handleVariantChange(index, e.target.value)}
                    />
                    {errors[`variant_title_${index}`] && (
                      <span className="text-danger">{errors[`variant_title_${index}`]}</span>
                    )}

                    <label htmlFor={`variant-pdf-${index}`} className="form-label">PDF Yükle</label>
                    <input
                      type="file"
                      id={`variant-pdf-${index}`}
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

              <button className="btn btn-success w-100" type="submit">Kitap Tahlili Oluştur</button>
            </form>
          </div>
        </div>
      </main>
      <ESKEPBaseFooter />
    </>
  );
}

export default KitapTahliliCreate;
