// src/pages/MySavedVideosPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import { savedVideosApi } from "../../api/savedVideosApi";
import { useAuthStore } from "../../store/auth";
import DashboardLayout from "../layouts/DashboardLayout";

export default function MySavedVideosPage() {
  const navigate = useNavigate();
  const { listSaved, removeSaved } = savedVideosApi();
  const [isLoggedIn, rehydrated] = useAuthStore((s) => [s.isLoggedIn(), s.rehydrated]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI durumları
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | link | file
  const [sortKey, setSortKey] = useState("saved-newest"); // saved-newest | source-newest | title
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  const loadSaved = async () => {
    setLoading(true);
    try {
      const rows = await listSaved();
      setItems(Array.isArray(rows) ? rows : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rehydrated) return;
    if (!isLoggedIn) return;
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehydrated, isLoggedIn]);

  // filtre + sıralama
  const filteredSorted = useMemo(() => {
    let list = [...items];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (x) =>
          (x.title || "").toLowerCase().includes(s) ||
          (x.description || "").toLowerCase().includes(s)
      );
    }
    if (typeFilter !== "all") list = list.filter((x) => x.kind === typeFilter);

    list.sort((a, b) => {
      switch (sortKey) {
        case "title":
          return String(a.title || "").localeCompare(String(b.title || ""));
        case "source-newest":
          return new Date(b.source_created_at || 0) - new Date(a.source_created_at || 0);
        case "saved-newest":
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
    return list;
  }, [items, q, typeFilter, sortKey]);

  const onRemove = async (savedId) => {
    if (!window.confirm("Listenden kaldırmak istiyor musun?")) return;
    const prev = items;
    setItems((arr) => arr.filter((x) => x.id !== savedId)); // optimistic
    try {
      await removeSaved(savedId);
    } catch (e) {
      alert("Kaldırma başarısız.");
      setItems(prev);
    }
  };

  const noData = !loading && filteredSorted.length === 0;
  const totalCount = filteredSorted.length;

  const VideoCard = ({ item }) => (
    <div className={`card h-100 border-0 shadow-sm saved-card ${viewMode === "list" ? "saved-card--list" : ""}`}>
      <div className={`position-relative ${viewMode === "list" ? "row g-0 flex-md-row" : ""}`}>
        <div className={viewMode === "list" ? "col-md-5" : ""}>
          <div className="ratio ratio-16x9 position-relative overflow-hidden rounded-top">
            {item.thumb ? (
              <a href={item.watch || "#"} target="_blank" rel="noreferrer" className="d-block w-100 h-100">
                <img src={item.thumb} alt={item.title} className="w-100 h-100 obj-cover" />
              </a>
            ) : (
              <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
                <i className="bi bi-file-earmark-play fs-1 text-white-50"></i>
              </div>
            )}
            {/* küçük üst ikon */}
            <div className="position-absolute top-0 start-0 p-2 d-flex gap-2">
              {item.kind === "link" && <i className="bi bi-youtube text-danger fs-5 bg-dark bg-opacity-50 rounded p-1"></i>}
              {item.kind === "file" && <i className="bi bi-file-earmark-play text-white fs-5 bg-dark bg-opacity-50 rounded p-1"></i>}
            </div>
          </div>
        </div>

        <div className={viewMode === "list" ? "col-md-7" : ""}>
          <div className="card-body d-flex flex-column gap-2">
            <h6 className="card-title mb-1 text-truncate" title={item.title}>
              <i className="bi bi-play-btn-fill me-2 text-primary"></i>{item.title}
            </h6>
            <p className="card-text small text-muted m-0 clamp-2">
              {(item.description || "").slice(0, 180)}{item.description && item.description.length > 180 ? "…" : ""}
            </p>
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
                <button className="btn btn-outline-danger btn-sm" onClick={() => onRemove(item.id)}>
                  <i className="bi bi-bookmark-x me-1"></i> Kaldır
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

  // Giriş yapmamışsa yine DashboardLayout içinde basit bir uyarı gösterelim
  if (rehydrated && !isLoggedIn) {
    return (
      <>
        <AkademiBaseHeader />
        <DashboardLayout
          title={<><i className="bi bi-bookmarks me-2"></i> Kayıtlı Videolarım</>}
          right={null}
        >
          <div className="bg-white p-5 rounded shadow text-center">
            <h5 className="mb-3">Kayıtlı Videolarım</h5>
            <p>Videoları görmek için lütfen giriş yapın.</p>
            <Link to="/login/" className="btn btn-primary">Giriş Yap</Link>
          </div>
        </DashboardLayout>
        <AkademiBaseFooter />
      </>
    );
  }

  return (
    <>
      <AkademiBaseHeader />

      <DashboardLayout
        title={<><i className="bi bi-bookmarks me-2"></i> Kayıtlı Videolarım</>}
        right={
          <div className="d-flex flex-wrap gap-2 align-items-end">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                className="form-control"
                placeholder="Ara (başlık/açıklama)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ minWidth: 140 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Tümü</option>
              <option value="link">YouTube</option>
              <option value="file">Dosya</option>
            </select>
            <select className="form-select" style={{ minWidth: 180 }} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="saved-newest">Son kaydedilenler</option>
              <option value="source-newest">İçerik en yeni</option>
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
          </div>
        }
      >
        {loading ? (
          <div className="py-3"><Skeleton /></div>
        ) : noData ? (
          <div className="alert alert-light">
            Listeniz boş. <Link to="/videos">Tüm videolara göz atın</Link> ve ekleyin.
          </div>
        ) : viewMode === "grid" ? (
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {filteredSorted.map((item) => (
              <div className="col" key={item.id}>
                <VideoCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="vstack gap-3">
            {filteredSorted.map((item) => (
              <VideoCard item={item} key={item.id} />
            ))}
          </div>
        )}
      </DashboardLayout>

      <AkademiBaseFooter />

      <style>{`
        .obj-cover { object-fit: cover; }
        .clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .saved-card { border-radius: 1rem; }
        .saved-card .rounded-top { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
        .saved-card:hover { transform: translateY(-2px); box-shadow: 0 .75rem 1.5rem rgba(0,0,0,.08) !important; transition: .2s ease; }
        .saved-card--list img { border-top-right-radius: 0 !important; border-bottom-left-radius: 1rem; }
      `}</style>
    </>
  );
}
