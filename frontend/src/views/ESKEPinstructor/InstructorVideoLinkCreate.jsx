import { useState } from "react";
import axios from "axios";
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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";

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
      <section className="pt-5 pb-5 bg-light min-vh-100">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <Card className="shadow-sm rounded-4">
                <CardContent>
                  {/* Başlık ve Renkli İkon */}
                  <Box className="d-flex align-items-center mb-4">
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 22,
                        boxShadow: "0 4px 10px rgba(0, 114, 255, 0.3)",
                        marginRight: 2,
                      }}
                    >
                      <i className="bi bi-link-45deg"></i>
                    </Box>
                    <Typography variant="h5" className="fw-bold text-primary">
                      Video Bağlantısı Ekle
                    </Typography>
                  </Box>

                  {/* Form */}
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
                            borderRadius: "6px",
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
                          label="Video Bağlantısı (YouTube, Vimeo vb.)"
                          fullWidth
                          value={formData.videoUrl}
                          onChange={handleChange("videoUrl")}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          sx={{ py: 1.5, fontWeight: "bold" }}
                        >
                          Bağlantıyı Kaydet
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

export default InstructorVideoLinkCreate;
