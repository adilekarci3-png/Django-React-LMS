import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/tr";
import { Link } from "react-router-dom";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

function EskepInstructorDashboard() {
  const [stats, setStats] = useState({});
  const [homeworks, setHomeworks] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lessonReports, setLessonReports] = useState([]);
  const [fetching, setFetching] = useState(true);

  const userId = useUserData()?.user_id;
  const api = useAxios();

  useEffect(() => {
    moment.locale("tr");
  }, []);

  // -- ROUTE'ların sende zaten tanımlı olduğunu varsayıyorum --
  const TYPE_ROUTES = {
    derssonuraporu: ({ itemId, userId }) =>
      `/eskepinstructor/dersSonuRaporus/${userId}/${itemId}/`,
    kitaptahlili: ({ itemId, userId }) =>
      `/eskepinstructor/kitaptahlileris/${userId}/${itemId}/`,
    odev: ({ itemId, userId }) =>
      `/eskepinstructor/odevs/${userId}/${itemId}/`,
    proje: ({ itemId, userId }) =>
      `/eskepinstructor/projes/${userId}/${itemId}/`,
  };

  // 1) Tür ipuçları: status ve id key'leri (kendi alan adlarına göre genişlet)
  const TYPE_HINTS = {
    derssonuraporu: {
      status: [
        "derssonuraporu_status",
        "ders_sonu_raporu_status",
        "dersSonuRaporuStatus",
      ],
      id: ["derssonuraporu_id", "ders_sonu_raporu_id"],
    },
    kitaptahlili: {
      status: [
        "kitaptahlili_status",
        "kitap_tahlili_status",
        "kitapTahliliStatus",
      ],
      id: ["kitaptahlili_id", "kitap_tahlili_id"],
    },
    odev: {
      status: ["odev_status", "ödev_status", "odevStatus"],
      id: ["odev_id", "ödev_id"],
    },
    proje: {
      status: ["proje_status", "projeStatus"],
      id: ["proje_id"],
    },
  };

  const normalize = (s) => String(s || "").toLowerCase().replace(/[\s\-_]/g, "");
  const hasKey = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
  const hasAnyKey = (obj, keys = []) => keys.some((k) => hasKey(obj, k));

  // 2) TYPE belirleme: önce *_status, sonra *_id, sonra raw alanlar
  function getItemType(item) {
    // a) status anahtarları
    for (const [type, hints] of Object.entries(TYPE_HINTS)) {
      if (hasAnyKey(item, hints.status)) return type;
    }
    // b) id anahtarları
    for (const [type, hints] of Object.entries(TYPE_HINTS)) {
      if (hasAnyKey(item, hints.id)) return type;
    }
    // c) raw type/kind/... alanları
    const raw =
      item?.type ??
      item?.kind ??
      item?.content_type ??
      item?.contentType ??
      item?.model ??
      item?.kategori ??
      "";
    const t = normalize(raw);
    if (t.includes("derssonuraporu")) return "derssonuraporu";
    if (t.includes("kitaptahlili") || t.includes("kitaptahlil"))
      return "kitaptahlili";
    if (t.includes("odev") || t.includes("ödev")) return "odev";
    if (t.includes("proje")) return "proje";
    return ""; // bilinmiyorsa boş dön
  }

  // 3) ID bulma: önce type'a özgü id key'leri, sonra generic
  function getItemId(item) {
    const t = getItemType(item);
    if (t && TYPE_HINTS[t]?.id) {
      for (const k of TYPE_HINTS[t].id) {
        if (item?.[k] != null) return item[k];
      }
    }
    // generic fallback'ler
    return (
      item?.id ??
      item?.pk ??
      item?.item_id ??
      item?.odev_id ??
      item?.kitaptahlili_id ??
      item?.proje_id ??
      item?.derssonuraporu_id ??
      item?.ders_sonu_raporu_id ??
      null
    );
  }

  // Başlık ve tarih için sağlam yardımcılar
  const getItemLabel = (item, labelKey = "title") =>
    item?.[labelKey] ??
    item?.name ??
    item?.baslik ??
    item?.subject ??
    `#${item?.id ?? ""}`;

  const getItemDate = (item) =>
    item?.date ??
    item?.created_at ??
    item?.createdAt ??
    item?.updated_at ??
    item?.updatedAt ??
    item?.timestamp ??
    null;

  // 4) Link üretici (ctx.forceType ile istersen türü zorlayabilirsin)
  const defaultLinkBuilder = (item, ctx = {}) => {
    const t = ctx.forceType || getItemType(item);
    const tpl = TYPE_ROUTES[t];
    if (!tpl) return null;

    const itemId = getItemId(item);
    const _userId = ctx.userId;
    if (!itemId || !_userId) return null;

    return tpl({ itemId, userId: _userId });
  };

  const fetchData = async () => {
    if (!userId) return; // userId hazır olmadan çağırma
    setFetching(true);
    try {
      const [hw, books, proj, reports] = await Promise.all([
        api.get(`eskepinstructor/odev-list/${userId}/`),
        api.get(`eskepinstructor/kitaptahlili-list/${userId}/`),
        api.get(`eskepinstructor/proje-list/${userId}/`),
        api.get(`eskepinstructor/derssonuraporu-list/${userId}/`),
      ]);

      setHomeworks(hw.data ?? []);
      setBookReviews(books.data ?? []);
      setProjects(proj.data ?? []);
      setLessonReports(reports.data ?? []);
console.log(hw.data);
console.log(books.data);
console.log(proj.data);
console.log(reports.data);
      // Örnek stat verisi (backend'den geliyorsa burayı değiştir)
      setStats({
        total_students: 25,
        total_interns: 10,
        total_graduates: 8,
        total_certificates: 12,
      });
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const renderList = (
    title,
    data,
    labelKey = "title",
    linkBuilder = defaultLinkBuilder,
    ctx = {}
  ) => (
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-header bg-light">
        <h6 className="mb-0">{title}</h6>
      </div>
      <div className="card-body">
        {Array.isArray(data) && data.length > 0 ? (
          <ul className="list-group list-group-flush">
            {data.map((item, index) => {
              const href = linkBuilder(item, ctx); // tipine göre link
              const dt = getItemDate(item);
              const dateText = dt ? moment(dt).format("DD MMM YYYY") : "-";
              return (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center gap-2 flex-wrap"
                  key={item?.id ?? item?.pk ?? index}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                    {getItemLabel(item, labelKey)}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary rounded-pill">
                      {dateText}
                    </span>
                    {href && (
                      <Link to={href} className="btn btn-primary btn-sm">
                        Detay <i className="fas fa-gear fa-spin ms-1"></i>
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted small fst-italic mb-0">
            Henüz içerik bulunamadı.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <EskepBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-2">
            <div className="col-lg-3 col-md-3 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">
              <h4 className="mb-4 d-flex align-items-center">
                <i className="bi bi-speedometer2 me-2 text-primary"></i>
                Koordinatör Paneli
              </h4>

              {/* İstatistik Kartları */}
              <div className="row g-4 mb-4">
                {[
                  {
                    icon: "fa-user-graduate",
                    color: "warning",
                    value: stats.total_students,
                    label: "Tüm Öğrenciler",
                  },
                  {
                    icon: "fa-briefcase",
                    color: "info",
                    value: stats.total_interns,
                    label: "Tüm Stajyerler",
                  },
                  {
                    icon: "fa-user-check",
                    color: "success",
                    value: stats.total_graduates,
                    label: "Tüm Mezunlar",
                  },
                  {
                    icon: "fa-medal",
                    color: "primary",
                    value: stats.total_certificates,
                    label: "Verdiği Sertifika",
                  },
                ].map(({ icon, color, value, label }, idx) => (
                  <div className="col-sm-6 col-lg-3" key={idx}>
                    <div
                      className={`border-start border-4 border-${color} p-4 shadow-sm rounded bg-white`}
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className={`fas ${icon} fa-2x text-${color} me-3`}
                        ></i>
                        <div>
                          <h5 className="fw-bold mb-0">{value ?? 0}</h5>
                          <small className="text-muted">{label}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* İçerikler */}
              {fetching ? (
                <div className="text-center p-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  ></div>
                  <p>İçerikler yükleniyor...</p>
                </div>
              ) : (
                <>
                  {renderList(
                    "Gönderilen Ödevler",
                    homeworks,
                    "title",
                    defaultLinkBuilder,
                    { userId, forceType: "odev" }
                  )}
                  {renderList(
                    "Kitap Tahlilleri",
                    bookReviews,
                    "title",
                    defaultLinkBuilder,
                    { userId, forceType: "kitaptahlili" }
                  )}
                  {renderList(
                    "Projeler",
                    projects,
                    "title",
                    defaultLinkBuilder,
                    { userId, forceType: "proje" }
                  )}
                  {renderList(
                    "Ders Sonu Raporları",
                    lessonReports,
                    "title",
                    defaultLinkBuilder,
                    { userId, forceType: "derssonuraporu" }
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <EskepBaseFooter />
    </>
  );
}

export default EskepInstructorDashboard;
