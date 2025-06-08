import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";

const validationSchema = Yup.object({
  title: Yup.string().required("Başlık zorunludur").max(60),
  category: Yup.number().required("Kategori zorunludur"),
  price: Yup.number().required("Fiyat zorunludur").min(0),
  level: Yup.string().required("Seviye zorunludur"),
  language: Yup.string().required("Dil zorunludur"),
  description: Yup.string().required("Açıklama zorunludur"),
});

function CourseCreate() {
  const api = useAxios();
  const [category, setCategory] = useState([]);

  useEffect(() => {
    api.get("course/category/").then((res) => setCategory(res.data));
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    const formdata = new FormData();

    formdata.append("title", values.title);
    formdata.append("category", values.category);
    formdata.append("price", values.price);
    formdata.append("level", values.level);
    formdata.append("language", values.language);
    formdata.append("description", values.description);

    if (values.image instanceof File) {
      formdata.append("image", values.image);
    }

    if (values.file instanceof File) {
      formdata.append("file", values.file);
    }

    formdata.append("teacher", UserData()?.teacher_id);

    try {
      await api.post("teacher/course-create/", formdata);
      Swal.fire({
        icon: "success",
        title: "Kurs Başarıyla Oluşturuldu",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        title: "",
        category: "",
        price: "",
        level: "",
        language: "",
        description: "",
        image: null,
        file: null,
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="container mt-4">
          <div className="mb-3">
            <label>Başlık</label>
            <Field name="title" className="form-control" />
            <ErrorMessage name="title" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Kategori</label>
            <Field as="select" name="category" className="form-select">
              <option value="">Seçiniz</option>
              {category.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </Field>
            <ErrorMessage name="category" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Fiyat</label>
            <Field name="price" type="number" className="form-control" />
            <ErrorMessage name="price" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Seviye</label>
            <Field as="select" name="level" className="form-select">
              <option value="">Seçiniz</option>
              <option value="Başlangıç">Başlangıç</option>
              <option value="Orta">Orta</option>
              <option value="İleri Seviye">İleri Seviye</option>
            </Field>
            <ErrorMessage name="level" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Dil</label>
            <Field as="select" name="language" className="form-select">
              <option value="">Seçiniz</option>
              <option value="Türkçe">Türkçe</option>
              <option value="İngilizce">İngilizce</option>
              <option value="Arapça">Arapça</option>
            </Field>
            <ErrorMessage name="language" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Açıklama</label>
            <CKEditor
              editor={ClassicEditor}
              data={values.description}
              onChange={(e, editor) => {
                setFieldValue("description", editor.getData());
              }}
            />
            <ErrorMessage name="description" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Kurs Resmi</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFieldValue("image", e.currentTarget.files[0])}
            />
            {values.image && (
              <img
                src={URL.createObjectURL(values.image)}
                alt="Önizleme"
                style={{ width: "150px", height: "auto", marginTop: "10px", borderRadius: "5px" }}
              />
            )}
          </div>

          <div className="mb-3">
            <label>Tanıtım Videosu</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFieldValue("file", e.currentTarget.files[0])}
            />
          </div>

          <button type="submit" className="btn btn-success" disabled={isSubmitting}>
            Kursu Oluştur
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default CourseCreate;
