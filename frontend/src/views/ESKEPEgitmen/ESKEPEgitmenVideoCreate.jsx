import { useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  title: Yup.string().required("Başlık zorunludur"),
  description: Yup.string(),
  videoUrl: Yup.string().url("Geçerli bir URL giriniz"),
  videoFile: Yup.mixed(),
}).test("url-or-file", "Video URL veya dosya giriniz", function (values) {
  return !!values.videoUrl || !!values.videoFile;
});

function ESKEPEgitmenVideoCreate() {
  const api = useAxios();
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("description", values.description);
      if (values.videoUrl) fd.append("video_url", values.videoUrl);
      if (values.videoFile) fd.append("video_file", values.videoFile);

      await api.post("instructor/video/create/", fd);
      await Swal.fire("Başarılı", "Video başarıyla yüklendi!", "success");
      navigate("/eskepegitmen/video-list/");
      resetForm();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
          : "Video yüklenemedi";
      Swal.fire("Hata", msg, "error");
    } finally {
      setSubmitting(false);
    }
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
                  <i className="fa-solid fa-upload text-info"></i> Video Yükle
                </h3>
                <p className="text-muted mb-4">
                  Yeni video yükleyebilir veya YouTube / harici bağlantı ekleyebilirsiniz.
                </p>

                <Formik
                  initialValues={{ title: "", description: "", videoUrl: "", videoFile: null }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, setFieldValue }) => (
                    <Form>
                      <div className="mb-3">
                        <label className="form-label">Video Başlığı</label>
                        <Field name="title" className="form-control" placeholder="Video başlığını giriniz" />
                        <div className="text-danger small">
                          <ErrorMessage name="title" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Açıklama</label>
                        <Field
                          name="description"
                          as="textarea"
                          rows={4}
                          className="form-control"
                          placeholder="Kısa bir açıklama ekleyebilirsiniz (isteğe bağlı)"
                        />
                        <div className="text-danger small">
                          <ErrorMessage name="description" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">YouTube / Video URL</label>
                        <Field
                          name="videoUrl"
                          className="form-control"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <div className="text-danger small">
                          <ErrorMessage name="videoUrl" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Video Dosyası Yükle (.mp4)</label>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="video/mp4"
                          className="form-control"
                          onChange={(e) => setFieldValue("videoFile", e.currentTarget.files[0])}
                        />
                        <div className="text-danger small">
                          <ErrorMessage name="videoFile" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Videoyu Kaydet"}
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

export default ESKEPEgitmenVideoCreate;