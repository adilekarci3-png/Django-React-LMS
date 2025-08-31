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

  useEffect(() => { fetchData(); }, []);

  // Yıl seçenekleri (listeden türet)
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
      const text =
        `${item.full_name || ""} ${item.ceptel || ""} ${item.adres || ""}`
          .toLowerCase();
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

  useEffect(() => { setPage(1); }, [q, year]); // filtre değişince ilk sayfaya dön

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kayıt silinecek!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`hafiz/hafizbilgileri/${id}/`);
        Swal.fire("Silindi!", "Kayıt başarıyla silindi.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Hata!", "Silme işlemi başarısız.", "error");
      }
    }
  };

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

      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <div className="card shadow-sm border-0">
            {/* Başlık + Toolbar */}
            <div className="card-body pb-2">
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Hafız Bilgileri
                  </h4>
                  <small className="text-muted">
                    Toplam {filtered.length} kayıt
                    {q && <> • “{q}” için filtrelendi</>}
                    {year && <> • Yıl: {year}</>}
                  </small>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      className="form-control"
                      placeholder="Ara: ad, telefon, adres…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ minWidth: 140 }}
                  >
                    <option value="">Yıl (tümü)</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={fetchData}
                    title="Yenile"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={() => openEditModal(null)}
                  >
                    <i className="fas fa-plus me-1"></i> Yeni Ekle
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-0" />

            {/* Liste */}
            <div className="card-body">
              {loading ? (
                // Basit skeleton/placeholder
                <div className="py-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="placeholder-glow mb-3">
                      <span className="placeholder col-12" style={{ height: 24 }}></span>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-2">Kayıt bulunamadı.</div>
                  <button className="btn btn-outline-primary" onClick={() => openEditModal(null)}>
                    <i className="bi bi-plus-lg me-1"></i> Yeni kayıt oluştur
                  </button>
                </div>
              ) : (
                <>
                  {/* Masaüstü: Tablo */}
                  <div className="table-responsive d-none d-md-block">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Ad Soyad</th>
                          <th>Telefon</th>
                          <th>Adres</th>
                          <th>Yıl</th>
                          <th style={{ width: 140 }}>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((item) => {
                          const yil = item.hafizlikbitirmeyili || item.bitirme_yili || "—";
                          return (
                            <tr key={item.id}>
                              <td className="fw-semibold">{item.full_name || "—"}</td>
                              <td>{item.ceptel || "—"}</td>
                              <td className="text-truncate" style={{ maxWidth: 340 }}>
                                {item.adres || "—"}
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">{yil}</span>
                              </td>
                              <td>
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => openDetailModal(item)}
                                    title="Detay"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => openEditModal(item)}
                                    title="Düzenle"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(item.id)}
                                    title="Sil"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobil: Kartlar */}
                  <div className="d-md-none">
                    <div className="row g-3">
                      {visible.map((item) => {
                        const yil = item.hafizlikbitirmeyili || item.bitirme_yili || "—";
                        return (
                          <div className="col-12" key={item.id}>
                            <div className="card shadow-sm">
                              <div className="card-body">
                                <div className="d-flex justify-content-between">
                                  <h6 className="mb-1">{item.full_name || "—"}</h6>
                                  <span className="badge bg-light text-dark">{yil}</span>
                                </div>
                                <div className="small text-muted mb-2">
                                  <i className="bi bi-telephone me-1"></i>
                                  {item.ceptel || "—"}
                                </div>
                                <div className="small text-muted">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {item.adres || "—"}
                                </div>
                              </div>
                              <div className="card-footer bg-white d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openDetailModal(item)}
                                >
                                  Detay
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => openEditModal(item)}
                                >
                                  Düzenle
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sayfalama */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      {filtered.length === 0
                        ? "0 kayıt"
                        : `${sliceStart + 1}-${Math.min(
                            sliceStart + pageSize,
                            filtered.length
                          )} / ${filtered.length}`}
                    </small>

                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${pageSafe <= 1 ? "disabled" : ""}`}>
                          <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            ‹
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(
                            Math.max(0, pageSafe - 3),
                            Math.max(0, pageSafe - 3) + 5
                          )
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
        <HafizBilgiEditModal
          item={currentItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showDetailModal && (
        <HafizBilgiDetailModal
          item={currentItem}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
}

export default HafizBilgiList;
