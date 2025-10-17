import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/tr";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

moment.locale("tr");

function EskepInstructorOdevs() {
  const [odevs, setOdevs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState({ key: "date", dir: "desc" });

  const api = useAxios();
  const userData = useUserData();
  const abortRef = useRef(null);

  const fetchData = async (userId) => {
    if (!userId) return;
    setFetching(true);
    setError("");
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await api.get(`eskepinstructor/odev-list/${userId}/`, {
        signal: controller.signal,
      });
      setOdevs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.name !== "CanceledError" && e.name !== "AbortError") {
        setError("Ödevler alınırken bir sorun oluştu.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (userData?.user_id) fetchData(userData.user_id);
    return () => abortRef.current?.abort?.();
  }, [userData?.user_id]);

  // ——— UI yardımcıları ———
  const levels = useMemo(() => {
    const set = new Set(odevs.map((o) => o.level).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [odevs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = odevs.filter((o) => {
      const matchesQ =
        !q ||
        o.title?.toLowerCase().includes(q) ||
        o.koordinator_username?.toLowerCase().includes(q) ||
        o.prepared_by_full_name?.toLowerCase().includes(q);
      const matchesLevel =
        levelFilter === "all" || String(o.level || "").toLowerCase() === String(levelFilter).toLowerCase();
      return matchesQ && matchesLevel;
    });

    list.sort((a, b) => {
      const dir = sortBy.dir === "asc" ? 1 : -1;
      switch (sortBy.key) {
        case "title":
          return dir * String(a.title || "").localeCompare(String(b.title || ""), "tr");
        case "level":
          return dir * String(a.level || "").localeCompare(String(b.level || ""), "tr");
        case "lectures":
          return dir * ((a.lectures?.length || 0) - (b.lectures?.length || 0));
        case "date":
        default:
          return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    });

    return list;
  }, [odevs, query, levelFilter, sortBy]);

  const toggleSort = (key) => {
    setSortBy((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const SortIcon = ({ col }) => {
    if (sortBy.key !== col) return <i className="fas fa-sort ms-1 text-muted" />;
    return sortBy.dir === "asc" ? (
      <i className="fas fa-sort-up ms-1" />
    ) : (
      <i className="fas fa-sort-down ms-1" />
    );
  };

  const imgFallback = (e) => {
    e.currentTarget.src =
      "https://via.placeholder.com/160x120.png?text=Odev";
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <h4 className="mb-0">
                  <i className="fas fa-chalkboard-user text-primary me-2" />
                  Gönderilen Ödevler
                </h4>

                <div className="d-flex gap-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search" />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Başlık, koordinatör, hazırlayan..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-select"
                    style={{ minWidth: 160 }}
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  >
                    {levels.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv === "all" ? "Tüm Seviyeler" : lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card mb-4 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Ödevler</h5>
                  <small className="text-muted">Panel sayfanızdan ödevleri inceleyebilirsiniz.</small>
                </div>

                <div className="table-responsive" style={{ maxHeight: 520 }}>
                  <table className="table mb-0 table-hover align-middle">
                    <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                      <tr>
                        <th role="button" onClick={() => toggleSort("title")} className="text-nowrap">
                          Ödev <SortIcon col="title" />
                        </th>
                        <th role="button" onClick={() => toggleSort("date")} className="text-nowrap">
                          Kayıt Tarihi <SortIcon col="date" />
                        </th>
                        <th role="button" onClick={() => toggleSort("lectures")} className="text-nowrap">
                          Ders Sayısı <SortIcon col="lectures" />
                        </th>
                        <th role="button" onClick={() => toggleSort("level")} className="text-nowrap">
                          Seviye <SortIcon col="level" />
                        </th>
                        <th className="text-nowrap">Koordinatör</th>
                        <th className="text-nowrap">Hazırlayan</th>
                        <th className="text-nowrap">İşlem</th>
                      </tr>
                    </thead>

                    <tbody>
                      {fetching && (
                        <>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={`sk-${i}`}>
                              <td colSpan="7" className="p-0">
                                <div
                                  className="placeholder-wave"
                                  style={{ height: 64, display: "flex", alignItems: "center", padding: "0.75rem" }}
                                >
                                  <span className="placeholder col-1 me-3" style={{ height: 48 }} />
                                  <span className="placeholder col-3 me-2" />
                                  <span className="placeholder col-2 me-2" />
                                  <span className="placeholder col-1 me-2" />
                                  <span className="placeholder col-2 me-2" />
                                  <span className="placeholder col-2" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}

                      {!fetching && error && (
                        <tr>
                          <td colSpan="7" className="text-center p-4">
                            <div className="alert alert-danger mb-0">{error}</div>
                          </td>
                        </tr>
                      )}

                      {!fetching && !error && filtered.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-5">
                            <div className="py-4">
                              <i className="far fa-folder-open fa-2x text-muted mb-3" />
                              <h6 className="mb-1">Ödev bulunamadı</h6>
                              <p className="text-muted mb-3">
                                Filtreleri temizlemeyi veya arama terimini değiştirmeyi deneyin.
                              </p>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                  setQuery("");
                                  setLevelFilter("all");
                                }}
                              >
                                Filtreleri Sıfırla
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {!fetching &&
                        !error &&
                        filtered.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={c.image}
                                  alt={c.title}
                                  onError={imgFallback}
                                  className="rounded"
                                  style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8 }}
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1 text-dark">{c.title}</h6>
                                  {c.category_name && (
                                    <span className="badge bg-light text-dark border">{c.category_name}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-nowrap">{moment(c.date).format("D MMM YYYY")}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {c.lectures?.length || 0}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-primary-subtle text-primary border">{c.level || "-"}</span>
                            </td>
                            <td className="text-nowrap">
                              {c.koordinator_username ? (
                                <span className="badge bg-success-subtle text-success border">
                                  {c.koordinator_username}
                                </span>
                              ) : (
                                <span className="text-muted">Bilinmiyor</span>
                              )}
                            </td>
                            <td className="text-nowrap">{c.prepared_by_full_name || <span className="text-muted">Bilinmiyor</span>}</td>
                            <td className="text-nowrap">
                              <Link
                                to={`/eskepinstructor/odevs/${c.id}/${c.koordinator_id}/`}
                                className="btn btn-success btn-sm"
                              >
                                İncele <i className="fas fa-arrow-right ms-2" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Küçük özet kartı */}
              {!fetching && !error && (
                <div className="d-flex gap-3 flex-wrap">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="fw-semibold text-muted">Toplam Ödev</div>
                      <div className="fs-4">{odevs.length}</div>
                    </div>
                  </div>
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="fw-semibold text-muted">Filtrelenen</div>
                      <div className="fs-4">{filtered.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default EskepInstructorOdevs;
