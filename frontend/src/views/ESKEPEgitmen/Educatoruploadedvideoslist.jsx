// src/views/AkademiEgitmen/EducatorUploadedVideosList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

// ── Göstermelik veriler (API boş dönünce kullanılır) ─────────────────────
const MOCK_VIDEOS = [
  {
    id: "mock-1",
    title: "Kuran-ı Kerim Tecvid Dersleri - Bölüm 1",
    description: "Tecvid kurallarının temel kavramları ve harflerin mahreçleri ele alınmaktadır.",
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: null,
    duration: 1845,
    file_size: 245 * 1024 * 1024,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    _mock: true,
  },
  {
    id: "mock-2",
    title: "Hafızlık Programı Tanıtım Videosu",
    description: "ESKEP hafızlık programının içeriği, hedefleri ve kayıt sürecine dair bilgilendirme videosu.",
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: null,
    duration: 732,
    file_size: 98 * 1024 * 1024,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    _mock: true,
  },
  {
    id: "mock-3",
    title: "Arapça Gramer - Fiil Çekimleri",
    description: "Arapça fiil çekimlerinin mazi, muzari ve emir kalıpları örneklerle açıklanmaktadır.",
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: null,
    duration: 2610,
    file_size: 320 * 1024 * 1024,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    _mock: true,
  },
];

function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatSize(bytes) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EducatorUploadedVideosList() {
  const api = useAxios();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("instructor/video/");
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) {
        setItems(MOCK_VIDEOS);
        setIsMock(true);
      } else {
        setItems(data);
        setIsMock(false);
      }
    } catch {
      // API hata verirse de göstermelik verileri göster
      setItems(MOCK_VIDEOS);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    let arr = [...items];
    if (q.trim()) {
      const t = q.toLowerCase();
      arr = arr.filter(
        (x) => x.title?.toLowerCase().includes(t) || x.description?.toLowerCase().includes(t)
      );
    }
    arr.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return arr;
  }, [items, q, sort]);

  const onDelete = async (id, title) => {
    if (isMock) {
      Swal.fire("Bilgi", "Bu örnek bir kayıttır, silinemez.", "info");
      return;
    }
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `"${title}" videosu kalıcı olarak silinecek.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`instructor/video/${id}/delete/`);
      Swal.fire({ icon: "success", title: "Video silindi.", timer: 1500, showConfirmButton: false });
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
                  <i className="fa-solid fa-photo-film text-info"></i> Videolarım
                </h3>
                <p className="text-muted mb-4">
                  Sisteme yüklediğiniz tüm videoları bu sayfadan izleyebilir ve yönetebilirsiniz.
                </p>

                {/* Göstermelik veri uyarısı */}
                {/* {isMock && !loading && (
                  <div className="alert alert-info alert-dismissible d-flex align-items-center gap-2 mb-4 py-2">
                    <i className="fa-solid fa-circle-info"></i>
                    <span className="small">Aşağıdaki videolar örnek içeriklerdir. Video yükledikçe burada görüntülenecektir.</span>
                  </div>
                )} */}

                {/* Araç çubuğu */}
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                  <div className="input-group" style={{ maxWidth: 400 }}>
                    <input className="form-control" placeholder="Başlık veya açıklamada ara…"
                      value={q} onChange={(e) => setQ(e.target.value)} />
                    {q && (
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setQ("")}>
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <select className="form-select" style={{ width: 140 }} value={sort}
                      onChange={(e) => setSort(e.target.value)}>
                      <option value="newest">En Yeni</option>
                      <option value="oldest">En Eski</option>
                    </select>
                    <button className="btn btn-success"
                      onClick={() => navigate("/eskepegitmen/video-ekle/")}>
                      + Yeni Video Yükle
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="d-flex align-items-center gap-2 text-muted py-5 justify-content-center">
                    <span className="spinner-border spinner-border-sm" /> Yükleniyor…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-solid fa-photo-film text-info" style={{ fontSize: 40 }}></i>
                    <p className="text-muted mt-3 mb-3">Aramanıza uygun video bulunamadı.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">{filtered.length} video listeleniyor</p>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                      {filtered.map((item) => {
                        const videoUrl = item.video_url || item.video_file || "#";
                        const thumb = item.thumbnail || null;
                        const duration = formatDuration(item.duration);
                        const size = formatSize(item.file_size);
                        return (
                          <div className="col" key={item.id}>
                            <div className={`card h-100 border-0 shadow-sm ${item._mock ? "opacity-75" : ""}`}>
                              <div className="position-relative bg-dark"
                                style={{ height: 175, borderRadius: "8px 8px 0 0", overflow: "hidden" }}>
                                {thumb ? (
                                  <img src={thumb} alt={item.title} className="w-100 h-100"
                                    style={{ objectFit: "cover", opacity: 0.85 }} />
                                ) : (
                                  <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-2">
                                    <i className="fa-solid fa-photo-film text-info" style={{ fontSize: 36, opacity: 0.5 }}></i>
                                    <span className="text-white small" style={{ opacity: 0.4 }}>Önizleme yok</span>
                                  </div>
                                )}
                                {duration && (
                                  <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white">
                                    {duration}
                                  </span>
                                )}
                                {/* {item._mock && (
                                  <span className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">
                                    Örnek
                                  </span>
                                )} */}
                              </div>

                              <div className="card-body d-flex flex-column">
                                <h6 className="card-title fw-semibold mb-1"
                                  title={item.title}
                                  style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                  {item.title}
                                </h6>
                                {item.description && (
                                  <p className="small text-muted mb-2"
                                    style={{ flexGrow: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                    {item.description}
                                  </p>
                                )}
                                <div className="d-flex gap-3 text-muted small mb-3">
                                  <span>
                                    <i className="fa-regular fa-calendar me-1"></i>
                                    {new Date(item.created_at).toLocaleDateString("tr-TR")}
                                  </span>
                                  {size && (
                                    <span>
                                      <i className="fa-solid fa-database me-1"></i>
                                      {size}
                                    </span>
                                  )}
                                </div>

                                <div className="d-flex gap-2 mt-auto">
                                  {videoUrl !== "#" && (
                                    <a href={videoUrl} target="_blank" rel="noreferrer"
                                      className="btn btn-outline-info btn-sm flex-grow-1">
                                      <i className="fa-solid fa-play me-1"></i> İzle
                                    </a>
                                  )}
                                  {!item._mock && (
                                    <>
                                      <button className="btn btn-outline-secondary btn-sm"
                                        onClick={() => navigate(`/eskepegitmen/video-duzenle/${item.id}/`)}>
                                        Düzenle
                                      </button>
                                      <button className="btn btn-outline-danger btn-sm"
                                        onClick={() => onDelete(item.id, item.title)}>
                                        Sil
                                      </button>
                                    </>
                                  )}
                                </div>
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