import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const OgrenciDuzenle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const [country, setCountry] = useState([]);
  const [city, setCity] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    evtel: "",
    istel: "",
    ceptel: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    about: "",
    gender: "",
    country: null,
    city: null,
    active: true,
  });

  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required("Ad Soyad zorunludur"),
    ceptel: Yup.string().required("Cep telefonu zorunludur"),
    gender: Yup.string().required("Cinsiyet seçimi zorunludur"),
    country: Yup.number().required("Ülke seçimi zorunludur"),
    city: Yup.number().required("Şehir seçimi zorunludur"),
  });

  useEffect(() => {
    api.get(`/ogrenci/${id}/`).then((res) => {
      setFormData(res.data);
      console.log(res.data);
    });
  }, [id]);
  useEffect(() => {
    api
      .get("country/list/")
      .then((res) => {
        setCountry(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error("Ülke verisi alınamadı:", err));
  }, []);
  useEffect(() => {
    api
      .get("city/list/")
      .then((res) => {
        setCity(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error("Şehir verisi alınamadı:", err));
  }, []);
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    console.log(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    for (let key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    }

    try {
      await api.put(`/ogrenci/${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/eskepinstructor/ogrenci-list/");
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header title="Öğrenci Detay" />
          <div className="row mt-0 mt-md-4">
            <div className="col-md-4 col-lg-3" style={{ minWidth: "280px" }}>
              <Sidebar />
            </div>
            <div className="col-md-8 col-lg-9">
              <div className="card shadow-sm rounded p-4">
                <h3 className="mb-4 text-center">
                  🛠️ Öğrenci Bilgilerini Güncelle
                </h3>
                <Formik
                  initialValues={formData}
                  enableReinitialize
                  validationSchema={validationSchema}
                 onSubmit={async (values) => {
  const formDataToSend = new FormData();

  for (let key in values) {
    if (key === "image") {
      if (values.image instanceof File) {
        formDataToSend.append("image", values.image);
      }
    } else {
      formDataToSend.append(key, values[key]);
    }
  }

  try {
    await api.put(`/ogrenci/${id}/`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    navigate("/eskepinstructor/ogrenci-list/");
  } catch (err) {
    console.error("Güncelleme hatası:", err);
  }
}}
                >
                  {({ values, setFieldValue }) => (
                    <Form encType="multipart/form-data">
                      <div className="row">
                        {/* Sol sütun */}
                        <div className="col-md-6">
                          <Field
                            name="full_name"
                            className="form-control mb-1"
                            placeholder="Ad Soyad"
                          />
                          <ErrorMessage
                            name="full_name"
                            className="text-danger mb-2"
                            component="div"
                          />

                          <Field
                            name="bio"
                            className="form-control mb-3"
                            placeholder="Kısa Biyografi"
                          />

                          <Field
                            name="evtel"
                            className="form-control mb-3"
                            placeholder="Ev Telefonu"
                          />

                          <Field
                            name="istel"
                            className="form-control mb-3"
                            placeholder="İş Telefonu"
                          />

                          <Field
                            name="ceptel"
                            className="form-control mb-1"
                            placeholder="Cep Telefonu"
                          />
                          <ErrorMessage
                            name="ceptel"
                            className="text-danger mb-2"
                            component="div"
                          />

                          <Field
                            name="email"
                            className="form-control mb-3"
                            placeholder="Email"
                          />

                          <Field
                            as="select"
                            name="gender"
                            className="form-control mb-1"
                          >
                            <option value="">Cinsiyet Seç</option>
                            <option value="Erkek">Erkek</option>
                            <option value="Kadın">Kadın</option>
                          </Field>
                          <ErrorMessage
                            name="gender"
                            className="text-danger mb-2"
                            component="div"
                          />

                          <Field
                            as="select"
                            name="country"
                            className="form-control mb-1"
                            onChange={(e) => {
                              const value = e.target.value;
                              setFieldValue("country", value);
                              const filtered = city.filter(
                                (c) => c.country === parseInt(value)
                              );
                              setFilteredCities(filtered);
                              setFieldValue("city", "");
                            }}
                          >
                            <option value="">Ülke Seçin</option>
                            {country.map((ulke) => (
                              <option key={ulke.id} value={ulke.id}>
                                {ulke.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="country"
                            className="text-danger mb-2"
                            component="div"
                          />

                          <Field
                            as="select"
                            name="city"
                            className="form-control mb-1"
                          >
                            <option value="">Şehir Seçin</option>
                            {city
                              .filter(
                                (c) => c.country === parseInt(values.country)
                              )
                              .map((sehir) => (
                                <option key={sehir.id} value={sehir.id}>
                                  {sehir.name}
                                </option>
                              ))}
                          </Field>
                          <ErrorMessage
                            name="city"
                            className="text-danger mb-2"
                            component="div"
                          />
                        </div>

                        {/* Sağ sütun */}
                        <div className="col-md-6">
                          <Field
                            name="facebook"
                            className="form-control mb-3"
                            placeholder="Facebook"
                          />

                          <Field
                            name="twitter"
                            className="form-control mb-3"
                            placeholder="Twitter"
                          />

                          <Field
                            name="linkedin"
                            className="form-control mb-3"
                            placeholder="LinkedIn"
                          />

                          <Field
                            as="textarea"
                            name="about"
                            className="form-control mb-3"
                            placeholder="Hakkında"
                            rows={4}
                          />

                          <input
                            type="file"
                            name="image"
                            accept="image/*"
                            className="form-control mb-3"
                            onChange={(e) => {
                              const file = e.currentTarget.files[0];
                              setFieldValue("image", file);
                            }}
                          />

                          <div className="text-center mb-3">
                            {values.image &&
                            typeof values.image === "object" ? (
                              <img
                                src={URL.createObjectURL(values.image)}
                                alt="Önizleme"
                                className="rounded-circle"
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : values.image ? (
                              <img
                                src={values.image}
                                alt={values.full_name}
                                className="rounded-circle"
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light border rounded-circle mx-auto"
                                style={{ width: "120px", height: "120px" }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-check mb-3">
                        <Field
                          type="checkbox"
                          className="form-check-input"
                          name="active"
                          checked={values.active}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="activeCheckbox"
                        >
                          Aktif mi?
                        </label>
                      </div>

                      <div className="text-center">
                        <button type="submit" className="btn btn-success px-5">
                          Kaydet
                        </button>
                      </div>
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
};

export default OgrenciDuzenle;
