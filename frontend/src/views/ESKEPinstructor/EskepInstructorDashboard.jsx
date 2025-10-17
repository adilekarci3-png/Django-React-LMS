import { useState, useEffect, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState("odev");

  const userId = useUserData()?.user_id;
  const api = useAxios();

  useEffect(() => {
    moment.locale("tr");
  }, []);

  // Liste endpoint rotaları
  const TYPE_ROUTES = useMemo(
    () => ({
      derssonuraporu: ({ itemId, userId }) =>
        `/eskepinstructor/dersSonuRaporus/${userId}/${itemId}/`,
      kitaptahlili: ({ itemId, userId }) =>
        `/eskepinstructor/kitaptahlileris/${userId}/${itemId}/`,
      odev: ({ itemId, userId }) =>
        `/eskepinstructor/odevs/${userId}/${itemId}/`,
      proje: ({ itemId, userId }) =>
        `/eskepinstructor/projes/${userId}/${itemId}/`,
    }),
    []
  );

  // Detay endpoint rotaları
  const TYPE_DETAIL_ROUTES = useMemo(
    () => ({
      odev: ({ itemId, koordinatorId }) =>
        `/eskepinstructor/odev-detail/${itemId}/${koordinatorId}/`,
    }),
    []
  );

  const normalize = (s) => String(s || "").toLowerCase().replace(/[\s\-_]/g, "");
  const hasKey = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
  const hasAnyKey = (obj, keys = []) => keys.some((k) => hasKey(obj, k));

  const TYPE_HINTS = useMemo(
    () => ({
      derssonuraporu: { status: ["derssonuraporu_status"], id: ["derssonuraporu_id"] },
      kitaptahlili: { status: ["kitaptahlili_status"], id: ["kitaptahlili_id"] },
      odev: { status: ["odev_status"], id: ["odev_id"] },
      proje: { status: ["proje_status"], id: ["proje_id"] },
    }),
    []
  );

  function getItemType(item) {
    for (const [type, hints] of Object.entries(TYPE_HINTS)) {
      if (hasAnyKey(item, hints.status)) return type;
    }
    for (const [type, hints] of Object.entries(TYPE_HINTS)) {
      if (hasAnyKey(item, hints.id)) return type;
    }
    const raw = item?.type ?? "";
    const t = normalize(raw);
    if (t.includes("derssonuraporu")) return "derssonuraporu";
    if (t.includes("kitaptahlili")) return "kitaptahlili";
    if (t.includes("odev")) return "odev";
    if (t.includes("proje")) return "proje";
    return "";
  }

  function getItemId(item) {
    return (
      item?.id ??
      item?.odev_id ??
      item?.kitaptahlili_id ??
      item?.proje_id ??
      null
    );
  }

  const getPreparedBy = (item) =>
    item?.prepared_by_full_name || item?.koordinator_full_name || "Bilinmiyor";

  const getItemLabel = (item) => item?.title ?? `#${item?.id ?? ""}`;
  const getItemDate = (item) => item?.date ?? item?.created_at ?? null;

  // Link oluşturucu
  const defaultLinkBuilder = (item, ctx = {}) => {
    const t = ctx.forceType || getItemType(item);
    const itemId = getItemId(item);
    const koordinatorId = item?.koordinator_id ?? ctx.koordinatorId ?? ctx.userId;
    if (!t || !itemId || !koordinatorId) return null;
    if (TYPE_DETAIL_ROUTES[t]) {
      return TYPE_DETAIL_ROUTES[t]({ itemId, koordinatorId });
    }
    const listTpl = TYPE_ROUTES[t];
    return listTpl ? listTpl({ itemId, userId: koordinatorId }) : null;
  };

  const fetchData = async () => {
    if (!userId) return;
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
      console.log(hw.data, books.data, proj.data, reports.data);
      setStats({ total_students: 25, total_interns: 10, total_graduates: 8, total_certificates: 12 });
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const renderList = (title, data, ctx = {}) => (
    <div className="card shadow-sm border-0 rounded-4">
      <div className="card-header bg-white border-0 py-3">
        <h6 className="mb-0">{title}</h6>
      </div>
      <div className="card-body p-0">
        {Array.isArray(data) && data.length > 0 ? (
          <ul className="list-group list-group-flush">
            {data.map((item, index) => {
              const href = defaultLinkBuilder(item, ctx);
              const dt = getItemDate(item);
              const dateText = dt ? moment(dt).format("DD MMM YYYY") : "-";
              return (
                <li className="list-group-item d-flex justify-content-between" key={item?.id ?? index}>
                  <div>
                    <div className="fw-semibold">{getItemLabel(item)}</div>
                    <small className="text-muted">Hazırlayan: {getPreparedBy(item)}</small>
                  </div>
                  <div>
                    <span className="badge bg-secondary me-2">{dateText}</span>
                    {href && (
                      <Link to={href} className="btn btn-sm btn-primary rounded-pill">
                        Detay
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4 text-muted">Henüz içerik yok.</div>
        )}
      </div>
    </div>
  );

  const TABS = [
    { key: "odev", title: "Ödevler", data: homeworks, forceType: "odev" },
    { key: "kitaptahlili", title: "Kitap Tahlilleri", data: bookReviews, forceType: "kitaptahlili" },
    { key: "proje", title: "Projeler", data: projects, forceType: "proje" },
    { key: "derssonuraporu", title: "Ders Sonu Raporları", data: lessonReports, forceType: "derssonuraporu" },
  ];

  return (
    <>
      <EskepBaseHeader />
      <section className="pt-4 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row g-4">
            <div className="col-12 col-lg-3 col-xl-3">
              <Sidebar />
            </div>
            <div className="col-12 col-lg-9 col-xl-9">
              <ul className="nav nav-tabs mb-3">
                {TABS.map((t) => (
                  <li className="nav-item" key={t.key}>
                    <button
                      className={`nav-link ${activeTab === t.key ? "active" : ""}`}
                      onClick={() => setActiveTab(t.key)}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
              {TABS.filter((t) => t.key === activeTab).map((t) => (
                <div key={t.key}>
                  {renderList(t.title, t.data, { userId, forceType: t.forceType })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <EskepBaseFooter />
    </>
  );
}

export default EskepInstructorDashboard;
