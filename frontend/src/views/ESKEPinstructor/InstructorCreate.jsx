import { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
} from "@mui/material";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function InstructorCreate() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    city: "",
    district: "",
    branch: "",
    educationLevel: "",
    description: "",
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editorData, setEditorData] = useState("");

  useEffect(() => {
    fetchCities();
    fetchBranches();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/city/list/");
      setCities(res.data);
    } catch (error) {
      console.error("Şehir verisi alınamadı", error);
    }
  };

  const fetchDistricts = async (cityId) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/district/list/");
      const filtered = res.data.filter(d => d.city?.id === cityId);
      setDistricts(filtered);
    } catch (error) {
      console.error("İlçeler alınamadı", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/branch/list/");
      setBranches(res.data);
    } catch (error) {
      console.error("Branşlar alınamadı", error);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    if (field === "city") fetchDistricts(value);
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditorData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, description: editorData };

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/instructor/create/", payload);
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
            <Sidebar />

            <div className="col-lg-10 col-md-8 col-12">
              <form onSubmit={handleSubmit}>
                <Box className="card shadow-sm p-4">
                  <Typography variant="h5" className="mb-4 text-primary fw-bold">
                    Eğitmen Oluştur
                  </Typography>

                  <Box className="row mb-3">
                    <div className="col-md-6">
                      <TextField
                        label="Ad Soyad"
                        value={formData.fullName}
                        onChange={handleChange("fullName")}
                        fullWidth
                        size="small"
                      />
                    </div>
                    <div className="col-md-6">
                      <TextField
                        label="Telefon"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        fullWidth
                        size="small"
                      />
                    </div>
                  </Box>

                  <Box className="row mb-3">
                    <div className="col-md-6">
                      <TextField
                        label="E-Posta"
                        value={formData.email}
                        onChange={handleChange("email")}
                        fullWidth
                        size="small"
                        type="email"
                      />
                    </div>
                    <div className="col-md-6">
                      <FormControl fullWidth size="small">
                        <InputLabel>Cinsiyet</InputLabel>
                        <Select value={formData.gender} onChange={handleChange("gender")}>
                          <MenuItem value="Erkek">Erkek</MenuItem>
                          <MenuItem value="Kadın">Kadın</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </Box>

                  <Box className="row mb-3">
                    <div className="col-md-6">
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
                    </div>
                    <div className="col-md-6">
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
                    </div>
                  </Box>

                  <Box className="row mb-3">
                    <div className="col-md-6">
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
                    </div>
                    <div className="col-md-6">
                      <TextField
                        label="Eğitim Seviyesi"
                        value={formData.educationLevel}
                        onChange={handleChange("educationLevel")}
                        fullWidth
                        size="small"
                      />
                    </div>
                  </Box>

                  <Box className="mb-4">
                    <InputLabel className="mb-2">Açıklama</InputLabel>
                    <CKEditor editor={ClassicEditor} data={editorData} onChange={handleEditorChange} />
                  </Box>

                  <Box className="d-grid">
                    <Button type="submit" variant="contained" color="primary" size="large">
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

export default InstructorCreate;
