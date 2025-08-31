// src/pages/EducatorVideoLinksPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import VideoLinkFormModal from "../../modals/VideoLinkFormModal";
import { listVideoLinks, deleteVideoLink, fetchRoleDetail } from "../../api/educatorVideoLinkApi";
import { getYouTubeThumb, getYouTubeEmbedUrl } from "../../utils/youtube";
import Header from "./Partials/Header";

import Sidebar from "./Partials/Sidebar";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

export default function EducatorVideoLinksPage({ instructorId }) {
  const [items, setItems] = useState([]);
  const [roleDetail, setRoleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");

  const canEdit = useMemo(() => {
    const b = roleDetail?.base_roles || [];
    const s = roleDetail?.sub_roles || [];
    const isKoord =
      b.includes("Koordinator") ||
      s.includes("ESKEPKoordinator") ||
      s.includes("ESKEPGenelKoordinator");
    const isTeacher =
      s.includes("ESKEPEgitmen") ||
      s.includes("HBSEgitmen") ||
      s.includes("HDMEgitmen") ||
      s.includes("AkademiEgitmen") ||
      b.includes("Teacher");
    return isKoord || isTeacher;
  }, [roleDetail]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [roles, list] = await Promise.all([
        fetchRoleDetail(),
        listVideoLinks(
          instructorId ? { instructor_id: instructorId, search: q } : { search: q }
        ),
      ]);
      setRoleDetail(roles);
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [instructorId]);

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchAll();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu video bağlantısını silmek istiyor musunuz?")) return;
    try {
      await deleteVideoLink(id);
      await fetchAll();
      alert("Silindi");
    } catch (err) {
      alert("Silme işlemine izin verilmedi (403) veya hata oluştu.");
    }
  };

return (
  <>
    <ESKEPBaseHeader />
    <section className="pt-5 pb-5 bg-light">
      <div className="container">
        <Header />
        <div className="row mt-0 mt-md-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <Sidebar />
          </div>

          {/* İçerik */}
          <div className="col-lg-9">
            <div className="bg-white p-5 rounded shadow">
              <h3 className="mb-4 text-primary fw-bold">🎬 YouTube Video Bağlantıları</h3>

              {loading ? (
                <div>Yükleniyor...</div>
              ) : (
                <>
                  {/* Arama + Ekle */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                    <form className="d-flex" onSubmit={onSearch}>
                      <input
                        className="form-control me-2"
                        placeholder="Ara (başlık/açıklama)…"
                        aria-label="Video bağlantılarında ara"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                      <button className="btn btn-outline-primary" type="submit">
                        Ara
                      </button>
                    </form>
                    {canEdit && (
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          setEditing(null);
                          setOpenModal(true);
                        }}
                      >
                        + Yeni Ekle
                      </button>
                    )}
                  </div>

                  {/* Kayıt yok */}
                  {items.length === 0 && (
                    <div className="alert alert-light">Kayıt bulunamadı.</div>
                  )}

                  {/* 3 sütun grid */}
                  <div className="row row-cols-1 row-cols-md-3 g-3">
                    {items.map((item) => {
                      const thumb = getYouTubeThumb(item.videoUrl);
                      const embed = getYouTubeEmbedUrl(item.videoUrl);
                      return (
                        <div className="col" key={item.id}>
                          <div className="card h-100 shadow-sm">
                            {thumb ? (
                              <a href={embed} target="_blank" rel="noreferrer">
                                <img
                                  src={thumb}
                                  className="card-img-top"
                                  alt={item.title}
                                />
                              </a>
                            ) : (
                              <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center">
                                <span className="text-muted">Önizleme yok</span>
                              </div>
                            )}

                            <div className="card-body d-flex flex-column">
                              <h6
                                className="card-title"
                                title={item.title}
                                style={{
                                  minHeight: 38,
                                  lineHeight: "1.2em",
                                  overflow: "hidden",
                                }}
                              >
                                {item.title}
                              </h6>
                              <p className="card-text small text-muted" style={{ flexGrow: 1 }}>
                                {(item.description || "").slice(0, 100)}
                                {item.description && item.description.length > 100 ? "…" : ""}
                              </p>

                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <a
                                  className="btn btn-outline-primary btn-sm"
                                  href={embed}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  İzle
                                </a>
                                {canEdit && (
                                  <div className="btn-group">
                                    <button
                                      className="btn btn-outline-secondary btn-sm"
                                      onClick={() => {
                                        setEditing(item);
                                        setOpenModal(true);
                                      }}
                                    >
                                      Düzenle
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => onDelete(item.id)}
                                    >
                                      Sil
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="card-footer small text-muted">
                              {new Date(item.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Modal */}
                  <VideoLinkFormModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSaved={fetchAll}
                    editing={editing}
                    defaultInstructorId={instructorId}
                    roleDetail={roleDetail}
                  />
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
