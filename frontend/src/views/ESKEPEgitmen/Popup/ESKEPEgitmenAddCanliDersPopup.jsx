import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useAxios from "../../../utils/useAxios";
import { useNavigate } from "react-router-dom";

const ESKEPEgitmenAddCanliDersPopup = ({ lessonId, onSuccess }) => {
  const api = useAxios();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    date: today,
    time: "",
    platform: "",
    platform_url: "",
  });

  const platformLinks = {
    zoom: "https://zoom.us/j/",
    meet: "https://meet.google.com/",
    teams: "https://teams.microsoft.com/",
    jitsi: "https://meet.jit.si/",
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

  useEffect(() => {
    if (lessonId) {
      const fetchLesson = async () => {
        try {
          const res = await api.get(`/live-lessons/${lessonId}/`);
          const lesson = res.data;
          const [date, time] = new Date(lesson.datetime).toISOString().split("T");
          setInitialValues({
            title: lesson.title,
            description: lesson.description,
            date,
            time: time.slice(0, 5),
            platform: lesson.platform,
            platform_url: lesson.platform_url,
          });
        } catch (err) {
          Swal.fire("Hata", "Ders bilgileri alınamadı", "error");
        }
      };
      fetchLesson();
    }
  }, [lessonId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        datetime: new Date(`${values.date}T${values.time}`).toISOString(),
      };

      if (lessonId) {
        await api.put(`/live-lessons/${lessonId}/`, payload);
        Swal.fire("Güncellendi", "Canlı ders güncellendi", "success");
      } else {
        await api.post("/live-lessons/", payload);
        Swal.fire("Oluşturuldu", "Canlı ders oluşturuldu", "success");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "İşlem başarısız", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pt-5 pb-5 bg-light">
      <div className="container">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="mb-4 text-primary fw-bold">
            🎥 {lessonId ? "Dersi Düzenle" : "Canlı Ders Oluştur"}
          </h3>
          <Formik
            enableReinitialize
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
                  <Field name="description" as="textarea" className="form-control" />
                  <div className="text-danger small">
                    <ErrorMessage name="description" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tarih</label>
                    <Field type="date" name="date" min={today} className="form-control" />
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
                  {isSubmitting ? "Kaydediliyor..." : lessonId ? "Güncelle" : "Dersi Oluştur"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
};

export default ESKEPEgitmenAddCanliDersPopup;
