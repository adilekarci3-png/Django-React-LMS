// src/views/AkademiEgitmen/EducatorYouTubeVideosList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function getThumb(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}
function getEmbed(url) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}
// function getWatch(url) {
//   const id = getYouTubeId(url);
//   return id ? `https://www.youtube.com/watch?v=${id}` : url;
// }

export default function EducatorYouTubeVideosList() {
  const api = useAxios();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");


  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("educator/video/link/");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire("Hata", "Videolar yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  // Client-side arama — arama backend'de desteklenmiyorsa burada filtrele
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter(
      (x) => x.title?.toLowerCase().includes(t) || x.description?.toLowerCase().includes(t)
    );
  }, [items, q]);

  // filtered zaten var

  const sorted = useMemo(() => {
  const arr = [...filtered];
  arr.sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sort === "newest" ? db - da : da - db;
  });
  return arr;
}, [filtered, sort]);

  const onDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `"${title}" video bağlantısı silinecek.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`educator/video/link/${id}/delete/`);
      Swal.fire({ icon: "success", title: "Video bağlantısı silindi.", timer: 1500, showConfirmButton: false });
      fetchAll();
    } catch {
      Swal.fire("Hata", "Silme işlemi başarısız oldu.", "error");
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12 mb-4"><Sidebar /></div>
            <div className="col-lg-9 col-md-8 col-12">
              <div className="bg-white p-5 rounded shadow">
                <h3 className="mb-2">
                  <i className="fa-brands fa-youtube text-danger"></i> YouTube Video Bağlantılarım
                </h3>
                <p className="text-muted mb-4">
                  Eklediğiniz YouTube video bağlantılarını bu sayfadan yönetebilirsiniz.
                </p>

                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                  <div className="input-group" style={{ maxWidth: 400 }}>
                    <input className="form-control" placeholder="Başlık veya açıklamada ara…"
                      value={q} onChange={(e) => setQ(e.target.value)} />
                    {q && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => setQ("")}>
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                  <select className="form-select" style={{ width: 120 }} value={sort}
                      onChange={(e) => setSort(e.target.value)}>
                      <option value="newest">En Yeni</option>
                      <option value="oldest">En Eski</option>
                    </select>
                    
                  <button className="btn btn-success"
                    onClick={() => navigate("/eskepegitmen/youtube-video-ekle/")}>
                    + Yeni Bağlantı Ekle
                  </button>
                  </div>
                </div>

                {loading ? (
                  <div className="d-flex align-items-center gap-2 text-muted py-5 justify-content-center">
                    <span className="spinner-border spinner-border-sm" /> Yükleniyor…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-brands fa-youtube text-danger" style={{ fontSize: 40 }}></i>
                    <p className="text-muted mt-3 mb-3">
                      {q ? "Aramanıza uygun video bulunamadı." : "Henüz video bağlantısı eklenmemiş."}
                    </p>
                    
                      <button className="btn btn-primary"
                        onClick={() => navigate("/eskepegitmen/youtube-video-ekle/")}>
                        İlk videoyu ekle
                      </button>
                    
                  </div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">{sorted.length} video listeleniyor</p>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                      {sorted.map((item) => {
                        const videoUrl = item.videoUrl || item.url || item.video_url;
                        const thumb = getThumb(videoUrl);
                        const embed = getEmbed(videoUrl);
                        // const watch = getWatch(videoUrl);
                        return (
                          <div className="col" key={item.id}>
                            <div className="card h-100 border-0 shadow-sm">
                              {thumb ? (
                                <a href={embed} target="_blank" rel="noreferrer">
                                  <img src={thumb} className="card-img-top" alt={item.title}
                                    style={{ objectFit: "cover", height: 155 }} />
                                </a>
                              ) : (
                                <div className="d-flex align-items-center justify-content-center bg-light"
                                  style={{ height: 155, borderRadius: "8px 8px 0 0" }}>
                                  <i className="fa-brands fa-youtube text-secondary" style={{ fontSize: 36 }}></i>
                                </div>
                              )}
                              <div className="card-body d-flex flex-column">
                                <h6 className="card-title fw-semibold"
                                  style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: 40 }}
                                  title={item.title}>
                                  {item.title}
                                </h6>
                                {item.description && (
                                  <p className="card-text small text-muted" style={{ flexGrow: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                    {item.description}
                                  </p>
                                )}
                                <div className="d-flex justify-content-between align-items-center mt-2 gap-2">
                                  <a href={embed} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
  <i className="fa-solid fa-play me-1"></i> İzle
</a>
                                  <div className="d-flex gap-1">
                                    <button className="btn btn-outline-warning btn-sm"
                                      onClick={() => navigate(`/eskepegitmen/youtube-video-duzenle/${item.id}/`)}>
                                      Düzenle
                                    </button>
                                    <button className="btn btn-outline-danger btn-sm"
                                      onClick={() => onDelete(item.id, item.title)}>
                                      Sil
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="card-footer small text-muted bg-transparent">
                                {new Date(item.created_at).toLocaleDateString("tr-TR")}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}