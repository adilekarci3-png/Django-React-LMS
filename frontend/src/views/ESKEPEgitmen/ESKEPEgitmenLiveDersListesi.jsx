// src/views/AkademiEgitmen/ESKEPEgitmenLiveDersListesi.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

const DATE_FMT = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

function humanize(dateStr) {
  try {
    const diffMin = Math.round((new Date(dateStr) - new Date()) / 60000);
    if (Math.abs(diffMin) < 1) return "şimdi";
    const abs = Math.abs(diffMin);
    const unit = abs < 60 ? "dk" : abs < 1440 ? "saat" : "gün";
    const val = abs < 60 ? abs : abs < 1440 ? Math.round(abs / 60) : Math.round(abs / 1440);
    return diffMin > 0 ? `${val} ${unit} sonra` : `${val} ${unit} önce`;
  } catch { return ""; }
}

function getStatus(dateStr) {
  const diffMin = (new Date(dateStr) - new Date()) / 60000;
  if (diffMin >= -15 && diffMin <= 15) return "live";
  if (diffMin > 15) return "upcoming";
  return "past";
}

function StatusBadge({ status }) {
  const map = {
    live:     { cls: "bg-danger-subtle text-danger border border-danger-subtle",          label: "Canlı" },
    upcoming: { cls: "bg-success-subtle text-success border border-success-subtle",       label: "Yaklaşan" },
    past:     { cls: "bg-secondary-subtle text-secondary border border-secondary-subtle", label: "Geçmiş" },
  };
  const info = map[status] ?? map.past;
  return <span className={`badge ${info.cls}`} style={{ fontSize: 11 }}>{info.label}</span>;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export default function ESKEPEgitmenLiveDersListesi() {
  const api = useAxios();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/live-lessons/");
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire("Hata", "Dersler yüklenirken bir sorun oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const onDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `"${title}" canlı dersi silinecek.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/live-lessons/${id}/`);
      Swal.fire({ icon: "success", title: "Canlı ders silindi.", timer: 1500, showConfirmButton: false });
      fetchAll();
    } catch {
      Swal.fire("Hata", "Canlı ders silinemedi.", "error");
    }
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      Swal.fire({ icon: "success", title: "Bağlantı kopyalandı.", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Kopyalanamadı." });
    }
  };

  const filtered = useMemo(() => {
    let arr = [...lessons];
    if (q.trim()) {
      const t = q.toLowerCase();
      arr = arr.filter(
        (x) => x.title?.toLowerCase().includes(t) || x.description?.toLowerCase().includes(t)
      );
    }
    if (filter !== "all") arr = arr.filter((x) => getStatus(x.datetime) === filter);
    arr.sort((a, b) => {
      const da = new Date(a.datetime).getTime();
      const db = new Date(b.datetime).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return arr;
  }, [lessons, q, filter, sort]);

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
                  <i className="fa-solid fa-video text-danger"></i> Canlı Derslerim
                </h3>
                <p className="text-muted mb-4">
                  Planladığınız ve gerçekleştirdiğiniz canlı dersleri bu sayfadan yönetebilirsiniz.
                </p>

                {/* Araç çubuğu */}
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                  <div className="input-group" style={{ maxWidth: 360 }}>
                    <input className="form-control" placeholder="Başlık veya açıklamada ara…"
                      value={q} onChange={(e) => setQ(e.target.value)} />
                    {q && (
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => setQ("")}>
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <select className="form-select" style={{ width: 130 }} value={filter}
                      onChange={(e) => setFilter(e.target.value)}>
                      <option value="all">Tümü</option>
                      <option value="live">Canlı</option>
                      <option value="upcoming">Yaklaşan</option>
                      <option value="past">Geçmiş</option>
                    </select>
                    <select className="form-select" style={{ width: 120 }} value={sort}
                      onChange={(e) => setSort(e.target.value)}>
                      <option value="newest">En Yeni</option>
                      <option value="oldest">En Eski</option>
                    </select>
                    
                    <button className="btn btn-success"
                      onClick={() => navigate("/eskepegitmen/canli-ders-ekle/")}>
                      + Yeni Canlı Ders Ekle
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="d-flex align-items-center gap-2 text-muted py-5 justify-content-center">
                    <span className="spinner-border spinner-border-sm" /> Yükleniyor…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-solid fa-video text-danger" style={{ fontSize: 40 }}></i>
                    <p className="text-muted mt-3 mb-3">
                      {q ? "Aramanıza uygun ders bulunamadı." : "Henüz canlı ders eklenmemiş."}
                    </p>
                    {!q && (
                      <button className="btn btn-primary"
                        onClick={() => navigate("/eskepegitmen/canli-ders-ekle/")}>
                        İlk dersi ekle
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">{filtered.length} ders listeleniyor</p>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                      {filtered.map((lesson) => {
                        const st = getStatus(lesson.datetime);
                        const domain = getDomain(lesson.platform_url);
                        return (
                          <div className="col" key={lesson.id}>
                            <div className="card h-100 border-0 shadow-sm">
                              <div className="card-body d-flex flex-column">
                                {/* Başlık + badge + tarih */}
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="me-2">
                                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                      <h6 className="card-title fw-bold mb-0">{lesson.title}</h6>
                                      <StatusBadge status={st} />
                                    </div>
                                    {domain && (
                                      <span className="text-muted small">
                                        <i className="fa-solid fa-link me-1"></i>{domain}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-end ms-2 text-nowrap">
                                    <div className="fw-medium small">{DATE_FMT.format(new Date(lesson.datetime))}</div>
                                    <div className="text-muted" style={{ fontSize: 11 }}>{humanize(lesson.datetime)}</div>
                                  </div>
                                </div>

                                {/* Açıklama */}
                                {lesson.description && (
                                  <p className="small text-secondary mb-3"
                                    style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                    {lesson.description}
                                  </p>
                                )}

                                {/* Butonlar */}
                                <div className="d-flex flex-wrap gap-2 mt-auto">
                                  {lesson.platform_url && (
                                    <>
                                      <a href={lesson.platform_url} target="_blank" rel="noopener noreferrer"
                                        className={`btn btn-sm ${st === "live" ? "btn-danger" : st === "upcoming" ? "btn-primary" : "btn-secondary"}`}>
                                        <i className="fa-solid fa-arrow-up-right-from-square me-1"></i>
                                        {st === "live" ? "Derse Katıl" : "Bağlantıyı Aç"}
                                      </a>
                                      <button className="btn btn-sm btn-outline-dark"
                                        onClick={() => handleCopy(lesson.platform_url)}>
                                        <i className="fa-regular fa-copy me-1"></i> Kopyala
                                      </button>
                                    </>
                                  )}
                                  <button className="btn btn-sm btn-outline-warning ms-auto"
                                    onClick={() => navigate(`/eskepegitmen/canli-ders-duzenle/${lesson.id}/`)}>
                                    Düzenle
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger"
                                    onClick={() => onDelete(lesson.id, lesson.title)}>
                                    Sil
                                  </button>
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