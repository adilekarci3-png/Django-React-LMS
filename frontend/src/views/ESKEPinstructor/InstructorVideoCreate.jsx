import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";

import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import Sidebar from "./Partials/Sidebar";

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
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <Card className="shadow-sm rounded-4">
                <CardContent>
                  <Box className="d-flex align-items-center mb-4">
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 24,
                        boxShadow: "0 4px 10px rgba(255, 65, 108, 0.4)",
                        marginRight: 2,
                      }}
                    >
                      <i className="bi bi-camera-video-fill"></i>
                    </Box>
                    <Typography variant="h5" className="fw-bold text-primary">
                      Eğitmen Video Ekle
                    </Typography>
                  </Box>

                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Video Başlığı"
                          fullWidth
                          value={formData.title}
                          onChange={handleChange("title")}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <InputLabel sx={{ mb: 1 }}>Açıklama</InputLabel>
                        <Box
                          sx={{
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "8px",
                          }}
                        >
                          <CKEditor
                            editor={ClassicEditor}
                            data={formData.description}
                            onChange={handleEditorChange}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="YouTube/Video URL"
                          fullWidth
                          value={formData.videoUrl}
                          onChange={handleChange("videoUrl")}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <InputLabel sx={{ mb: 1 }}>Video Dosyası Yükle (.mp4)</InputLabel>
                        <input
                          type="file"
                          accept="video/mp4"
                          onChange={handleChange("videoFile")}
                          className="form-control"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="success"
                          size="large"
                          fullWidth
                        >
                          Videoyu Kaydet
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default InstructorVideoCreate;
