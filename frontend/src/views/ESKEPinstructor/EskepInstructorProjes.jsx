import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function EskepInstructorProjes() {
  const [projes, setProjes] = useState([]);
  const [fetching, setFetching] = useState(true);

  const api = useAxios();
  const userData = useUserData();

  const fetchData = (userId) => {
    if (!userId) return;

    setFetching(true);
    api
      .get(`eskepinstructor/proje-list/${userId}/`)
      .then((res) => {
        setProjes(res.data);
        console.log(res.data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  };

  useEffect(() => {
    if (userData?.user_id) {
      fetchData(userData.user_id);
    }
  }, [userData]);

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
              <h4 className="mb-4 d-flex align-items-center">
                <i className="fas fa-project-diagram text-info me-2"></i> Ders Sonu Projelerim
              </h4>

              {fetching ? (
                <p className="mt-3 p-3">Yükleniyor...</p>
              ) : (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Projeler</h3>
                    <span>Panel sayfanızdan projeleri inceleyebilirsiniz.</span>
                  </div>
                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Proje</th>
                          <th>Kayıt Tarihi</th>
                          <th>Ders Sayısı</th>
                          <th>Seviye</th>
                          <th>Koordinatör</th>
                          <th>Hazırlayan</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projes.length > 0 ? (
                          projes.map((c, index) => (
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
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <div className="ms-3">
                                    <h5 className="mb-1 text-dark">{c.title}</h5>
                                  </div>
                                </div>
                              </td>
                              <td>{moment(c.date).format("D MMM, YYYY")}</td>
                              <td>{c.lectures?.length || 0}</td>
                              <td>{c.level}</td>
                              <td>{c.koordinator?.full_name || "Bilinmiyor"}</td>
                              <td>{c.inserteduser?.full_name || "Bilinmiyor"}</td>
                              <td>
                                <Link
                                  to={`/eskepinstructor/projes/${c.id}/${c.koordinator?.id}/`}
                                  className="btn btn-outline-info btn-sm d-flex align-items-center gap-2"
                                  style={{ borderRadius: "20px" }}
                                >
                                  <i className="fas fa-eye"></i> İncele
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center p-4">
                              Proje bulunamadı.
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

export default EskepInstructorProjes;
