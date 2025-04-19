import { useState } from "react";
import axios from "axios";
import { TextField, Button, InputLabel } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";

import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import Sidebar from "./Partials/Sidebar";  // Sidebar'ı import ettik

function InstructorVideoCreate() {
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    videoFile: null,
    description: "",
  });

  const handleChange = (field) => (e) => {
    const value = field === "videoFile" ? e.target.files[0] : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData({ ...formData, description: data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("video_url", formData.videoUrl);
    if (formData.videoFile) {
      payload.append("video_file", formData.videoFile);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/instructor/video/create/", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Başarılı", "Video başarıyla yüklendi!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Hata", "Video yüklenemedi", "error");
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
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Eğitmen Video Ekle</h5>
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

                      <div className="mb-3">
                        <TextField
                          label="YouTube/Video URL"
                          fullWidth
                          value={formData.videoUrl}
                          onChange={handleChange("videoUrl")}
                          size="small"
                        />
                      </div>

                      <div className="mb-4">
                        <InputLabel>Video Dosyası Yükle (.mp4)</InputLabel>
                        <input type="file" accept="video/mp4" onChange={handleChange("videoFile")} />
                      </div>

                      <div className="d-grid">
                        <Button type="submit" variant="contained" color="success" size="large">
                          Videoyu Kaydet
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

export default InstructorVideoCreate;
