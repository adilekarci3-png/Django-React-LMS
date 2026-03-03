import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Divider,
  Tabs,
  Tab,
  Paper,
  Stack,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  Link as LinkIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  YouTube as YouTubeIcon,
  VideoLibrary as VideoIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

import useUserData from "../plugin/useUserData";
import Sidebar from "./Partials/Sidebar";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import useAxios from "../../utils/useAxios";

const MAX_FILE_MB = 500;
const ACCEPTED_TYPES = ["video/mp4"];
const isValidSize = (file) => file?.size / (1024 * 1024) <= MAX_FILE_MB;

function getYouTubeId(url = "") {
  const p =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const m = url.match(p);
  return m ? m[1] : null;
}
const getYouTubeEmbedUrl = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "";
};
const getYouTubeThumb = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

function EducatorVideoLinkCreate() {
  const api = useAxios();
  const user = useUserData(); // { user_id, full_name, teacher_id, base_roles, ... }
console.log(user);
  const [tab, setTab] = useState("file"); // "file" | "url"
  const [uploadPct, setUploadPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [instructorId, setInstructorId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoFile: null,
  });

  // ✅ instructor_id'yi JWT'den al
  useEffect(() => {
    if (!user) return;
    if (user?.teacher_id) setInstructorId(user.teacher_id);
  }, [user]);

  const fileUrl = useMemo(
    () => (formData.videoFile ? URL.createObjectURL(formData.videoFile) : ""),
    [formData.videoFile]
  );

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const onChange = (field) => (e) => {
    const value = field === "videoFile" ? e.target.files?.[0] : e.target.value;
    if (field === "videoFile" && value) {
      if (!ACCEPTED_TYPES.includes(value.type)) {
        setErrors((p) => ({ ...p, videoFile: "Yalnızca MP4 kabul edilir." }));
        return;
      }
      if (!isValidSize(value)) {
        setErrors((p) => ({
          ...p,
          videoFile: `Dosya çok büyük. En fazla ${MAX_FILE_MB}MB.`,
        }));
        return;
      }
      setErrors((p) => ({ ...p, videoFile: "" }));
    }
    setFormData((p) => ({ ...p, [field]: value }));
  };

  // Drag & Drop
  const dropRef = useRef(null);
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e) => {
    prevent(e);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, videoFile: "Yalnızca MP4 kabul edilir." }));
      return;
    }
    if (!isValidSize(file)) {
      setErrors((p) => ({
        ...p,
        videoFile: `Dosya çok büyük. En fazla ${MAX_FILE_MB}MB.`,
      }));
      return;
    }
    setErrors((p) => ({ ...p, videoFile: "" }));
    setFormData((p) => ({ ...p, videoFile: file }));
    setTab("file");
  };

  const validate = () => {
    const v = {};
    if (!formData.title?.trim()) v.title = "Başlık zorunludur.";
    if (tab === "url") {
      if (!formData.videoUrl?.trim()) v.videoUrl = "Video URL zorunludur.";
      else if (!getYouTubeId(formData.videoUrl))
        v.videoUrl = "Geçerli bir YouTube URL giriniz.";
    } else {
      if (!formData.videoFile) v.videoFile = "Bir video dosyası seçiniz.";
    }
    // if (!instructorId) {
    //   v.instructor = "Eğitmen kimliği alınamadı (instructor_id). Giriş bilgilerinizi kontrol edin.";
    // }
    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const handleSubmit = async (e) => {
    debugger;
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description || "");
    // payload.append("instructor_id", instructorId); // backend bunu bekliyor

    // Hem camelCase hem snake_case gönder (backend uyumluluğu)
    if (tab === "url") {
      payload.append("videoUrl", formData.videoUrl);
      payload.append("video_url", formData.videoUrl);
    } else if (formData.videoFile) {
      payload.append("videoFile", formData.videoFile);
      payload.append("video_file", formData.videoFile);
    }

    const endpoint =
      tab === "url"
        ? "educator/video/link/create/"
        : "instructor/video/create/";

    try {
      setSubmitting(true);
      setUploadPct(5);

      await api.post(endpoint, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: ({ loaded, total }) => {
          if (!total) return;
          const pct = Math.round((loaded * 100) / total);
          setUploadPct(pct);
        },
      });

      Swal.fire("Başarılı", "Video başarıyla yüklendi!", "success");
      Navigate("/akademi/egitmen/video-linkleri");
      setFormData({ title: "", description: "", videoUrl: "", videoFile: null });
      setTab("file");
      setUploadPct(0);
      setErrors({});
    } catch (error) {
      console.error(error);
      const data = error?.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("\n")
          : "Video yüklenemedi";
      Swal.fire("Hata", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ title: "", description: "", videoUrl: "", videoFile: null });
    setErrors({});
    setUploadPct(0);
  };

  const infoChips = (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      <Chip icon={<VideoIcon />} label="MP4 desteklenir" variant="outlined" />
      <Chip icon={<CloudUpload />} label={`Max ${MAX_FILE_MB}MB`} variant="outlined" />
      <Chip icon={<YouTubeIcon />} label="YouTube link desteği" variant="outlined" />
      {user?.full_name && (
        <Chip
          icon={<PersonIcon />}
          color="primary"
          variant="outlined"
          label={`Eğitmen: ${user.full_name}${user?.teacher_id ? ` (#${user.teacher_id})` : ""}`}
        />
      )}
    </Stack>
  );

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5" style={{ background: "#f7f9fc" }}>
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 mb-4 mb-lg-0">
              <Sidebar />
            </div>

            <div className="col-lg-9">
              <Card className="shadow border-0 rounded-4">
                <CardHeader
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          background: "linear-gradient(135deg,#6a11cb,#2575fc)",
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          boxShadow: "0 4px 10px rgba(37,117,252,.35)",
                        }}
                      >
                        <i className="bi bi-camera-video-fill"></i>
                      </Box>
                      <Box>
                        <Typography variant="h6" className="fw-bold">
                          Eğitmen Video Ekle
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          MP4 yükleyin veya YouTube bağlantısı ekleyin.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  action={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Formu Temizle">
                        <IconButton onClick={handleReset}>
                          <ResetIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                />
                <CardContent sx={{ p: 3 }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      {/* Sol: Form */}
                      <Grid item xs={12} md={7}>
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                          <Stack spacing={2.5}>
                            <TextField
                              label="Video Başlığı *"
                              value={formData.title}
                              onChange={onChange("title")}
                              error={!!errors.title}
                              helperText={errors.title}
                            />

                            <TextField
                              label="Açıklama"
                              multiline
                              minRows={4}
                              value={formData.description}
                              onChange={onChange("description")}
                            />

                            <Box>
                              <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                sx={{ mb: 2 }}
                              >
                                <Tab
                                  icon={<CloudUpload />}
                                  iconPosition="start"
                                  label="Dosya Yükle"
                                  value="file"
                                />
                                <Tab
                                  icon={<LinkIcon />}
                                  iconPosition="start"
                                  label="YouTube URL"
                                  value="url"
                                />
                              </Tabs>

                              {tab === "file" ? (
                                <Box
                                  ref={dropRef}
                                  onDragEnter={prevent}
                                  onDragOver={prevent}
                                  onDragLeave={prevent}
                                  onDrop={onDrop}
                                  sx={{
                                    p: 3,
                                    border: "2px dashed #cbd5e1",
                                    borderRadius: 3,
                                    textAlign: "center",
                                    background: "#fafbff",
                                  }}
                                >
                                  <CloudUpload fontSize="large" />
                                  <Typography variant="body1" sx={{ mt: 1 }}>
                                    Sürükleyip bırakın ya da bir dosya seçin
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    MP4 • Maks {MAX_FILE_MB}MB
                                  </Typography>

                                  <Box sx={{ mt: 2 }}>
                                    <input
                                      type="file"
                                      accept={ACCEPTED_TYPES.join(",")}
                                      onChange={onChange("videoFile")}
                                      className="form-control"
                                    />
                                  </Box>

                                  {errors.videoFile && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                      {errors.videoFile}
                                    </Alert>
                                  )}

                                  {formData.videoFile && (
                                    <Stack
                                      direction="row"
                                      spacing={1.5}
                                      alignItems="center"
                                      justifyContent="center"
                                      sx={{ mt: 2 }}
                                    >
                                      <Chip
                                        icon={<VideoIcon />}
                                        label={formData.videoFile.name}
                                      />
                                      <Tooltip title="Kaldır">
                                        <IconButton
                                          onClick={() =>
                                            setFormData((p) => ({
                                              ...p,
                                              videoFile: null,
                                            }))
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  )}
                                </Box>
                              ) : (
                                <Box>
                                  <TextField
                                    label="YouTube / Video URL *"
                                    fullWidth
                                    value={formData.videoUrl}
                                    onChange={onChange("videoUrl")}
                                    error={!!errors.videoUrl}
                                    helperText={errors.videoUrl}
                                  />
                                  <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    sx={{ mt: 1.5 }}
                                  >
                                    <Chip
                                      icon={<YouTubeIcon />}
                                      label="YouTube önerilir"
                                      variant="outlined"
                                    />
                                    {!!getYouTubeId(formData.videoUrl) && (
                                      <Chip
                                        icon={<PreviewIcon />}
                                        color="success"
                                        label="Önizleme hazır"
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              )}
                            </Box>

                            {errors.instructor && (
                              <Alert severity="warning">{errors.instructor}</Alert>
                            )}

                            {submitting && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={uploadPct}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Yükleniyor… %{uploadPct}
                                </Typography>
                              </Box>
                            )}

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                variant="outlined"
                                startIcon={<ResetIcon />}
                                onClick={handleReset}
                                disabled={submitting}
                              >
                                Temizle
                              </Button>
                              <Button
                                type="submit"
                                variant="contained"
                                color="success"
                                startIcon={<SaveIcon />}
                                disabled={submitting}
                              >
                                Kaydet
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>

                        <Box sx={{ mt: 2 }}>{infoChips}</Box>
                      </Grid>

                      {/* Sağ: Önizleme */}
                      <Grid item xs={12} md={5}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            background:
                              "linear-gradient(180deg,#ffffff, #f5f8ff 80%)",
                          }}
                        >
                          <Typography variant="subtitle1" className="fw-bold" sx={{ mb: 1 }}>
                            Önizleme
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          {tab === "file" ? (
                            formData.videoFile ? (
                              <Box>
                                <video
                                  src={fileUrl}
                                  controls
                                  style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    outline: "none",
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {formData.videoFile.name}
                                </Typography>
                              </Box>
                            ) : (
                              <Alert severity="info">Henüz bir dosya seçilmedi.</Alert>
                            )
                          ) : getYouTubeId(formData.videoUrl) ? (
                            <Box
                              sx={{
                                position: "relative",
                                paddingTop: "56.25%",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <iframe
                                title="YouTube Preview"
                                src={getYouTubeEmbedUrl(formData.videoUrl)}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  border: 0,
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </Box>
                          ) : formData.videoUrl ? (
                            <Box textAlign="center">
                              <img
                                src={getYouTubeThumb(formData.videoUrl)}
                                alt="Video Thumbnail"
                                style={{ maxWidth: "100%", borderRadius: 12 }}
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                              <Alert severity="warning" sx={{ mt: 2 }}>
                                Geçerli bir YouTube bağlantısı girin.
                              </Alert>
                            </Box>
                          ) : (
                            <Alert severity="info">Bir URL girin ya da dosya yükleyin.</Alert>
                          )}

                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>Başlık:</strong> {formData.title || "—"}
                            <br />
                            <strong>Açıklama:</strong>{" "}
                            {formData.description?.trim() ? formData.description : "—"}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}

export default EducatorVideoLinkCreate;
