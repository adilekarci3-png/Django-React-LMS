import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

const validationSchema = Yup.object({
  title: Yup.string().required("Başlık zorunludur").max(60),
  category: Yup.number().required("Kategori zorunludur"),
  price: Yup.number().required("Fiyat zorunludur").min(0),
  level: Yup.string().required("Seviye zorunludur"),
  language: Yup.string().required("Dil zorunludur"),
  description: Yup.string().required("Açıklama zorunludur"),
  instructor: Yup.number()
  .transform((value, originalValue) =>
    String(originalValue).trim() === "" ? undefined : Number(originalValue)
  )
  .required("Eğitmen seçimi zorunludur"),
});

function CourseCreate() {
  const [instructors, setInstructors] = useState([]);
  const api = useAxios();
  const [category, setCategory] = useState([]);

  useEffect(() => {
    api.get("course/category/").then((res) => setCategory(res.data));
  }, []);

  useEffect(() => {
    api
      .get("egitmen/list/")
      .then((res) => {
        setInstructors(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    const formdata = new FormData();
    // const teacherId = UserData()?.teacher_id;

    formdata.append("title", values.title);
    formdata.append("category", values.category);
    formdata.append("price", values.price);
    formdata.append("level", values.level);
    formdata.append("language", values.language);
    formdata.append("description", values.description);
    formdata.append("teacher", Number(values.instructor));

    if (values.image instanceof File) {
      formdata.append("image", values.image);
    }

    if (values.file instanceof File) {
      formdata.append("file", values.file);
    }

    values.variants.forEach((variant, vIdx) => {
      formdata.append(`variants[${vIdx}][variant_title]`, variant.title);
      variant.items.forEach((item, iIdx) => {
        formdata.append(`variants[${vIdx}][items][${iIdx}][title]`, item.title);
        formdata.append(
          `variants[${vIdx}][items][${iIdx}][description]`,
          item.description
        );
        formdata.append(
          `variants[${vIdx}][items][${iIdx}][preview]`,
          item.preview ? "true" : "false"
        );
        if (item.file instanceof File) {
          formdata.append(`variants[${vIdx}][items][${iIdx}][file]`, item.file);
        }
      });
    });

    try {
      console.log(formdata);
      await api.post("teacher/course-create/", formdata);

      Swal.fire({ icon: "success", title: "Kurs Başarıyla Oluşturuldu" });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-2 col-md-4 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-10 col-md-8">
              <div className="card shadow-sm p-4">
                <h3 className="mb-4">Yeni Kurs Oluştur</h3>
                <Formik
                  initialValues={{
                    title: "",
                    category: "",
                    price: "",
                    level: "",
                    language: "",
                    description: "",
                    instructor: "",
                    image: null,
                    file: null,
                    variants: [
                      {
                        title: "",
                        items: [
                          {
                            title: "",
                            description: "",
                            file: null,
                            preview: false,
                          },
                        ],
                      },
                    ],
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ setFieldValue, values, isSubmitting }) => (
                    // ... (üst kısımlar değişmedi)

                    <Form>
                      {/* Temel Bilgiler */}
                      <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                          <h5 className="mb-0">Temel Bilgiler</h5>
                        </div>
                        <div className="card-body row g-3">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label>Başlık</label>
                              <Field name="title" className="form-control" />
                              <ErrorMessage
                                name="title"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                            <div className="col-md-6">
                              <label>Eğitmen</label>
                              <Field
                                as="select"
                                name="instructor"
                                className="form-select"
                              >
                                <option value="">Seçiniz</option>
                                {instructors.map((ins) => (
                                  <option key={ins.id} value={Number(ins.id)}>
                                    {ins.full_name}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="instructor"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                            <div className="col-md-6">
                              <label>Kategori</label>
                              <Field
                                as="select"
                                name="category"
                                className="form-select"
                              >
                                <option value="">Seçiniz</option>
                                {category.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.title}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="category"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                            <div className="col-md-6">
                              <label>Fiyat</label>
                              <Field
                                name="price"
                                type="number"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="price"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                            <div className="col-md-6">
                              <label>Seviye</label>
                              <Field
                                as="select"
                                name="level"
                                className="form-select"
                              >
                                <option value="">Seçiniz</option>
                                <option value="Başlangic">Başlangıç</option>
                                <option value="Orta">Orta</option>
                                <option value="Ileri Seviye">
                                  İleri Seviye
                                </option>
                              </Field>
                              <ErrorMessage
                                name="level"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                            <div className="col-md-6">
                              <label>Dil</label>
                              <Field
                                as="select"
                                name="language"
                                className="form-select"
                              >
                                <option value="">Seçiniz</option>
                                <option value="Turkce">Türkçe</option>
                                <option value="Ingilizce">İngilizce</option>
                                <option value="Arapca">Arapça</option>
                              </Field>
                              <ErrorMessage
                                name="language"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Açıklama Alanı */}
                        <div className="card mb-4">
                          <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">Kurs Açıklaması</h5>
                          </div>
                          <div className="card-body">
                            <div className="col-12">
                              <label>Açıklama</label>
                              <CKEditor
                                editor={ClassicEditor}
                                data={values.description}
                                onChange={(e, editor) =>
                                  setFieldValue("description", editor.getData())
                                }
                              />
                              <ErrorMessage
                                name="description"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Medya Alanları */}
                      <div className="card mb-4">
                        <div className="card-header bg-info text-white">
                          <h5 className="mb-0">Kurs Medyası</h5>
                        </div>
                        <div className="card-body row g-3">
                          <div className="col-md-6">
                            <label>Kurs Resmi</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                setFieldValue("image", e.currentTarget.files[0])
                              }
                            />
                          </div>
                          <div className="col-md-6">
                            {values.image && (
                              <img
                                src={URL.createObjectURL(values.image)}
                                alt="Önizleme"
                                className="img-fluid rounded border mt-2"
                                style={{ maxHeight: "180px" }}
                              />
                            )}
                          </div>
                          <div className="col-12">
                            <label>Tanıtım Videosu</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                setFieldValue("file", e.currentTarget.files[0])
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ders ve Bölüm Alanları */}
                      <div className="card mb-4">
                        <div className="card-header bg-warning">
                          <h5 className="mb-0">Bölümler ve Dersler</h5>
                        </div>
                        <div className="card-body">
                          <FieldArray name="variants">
                            {({ push, remove }) => (
                              <div className="mt-5">
                                <h5>Bölümler ve Dersler</h5>
                                {values.variants.map((variant, vIdx) => (
                                  <div
                                    key={vIdx}
                                    className="border rounded p-3 mb-4 bg-light"
                                  >
                                    <div className="d-flex justify-content-between">
                                      <Field
                                        name={`variants[${vIdx}].title`}
                                        placeholder="Bölüm Başlığı"
                                        className="form-control me-2"
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => remove(vIdx)}
                                      >
                                        Bölümü Sil
                                      </button>
                                    </div>
                                    <FieldArray
                                      name={`variants[${vIdx}].items`}
                                    >
                                      {({ push, remove }) => (
                                        <div className="mt-3">
                                          {variant.items.map((item, iIdx) => (
                                            <div
                                              key={iIdx}
                                              className="border p-2 rounded mb-2"
                                            >
                                              <Field
                                                name={`variants[${vIdx}].items[${iIdx}].title`}
                                                placeholder="Ders Başlığı"
                                                className="form-control mb-2"
                                              />
                                              <Field
                                                as="textarea"
                                                name={`variants[${vIdx}].items[${iIdx}].description`}
                                                placeholder="Ders Açıklama"
                                                className="form-control mb-2"
                                              />
                                              <input
                                                type="file"
                                                className="form-control mb-2"
                                                onChange={(e) =>
                                                  setFieldValue(
                                                    `variants[${vIdx}].items[${iIdx}].file`,
                                                    e.currentTarget.files[0]
                                                  )
                                                }
                                              />
                                              <div className="form-check mb-2">
                                                <input
                                                  type="checkbox"
                                                  className="form-check-input"
                                                  id={`preview-${vIdx}-${iIdx}`}
                                                  checked={item.preview}
                                                  onChange={(e) =>
                                                    setFieldValue(
                                                      `variants[${vIdx}].items[${iIdx}].preview`,
                                                      e.target.checked
                                                    )
                                                  }
                                                />
                                                <label
                                                  htmlFor={`preview-${vIdx}-${iIdx}`}
                                                  className="form-check-label"
                                                >
                                                  Önizleme
                                                </label>
                                              </div>
                                              <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => remove(iIdx)}
                                              >
                                                Dersi Sil
                                              </button>
                                            </div>
                                          ))}
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-secondary"
                                            onClick={() =>
                                              push({
                                                title: "",
                                                description: "",
                                                file: null,
                                                preview: false,
                                              })
                                            }
                                          >
                                            + Ders Ekle
                                          </button>
                                        </div>
                                      )}
                                    </FieldArray>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() =>
                                    push({
                                      title: "",
                                      items: [
                                        {
                                          title: "",
                                          description: "",
                                          file: null,
                                          preview: false,
                                        },
                                      ],
                                    })
                                  }
                                >
                                  + Yeni Bölüm
                                </button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100 mt-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Yükleniyor..." : "Kursu Oluştur"}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}

export default CourseCreate;
