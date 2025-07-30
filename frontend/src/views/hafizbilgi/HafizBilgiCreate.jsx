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
import { API_BASE_URL } from "../../utils/constants";
import "../hafizbilgi/css/print.css" 

function HafizBilgiCreate() {
  const navigate = useNavigate();
  const printRef = useRef();
  const handlePrint = useReactToPrint({
  content: () => {
    console.log("printRef.current:", printRef.current);
    return printRef.current;
  }
});

  const [activeStep, setActiveStep] = useState(0);
  const [ckeditorData, setCkeditorData] = useState("");
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

  const validateEmailUnique = async (e) => {
    const value = e.target.value;
    if (!value) return;

    try {
      const res = await axios.post(`${API_BASE_URL}hafizbilgi/check-email/`, {
        email: value,
      });
      if (res.data.exists) {
        formik.setFieldError(
          "email",
          "Girdiğiniz e-posta başka bir hafız tarafından kullanılıyor. Yeni e-posta adresi yazınız"
        );
      }
    } catch (err) {
      console.error("E-posta kontrol hatası", err);
    }
  };

  const validateCepTelUnique = async (e) => {
    const value = e.target.value;
    if (!value) return;

    try {
      const res = await axios.post(`${API_BASE_URL}hafizbilgi/check-ceptel/`, {
        ceptel: value,
      });
      if (res.data.exists) {
        formik.setFieldError(
          "ceptel",
          "Girdiğiniz cep telefonu başka bir hafız tarafından kullanılıyor.Başka bir cep telefonu giriniz"
        );
      }
    } catch (err) {
      console.error("Cep tel kontrol hatası", err);
    }
  };
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
      roles: 1,
      extra_notes: "",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Ad soyad gerekli!"),
      tcno: Yup.string()
        .length(11, "11 haneli olmalı!")
        .required("TC gerekli!"),
      gender: Yup.string().required("Cinsiyet giriniz!"),
      meslek: Yup.string().required("Meslek seçiniz!"),
      birth_date: Yup.date().required("Doğum tarihi giriniz!"),
      ceptel: Yup.string().required("Cep telefonu giriniz!"),      
    }),

    onSubmit: async (values, { setFieldError }) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (selectedFile) formData.append("image", selectedFile);
      debugger;
      // if(values.extra_notes==null && values.extra_notes==undefined)
      //   return null
      // else
      //   {formData.append("extra_notes", ckeditorData);}

      try {
        await axios.post(`${API_BASE_URL}hafizbilgi/create/`, formData);
        Swal.fire("Başarılı", "Kayıt oluşturuldu", "success");
        //navigate("/hafizbilgi/list/");
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          (error.response.data.ceptel || error.response.data.email)
        ) {
          let cepError = "";
          let emailError = "";

          if (error.response.data.ceptel) {
            cepError = error.response.data.ceptel.join(" ");
            setFieldError("ceptel", cepError);
          }

          if (error.response.data.email) {
            emailError = error.response.data.email.join(" ");
            setFieldError("email", emailError);
          }

          // Swal.fire(
          //   "Hata",
          //   "E-posta veya cep telefonu başka bir hafız tarafından kullanılıyor.",
          //   "error"
          // );
        } else {
          Swal.fire("Hata", "Kayıt başarısız", "error");
        }
      }
    },
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}job/list/`).then((res) => {
      const jobs = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setMeslekler(jobs);
    });

    axios.get(`${API_BASE_URL}city/list/`).then((res) => {
      const cities = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setIller(cities);
    });

    axios.get(`${API_BASE_URL}district/list/`).then((res) => {
      const districts = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setIlceler(districts);
    });

    const now = new Date().getFullYear();
    setYillar(Array.from({ length: now - 1930 + 1 }, (_, i) => now - i));
  }, []);

  const getFilteredDistricts = () => {
    debugger;
    if (!formik.values.adresIl) return [];
    return ilceler.filter(
      (ilce) => ilce.city.id === Number(formik.values.adresIl)
    );
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    const stepFields = {
      0: ["full_name", "tcno", "gender", "meslek", "birth_date"],
      1: ["email", "ceptel", "adres", "adresIl", "adresIlce"],
      2: ["hoca_adi", "arkadas_adi","extra_notes"],
      3: [],
    };
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

  const renderStepContent = () => {
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
                label="E-Posta"
                {...f.getFieldProps("email")}
                fullWidth
                size="small"
                onBlur={(e) => {
                  f.handleBlur(e);
                  validateEmailUnique(e);
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Cep Tel"
                {...f.getFieldProps("ceptel")}
                fullWidth
                size="small"
                onBlur={(e) => {
                  f.handleBlur(e);
                  validateCepTelUnique(e);
                }}
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
            <Grid item xs={12} md={12}>
               <CKEditor
               label="Ek Açıklamalar"
                    editor={ClassicEditor}
                    data={formik.values.extra_notes}
                    onChange={(e, editor) =>
                      formik.setFieldValue("extra_notes", editor.getData())
                    }
                  />
            </Grid>
          </Grid>
        );
      case 3:
        return null;
      default:
        return null;
    }
  };

  return (
   <>
<HBSBaseHeader />

<Container sx={{ py: 4, maxWidth: "1000px", mx: "auto" }}>
  <Card> {/* sadece bu ref ile yazdırılacak alan */}
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
        <Box mt={4}>{renderStepContent()}</Box>

        {Object.keys(formik.errors).length > 0 && (
          <Box
            mt={3}
            p={2}
            bgcolor="#fff3cd"
            border="1px solid #ffeeba"
            borderRadius={2}
          >
            <Typography variant="subtitle1" color="error" mb={1}>
              Lütfen hataları düzeltin:
            </Typography>
            <ul style={{ paddingLeft: "1.5rem", color: "#b94a48", margin: 0 }}>
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
            type="button"
            onClick={() => setActiveStep((prev) => prev - 1)}
            disabled={activeStep === 0}
          >
            Geri
          </Button>
          <Box display="flex" gap={2}>
            {/* <Button variant="outlined" onClick={handlePrint}>
              PDF Yazdır
            </Button> */}
            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained">
                Kaydet
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
              >
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
