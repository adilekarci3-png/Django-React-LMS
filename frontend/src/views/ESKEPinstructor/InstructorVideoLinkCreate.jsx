import { useState } from "react";
import axios from "axios";
import { TextField, Button, InputLabel } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";  // Sidebar'ı import ettik

function InstructorVideoLinkCreate() {
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    description: "",
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData({ ...formData, description: data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/instructor/video/link/", formData);
      Swal.fire("Başarılı", "Video bağlantısı başarıyla kaydedildi!", "success");
      setFormData({ title: "", videoUrl: "", description: "" });
    } catch (error) {
      console.error(error);
      Swal.fire("Hata", "Bağlantı kaydedilemedi", "error");
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              {/* Card */}
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Eğitmen Video Bağlantısı Ekle</h5>
                </div>
                <div className="card-body">
                  <form className="row justify-content-center" onSubmit={handleSubmit}>
                    <div className="col-md-10">
                      <div className="mb-3">
                        <TextField
                          label="Video Başlığı"
                          fullWidth
                          value={formData.title}
                          onChange={handleChange("title")}
                          size="small"
                        />
                      </div>

                      <div className="mb-3">
                        <InputLabel>Açıklama</InputLabel>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.description}
                          onChange={handleEditorChange}
                        />
                      </div>

                      <div className="mb-4">
                        <TextField
                          label="Video Bağlantısı (YouTube, Vimeo vs.)"
                          fullWidth
                          value={formData.videoUrl}
                          onChange={handleChange("videoUrl")}
                          size="small"
                        />
                      </div>

                      <div className="d-grid">
                        <Button type="submit" variant="contained" color="primary" size="large">
                          Bağlantıyı Kaydet
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default InstructorVideoLinkCreate;
