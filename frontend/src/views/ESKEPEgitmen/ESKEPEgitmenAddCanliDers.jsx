import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import { useNavigate } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

const ESKEPEgitmenAddCanliDers = () => {
  const api = useAxios();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const initialValues = {
    title: "",
    description: "",
    date: today,
    time: "",
    platform: "",
    platform_url: "",
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Başlık zorunludur"),
    description: Yup.string().required("Açıklama giriniz"),
    date: Yup.string().required("Tarih seçiniz"),
    time: Yup.string().required("Saat seçiniz"),
    platform_url: Yup.string()
      .url("Geçerli bir URL giriniz")
      .required("Platform linki zorunludur"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        datetime: new Date(`${values.date}T${values.time}`).toISOString(),
      };

      await api.post("/live-lessons/", payload);
      Swal.fire("Başarılı", "Canlı ders oluşturuldu", "success");
      navigate("/eskepegitmen/live-lessons");
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Canlı ders oluşturulamadı", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const platformLinks = {
    zoom: "https://zoom.us/j/",
    meet: "https://meet.google.com/",
    teams: "https://teams.microsoft.com/",
    jitsi: "https://meet.jit.si/",
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-9 col-md-8 col-12">
              <div className="bg-white p-5 rounded shadow">
                <h3 className="mb-2">
                    <i className="fa-solid fa-video text-danger"></i> Canlı Ders Oluştur
                </h3>
                <p className="text-muted mb-4">
                    Gerçekleştireceğiniz canlı dersin bilgilerini giriniz. Platform seçimi yaparsanız, bağlantı alanı otomatik olarak doldurulacaktır.
                  </p>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, setFieldValue, values }) => (
                    <Form>
                      <div className="mb-3">
                        <label className="form-label">Ders Başlığı</label>
                        <Field name="title" className="form-control" />
                        <div className="text-danger small">
                          <ErrorMessage name="title" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Açıklama</label>
                        <Field
                          name="description"
                          as="textarea"
                          className="form-control"
                        />
                        <div className="text-danger small">
                          <ErrorMessage name="description" />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Tarih</label>
                          <Field
                            type="date"
                            name="date"
                            min={today}
                            className="form-control"
                          />
                          <div className="text-danger small">
                            <ErrorMessage name="date" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Saat</label>
                          <Field type="time" name="time" className="form-control" />
                          <div className="text-danger small">
                            <ErrorMessage name="time" />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Platform Seç</label>
                        <Field
                          as="select"
                          name="platform"
                          className="form-select"
                          onChange={(e) => {
                            const selected = e.target.value;
                            setFieldValue("platform", selected);
                            setFieldValue("platform_url", platformLinks[selected] || "");
                          }}
                        >
                          <option value="">Platform Seçiniz</option>
                          <option value="zoom">Zoom</option>
                          <option value="meet">Google Meet</option>
                          <option value="teams">Microsoft Teams</option>
                          <option value="jitsi">Jitsi Meet</option>
                        </Field>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Canlı Ders Linki</label>
                        <Field name="platform_url" className="form-control" />
                        <div className="text-danger small">
                          <ErrorMessage name="platform_url" />
                        </div>
                        {values.platform_url && (
                          <a
                            href={values.platform_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary mt-2"
                          >
                            Bağlantıyı Aç
                          </a>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Canlı Dersi Kaydet"}
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
};

export default ESKEPEgitmenAddCanliDers;