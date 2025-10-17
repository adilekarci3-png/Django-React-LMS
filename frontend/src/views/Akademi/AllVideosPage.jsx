import React, { useEffect, useState } from "react";
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
  const [filter, setFilter] = useState("all");
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
        id: x.id, kind: "link", title: x.title, description: x.description, created_at: x.created_at,
        thumb: getYouTubeThumb(x.videoUrl), watch: getYouTubeEmbedUrl(x.videoUrl),
      }));
      const files = filesRaw.map((x) => ({
        id: x.id, kind: "file", title: x.title, description: x.description, created_at: x.created_at,
        thumb: "", watch: x.file || "#",
      }));

      setLinkItems([...links].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setFileItems([...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } finally { setLoading(false); }
  };

  useEffect(() => { if (rehydrated) fetchAll(); /* eslint-disable-next-line */ }, [rehydrated]);

  const onSearch = async (e) => { e.preventDefault(); await fetchAll(); };
  const handleAddToList = async (item) => {
    if (!isLoggedIn) { navigate("/login/?next=/videos"); return; }
    try { await addSaved({ kind: item.kind, video_id: item.id }); alert("Videonuz listenize eklendi."); }
    catch { alert("Ekleme yapılamadı."); }
  };

  const showLinks = filter === "all" || filter === "link";
  const showFiles = filter === "all" || filter === "file";
  const noData = (showLinks ? linkItems.length === 0 : true) && (showFiles ? fileItems.length === 0 : true);

  return (
    <>
      <AkademiBaseHeader />

      <DashboardLayout
        title="📚 Tüm Videolar"
        right={
          <div className="d-flex gap-2">
            <form className="d-flex" onSubmit={onSearch}>
              <input className="form-control me-2" placeholder="Ara (başlık/açıklama)…"
                     value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn btn-outline-primary" type="submit">Ara</button>
            </form>
            <select className="form-select" style={{ minWidth: 180 }}
                    value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Video türü filtresi">
              <option value="all">Tümü</option>
              <option value="link">Sadece YouTube</option>
              <option value="file">Sadece Dosya</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <div>Yükleniyor...</div>
        ) : noData ? (
          <div className="alert alert-light m-0">Kayıt bulunamadı.</div>
        ) : (
          <>
            {showLinks && linkItems.length > 0 && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="m-0">YouTube Videoları</h5>
                  <span className="badge text-bg-secondary">{linkItems.length}</span>
                </div>
                <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
                  {linkItems.map((item) => (
                    <div className="col" key={`link-${item.id}`}>
                      <div className="card h-100 shadow-sm">
                        {item.thumb ? (
                          <a href={item.watch} target="_blank" rel="noreferrer">
                            <img src={item.thumb} className="card-img-top" alt={item.title} />
                          </a>
                        ) : (
                          <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center">
                            <span className="text-muted">Önizleme yok</span>
                          </div>
                        )}
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="card-title mb-0 card-title-ellipsis" title={item.title}>{item.title}</h6>
                            <span className="badge text-bg-secondary">YouTube</span>
                          </div>
                          <p className="card-text small text-muted mt-2" style={{ flexGrow: 1 }}>
                            {(item.description || "").slice(0, 100)}{item.description && item.description.length > 100 ? "…" : ""}
                          </p>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <a className="btn btn-outline-primary btn-sm" href={item.watch} target="_blank" rel="noreferrer">İzle</a>
                            <button className={`btn btn-sm ${isLoggedIn ? "btn-success" : "btn-outline-secondary"}`}
                                    onClick={() => handleAddToList(item)}>
                              {isLoggedIn ? "Listeme Ekle" : "Giriş yapıp listene ekle"}
                            </button>
                          </div>
                        </div>
                        <div className="card-footer small text-muted">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {showFiles && fileItems.length > 0 && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="m-0">Dosya Videoları</h5>
                  <span className="badge text-bg-secondary">{fileItems.length}</span>
                </div>
                <div className="row row-cols-1 row-cols-md-3 g-3">
                  {fileItems.map((item) => (
                    <div className="col" key={`file-${item.id}`}>
                      <div className="card h-100 shadow-sm">
                        <div className="ratio ratio-16x9 bg-dark">
                          {item.watch && item.watch !== "#" ? (
                            <video src={item.watch} preload="metadata" controls={false}
                                   style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center text-white-50">Önizleme yok</div>
                          )}
                        </div>
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="card-title mb-0 card-title-ellipsis" title={item.title}>{item.title}</h6>
                            <span className="badge text-bg-secondary">Dosya</span>
                          </div>
                          <p className="card-text small text-muted mt-2" style={{ flexGrow: 1 }}>
                            {(item.description || "").slice(0, 100)}{item.description && item.description.length > 100 ? "…" : ""}
                          </p>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            {item.watch && item.watch !== "#" ? (
                              <a className="btn btn-outline-primary btn-sm" href={item.watch} target="_blank" rel="noreferrer">İzle</a>
                            ) : (
                              <button className="btn btn-outline-secondary btn-sm" disabled>Dosya yok</button>
                            )}
                            <button className={`btn btn-sm ${isLoggedIn ? "btn-success" : "btn-outline-secondary"}`}
                                    onClick={() => handleAddToList(item)}>
                              {isLoggedIn ? "Listeme Ekle" : "Giriş yapıp listene ekle"}
                            </button>
                          </div>
                        </div>
                        <div className="card-footer small text-muted">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </DashboardLayout>

      <AkademiBaseFooter />
    </>
  );
}
