// src/pages/EducatorVideosPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData"; // ⬅️ JWT içinden teacher_id almak için

export default function EducatorVideosPage({ instructorId }) {
  const api = useAxios();
  const user = useUserData(); // { user_id, full_name, teacher_id, base_roles, sub_roles, ... }

  const [items, setItems] = useState([]);
  const [roleDetail, setRoleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Kullanıcının öğretmen PK'si (öncelik JWT)
  const myTeacherId =
    user?.teacher_id ??
    roleDetail?.teacher_id ??
    roleDetail?.instructor_id ??
    roleDetail?.instructor?.id ??
    null;

  // Sadece kendi videolarını görmesi için filtreyi kilitle
  // - Eğer kullanıcının teacher_id'si varsa onu kullan
  // - Yoksa (koordinatör vb.) dışarıdan instructorId geçildiyse onu kullan
  // - Hiçbiri yoksa filtre yok (genel liste) — ama istenirse burada boş listeye da sabitlenebilir
  const effectiveInstructorId = myTeacherId ?? instructorId ?? null;

  const canEdit = useMemo(() => {
    const b = roleDetail?.base_roles || [];
    const s = roleDetail?.sub_roles || [];
    const isKoord =
      b.includes("Koordinator") ||
      s.includes("ESKEPKoordinator") ||
      s.includes("ESKEPGenelKoordinator");
    const isTeacher =
      b.includes("Teacher") ||
      s.includes("ESKEPEgitmen") ||
      s.includes("HBSEgitmen") ||
      s.includes("HDMEgitmen") ||
      s.includes("AkademiEgitmen");
    return isKoord || isTeacher;
  }, [roleDetail]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rolesRes, listRes] = await Promise.all([
        api.get("user-role-detail/"),
        api.get("educator/video/", {
          params: effectiveInstructorId
            ? { instructor_id: effectiveInstructorId, search: q }
            : { search: q },
        }),
      ]);
      setRoleDetail(rolesRes.data);
      setItems(
        Array.isArray(listRes.data) ? listRes.data : listRes.data?.results || []
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveInstructorId]);

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchAll();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bu videoyu silmek istiyor musunuz?")) return;
    try {
      await api.delete(`educator/video/${id}/delete/`);
      await fetchAll();
      alert("Silindi");
    } catch (_err) {
      alert("Silme işlemine izin verilmedi (403) veya hata oluştu.");
    }
  };

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          {/* Header: sola hizalı, tam genişlik */}
          <div className="mb-3">
            <Header />
          </div>

          <div className="row mt-0 mt-md-4">
            {/* Sidebar */}
            <div className="col-lg-3">
              <Sidebar />
            </div>

            {/* İçerik */}
            <div className="col-lg-9">
              <div className="bg-white p-5 rounded shadow">
                <h3 className="mb-1 text-primary fw-bold">
                  🎞️ {myTeacherId ? "Benim Yüklediğim Videolar" : "Yüklenen Videolar"}
                </h3>
                {myTeacherId && (
                  <p className="text-muted mb-4">
                    Sadece kendi (öğretmen #{myTeacherId}) eklediğiniz videolar listelenir.
                  </p>
                )}

                {loading ? (
                  <div>Yükleniyor...</div>
                ) : (
                  <>
                    {/* Arama + Yeni */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                      <form className="d-flex" onSubmit={onSearch}>
                        <input
                          className="form-control me-2"
                          placeholder="Ara (başlık/açıklama)…"
                          aria-label="Yüklenen videolarda ara"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                        />
                        <button className="btn btn-outline-primary" type="submit">
                          Ara
                        </button>
                      </form>

                      {canEdit && (
                        <a className="btn btn-success" href="/educator/video-create">
                          + Yeni Ekle
                        </a>
                      )}
                    </div>

                    {/* Kayıt yok */}
                    {items.length === 0 && (
                      <div className="alert alert-light">Kayıt bulunamadı.</div>
                    )}

                    {/* 3 sütun grid */}
                    <div className="row row-cols-1 row-cols-md-3 g-3">
                      {items.map((item) => {
                        const fileUrl = item.file; // serializer: { id, title, description, file, created_at, ... }
                        return (
                          <div className="col" key={item.id}>
                            <div className="card h-100 shadow-sm">
                              {/* Video önizleme */}
                              <div className="ratio ratio-16x9 bg-dark">
                                {fileUrl ? (
                                  <video
                                    src={fileUrl}
                                    preload="metadata"
                                    controls={false}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center text-white-50">
                                    Önizleme yok
                                  </div>
                                )}
                              </div>

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
                                <p
                                  className="card-text small text-muted"
                                  style={{ flexGrow: 1 }}
                                >
                                  {(item.description || "").slice(0, 100)}
                                  {item.description &&
                                  item.description.length > 100
                                    ? "…"
                                    : ""}
                                </p>

                                <div className="d-flex justify-content-between align-items-center mt-2">
                                  {fileUrl ? (
                                    <a
                                      className="btn btn-outline-primary btn-sm"
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      İzle
                                    </a>
                                  ) : (
                                    <button
                                      className="btn btn-outline-secondary btn-sm"
                                      disabled
                                    >
                                      Dosya yok
                                    </button>
                                  )}

                                  {canEdit && (
                                    <div className="btn-group">
                                      {/* Düzenleme sayfanız varsa link verin */}
                                      {/* <a className="btn btn-outline-secondary btn-sm" href={`/educator/video/${item.id}/edit`}>Düzenle</a> */}
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}
