import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";

function HafizBilgiCreate() {
  const [hafizBilgi, setHafizBilgi] = useState({
    // category: 0,
    // file: "",
    // image: "",
    // title: "",
    // description: "",
    // price: "",
    // level: "",
    // language: "",
    // teacher_course_status: "",
  });

  // const [category, setCategory] = useState([]);
  const [progress, setProgress] = useState(0);
  const [ckEdtitorData, setCKEditorData] = useState("");

  const [variants, setVariants] = useState([
    {
      title: "",
      items: [{ title: "", description: "", file: "", preview: false }],
    },
  ]);

  // useEffect(() => {
  //   useAxios()
  //     .get(`course/category/`)
  //     .then((res) => {
  //       setCategory(res.data);
  //     });
  // }, []);

  // console.log(category);

  const handleHafizBilgiInputChange = (event) => {
    setHafizBilgi({
      ...hafizbilgi,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
    console.log(ckEdtitorData);
  };

  // const handleHafizBilgiImageChange = (event) => {
  //   const file = event.target.files[0];
  //   console.log(file);

  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setCourse({
  //         ...course,
  //         image: {
  //           file: event.target.files[0],
  //           preview: reader.result,
  //         },
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleCourseIntroVideoChange = (event) => {
  //   setCourse({
  //     ...course,
  //     [event.target.name]: event.target.files[0],
  //   });
  // };

  // const handleVariantChange = (index, propertyName, value) => {
  //   const updatedVariants = [...variants];
  //   updatedVariants[index][propertyName] = value;
  //   setVariants(updatedVariants);

  //   console.log(`Name: ${propertyName} - value: ${value} - Index: ${index}`);
  //   console.log(variants);
  // };

  // const handleItemChange = (
  //   variantIndex,
  //   itemIndex,
  //   propertyName,
  //   value,
  //   type
  // ) => {
  //   const updatedVariants = [...variants];
  //   updatedVariants[variantIndex].items[itemIndex][propertyName] = value;
  //   setVariants(updatedVariants);

  //   console.log(
  //     `Name: ${propertyName} - value: ${value} - Index: ${variantIndex} ItemIndex: ${itemIndex} - type: ${type}`
  //   );
  // };

  // const addVariant = () => {
  //   setVariants([
  //     ...variants,
  //     {
  //       title: "",
  //       items: [{ title: "", description: "", file: "", preview: false }],
  //     },
  //   ]);
  // };

  // const removeVariant = (index) => {
  //   const updatedVariants = [...variants];
  //   updatedVariants.splice(index, 1);
  //   setVariants(updatedVariants);
  // };

  // const addItem = (variantIndex) => {
  //   const updatedVariants = [...variants];
  //   updatedVariants[variantIndex].items.push({
  //     title: "",
  //     description: "",
  //     file: "",
  //     preview: false,
  //   });

  //   setVariants(updatedVariants);
  // };

  // const removeItem = (variantIndex, itemIndex) => {
  //   const updatedVariants = [...variants];
  //   updatedVariants[variantIndex].items.splice(itemIndex, 1);
  //   setVariants(updatedVariants);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("name", hafizBilgi.name);
    formdata.append("surname", hafizBilgi.surname);
    formdata.append("babaadi", hafizBilgi.babaadi);
    formdata.append("tcno", hafizBilgi.tcno);
    formdata.append("adres", hafizBilgi.adres);
    formdata.append("adresIl", hafizBilgi.adresIl);
    formdata.append("adresIlce", hafizBilgi.adresIlce);
    formdata.append("hafizlikbitirmeyili", hafizBilgi.hafizlikbitirmeyili);
    formdata.append("evtel", hafizBilgi.evtel);
    formdata.append("istel", hafizBilgi.istel);
    formdata.append("ceptel", hafizBilgi.ceptel);
    formdata.append("isMarried", hafizBilgi.isMarried);
    formdata.append("ePosta", hafizBilgi.ePosta);
    formdata.append("hafizlikyaptigikursadi", hafizBilgi.hafizlikyaptigikursadi);
    formdata.append("hafizlikyaptigikursili", hafizBilgi.hafizlikyaptigikursili);
    formdata.append("gorev", hafizBilgi.gorev);
    formdata.append("hafizlikhocaadi", hafizBilgi.hafizlikhocaadi);
    formdata.append("hafizlikhocasoyadi", hafizBilgi.hafizlikhocasoyadi);
    formdata.append("hafizlikhocaceptel", hafizBilgi.hafizlikhocaceptel);
    formdata.append("hafizlikarkadasadi", hafizBilgi.hafizlikarkadasadi);
    formdata.append("hafizlikarkadasoyad", hafizBilgi.hafizlikarkadasoyad);
    formdata.append("hafizlikarkadasceptel", hafizBilgi.hafizlikarkadasceptel);
    formdata.append("referanstcno", hafizBilgi.referanstcno);
    formdata.append("onaydurumu", hafizBilgi.onaydurumu);
    formdata.append("decription", hafizBilgi.decription);
    formdata.append("gender", hafizBilgi.gender);
    formdata.append("job", hafizBilgi.job);
    formdata.append("yas", hafizBilgi.yas);
    formdata.append("active", hafizBilgi.active);
    // console.log(hafizBilgi.category);
    if (hafizBilgi.file !== null || hafizBilgi.file !== "") {
      formdata.append("file", hafizBilgi.file || "");
    }

    variants.forEach((variant, variantIndex) => {
      Object.entries(variant).forEach(([key, value]) => {
        console.log(`Key: ${key} = value: ${value}`);
        formdata.append(
          `variants[${variantIndex}][variant_${key}]`,
          String(value)
        );
      });

      variant.items.forEach((item, itemIndex) => {
        Object.entries(item).forEach(([itemKey, itemValue]) => {
          formdata.append(
            `variants[${variantIndex}][items][${itemIndex}][${itemKey}]`,
            itemValue
          );
        });
      });
    });

    const response = await useAxios().post(`hafizbilgi/create-hafizbilgi/`, formdata);
    console.log(response.data);
    Swal.fire({
      icon: "success",
      title: "Bilgileriniz Başarılı Bir Şekilde Kaydedildi"
    })
  };

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            
            <form className="col-md-12 col-md-9 col-12" onSubmit={handleSubmit}>
              <>
                <section className="py-4 py-lg-6 bg-primary rounded-3">
                  <div className="container">
                    <div className="row">
                      <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                        <div className="d-lg-flex align-items-center justify-content-between">
                          {/* Content */}
                          <div className="mb-4 mb-lg-0">
                            <h1 className="text-white mb-1">Bilgilerinizi Girin</h1>
                            <p className="mb-0 text-white lead">
                              Alanları Doldurun, Kayıt İşlemi tamamlandıktan sonra bilgileriniz EHAD sistemine kaydedilecektir ve bulunduğunuz ilin şube başkanları sizinle iletişime geçecektir
                            </p>
                          </div>
                          <div>
                            <Link
                              to="/instructor/courses/"
                              className="btn"
                              style={{ backgroundColor: "white" }}
                            >
                              {" "}
                              <i className="fas fa-arrow-left"></i> Kursa Dön
                            </Link>
                            <a
                              href="instructor-courses.html"
                              className="btn btn-dark ms-2"
                            >
                              Kaydet <i className="fas fa-check-circle"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="pb-8 mt-5">
                  <div className="card mb-3">
                    {/* Basic Info Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Temel Bilgiler</h4>
                    </div>
                    <div className="card-body">
                      <label htmlFor="courseTHumbnail" className="form-label">
                        Küçük Resim Önizleme
                      </label>
                      {/* <img
                        style={{
                          width: "100%",
                          height: "330px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                        className="mb-4"
                        src={
                          hafizBilgi.image.preview ||
                          "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                        }
                        alt=""
                      /> */}
                      {/* <div className="mb-3">
                        <label htmlFor="courseTHumbnail" className="form-label">
                          Kurs Küçük Resim
                        </label>
                        <input
                          id="courseTHumbnail"
                          className="form-control"
                          type="file"
                          name="image"
                          onChange={handleCourseImageChange}
                        />
                      </div> */}
                      {/* <div className="mb-3">
                        <label htmlFor="courseTitle" className="form-label">
                          Tanıtım Videosu
                        </label>
                        <input
                          id="introvideo"
                          className="form-control"
                          type="file"
                          name="file"
                          onChange={handleCourseIntroVideoChange}
                        />
                      </div> */}
                      <div className="mb-3">
                        <label htmlFor="hafizAdi" className="form-label">
                          Adı
                        </label>
                        <input
                          id="hafizAdi"
                          className="form-control"
                          type="text"
                          placeholder=""
                          name="name"
                          onChange={handleHafizBilgiInputChange}
                        />
                        <small>En fazla 60 karakter olacak şekilde kurs başlığınızı yazın</small>
                      </div>
                      {/* <div className="mb-3">
                        <label className="form-label">Kurs Kategorisi</label>
                        <select
                          className="form-select"
                          name="category"
                          onChange={handleHafizBilgiInputChange}
                        >
                          <option value="">-------------</option>
                          {category?.map((c, index) => (
                            <option key={index} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                        <small>
                        Kategorileri seçerek insanların kurslarınızı bulmasına yardımcı olun
                        </small>
                      </div> */}
                      <div className="mb-3">
                        <select
                          className="form-select"
                          onChange={handleHafizBilgiInputChange}
                          name="level"
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
                          onChange={handleHafizBilgiInputChange}
                          name="language"
                        >
                          <option value="">Dil Seçin</option>
                          <option value="Türkçe">Türkçe</option>
                          <option value="İngilizce">İngilizce</option>
                          <option value="Arapça">Arapça</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Hafız Açıklaması</label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={ckEdtitorData}
                          onChange={handleCkEditorChange}
                          style={{ height: "400px" }}
                          name="description"
                          value={hafizBilgi.decription || ""}
                        />
                        <small>
                        Kurslarınızın kısa bir özeti.</small>
                      </div>
                      {/* <label htmlFor="courseTitle" className="form-label">
                        Price
                      </label>
                      <input
                        id="courseTitle"
                        className="form-control"
                        type="number"
                        onChange={handleHafizBilgiInputChange}
                        name="price"
                        placeholder=""
                      /> */}
                    </div>

                    {/* Curriculum Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">Dersler</h4>
                    </div>
                    <div className="card-body ">
                      {variants.map((variant, variantIndex) => (
                        <div
                          className="border p-2 rounded-3 mb-3"
                          style={{ backgroundColor: "#ededed" }}
                        >
                          <div className="d-flex mb-4">
                            <input
                              type="text"
                              placeholder="Böüm Adı"
                              required
                              className="form-control"
                              onChange={(e) =>
                                handleVariantChange(
                                  variantIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                            <button
                              className="btn btn-danger ms-2"
                              type="button"
                              onClick={() => removeVariant(variantIndex)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          {variant.items.map((item, itemIndex) => (
                            <div
                              className=" mb-2 mt-2 shadow p-2 rounded-3 "
                              style={{ border: "1px #bdbdbd solid" }}
                            >
                              <input
                                type="text"
                                placeholder="Ders Başlığı"
                                className="form-control me-1 mt-2"
                                name="title"
                                onChange={(e) =>
                                  handleItemChange(
                                    variantIndex,
                                    itemIndex,
                                    "title",
                                    e.target.value,
                                    e.target.type
                                  )
                                }
                              />
                              <textarea
                                name="description"
                                id=""
                                cols="30"
                                className="form-control mt-2"
                                placeholder="Ders Tanımı"
                                rows="4"
                                onChange={(e) =>
                                  handleItemChange(
                                    variantIndex,
                                    itemIndex,
                                    "description",
                                    e.target.value,
                                    e.target.type
                                  )
                                }
                              ></textarea>
                              <div className="row d-flex align-items-center">
                                <div className="col-lg-8">
                                  <input
                                    type="file"
                                    placeholder="Item Price"
                                    className="form-control me-1 mt-2"
                                    name="file"
                                    onChange={(e) =>
                                      handleItemChange(
                                        variantIndex,
                                        itemIndex,
                                        "file",
                                        e.target.files[0],
                                        e.target.type
                                      )
                                    }
                                  />
                                </div>
                                <div className="col-lg-4">
                                  <label htmlFor={`checkbox${1}`}>
                                    Önizleme
                                  </label>
                                  <input
                                    type="checkbox"
                                    className="form-check-input ms-2"
                                    name=""
                                    id={`checkbox${1}`}
                                    onChange={(e) =>
                                      handleItemChange(
                                        variantIndex,
                                        itemIndex,
                                        "preview",
                                        e.target.checked,
                                        e.target.type
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger me-2 mt-2"
                                type="button"
                                onClick={() =>
                                  removeItem(variantIndex, itemIndex)
                                }
                              >
                                Dersi Sil <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ))}

                          <button
                            className="btn btn-sm btn-primary mt-2"
                            type="button"
                            onClick={() => addItem(variantIndex)}
                          >
                            + Ders Ekleyin
                          </button>
                        </div>
                      ))}

                      {/* <button
                        className="btn btn-sm btn-secondary w-100 mt-2"
                        type="button"
                        onClick={addVariant}
                      >
                        + Yeni Bölüm
                      </button> */}
                    </div>
                  </div>
                  <button
                    className="btn btn-lg btn-success w-100 mt-2"
                    type="submit"
                  >
                    Bilgilerinizi Kaydedin <i className="fas fa-check-circle"></i>
                  </button>
                </section>
              </>
            </form>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default HafizBilgiCreate;
