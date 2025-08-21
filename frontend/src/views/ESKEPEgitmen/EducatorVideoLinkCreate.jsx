import { useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
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

// 🔄 Markdown Editor
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

const mdParser = new MarkdownIt();

function EducatorVideoLinkCreate() {
  const { id } = useParams(); // id string gelir
  const instructorId = parseInt(id); // sayıya çevir

  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    description: "",
    instructor_id: instructorId,
  });

  const api = useAxios();
  const userData = useUserData(); // sadece user_id vs. gerekiyorsa
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleEditorChange = ({ text }) => {
    setFormData({ ...formData, description: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.videoUrl) {
      Swal.fire("Uyarı", "Tüm alanları doldurmanız gerekmektedir.", "warning");
      return;
    }

    try {
      setLoading(true);
      await api.post("/educator/video/link/", formData);
      Swal.fire("Başarılı", "Video bağlantısı başarıyla kaydedildi!", "success");

      // instructor_id kaybolmaması için tekrar ekleniyor
      setFormData({
        title: "",
        videoUrl: "",
        description: "",
        instructor_id: instructorId,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Hata", "Bağlantı kaydedilemedi", "error");
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
                        background: "#90caf9", // pastel mavi
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
                      Video Bağlantısı Ekle
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
                            backgroundColor: "#64b5f6", // mat mavi
                            color: "#fff",
                            '&:hover': {
                              backgroundColor: "#42a5f5",
                            },
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

export default EducatorVideoLinkCreate;
