import React, { useState, useEffect, useRef, useMemo } from "react";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PrintIcon from "@mui/icons-material/Print";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

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
  Avatar,
  Paper,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import { API_BASE_TEST_URL } from "../../utils/constants";
import "../hafizbilgi/css/print.css";

export default function HafizBilgiCreate() {
  const printRef = useRef(null);
  const mdChangeRef = useRef(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  // Markdown parser
  const mdParser = useMemo(() => new MarkdownIt({ linkify: true, breaks: true }), []);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [meslekler, setMeslekler] = useState([]);
  const [yillar, setYillar] = useState([]);

  const steps = ["Kişisel Bilgiler", "İletişim & Adres", "Hoca & Arkadaş", "Özet"];

  // Uniq checks
  const validateEmailUnique = async (e) => {
    const value = e.target.value?.trim();
    if (!value) return;
    try {
      const res = await axios.post(`${API_BASE_TEST_URL}hafizbilgi/check-email/`, { email: value });
      if (res.data.exists) {
        formik.setFieldError("email", "Bu e-posta zaten kayıtlı. Lütfen farklı bir e-posta girin.");
      }
    } catch (err) {
      console.error("E-posta kontrol hatası", err);
    }
  };
  const validateCepTelUnique = async (e) => {
    const value = e.target.value?.trim();
    if (!value) return;
    try {
      const res = await axios.post(`${API_BASE_TEST_URL}hafizbilgi/check-ceptel/`, { ceptel: value });
      if (res.data.exists) {
        formik.setFieldError("ceptel", "Bu cep telefonu zaten kayıtlı. Lütfen farklı bir numara girin.");
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
      adresIl: "",
      adresIlce: "",
      kurs_adi: "",
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
      full_name: Yup.string(), // required değil
      tcno: Yup.string(),      // tc no validasyonu kapalı
      gender: Yup.string().required("Cinsiyet gerekli"),
      meslek: Yup.string().required("Meslek gerekli"),
      birth_date: Yup.date().required("Doğum tarihi gerekli"),
      ceptel: Yup.string().required("Cep telefonu gerekli"),
      email: Yup.string().email("Geçersiz e-posta"),
      adresIl: Yup.mixed().required("İl seçiniz"),
      adresIlce: Yup.mixed().required("İlçe seçiniz"),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    validateOnMount: false,
    onSubmit: async (values, { setFieldError, resetForm }) => {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.append(k, v ?? ""));
      if (selectedFile) formData.append("image", selectedFile);

      try {
        await axios.post(`${API_BASE_TEST_URL}hafizbilgi/create/`, formData);
        Swal.fire("Başarılı", "Kayıt oluşturuldu", "success");
        resetForm();
        setSelectedFile(null);
        setActiveStep(0);
      } catch (error) {
        const data = error?.response?.data;
        if (data?.ceptel || data?.email) {
          if (data.ceptel) setFieldError("ceptel", data.ceptel.join(" "));
          if (data.email) setFieldError("email", data.email.join(" "));
        } else {
          Swal.fire("Hata", "Kayıt başarısız", "error");
        }
      }
    },
  });

  // Sözlük verileri
  useEffect(() => {
    axios.get(`${API_BASE_TEST_URL}job/list/`).then((res) => {
      const jobs = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setMeslekler(jobs);
    });
    axios.get(`${API_BASE_TEST_URL}city/list/`).then((res) => {
      const cities = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setIller(cities);
    });
    axios.get(`${API_BASE_TEST_URL}district/list/`).then((res) => {
      const districts = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setIlceler(districts);
    });
    const now = new Date().getFullYear();
    setYillar(Array.from({ length: now - 1930 + 1 }, (_, i) => now - i));
  }, []);

  const getFilteredDistricts = () => {
    if (!formik.values.adresIl) return [];
    return ilceler.filter((ilce) => ilce.city.id === Number(formik.values.adresIl));
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    const stepFields = {
      0: ["gender", "meslek", "birth_date"], // full_name & tcno zorunlu değil
      1: ["email", "ceptel", "adres", "adresIl", "adresIlce"],
      2: [], // hoca/arkadaş opsiyonel
      3: [],
    };
    const currentStepFields = stepFields[activeStep] || [];
    const stepErrors = Object.keys(errors).filter((key) => currentStepFields.includes(key));
    if (stepErrors.length > 0) {
      formik.setTouched(Object.fromEntries(stepErrors.map((f) => [f, true])));
      return;
    }
    setActiveStep((p) => p + 1);
  };

  const handleBack = () => setActiveStep((p) => Math.max(0, p - 1));

  // ------------- RENKLİ TASARIM -------------
  const gradientText = {
    fontWeight: 800,
    background: "linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #0ea5e9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const gradientCard = {
    borderRadius: 4,
    border: "1px solid #e0f2fe",
    background: "linear-gradient(180deg, #ffffff 0%, #f6fbff 100%)",
  };

  const gradientButton = {
    background: "linear-gradient(90deg, #0284c7, #38bdf8)",
    boxShadow: "0 6px 16px rgba(2,132,199,0.25)",
    ":hover": { filter: "brightness(0.95)" },
    textTransform: "none",
  };

  const softOutlined = {
    borderColor: "#94a3b8",
    color: "#475569",
    textTransform: "none",
    ":hover": { borderColor: "#64748b", background: "rgba(148,163,184,0.08)" },
  };

  const LeftNav = (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #cfe8ff",
        background: "linear-gradient(180deg, #e6f4ff 0%, #f9fcff 100%)",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "#0c4a6e", letterSpacing: 0.3 }}>
        Adımlar
      </Typography>
      <List dense>
        {steps.map((label, idx) => (
          <ListItemButton
            key={label}
            selected={idx === activeStep}
            onClick={() => setActiveStep(idx)}
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: "all .15s ease",
              ...(idx === activeStep
                ? {
                    bgcolor: "#ffffff",
                    borderLeft: "4px solid #0284c7",
                    boxShadow: "0 2px 8px rgba(2,132,199,0.15)",
                  }
                : {
                    ":hover": { bgcolor: "#eef7ff" },
                  }),
            }}
          >
            <ListItemText
              primary={label}
              primaryTypographyProps={{ sx: { fontWeight: idx === activeStep ? 700 : 500, color: "#0f172a" } }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" sx={{ color: "#0c4a6e" }}>
        İpucu: Adımlara tıklayarak da geçiş yapabilirsiniz.
      </Typography>
    </Paper>
  );

  const CardTitle = ({ children }) => (
    <Typography variant="h6" sx={gradientText}>{children}</Typography>
  );

  // --- Step 0
  const Step0 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader
        title={<CardTitle>Kişisel Bilgiler</CardTitle>}
        subheader="Kimlik ve temel bilgilerinizi doldurun."
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ad Soyad"
                  value={formik.values.full_name}
                  onChange={(e) => formik.setFieldValue("full_name", e.target.value, false)}
                  onBlur={formik.handleBlur}
                  fullWidth
                  size="small"
                  autoComplete="off"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="tcno"
                  label="TC Kimlik No"
                  value={formik.values.tcno}
                  onChange={(e) => formik.setFieldValue("tcno", e.target.value, false)}
                  onBlur={formik.handleBlur}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 11, inputMode: "numeric" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" error={!!formik.errors.gender && formik.touched.gender}>
                  <InputLabel>Cinsiyet *</InputLabel>
                  <Select
                    label="Cinsiyet *"
                    value={formik.values.gender}
                    onChange={(e) => formik.setFieldValue("gender", e.target.value, false)}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="Erkek">Erkek</MenuItem>
                    <MenuItem value="Kadın">Kadın</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <Typography variant="caption" color="error">{formik.errors.gender}</Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" error={!!formik.errors.meslek && formik.touched.meslek}>
                  <InputLabel>Meslek *</InputLabel>
                  <Select
                    label="Meslek *"
                    value={formik.values.meslek}
                    onChange={(e) => formik.setFieldValue("meslek", e.target.value, false)}
                    onBlur={formik.handleBlur}
                  >
                    {meslekler.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.meslek && formik.errors.meslek && (
                    <Typography variant="caption" color="error">{formik.errors.meslek}</Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Doğum Tarihi *"
                  type="date"
                  value={formik.values.birth_date}
                  onChange={(e) => formik.setFieldValue("birth_date", e.target.value, false)}
                  onBlur={formik.handleBlur}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  error={!!formik.errors.birth_date && formik.touched.birth_date}
                  helperText={formik.touched.birth_date && formik.errors.birth_date}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bitirme Yılı</InputLabel>
                  <Select
                    label="Bitirme Yılı"
                    value={formik.values.bitirme_yili}
                    onChange={(e) => formik.setFieldValue("bitirme_yili", e.target.value, false)}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Seçilmedi</MenuItem>
                    {yillar.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          {/* Fotoğraf Yükleme */}
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                borderColor: "#bae6fd",
                background: "linear-gradient(180deg, #f0f9ff, #ffffff)",
              }}
            >
              <Avatar
                src={selectedFile ? URL.createObjectURL(selectedFile) : ""}
                alt="Önizleme"
                sx={{ width: 120, height: 120, mx: "auto", mb: 2, boxShadow: "0 4px 12px rgba(2,132,199,0.25)" }}
                imgProps={{ onLoad: (e) => URL.revokeObjectURL(e.currentTarget.src) }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                fullWidth
                sx={{
                  borderColor: "#7dd3fc",
                  color: "#0369a1",
                  ":hover": { borderColor: "#38bdf8", background: "rgba(56,189,248,0.08)" },
                }}
              >
                Fotoğraf Yükle
                <input type="file" hidden accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {selectedFile.name}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // --- Step 1
  const Step1 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader
        title={<CardTitle>İletişim & Adres</CardTitle>}
        subheader="Size ulaşabilmemiz için geçerli bilgilerinizi girin."
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="E-posta"
              value={formik.values.email}
              onChange={(e) => formik.setFieldValue("email", e.target.value, false)}
              onBlur={(e) => { formik.handleBlur(e); validateEmailUnique(e); }}
              fullWidth
              size="small"
              error={!!formik.errors.email && formik.touched.email}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Cep Tel *"
              value={formik.values.ceptel}
              onChange={(e) => formik.setFieldValue("ceptel", e.target.value, false)}
              onBlur={(e) => { formik.handleBlur(e); validateCepTelUnique(e); }}
              fullWidth
              size="small"
              inputProps={{ inputMode: "tel" }}
              error={!!formik.errors.ceptel && formik.touched.ceptel}
              helperText={formik.touched.ceptel && formik.errors.ceptel}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Adres"
              multiline
              rows={2}
              value={formik.values.adres}
              onChange={(e) => formik.setFieldValue("adres", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!formik.errors.adresIl && formik.touched.adresIl}>
              <InputLabel>İl *</InputLabel>
              <Select
                label="İl *"
                value={formik.values.adresIl}
                onChange={(e) => {
                  formik.setFieldValue("adresIl", e.target.value, false);
                  formik.setFieldValue("adresIlce", "", false);
                }}
                onBlur={formik.handleBlur}
              >
                {iller.map((il) => (
                  <MenuItem key={il.id} value={il.id}>{il.name}</MenuItem>
                ))}
              </Select>
              {formik.touched.adresIl && formik.errors.adresIl && (
                <Typography variant="caption" color="error">{formik.errors.adresIl}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" error={!!formik.errors.adresIlce && formik.touched.adresIlce}>
              <InputLabel>İlçe *</InputLabel>
              <Select
                label="İlçe *"
                value={formik.values.adresIlce}
                onChange={(e) => formik.setFieldValue("adresIlce", e.target.value, false)}
                onBlur={formik.handleBlur}
                disabled={!formik.values.adresIl}
              >
                {getFilteredDistricts().map((ilce) => (
                  <MenuItem key={ilce.id} value={ilce.id}>{ilce.name}</MenuItem>
                ))}
              </Select>
              {formik.touched.adresIlce && formik.errors.adresIlce && (
                <Typography variant="caption" color="error">{formik.errors.adresIlce}</Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // --- Step 2
  const Step2 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader
        title={<CardTitle>Hoca & Arkadaş</CardTitle>}
        subheader="Referans olarak hoca ve bir arkadaş bilgisi bırakabilirsiniz."
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Hoca Adı"
              value={formik.values.hoca_adi}
              onChange={(e) => formik.setFieldValue("hoca_adi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Hoca Soyadı"
              value={formik.values.hoca_soyadi}
              onChange={(e) => formik.setFieldValue("hoca_soyadi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Arkadaş Adı"
              value={formik.values.arkadas_adi}
              onChange={(e) => formik.setFieldValue("arkadas_adi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Arkadaş Soyadı"
              value={formik.values.arkadas_soyadi}
              onChange={(e) => formik.setFieldValue("arkadas_soyadi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#075985", fontWeight: 700 }}>
              Ek Açıklamalar (Markdown)
            </Typography>
            <Box
              sx={{
                border: "1px solid #bae6fd",
                borderRadius: 2,
                overflow: "hidden",
                background: "linear-gradient(180deg, #ffffff, #f8fdff)",
              }}
            >
              <MdEditor
                style={{ height: 320 }}
                value={formik.values.extra_notes}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => {
                  clearTimeout(mdChangeRef.current);
                  mdChangeRef.current = setTimeout(() => {
                    formik.setFieldValue("extra_notes", text, false);
                  }, 150);
                }}
                view={{ menu: true, md: true, html: true }}
                canView={{ hideMenu: false, fullScreen: true, html: true, md: true, menu: true }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // --- Step 3
  const Step3 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader title={<CardTitle>Özet</CardTitle>} subheader="Göndermeden önce bilgilerinizi kontrol edin." />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, borderColor: "#e0f2fe", background: "linear-gradient(#ffffff, #f8fdff)" }}
            >
              <Typography variant="subtitle2" sx={{ color: "#0c4a6e", fontWeight: 700 }}>
                Kimlik
              </Typography>
              <Typography><b>Ad Soyad:</b> {formik.values.full_name || "—"}</Typography>
              <Typography><b>TC:</b> {formik.values.tcno || "—"}</Typography>
              <Typography><b>Cinsiyet:</b> {formik.values.gender || "—"}</Typography>
              <Typography><b>Doğum:</b> {formik.values.birth_date || "—"}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, borderColor: "#e0f2fe", background: "linear-gradient(#ffffff, #f8fdff)" }}
            >
              <Typography variant="subtitle2" sx={{ color: "#0c4a6e", fontWeight: 700 }}>
                İletişim
              </Typography>
              <Typography><b>E-posta:</b> {formik.values.email || "—"}</Typography>
              <Typography><b>Cep:</b> {formik.values.ceptel || "—"}</Typography>
              <Typography><b>Adres:</b> {formik.values.adres || "—"}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const RightContent = (
    <Box ref={printRef} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {{ 0: Step0, 1: Step1, 2: Step2, 3: Step3 }[activeStep]}
    </Box>
  );

  const hasErrors = Object.keys(formik.errors).length > 0;

  return (
    <>
      <HBSBaseHeader />

      <Box sx={{ bgcolor: "#f0f8ff", py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={3}>
              {LeftNav}
            </Grid>
            <Grid item xs={12} md={9}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  alignItems: "center",
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #cfe8ff",
                  background: "linear-gradient(90deg, #e6f4ff, #f7fbff)",
                }}
              >
                <Typography variant="h5" sx={{ ...gradientText, m: 0 }}>
                  Hafızlık Bilgi Kayıt Formu
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={gradientButton}>
                  Yazdır / PDF
                </Button>
              </Box>

              {RightContent}

              {/* Hata özetini yumuşatılmış göster (reflow düşük) */}
              {hasErrors && (
                <Box
                  mt={2}
                  p={2}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #fde68a",
                    background: "linear-gradient(180deg, #fffbeb, #fff7d6)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ display: "flex", alignItems: "center", gap: 1, color: "#b45309", fontWeight: 700 }}
                  >
                    <ErrorIcon fontSize="small" /> Bazı alanlarınızda uyarılar var:
                  </Typography>
                  <ul style={{ paddingLeft: "1.2rem", margin: "6px 0 0 0", color: "#92400e" }}>
                    {Object.entries(formik.errors).map(([field, errorMsg]) => (
                      <li key={field}>{errorMsg}</li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Action bar */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackIosNewIcon />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={softOutlined}
                >
                  Geri
                </Button>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button type="button" variant="contained" onClick={formik.handleSubmit} sx={gradientButton}>
                      Kaydet
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="contained"
                      endIcon={<ArrowForwardIosIcon />}
                      onClick={handleNext}
                      sx={gradientButton}
                    >
                      İleri
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <HBSBaseFooter />
    </>
  );
}
