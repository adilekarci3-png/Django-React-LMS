import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

function EskepInstructorDashboard() {
  const [stats, setStats] = useState({});
  const [homeworks, setHomeworks] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [lessonReports, setLessonReports] = useState([]);
  const [fetching, setFetching] = useState(true);

  const userId = useUserData()?.user_id;
  const api = useAxios();

  const fetchData = async () => {
    setFetching(true);
    try {
      const [hw, books, proj, reports] = await Promise.all([
        api.get(`eskepinstructor/odev-list/${userId}/`),
        api.get(`eskepinstructor/kitaptahlili-list/${userId}/`),
        api.get(`eskepinstructor/proje-list/${userId}/`),
        api.get(`eskepinstructor/derssonuraporu-list/${userId}/`),
      ]);
      setHomeworks(hw.data);
      setBookReviews(books.data);
      setProjects(proj.data);
      setLessonReports(reports.data);

      // Örnek stat verisi
      setStats({
        total_students: 25,
        total_interns: 10,
        total_graduates: 8,
        total_certificates: 12,
      });
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
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-header bg-light">
        <h6 className="mb-0">{title}</h6>
      </div>
      <div className="card-body">
        {data.length > 0 ? (
          <ul className="list-group list-group-flush">
            {data.map((item, index) => (
              <li
                className="list-group-item d-flex justify-content-between align-items-center"
                key={index}
              >
                <div>
                  <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                  {item[labelKey]}
                </div>
                <span className="badge bg-secondary rounded-pill">
                  {moment(item.date).format("DD MMM YYYY")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small fst-italic mb-0">
            Henüz içerik bulunamadı.
          </p>
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
          <div className="row mt-0 mt-md-2">
            <div className="col-lg-2 col-md-3 col-12">
              <Sidebar />
            </div>
            <div className="col-lg-10 col-md-9 col-12">
              <h4 className="mb-4 d-flex align-items-center">
                <i className="bi bi-speedometer2 me-2 text-primary"></i>
                Koordinatör Paneli
              </h4>

              {/* İstatistik Kartları */}
              <div className="row g-4 mb-4">
                {[
                  {
                    icon: "fa-user-graduate",
                    color: "warning",
                    value: stats.total_students,
                    label: "Tüm Öğrenciler",
                  },
                  {
                    icon: "fa-briefcase",
                    color: "info",
                    value: stats.total_interns,
                    label: "Tüm Stajyerler",
                  },
                  {
                    icon: "fa-user-check",
                    color: "success",
                    value: stats.total_graduates,
                    label: "Tüm Mezunlar",
                  },
                  {
                    icon: "fa-medal",
                    color: "primary",
                    value: stats.total_certificates,
                    label: "Verdiği Sertifika",
                  },
                ].map(({ icon, color, value, label }, idx) => (
                  <div className="col-sm-6 col-lg-3" key={idx}>
                    <div
                      className={`border-start border-4 border-${color} p-4 shadow-sm rounded bg-white`}
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className={`fas ${icon} fa-2x text-${color} me-3`}
                        ></i>
                        <div>
                          <h5 className="fw-bold mb-0">{value ?? 0}</h5>
                          <small className="text-muted">{label}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* İçerikler */}
              {fetching ? (
                <div className="text-center p-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  ></div>
                  <p>İçerikler yükleniyor...</p>
                </div>
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
