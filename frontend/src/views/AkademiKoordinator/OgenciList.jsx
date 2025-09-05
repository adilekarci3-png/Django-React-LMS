// src/pages/Koordinator/StudentList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaUser, FaBook, FaClipboardList, FaSearch } from "react-icons/fa";
import useAxios from "../../utils/useAxios";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

/** Basit Modal */
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
          style={{ maxWidth: wide ? "1100px" : "720px", width: "95%" }}
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

export default function StudentList() {
  const api = useAxios();

  // Liste & UI
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState(null);
  const [isKoordinator, setIsKoordinator] = useState(null); // null: bilinmiyor

  // Modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);

  // Seçili öğrenci ve modal verileri
  const [selected, setSelected] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [enrollData, setEnrollData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // ----- Koordinatör mü? user/role/ üzerinden öğren
  const fetchIsKoordinator = async (signal) => {
    try {
      const { data } = await api.get("user/role/", { signal });
      // Beklenen örnekler:
      // { sub_roles: ["AkademiKoordinator", ...] }
      // { roles: ["AkademiKoordinator", ...] }
      // { role: "AkademiKoordinator" }
      const subs = data?.sub_roles ?? data?.roles ?? data?.role ?? [];
      const arr = Array.isArray(subs) ? subs : (typeof subs === "string" ? [subs] : []);
      return arr.includes("AkademiKoordinator");
    } catch {
      return null; // öğrenemedik; birazdan “önce filtreli dene, 403’de geneline düş” yapacağız
    }
  };

  // ---- İlk yükleme
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const koord = await fetchIsKoordinator(controller.signal);
        if (!mounted) return;
        setIsKoordinator(koord);

        // Strateji:
        // - koord === true  -> direkt filtreli çağır
        // - koord === false -> direkt genel çağır
        // - koord === null  -> önce filtreli dene, 403 gelirse geneline düş
        const tryFilteredFirst = koord !== false;
        if (tryFilteredFirst) {
          try {
            const r = await api.get("ogrencis/?sub_role=AkademiOgrenci", {
              signal: controller.signal,
            });
            if (!mounted) return;
            setStudents(Array.isArray(r.data) ? r.data : (r.data?.results || []));
            return;
          } catch (e) {
            if (e?.response?.status !== 403) throw e;
            // 403 -> koordinatör değilmiş, geneline düş
          }
        }

        const r2 = await api.get("students/", { signal: controller.signal });
        if (!mounted) return;
        setStudents(Array.isArray(r2.data) ? r2.data : (r2.data?.results || []));
      } catch (err) {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) {
          if (mounted) setLoading(false);
          return;
        }
        console.error("students GET failed", err);
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

  // ---- Arama filtresi
  const filtered = useMemo(() => {
    if (!q) return students;
    const s = q.toLowerCase();
    return students.filter(
      (st) =>
        (st.full_name || "").toLowerCase().includes(s) ||
        (st.email || "").toLowerCase().includes(s)
    );
  }, [students, q]);

  // ---- Modal fetch helpers (mevcut API’lere uyduruldu)
  const openProfile = async (stu) => {
    setSelected(stu);
    setProfileOpen(true);
    setCoursesOpen(false);
    setEnrollOpen(false);
    try {
      setModalLoading(true);
      // Elinizdeki API: user/profile/<user_id>/
      const { data } = await api.get(`user/profile/${stu.id}/`);
      setProfileData(data);
    } catch (e) {
      console.error(e);
      setProfileData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const openCourses = async (stu) => {
    setSelected(stu);
    setCoursesOpen(true);
    setProfileOpen(false);
    setEnrollOpen(false);
    try {
      setModalLoading(true);
      // Backend’inizde hangi uç varsa ona uydurun; örnek bırakıyorum:
      const { data } = await api.get(`students/${stu.id}/courses/`);
      setCoursesData(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      setCoursesData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openEnrollments = async (stu) => {
    setSelected(stu);
    setEnrollOpen(true);
    setProfileOpen(false);
    setCoursesOpen(false);
    try {
      setModalLoading(true);
      const { data } = await api.get(`students/${stu.id}/enrollments/`);
      setEnrollData(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      setEnrollData([]);
    } finally {
      setModalLoading(false);
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
                  {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                    <h4 className="m-0">📋 Öğrenci Listesi</h4>
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

                  {isKoordinator === false && !loading && !error && (
                    <div className="alert alert-warning py-2 mb-3">
                      Filtreli görünüm yalnızca <strong>AkademiKoordinator</strong> kullanıcıları
                      içindir. Genel liste gösteriliyor.
                    </div>
                  )}

                  {loading ? (
                    <div className="py-5 text-center text-muted">Yükleniyor…</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Öğrenci</th>
                            <th>E-posta</th>
                            <th>Telefon</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((s) => (
                            <tr key={s.id}>
                              <td className="fw-medium">
                                <div className="d-flex align-items-center gap-2">
                                  {s.image ? (
                                    <img
                                      src={s.image}
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
                                      {s.full_name?.[0] || "Ö"}
                                    </div>
                                  )}
                                  {s.full_name || "-"}
                                </div>
                              </td>
                              <td>{s.email || "-"}</td>
                              <td>{s.phone || "-"}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => openProfile(s)}
                                    title="Profil"
                                  >
                                    <FaUser className="me-1" /> Profil
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => openCourses(s)}
                                    title="Aldığı Dersler"
                                  >
                                    <FaBook className="me-1" /> Dersler
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => openEnrollments(s)}
                                    title="Kayıtlar"
                                  >
                                    <FaClipboardList className="me-1" /> Kayıtlar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
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
        </div>

        <AkademiBaseFooter />

        {/* Profil Modal */}
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
                  <strong>Hakkında:</strong> {profileData.about || "-"}
                </div>
                <div className="mb-2">
                  <strong>Ülke / Şehir:</strong> {profileData.country_name || "-"} /{" "}
                  {profileData.city_name || "-"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-danger">Profil verisi çekilemedi.</div>
          )}
        </SimpleModal>

        {/* Dersler Modal */}
        <SimpleModal
          open={coursesOpen}
          onClose={() => setCoursesOpen(false)}
          title={selected ? `${selected.full_name} • Aldığı Dersler` : "Dersler"}
          wide
        >
          {modalLoading ? (
            <div className="text-center text-muted py-3">Yükleniyor…</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Ders</th>
                    <th>Eğitmen</th>
                    <th>Seviye</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesData.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title || "-"}</td>
                      <td>{c.teacher_name || "-"}</td>
                      <td>{c.level || "-"}</td>
                      <td>{c.status || "-"}</td>
                    </tr>
                  ))}
                  {!coursesData.length && (
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

        {/* Kayıtlar Modal */}
        <SimpleModal
          open={enrollOpen}
          onClose={() => setEnrollOpen(false)}
          title={selected ? `${selected.full_name} • Kayıtlar` : "Kayıtlar"}
          wide
        >
          {modalLoading ? (
            <div className="text-center text-muted py-3">Yükleniyor…</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Ders</th>
                    <th>Kayıt Tarihi</th>
                    <th>İlerleme</th>
                    <th>Not</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollData.map((e) => (
                    <tr key={e.id}>
                      <td>{e.course_title || "-"}</td>
                      <td>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleString() : "-"}</td>
                      <td>{e.progress != null ? `%${e.progress}` : "-"}</td>
                      <td>{e.note || "-"}</td>
                    </tr>
                  ))}
                  {!enrollData.length && (
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
      </section>
    </>
  );
}
