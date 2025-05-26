// GÜNCELLENMİŞ VE HATASIZ MODERN KAYIT FORMU

import { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Box,
} from "@mui/material";

import Swal from "sweetalert2";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

function HafizBilgiCreate() {
  const [state, setState] = useState({
    adiSoyadi: "",
    cepTel: "",
    meslek: "",
    cinsiyet: "",
    adresil: "",
    adresilce: "",
    kursAdi: "",
    kursil: "",
    yil: 0,
    email: "",
    ckEdtitorData: "",
  });

  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [meslekler, setMeslekler] = useState([]);
  const [yillar, setYillar] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/v1/job/list/").then((res) => setMeslekler(res.data));
    axios.get("http://127.0.0.1:8000/api/v1/city/list/").then((res) => setIller(res.data));
    axios.get("http://127.0.0.1:8000/api/v1/district/list/").then((res) => setIlceler(res.data));

    const now = new Date().getFullYear();
    const years = Array.from({ length: now - 1930 + 1 }, (_, i) => 1930 + i);
    setYillar(years);
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setState((prev) => ({ ...prev, [field]: value }));

    if (field === "adresil") {
      axios.get("http://127.0.0.1:8000/api/v1/district/list/").then((res) => {
        const filtered = res.data.filter((d) => d.city?.id === value);
        setIlceler(filtered);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formdata = new FormData();
    Object.entries(state).forEach(([key, value]) => formdata.append(key, value));

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/hafizbilgi/create/", formdata);
      Swal.fire({ icon: "success", title: "Bilgileriniz Başarıyla Kaydedildi" });
    } catch {
      Swal.fire({ icon: "error", title: "Kayıt sırasında hata oluştu." });
    }
  };

  return (
    <>
      <BaseHeader />
      <Box py={5} px={2}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Card elevation={4}>
              <CardHeader
                title={<Typography variant="h6">Hafızlık Bilgi Sistemi Kayıt Formu</Typography>}
                sx={{ backgroundColor: "#1976d2", color: "white" }}
              />
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Adı Soyadı"
                        value={state.adiSoyadi}
                        onChange={handleChange("adiSoyadi")}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Cep Telefonu"
                        value={state.cepTel}
                        onChange={handleChange("cepTel")}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InputLabel>Meslek</InputLabel>
                      <Select
                        value={state.meslek}
                        onChange={handleChange("meslek")}
                        fullWidth
                        size="small"
                      >
                        {meslekler.map((m) => (
                          <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InputLabel>Cinsiyet</InputLabel>
                      <Select
                        value={state.cinsiyet}
                        onChange={handleChange("cinsiyet")}
                        fullWidth
                        size="small"
                      >
                        <MenuItem value="Erkek">Erkek</MenuItem>
                        <MenuItem value="Kadın">Kadın</MenuItem>
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InputLabel>İl</InputLabel>
                      <Select
                        value={state.adresil}
                        onChange={handleChange("adresil")}
                        fullWidth
                        size="small"
                      >
                        {iller.map((il) => (
                          <MenuItem key={il.id} value={il.id}>{il.name}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InputLabel>İlçe</InputLabel>
                      <Select
                        value={state.adresilce}
                        onChange={handleChange("adresilce")}
                        fullWidth
                        size="small"
                      >
                        {ilceler.map((ilce) => (
                          <MenuItem key={ilce.id} value={ilce.id}>{ilce.name}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Kurs Adı"
                        value={state.kursAdi}
                        onChange={handleChange("kursAdi")}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InputLabel>Kurs İli</InputLabel>
                      <Select
                        value={state.kursil}
                        onChange={handleChange("kursil")}
                        fullWidth
                        size="small"
                      >
                        {iller.map((il) => (
                          <MenuItem key={il.id} value={il.id}>{il.name}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InputLabel>Bitirme Yılı</InputLabel>
                      <Select
                        value={state.yil}
                        onChange={handleChange("yil")}
                        fullWidth
                        size="small"
                      >
                        {yillar.map((y) => (
                          <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="E-Posta"
                        value={state.email}
                        onChange={handleChange("email")}
                        fullWidth
                        size="small"
                        type="email"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputLabel>Açıklama</InputLabel>
                      <CKEditor
                        editor={ClassicEditor}
                        data={state.ckEdtitorData}
                        onChange={(_, editor) =>
                          setState((prev) => ({ ...prev, ckEdtitorData: editor.getData() }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary" fullWidth>
                        Kaydet
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <BaseFooter />
    </>
  );
}

export default HafizBilgiCreate;
