// src/views/AkademiEgitmen/EducatorYouTubeVideoCreate.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import {
  TextField,
  Button,
  InputLabel,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
} from "@mui/material";
import Swal from "sweetalert2";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";

import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();

function EducatorYouTubeVideoCreate() {
  const api = useAxios();
  const { id } = useParams(); // opsiyonel: koordinator başka eğitmen adına açarsa Educator PK
  const educatorId = Number.isFinite(Number(id)) ? Number(id) : null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    description: "",
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleEditorChange = ({ text }) => {
    setFormData({ ...formData, description: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.videoUrl?.trim()) {
      Swal.fire("Uyarı", "Başlık ve Video Linki zorunludur.", "warning");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        videoUrl: formData.videoUrl,      // model alanı camelCase
        description: formData.description,
      };
      // Koordinatör akışı: route ile Educator PK geldiyse gönder
      if (educatorId) payload.instructor_id = educatorId;

      await api.post("/educator/video/link/create/", payload);
      Swal.fire("Başarılı", "Video bağlantısı kaydedildi!", "success");
      setFormData({ title: "", videoUrl: "", description: "" });
    } catch (error) {
      console.error(error);
      const data = error?.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
          : "Bağlantı kaydedilemedi";
      Swal.fire("Hata", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light min-vh-100">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <Card className="shadow-sm rounded-4">
                <CardContent sx={{ background: "#f9f9f9", borderRadius: 2 }}>
                  <Box className="d-flex align-items-center mb-4">
                    <Box
                      sx={{
                        background: "#90caf9",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 22,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        marginRight: 2,
                      }}
                    >
                      <i className="bi bi-link-45deg"></i>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      YouTube Video Bağlantısı Ekle
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
                          required
                          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <InputLabel sx={{ mb: 1, fontWeight: "bold", color: "#333" }}>
                          Açıklama (Markdown)
                        </InputLabel>
                        <Box
                          sx={{
                            border: "1px solid #cfd8dc",
                            borderRadius: "8px",
                            padding: "8px",
                            background: "#ffffff",
                          }}
                        >
                          <MdEditor
                            value={formData.description}
                            style={{ height: "150px", borderRadius: "6px" }}
                            renderHTML={(text) => mdParser.render(text)}
                            onChange={handleEditorChange}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Video Linki (YouTube, Vimeo vb.)"
                          fullWidth
                          value={formData.videoUrl}
                          onChange={handleChange("videoUrl")}
                          size="small"
                          required
                          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            fontWeight: "bold",
                            backgroundColor: "#64b5f6",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#42a5f5" },
                            borderRadius: 2,
                            boxShadow: "0 2px 6px rgba(100, 181, 246, 0.3)",
                          }}
                        >
                          {loading ? "Kaydediliyor..." : "Bağlantıyı Kaydet"}
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

export default EducatorYouTubeVideoCreate;
