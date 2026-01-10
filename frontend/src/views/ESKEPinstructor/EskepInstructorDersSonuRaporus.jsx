// src/views/ESKEPinstructor/EskepInstructorDersSonuRaporus.jsx
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

function EskepInstructorDersSonuRaporus() {
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const api = useAxios();
  const userData = useUserData();
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchData = async (userId) => {
    if (!userId) return;
    setFetching(true);
    setError("");
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await api.get(
        `eskepinstructor/derssonuraporu-list/${userId}/`,
        { signal: controller.signal }
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.name !== "CanceledError" && e.name !== "AbortError") {
        setError("Veriler alınırken bir sorun oluştu.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (userData?.user_id) fetchData(userData.user_id);
    return () => abortRef.current?.abort?.();
  }, [userData?.user_id]);

  const levels = useMemo(() => {
    const s = new Set(items.map((x) => x.level).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items.filter((it) => {
      const matchesQ =
        !q ||
        it.title?.toLowerCase().includes(q) ||
        it.koordinator?.full_name?.toLowerCase?.().includes(q) ||
        it.inserteduser?.full_name?.toLowerCase?.().includes(q);

      const matchesLevel =
        level === "all" ||
        String(it.level || "").toLowerCase() ===
          String(level).toLowerCase();

      return matchesQ && matchesLevel;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const ad =
        a.date || a.created_at || a.inserteddate || a.inserted_at || "";
      const bd =
        b.date || b.created_at || b.inserteddate || b.inserted_at || "";

      switch (sort.key) {
        case "title":
          return (
            dir *
            String(a.title || "").localeCompare(
              String(b.title || ""),
              "tr"
            )
          );
        case "level":
          return (
            dir *
            String(a.level || "").localeCompare(
              String(b.level || ""),
              "tr"
            )
          );
        case "date":
        default:
          return dir * (new Date(ad).getTime() - new Date(bd).getTime());
      }
    });

    return list;
  }, [items, search, level, sort]);

  const onSearch = (e) => {
    const v = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(v), 180);
  };

  const onSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const SortIcon = ({ col }) => {
    if (sort.key !== col)
      return <i className="fas fa-sort ms-1 text-muted" />;
    return sort.dir === "asc" ? (
      <i className="fas fa-sort-up ms-1" />
    ) : (
      <i className="fas fa-sort-down ms-1" />
    );
  };

  const imgFallback = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "http://127.0.0.1:8000/static/img/placeholder.png";
  };

  return (
    <>
      <ESKEPBaseHeader />

      <section
        className="pt-5 pb-5 bg-light min-vh-100"
        style={{ paddingTop: "6rem" }}
      >
        {/* geniş container */}
        <div className="container-xxl">
          <Header />

          {/* FLEX LAYOUT: sol sabit, sağ geniş */}
          <div
            className="d-lg-flex gap-4 mt-4 align-items-start"
            style={{ minHeight: "65vh" }}
          >
            {/* SOL MENÜ */}
            <div
              className="flex-shrink-0 mb-4 mb-lg-0"
              style={{ width: 270, minWidth: 250 }}
            >
              <Sidebar />
            </div>

            {/* SAĞ İÇERİK */}
            <div className="flex-grow-1 d-flex flex-column gap-3">
              {/* üst bar */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                <h4 className="mb-0 d-flex align-items-center">
                  <i
                    className="fas fa-book-open text-success me-2"
                    style={{ fontSize: "1.4rem" }}
                  />
                  Ders Sonu Raporlarım
                </h4>

                <div className="d-flex gap-2 flex-wrap">
                  <div className="input-group" style={{ minWidth: 280 }}>
                    <span className="input-group-text">
                      <i className="fas fa-search" />
                    </span>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Başlık, koordinatör, hazırlayan ara…"
                      onChange={onSearch}
                    />
                  </div>
                  <select
                    className="form-select"
                    style={{ minWidth: 160 }}
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    {levels.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv === "all" ? "Tüm Seviyeler" : lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* tablo kartı */}
              <div className="card mb-4 shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="mb-0">Raporlar</h5>
                      <small className="text-muted">
                        Toplam <strong>{items.length}</strong> •
                        Filtrelenen <strong>{filtered.length}</strong>
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {fetching && (
                        <span className="badge bg-secondary">
                          Yükleniyor
                        </span>
                      )}
                      {error && (
                        <span className="badge bg-danger">{error}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="table-responsive"
                  style={{ maxHeight: "70vh", position: "relative" }}
                >
                  <table className="table mb-0 text-nowrap table-hover align-middle">
                    <thead
                      className="table-light sticky-top"
                      style={{ top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th
                          role="button"
                          onClick={() => onSort("title")}
                          className="text-nowrap"
                        >
                          Rapor <SortIcon col="title" />
                        </th>
                        <th
                          role="button"
                          onClick={() => onSort("date")}
                          className="text-nowrap"
                        >
                          Kayıt Tarihi <SortIcon col="date" />
                        </th>
                        <th className="text-nowrap">Ders Sayısı</th>
                        <th
                          role="button"
                          onClick={() => onSort("level")}
                          className="text-nowrap"
                        >
                          Seviye <SortIcon col="level" />
                        </th>
                        <th className="text-nowrap">Koordinatör</th>
                        <th className="text-nowrap">Hazırlayan</th>
                        <th className="text-nowrap">İşlem</th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* skeleton */}
                      {fetching &&
                        Array.from({ length: 6 }).map((_, i) => (
                          <tr key={`sk-${i}`}>
                            <td colSpan="7" className="p-0">
                              <div
                                className="placeholder-wave"
                                style={{
                                  height: 64,
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0.75rem",
                                }}
                              >
                                <span
                                  className="placeholder col-1 me-3"
                                  style={{ height: 48 }}
                                />
                                <span className="placeholder col-3 me-2" />
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-1 me-2" />
                                <span className="placeholder col-2 me-2" />
                                <span className="placeholder col-2" />
                              </div>
                            </td>
                          </tr>
                        ))}

                      {/* boş */}
                      {!fetching && !error && filtered.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-5">
                            <EmptyState
                              title="Rapor bulunamadı"
                              subtitle="Arama terimini değiştirin veya filtreleri temizleyin."
                            />
                          </td>
                        </tr>
                      )}

                      {/* veri */}
                      {!fetching &&
                        !error &&
                        filtered.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={
                                    c.image ||
                                    "http://127.0.0.1:8000/static/img/placeholder.png"
                                  }
                                  alt={c.title}
                                  onError={imgFallback}
                                  className="rounded"
                                  style={{
                                    width: 90,
                                    height: 64,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                  }}
                                />
                                <div className="ms-3">
                                  <h6 className="mb-1 text-dark">
                                    {c.title}
                                  </h6>
                                  {c.category_name && (
                                    <span className="badge bg-light text-dark border">
                                      {c.category_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-nowrap">
                              {moment(
                                c.date ||
                                  c.created_at ||
                                  c.inserteddate ||
                                  c.inserted_at
                              ).format("D MMM YYYY")}
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {c.lectures?.length || 0}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-primary-subtle text-primary border">
                                {c.level || "-"}
                              </span>
                            </td>
                            <td className="text-nowrap">
                              {c.koordinator?.full_name ? (
                                <span className="badge bg-success-subtle text-success border">
                                  {c.koordinator.full_name}
                                </span>
                              ) : (
                                <span className="text-muted">
                                  Bilinmiyor
                                </span>
                              )}
                            </td>
                            <td className="text-nowrap">
                              {c.inserteduser?.full_name ? (
                                c.inserteduser.full_name
                              ) : (
                                <span className="text-muted">
                                  Bilinmiyor
                                </span>
                              )}
                            </td>
                            <td className="text-nowrap">
                              {(c.koordinator?.id ||
                                userData?.user_id) ? (
                                <Link
                                  to={`/eskepinstructor/dersSonuRaporus/${c.id}/${
                                    c.koordinator?.id || userData?.user_id
                                  }/`}
                                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                  style={{ borderRadius: 20 }}
                                >
                                  <i className="fas fa-eye" /> İncele
                                </Link>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  disabled
                                >
                                  Koordinatör Yok
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* alt istatistikler */}
              {!fetching && !error && (
                <div className="d-flex gap-3 flex-wrap">
                  <MiniStat label="Toplam" value={items.length} />
                  <MiniStat label="Filtrelenen" value={filtered.length} />
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

export default EskepInstructorDersSonuRaporus;

// ————————————————————————
function MiniStat({ label, value }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="fw-semibold text-muted">{label}</div>
        <div className="fs-4">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ title = "Kayıt bulunamadı", subtitle = "" }) {
  return (
    <div className="text-center p-4 border rounded-3 bg-white">
      <div className="display-6 mb-2">📄</div>
      <h6 className="mb-1">{title}</h6>
      {subtitle && <div className="text-muted small">{subtitle}</div>}
    </div>
  );
}
