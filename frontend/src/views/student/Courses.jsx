import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/tr";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import "./css/Sidebar.css";

moment.locale("tr");

function Courses() {
  const api = useAxios();
  const user = useUserData();
  const userId = user?.user_id;

  const [originalCourses, setOriginalCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Arama & filtreler
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Debounce (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Veriyi çek
  const fetchData = async () => {
    try {
      setFetching(true);
      setError("");
      if (!userId) {
        setError("Kullanıcı bulunamadı.");
        setOriginalCourses([]);
        setCourses([]);
        return;
      }
      const res = await api.get(`student/course-list/${userId}/`);
      const list = Array.isArray(res.data) ? res.data : [];
      setOriginalCourses(list);
      setCourses(list);
    } catch (e) {
      console.error(e);
      setError("Kurslar yüklenirken bir hata oluştu.");
      setOriginalCourses([]);
      setCourses([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Filtre seçenekleri
  const { categoryOptions, levelOptions } = useMemo(() => {
    const catMap = new Map();
    const levelSet = new Set();
    originalCourses.forEach((c) => {
      const catId =
        c?.course?.category?.id ??
        c?.course?.category_id ??
        c?.course?.category;
      const catTitle =
        c?.course?.category?.title ??
        c?.course?.category_title ??
        (typeof c?.course?.category === "string" ? c.course.category : undefined);

      if (catId != null && catTitle) catMap.set(String(catId), catTitle);
      const lvl = c?.course?.level;
      if (lvl) levelSet.add(lvl);
    });
    return {
      categoryOptions: Array.from(catMap.entries()).map(([value, label]) => ({ value, label })),
      levelOptions: Array.from(levelSet.values()),
    };
  }, [originalCourses]);

  // Türetilmiş alanlar + filtreler
  const rows = useMemo(() => {
    const base = originalCourses.map((c) => {
      const totalLectures = c?.lectures?.length ?? 0;
      const completed = c?.completed_lesson?.length ?? 0;
      const percent = totalLectures > 0 ? Math.round((completed / totalLectures) * 100) : 0;

      // Fallback zinciri (nested variant.course)
      const firstLecture = c?.lectures?.[0];
      const nestedCourse =
        firstLecture?.variant?.course ??
        c?.curriculum?.[0]?.course ??
        null;

      const imageFallback =
        c?.course?.image ??
        nestedCourse?.image ??
        null;

      const fileFallback =
        c?.course?.file ??
        nestedCourse?.file ??
        firstLecture?.file ??
        null;

      const catId =
        c?.course?.category?.id ??
        c?.course?.category_id ??
        c?.course?.category;

      const catTitle =
        c?.course?.category?.title ??
        c?.course?.category_title ??
        (typeof c?.course?.category === "string" ? c.course.category : undefined);

      return {
        ...c,
        totalLectures,
        completed,
        percent,
        _catId: catId != null ? String(catId) : "",
        _catTitle: catTitle || "",
        _level: c?.course?.level || "",
        _title: c?.course?.title?.toLowerCase() || "",
        _image: imageFallback,
        _file: fileFallback,
      };
    });

    return base.filter((c) => {
      if (debouncedQuery && !c._title.includes(debouncedQuery)) return false;
      if (levelFilter && c._level !== levelFilter) return false;
      if (categoryFilter && c._catId !== String(categoryFilter)) return false;
      return true;
    });
  }, [originalCourses, debouncedQuery, levelFilter, categoryFilter]);

  // Özet
  const summary = useMemo(() => {
    const totalCourses = rows.length;
    const totals = rows.reduce(
      (acc, c) => {
        acc.lectures += c.totalLectures;
        acc.completed += c.completed;
        return acc;
      },
      { lectures: 0, completed: 0 }
    );
    const avgProgress =
      totalCourses > 0
        ? Math.round(rows.reduce((s, c) => s + c.percent, 0) / totalCourses)
        : 0;
    return {
      totalCourses,
      totalLectures: totals.lectures,
      totalCompleted: totals.completed,
      avgProgress,
    };
  }, [rows]);

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header */}
          <Header />

          {/* Grid: Sidebar + Content */}
          <div className="row mt-0 mt-md-4 g-4">
            {/* Sidebar */}
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            {/* Content */}
            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                <i className="fas fa-chalkboard-user"></i> Kurslarım
              </h4>

              {/* Özet kartları */}
              {!fetching && !error && (
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex flex-column align-items-start">
                        <div className="text-muted small mb-1">
                          <i className="fas fa-book-open me-2 text-primary"></i>
                          Toplam Kurs
                        </div>
                        <div className="h4 mb-0">{summary.totalCourses}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex flex-column align-items-start">
                        <div className="text-muted small mb-1">
                          <i className="fas fa-list-ul me-2 text-success"></i>
                          Toplam Ders
                        </div>
                        <div className="h4 mb-0">{summary.totalLectures}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex flex-column align-items-start">
                        <div className="text-muted small mb-1">
                          <i className="fas fa-check-circle me-2 text-info"></i>
                          Tamamlanan
                        </div>
                        <div className="h4 mb-0">{summary.totalCompleted}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex flex-column align-items-start">
                        <div className="text-muted small mb-1">
                          <i className="fas fa-chart-line me-2 text-warning"></i>
                          Ortalama İlerleme
                        </div>
                        <div className="d-flex align-items-center gap-2 w-100">
                          <div className="progress flex-grow-1" style={{ height: 8 }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${summary.avgProgress}%` }}
                              aria-valuenow={summary.avgProgress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                          <span className="small text-muted">{summary.avgProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-1">Kurslar</h3>
                    <span>Panel sayfanızdan kursları izlemeye hemen başlayın.</span>
                  </div>

                  <div className="card-body">
                    {/* Arama + Filtreler */}
                    <form className="row g-3">
                      <div className="col-12 col-md-6">
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Kurslarında ara"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          aria-label="Kurslarda ara"
                        />
                        <small className="text-muted">Arama 300ms gecikmeli uygulanır.</small>
                      </div>

                      <div className="col-6 col-md-3">
                        <select
                          className="form-select"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          aria-label="Kategori filtresi"
                        >
                          <option value="">Kategori: Tümü</option>
                          {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6 col-md-3">
                        <select
                          className="form-select"
                          value={levelFilter}
                          onChange={(e) => setLevelFilter(e.target.value)}
                          aria-label="Seviye filtresi"
                        >
                          <option value="">Seviye: Tümü</option>
                          {levelOptions.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>
                    </form>

                    {error && (
                      <div className="alert alert-danger mt-3 mb-0" role="alert">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="table-responsive">
                    <table className="table mb-0 table-hover table-centered text-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th style={{ minWidth: 260 }}>Kurslar</th>
                          <th>Kayıt Tarihi</th>
                          <th>Dersler</th>
                          <th>İlerleme</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 && !error && (
                          <tr>
                            <td colSpan={5} className="text-center py-4">
                              Kurs bulunamadı
                            </td>
                          </tr>
                        )}

                        {rows.map((c) => (
                          <tr key={c?.enrollment_id || `${c?.course?.id}-${c?.date || Math.random()}`}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  {c._image ? (
                                    <img
                                      src={c._image}
                                      alt={c?.course?.title || "course"}
                                      style={{
                                        width: 120,
                                        height: 80,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 120,
                                        height: 80,
                                        borderRadius: 8,
                                        background: "#f1f3f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <i className="fas fa-image text-muted"></i>
                                    </div>
                                  )}

                                  {c._file && (
                                    <div className="mt-2">
                                      <a
                                        href={c._file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-secondary btn-sm"
                                        title="Dersi önizle"
                                      >
                                        <i className="fas fa-play me-1"></i> Önizle
                                      </a>
                                    </div>
                                  )}
                                </div>

                                <div className="ms-3">
                                  <h4 className="mb-1 h6">
                                    <span className="text-inherit text-decoration-none text-dark">
                                      {c?.course?.title}
                                    </span>
                                  </h4>
                                  <ul className="list-inline fs-6 mb-0 text-muted">
                                    <li className="list-inline-item me-3">
                                      <i className="fas fa-language me-1"></i>
                                      <span>{c?.course?.language || "-"}</span>
                                    </li>
                                    <li className="list-inline-item">
                                      <i className="bi bi-reception-4 me-1"></i>
                                      <span>{c?.course?.level || "-"}</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="text-muted">
                                {c?.date ? moment(c.date).format("D MMM, YYYY") : "-"}
                              </span>
                            </td>

                            <td>
                              <span className="text-muted">
                                {c?.totalLectures}
                              </span>
                            </td>

                            <td style={{ minWidth: 160 }}>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: 8 }}>
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${c?.percent}%` }}
                                    aria-valuenow={c?.percent}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  />
                                </div>
                                <small className="text-muted">
                                  {c?.completed}/{c?.totalLectures}
                                </small>
                              </div>
                            </td>

                            <td>
                              <Link
                                to={`/student/courses/${c?.enrollment_id}/`}
                                className={`btn btn-sm mt-2 mt-md-0 ${
                                  (c?.completed ?? 0) > 0 ? "btn-primary" : "btn-success"
                                }`}
                              >
                                {(c?.completed ?? 0) > 0 ? "Kursa Devam Et" : "Kursa Başla"}
                                <i className="fas fa-arrow-right ms-2"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </>
  );
}

export default Courses;
