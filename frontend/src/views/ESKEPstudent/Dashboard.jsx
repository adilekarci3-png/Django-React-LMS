import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function Dashboard() {
  // ❗️Hook'lar en üstte:
  const api = useAxios();                 // ⬅️ fetchData içinde DEĞİL
  const user = UserData();                // ⬅️ fetchData içinde DEĞİL
  const userId = user?.user_id;

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [fetching, setFetching] = useState(true);

  // Benim Çalışmalarım
  const [myWorks, setMyWorks] = useState(null); // null: yetki yok/gizle

  const fetchData = async () => {
    if (!userId) return; // kullanıcı henüz hazır değilse bekle
    setFetching(true);

    try {
      const [sumRes, courseRes, worksRes] = await Promise.allSettled([
        api.get(`student/summary/${userId}/`),
        api.get(`student/course-list/${userId}/`),
        api.get(`eskepstudent/dashboard/`),
      ]);
console.log(sumRes, courseRes, worksRes);
      if (sumRes.status === "fulfilled") {
        setStats(sumRes.value.data?.[0] || {});
      } else {
        console.error("summary error:", sumRes.reason);
        setStats({});
      }

      if (courseRes.status === "fulfilled") {
        setCourses(courseRes.value.data || []);
      } else {
        console.error("course-list error:", courseRes.reason);
        setCourses([]);
      }

      if (worksRes.status === "fulfilled") {
        setMyWorks(
          worksRes.value.data || {
            odevler: [],
            kitap_tahlilleri: [],
            ders_sonu_raporlari: [],
          }
        );
      } else {
        const status = worksRes?.reason?.response?.status;
        if (status === 403) {
          setMyWorks(null); // yetki yoksa kartı gizle
        } else {
          console.error("my-works error:", worksRes.reason);
          setMyWorks({
            odevler: [],
            kitap_tahlilleri: [],
            ders_sonu_raporlari: [],
          });
        }
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // userId değişirse yeniden çağır (login sonrası gibi)
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      // yeniden yükle (filtreyi sıfırla)
      fetchData();
    } else {
      const filtered = (courses || []).filter((c) =>
        c?.course?.title?.toLowerCase?.().includes(query)
      );
      setCourses(filtered);
    }
  };

  const WorkRow = ({ item }) => (
    <tr key={`${item.type}-${item.id}`}>
      <td>
        <div className="d-flex align-items-center">
          <div>
            <img
              src={item.image || "/no-image.png"}
              alt={item.title}
              className="rounded"
              style={{ width: "80px", height: "60px", objectFit: "cover" }}
            />
          </div>
          <div className="ms-3">
            <div className="fw-semibold">{item.title}</div>
            <div className="small text-muted">
              {item.language} • {item.level}
            </div>
          </div>
        </div>
      </td>
      <td className="text-nowrap">{moment(item.date).format("D MMM, YYYY")}</td>
      <td className="text-capitalize">{item.type}</td>
      <td className="text-nowrap">
        {item.odev_status ||
          item.kitaptahlili_status ||
          item.derssonuraporu_status}
      </td>
      <td>
        {item.type === "odev" && (
          <Link to={`/odev/${item.id}/`} className="btn btn-sm btn-outline-primary">
            Göster
          </Link>
        )}
        {item.type === "kitaptahlili" && (
          <Link
            to={`/kitap-tahlili/${item.id}/`}
            className="btn btn-sm btn-outline-primary"
          >
            Göster
          </Link>
        )}
        {item.type === "derssonuraporu" && (
          <Link
            to={`/ders-sonu-raporu/${item.id}/`}
            className="btn btn-sm btn-outline-primary"
          >
            Göster
          </Link>
        )}
      </td>
    </tr>
  );

  const mergedWorks =
    myWorks === null
      ? [] // gizli
      : [
          ...(myWorks?.odevler || []),
          ...(myWorks?.kitap_tahlilleri || []),
          ...(myWorks?.ders_sonu_raporlari || []),
        ];

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">
              <div className="row mb-4">
                <h4 className="mb-0 mb-4">
                  <i className="bi bi-grid-fill"></i> Öğrenci Paneli
                </h4>

                {/* Counter item */}
                <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-warning bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-orange mb-0">
                      <i className="fas fa-tv fa-fw" />
                    </span>
                    <div className="ms-4">
                      <div className="d-flex">
                        <h5 className="purecounter mb-0 fw-bold">
                          {stats?.total_courses ?? 0}
                        </h5>
                      </div>
                      <p className="mb-0 h6 fw-light">Tüm Kurslar</p>
                    </div>
                  </div>
                </div>

                {/* Counter item */}
                <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-danger bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-purple mb-0">
                      <i className="fas fa-clipboard-check fa-fw" />
                    </span>
                    <div className="ms-4">
                      <div className="d-flex">
                        <h5 className="purecounter mb-0 fw-bold">
                          {stats?.completed_lessons ?? 0}
                        </h5>
                      </div>
                      <p className="mb-0 h6 fw-light">Tamamlanmış Dersler</p>
                    </div>
                  </div>
                </div>

                {/* Counter item */}
                <div className="col-sm-6 col-lg-4 mb-3 mb-lg-0">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-success bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-success mb-0">
                      <i className="fas fa-medal fa-fw" />
                    </span>
                    <div className="ms-4">
                      <div className="d-flex">
                        <h5 className="purecounter mb-0 fw-bold">
                          {stats?.achieved_certificates ?? 0}
                        </h5>
                      </div>
                      <p className="mb-0 h6 fw-light">Kazanılmış Sertifika Sayısı</p>
                    </div>
                  </div>
                </div>
              </div>

              {fetching && <p className="mt-3 p-3">Yükleniyor...</p>}

              {!fetching && (
                <>
                  {/* Kurslar */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h3 className="mb-0">Kurslar</h3>
                      <span>Panel sayfanızdan videoları şimdi izlemeye başlayın</span>
                    </div>
                    <div className="card-body">
                      <form className="row gx-3">
                        <div className="col-lg-12 col-md-12 col-12 mb-lg-0 mb-2">
                          <input
                            type="search"
                            className="form-control"
                            placeholder="Kurslarında Ara"
                            onChange={handleSearch}
                          />
                        </div>
                      </form>
                    </div>
                    <div className="table-responsive overflow-y-hidden">
                      <table className="table mb-0 text-nowrap table-hover table-centered text-nowrap">
                        <thead className="table-light">
                          <tr>
                            <th>Kurslar</th>
                            <th>Kayıt Tarihi</th>
                            <th>Dersler</th>
                            <th>Tamamlanmış</th>
                            <th>Eylem</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {(courses || []).map((c, index) => (
                            <tr key={c?.enrollment_id || index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div>
                                    <img
                                      src={c?.course?.image}
                                      alt="course"
                                      className="rounded img-4by3-lg"
                                      style={{
                                        width: "100px",
                                        height: "70px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                  <div className="ms-3">
                                    <h4 className="mb-1 h5">
                                      <span className="text-inherit text-dark">
                                        {c?.course?.title}
                                      </span>
                                    </h4>
                                    <ul className="list-inline fs-6 mb-0">
                                      <li className="list-inline-item">
                                        <i className="fas fa-user"></i>
                                        <span className="ms-1">{c?.course?.language}</span>
                                      </li>
                                      <li className="list-inline-item">
                                        <i className="bi bi-reception-4"></i>
                                        <span className="ms-1">{c?.course?.level}</span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <p className="mt-3">{moment(c?.date).format("D MMM, YYYY")}</p>
                              </td>
                              <td>
                                <p className="mt-3">{c?.lectures?.length ?? 0}</p>
                              </td>
                              <td>
                                <p className="mt-3">{c?.completed_lesson?.length ?? 0}</p>
                              </td>
                              <td>
                                {(c?.completed_lesson?.length ?? 0) < 1 ? (
                                  <Link
                                    to={`/student/courses/${c?.enrollment_id}/`}
                                    className="btn btn-success btn-sm mt-3"
                                  >
                                    Kursa Başla <i className="fas fa-arrow-right ms-2"></i>
                                  </Link>
                                ) : (
                                  <Link
                                    to={`/student/courses/${c?.enrollment_id}/`}
                                    className="btn btn-primary btn-sm mt-3"
                                  >
                                    Kursa Devam Et <i className="fas fa-arrow-right ms-2"></i>
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))}

                          {(courses?.length ?? 0) < 1 && (
                            <tr>
                              <td colSpan={6} className="p-4">
                                Kurs Bulunamadı
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Benim Çalışmalarım — sadece yetkili ise */}
                  {myWorks !== null && (
                    <div className="card mb-4">
                      <div className="card-header">
                        <h3 className="mb-0">Benim Çalışmalarım</h3>
                        <span>Size ait Ödev, Kitap Tahlili ve Ders Sonu Raporları</span>
                      </div>

                      <div className="table-responsive">
                        <table className="table mb-0 table-hover table-centered text-nowrap">
                          <thead className="table-light">
                            <tr>
                              <th>Başlık</th>
                              <th>Tarih</th>
                              <th>Tür</th>
                              <th>Durum</th>
                              <th>Eylem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mergedWorks.map((item) => (
                              <WorkRow key={`${item.type}-${item.id}`} item={item} />
                            ))}
                            {mergedWorks.length < 1 && (
                              <tr>
                                <td colSpan={5} className="p-4">
                                  Kayıt bulunamadı.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />
    </>
  );
}

export default Dashboard;
