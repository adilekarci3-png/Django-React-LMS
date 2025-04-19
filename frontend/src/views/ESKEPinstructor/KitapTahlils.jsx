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
  const [fetching, setFetching] = useState(true);

  const fetchData = () => {
    setFetching(true);
    useAxios()
      .get(`eskepinstructor/kitaptahlili-list/${UserData()?.user_id}/`)
      .then((res) => {
        debugger;
        setKitapTahlils(res.data);
        setFetching(false);
        console.log(kitapTahlils);
      })
      .catch(() => setFetching(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

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

              {fetching ? (
                <p className="mt-3 p-3">Yükleniyor...</p>
              ) : (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Kitap Tahlilleri</h3>
                    <span>Panel sayfanızdan Kitap Tahlilleri inceleyebilirsiniz.</span>
                  </div>
                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Kitap Tahlili</th>
                          <th>Kayıt Tarihi</th>
                          <th>Ders Sayısı</th>
                          <th>Seviye</th>
                          <th>Koordinatör</th>
                          <th>Hazırlayan</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kitapTahlils.length > 0 ? (
                          kitapTahlils.map((c, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={c.image}
                                    alt={c.title}
                                    className="rounded img-4by3-lg"
                                    style={{
                                      width: "80px",
                                      height: "60px",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <div className="ms-3">
                                    <h5 className="mb-1">
                                      <span className="text-dark">
                                        {c.title}
                                      </span>
                                    </h5>
                                  </div>
                                </div>
                              </td>
                              <td>{moment(c.date).format("D MMM, YYYY")}</td>
                              <td>{c.lectures?.length || 0}</td>
                              <td>{c.level}</td>
                              <td>{c.koordinator?.full_name || "Bilinmiyor"}</td>
                              <td>{c.hazirlayan?.full_name || "Bilinmiyor"}</td>
                              <td>
                                <Link
                                  to={`/eskepinstructor/kitaptahlileris/${c.id}/${c.koordinator?.id}/`}
                                  className="btn btn-success btn-sm"
                                >
                                  Kitap Tahlilini İncele{" "}
                                  <i className="fas fa-arrow-right ms-2"></i>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center p-4">
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
