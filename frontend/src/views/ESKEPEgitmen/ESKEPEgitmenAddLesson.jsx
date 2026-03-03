import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import { useNavigate } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

const today = new Date().toISOString().split("T")[0];

const validationSchema = Yup.object({
  title: Yup.string().required("Ders başlığı zorunludur"),
  date: Yup.string().required("Tarih seçiniz"),
  background_color: Yup.string().required(),
  border_color: Yup.string().required(),
});

function ESKEPEgitmenAddLesson() {
  const api = useAxios();
  const navigate = useNavigate();
  const profile = useUserData();

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!profile?.user_id) {
      Swal.fire("Hata", "Kullanıcı bilgisi alınamadı.", "error");
      setSubmitting(false);
      return;
    }
    try {
      await api.post("/events/create/", { ...values, user_id: profile.user_id });
      Swal.fire("Başarılı", "Etkinlik eklendi!", "success");
      navigate("/eskepegitmen/takvim/");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
          : "Etkinlik eklenemedi";
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
                  <i className="fa-regular fa-clock text-success"></i> Ders Oluştur
                </h3>
                <p className="text-muted mb-4">
                  Gerçekleştireceğiniz ders saatinin bilgilerini giriniz. Bu bilgiler, ders takviminizde görüntülenecektir.
                </p>
                

                <Formik
                  initialValues={{
                    title: "",
                    date: today,
                    background_color: "#007bff",
                    border_color: "#0056b3",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-3">
                        <label className="form-label">Ders Başlığı</label>
                        <Field name="title" className="form-control" placeholder="Ders başlığını giriniz" />
                        <div className="text-danger small">
                          <ErrorMessage name="title" />
                        </div>
                      </div>

                      <div className="mb-3">
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

                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Arka Plan Rengi</label>
                          <Field
                            type="color"
                            name="background_color"
                            className="form-control form-control-color"
                          />
                        </div>
                        <div className="col">
                          <label className="form-label">Kenarlık Rengi</label>
                          <Field
                            type="color"
                            name="border_color"
                            className="form-control form-control-color"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Dersi Kaydet"}
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

export default ESKEPEgitmenAddLesson;