import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function EskepInstructorDashboard() {
  const [stats, setStats] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lessonReports, setLessonReports] = useState([]);
  const [fetching, setFetching] = useState(true);

  const userId = UserData()?.user_id;
  const api = useAxios();

  const fetchData = async () => {
    setFetching(true);
    try {
      const [summary, hw, books, proj, reports] = await Promise.all([
        // api.get(`eskepinstructor/summary/${userId}/`),
        api.get(`eskepinstructor/odev-list/${userId}/`),
        api.get(`eskepinstructor/kitaptahlili-list/${userId}/`),
        api.get(`eskepinstructor/proje-list/${userId}/`),
        api.get(`eskepinstructor/derssonuraporu-list/${userId}/`)
      ]);
      debugger;
      // setStats(summary.data[0]);
      setHomeworks(hw.data);
      console.log(hw.data);
      setBookReviews(books.data);
      console.log(books.data);
      setProjects(proj.data);
      console.log(proj.data);
      setLessonReports(reports.data);
      console.log(reports.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderList = (title, data, labelKey = "title") => (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {data.length > 0 ? (
          <ul className="list-group">
            {data.map((item, index) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
                <span>{item[labelKey]}</span>
                <span className="badge bg-primary">{moment(item.date).format("DD MMM YYYY")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">Henüz içerik bulunamadı.</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <EskepBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <div className="row mb-4">
                <h4 className="mb-0 mb-4">
                  <i className="bi bi-grid-fill"></i> Koordinatör Paneli
                </h4>

                {/* İstatistik kutuları */}
                <div className="col-sm-6 col-lg-3 mb-3">
                  <div className="bg-warning bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-user-graduate display-6 text-warning me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.total_students}</h5>
                      <p className="mb-0">Tüm Öğrenciler</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3 mb-3">
                  <div className="bg-info bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-briefcase display-6 text-info me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.total_interns}</h5>
                      <p className="mb-0">Tüm Stajyerler</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3 mb-3">
                  <div className="bg-success bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-user-check display-6 text-success me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.total_graduates}</h5>
                      <p className="mb-0">Tüm Mezunlar</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3 mb-3">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-medal display-6 text-primary me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.total_certificates}</h5>
                      <p className="mb-0">Verdiği Sertifika</p>
                    </div>
                  </div>
                </div>
              </div>

              {fetching ? (
                <p className="p-3">İçerikler yükleniyor...</p>
              ) : (
                <>
                  {renderList("Gönderilen Ödevler", homeworks)}
                  {renderList("Kitap Tahlilleri", bookReviews)}
                  {renderList("Projeler", projects)}
                  {renderList("Ders Sonu Raporları", lessonReports)}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <EskepBaseFooter />
    </>
  );
}

export default EskepInstructorDashboard;
