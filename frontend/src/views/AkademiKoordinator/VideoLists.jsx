// src/pages/Koordinator/VideoLists.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import DashboardLayout from "../layouts/DashboardLayout";
import GenericList from "./GenericList";
import VideoEditModal from "./VideoEditModal";

/* ===========================
   Ortak yardımcılar
=========================== */

const getYouTubeId = (url = "") => {
  const p = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const m = url?.match?.(p);
  return m ? m[1] : null;
};
const getYouTubeThumb = (url = "") =>
  getYouTubeId(url) ? `https://img.youtube.com/vi/${getYouTubeId(url)}/hqdefault.jpg` : "";

/** Reusable: video listesi (koordinatör) – grid/liste + filtre/sıralama + düzenle/sil */
function CoordinatorVideoList({
  title,
  fetchUrl,            // örn: "videos/" veya "instructors/:id/videos/"
  allowCreate = true,  // YouTube sayfasında yeni ekleme açık
  forceSource,         // "youtube" | "local" (opsiyonel)
}) {
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  // UI
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | youtube | local
  const [sortKey, setSortKey] = useState("newest"); // newest | title
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(fetchUrl, { params: { q: q || undefined } });
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      // normalize
      const mapped = data.map((x) => ({
        id: x.id,
        title: x.title,
        owner_name: x.owner_name,
        source: (x.source || "").toLowerCase() || (getYouTubeId(x.url) ? "youtube" : "local"),
        url: x.url || "",
        file: x.file || "",
        created_at: x.created_at,
        thumb:
          x.thumb ||
          (x.source === "youtube" || getYouTubeId(x.url) ? getYouTubeThumb(x.url) : ""),
        watch:
          (x.source === "youtube" || getYouTubeId(x.url)) && x.url
            ? x.url
            : x.file || "#",
      }));
      setRows(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl]);

  const onSearch = async (e) => {
    e?.preventDefault?.();
    await load();
  };

  const onCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };
  const onEdit = (row) => {
    setEditing(row);
    setEditOpen(true);
  };
  const onDelete = async (row) => {
    if (!window.confirm(`Silinsin mi?\n${row.title}`)) return;
    await api.delete(`videos/${row.id}/`);
    await load();
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`videos/${editing.id}/`, form);
      } else {
        // create
        const payload = { ...form };
        if (forceSource) payload.source = forceSource;
        await api.post("videos/", payload);
      }
      setEditOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  // filtre + sort
  const filtered = useMemo(() => {
    let list = [...rows];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (x) =>
          (x.title || "").toLowerCase().includes(s) ||
          (x.owner_name || "").toLowerCase().includes(s)
      );
    }
    const tf = forceSource || typeFilter;
    if (tf !== "all") {
      list = list.filter((x) => x.source === tf);
    }
    list.sort((a, b) => {
      switch (sortKey) {
        case "title":
          return String(a.title || "").localeCompare(String(b.title || ""));
        case "newest":
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
    return list;
  }, [rows, q, typeFilter, sortKey, forceSource]);

  const totalCount = filtered.length;
  const noData = !loading && totalCount === 0;

  const VideoCard = ({ item }) => (
    <div className={`card h-100 border-0 shadow-sm admin-video-card ${viewMode === "list" ? "admin-video-card--list" : ""}`}>
      <div className={`position-relative ${viewMode === "list" ? "row g-0 flex-md-row" : ""}`}>
        <div className={viewMode === "list" ? "col-md-5" : ""}>
          <div className="ratio ratio-16x9 position-relative overflow-hidden rounded-top">
            {item.thumb ? (
              <a href={item.watch} target="_blank" rel="noreferrer" className="d-block w-100 h-100">
                <img src={item.thumb} alt={item.title} className="w-100 h-100 object-fit-cover" />
              </a>
            ) : (
              <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
                <i className="bi bi-file-earmark-play fs-1 text-white-50"></i>
              </div>
            )}
            {/* küçük kaynak ikonları */}
            <div className="position-absolute top-0 start-0 p-2 d-flex gap-2">
              {item.source === "youtube" && <i className="bi bi-youtube text-danger fs-5 bg-dark bg-opacity-50 rounded p-1"></i>}
              {item.source === "local" && <i className="bi bi-file-earmark-play text-white fs-5 bg-dark bg-opacity-50 rounded p-1"></i>}
            </div>
          </div>
        </div>

        <div className={viewMode === "list" ? "col-md-7" : ""}>
          <div className="card-body d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0 text-truncate" title={item.title}>
                <i className="bi bi-play-btn-fill me-2 text-primary"></i>{item.title}
              </h6>
              {item.owner_name && (
                <span className="badge text-bg-secondary">{item.owner_name}</span>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-auto flex-wrap gap-2">
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
              </small>
              <div className="d-flex gap-2">
                {item.watch && item.watch !== "#" ? (
                  <a className="btn btn-outline-primary btn-sm" href={item.watch} target="_blank" rel="noreferrer">
                    <i className="bi bi-play-circle me-1"></i> İzle
                  </a>
                ) : (
                  <button className="btn btn-outline-secondary btn-sm" disabled>Dosya yok</button>
                )}
                <button className="btn btn-outline-warning btn-sm" onClick={() => onEdit(item)}>
                  <i className="bi bi-pencil-square me-1"></i> Düzenle
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(item)}>
                  <i className="bi bi-trash me-1"></i> Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Skeleton = () => (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="col" key={i}>
          <div className="card border-0 shadow-sm">
            <div className="ratio ratio-16x9 bg-light placeholder-glow">
              <span className="placeholder col-12 h-100"></span>
            </div>
            <div className="card-body">
              <h6 className="placeholder-glow">
                <span className="placeholder col-9"></span>
              </h6>
              <p className="placeholder-glow mb-0">
                <span className="placeholder col-12"></span>
                <span className="placeholder col-8"></span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <AkademiBaseHeader />
      <DashboardLayout
        title={<><i className="bi bi-collection-play me-2"></i> {title}</>}
        right={
          <div className="d-flex flex-wrap gap-2 align-items-end">
            <form className="d-flex" onSubmit={onSearch}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  className="form-control"
                  placeholder="Ara (başlık/ekleyen)…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <button className="btn btn-outline-primary" type="submit">Ara</button>
              </div>
            </form>
            {!forceSource && (
              <select className="form-select" style={{ minWidth: 160 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">Tümü</option>
                <option value="youtube">YouTube</option>
                <option value="local">Dosya</option>
              </select>
            )}
            <select className="form-select" style={{ minWidth: 160 }} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="newest">En yeni</option>
              <option value="title">Başlığa göre</option>
            </select>
            <div className="btn-group" role="group" aria-label="Görünüm">
              <button className={`btn btn-outline-secondary ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid">
                <i className="bi bi-grid-3x3-gap-fill"></i>
              </button>
              <button className={`btn btn-outline-secondary ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="Liste">
                <i className="bi bi-list-ul"></i>
              </button>
            </div>
            <span className="badge text-bg-secondary align-self-center">{totalCount}</span>
            {allowCreate && (
              <button className="btn btn-primary ms-auto" onClick={onCreate}>
                <i className="bi bi-plus-lg me-1"></i> Video Ekle
              </button>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="py-3"><Skeleton /></div>
        ) : noData ? (
          <div className="alert alert-light">Kayıt bulunamadı.</div>
        ) : viewMode === "grid" ? (
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {filtered.map((item) => (
              <div className="col" key={item.id}>
                <VideoCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="vstack gap-3">
            {filtered.map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </DashboardLayout>
      <AkademiBaseFooter />

      <style>{`
        .object-fit-cover { object-fit: cover; }
        .admin-video-card { border-radius: 1rem; }
        .admin-video-card .rounded-top { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
        .admin-video-card:hover { transform: translateY(-2px); box-shadow: 0 .75rem 1.5rem rgba(0,0,0,.08) !important; transition: .2s ease; }
        .admin-video-card--list img { border-top-right-radius: 0 !important; border-bottom-left-radius: 1rem; }
      `}</style>

      {/* Düzenleme Modalı */}
      <VideoEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}

/* ===========================================================
   1) Tüm YouTube Videoları  (kart grid, düzenle/sil, ekle)
=========================================================== */
export function AllYoutubeVideosPage() {
  // Not: API tüm videoları dönüyorsa, create ederken source: "youtube" gönderiyoruz.
  return (
    <CoordinatorVideoList
      title="Tüm YouTube Videoları"
      fetchUrl="videos/?source=youtube"
      allowCreate={true}
      forceSource="youtube"
    />
  );
}

/* ===========================================================
   2) Eğitmenlerin Eklediği Tüm Videolar (kaynak fark etmez)
=========================================================== */
export function AllInstructorVideosPage() {
  return (
    <CoordinatorVideoList
      title="Eğitmenlerin Eklediği Tüm Videolar"
      fetchUrl="videos/?owner_role=instructor"
      allowCreate={false}
    />
  );
}

/* ===========================================================
   3) Belirli Eğitmenin Kendi Videoları
   Route: /koordinator/egitmen/:instructorId/videolar
=========================================================== */
export function MyInstructorVideosPage() {
  const { instructorId } = useParams();
  return (
    <CoordinatorVideoList
      title={`Eğitmen Videoları • #${instructorId}`}
      fetchUrl={`instructors/${instructorId}/videos/`}
      allowCreate={true}
    />
  );
}

/* ===========================================================
   4) Belirli Videoyu Satın Alan Öğrenciler
   Route: /koordinator/video/:videoId/satin-alanlar
   (Liste: kişi tablosu – DashboardLayout ile aynı görünüm)
=========================================================== */
export function VideoPurchasersPage() {
  const { videoId } = useParams();
  const api = useAxios();

  const columns = [
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    { key: "purchased_at", title: "Satın Alma", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
    { key: "amount", title: "Tutar" },
  ];

  const fetchUrl = `videos/${videoId}/purchases/`;

  const onDelete = async (row) => {
    if (!window.confirm(`Satın alma kaydı silinsin mi?\n${row.student_name}`)) return;
    await api.delete(`video-purchases/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <>
      <AkademiBaseHeader />
      <DashboardLayout
        title={<><i className="bi bi-people me-2"></i> Videoyu Satın Alan Öğrenciler • #{videoId}</>}
        right={null}
      >
        <GenericList
          title=""
          fetchUrl={fetchUrl}
          columns={columns}
          onDelete={onDelete}
          api={api}
        />
      </DashboardLayout>
      <AkademiBaseFooter />
    </>
  );
}

/* ===========================================================
   5) Belirli Videoya Kayıtlı Öğrenciler
   Route: /koordinator/video/:videoId/kayitli-ogrenciler
=========================================================== */
export function VideoEnrolleesPage() {
  const { videoId } = useParams();
  const api = useAxios();

  const columns = [
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    { key: "enrolled_at", title: "Kayıt Tarihi", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
    { key: "progress", title: "İlerleme", render: (v) => (v != null ? `%${v}` : "-") },
  ];

  const fetchUrl = `videos/${videoId}/enrollments/`;

  const onDelete = async (row) => {
    if (!window.confirm(`Kayıt silinsin mi?\n${row.student_name}`)) return;
    await api.delete(`video-enrollments/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <>
      <AkademiBaseHeader />
      <DashboardLayout
        title={<><i className="bi bi-people me-2"></i> Videoya Kayıtlı Öğrenciler • #{videoId}</>}
        right={null}
      >
        <GenericList
          title=""
          fetchUrl={fetchUrl}
          columns={columns}
          onDelete={onDelete}
          api={api}
        />
      </DashboardLayout>
      <AkademiBaseFooter />
    </>
  );
}

/* ===========================================================
   6) Tüm Video Satın Almalar (toplu)
=========================================================== */
export function AllVideoPurchasesPage() {
  const api = useAxios();

  const columns = [
    { key: "video_title", title: "Video" },
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    { key: "purchased_at", title: "Satın Alma", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
    { key: "amount", title: "Tutar" },
  ];
  const fetchUrl = "video-purchases/";

  const onDelete = async (row) => {
    if (!window.confirm(`Satın alma kaydı silinsin mi?\n${row.student_name} • ${row.video_title}`)) return;
    await api.delete(`video-purchases/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <>
      <AkademiBaseHeader />
      <DashboardLayout
        title={<><i className="bi bi-receipt me-2"></i> Tüm Video Satın Almalar</>}
        right={null}
      >
        <GenericList
          title=""
          fetchUrl={fetchUrl}
          columns={columns}
          onDelete={onDelete}
          api={api}
        />
      </DashboardLayout>
      <AkademiBaseFooter />
    </>
  );
}

/* ===========================================================
   7) Tüm Video Kayıtları (toplu)
=========================================================== */
export function AllVideoEnrollmentsPage() {
  const api = useAxios();

  const columns = [
    { key: "video_title", title: "Video" },
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    { key: "enrolled_at", title: "Kayıt Tarihi", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
    { key: "progress", title: "İlerleme", render: (v) => (v != null ? `%${v}` : "-") },
  ];
  const fetchUrl = "video-enrollments/";

  const onDelete = async (row) => {
    if (!window.confirm(`Kayıt silinsin mi?\n${row.student_name} • ${row.video_title}`)) return;
    await api.delete(`video-enrollments/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <>
      <AkademiBaseHeader />
      <DashboardLayout
        title={<><i className="bi bi-person-video3 me-2"></i> Tüm Video Kayıtları</>}
        right={null}
      >
        <GenericList
          title=""
          fetchUrl={fetchUrl}
          columns={columns}
          onDelete={onDelete}
          api={api}
        />
      </DashboardLayout>
      <AkademiBaseFooter />
    </>
  );
}
