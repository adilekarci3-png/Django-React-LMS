import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/ESKEPBaseHeader";
import BaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function Odevs() {
  const [odevs, setOdevs] = useState([]);
  const [stats, setStats] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchData = () => {
    setFetching(true);

    // useAxios()
    //   .get(`instructor/odev-list/${UserData()?.user_id}/`)
    //   .then((res) => {
    //     console.log(res);
    //     setOdevs(res.data);
    //     setFetching(false);
    //   });
      useAxios()
      .get(`instructor/odev-list/1/`)
      .then((res) => {
        console.log(res);
        setOdevs(res.data);
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    console.log(query);
    if (query === "") {
      fetchData();
    } else {
      const filtered = odevs.filter((c) => {
        return c.odev.title.toLowerCase().includes(query);
      });
      setOdevs(filtered);
    }
  };
  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                {" "}
                <i className="fas fa-chalkboard-user"></i> Ödevlerım
              </h4>

              {fetching === true && <p className="mt-3 p-3">Yükleniyor...</p>}

              {fetching === false && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="mb-0">Ödevler</h3>
                    <span>
                    Panel sayfanızdan ödevleri inceleyebilirsiniz.
                    </span>
                  </div>
                  <div className="card-body">
                    <form className="row gx-3">
                      <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Ödevlerde Ara"
                          onChange={handleSearch}
                        />
                      </div>
                    </form>
                  </div>
                  <div className="table-responsive overflow-y-hidden">
                    <table className="table mb-0 text-nowrap table-hover table-centered text-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Ödevlar</th>
                          <th>Kayıt Tarihi</th>
                          <th>Dersler</th>
                          <th>Tamamlanmışmı</th>
                          <th>İşlem</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {odevs?.map((c, index) => (
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <div>
                                  <a href="#">
                                    <img
                                      src={c.odev.image}
                                      alt="Ödev"
                                      className="rounded img-4by3-lg"
                                      style={{
                                        width: "100px",
                                        height: "70px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </a>
                                </div>
                                <div className="ms-3">
                                  <h4 className="mb-1 h5">
                                    <a
                                      href="#"
                                      className="text-inherit text-decoration-none text-dark"
                                    >
                                      {c.odev.title}
                                    </a>
                                  </h4>
                                  <ul className="list-inline fs-6 mb-0">
                                    <li className="list-inline-item">
                                      <i className="fas fa-user"></i>
                                      <span className="ms-1">
                                        {c.odev.language}
                                      </span>
                                    </li>
                                    <li className="list-inline-item">
                                      <i className="bi bi-reception-4"></i>
                                      <span className="ms-1">
                                        {" "}
                                        {c.odev.level}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="mt-3">
                                {moment(c.date).format("D MMM, YYYY")}
                              </p>
                            </td>
                            <td>
                              <p className="mt-3">{c.lectures?.length}</p>
                            </td>
                            <td>
                              <p className="mt-3">
                                
                              </p>
                            </td>
                            <td>
                              {(
                                <Link
                                to={`/instructor/odevs/${c.enrollment_id}/`}
                                className="btn btn-success btn-sm mt-3"
                              >
                                Ödevi İncele
                                <i className="fas fa-arrow-right ms-2"></i>
                              </Link>
                              )}

                              {/* {(
                                 <Link
                                 to={`/instructor/odevs/${c.enrollment_id}/`}
                                 className="btn btn-primary btn-sm mt-3"
                               >
                                 Ödeva Devam Et
                                 <i className="fas fa-arrow-right ms-2"></i>
                               </Link>
                              )} */}
                            </td>
                          </tr>
                        ))}

                        {odevs?.length < 1 && (
                          <p className="mt-4 p-4">Ödev Bulunamadı</p>
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

      <BaseFooter />
    </>
  );
}

export default Odevs;
