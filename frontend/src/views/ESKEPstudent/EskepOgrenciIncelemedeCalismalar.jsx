import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Modal from "react-modal";
import { FiFileText, FiExternalLink, FiDownload, FiX, FiFilter } from "react-icons/fi";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import "./css/ModalStyle.css";

const STATUS_INCELEMEDE = "İncelemede";

function EskepOgrenciIncelemedeCalismalar() {
  const api = useAxios();
  const user = useUserData();

  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState([]); // birleşik liste
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | ODEV | RAPOR | KITAP

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const headingId = "assignment-modal-title";
  const onClose = () => setModalIsOpen(false);

  // Güvenli yardımcılar
  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? "#");
  const fileTitle = (f, i) => (f?.title ? f.title : `Bölüm ${i + 1}`);
  const fileName  = (f) => f?.filename || undefined;

  // Birleştirici (ödev/rapor/kitap -> ortak alanlar)
  const normalize = (arr, type) =>
    (arr || []).map((x) => ({
      id: x.id,
      type,                               // "ODEV" | "RAPOR" | "KITAP"
      title: x.title || x.name || "—",
      image: x.image || x.cover || "/img/default-course.png",
      language: x.language || x.lang || "—",
      level: x.level || x.difficulty || "—",
      date: x.date || x.created_at || x.created || x.updated_at || null,
      status: x.odev_status || x.status || x.durum || "—",
      owner: x.koordinator?.full_name || x.author?.full_name || x.owner?.full_name || "—",
      // bölüm/variant yapıları farklı olabilir; hepsini güvenli topluyoruz:
      // 1) X.curriculum[].variant_items[] (senin ödev yapın)
      // 2) X.sections[] (rapor/kitap için olası bir alan)
      // 3) X.variants[] veya X.files[] gibi olasılıklar
      sections:
        // ödev (curriculum.variant_items)
        (Array.isArray(x.curriculum)
          ? x.curriculum.flatMap((c) => c?.variant_items || [])
          : []
        )
        // rapor/kitap (sections / variants / files)
        .concat(Array.isArray(x.sections) ? x.sections : [])
        .concat(Array.isArray(x.variants) ? x.variants : [])
        .concat(Array.isArray(x.files) ? x.files : []),
      raw: x, // gerekirse detay sayfasına aktarım için
    }));

  const fetchAll = async () => {
    if (!user?.user_id) return;
    setFetching(true);

    try {
      // === FETCH URL (backend’ine göre düzenle) ===
      const [odevRes, raporRes, kitapRes] = await Promise.all([
        api.get(`eskepogrenci/odev-list/${user.user_id}/`),         // ödevler
        api.get(`eskepogrenci/derssonuraporu-list/${user.user_id}/`), // ders sonu raporları
        api.get(`eskepogrenci/kitaptahlili-list/${user.user_id}/`),    // kitap tahlilleri
      ]);

      const merged = [
        ...normalize(odevRes.data, "ODEV"),
        ...normalize(raporRes.data, "RAPOR"),
        ...normalize(kitapRes.data, "KITAP"),
      ];

      // sadece "İncelemede" olanları tut
      const onlyIncelemede = merged.filter(
        (it) => String(it.status).toLowerCase() === STATUS_INCELEMEDE.toLowerCase()
      );

      setItems(onlyIncelemede);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // Arama + tür filtresi
  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesType = typeFilter === "ALL" ? true : it.type === typeFilter;
      const matchesQuery =
        !q ||
        it.title.toLowerCase().includes(q) ||
        it.language.toLowerCase().includes(q) ||
        it.level.toLowerCase().includes(q) ||
        (it.owner && it.owner.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [items, query, typeFilter]);

  const openSectionsModal = (sections) => {
    setSelectedFiles(sections || []);
    setModalIsOpen(true);
  };

  const typeBadge = (type) => {
    switch (type) {
      case "ODEV":
        return <span className="badge bg-info">Ödev</span>;
      case "RAPOR":
        return <span className="badge bg-warning text-dark">Ders Sonu Raporu</span>;
      case "KITAP":
        return <span className="badge bg-success">Kitap Tahlili</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            {/* SOL: Sidebar */}
            <div className="col-lg-2 col-md-4 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ: İçerik */}
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-0 mb-4 d-flex align-items-center gap-2">
                <i className="fas fa-chalkboard-user" />
                İncelemede Olan Çalışmalarım
              </h4>

              {/* Filtreler */}
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row g-2 align-items-center">
                    <div className="col-md-6">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Başlık / dil / seviye / hazırlayan ara…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 d-flex align-items-center justify-content-md-end gap-2">
                      <FiFilter aria-hidden />
                      <select
                        className="form-select w-auto"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                      >
                        <option value="ALL">Tümü</option>
                        <option value="ODEV">Ödevler</option>
                        <option value="RAPOR">Ders Sonu Raporları</option>
                        <option value="KITAP">Kitap Tahlilleri</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Çalışmalar</h3>
                    <span>Durum: <strong>{STATUS_INCELEMEDE}</strong></span>
                  </div>

                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Tür</th>
                          <th>Başlık / Ders</th>
                          <th>Kayıt Tarihi</th>
                          <th>Bölümler</th>
                          <th>Durum</th>
                          <th>Hazırlayan</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>

                      <tbody>
                        {view.map((it) => (
                          <tr key={`${it.type}-${it.id}`}>
                            <td>{typeBadge(it.type)}</td>

                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={it.image}
                                  alt="cover"
                                  className="rounded"
                                  style={{
                                    width: "100px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="ms-3">
                                  <h5 className="mb-1">{it.title}</h5>
                                  <p className="mb-0 text-muted">
                                    {it.language} • {it.level}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td>{it.date ? moment(it.date).format("D MMM, YYYY") : "-"}</td>
                            <td>{it.sections?.length || "-"}</td>
                            <td>
                              <span className="badge bg-warning text-dark">{STATUS_INCELEMEDE}</span>
                            </td>
                            <td>{it.owner}</td>

                            <td className="d-flex flex-wrap gap-2">
                              {/* Tür bazlı düzenleme sayfası rotalarını ihtiyacına göre güncelle */}
                              {it.type === "ODEV" && (
                                <Link to={`/eskep/edit-odev/${it.id}`} className="btn btn-warning btn-sm">
                                  Düzenle
                                </Link>
                              )}
                              {it.type === "RAPOR" && (
                                <Link to={`/eskep/edit-ders-raporu/${it.id}`} className="btn btn-warning btn-sm">
                                  Düzenle
                                </Link>
                              )}
                              {it.type === "KITAP" && (
                                <Link to={`/eskep/edit-kitap-tahlili/${it.id}`} className="btn btn-warning btn-sm">
                                  Düzenle
                                </Link>
                              )}

                              {!!(it.sections?.length) && (
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => openSectionsModal(it.sections)}
                                >
                                  Bölümleri Görüntüle
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}

                        {view.length < 1 && (
                          <tr>
                            <td colSpan="7" className="text-center">Kayıt bulunamadı</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />

      {/* Bölümler Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        overlayClassName="modalOverlay"
        className="modalContent"
        shouldCloseOnOverlayClick
        aria={{ labelledby: headingId }}
      >
        <div className="modalHeader">
          <h3 id={headingId} className="modalTitle">Bölüm Dosyaları</h3>
          <button className="iconBtn" aria-label="Kapat" onClick={onClose} title="Kapat">
            <FiX />
          </button>
        </div>

        <div className="modalBody">
          {selectedFiles?.length ? (
            <ul className="fileList" role="list">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="fileItem">
                  <div className="fileMain">
                    <span className="fileIcon" aria-hidden><FiFileText /></span>
                    <div className="fileTexts">
                      <div className="fileTitle">{fileTitle(file.variant || file, idx)}</div>
                      {fileName(file.file || file) && (
                        <div className="fileMeta">{fileName(file.file || file)}</div>
                      )}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a
                      className="btn ghost"
                      href={safeUrl(file.file || file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Yeni sekmede aç"
                    >
                      <FiExternalLink className="btnIcon" />
                      Önizle
                    </a>
                    <a
                      className="btn primary"
                      href={safeUrl(file.file || file)}
                      download={fileName(file.file || file)}
                      title="İndir"
                    >
                      <FiDownload className="btnIcon" />
                      İndir
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="emptyState">Henüz eklenmiş bölüm yok.</div>
          )}
        </div>

        <div className="modalFooter">
          <button className="btn outline" onClick={onClose}>Kapat</button>
        </div>
      </Modal>
    </>
  );
}

export default EskepOgrenciIncelemedeCalismalar;
