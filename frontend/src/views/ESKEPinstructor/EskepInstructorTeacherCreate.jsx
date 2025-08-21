import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  InputLabel,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  Grid,
} from "@mui/material";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

const mdParser = new MarkdownIt();

function EskepInstructorTeacherCreate() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    gender: "",
    city: "",
    district: "",
    branch: "",
    education_level: "",
    description: "",
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const api = useAxios();
  const userData = useUserData(); // örneğin sadece user_id lazımsa buradan alınabilir

  useEffect(() => {
    fetchCities();
    fetchBranches();
    fetchEducationLevels();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await api.get("/city/list/");
      setCities(res.data);
    } catch (error) {
      console.error("Şehir verisi alınamadı", error);
    }
  };

  const fetchDistricts = async (cityId) => {
    try {
      const res = await api.get("/district/list/");
      const filtered = res.data.filter((d) => d.city?.id === cityId);
      setDistricts(filtered);
    } catch (error) {
      console.error("İlçeler alınamadı", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get("/branch/list/");
      setBranches(res.data);
    } catch (error) {
      console.error("Branşlar alınamadı", error);
    }
  };

  const fetchEducationLevels = async () => {
    try {
      const res = await api.get("/education-level/list/");
      setEducationLevels(res.data);
    } catch (error) {
      console.error("Eğitim seviyeleri alınamadı", error);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    if (field === "city") fetchDistricts(value);
  };

  const handleEditorChange = ({ text }) => {
    setFormData({ ...formData, description: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/eskepinstructor/create-educator/", formData);
      Swal.fire({ icon: "success", title: "Eğitmen başarıyla oluşturuldu" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Kayıt sırasında hata oluştu." });
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <form onSubmit={handleSubmit}>
                <Box className="card shadow-sm p-4" style={{ borderRadius: "16px" }}>
                  <Typography
                    variant="h5"
                    className="mb-4 d-flex align-items-center text-primary fw-bold"
                  >
                    <i className="fas fa-user-plus me-2 text-success"></i> Yeni Eğitmen Oluştur
                  </Typography>

                  <Grid container spacing={2} className="mb-3">
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Ad Soyad"
                        value={formData.full_name}
                        onChange={handleChange("full_name")}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Telefon"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="E-Posta"
                        value={formData.email}
                        onChange={handleChange("email")}
                        fullWidth
                        size="small"
                        type="email"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Cinsiyet</InputLabel>
                        <Select value={formData.gender} onChange={handleChange("gender")}>
                          <MenuItem value="Erkek">Erkek</MenuItem>
                          <MenuItem value="Kadın">Kadın</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Şehir</InputLabel>
                        <Select value={formData.city} onChange={handleChange("city")}>
                          {cities.map((city) => (
                            <MenuItem key={city.id} value={city.id}>
                              {city.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>İlçe</InputLabel>
                        <Select value={formData.district} onChange={handleChange("district")}>
                          {districts.map((district) => (
                            <MenuItem key={district.id} value={district.id}>
                              {district.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Branş</InputLabel>
                        <Select value={formData.branch} onChange={handleChange("branch")}>
                          {branches.map((b) => (
                            <MenuItem key={b.id} value={b.id}>
                              {b.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Eğitim Seviyesi</InputLabel>
                        <Select
                          value={formData.education_level}
                          onChange={handleChange("education_level")}
                        >
                          {educationLevels.map((level) => (
                            <MenuItem key={level.id} value={level.id}>
                              {level.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <InputLabel className="mb-2 text-dark fw-semibold">Açıklama</InputLabel>
                      <MdEditor
                        style={{ height: "200px", borderRadius: "8px" }}
                        renderHTML={(text) => mdParser.render(text)}
                        value={formData.description}
                        onChange={handleEditorChange}
                      />
                    </Grid>
                  </Grid>

                  <Box className="d-grid mt-4">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<i className="fas fa-save"></i>}
                      style={{ borderRadius: "30px", fontWeight: "bold", padding: "10px 30px" }}
                    >
                      Eğitmeni Kaydet
                    </Button>
                  </Box>
                </Box>
              </form>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default EskepInstructorTeacherCreate;
