import { useEffect, useMemo, useState } from "react";
import useAxios from "../../utils/useAxios";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import Swal from "sweetalert2";
import HafizBilgiEditModal from "./HafizBilgiEditModal";
import HafizBilgiDetailModal from "./HafizBilgiDetailModal";

function HafizBilgiList() {
  const api = useAxios();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [currentItem, setCurrentItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("hafizbilgi/list/");
      const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setData(rows);
    } catch (err) {
      console.error("Veri alınamadı", err);
      Swal.fire("Hata", "Veriler getirilemedi.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Yıl seçenekleri
  const yearOptions = useMemo(() => {
    const ys = new Set(
      data
        .map((r) => r.hafizlikbitirmeyili || r.bitirme_yili)
        .filter(Boolean)
    );
    return Array.from(ys).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  // Arama + yıl filtresi
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const y = String(year || "").trim();
    return data.filter((item) => {
      const text = `${item.full_name || ""} ${item.ceptel || ""} ${item.adres || ""}`.toLowerCase();
      const matchesText = needle === "" || text.includes(needle);
      const itemYear = String(item.hafizlikbitirmeyili || item.bitirme_yili || "");
      const matchesYear = !y || itemYear === y;
      return matchesText && matchesYear;
    });
  }, [data, q, year]);

  // Sayfalama
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const sliceStart = (pageSafe - 1) * pageSize;
  const visible = filtered.slice(sliceStart, sliceStart + pageSize);

  // filtre değişince ilk sayfaya dön
  useEffect(() => {
    setPage(1);
  }, [q, year]);

  const openEditModal = (item = null) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const openDetailModal = (item) => {
    setCurrentItem(item);
    setShowDetailModal(true);
  };

  return (
    <>
      <HBSBaseHeader />

      <section className="py-5" style={{ background: "linear-gradient(180deg, #eef6ff 0%, #ffffff 40%)" }}>
        <div className="container">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Üst toolbar */}
            <div className="card-body pb-2" style={{ background: "linear-gradient(90deg, #0ea5e9 0%, #38bdf8 40%, #e0f2fe 100%)" }}>
              <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center text-white">
                <div>
                  <h4 className="mb-1 d-flex align-items-center gap-2">
                    <i className="bi bi-people-fill"></i>
                    Hafız Bilgileri
                  </h4>
                  <div className="small fw-light">
                    Toplam{" "}
                    <span className="badge bg-light text-dark rounded-pill px-3 py-1">
                      {filtered.length}
                    </span>{" "}
                    kayıt
                    {q && (
                      <>
                        {" "}
                        • <span className="fw-semibold">“{q}”</span> için filtrelendi
                      </>
                    )}
                    {year && (
                      <>
                        {" "}
                        • Yıl: <span className="fw-semibold">{year}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {/* Arama */}
                  <div className="input-group input-group-sm" style={{ minWidth: 220 }}>
                    <span className="input-group-text bg-white border-0">
                      <i className="bi bi-search text-secondary"></i>
                    </span>
                    <input
                      className="form-control border-0"
                      placeholder="Ara: ad, telefon, adres…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>

                  {/* Yıl filtresi */}
                  <select
                    className="form-select form-select-sm border-0"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ minWidth: 140 }}
                  >
                    <option value="">Yıl (tümü)</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  {/* Yenile */}
                  <button className="btn btn-sm btn-outline-light" onClick={fetchData} title="Yenile">
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>

                  {/* Yeni ekle */}
                  <button className="btn btn-sm btn-light text-primary fw-semibold" onClick={() => openEditModal(null)}>
                    <i className="bi bi-plus-lg me-1"></i> Yeni Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Liste */}
            <div className="card-body">
              {loading ? (
                <div className="py-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="placeholder-glow mb-3">
                      <span className="placeholder col-12" style={{ height: 24, borderRadius: 9999 }}></span>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-2 fs-6 text-muted">Kayıt bulunamadı.</div>
                  <button className="btn btn-primary" onClick={() => openEditModal(null)}>
                    <i className="bi bi-plus-lg me-1"></i> Yeni kayıt oluştur
                  </button>
                </div>
              ) : (
                <>
                  {/* Masaüstü tablo */}
                  <div className="table-responsive d-none d-md-block">
                    <table className="table align-middle table-hover mb-0">
                      <thead>
                        <tr className="table-light">
                          <th style={{ width: 280 }}>Ad Soyad</th>
                          <th style={{ width: 150 }}>Telefon</th>
                          <th>Adres</th>
                          <th style={{ width: 80 }} className="text-center">
                            Yıl
                          </th>
                          <th style={{ width: 140 }} className="text-end">
                            İşlem
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((item) => {
                          const yil = item.hafizlikbitirmeyili || item.bitirme_yili || "—";
                          return (
                            <tr key={item.id} className="align-middle">
                              <td className="fw-semibold">
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      width: 34,
                                      height: 34,
                                      background: "#e0f2fe",
                                      color: "#0f172a",
                                      fontSize: 14,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {(item.full_name || "H")[0]}
                                  </div>
                                  <div>
                                    <div>{item.full_name || "—"}</div>
                                    <small className="text-muted">{item.email || ""}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{item.ceptel || "—"}</td>
                              <td className="text-truncate" style={{ maxWidth: 340 }}>
                                {item.adres || "—"}
                              </td>
                              <td className="text-center">
                                <span className="badge bg-soft text-dark" style={{ background: "#e2e8f0" }}>
                                  {yil}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => openDetailModal(item)}
                                    title="Detay"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => openEditModal(item)}
                                    title="Düzenle"
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                  {/* Sil KALDIRILDI */}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobil kartlar */}
                  <div className="d-md-none">
                    <div className="row g-3">
                      {visible.map((item) => {
                        const yil = item.hafizlikbitirmeyili || item.bitirme_yili || "—";
                        return (
                          <div className="col-12" key={item.id}>
                            <div className="card shadow-sm border-0 rounded-3">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-0">{item.full_name || "—"}</h6>
                                    <small className="text-muted d-block">
                                      <i className="bi bi-telephone me-1"></i>
                                      {item.ceptel || "—"}
                                    </small>
                                  </div>
                                  <span className="badge bg-info-subtle text-dark">{yil}</span>
                                </div>
                                <div className="small text-muted d-flex gap-2">
                                  <i className="bi bi-geo-alt-fill mt-1"></i>
                                  <span>{item.adres || "—"}</span>
                                </div>
                              </div>
                              <div className="card-footer bg-white d-flex justify-content-end gap-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => openDetailModal(item)}>
                                  Detay
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openEditModal(item)}>
                                  Düzenle
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sayfalama */}
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <small className="text-muted">
                      {filtered.length === 0
                        ? "0 kayıt"
                        : `${sliceStart + 1}-${Math.min(sliceStart + pageSize, filtered.length)} / ${filtered.length}`}
                    </small>

                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${pageSafe <= 1 ? "disabled" : ""}`}>
                          <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            ‹
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(Math.max(0, pageSafe - 3), Math.max(0, pageSafe - 3) + 5)
                          .map((p) => (
                            <li key={p} className={`page-item ${p === pageSafe ? "active" : ""}`}>
                              <button className="page-link" onClick={() => setPage(p)}>
                                {p}
                              </button>
                            </li>
                          ))}
                        <li className={`page-item ${pageSafe >= totalPages ? "disabled" : ""}`}>
                          <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                            ›
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <HBSBaseFooter />

      {showEditModal && (
        <HafizBilgiEditModal item={currentItem} onClose={() => setShowEditModal(false)} onSuccess={fetchData} />
      )}

      {showDetailModal && (
        <HafizBilgiDetailModal item={currentItem} onClose={() => setShowDetailModal(false)} />
      )}
    </>
  );
}

export default HafizBilgiList;
