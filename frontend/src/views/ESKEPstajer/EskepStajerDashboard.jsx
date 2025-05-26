import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function EskepStajerDashboard() {
  const [stats, setStats] = useState({});
  const [homeworks, setHomeworks] = useState([]);
  const [lessonReports, setLessonReports] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [fetching, setFetching] = useState(true);

  const userId = UserData()?.user_id;
  const api = useAxios();

  const fetchData = async () => {
    setFetching(true);
    try {
      const [summary, hw, reports, books, proj] = await Promise.all([
        api.get(`student/summary/${userId}/`),
        api.get(`eskepstajer/odev-list/${userId}/`),
        api.get(`eskepstajer/kitaptahlili-list/${userId}/`),
        api.get(`eskepstajer/derssonuraporu-list/${userId}/`),
        api.get(`eskepstajer/proje-list/${userId}/`)
      ]);
      setStats(summary.data[0]);
      setHomeworks(hw.data);
      console.log(hw.data);
      setLessonReports(reports.data);
      console.log(reports.data);
      setBookReviews(books.data);
      console.log(books.data);
      setProjects(proj.data);
      console.log(proj.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderList = (title, data, detailPath, labelKey = "title") => (
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
                <Link to={`${detailPath}/${item.id}`} className="btn btn-sm btn-primary">
                  Detay
                </Link>
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
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <div className="row mb-4">
                <h4 className="mb-0 mb-4">
                  <i className="bi bi-grid-fill"></i> Öğrenci Paneli
                </h4>

                {/* Sertifika, rapor, ödev vb. istatistik kutuları */}
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-success bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-medal display-6 text-success me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.achieved_certificates}</h5>
                      <p className="mb-0">Kazanılan Sertifikalar</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="bi bi-journal-check display-6 text-primary me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.lesson_reports_completed}</h5>
                      <p className="mb-0">Ders Sonu Raporları</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-info bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-tasks display-6 text-info me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.homework_count}</h5>
                      <p className="mb-0">Tamamlanan Ödev</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-secondary bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-book display-6 text-secondary me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.book_reviews}</h5>
                      <p className="mb-0">Kitap Tahlilleri</p>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-dark bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <i className="fas fa-project-diagram display-6 text-dark me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.projects}</h5>
                      <p className="mb-0">Projeler</p>
                    </div>
                  </div>
                </div>
              </div>

              {fetching ? (
                <p className="p-3">Yükleniyor...</p>
              ) : (
                <>
                  {renderList("Ödevler", homeworks, "/student/homework-detail")}
                  {renderList("Ders Sonu Raporları", lessonReports, "/student/lesson-report-detail")}
                  {renderList("Kitap Tahlilleri", bookReviews, "/student/book-review-detail")}
                  {renderList("Projeler", projects, "/student/project-detail")}
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

export default EskepStajerDashboard;
