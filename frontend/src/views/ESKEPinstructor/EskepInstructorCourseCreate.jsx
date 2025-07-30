import React, { useState, useEffect, useContext } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { ProfileContext } from "../plugin/Context";

// ✅ Markdown Editor
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';

const mdParser = new MarkdownIt();

// ✅ Validation
const validationSchema = Yup.object({
  title: Yup.string().required("Başlık zorunludur").max(60),
  category: Yup.number().required("Kategori zorunludur"),
  price: Yup.number().required("Fiyat zorunludur").min(0),
  level: Yup.string().required("Seviye zorunludur"),
  language: Yup.string().required("Dil zorunludur"),
  description: Yup.string()
    .required("Açıklama zorunludur")
    .test("no-empty", "Açıklama boş bırakılamaz", value => !!value?.trim()),
  instructor: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : Number(originalValue)
    )
    .required("Eğitmen seçimi zorunludur"),
});

function EskepInstructorCourseCreate() {
  const [instructors, setInstructors] = useState([]);
  const [category, setCategory] = useState([]);
  const [profile] = useContext(ProfileContext);
  const api = useAxios();

  useEffect(() => {
    api.get("course/category/").then((res) => setCategory(res.data));
    api.get("eskepEgitmen/list/").then((res) => setInstructors(res.data));
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    const formdata = new FormData();

    formdata.append("title", values.title);
    formdata.append("category", values.category);
    formdata.append("price", values.price);
    formdata.append("level", values.level);
    formdata.append("language", values.language);
    formdata.append("description", values.description);  // Markdown metin
    formdata.append("teacher", Number(values.instructor));
    formdata.append("inserteduser_id", profile?.user);
    formdata.append("active", true);

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
      await api.post("teacher/course-create/", formdata);
      Swal.fire({ icon: "success", title: "Kurs başarıyla oluşturuldu" });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Hata", text: "Kurs oluşturulamadı." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-4 pb-5">
        <div className="container">
          <Header />
          <div className="row">
            <div className="col-md-3"><Sidebar /></div>
            <div className="col-md-9">
              <div className="card shadow-sm p-4">
               <h3 className="mb-4 p-2 text-white" style={{ backgroundColor: '#007bff', borderRadius: '4px' }}>Yeni Kurs Oluştur</h3>
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
                  {({ values, setFieldValue, isSubmitting }) => (
                    <Form>
                      {/* Temel Bilgiler */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label>Başlık</label>
                          <Field name="title" className="form-control" />
                          <ErrorMessage name="title" component="div" className="text-danger" />
                        </div>
                        <div className="col-md-6">
                          <label>Eğitmen</label>
                          <Field as="select" name="instructor" className="form-select">
                            <option value="">Seçiniz</option>
                            {instructors.map((ins) => (
                              <option key={ins.id} value={ins.id}>
                                {ins.full_name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="instructor" component="div" className="text-danger" />
                        </div>
                        <div className="col-md-6">
                          <label>Kategori</label>
                          <Field as="select" name="category" className="form-select">
                            <option value="">Seçiniz</option>
                            {category.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.title}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="category" component="div" className="text-danger" />
                        </div>
                        <div className="col-md-6">
                          <label>Fiyat</label>
                          <Field name="price" type="number" className="form-control" />
                          <ErrorMessage name="price" component="div" className="text-danger" />
                        </div>
                        <div className="col-md-6">
                          <label>Seviye</label>
                          <Field as="select" name="level" className="form-select">
                            <option value="">Seçiniz</option>
                            <option value="Başlangic">Başlangıç</option>
                            <option value="Orta">Orta</option>
                            <option value="Ileri Seviye">İleri Seviye</option>
                          </Field>
                          <ErrorMessage name="level" component="div" className="text-danger" />
                        </div>
                        <div className="col-md-6">
                          <label>Dil</label>
                          <Field as="select" name="language" className="form-select">
                            <option value="">Seçiniz</option>
                            <option value="Turkce">Türkçe</option>
                            <option value="Ingilizce">İngilizce</option>
                            <option value="Arapca">Arapça</option>
                          </Field>
                          <ErrorMessage name="language" component="div" className="text-danger" />
                        </div>
                      </div>
 <hr className="my-3" style={{ borderTop: '4px solid #999' }} />

                      <div className="mb-4">
                        <label>Kurs Açıklaması (Markdown)</label>
                        <MdEditor
                          value={values.description}
                          style={{ height: "200px" }}
                          renderHTML={(text) => mdParser.render(text)}
                          onChange={({ text }) => setFieldValue("description", text)}
                          view={{ menu: true, md: true, html: false }} // 👈 sadece yazma ekranı
                        />
                        <ErrorMessage name="description" component="div" className="text-danger mt-2" />
                      </div>
 <hr className="my-3" style={{ borderTop: '4px solid #999' }} />

                      {/* Medya */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label>Görsel</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setFieldValue("image", e.currentTarget.files[0])}
                          />
                        </div>
                        <div className="col-md-6">
                          {values.image && (
                            <img
                              src={URL.createObjectURL(values.image)}
                              alt="Önizleme"
                              className="img-fluid border mt-2"
                              style={{ maxHeight: 150 }}
                            />
                          )}
                        </div>
                        <div className="col-12">
                          <label>Tanıtım Videosu</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setFieldValue("file", e.currentTarget.files[0])}
                          />
                        </div>
                      </div>
  <hr className="my-3" style={{ borderTop: '4px solid #999' }} />

                      {/* Bölüm ve Dersler */}
                      <FieldArray name="variants">
                        {({ push, remove }) => (
                          <div className="mb-4">
                            <h5 className="mb-3 p-2 text-white" style={{ backgroundColor: '#28a745', borderRadius: '4px' }}>Bölümler ve Dersler</h5>
                            {values.variants.map((variant, vIdx) => (
                              <div key={vIdx} className="bg-light border rounded p-3 mb-3">
                                <div className="d-flex justify-content-between mb-2">
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
                                <FieldArray name={`variants[${vIdx}].items`}>
                                  {({ push, remove }) => (
                                    <>
                                      {variant.items.map((item, iIdx) => (
                                        <div key={iIdx} className="mb-2 border rounded p-2">
                                          <Field
                                            name={`variants[${vIdx}].items[${iIdx}].title`}
                                            placeholder="Ders Başlığı"
                                            className="form-control mb-2"
                                          />
                                          <Field
                                            as="textarea"
                                            name={`variants[${vIdx}].items[${iIdx}].description`}
                                            placeholder="Ders Açıklaması"
                                            className="form-control mb-2"
                                          />
                                          <input
                                            type="file"
                                            className="form-control mb-2"
                                            onChange={(e) =>
                                              setFieldValue(
                                                `variants[${vIdx}].items[${iIdx}].file`,
                                                e.target.files[0]
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
                                    </>
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
                              + Yeni Bölüm Ekle
                            </button>
                          </div>
                        )}
                      </FieldArray>

                      <button
                        type="submit"
                        className="btn btn-success w-100"
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
      <ESKEPBaseFooter />
    </>
  );
}

export default EskepInstructorCourseCreate;
