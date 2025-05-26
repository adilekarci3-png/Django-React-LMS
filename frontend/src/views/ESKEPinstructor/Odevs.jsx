import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function Odevs() {
  const [odevs, setOdevs] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchData = () => {
    setFetching(true);
    useAxios()
      .get(`eskepinstructor/odev-list/${UserData()?.user_id}/`)
      .then((res) => {
        debugger;
        setOdevs(res.data);
        setFetching(false);
        console.log(odevs);
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
                <i className="fas fa-chalkboard-user"></i> Gönderilen Ödevler
              </h4>

              {fetching ? (
                <p className="mt-3 p-3">Yükleniyor...</p>
              ) : (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Ödevler</h3>
                    <span>Panel sayfanızdan ödevleri inceleyebilirsiniz.</span>
                  </div>
                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Ödev</th>
                          <th>Kayıt Tarihi</th>
                          <th>Ders Sayısı</th>
                          <th>Seviye</th>
                          <th>Koordinatör</th>
                          <th>Hazırlayan</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {odevs.length > 0 ? (
                          odevs.map((c, index) => (
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
                                  to={`/eskepinstructor/odevs/${c.id}/${c.koordinator?.id}/`}
                                  className="btn btn-success btn-sm"
                                >
                                  İncele{" "}
                                  <i className="fas fa-arrow-right ms-2"></i>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center p-4">
                              Ödev bulunamadı.
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

export default Odevs;
