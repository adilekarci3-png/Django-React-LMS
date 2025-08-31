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
  Divider,
} from "@mui/material";
import Swal from "sweetalert2";

import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import Sidebar from "./Partials/Sidebar";


function ESKEPEgitmenVideoCreate() {
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
        headers: { "Content-Type": "multipart/form-data" },
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
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            
            {/* Sol Sidebar */}
            <div className="col-lg-3 mb-4 mb-lg-0">
              <Sidebar />
            </div>

            {/* Sağ Gövde */}
            <div className="col-lg-9">
              <Card className="shadow-lg border-0 rounded-4">
                <CardContent sx={{ p: 4 }}>
                  {/* Başlık */}
                  <Box className="d-flex align-items-center mb-3">
                    <Box
                      sx={{
                        background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
                        width: 55,
                        height: 55,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 26,
                        boxShadow: "0 4px 12px rgba(255,65,108,0.35)",
                        mr: 2,
                      }}
                    >
                      <i className="bi bi-camera-video-fill"></i>
                    </Box>
                    <Box>
                      <Typography variant="h5" className="fw-bold text-primary">
                        Eğitmen Video Ekle
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Yeni video yükleyebilir veya YouTube bağlantısı ekleyebilirsiniz.
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      {/* Başlık */}
                      <Grid item xs={12}>
                        <TextField
                          label="Video Başlığı"
                          fullWidth
                          value={formData.title}
                          onChange={handleChange("title")}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>

                      {/* Açıklama */}
                      <Grid item xs={12}>
                        <TextField
                          label="Açıklama"
                          fullWidth
                          multiline
                          rows={5}
                          value={formData.description}
                          onChange={handleChange("description")}
                          variant="outlined"
                        />
                      </Grid>

                      {/* URL */}
                      <Grid item xs={12}>
                        <TextField
                          label="YouTube / Video URL"
                          fullWidth
                          value={formData.videoUrl}
                          onChange={handleChange("videoUrl")}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>

                      {/* Dosya Yükleme */}
                      <Grid item xs={12}>
                        <InputLabel sx={{ mb: 1, fontWeight: "500" }}>
                          Video Dosyası Yükle (.mp4)
                        </InputLabel>
                        <input
                          type="file"
                          accept="video/mp4"
                          onChange={handleChange("videoFile")}
                          className="form-control"
                        />
                      </Grid>

                      {/* Kaydet Butonu */}
                      <Grid item xs={12} className="d-flex justify-content-end">
                        <Button
                          type="submit"
                          variant="contained"
                          color="success"
                          size="large"
                        >
                          💾 Videoyu Kaydet
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

export default ESKEPEgitmenVideoCreate;
