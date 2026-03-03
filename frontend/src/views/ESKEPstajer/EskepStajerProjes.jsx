// EskepStajerProjes.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import {
  FiFileText,
  FiExternalLink,
  FiDownload,
  FiX,
  FiSearch,
  FiFolder,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlus,
  FiCalendar,
  FiClipboard,
} from "react-icons/fi";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";


Modal.setAppElement("#root");

// --- helpers ---
const LANG_MAP = { Turkce: "Türkçe", Ingilizce: "İngilizce", Arapca: "Arapça" };
const LEVEL_MAP = { Baslangic: "Başlangıç", Orta: "Orta", "Ileri Seviye": "İleri Seviye" };
const LANG_OPTIONS = Object.entries(LANG_MAP).map(([value, label]) => ({ value, label }));
const LEVEL_OPTIONS = Object.entries(LEVEL_MAP).map(([value, label]) => ({ value, label }));

const normKey = (v) => String(v || "").toLocaleLowerCase("tr").trim();
const normLangKey = (v) => {
  const s = String(v || "").toLocaleLowerCase("tr").trim();
  if (s === "turkce" || s === "türkçe") return "Turkce";
  if (s === "ingilizce") return "Ingilizce";
  if (s === "arapca" || s === "arapça") return "Arapca";
  return "";
};

const normLevelKey = (v) => {
  const s = String(v || "").toLocaleLowerCase("tr").trim();
  if (s === "baslangic" || s === "başlangıç") return "Baslangic";
  if (s === "orta") return "Orta";
  if (s === "ileri seviye" || s === "ileri" || s === "ileri-seviye") return "Ileri Seviye";
  return "";
};

const displayLang = (v) => LANG_MAP[normLangKey(v) || v] || v || "—";
const displayLevel = (v) => LEVEL_MAP[normLevelKey(v) || v] || v || "—";

const statusBadge = (status) => {
  const t = normKey(status);
  if (t.includes("incele")) return "badge bg-info";
  if (t.includes("taslak")) return "badge bg-secondary";
  if (t.includes("pasif")) return "badge bg-dark";
  if (t.includes("redd")) return "badge bg-danger";
  if (t.includes("teslim") || t.includes("onay") || t.includes("tamam"))
    return "badge bg-success";
  return "badge bg-light text-dark";
};

const safeUrl = (f) => {
  if (!f) return "#";
  if (typeof f === "string") return f;
  if (f?.url) return f.url;
  if (f?.file) return typeof f.file === "string" ? f.file : f.file?.url ?? "#";
  return "#";
};
const fileTitle = (f, i) => f?.title || f?.variant?.title || `Bölüm ${i + 1}`;
const fileName = (f) => {
  if (!f) return undefined;
  if (typeof f === "object") {
    if (f?.filename) return f.filename;
    if (f?.name) return f.name;
    if (f?.file?.filename) return f.file.filename;
    if (f?.file?.name) return f.file.name;
  }
  try {
    const u = new URL(safeUrl(f));
    return decodeURIComponent(u.pathname.split("/").pop());
  } catch {
    return undefined;
  }
};

const isWeekComplete = (p, weekNo) => {
  const weeks = Array.isArray(p?.weeks) ? p.weeks : [];
  const w = weeks.find((x) => x.week_no === weekNo);
  if (!w) return false;
  return (
    (w.youtube_videos || 0) >= 3 &&
    (w.reels_videos || 0) >= 3 &&
    (w.instagram_square_images || 0) >= 3 &&
    (w.youtube_horizontal_images || 0) >= 3
  );
};

const isProjectWeeklyIncomplete = (p) => {
  const planCount = p?.plan_week_count || 5;
  for (let i = 1; i <= planCount; i++) {
    if (!isWeekComplete(p, i)) return true;
  }
  return false;
};

const hasDraft = (p) => !!p?.initial_draft_url;
// --- end helpers ---

function EskepStajerProjes() {
  const api = useAxios();
  const user = useUserData();

  const [allRows, setAllRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // filtreler
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [koorFilter, setKoorFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [draftFilter, setDraftFilter] = useState("all"); // "all" | "yes" | "no"
  const [koorStatusFilter, setKoorStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // sayfalama
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Bölüm modalı
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const headingId = "assignment-modal-title";
  const onClose = useCallback(() => setModalIsOpen(false), []);

  // Haftalık içerik modalı
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [weeklyWorking, setWeeklyWorking] = useState(false);
  const [selectedWeekNo, setSelectedWeekNo] = useState(null);
  const [weekForm, setWeekForm] = useState({
    youtube_videos: [""],
    reels_videos: [""],
    instagram_square_images: [""],
    youtube_horizontal_images: [""],
  });

  // delete
  const [deletingId, setDeletingId] = useState(null);

  const onImgError = (e) => {
    e.currentTarget.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='70'><rect width='100' height='70' fill='#e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6c757d' font-size='12'>no image</text></svg>`
      );
  };

  const fetchData = useCallback(() => {
    if (!user?.user_id) return;
    setFetching(true);
    setError("");
    api
      .get(`eskepstajer/proje-list/${user.user_id}/`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setAllRows(data);
        setRows(data);
        setPage(1);
      })
      .catch(() => setError("Kayıtlar yüklenemedi."))
      .finally(() => setFetching(false));
  }, [api, user?.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const koordinatorOptions = useMemo(() => {
    const s = new Set();
    (allRows || []).forEach((r) => {
      if (r?.koordinator?.full_name) s.add(r.koordinator.full_name);
    });
    return Array.from(s);
  }, [allRows]);

  const koorStatusOptions = useMemo(() => {
    const s = new Set();
    (allRows || []).forEach((r) => {
      if (r?.koordinator_eskepProje_status) s.add(r.koordinator_eskepProje_status);
    });
    return Array.from(s);
  }, [allRows]);

  useEffect(() => {
    let data = [...allRows];
    if (q.trim()) {
      const qq = q.trim().toLocaleLowerCase("tr");
      data = data.filter((r) => (r.title || "").toLocaleLowerCase("tr").includes(qq));
    }
    if (statusFilter !== "all") {
      data = data.filter((r) => (r.eskepProje_status || "") === statusFilter);
    }
    if (koorFilter !== "all") {
      data = data.filter((r) => (r.koordinator?.full_name || "") === koorFilter);
    }
    if (langFilter !== "all") {
  data = data.filter((r) => normLangKey(r.language) === langFilter);
}
if (levelFilter !== "all") {
  data = data.filter((r) => normLevelKey(r.level) === levelFilter);

    }
    if (draftFilter === "yes") {
      data = data.filter((r) => !!r.initial_draft_url);
    } else if (draftFilter === "no") {
      data = data.filter((r) => !r.initial_draft_url);
    }
    if (koorStatusFilter !== "all") {
      data = data.filter((r) => (r.koordinator_eskepProje_status || "") === koorStatusFilter);
    }
    if (dateFrom) {
      data = data.filter((r) => r.date && moment(r.date).isSameOrAfter(moment(dateFrom)));
    }
    if (dateTo) {
      data = data.filter((r) => r.date && moment(r.date).isSameOrBefore(moment(dateTo)));
    }
    setRows(data);
    setPage(1);
  }, [q, statusFilter, koorFilter, langFilter, levelFilter, draftFilter, koorStatusFilter, dateFrom, dateTo, allRows]);

  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (rows || []).slice(start, start + pageSize);
  }, [rows, page]);

  const openModal = (proje) => {
    const fromCurriculum = Array.isArray(proje?.curriculum)
      ? proje.curriculum.flatMap((sec) =>
          Array.isArray(sec?.variant_items) ? sec.variant_items : []
        )
      : [];
    const fromTopLectures = Array.isArray(proje?.lectures) ? proje.lectures : [];
    setSelectedFiles([...fromCurriculum, ...fromTopLectures]);
    setModalIsOpen(true);
  };

  const handleDelete = async (id) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Silinsin mi?",
      text: "Bu proje kalıcı olarak silinecek.",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      confirmButtonColor: "#d33",
      cancelButtonText: "Vazgeç",
    });
    if (!ask.isConfirmed) return;
    try {
      setDeletingId(id);
      await api.delete(`eskepstajer/proje-delete/${id}/`);
      await fetchData();
      Swal.fire({ icon: "success", title: "Silindi", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Silme başarısız" });
    } finally {
      setDeletingId(null);
    }
  };

  const filesExist = (p) =>
    (Array.isArray(p?.curriculum) && p.curriculum.length > 0) ||
    (Array.isArray(p?.lectures) && p.lectures.length > 0);

  // Haftalık modal
  const openWeeklyModal = (proje) => {
    setSelectedProject(proje);
    setSelectedWeekNo(null);
    setWeekForm({ youtube_videos: [""], reels_videos: [""], instagram_square_images: [""], youtube_horizontal_images: [""] });
    setWeeklyModalOpen(true);
  };
  const closeWeeklyModal = () => { setWeeklyModalOpen(false); setSelectedProject(null); setSelectedWeekNo(null); };
  const handleSelectWeek = (weekNo) => {
    setSelectedWeekNo(weekNo);
    setWeekForm({ youtube_videos: [""], reels_videos: [""], instagram_square_images: [""], youtube_horizontal_images: [""] });
  };
  const pushToArray = (field) => setWeekForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  const changeArrayItem = (field, idx, value) => setWeekForm((prev) => {
    const arr = [...(prev[field] || [])];
    arr[idx] = value;
    return { ...prev, [field]: arr };
  });
  const handleWeekSubmit = async () => {
    if (!selectedProject || !selectedWeekNo) return;
    const mustBe3 = ["youtube_videos", "reels_videos", "instagram_square_images", "youtube_horizontal_images"];
    for (const key of mustBe3) {
      const validCount = (weekForm[key] || []).filter((x) => x && x.trim()).length;
      if (validCount < 3) { alert("Her kategoriden en az 3 içerik girmelisiniz. Eksik alan: " + key); return; }
    }
    try {
      setWeeklyWorking(true);
      await api.post(`/eskepstajer/proje/${selectedProject.id}/week/${selectedWeekNo}/`, { week_no: selectedWeekNo, ...weekForm });
      fetchData();
      alert("Haftalık içerik kaydedildi.");
      setSelectedWeekNo(null);
    } catch { alert("Kayıt sırasında hata oluştu."); }
    finally { setWeeklyWorking(false); }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h4 className="mb-0">
                  <i className="fas fa-project-diagram text-danger me-2" />
                  Projelerim
                </h4>
                <div className="text-muted small">
                  {fetching ? "Yükleniyor..." : `${rows.length} kayıt`}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="mb-0">Proje Listesi</h3>
                      <span className="text-muted">
                        Staj sürecindeki proje çalışmalarınızı buradan takip edebilirsiniz.
                      </span>
                    </div>
                    <Link to="/eskep/create-proje" className="btn btn-primary">
                      + Yeni Proje
                    </Link>
                  </div>
                </div>

                {/* Filtre Bar */}
                <div className="card-body">
                  <div className="row g-2 align-items-end">
                    {/* Arama */}
                    <div className="col-12 col-md-4">
                      <label className="form-label">Ara</label>
                      <div className="input-group">
                        <span className="input-group-text" aria-hidden><FiSearch /></span>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Başlığa göre ara"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          aria-label="Projede ara"
                        />
                      </div>
                    </div>

                    {/* Durum */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Durum</label>
                      <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        <option value="İncelemede">İncelemede</option>
                        <option value="Taslak">Taslak</option>
                        <option value="Pasif">Pasif</option>
                        <option value="Reddedilmiş">Reddedilmiş</option>
                        <option value="Teslim Edildi">Teslim Edildi</option>
                      </select>
                    </div>

                    {/* Koordinatör */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Koordinatör</label>
                      <select className="form-select" value={koorFilter} onChange={(e) => setKoorFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        {koordinatorOptions.map((k) => (<option key={k} value={k}>{k}</option>))}
                      </select>
                    </div>

                    {/* Dil */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Dil</label>
                      <select className="form-select" value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        {LANG_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                    </div>

                    {/* Seviye */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Seviye</label>
                      <select className="form-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        {LEVEL_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                    </div>

                    {/* Ön Taslak */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Ön Taslak</label>
                      <select className="form-select" value={draftFilter} onChange={(e) => setDraftFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        <option value="yes">Gönderildi</option>
                        <option value="no">Gönderilmedi</option>
                      </select>
                    </div>

                    {/* Koordinatördeki Durum */}
                    <div className="col-6 col-md-3">
                      <label className="form-label">Koordinatördeki Durum</label>
                      <select className="form-select" value={koorStatusFilter} onChange={(e) => setKoorStatusFilter(e.target.value)}>
                        <option value="all">Tümü</option>
                        {koorStatusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </div>

                    {/* Başlangıç */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Başlangıç</label>
                      <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>

                    {/* Bitiş */}
                    <div className="col-6 col-md-2">
                      <label className="form-label">Bitiş</label>
                      <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>

                    {/* Temizle */}
                    <div className="col-12 col-md-3 d-grid">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setQ(""); setStatusFilter("all"); setKoorFilter("all");
                          setLangFilter("all"); setLevelFilter("all");
                          setDraftFilter("all"); setKoorStatusFilter("all");
                          setDateFrom(""); setDateTo("");
                          setRows(allRows); setPage(1);
                        }}
                      >
                         Temizle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tablo */}
                <div className="table-responsive">
                  <table className="table mb-0 text-nowrap table-hover table-centered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Proje</th>
                        <th>Kayıt Tarihi</th>
                        <th>Ön Taslak</th>
                        <th>Haftalar</th>
                        <th>Durum</th>
                        <th>Koordinatör</th>
                        <th className="text-center">İşlemler</th>
                      </tr>
                    </thead>

                    <tbody>
                      {error && (
                        <tr><td colSpan={7} className="text-danger">{error}</td></tr>
                      )}

                      {fetching && Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`sk-${i}`}>
                          <td colSpan={7}>
                            <div className="placeholder-glow py-2">
                              <span className="placeholder col-2 me-2"></span>
                              <span className="placeholder col-3 me-2"></span>
                              <span className="placeholder col-2 me-2"></span>
                              <span className="placeholder col-1 me-2"></span>
                              <span className="placeholder col-1 me-2"></span>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!fetching && !error && pageData.map((p) => {
                        const planWeeks = p?.plan_week_count || 5;
                        const weeklyIncomplete =
                          p?.eskepProje_status?.toLowerCase() === "approved" &&
                          isProjectWeeklyIncomplete(p);

                        return (
                          <tr key={p.id}>
                            {/* Proje */}
                            <td data-label="Proje">
                              <div className="d-flex align-items-center">
                                <img
                                  src={p.image}
                                  onError={onImgError}
                                  alt={`${p.title || "proje"} görseli`}
                                  className="rounded"
                                  style={{ width: 64, height: 64, objectFit: "cover", flexShrink: 0 }}
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1">{p.title}</h6>
                                  <div className="text-muted small">
  {displayLang(p.language)} · {displayLevel(p.level)}
</div>
                                  {weeklyIncomplete && (
                                    <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                                      <FiAlertTriangle size={12} />
                                      Haftalık içerik eksik
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Kayıt Tarihi */}
                            <td data-label="Kayıt">
                              {p.date ? moment(p.date).format("D MMM YYYY") : "—"}
                            </td>

                            {/* Ön Taslak */}
                            <td data-label="Ön Taslak">
                              {hasDraft(p) ? (
                                <div className="d-flex flex-column gap-1">
                                  <span className="badge bg-success">Gönderildi</span>
                                  <a href={p.initial_draft_url} target="_blank" rel="noreferrer" className="small text-primary">
                                    Taslağı gör
                                  </a>
                                  {p.initial_draft_status && (
                                    <span className="small text-muted">{p.initial_draft_status}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="badge bg-secondary">Gönderilmedi</span>
                              )}
                            </td>

                            {/* Haftalar */}
                            <td data-label="Haftalar">
                              <div className="d-flex flex-column gap-1">
                                <span className="badge bg-light text-dark border">
                                  <FiCalendar size={11} className="me-1" />
                                  {planWeeks} hafta
                                </span>
                                {/* Tamamlanan hafta sayısı */}
                                {Array.isArray(p?.weeks) && p.weeks.length > 0 && (
                                  <span className="small text-muted">
                                    {p.weeks.filter((_, i) => isWeekComplete(p, i + 1)).length}/{planWeeks} tam
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Durum */}
                            <td data-label="Durum">
                              <div className="d-flex flex-column gap-1">
                                <span className={statusBadge(p.eskepProje_status)}>
                                  {p.eskepProje_status || "—"}
                                </span>
                                {p.koordinator_eskepProje_status && (
                                  <span className="small text-muted" title="Koordinatördeki Durum">
                                    ↳ {p.koordinator_eskepProje_status}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Koordinatör */}
                            <td data-label="Koordinatör">
                              {p.koordinator?.full_name || "—"}
                            </td>

                            {/* İşlemler */}
                            <td className="text-center" data-label="İşlemler">
  <div className="dropdown actions-dd">
    <button
  className="btn btn-sm btn-outline-dark actions-btn"
  type="button"
  data-bs-toggle="dropdown"
  aria-expanded="false"
  title="İşlemler"
><FiChevronDown />
</button>

    <ul className="dropdown-menu dropdown-menu-end actions-menu">
      <li>
        <Link className="dropdown-item py-2" to={`/eskep/edit-proje/${p.id}`}>
        <FiEdit3 className="me-1 text-warning" />
          Düzenle
        </Link>
      </li>

      {filesExist(p) && (
        <li>
          <button className="dropdown-item py-2" type="button" onClick={() => openModal(p)}>
            <FiFileText className="me-1 text-primary" />
            Bölüm Dosyaları
          </button>
        </li>
      )}

      {p?.eskepProje_status?.toLowerCase() === "approved" && (
        <li>
          <button className="dropdown-item py-2" type="button" onClick={() => openWeeklyModal(p)}>
            <FiClipboard className="me-1 text-success" />
            Haftalık İçerik
          </button>
        </li>
      )}

      <li><hr className="dropdown-divider" /></li>

      <li>
        <button
          className="dropdown-item py-2"
          type="button"
          disabled={deletingId === p.id}
          onClick={() => handleDelete(p.id)}
        >
            <FiTrash2 className="me-1 text-danger" />
              {deletingId === p.id ? "Siliniyor..." : "Sil"}
        </button>
      </li>
    </ul>
  </div>
</td>
                          </tr>
                        );
                      })}

                      {!fetching && !error && pageData.length < 1 && (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="text-muted">
                              <FiFolder className="mb-2" size={28} />
                              <div className="fw-semibold">Proje bulunamadı</div>
                              <div className="small">Filtreleri temizleyip tekrar deneyin.</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sayfalama */}
                {!fetching && totalPages > 1 && (
                  <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="small text-muted">
                      {rows.length} kayıt · {page}/{totalPages} sayfa
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Önceki
                      </button>
                      <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                        Sonraki
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />

      {/* Bölüm Modalı */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={onClose}
        overlayClassName="modalOverlay"
        className="modalContent"
        shouldCloseOnOverlayClick
        aria={{ labelledby: headingId }}
      >
        <div className="modalHeader">
          <h3 id={headingId} className="modalTitle">Bölüm Dosyaları</h3>
          <button className="iconBtn" aria-label="Kapat" onClick={onClose}><FiX /></button>
        </div>
        <div className="modalBody">
          {selectedFiles?.length ? (
            <ul className="fileList" role="list">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="fileItem">
                  <div className="fileMain">
                    <span className="fileIcon" aria-hidden><FiFileText /></span>
                    <div className="fileTexts">
                      <div className="fileTitle">{fileTitle(file, idx)}</div>
                      {fileName(file) && <div className="fileMeta">{fileName(file)}</div>}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a className="btn ghost" href={safeUrl(file)} target="_blank" rel="noopener noreferrer" title="Önizle">
                      <FiExternalLink className="btnIcon" />Önizle
                    </a>
                    <a className="btn primary" href={safeUrl(file)} download={fileName(file)} title="İndir">
                      <FiDownload className="btnIcon" />İndir
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="emptyState">Henüz eklenmiş bölüm yok.</div>
          )}
        </div>
        <div className="modalFooter">
          <button className="btn outline" onClick={onClose}>Kapat</button>
        </div>
      </Modal>

      {/* Haftalık İçerik Modalı */}
      <Modal
        isOpen={weeklyModalOpen}
        onRequestClose={closeWeeklyModal}
        overlayClassName="modalOverlay"
        className="modalContent modalContent-lg"
        shouldCloseOnOverlayClick
        aria={{ labelledby: "weekly-modal-title" }}
      >
        <div className="modalHeader">
          <h3 id="weekly-modal-title" className="modalTitle">
            Haftalık İçerik {selectedProject ? `– ${selectedProject.title}` : ""}
          </h3>
          <button className="iconBtn" aria-label="Kapat" onClick={closeWeeklyModal}><FiX /></button>
        </div>

        <div className="modalBody">
          {!selectedProject ? (
            <div>Proje seçimi yok.</div>
          ) : (
            <>
              <p className="text-muted mb-3">
                Onaylanmış projeler {selectedProject?.plan_week_count || 5} haftalık içerik yüklemelidir. Her hafta <strong>en az 3</strong> adet:
                YouTube videosu · Reels/dik video · Instagram kare görsel · YouTube yatay görsel
              </p>

              <div className="row g-2 mb-4">
                {Array.from({ length: selectedProject?.plan_week_count || 5 }).map((_, i) => {
                  const weekNo = i + 1;
                  const complete = isWeekComplete(selectedProject, weekNo);
                  const weekData = Array.isArray(selectedProject?.weeks)
                    ? selectedProject.weeks.find((w) => w.week_no === weekNo)
                    : null;
                  return (
                    <div className="col-6 col-md-3" key={weekNo}>
                      <button
                        type="button"
                        className={`w-100 btn ${selectedWeekNo === weekNo ? "btn-primary" : complete ? "btn-success" : "btn-outline-secondary"} d-flex flex-column gap-1 py-3`}
                        onClick={() => handleSelectWeek(weekNo)}
                      >
                        <span>Hafta {weekNo}</span>
                        {complete ? (
                          <span className="small d-flex align-items-center justify-content-center gap-1"><FiCheckCircle />Tamamlandı</span>
                        ) : (
                          <span className="small d-flex align-items-center justify-content-center gap-1"><FiAlertTriangle />Eksik</span>
                        )}
                        {weekData && (
                          <span className="small" style={{ opacity: 0.7 }}>YT:{weekData.youtube_videos || 0} · Reels:{weekData.reels_videos || 0}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {!selectedWeekNo ? (
                <div className="alert alert-info">Düzenlemek için bir hafta seçin.</div>
              ) : (
                <div>
                  <h5 className="mb-3">Hafta {selectedWeekNo} İçerikleri</h5>
                  {[
                    { field: "youtube_videos", label: "YouTube formatında video linkleri (min 3)", placeholder: "https://youtube.com/..." },
                    { field: "reels_videos", label: "Reels / dik video (min 3)", placeholder: "https://instagram.com/reel/..." },
                    { field: "instagram_square_images", label: "Instagram kare görsel (min 3)", placeholder: "Görsel linki..." },
                    { field: "youtube_horizontal_images", label: "YouTube yatay görsel / kapak (min 3)", placeholder: "Görsel linki..." },
                  ].map(({ field, label, placeholder }) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label">{label}</label>
                      {weekForm[field].map((val, idx) => (
                        <input
                          key={idx}
                          type="text"
                          className="form-control mb-2"
                          placeholder={placeholder}
                          value={val}
                          onChange={(e) => changeArrayItem(field, idx, e.target.value)}
                        />
                      ))}
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => pushToArray(field)}>
                        <FiPlus className="me-1" />Yeni ekle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modalFooter d-flex justify-content-between align-items-center">
          <div className="text-muted small">Eksik haftalar uyarı ile gösterilir.</div>
          <div className="d-flex gap-2">
            <button className="btn outline" onClick={closeWeeklyModal}>Kapat</button>
            <button className="btn btn-primary" disabled={!selectedWeekNo || weeklyWorking} onClick={handleWeekSubmit}>
              {weeklyWorking ? "Kaydediliyor..." : "Haftayı Kaydet"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default EskepStajerProjes;