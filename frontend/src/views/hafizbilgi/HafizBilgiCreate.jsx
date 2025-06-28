import ErrorIcon from "@mui/icons-material/ErrorOutline";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useReactToPrint } from "react-to-print";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Swal from "sweetalert2";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";

function HafizBilgiCreate() {
  const navigate = useNavigate();
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [activeStep, setActiveStep] = useState(0);
  const [ckeditorData, setCkeditorData] = useState("");
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [meslekler, setMeslekler] = useState([]);
  const [yillar, setYillar] = useState([]);

  const steps = [
    "Kişisel Bilgiler",
    "İletişim ve Kurs",
    "Hoca ve Arkadaş",
    "Ek Bilgiler",
  ];

  const formik = useFormik({
    initialValues: {
      full_name: "",
      tcno: "",
      gender: "",
      meslek: "",
      birth_date: "",
      email: "",
      ceptel: "",
      evtel: "",
      istel: "",
      adres: "",
      kurs_adi: "",
      adresIl: "",
      adresIlce: "",
      bitirme_yili: "",
      hoca_adi: "",
      hoca_soyadi: "",
      hoca_ceptel: "",
      arkadas_adi: "",
      arkadas_soyadi: "",
      arkadas_ceptel: "",
      referans_tc: "",
      roles:1
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Ad soyad gerekli!"),
      tcno: Yup.string()
        .length(11, "11 haneli olmalı!")
        .required("TC gerekli!"),
      gender: Yup.string().required("Cinsiyet Giriniz!"),
      meslek: Yup.string().required("Meslek Seçiniz!"),
      birth_date: Yup.date().required("Doğum Günü Giriniz!"),
      ceptel: Yup.string().required("Cep Telefonu Giriniz!"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (selectedFile) formData.append("image", selectedFile);
      formData.append("extra_notes", ckeditorData);

      try {
        await axios.post("http://localhost:8000/api/v1/hafizbilgi/create/", formData);
        Swal.fire("Başarılı", "Kayıt oluşturuldu", "success");
        navigate("hafizbilgi/list/");
      } catch {
        Swal.fire("Hata", "Kayıt başarısız", "error");
      }
    },
  });

  useEffect(() => {
    axios.get("http://localhost:8000/api/v1/job/list/").then((res) => {
      console.log("Gelen meslek verisi:", res.data);
      const jobs = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setMeslekler(jobs);
    });

    axios.get("http://localhost:8000/api/v1/city/list/").then((res) => {
      const cities = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setIller(cities); // sadece dizi ise set et
    });

    axios.get("http://localhost:8000/api/v1/district/list/").then((res) => {
      const districts = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setIlceler(districts);
    });

    const now = new Date().getFullYear();
    setYillar(Array.from({ length: now - 1930 + 1 }, (_, i) => now - i));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Şehir değişince ilçeyi sıfırla
    if (name === "adresIl") {
      setFormData((prev) => ({
        ...prev,
        adresIl: value,
        adresIlce: "", // ilçe sıfırlanır
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const getFilteredDistricts = () => {
    if (!formData.adresIl) return [];
    return ilceler.filter((ilce) => ilce.city === Number(formData.adresIl));
  };

  const stepFields = {
    0: ["full_name", "tcno", "gender", "meslek", "birth_date"],
    1: [
      "email",
      "ceptel",
      "adres",
      "adresIl",
      "adresIlce",
      "kurs_adi",
      "bitirme_yili",
    ],
    2: ["hoca_adi", "arkadas_adi"],
    3: [], // CKEditor alanı formik içinde değilse validasyonu yok
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    const currentStepFields = stepFields[activeStep] || [];

    const stepErrors = Object.keys(errors).filter((key) =>
      currentStepFields.includes(key)
    );

    if (stepErrors.length > 0) {
      formik.setTouched(
        Object.fromEntries(stepErrors.map((field) => [field, true]))
      );
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const renderKisiselBilgiler = () => (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={12} md={6}>
        <TextField
          name="full_name"
          label="Ad Soyad"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="tcno"
          label="TC Kimlik No"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Cinsiyet</InputLabel>
          <Select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
          >
            <MenuItem value="Erkek">Erkek</MenuItem>
            <MenuItem value="Kadın">Kadın</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Meslek</InputLabel>
          <Select
            name="meslek"
            value={formData.meslek || ""}
            onChange={handleChange}
          >
            {meslekler.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="birth_date"
          label="Doğum Tarihi"
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Button
          component="label"
          variant="outlined"
          fullWidth
          startIcon={<PhotoCamera />}
        >
          Dosya Seç
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {selectedFile && (
          <Typography variant="caption" mt={1}>
            {selectedFile.name}
          </Typography>
        )}
      </Grid>
    </Grid>
  );

  const renderIletisimKurs = () => (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={12} md={6}>
        <TextField
          name="email"
          label="E-Posta"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="ceptel"
          label="Cep Telefonu"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="evtel"
          label="Ev Telefonu"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="istel"
          label="İş Telefonu"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="adres"
          label="Adres"
          multiline
          rows={2}
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="kurs_adi"
          label="Kurs Adı"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Kurs İli</InputLabel>
          <Select
            name="adresIl"
            value={formData.adresIl || ""}
            onChange={handleChange}
          >
            {Array.isArray(iller) &&
              iller.map((il) => (
                <MenuItem key={il.id} value={il.id}>
                  {il.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>İlçe</InputLabel>
          <Select
            name="adresIlce"
            value={formData.adresIlce || ""}
            onChange={handleChange}
            disabled={!formData.adresIl}
          >
            {getFilteredDistricts().map((ilce) => (
              <MenuItem key={ilce.id} value={ilce.id}>
                {ilce.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Bitirme Yılı</InputLabel>
          <Select
            name="bitirme_yili"
            value={formData.bitirme_yili || ""}
            onChange={handleChange}
          >
            {yillar.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderHocaArkadas = () => (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={12} md={6}>
        <TextField
          name="hoca_adi"
          label="Hoca Adı"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="hoca_soyadi"
          label="Hoca Soyadı"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="hoca_ceptel"
          label="Hoca Cep Tel"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="arkadas_adi"
          label="Arkadaş Adı"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="arkadas_soyadi"
          label="Arkadaş Soyadı"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name="arkadas_ceptel"
          label="Arkadaş Cep Tel"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="referans_tc"
          label="Referans TC No"
          fullWidth
          size="small"
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  const renderEkBilgiler = () => (
    <Box mt={2}>
      <Typography variant="subtitle1" mb={1}>
        Ek Açıklamalar
      </Typography>
      <CKEditor
        editor={ClassicEditor}
        data={ckeditorData}
        onChange={(event, editor) => setCkeditorData(editor.getData())}
      />
    </Box>
  );

  const renderStep = () => {
    const f = formik;
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ad Soyad"
                {...f.getFieldProps("full_name")}
                fullWidth
                size="small"
                error={!!f.errors.full_name && f.touched.full_name}
                helperText={f.touched.full_name && f.errors.full_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="TC Kimlik No"
                {...f.getFieldProps("tcno")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Cinsiyet</InputLabel>
                <Select {...f.getFieldProps("gender")} value={f.values.gender}>
                  <MenuItem value="Erkek">Erkek</MenuItem>
                  <MenuItem value="Kadın">Kadın</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Meslek</InputLabel>
                <Select {...f.getFieldProps("meslek")} value={f.values.meslek}>
                  {meslekler.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Doğum Tarihi"
                type="date"
                {...f.getFieldProps("birth_date")}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Fotoğraf Yükle
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {selectedFile && <Typography>{selectedFile.name}</Typography>}
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Cep Tel"
                {...f.getFieldProps("ceptel")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ev Tel"
                {...f.getFieldProps("evtel")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Adres"
                multiline
                rows={2}
                {...f.getFieldProps("adres")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>İl</InputLabel>
                <Select
                  {...f.getFieldProps("adresIl")}
                  value={f.values.adresIl}
                  onChange={(e) => {
                    f.setFieldValue("adresIl", e.target.value);
                    f.setFieldValue("adresIlce", "");
                  }}
                >
                  {iller.map((il) => (
                    <MenuItem key={il.id} value={il.id}>
                      {il.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>İlçe</InputLabel>
                <Select
                  {...f.getFieldProps("adresIlce")}
                  value={f.values.adresIlce}
                  disabled={!f.values.adresIl}
                >
                  {getFilteredDistricts().map((ilce) => (
                    <MenuItem key={ilce.id} value={ilce.id}>
                      {ilce.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Hoca Adı"
                {...f.getFieldProps("hoca_adi")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Hoca Soyadı"
                {...f.getFieldProps("hoca_soyadi")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Arkadaş Adı"
                {...f.getFieldProps("arkadas_adi")}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Arkadaş Soyadı"
                {...f.getFieldProps("arkadas_soyadi")}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Box mt={2}>
            <Typography mb={1}>Ek Açıklamalar</Typography>
            <CKEditor
              editor={ClassicEditor}
              data={ckeditorData}
              onChange={(e, editor) => setCkeditorData(editor.getData())}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  {
    Object.keys(formik.errors).length > 0 && (
      <Box
        mt={3}
        p={2}
        bgcolor="#fff3cd"
        border="1px solid #ffeeba"
        borderRadius={2}
      >
        <Typography variant="subtitle1" color="error" mb={1}>
          Lütfen aşağıdaki hataları düzeltin:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#b94a48" }}>
          {Object.entries(formik.errors).map(([field, errorMsg]) => (
            <li key={field}>
              <ErrorIcon
                fontSize="small"
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />
              {errorMsg}
            </li>
          ))}
        </ul>
      </Box>
    );
  }

  return (
    <>
      <HBSBaseHeader />
      <Container sx={{ py: 4, maxWidth: "1000px", mx: "auto" }}>
        <Card ref={printRef}>
          <CardHeader title="Hafızlık Bilgi Kayıt Formu" />
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <form onSubmit={formik.handleSubmit}>
              <Box mt={4}>{renderStep()}</Box>

              {/* ✅ HATA LİSTESİ */}
              {Object.keys(formik.errors).length > 0 && (
                <Box
                  mt={3}
                  p={2}
                  bgcolor="#fff3cd"
                  border="1px solid #ffeeba"
                  borderRadius={2}
                >
                  <Typography variant="subtitle1" color="error" mb={1}>
                    Lütfen aşağıdaki hataları düzeltin:
                  </Typography>
                  <ul
                    style={{
                      paddingLeft: "1.5rem",
                      color: "#b94a48",
                      margin: 0,
                    }}
                  >
                    {Object.entries(formik.errors).map(([field, errorMsg]) => (
                      <li key={field}>
                        <ErrorIcon
                          fontSize="small"
                          style={{ marginRight: 6, verticalAlign: "middle" }}
                        />
                        {errorMsg}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  disabled={activeStep === 0}
                >
                  Geri
                </Button>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" onClick={handlePrint}>
                    PDF Yazdır
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Button type="submit" variant="contained">
                      Kaydet
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext}>
                      İleri
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
      <HBSBaseFooter />
    </>
  );
}

export default HafizBilgiCreate;
