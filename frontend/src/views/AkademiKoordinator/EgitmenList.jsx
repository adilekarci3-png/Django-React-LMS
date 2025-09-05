// src/pages/Koordinator/InstructorList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaYoutube,
  FaFileAlt,
  FaFolderOpen,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import useAxios from "../../utils/useAxios";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

/** Basit bağımlılıksız Modal */
function SimpleModal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop fade show" style={{ display: "block" }} />
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ zIndex: 1055 }}
      >
        <div
          className={`bg-white rounded-3 shadow ${wide ? "w-100" : ""}`}
          style={{ maxWidth: wide ? "1100px" : "820px", width: "95%" }}
        >
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <h5 className="m-0">{title}</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              Kapat
            </button>
          </div>
          <div className="p-3">{children}</div>
        </div>
      </div>
    </>
  );
}

/** Öğrenciler Modalı (Satın Alanlar / Kayıt Olanlar) */
function StudentsModal({ open, title, onClose, rows = [], loading = false, onDelete }) {
  return (
    <SimpleModal open={open} title={title} onClose={onClose} wide>
      {loading ? (
        <div className="text-center text-muted py-3">Yükleniyor…</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th>Öğrenci</th>
                <th>E-posta</th>
                <th>Tarih</th>
                {onDelete && <th style={{width: 90}}>İşlem</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td className="fw-medium d-flex align-items-center gap-2">
                    {r.user?.image ? (
                      <img
                        src={r.user.image}
                        alt=""
                        width="26"
                        height="26"
                        className="rounded-circle object-fit-cover"
                      />
                    ) : (
                      <span
                        className="rounded-circle bg-secondary-subtle d-inline-flex align-items-center justify-content-center"
                        style={{ width: 26, height: 26, fontSize: 11 }}
                      >
                        {(r.user?.full_name || "Ö")[0]}
                      </span>
                    )}
                    {r.user?.full_name || "-"}
                  </td>
                  <td>{r.user?.email || "-"}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                  {onDelete && (
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(r)}
                      >
                        Sil
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={onDelete ? 4 : 3} className="text-center text-muted">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </SimpleModal>
  );
}

export default function EgitmenList() {
  const api = useAxios();

  // Liste & UI
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Seçili eğitmen & modallar
  const [selected, setSelected] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [videosOpen, setVideosOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Modal verileri
  const [modalLoading, setModalLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Öğrenciler modalı (Satın Alanlar / Kayıt Olanlar)
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentsTitle, setStudentsTitle] = useState("");
  const [studentsRows, setStudentsRows] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Hangi videonun öğrencileri açık? (silme için lazım)
  const [currentVideo, setCurrentVideo] = useState(null);

  // Güvenli yeni sekme açma (ham URL göstermeden)
  const openInNewTab = (url) => {
    if (!url) return;
    try {
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) w.opener = null;
    } catch {}
  };

  // ---- İlk yükleme
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          "instructors/?sub_role=AkademiEgitmen",
          { signal: controller.signal }
        );
        if (!mounted) return;
        setInstructors(Array.isArray(data) ? data : (data?.results || []));
        setError(null);
      } catch (err) {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) return;

        console.error("instructors GET failed", err);
        if (!mounted) return;
        const status = err?.response?.status;
        if (status === 401) setError("Giriş gerekli (401).");
        else if (status === 403) setError("Bu listeyi görmeye yetkiniz yok (403).");
        else setError("Liste alınamadı.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [api]);

  // ---- Arama filtresi (client-side)
  const filtered = useMemo(() => {
    if (!q) return instructors;
    const s = q.toLowerCase();
    return instructors.filter(
      (i) =>
        (i.full_name || "").toLowerCase().includes(s) ||
        (i.email || "").toLowerCase().includes(s)
    );
  }, [instructors, q]);

  // ---- Video türü (link / file) tespiti
  const getKind = (v) => {
    if (v?.kind) return v.kind;
    if (v?.source === "YouTube" || v?.videoUrl || v?.url) return "link";
    return "file";
  };

  // ---- Modal açıcılar
  const openProfile = async (ins) => {
    setSelected(ins);
    setProfileOpen(true);
    setVideosOpen(false);
    setFilesOpen(false);
    setDocsOpen(false);
    setCalendarOpen(false);

    try {
      setModalLoading(true);
      const { data } = await api.get(`instructors/${ins.id}/`);
      setProfileData(data);
    } catch (e) {
      console.error(e);
      setProfileData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const openVideos = async (ins) => {
    setSelected(ins);
    setProfileOpen(false);
    setVideosOpen(true);
    setFilesOpen(false);
    setDocsOpen(false);
    setCalendarOpen(false);

    try {
      setModalLoading(true);
      const { data } = await api.get(`instructors/${ins.id}/videos/`);
      setVideos(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      setVideos([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openFiles = async (ins) => {
    setSelected(ins);
    setProfileOpen(false);
    setVideosOpen(false);
    setFilesOpen(true);
    setDocsOpen(false);
    setCalendarOpen(false);

    try {
      setModalLoading(true);
      const { data } = await api.get(`instructors/${ins.id}/files/`);
      setFiles(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      setFiles([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openDocuments = async (ins) => {
    setSelected(ins);
    setProfileOpen(false);
    setVideosOpen(false);
    setFilesOpen(false);
    setDocsOpen(true);
    setCalendarOpen(false);

    try {
      setModalLoading(true);
      const { data } = await api.get(`instructors/${ins.id}/documents/`);
      setDocuments(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      setDocuments([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openCalendar = async (ins) => {
    setSelected(ins);
    setProfileOpen(false);
    setVideosOpen(false);
    setFilesOpen(false);
    setDocsOpen(false);
    setCalendarOpen(true);

    try {
      setModalLoading(true);
      const { data } = await api.get(`instructors/${ins.id}/calendar/`);
      setEvents(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      setEvents([]);
    } finally {
      setModalLoading(false);
    }
  };

  // ---- Öğrenciler modalını aç
  const openStudents = async (video, type /* 'buyers' | 'enrolled' */) => {
    const kind = getKind(video);
    setCurrentVideo(video); // ✅ silme için hangi video seçili, bunu sakla
    setStudentsTitle(`${video.title || "Video"} • ${type === "buyers" ? "Satın Alanlar" : "Kayıt Olanlar"}`);
    setStudentsOpen(true);
    setStudentsRows([]);
    setStudentsLoading(true);
    try {
      const { data } = await api.get(`videos/${kind}/${video.id}/${type}/`);
      setStudentsRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStudentsRows([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // (opsiyonel) Öğrenci satırı sil
  const deleteStudentRow = async (video, type, row) => {
    if (!row?.user?.id) return;
    const kind = getKind(video);
    if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`videos/${kind}/${video.id}/${type}/${row.user.id}/`);
      setStudentsRows((old) => old.filter((x) => x.user?.id !== row.user.id));
    } catch (e) {
      console.error(e);
      alert("Silme işlemi başarısız oldu.");
    }
  };

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3">
              <Sidebar />
            </div>

            <div className="col-lg-9">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger py-2 mb-3">{error}</div>
                  )}

                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                    <h4 className="m-0">👨‍🏫 Eğitmen Listesi</h4>
                    <div className="input-group" style={{ maxWidth: 360 }}>
                      <span className="input-group-text">
                        <FaSearch />
                      </span>
                      <input
                        className="form-control"
                        placeholder="İsim veya e-posta ara…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-5 text-center text-muted">Yükleniyor…</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Eğitmen</th>
                            <th>E-posta</th>
                            <th>İçerik</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((i) => {
                            const linkCount = i.video_link_count || 0;
                            const uploadCount = i.uploaded_video_count || 0;
                            const docCount = i.document_count || 0;
                            return (
                              <tr key={i.id}>
                                <td className="fw-medium">
                                  <div className="d-flex align-items-center gap-2">
                                    {i.image ? (
                                      <img
                                        src={i.image}
                                        alt=""
                                        width="32"
                                        height="32"
                                        className="rounded-circle object-fit-cover"
                                      />
                                    ) : (
                                      <div
                                        className="rounded-circle bg-secondary-subtle d-inline-flex align-items-center justify-content-center"
                                        style={{ width: 32, height: 32, fontSize: 12 }}
                                      >
                                        {i.full_name?.[0] || "E"}
                                      </div>
                                    )}
                                    {i.full_name || "-"}
                                  </div>
                                </td>
                                <td>{i.email || "-"}</td>
                                <td>
                                  <div className="d-flex flex-wrap gap-1">
                                    <span className="badge text-bg-danger d-inline-flex align-items-center gap-1">
                                      <FaYoutube /> {linkCount}
                                    </span>
                                    <span className="badge text-bg-primary d-inline-flex align-items-center gap-1">
                                      🎬 {uploadCount}
                                    </span>
                                    <span className="badge text-bg-warning text-dark d-inline-flex align-items-center gap-1">
                                      <FaFileAlt /> {docCount}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex flex-wrap gap-2">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => openProfile(i)}
                                      title="Profil"
                                    >
                                      <FaUser className="me-1" /> Profil
                                    </button>

                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => openVideos(i)}
                                      title="YouTube / Videolar"
                                    >
                                      <FaYoutube className="me-1" /> Videolar
                                    </button>

                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => openFiles(i)}
                                      title="Dosyalar"
                                    >
                                      <FaFolderOpen className="me-1" /> Dosyalar
                                    </button>

                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => openDocuments(i)}
                                      title="Dökümanlar"
                                    >
                                      <FaFileAlt className="me-1" /> Dökümanlar
                                    </button>

                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => openCalendar(i)}
                                      title="Takvim"
                                    >
                                      <FaCalendarAlt className="me-1" /> Takvim
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {!filtered.length && (
                            <tr>
                              <td colSpan="4" className="text-center text-muted py-4">
                                Kayıt bulunamadı.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --------- Modals --------- */}
          <SimpleModal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            title={selected ? `${selected.full_name} • Profil` : "Profil"}
          >
            {modalLoading ? (
              <div className="text-center text-muted py-3">Yükleniyor…</div>
            ) : profileData ? (
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  {profileData.image ? (
                    <img src={profileData.image} className="img-fluid rounded" alt="" />
                  ) : (
                    <div className="bg-light border rounded p-5 text-center text-muted">
                      Görsel yok
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-8">
                  <div className="mb-2">
                    <strong>Ad Soyad:</strong> {profileData.full_name || "-"}
                  </div>
                  <div className="mb-2">
                    <strong>E-posta:</strong> {profileData.email || "-"}
                  </div>
                  <div className="mb-2">
                    <strong>Uzmanlık:</strong> {profileData.expertise || "-"}
                  </div>
                  <div className="mb-2">
                    <strong>Hakkında:</strong> {profileData.about || "-"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-danger">Profil verisi çekilemedi.</div>
            )}
          </SimpleModal>

          {/* Videolar + Öğrenciler butonları */}
          <SimpleModal
            open={videosOpen}
            onClose={() => setVideosOpen(false)}
            title={selected ? `${selected.full_name} • Videolar` : "Videolar"}
            wide
          >
            {modalLoading ? (
              <div className="text-center text-muted py-3">Yükleniyor…</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Başlık</th>
                      <th>Kaynak</th>
                      <th>İşlem</th>
                      <th style={{ minWidth: 220 }}>Öğrenciler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v) => {
                      const openUrl = v.videoUrl || v.url || null;
                      return (
                        <tr key={v.id}>
                          <td>{v.title || "-"}</td>
                          <td>{v.source || (openUrl ? "YouTube" : "Dosya")}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openInNewTab(openUrl)}
                              disabled={!openUrl}
                              title="Yeni sekmede aç"
                            >
                              Aç
                            </button>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-sm btn-outline-dark"
                                onClick={() => openStudents(v, "buyers")}
                                title="Satın Alanlar"
                              >
                                Satın Alanlar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openStudents(v, "enrolled")}
                                title="Kayıt Olanlar"
                              >
                                Kayıt Olanlar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!videos.length && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          Kayıt yok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SimpleModal>

          {/* Dosyalar */}
          <SimpleModal
            open={filesOpen}
            onClose={() => setFilesOpen(false)}
            title={selected ? `${selected.full_name} • Dosyalar` : "Dosyalar"}
            wide
          >
            {modalLoading ? (
              <div className="text-center text-muted py-3">Yükleniyor…</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ad</th>
                      <th>Tür</th>
                      <th>Boyut</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.id}>
                        <td>{f.name || "-"}</td>
                        <td>{f.mime || f.ext || "-"}</td>
                        <td>{f.size_readable || "-"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openInNewTab(f.download_url)}
                            disabled={!f.download_url}
                            title="İndir"
                          >
                            İndir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!files.length && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          Kayıt yok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SimpleModal>

          {/* Dökümanlar */}
          <SimpleModal
            open={docsOpen}
            onClose={() => setDocsOpen(false)}
            title={selected ? `${selected.full_name} • Dökümanlar` : "Dökümanlar"}
            wide
          >
            {modalLoading ? (
              <div className="text-center text-muted py-3">Yükleniyor…</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Başlık</th>
                      <th>Kategori</th>
                      <th>Özet</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((d) => (
                      <tr key={d.id}>
                        <td>{d.title || "-"}</td>
                        <td>{d.category || "-"}</td>
                        <td className="text-truncate" style={{ maxWidth: 260 }}>
                          {d.summary || "-"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openInNewTab(d.view_url)}
                            disabled={!d.view_url}
                            title="Görüntüle"
                          >
                            Aç
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!documents.length && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          Kayıt yok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SimpleModal>

          {/* Öğrenciler (Satın Alanlar / Kayıt Olanlar) */}
          <StudentsModal
            open={studentsOpen}
            onClose={() => setStudentsOpen(false)}
            title={studentsLoading ? `${studentsTitle} (yükleniyor…)` : studentsTitle}
            rows={studentsRows}
            loading={studentsLoading}
            onDelete={(row) =>
              deleteStudentRow(
                currentVideo,
                studentsTitle.includes("Satın") ? "buyers" : "enrolled",
                row
              )
            }
          />
        </div>

        <AkademiBaseFooter />
      </section>
    </>
  );
}
