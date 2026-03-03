// src/views/AkademiEgitmen/EducatorDocumentsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

function FileTypeBadge({ ext }) {
  const map = {
    pdf:  { bg: "#fff1f0", color: "#cf1322", label: "PDF" },
    doc:  { bg: "#e6f4ff", color: "#0958d9", label: "DOC" },
    docx: { bg: "#e6f4ff", color: "#0958d9", label: "DOCX" },
    xls:  { bg: "#f6ffed", color: "#389e0d", label: "XLS" },
    xlsx: { bg: "#f6ffed", color: "#389e0d", label: "XLSX" },
    ppt:  { bg: "#fff7e6", color: "#d46b08", label: "PPT" },
    pptx: { bg: "#fff7e6", color: "#d46b08", label: "PPTX" },
  };
  const info = map[(ext || "").toLowerCase()] || { bg: "#f0f0f0", color: "#595959", label: (ext || "?").toUpperCase() };
  return (
    <span className="badge rounded-2 px-2 py-1 fw-bold"
      style={{ background: info.bg, color: info.color, fontSize: 11, letterSpacing: 0.5 }}>
      {info.label}
    </span>
  );
}

function getExt(url) {
  return (url || "").split(".").pop().split("?")[0] || "";
}

export default function EducatorDocumentsList() {
  const api = useAxios();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const fetchAll = async (search = "") => {
    setLoading(true);
    try {
      const res = await api.get("educator/document/", { params: { search } });
      setItems(res.data);
    } catch {
      Swal.fire("Hata", "Dökümanlar yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };
  const sortedItems = (() => {
  const arr = Array.isArray(items) ? [...items] : [];
  const t = (x) => (x ? new Date(x).getTime() : 0);

  arr.sort((a, b) => {
    const da = t(a.created_at);
    const db = t(b.created_at);
    return sort === "newest" ? db - da : da - db;
  });

  return arr;
})();

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => fetchAll(q), 400);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line

  const onDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `"${title}" dökümanı kalıcı olarak silinecek.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`educator/document/${id}/delete/`);
      Swal.fire({ icon: "success", title: "Döküman silindi.", timer: 1800, showConfirmButton: false });
      fetchAll(q);
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
                  <i className="fa-regular fa-file-lines text-secondary"></i> Dökümanlarım
                </h3>
                <p className="text-muted mb-4">
                  Sisteme yüklediğiniz tüm dökümanları bu sayfadan yönetebilirsiniz.
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
                    onClick={() => navigate("/eskepegitmen/dokuman-ekle/")}>
                    + Yeni Döküman Yükle
                  </button>
                  </div>
                </div>

                {loading ? (
                  <div className="d-flex align-items-center gap-2 text-muted py-5 justify-content-center">
                    <span className="spinner-border spinner-border-sm" /> Yükleniyor…
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-regular fa-file-lines text-secondary" style={{ fontSize: 40 }}></i>
                    <p className="text-muted mt-3 mb-3">
                      {q ? "Aramanıza uygun döküman bulunamadı." : "Henüz döküman eklenmemiş."}
                    </p>
                    
                      <button className="btn btn-primary"
                        onClick={() => navigate("/eskepegitmen/dokuman-ekle/")}>
                        İlk dökümanı ekle
                      </button>
                    
                  </div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">{sortedItems.length} döküman listeleniyor</p>
                    <div className="table-responsive rounded-3 border">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-3" style={{ width: 56 }}>Tür</th>
                            <th>Başlık</th>
                            <th className="d-none d-md-table-cell">Açıklama</th>
                            <th className="d-none d-lg-table-cell text-nowrap">Tarih</th>
                            <th className="text-end pe-3">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedItems.map((item) => (
                            <tr key={item.id}>
                              <td className="ps-3"><FileTypeBadge ext={getExt(item.file)} /></td>
                              <td>
                                <a href={item.file || "#"} target="_blank" rel="noreferrer"
                                  className="text-decoration-none fw-semibold text-dark">
                                  {item.title}
                                </a>
                              </td>
                              <td className="d-none d-md-table-cell text-muted small" style={{ maxWidth: 260 }}>
                                <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {item.description || "—"}
                                </span>
                              </td>
                              <td className="d-none d-lg-table-cell text-muted small text-nowrap">
                                {new Date(item.created_at).toLocaleDateString("tr-TR")}
                              </td>
                              <td className="text-end pe-3">
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                  <a href={item.file || "#"} target="_blank" rel="noreferrer"
                                    className="btn btn-outline-primary btn-sm">İndir</a>
                                  <button className="btn btn-outline-warning btn-sm"
                                    onClick={() => navigate(`/eskepegitmen/dokuman-duzenle/${item.id}/`)}>
                                    Düzenle
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm"
                                    onClick={() => onDelete(item.id, item.title)}>
                                    Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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