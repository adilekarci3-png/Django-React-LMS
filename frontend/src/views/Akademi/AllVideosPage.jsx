// src/pages/AllVideosPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import { savedVideosApi } from "../../api/savedVideosApi";
import { useAuthStore } from "../../store/auth";

// Basit YouTube yardımcıları
const getYouTubeId = (url = "") => {
  const p =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const m = url?.match?.(p);
  return m ? m[1] : null;
};
const getYouTubeThumb = (url = "") => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};
const getYouTubeEmbedUrl = (url = "") => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "#";
};

export default function AllVideosPage() {
  const api = useAxios();
  const navigate = useNavigate();
  const { addSaved } = savedVideosApi();
  const [isLoggedIn, rehydrated] = useAuthStore((s) => [s.isLoggedIn(), s.rehydrated]);

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | link | file

  const [linkItems, setLinkItems] = useState([]);
  const [fileItems, setFileItems] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [linksRes, filesRes] = await Promise.all([
        api.get("educator/video/link/", { params: { search: q } }),
        api.get("educator/video/", { params: { search: q } }),
      ]);

      const linksRaw = Array.isArray(linksRes.data)
        ? linksRes.data
        : linksRes.data?.results || [];

      const filesRaw = Array.isArray(filesRes.data)
        ? filesRes.data
        : filesRes.data?.results || [];

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
        thumb: "", // dosyada kapak yoksa boş bırakıyoruz
        watch: x.file || "#",
      }));

      // Tarihe göre sıralayabilirsiniz (opsiyonel)
      setLinkItems([...links].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setFileItems([...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rehydrated) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehydrated]);

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchAll();
  };

  const handleAddToList = async (item) => {
    if (!isLoggedIn) {
      navigate("/login/?next=/videos");
      return;
    }
    try {
      await addSaved({ kind: item.kind, video_id: item.id });
      alert("Videonuz listenize eklendi.");
    } catch {
      alert("Ekleme yapılamadı.");
    }
  };

  // Filtreye göre hangi bölümlerin görüneceği
  const showLinks = filter === "all" || filter === "link";
  const showFiles = filter === "all" || filter === "file";

  // Filtre sonrası “kayıt yok” kontrolü
  const noData =
    (showLinks ? linkItems.length === 0 : true) &&
    (showFiles ? fileItems.length === 0 : true);

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          {/* Üst başlığı “çok ortalamadan” daha sıkı gösteriyoruz */}
          <div className="mb-3">
            <Header />
          </div>

          <div className="row mt-0 mt-md-4">
            {/* Sidebar */}
            <div className="col-lg-3">
              <Sidebar />
            </div>

            {/* İçerik */}
            <div className="col-lg-9">
              <div className="bg-white p-4 p-md-5 rounded shadow">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                  <h3 className="m-0 text-primary fw-bold">📚 Tüm Videolar</h3>

                  {/* Arama + Filtre */}
                  <div className="d-flex gap-2">
                    <form className="d-flex" onSubmit={onSearch}>
                      <input
                        className="form-control me-2"
                        placeholder="Ara (başlık/açıklama)…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                      <button className="btn btn-outline-primary" type="submit">
                        Ara
                      </button>
                    </form>

                    {/* Tek dropdown filtre */}
                    <select
                      className="form-select"
                      style={{ minWidth: 180 }}
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      aria-label="Video türü filtresi"
                    >
                      <option value="all">Tümü</option>
                      <option value="link">Sadece YouTube</option>
                      <option value="file">Sadece Dosya</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div>Yükleniyor...</div>
                ) : noData ? (
                  <div className="alert alert-light">Kayıt bulunamadı.</div>
                ) : (
                  <>
                    {/* YouTube Bölümü */}
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
                                    <img
                                      src={item.thumb}
                                      className="card-img-top"
                                      alt={item.title}
                                    />
                                  </a>
                                ) : (
                                  <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center">
                                    <span className="text-muted">Önizleme yok</span>
                                  </div>
                                )}

                                <div className="card-body d-flex flex-column">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <h6
                                      className="card-title mb-0"
                                      title={item.title}
                                      style={{ lineHeight: "1.2em", overflow: "hidden" }}
                                    >
                                      {item.title}
                                    </h6>
                                    <span className="badge text-bg-secondary">YouTube</span>
                                  </div>

                                  <p className="card-text small text-muted mt-2" style={{ flexGrow: 1 }}>
                                    {(item.description || "").slice(0, 100)}
                                    {item.description && item.description.length > 100 ? "…" : ""}
                                  </p>

                                  <div className="d-flex justify-content-between align-items-center mt-2">
                                    <a
                                      className="btn btn-outline-primary btn-sm"
                                      href={item.watch}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      İzle
                                    </a>
                                    <button
                                      className={`btn btn-sm ${
                                        isLoggedIn ? "btn-success" : "btn-outline-secondary"
                                      }`}
                                      onClick={() => handleAddToList(item)}
                                    >
                                      {isLoggedIn ? "Listeme Ekle" : "Giriş yapıp listene ekle"}
                                    </button>
                                  </div>
                                </div>

                                <div className="card-footer small text-muted">
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleString()
                                    : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Dosya Bölümü */}
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
                                    <video
                                      src={item.watch}
                                      preload="metadata"
                                      controls={false}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div className="d-flex align-items-center justify-content-center text-white-50">
                                      Önizleme yok
                                    </div>
                                  )}
                                </div>

                                <div className="card-body d-flex flex-column">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <h6
                                      className="card-title mb-0"
                                      title={item.title}
                                      style={{ lineHeight: "1.2em", overflow: "hidden" }}
                                    >
                                      {item.title}
                                    </h6>
                                    <span className="badge text-bg-secondary">Dosya</span>
                                  </div>

                                  <p className="card-text small text-muted mt-2" style={{ flexGrow: 1 }}>
                                    {(item.description || "").slice(0, 100)}
                                    {item.description && item.description.length > 100 ? "…" : ""}
                                  </p>

                                  <div className="d-flex justify-content-between align-items-center mt-2">
                                    {item.watch && item.watch !== "#" ? (
                                      <a
                                        className="btn btn-outline-primary btn-sm"
                                        href={item.watch}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        İzle
                                      </a>
                                    ) : (
                                      <button className="btn btn-outline-secondary btn-sm" disabled>
                                        Dosya yok
                                      </button>
                                    )}

                                    <button
                                      className={`btn btn-sm ${
                                        isLoggedIn ? "btn-success" : "btn-outline-secondary"
                                      }`}
                                      onClick={() => handleAddToList(item)}
                                    >
                                      {isLoggedIn ? "Listeme Ekle" : "Giriş yapıp listene ekle"}
                                    </button>
                                  </div>
                                </div>

                                <div className="card-footer small text-muted">
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleString()
                                    : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}
