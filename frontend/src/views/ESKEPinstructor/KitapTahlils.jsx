import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function KitapTahlils() {
  const [kitapTahlils, setKitapTahlils] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [fetching, setFetching] = useState(true);

  const fetchData = () => {
    setFetching(true);
    useAxios()
      .get(`eskepinstructor/kitaptahlili-list/${UserData()?.user_id}/`)
      .then((res) => {
        setKitapTahlils(res.data);
        setFiltered(res.data);
        setFetching(false);
        console.log(res.data);
      })
      .catch(() => setFetching(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = kitapTahlils.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredData);
  }, [search, kitapTahlils]);

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[key] || "";
      const bVal = b[key] || "";
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(sorted);
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-4">
                <i className="fas fa-chalkboard-user"></i> Gönderilen Kitap Tahlilleri
              </h4>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kitap ismine göre ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {fetching ? (
                <p className="mt-3 p-3">Yükleniyor...</p>
              ) : (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Kitap Tahlilleri</h3>
                  </div>
                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th onClick={() => sortData("title")} style={{ cursor: "pointer" }}>
                            Kitap Tahlili
                          </th>
                          <th onClick={() => sortData("date")} style={{ cursor: "pointer" }}>
                            Kayıt Tarihi
                          </th>
                          <th>Ders Sayısı</th>
                          <th onClick={() => sortData("level")} style={{ cursor: "pointer" }}>
                            Seviye
                          </th>
                          <th>Koordinatör</th>
                          <th>Hazırlayan</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length > 0 ? (
                          filtered.map((c, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={c.image}
                                    alt={c.title}
                                    className="rounded"
                                    style={{
                                      width: "80px",
                                      height: "60px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div className="ms-3">
                                    <h5 className="mb-1">{c.title}</h5>
                                  </div>
                                </div>
                              </td>
                              <td>{moment(c.date).format("D MMM, YYYY")}</td>
                              <td>{c.lectures?.length || 0}</td>
                              <td>{c.level}</td>
                              <td>{c.koordinator?.full_name || "Bilinmiyor"}</td>
                              <td>{c.hazirlayan?.full_name || "Bilinmiyor"}</td>
                              <td>
                                {c.koordinator?.id ? (
                                  <Link
                                    to={`/eskepinstructor/kitaptahlileris/${c.id}/${c.koordinator.id}/`}
                                    className="btn btn-success btn-sm"
                                  >
                                    İncele <i className="fas fa-arrow-right ms-2"></i>
                                  </Link>
                                ) : (
                                  <button className="btn btn-secondary btn-sm" disabled>
                                    Koordinatör Yok
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center p-4">
                              Kitap Tahlili bulunamadı.
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
    </>
  );
}

export default KitapTahlils;
