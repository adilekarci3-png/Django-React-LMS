// EskepStajerCalismalarPages.jsx
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

// ---- helpers ----
const trLower = (s) => String(s ?? "").toLocaleLowerCase("tr").trim();
const normalizeStatusKey = (s) => {
  const t = trLower(s);
  if (t.includes("incele")) return "incelemede";
  if (t.includes("taslak")) return "taslak";
  if (t.includes("pasif")) return "pasif";
  if (t.includes("redd")) return "reddedildi";
  if (t.includes("teslim") || t.includes("onay") || t.includes("kabul") || t.includes("tamam"))
    return "teslimedildi";
  return t;
};

const statusBadge = (status) => {
  switch (normalizeStatusKey(status)) {
    case "incelemede":
      return "bg-warning text-dark";
    case "taslak":
      return "bg-secondary";
    case "pasif":
      return "bg-dark";
    case "reddedildi":
      return "bg-danger";
    case "teslimedildi":
      return "bg-success";
    default:
      return "bg-light text-dark";
  }
};

const typeBadge = (type) => {
  switch (type) {
    case "ODEV":
      return <span className="badge bg-info">Ödev</span>;
    case "RAPOR":
      return <span className="badge bg-warning text-dark">Ders Sonu Raporu</span>;
    case "KITAP":
      return <span className="badge bg-success">Kitap Tahlili</span>;
    case "PROJE":
      return <span className="badge bg-primary">Proje</span>;
    default:
      return null;
  }
};
// ---- end helpers ----

function EskepStajerCalismalarByStatus({ statusLabel = "İncelemede", pageTitle = "Çalışmalarım" }) {
  const api = useAxios();
  const user = useUserData();

  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | ODEV | RAPOR | KITAP | PROJE

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const headingId = "assignment-modal-title";
  const onClose = () => setModalIsOpen(false);

  // Delete
  const [deletingId, setDeletingId] = useState(null);

  // Güvenli yardımcılar
  const safeUrl = (f) => {
    if (typeof f === "string") return f;
    return f?.url ?? f?.file ?? "#";
  };
  const fileTitle = (f, i) => {
    if (!f) return `Bölüm ${i + 1}`;
    return f.title || f?.variant?.title || `Bölüm ${i + 1}`;
  };
  const fileName = (f) => {
    if (!f || typeof f === "string") return undefined;
    return f.filename || f.name;
  };

  // Durum alanını akıllıca seç (çeşitli backend isimleri)
  const pickStatus = (x) => {
    const keys = [
      "odev_status",
      "status",
      "durum",
      "derssonuraporu_status",
      "kitaptahlili_status",
      "kitap_status",
      "rapor_status",
      "kitap_durum",
      "rapor_durum",
      "state",
      "statu",
      "work_status",
      // PROJE için olabilecekler
      "proje_status",
      "eskepProje_status",
      "koordinator_eskepProje_status",
    ];
    for (const k of keys) {
      if (x?.[k] !== undefined && x?.[k] !== null && x?.[k] !== "") return x[k];
    }
    if (x?.meta?.status) return x.meta.status;
    return "—";
  };

  // Ödev/Rapor/Kitap/Proje -> ortak alanlar
  const normalize = (arr, type) =>
    (arr || []).map((x) => ({
      id: x.id,
      type, // "ODEV" | "RAPOR" | "KITAP" | "PROJE"
      title: x.title || x.name || "—",
      image: x.image || x.cover || "/img/default-course.png",
      language: x.language || x.lang || "—",
      level: x.level || x.difficulty || "—",
      date: x.date || x.created_at || x.created || x.updated_at || null,
      status: pickStatus(x),
      owner: x.koordinator?.full_name || x.author?.full_name || x.owner?.full_name || "—",
      sections: [
        ...(Array.isArray(x.curriculum) ? x.curriculum.flatMap((c) => c?.variant_items || []) : []),
        ...(Array.isArray(x.sections) ? x.sections : []),
        ...(Array.isArray(x.variants) ? x.variants : []),
        ...(Array.isArray(x.files) ? x.files : []),
        ...(Array.isArray(x.lectures) ? x.lectures : []),
      ],
      raw: x,
    }));

  const fetchAll = async () => {
    if (!user?.user_id) return;
    setFetching(true);
    try {
      const [odevRes, raporRes, kitapRes, projeRes] = await Promise.all([
        api.get(`eskepstajer/odev-list/${user.user_id}/`),
        api.get(`eskepstajer/derssonuraporu-list/${user.user_id}/`),
        api.get(`eskepstajer/kitaptahlili-list/${user.user_id}/`),
        api.get(`eskepstajer/proje-list/${user.user_id}/`),
      ]);

      const merged = [
        ...normalize(odevRes.data, "ODEV"),
        ...normalize(raporRes.data, "RAPOR"),
        ...normalize(kitapRes.data, "KITAP"),
        ...normalize(projeRes.data, "PROJE"),
      ];

      const wanted = merged.filter(
        (it) => normalizeStatusKey(it.status) === normalizeStatusKey(statusLabel)
      );

      setItems(wanted);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, statusLabel]);

  // Silme
  const deleteEndpointByType = (type, id) => {
    switch (type) {
      case "ODEV":
        return `eskepstajer/odev/${id}/`;
      case "RAPOR":
        return `eskepstajer/derssonuraporu/${id}/`;
      case "KITAP":
        return `eskepstajer/kitaptahlili/${id}/`;
      case "PROJE":
        return `eskepstajer/proje/${id}/`;
      default:
        return null;
    }
  };

  const handleDelete = async (it) => {
    if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    const key = `${it.type}-${it.id}`;
    const url = deleteEndpointByType(it.type, it.id);
    if (!url) return;

    try {
      setDeletingId(key);
      await api.delete(url);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert("Silme sırasında bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

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

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            {/* SOL: Sidebar */}
            <div className="col-lg-3 col-md-2 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ: İçerik */}
            <div className="col-lg-9 col-md-10 col-12">
              <h4 className="mb-0 mb-4 d-flex align-items-center gap-2">
                <i className="fas fa-chalkboard-user" />
                {pageTitle}
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
                        <option value="PROJE">Projeler</option>
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
                    <span>
                      Durum:{" "}
                      <strong className={`badge ${statusBadge(statusLabel)}`}>
                        {statusLabel}
                      </strong>
                    </span>
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

                            <td>
                              {it.date ? moment(it.date).format("D MMM, YYYY") : "-"}
                            </td>
                            <td>{it.sections?.length || "-"}</td>

                            <td>
                              <span className={`badge ${statusBadge(it.status)}`}>
                                {it.status}
                              </span>
                            </td>

                            <td>{it.owner}</td>

                            <td className="d-flex flex-wrap gap-2">
                              {it.type === "ODEV" && (
                                <Link
                                  to={`/eskep/edit-odev/${it.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  Düzenle
                                </Link>
                              )}
                              {it.type === "RAPOR" && (
                                <Link
                                  to={`/eskep/edit-derssonuraporu/${it.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  Düzenle
                                </Link>
                              )}
                              {it.type === "KITAP" && (
                                <Link
                                  to={`/eskep/edit-kitaptahlili/${it.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  Düzenle
                                </Link>
                              )}
                              {it.type === "PROJE" && (
                                <Link
                                  to={`/eskep/edit-proje/${it.id}`}
                                  className="btn btn-warning btn-sm"
                                >
                                  Düzenle
                                </Link>
                              )}

                              {!!it.sections?.length && (
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => (
                                    setSelectedFiles(it.sections), setModalIsOpen(true)
                                  )}
                                >
                                  Bölümleri Görüntüle
                                </button>
                              )}

                              <button
                                className="btn btn-danger btn-sm"
                                disabled={deletingId === `${it.type}-${it.id}`}
                                onClick={() => handleDelete(it)}
                                title="Kaydı sil"
                              >
                                {deletingId === `${it.type}-${it.id}`
                                  ? "Siliniyor..."
                                  : "Sil"}
                              </button>
                            </td>
                          </tr>
                        ))}

                        {view.length < 1 && (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Kayıt bulunamadı
                            </td>
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
          <h3 id={headingId} className="modalTitle">
            Bölüm Dosyaları
          </h3>
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
                    <span className="fileIcon" aria-hidden>
                      <FiFileText />
                    </span>
                    <div className="fileTexts">
                      <div className="fileTitle">{fileTitle(file, idx)}</div>
                      {fileName(file) && <div className="fileMeta">{fileName(file)}</div>}
                    </div>
                  </div>
                  <div className="fileActions">
                    <a
                      className="btn ghost"
                      href={safeUrl(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Yeni sekmede aç"
                    >
                      <FiExternalLink className="btnIcon" />
                      Önizle
                    </a>
                    <a
                      className="btn primary"
                      href={safeUrl(file)}
                      download={fileName(file)}
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
          <button className="btn outline" onClick={onClose}>
            Kapat
          </button>
        </div>
      </Modal>
    </>
  );
}

// --- 5 sayfa (status + başlık) ---
export function EskepStajerTaslakCalismalar() {
  return (
    <EskepStajerCalismalarByStatus statusLabel="Taslak" pageTitle="Taslakta Olan Çalışmalarım" />
  );
}

export function EskepStajerPasifCalismalar() {
  return (
    <EskepStajerCalismalarByStatus statusLabel="Pasif" pageTitle="Pasifte Olan Çalışmalarım" />
  );
}

export function EskepStajerReddedilmisCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="Reddedilmiş"
      pageTitle="Reddedilmiş Çalışmalarım"
    />
  );
}

export function EskepStajerTeslimEdilmisCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="Teslim Edildi"
      pageTitle="Teslim Edilmiş Çalışmalarım"
    />
  );
}

export function EskepStajerIncelemedeCalismalar() {
  return (
    <EskepStajerCalismalarByStatus
      statusLabel="İncelemede"
      pageTitle="İncelemede Olan Çalışmalarım"
    />
  );
}
