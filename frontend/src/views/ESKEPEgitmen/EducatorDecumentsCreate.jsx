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




const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar";

const validationSchema = Yup.object({
  title: Yup.string().required("Başlık zorunludur"),
  description: Yup.string(),
  file: Yup.mixed().required("Dosya yükleyiniz"),
});

function EducatorDocumentsCreate() {
  const api = useAxios();
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("description", values.description);
      fd.append("file", values.file);

      await api.post("educator/document/create/", fd);
      await Swal.fire("Başarılı", "Doküman başarıyla oluşturuldu!", "success");
      navigate("/eskepegitmen/documents");
      resetForm();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
          : "Doküman oluşturulamadı";
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
                  <i className="fa-solid fa-file-arrow-up text-secondary"></i> Doküman Oluştur
                </h3>
                <p className="text-muted mb-4">
                  Yeni doküman yükleyebilir ve ders materyallerine ekleyebilirsiniz.
                </p>

                <Formik
                  initialValues={{ title: "", description: "", file: null }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, setFieldValue }) => (
                    <Form>
                      <div className="mb-3">
                        <label className="form-label">Başlık</label>
                        <Field name="title" className="form-control" placeholder="Doküman başlığını giriniz" />
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

                      <div className="mb-4">
                        <label className="form-label">Dosya</label>
                        <input
                          ref={fileRef}
                          type="file"
                          className="form-control"
                          accept={ACCEPTED}
                          onChange={(e) => setFieldValue("file", e.currentTarget.files[0])}
                        />
                        <div className="text-danger small">
                          <ErrorMessage name="file" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Dokümanı Kaydet"}
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

export default EducatorDocumentsCreate;