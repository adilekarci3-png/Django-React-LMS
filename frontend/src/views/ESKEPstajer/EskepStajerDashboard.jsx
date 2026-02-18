// ============================================================
// App.js — Eklenecek Route'lar
// ============================================================
//
// import EskepStajerDersSonuRaporuDetail from "./views/eskepstajer/EskepStajerDersSonuRaporuDetail";
// import EskepStajerOdevDetail from "./views/eskepstajer/EskepStajerOdevDetail";
// import EskepStajerKitapTahliliDetail from "./views/eskepstajer/EskepStajerKitapTahliliDetail";
// import EskepStajerProjeDetail from "./views/eskepstajer/EskepStajerProjeDetail";
//
// <Route path="/eskepstajer/derssonuraporus/:id/:koordinator_id/" element={<EskepStajerDersSonuRaporuDetail />} />
// <Route path="/eskepstajer/odevs/:id/:koordinator_id/"           element={<EskepStajerOdevDetail />} />
// <Route path="/eskepstajer/kitaptahlileris/:id/:koordinator_id/" element={<EskepStajerKitapTahliliDetail />} />
// <Route path="/eskepstajer/projes/:id/:koordinator_id/"          element={<EskepStajerProjeDetail />} />

// ============================================================
// EskepStajerDashboard.jsx — güncel hali
// ============================================================
// Dashboard'da her liste için iki parametre gerekiyor:
//   /:id/:koordinator_id
// Backend listeleri dönerken item içinde koordinator_id veya
// koordinator.id alanı olmalı. Yoksa backend'den eklenmesi lazım.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { FaTasks, FaBook, FaProjectDiagram, FaMedal } from "react-icons/fa";
import { BsJournalText } from "react-icons/bs";

function EskepStajerDashboard() {
  const [stats, setStats] = useState({});
  const [homeworks, setHomeworks] = useState([]);
  const [lessonReports, setLessonReports] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [fetching, setFetching] = useState(true);

  const userId = useUserData()?.user_id;
  const api = useAxios();

  const fetchData = async () => {
    setFetching(true);
    try {
      const [summary, hw, reports, books, proj] = await Promise.all([
        api.get(`student/summary/${userId}/`),
        api.get(`eskepstajer/odev-list/${userId}/`),
        api.get(`eskepstajer/derssonuraporu-list/${userId}/`),
        api.get(`eskepstajer/kitaptahlili-list/${userId}/`),
        api.get(`eskepstajer/proje-list/${userId}/`),
      ]);
      setStats(summary.data[0]);
      setHomeworks(hw.data);
      setLessonReports(reports.data);
      setBookReviews(books.data);
      setProjects(proj.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  // ── Yardımcı: koordinator_id'yi item'dan çıkar ──────────────
  // Backend hangi field adıyla dönüyorsa onu kullanın.
  // Olası field adları: koordinator_id | koordinator?.id | koordinator
  const getKoordinatorId = (item) =>
    item?.koordinator_id ?? item?.koordinator?.id ?? item?.koordinator ?? 0;

  // ── İki parametreli detay linki olan liste render ────────────
  const renderDetailList = (title, data, basePath, labelKey = "title") => (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {data.length > 0 ? (
          <ul className="list-group">
            {data.map((item, index) => (
              <li
                className="list-group-item d-flex justify-content-between align-items-center"
                key={index}
              >
                <span>{item[labelKey]}</span>
                <Link
                  to={`${basePath}/${item.id}/${getKoordinatorId(item)}`}
                  className="btn btn-sm btn-primary"
                >
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
      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4 align-items-start">
            <div className="col-lg-3 col-md-4 col-12 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-9 col-md-8 col-12">
              <div className="row mb-4">
                <h4 className="mb-0 mb-4">
                  <i className="bi bi-grid-fill"></i> Öğrenci Paneli
                </h4>

                {/* İstatistik kartları */}
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-success bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <FaMedal className="display-6 text-success me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.achieved_certificates}</h5>
                      <p className="mb-0">Kazanılan Sertifikalar</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <BsJournalText className="display-6 text-primary me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.lesson_reports_completed}</h5>
                      <p className="mb-0">Ders Sonu Raporları</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-info bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <FaTasks className="display-6 text-info me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.homework_count}</h5>
                      <p className="mb-0">Tamamlanan Ödev</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-secondary bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <FaBook className="display-6 text-secondary me-3" />
                    <div>
                      <h5 className="fw-bold mb-0">{stats.book_reviews}</h5>
                      <p className="mb-0">Kitap Tahlilleri</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4 mb-3">
                  <div className="bg-dark bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
                    <FaProjectDiagram className="display-6 text-dark me-3" />
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
                  {/* Her liste için iki parametreli path */}
                  {renderDetailList("Ödevler",             homeworks,     "/eskepstajer/odevs")}
                  {renderDetailList("Ders Sonu Raporları", lessonReports, "/eskepstajer/derssonuraporus")}
                  {renderDetailList("Kitap Tahlilleri",    bookReviews,   "/eskepstajer/kitaptahlileris")}
                  {renderDetailList("Projeler",            projects,      "/eskepstajer/projes")}
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