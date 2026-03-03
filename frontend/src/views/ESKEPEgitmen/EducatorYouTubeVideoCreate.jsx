import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import { useParams, useNavigate } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

const validationSchema = Yup.object({
  title: Yup.string().required("Başlık zorunludur"),
  videoUrl: Yup.string()
    .url("Geçerli bir URL giriniz")
    .required("Video linki zorunludur"),
  description: Yup.string(),
});

function EducatorYouTubeVideoCreate() {
  const api = useAxios();
  const profile = useUserData();
  const { id } = useParams();
  // Koordinatör başka eğitmen adına açarsa route'dan gelir, yoksa token'dan alınır
  const educatorId = Number.isFinite(Number(id)) ? Number(id) : profile?.user_id;
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!educatorId) {
      Swal.fire("Hata", "Kullanıcı bilgisi alınamadı.", "error");
      setSubmitting(false);
      return;
    }
    try {
      const payload = {
        title: values.title,
        videoUrl: values.videoUrl,
        description: values.description,
        instructor_id: educatorId,
      };

      await api.post("educator/video/link/create/", payload);
      await Swal.fire("Başarılı", "Video bağlantısı kaydedildi!", "success");
      navigate("/eskepegitmen/youtube-video-list/");
      resetForm();
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
          : "Bağlantı kaydedilemedi";
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
                    <i className="fa-brands fa-youtube text-danger"></i> Youtube Video Bağlantısı Ekle
                </h3>
                <p className="text-muted mb-4">
                  YouTube veya benzeri bir platformdaki videonuzun bağlantısını ekleyebilirsiniz. Video, eğitmen profilinizde görüntülenecektir.
                </p>

                <Formik
                  initialValues={{ title: "", videoUrl: "", description: "" }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-3">
                        <label className="form-label">Video Başlığı</label>
                        <Field name="title" className="form-control" placeholder="Video başlığını giriniz" />
                        <div className="text-danger small">
                          <ErrorMessage name="title" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Video Linki (YouTube, Vimeo vb.)</label>
                        <Field
                          name="videoUrl"
                          className="form-control"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <div className="text-danger small">
                          <ErrorMessage name="videoUrl" />
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

                      <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Bağlantıyı Kaydet"}
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

export default EducatorYouTubeVideoCreate;