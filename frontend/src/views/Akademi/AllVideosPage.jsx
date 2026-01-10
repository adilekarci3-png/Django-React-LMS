import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import useAxios from "../../utils/useAxios";
import { savedVideosApi } from "../../api/savedVideosApi";
import { useAuthStore } from "../../store/auth";
import DashboardLayout from "../layouts/DashboardLayout";

const getYouTubeId = (url = "") => {
  const p = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const m = url?.match?.(p);
  return m ? m[1] : null;
};
const getYouTubeThumb = (url = "") => (getYouTubeId(url) ? `https://img.youtube.com/vi/${getYouTubeId(url)}/hqdefault.jpg` : "");
const getYouTubeEmbedUrl = (url = "") => (getYouTubeId(url) ? `https://www.youtube.com/embed/${getYouTubeId(url)}` : "#");

export default function AllVideosPage() {
  const api = useAxios();
  const navigate = useNavigate();
  const { addSaved } = savedVideosApi();
  const [isLoggedIn, rehydrated] = useAuthStore((s) => [s.isLoggedIn(), s.rehydrated]);

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [linkItems, setLinkItems] = useState([]);
  const [fileItems, setFileItems] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [linksRes, filesRes] = await Promise.all([
        api.get("educator/video/link/", { params: { search: q } }),
        api.get("educator/video/", { params: { search: q } }),
      ]);

      const linksRaw = Array.isArray(linksRes.data) ? linksRes.data : linksRes.data?.results || [];
      const filesRaw = Array.isArray(filesRes.data) ? filesRes.data : filesRes.data?.results || [];

      const links = linksRaw.map((x) => ({
        id: x.id,
        kind: "link",
        title: x.title,
        description: x.description,
        created_at: x.created_at,
        thumb: getYouTubeThumb(x.videoUrl),
        watch: getYouTubeEmbedUrl(x.videoUrl),
      }));
      const files = filesRaw.map((x) => ({
        id: x.id,
        kind: "file",
        title: x.title,
        description: x.description,
        created_at: x.created_at,
        thumb: "",
        watch: x.file || "#",
      }));

      const sortFn = (a, b) => new Date(b.created_at) - new Date(a.created_at);
      setLinkItems([...links].sort(sortFn));
      setFileItems([...files].sort(sortFn));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (rehydrated) fetchAll(); }, [rehydrated]);

  const onSearch = async (e) => { e?.preventDefault?.(); await fetchAll(); };

  const handleAddToList = async (item) => {
    if (!isLoggedIn) { navigate("/login/?next=/videos"); return; }
    try { await addSaved({ kind: item.kind, video_id: item.id }); alert("Videonuz listenize eklendi."); }
    catch { alert("Ekleme yapılamadı."); }
  };

  const mergedList = useMemo(() => {
    let list = [];
    if (typeFilter === "all" || typeFilter === "link") list = list.concat(linkItems);
    if (typeFilter === "all" || typeFilter === "file") list = list.concat(fileItems);

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
  }, [linkItems, fileItems, typeFilter, sortKey]);

  const noData = !loading && mergedList.length === 0;

  const VideoCard = ({ item }) => (
    <div className={`card h-100 border-0 shadow-sm video-card ${viewMode === "list" ? "video-card--list" : ""}`}>
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

            <div className="media-icons position-absolute top-0 start-0 p-2 d-flex gap-2">
              {item.kind === "link" && <i className="bi bi-youtube text-danger fs-5"></i>}
              {item.kind === "file" && <i className="bi bi-file-earmark-play text-white fs-5"></i>}
            </div>
          </div>
        </div>

        <div className={viewMode === "list" ? "col-md-7" : ""}>
          <div className="card-body d-flex flex-column gap-2">
            <h6 className="card-title mb-1 text-truncate" title={item.title}>
              <i className="bi bi-play-btn-fill me-2 text-primary"></i>{item.title}
            </h6>
            <p className="card-text small text-muted m-0 line-clamp-2">{(item.description || "").slice(0, 160)}{item.description && item.description.length > 160 ? "…" : ""}</p>
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <small className="text-muted"><i className="bi bi-clock me-1"></i>{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</small>
              <div className="d-flex gap-2 flex-wrap">
                {item.watch && item.watch !== "#" ? (
                  <a className="btn btn-outline-primary btn-sm" href={item.watch} target="_blank" rel="noreferrer">
                    <i className="bi bi-play-circle me-1"></i> İzle
                  </a>
                ) : (
                  <button className="btn btn-outline-secondary btn-sm" disabled>Dosya yok</button>
                )}
                <button
                  className={`btn btn-sm ${isLoggedIn ? "btn-success" : "btn-outline-secondary"}`}
                  onClick={() => handleAddToList(item)}
                >
                  {isLoggedIn ? "Listeme Ekle" : "Giriş yapıp listene ekle"}
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
              <h6 className="placeholder-glow"><span className="placeholder col-9"></span></h6>
              <p className="placeholder-glow mb-0"><span className="placeholder col-12"></span><span className="placeholder col-8"></span></p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const totalCount = mergedList.length;

  return (
    <>
      <AkademiBaseHeader />

      <DashboardLayout containerClass="dashboard-wide"
        title={<><i className="bi bi-collection-play me-2"></i> Tüm Videolar</>}
        right={
          <div className="d-flex flex-wrap gap-2 align-items-end">
            <form className="d-flex" onSubmit={onSearch}>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  className="form-control"
                  placeholder="Ara (başlık/açıklama)…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <button className="btn btn-outline-primary" type="submit">Ara</button>
              </div>
            </form>
            <select className="form-select" style={{ minWidth: 160 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Tümü</option>
              <option value="link">Sadece YouTube</option>
              <option value="file">Sadece Dosya</option>
            </select>
            <select className="form-select" style={{ minWidth: 160 }} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="newest">En yeni</option>
              <option value="title">Başlığa göre</option>
            </select>
            <div className="btn-group" role="group" aria-label="Görünüm">
              <button className={`btn btn-outline-secondary ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid görünüm">
                <i className="bi bi-grid-3x3-gap-fill"></i>
              </button>
              <button className={`btn btn-outline-secondary ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="Liste görünüm">
                <i className="bi bi-list-ul"></i>
              </button>
            </div>
            <span className="badge text-bg-secondary align-self-center ms-1">{totalCount}</span>
          </div>
        }
      >
        {loading ? (
          <div className="py-4"><Skeleton /></div>
        ) : noData ? (
          <div className="alert alert-light m-0">Kayıt bulunamadı.</div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="row row-cols-1 row-cols-md-3 g-3">
                {mergedList.map((item) => (
                  <div className="col" key={`${item.kind}-${item.id}`}>
                    <VideoCard item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="vstack gap-3">
                {mergedList.map((item) => (
                  <VideoCard key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </DashboardLayout>

      <AkademiBaseFooter />

      <style>{`
      
        .object-fit-cover { object-fit: cover; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .video-card { border-radius: 1rem; }
        .video-card .rounded-top { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
        .video-card:hover { transform: translateY(-2px); box-shadow: 0 .75rem 1.5rem rgba(0,0,0,.08) !important; transition: .2s ease; }
        .video-card--list img { border-top-right-radius: 0 !important; border-bottom-left-radius: 1rem; }
        .media-icons i { background: rgba(0,0,0,0.5); padding: 4px; border-radius: 6px; }
        .ratio > img { display: block; }
      `}</style>
    </>
  );
}