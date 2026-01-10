import React, { useState, useEffect, useRef } from "react";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PrintIcon from "@mui/icons-material/Print";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
// ❌ import InputMask from "react-input-mask";
import { PatternFormat } from "react-number-format";

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
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import { API_BASE_URL } from "../../utils/constants";
import "../hafizbilgi/css/print.css";

/* -------------------- Utils -------------------- */
const onlyDigits = (s = "") => s.replace(/\D/g, "");

// TCKN kontrolü (opsiyonel kullanım için ayrı fonksiyon)
const isValidTCKNStrict = (tc = "") => {
  const v = onlyDigits(tc);
  if (v.length !== 11) return false;
  if (v[0] === "0") return false;
  const d = v.split("").map(Number);
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  const d10 = (oddSum * 7 - evenSum) % 10;
  if (d10 !== d[9]) return false;
  const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d11 === d[10];
};

function a11yProps(index) {
  return { id: `hafiz-tab-${index}`, "aria-controls": `hafiz-tabpanel-${index}` };
}

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hafiz-tabpanel-${index}`}
      aria-labelledby={`hafiz-tab-${index}`}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

/* -------------------- Printable Form -------------------- */
const PrintableForm = React.forwardRef(({ values, lookups }, ref) => {
  const { iller, ilceler, meslekler } = lookups;
  const findName = (arr, id) => arr.find((x) => String(x.id) === String(id))?.name || "—";
  const cityName = findName(iller, values.adresIl);
  const districtName = findName(ilceler, values.adresIlce);
  const meslekName = findName(meslekler, values.meslek);

  return (
    <Box ref={ref} className="print-area" sx={{ p: 3 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 2 }}>
        Hafızlık Bilgi Kayıt Formu
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Kişisel Bilgiler
            </Typography>
            <Typography>
              <b>Ad Soyad:</b> {values.full_name || "—"}
            </Typography>
            <Typography>
              <b>TC Kimlik No:</b> {onlyDigits(values.tcno) || "—"}
            </Typography>
            <Typography>
              <b>Cinsiyet:</b> {values.gender || "—"}
            </Typography>
            <Typography>
              <b>Doğum Tarihi:</b> {values.birth_date || "—"}
            </Typography>
            <Typography>
              <b>Meslek:</b> {meslekName}
            </Typography>
            <Typography>
              <b>Bitirme Yılı:</b> {values.bitirme_yili || "—"}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              İletişim & Adres
            </Typography>
            <Typography>
              <b>E-posta:</b> {values.email || "—"}
            </Typography>
            <Typography>
              <b>Cep Tel:</b> {values.ceptel || "—"}
            </Typography>
            <Typography>
              <b>Adres:</b> {values.adres || "—"}
            </Typography>
            <Typography>
              <b>İl / İlçe:</b> {cityName} / {districtName}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Hoca & Arkadaş
            </Typography>
            <Typography>
              <b>Hoca:</b> {[values.hoca_adi, values.hoca_soyadi].filter(Boolean).join(" ") || "—"}
            </Typography>
            <Typography>
              <b>Arkadaş:</b> {[values.arkadas_adi, values.arkadas_soyadi].filter(Boolean).join(" ") || "—"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{ p: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {values._imageObjectURL ? (
              <img
                src={values._imageObjectURL}
                alt="Fotoğraf"
                style={{ width: 180, height: 180, objectFit: "cover", borderRadius: 8 }}
                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
              />
            ) : (
              <Typography color="text.secondary">Fotoğraf yok</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

export default function HafizBilgiCreate() {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Hafizlik-Bilgi-Formu",
  });

  // Sekme durumu
  const [activeTab, setActiveTab] = useState(0);
  const [maxCompletedTab, setMaxCompletedTab] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imageObjectURL, setImageObjectURL] = useState(null);

  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [meslekler, setMeslekler] = useState([]);
  const [yillar, setYillar] = useState([]);

  // ✅ KVKK popup state
  const [openKvkk, setOpenKvkk] = useState(false);
  const [kvkkScrolledToEnd, setKvkkScrolledToEnd] = useState(false);
  const [kvkkCheck, setKvkkCheck] = useState(false);
  const kvkkContentRef = useRef(null);

  const steps = ["Kişisel Bilgiler", "İletişim & Adres", "Hoca & Arkadaş", "Özet"];

  // Uniq checks
  const validateEmailUnique = async (e) => {
    const value = e.target.value?.trim();
    if (!value) return;
    try {
      const res = await axios.post(`${API_BASE_URL}hafizbilgi/check-email/`, { email: value });
      if (res.data.exists) {
        formik.setFieldError("email", "Bu e-posta zaten kayıtlı. Lütfen farklı bir e-posta girin.");
      }
    } catch (err) {
      console.error("E-posta kontrol hatası", err);
    }
  };
  const validateCepTelUnique = async (e) => {
    const value = onlyDigits(e.target.value);
    if (!value) return;
    try {
      const res = await axios.post(`${API_BASE_URL}hafizbilgi/check-ceptel/`, { ceptel: value });
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
      ceptel: "", // masked string
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
      _imageObjectURL: null, // sadece yazdırma için
      kvkk_accepted: false, // ✅ KVKK
    },
    validationSchema: Yup.object({
      full_name: Yup.string(),
      tcno: Yup.string().test("tcno-valid-optional", "Geçersiz TC Kimlik No", (v) => {
        if (!v || v.trim() === "") return true;
        return isValidTCKNStrict(v);
      }),
      gender: Yup.string().required("Cinsiyet gerekli"),
      meslek: Yup.mixed().required("Meslek gerekli"),
      birth_date: Yup.date().required("Doğum tarihi gerekli"),
      email: Yup.string().required("E-posta gerekli").email("Geçersiz e-posta"),
      ceptel: Yup.string()
        .required("Cep telefonu gerekli")
        .test("min-10", "Cep telefonu en az 10 rakam içermeli", (v) => onlyDigits(v || "").length >= 10),
      adres: Yup.string(),
      adresIl: Yup.mixed().required("İl seçiniz"),
      adresIlce: Yup.mixed().required("İlçe seçiniz"),
      kvkk_accepted: Yup.bool().oneOf([true], "KVKK metnini okuduğunuzu onaylamalısınız."),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    validateOnMount: false,
    onSubmit: async (values, { setFieldError, resetForm }) => {
      // Eğer KVKK henüz onaylanmadıysa popup'ı aç ve gönderme
      if (!values.kvkk_accepted) {
        setOpenKvkk(true);
        return;
      }

      const formData = new FormData();

      // Telefonları normalize et (sadece rakam)
      const normalized = {
        ...values,
        ceptel: onlyDigits(values.ceptel),
        evtel: onlyDigits(values.evtel),
        istel: onlyDigits(values.istel),
        tcno: onlyDigits(values.tcno),
      };

      Object.entries(normalized).forEach(([k, v]) => {
        if (k.startsWith("_")) return; // internal
        formData.append(k, v ?? "");
      });

      if (selectedFile) formData.append("image", selectedFile);

      try {
        await axios.post(`${API_BASE_URL}hafizbilgi/create/`, formData);
        Swal.fire("Başarılı", "Kayıt oluşturuldu", "success");
        resetForm();
        setSelectedFile(null);
        setImageObjectURL(null);
        setActiveTab(0);
        setMaxCompletedTab(0);
        setKvkkCheck(false);
        setKvkkScrolledToEnd(false);
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
    axios.get(`${API_BASE_URL}job/list/`).then((res) => {
      const jobs = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setMeslekler(jobs);
    });
    axios.get(`${API_BASE_URL}city/list/`).then((res) => {
      const cities = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setIller(cities);
    });
    axios.get(`${API_BASE_URL}district/list/`).then((res) => {
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

  // Her sekme için kontrol edilecek alanlar
  const stepFields = {
    0: ["gender", "meslek", "birth_date"],
    1: ["email", "ceptel", "adres", "adresIl", "adresIlce"],
    2: [],
    3: [],
  };

  // İleri/Geri
  const handleNext = async () => {
    const errors = await formik.validateForm();
    const fields = stepFields[activeTab] || [];
    const stepErrors = Object.keys(errors).filter((k) => fields.includes(k));
    if (stepErrors.length > 0) {
      formik.setTouched(Object.fromEntries(stepErrors.map((f) => [f, true])));
      return;
    }
    const next = Math.min(activeTab + 1, steps.length - 1);
    setMaxCompletedTab((m) => Math.max(m, next));
    setActiveTab(next);
  };

  const handleBack = () => setActiveTab((p) => Math.max(0, p - 1));
  const handleTabChange = (e, newValue) => {
    if (newValue <= maxCompletedTab) setActiveTab(newValue);
  };

  /* ---------- KVKK Scroll Handler ---------- */
  const handleKvkkScroll = () => {
    const el = kvkkContentRef.current;
    if (!el) return;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10; // küçük tolerans
    if (isAtBottom) setKvkkScrolledToEnd(true);
  };

  /* ---------- Görsel/Doku ---------- */
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
  const CardTitle = ({ children }) => <Typography variant="h6" sx={gradientText}>{children}</Typography>;

  /* ---------- Step 0 ---------- */
  const Step0 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader title={<CardTitle>Kişisel Bilgiler</CardTitle>} subheader="Kimlik ve temel bilgilerinizi doldurun." />
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
                  onChange={(e) => {
                    const v = onlyDigits(e.target.value).slice(0, 11);
                    formik.setFieldValue("tcno", v, false);
                  }}
                  onBlur={formik.handleBlur}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 11, inputMode: "numeric", pattern: "\\d*" }}
                  error={!!formik.errors.tcno && formik.touched.tcno}
                  helperText={formik.touched.tcno && formik.errors.tcno}
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
                    <Typography variant="caption" color="error">
                      {formik.errors.gender}
                    </Typography>
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
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.meslek && formik.errors.meslek && (
                    <Typography variant="caption" color="error">
                      {formik.errors.meslek}
                    </Typography>
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
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
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
                src={selectedFile ? imageObjectURL : ""}
                alt="Önizleme"
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  boxShadow: "0 4px 12px rgba(2,132,199,0.25)",
                }}
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
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setImageObjectURL(url);
                      formik.setFieldValue("_imageObjectURL", url, false);
                    } else {
                      setImageObjectURL(null);
                      formik.setFieldValue("_imageObjectURL", null, false);
                    }
                  }}
                />
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

  /* ---------- Step 1 ---------- */
  const Step1 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader title={<CardTitle>İletişim & Adres</CardTitle>} subheader="Size ulaşabilmemiz için geçerli bilgilerinizi girin." />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="E-posta *"
              value={formik.values.email}
              onChange={(e) => formik.setFieldValue("email", e.target.value, false)}
              onBlur={(e) => {
                formik.handleBlur(e);
                validateEmailUnique(e);
              }}
              fullWidth
              size="small"
              error={!!formik.errors.email && formik.touched.email}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            {/* ✅ Cep telefonu mask - react-number-format */}
            <PatternFormat
              format="0(###) ### ## ##" // TR mobil örnek
              mask="_"
              value={formik.values.ceptel}
              onValueChange={(vals) => {
                formik.setFieldValue("ceptel", vals.formattedValue, false);
              }}
              onBlur={(e) => {
                formik.handleBlur(e);
                validateCepTelUnique(e);
              }}
              customInput={TextField}
              label="Cep Tel *"
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
                  <MenuItem key={il.id} value={il.id}>
                    {il.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.adresIl && formik.errors.adresIl && (
                <Typography variant="caption" color="error">
                  {formik.errors.adresIl}
                </Typography>
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
                  <MenuItem key={ilce.id} value={ilce.id}>
                    {ilce.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.adresIlce && formik.errors.adresIlce && (
                <Typography variant="caption" color="error">
                  {formik.errors.adresIlce}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  /* ---------- Step 2 ---------- */
  const Step2 = (
    <Card elevation={0} sx={gradientCard}>
      <CardHeader title={<CardTitle>Hoca & Arkadaş</CardTitle>} subheader="Referans olarak hoca ve bir arkadaş bilgisi bırakabilirsiniz." />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Hoca Adı"
              value={formik.values.hoca_adi}
              onChange={(e) => formik.setFieldValue("hoca_adi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Hoca Soyadı"
              value={formik.values.hoca_soyadi}
              onChange={(e) => formik.setFieldValue("hoca_soyadi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Arkadaş Adı"
              value={formik.values.arkadas_adi}
              onChange={(e) => formik.setFieldValue("arkadas_adi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Arkadaş Soyadı"
              value={formik.values.arkadas_soyadi}
              onChange={(e) => formik.setFieldValue("arkadas_soyadi", e.target.value, false)}
              onBlur={formik.handleBlur}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  /* ---------- Step 3 ---------- */
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
              <Typography>
                <b>Ad Soyad:</b> {formik.values.full_name || "—"}
              </Typography>
              <Typography>
                <b>TC:</b> {onlyDigits(formik.values.tcno) || "—"}
              </Typography>
              <Typography>
                <b>Cinsiyet:</b> {formik.values.gender || "—"}
              </Typography>
              <Typography>
                <b>Doğum:</b> {formik.values.birth_date || "—"}
              </Typography>
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
              <Typography>
                <b>E-posta:</b> {formik.values.email || "—"}
              </Typography>
              <Typography>
                <b>Cep:</b> {formik.values.ceptel || "—"}
              </Typography>
              <Typography>
                <b>Adres:</b> {formik.values.adres || "—"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const tabsDisabled = (idx) => idx > maxCompletedTab;
  const hasErrors = Object.keys(formik.errors).length > 0;

  return (
    <>
      <HBSBaseHeader />

      {/* ✅ Yalnızca yazdırma sırasında görünür form */}
      <PrintableForm
        ref={printRef}
        values={{ ...formik.values, _imageObjectURL: imageObjectURL }}
        lookups={{ iller, ilceler, meslekler }}
      />

      <Box sx={{ bgcolor: "#f0f8ff", py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          {/* Üst Bilgi + Yazdır */}
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

          {/* Üstten Sekmeler */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #cfe8ff", p: 1, background: "#fff" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Hafızlık Kayıt Sekmeleri"
            >
              {steps.map((label, idx) => (
                <Tab
                  key={label}
                  label={label}
                  disabled={tabsDisabled(idx)}
                  sx={{ textTransform: "none", fontWeight: 700, minHeight: 48 }}
                  {...a11yProps(idx)}
                />
              ))}
            </Tabs>

            <Box>
              <TabPanel value={activeTab} index={0}>
                {Step0}
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                {Step1}
              </TabPanel>
              <TabPanel value={activeTab} index={2}>
                {Step2}
              </TabPanel>
              <TabPanel value={activeTab} index={3}>
                {Step3}
              </TabPanel>
            </Box>
          </Paper>

          {/* Hata özeti */}
          {hasErrors && (
            <Box
              mt={2}
              p={2}
              sx={{ borderRadius: 2, border: "1px solid #fde68a", background: "linear-gradient(180deg, #fffbeb, #fff7d6)" }}
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
              disabled={activeTab === 0}
              sx={softOutlined}
            >
              Geri
            </Button>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              {/* ✅ KVKK BUTONU */}
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  // popup açıldığında scroll ve checkbox'ı resetle
                  setKvkkScrolledToEnd(false);
                  setKvkkCheck(false);
                  setOpenKvkk(true);
                }}
                sx={softOutlined}
              >
                KVKK Metni
              </Button>

              {activeTab === steps.length - 1 ? (
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
        </Container>
      </Box>

      <HBSBaseFooter />

      {/* ✅ KVKK DIALOG */}
      <Dialog
        open={openKvkk}
        onClose={
          // Kapanma sadece şartlar sağlanınca
          kvkkScrolledToEnd && kvkkCheck
            ? () => {
                setOpenKvkk(false);
              }
            : () => {}
        }
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>KVKK Aydınlatma Metni</DialogTitle>
        <DialogContent
          dividers
          sx={{ maxHeight: 350, overflowY: "auto" }}
          onScroll={handleKvkkScroll}
          ref={kvkkContentRef}
        >
          {/* Buraya kendi KVKK metninizi koyabilirsiniz */}
          <Typography variant="body2" paragraph>
            İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu
            sıfatıyla ... tarafından kişisel verilerinizin işlenmesine ilişkin olarak sizleri bilgilendirmek amacıyla
            hazırlanmıştır.
          </Typography>
          <Typography variant="body2" paragraph>
            Toplanan kişisel verileriniz; başvuru ve kayıt süreçlerinin yürütülmesi, hizmetlerin sunulması, kimlik ve
            iletişim bilgilerinizin doğrulanması, gerektiğinde ilgili kamu kurum ve kuruluşlarına bilgi verilmesi
            amacıyla KVKK’nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları dahilinde
            işlenecektir.
          </Typography>
          <Typography variant="body2" paragraph>
            Kişisel verileriniz, kanuni yükümlülüklerin yerine getirilmesi, ilgili kişi taleplerinin karşılanması,
            hukuki süreçlerin yürütülmesi ve gerektiğinde resmi mercilere bilgi verilmesi amacıyla yetkili kamu
            kurumlarıyla ve hizmet aldığımız üçüncü kişilerle paylaşılabilecektir.
          </Typography>
          <Typography variant="body2" paragraph>
            KVKK’nın 11. maddesi kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep
            etme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya
            yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme,
            silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
            işlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun
            ortaya çıkmasına itiraz etme ve KVKK’ya aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın
            giderilmesini talep etme haklarına sahipsiniz.
          </Typography>
          <Typography variant="body2" paragraph>
            Talepleriniz için ... adresinden bizimle iletişime geçebilirsiniz.
          </Typography>
          <Typography variant="body2" paragraph sx={{ fontWeight: 700 }}>
            Lütfen metni tamamen okuduktan sonra aşağıdaki kutucuğu işaretleyiniz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={kvkkCheck}
                onChange={(e) => {
                  setKvkkCheck(e.target.checked);
                  // formdaki alanı da güncelle
                  formik.setFieldValue("kvkk_accepted", e.target.checked && kvkkScrolledToEnd, false);
                }}
              />
            }
            label="KVKK metnini okudum ve kabul ediyorum."
          />

          <Button
            onClick={() => {
              // sadece her ikisi de true ise kapat
              if (kvkkScrolledToEnd && kvkkCheck) {
                setOpenKvkk(false);
                // formdaki alanı garantile
                formik.setFieldValue("kvkk_accepted", true, false);
              }
            }}
            variant="contained"
            disabled={!(kvkkScrolledToEnd && kvkkCheck)}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
