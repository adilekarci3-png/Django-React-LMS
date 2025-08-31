import React, { useEffect, useMemo, useState } from "react";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import Swal from "sweetalert2";
import Modal from "react-modal";
import ESKEPEgitmenAddCanliDersPopup from "./Popup/ESKEPEgitmenAddCanliDersPopup";
import {
  FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiCopy, FiLink, FiRefreshCw, FiSearch
} from "react-icons/fi";

Modal.setAppElement("#root");

const DATE_FMT = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function humanize(dateStr) {
  try {
    const dt = new Date(dateStr);
    const diffMs = dt - new Date();
    const diffMin = Math.round(diffMs / 60000);
    if (Math.abs(diffMin) < 1) return "şimdi";
    const abs = Math.abs(diffMin);
    const unit = abs < 60 ? "dk" : abs < 60 * 24 ? "saat" : "gün";
    const val =
      abs < 60 ? abs :
        abs < 60 * 24 ? Math.round(abs / 60) :
          Math.round(abs / (60 * 24));
    return diffMin > 0 ? `${val} ${unit} sonra` : `${val} ${unit} önce`;
  } catch {
    return "";
  }
}

function getStatus(dateStr) {
  const now = new Date();
  const start = new Date(dateStr);
  const diffMin = (start - now) / 60000;
  if (diffMin >= -15 && diffMin <= 15) return "live";     // canlı: ±15 dk penceresi
  if (diffMin > 15) return "upcoming";
  return "past";
}

function statusBadge(status) {
  const map = {
    live: { className: "badge bg-danger-subtle text-danger border border-danger-subtle", label: "Canlı" },
    upcoming: { className: "badge bg-success-subtle text-success border border-success-subtle", label: "Yaklaşan" },
    past: { className: "badge bg-secondary-subtle text-secondary border border-secondary-subtle", label: "Geçmiş" },
  };
  return map[status] ?? map.upcoming;
}

function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const ESKEPEgitmenLiveDersListesi = () => {
  const api = useAxios();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | upcoming | live | past
  const [sort, setSort] = useState("newest"); // newest | oldest

  const fetchLessons = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/live-lessons/");
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Veri alınamadı", error);
      setErr("Dersler yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu canlı dersi silmek istiyor musunuz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (confirmed.isConfirmed) {
      try {
        await api.delete(`/live-lessons/${id}/`);
        await fetchLessons();
        Swal.fire("Silindi", "Canlı ders silindi", "success");
      } catch (error) {
        console.error("Silme işlemi başarısız", error);
        Swal.fire("Hata", "Canlı ders silinemedi", "error");
      }
    }
  };
function joinBtnClass(status) {
  // Derse katıl/bağlantı butonu rengi
  switch (status) {
    case "live":      return "btn-danger";   // canlı: kırmızı
    case "upcoming":  return "btn-primary";  // yaklaşan: mavi
    case "past":
    default:          return "btn-secondary"; // geçmiş: gri
  }
}
  const filtered = useMemo(() => {
    let arr = [...lessons];

    // arama
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter(
        (x) =>
          x.title?.toLowerCase().includes(t) ||
          x.description?.toLowerCase().includes(t) ||
          x.platform_url?.toLowerCase().includes(t)
      );
    }

    // durum filtresi
    if (filter !== "all") {
      arr = arr.filter((x) => getStatus(x.datetime) === filter);
    }

    // sıralama
    arr.sort((a, b) => {
      const da = new Date(a.datetime).getTime();
      const db = new Date(b.datetime).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return arr;
  }, [lessons, q, filter, sort]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({ icon: "success", title: "Kopyalandı", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Kopyalanamadı" });
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingId(null);
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3">
              <Sidebar />
            </div>

            <div className="col-lg-9">
              {/* Araç Çubuğu */}
              <div className="bg-white p-3 p-md-4 rounded shadow toolbar-sticky">
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                  <h3 className="text-primary fw-bold m-0">📅 Canlı Dersler</h3>
                  {!loading && !err && (
                    <span className="badge bg-light text-secondary ms-2">
                      {filtered.length}
                    </span>
                  )}
                  <div className="d-flex flex-wrap gap-2">
                    <div className="input-group">
                      <span className="input-group-text"><FiSearch /></span>
                      <input
                        className="form-control"
                        placeholder="Ara (başlık, açıklama, link)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                    </div>

                    <select
                      className="form-select"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Tümü</option>
                      <option value="live">Canlı</option>
                      <option value="upcoming">Yaklaşan</option>
                      <option value="past">Geçmiş</option>
                    </select>

                    <select
                      className="form-select"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="newest">En Yeni</option>
                      <option value="oldest">En Eski</option>
                    </select>

                    <button
                      onClick={() => setModalIsOpen(true)}
                      className="btn btn-primary"
                    >
                      <FiPlus className="me-2" /> Yeni Ders
                    </button>

                    <button
                      onClick={fetchLessons}
                      className="btn btn-outline-secondary"
                      title="Yenile"
                    >
                      <FiRefreshCw />
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste / Grid */}
              <div className="mt-3 mt-md-4">
                {loading && (
                  <div className="bg-white p-4 rounded shadow text-center">
                    Yükleniyor…
                  </div>
                )}

                {!loading && err && (
                  <div className="bg-white p-4 rounded shadow text-danger">
                    {err}
                  </div>
                )}

                {!loading && !err && filtered.length === 0 && (
                  <div className="bg-white p-5 rounded shadow text-center">
                    <div className="mb-2">Henüz sonuç yok.</div>
                    <button className="btn btn-primary" onClick={() => setModalIsOpen(true)}>
                      <FiPlus className="me-2" />
                      İlk canlı dersi ekle
                    </button>
                  </div>
                )}

                {!loading && !err && filtered.length > 0 && (
                  <div className="row g-3 g-md-4">
                    {filtered.map((lesson) => {
                      const st = getStatus(lesson.datetime);
                      const badge = statusBadge(st);
                      const domain = getDomain(lesson.platform_url);
                      const isJoinable = st === "live" || st === "upcoming";

                      return (
                        <div key={lesson.id} className="col-12 col-md-6">
                          <div className="card h-100 border-0 shadow-sm">
                            <div className="card-body d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="me-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <h5 className="card-title mb-0">{lesson.title}</h5>
                                    <span className={badge.className} style={{ fontSize: 12 }}>
                                      {badge.label}
                                    </span>
                                  </div>
                                  {domain && (
                                    <div className="text-muted small mt-1 d-flex align-items-center gap-1">
                                      <FiLink /> {domain}
                                    </div>
                                  )}
                                </div>

                                <div className="text-end">
                                  <div className="fw-medium">{DATE_FMT.format(new Date(lesson.datetime))}</div>
                                  <div className="text-muted small">{humanize(lesson.datetime)}</div>
                                </div>
                              </div>

                              {lesson.description && (
                                <p className="card-text mt-3 text-secondary" style={{ minHeight: 48 }}>
                                  {lesson.description.length > 150
                                    ? `${lesson.description.slice(0, 150)}…`
                                    : lesson.description}
                                </p>
                              )}

                              <div className="mt-auto d-flex flex-wrap gap-2">
                                {lesson.platform_url && (
                                  <>
                                    <a
                                      href={lesson.platform_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`btn btn-sm ${joinBtnClass(st)}`}
                                      title="Bağlantıyı aç"
                                    >
                                      <FiExternalLink className="me-2" />
                                      {st === "live" ? "Derse Katıl" : "Bağlantıyı Aç"}
                                    </a>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-dark"
                                      onClick={() => handleCopy(lesson.platform_url)}
                                    >
                                      <FiCopy className="me-2" />
                                      Kopyala
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning ms-auto"
                                  onClick={() => {
                                    setEditingId(lesson.id);
                                    setModalIsOpen(true);
                                  }}
                                >
                                  <FiEdit2 className="me-2" />
                                  Düzenle
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(lesson.id)}
                                >
                                  <FiTrash2 className="me-2" />
                                  Sil
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Canlı Ders Ekle/Düzenle"
        style={{
          content: {
            maxWidth: "860px",
            margin: "auto",
            height: "90%",
          },
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">{editingId ? "Dersi Düzenle" : "Yeni Ders Ekle"}</h5>
          <button onClick={closeModal} className="btn btn-sm btn-secondary">Kapat</button>
        </div>

        <ESKEPEgitmenAddCanliDersPopup
          lessonId={editingId}
          onSuccess={() => {
            closeModal();
            fetchLessons();
          }}
        />
      </Modal>

      <ESKEPBaseFooter />
    </>
  );
};

export default ESKEPEgitmenLiveDersListesi;
