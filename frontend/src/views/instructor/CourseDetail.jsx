import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import moment from "moment";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import { BASE_URL } from "../../utils/constants";

function CourseDetail() {
  const { course_id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const api = useAxios();
  const navigate = useNavigate();
  const printRef = useRef();

  useEffect(() => {
    api
      .get(`course/course-detay/${course_id}/`)
      .then((res) => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Detay verisi alınamadı:", err);
        setLoading(false);
      });
  }, [course_id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Silmek istediğinize emin misiniz?",
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });
    if (result.isConfirmed) {
      await api.delete(`course/course-delete/${course_id}/`);
      Swal.fire("Silindi", "Kurs başarıyla silindi.", "success");
      navigate("/instructor/courses");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!course) return <div className="text-center mt-5">Kurs bulunamadı</div>;

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container" ref={printRef}>
          <Header />
          <div className="row">
            <div className="col-lg-3 col-md-4 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-9 col-md-8">
              <div className="card shadow rounded-3 mb-4">
                <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center gap-3">
                    {course.image && (
                      <img
                        src={`${BASE_URL}${course.image}`}
                        alt={course.title}
                        className="rounded border"
                        style={{ width: 48, height: 48, objectFit: "cover" }}
                      />
                    )}
                    <div>
                      <h4 className="mb-0 fw-semibold">{course.title}</h4>
                      <small className="text-muted">
                        {moment(course.date).format("DD MMMM YYYY")}
                      </small>
                      <div className="mt-2 text-muted small">
                        <div><strong>Seviye:</strong> {course.level}</div>
                        <div><strong>Dil:</strong> {course.language}</div>
                        <div><strong>Fiyat:</strong> {course.price ?? "Ücretsiz"} TL</div>
                      </div>
                    </div>
                  </div>
                  <div className="btn-group">
                    <Link to={`/instructor/edit-course/${course.course_id}`} className="btn btn-sm btn-primary">
                      Düzenle
                    </Link>
                    <button onClick={handleDelete} className="btn btn-sm btn-danger">
                      Sil
                    </button>
                    <button onClick={handlePrint} className="btn btn-sm btn-secondary">
                      PDF / Yazdır
                    </button>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-lg-4">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-warning bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-orange mb-0">
                      <i className="fas fa-heart fa-fw text-warning" />
                    </span>
                    <div className="ms-4">
                      <h5 className="mb-0 fw-bold">{course.likes ?? 0}</h5>
                      <p className="mb-0 h6 fw-light">Beğeni</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-primary bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-primary mb-0">
                      <i className="fas fa-comments fa-fw text-primary" />
                    </span>
                    <div className="ms-4">
                      <h5 className="mb-0 fw-bold">{course.comment_count ?? 0}</h5>
                      <p className="mb-0 h6 fw-light">Yorum</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                  <div className="d-flex justify-content-center align-items-center p-4 bg-success bg-opacity-10 rounded-3">
                    <span className="display-6 lh-1 text-success mb-0">
                      <i className="fas fa-users fa-fw text-success" />
                    </span>
                    <div className="ms-4">
                      <h5 className="mb-0 fw-bold">{course.total_students ?? 0}</h5>
                      <p className="mb-0 h6 fw-light">Kayıtlı Öğrenci</p>
                    </div>
                  </div>
                </div>
              </div>

              {course.description && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Açıklama</h5>
                    <div className="card-text text-muted" dangerouslySetInnerHTML={{ __html: course.description }} />
                  </div>
                </div>
              )}

              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Genel Bilgi
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "lessons" ? "active" : ""}`}
                    onClick={() => setActiveTab("lessons")}
                  >
                    Ders İçeriği
                  </button>
                </li>
              </ul>

              {activeTab === "overview" && (
                <div className="row">
                  {course.curriculum?.map((variant) =>
                    variant.variant_items?.map((item) => (
                      <div key={item.id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
                        <div className="card h-100 shadow-sm border-0">
                          <video
                            src={`${BASE_URL}${item.file}`}
                            controls
                            onContextMenu={(e) => e.preventDefault()}
                            className="card-img-top"
                            style={{ height: "140px", objectFit: "cover" }}
                          />
                          <div className="card-body d-flex flex-column p-3">
                            <h6 className="card-title mb-1 text-truncate text-primary-emphasis">{variant.title}</h6>
                            <p className="card-text small text-muted mb-1">{item.description}</p>
                            <p className="card-text small text-muted mb-2">
                              Süre: {item.content_duration || "Bilinmiyor"}
                            </p>
                            <div className="mt-auto d-flex justify-content-between align-items-center">
                              {course.teacher && (
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={`${BASE_URL}${course.teacher.image}`}
                                    alt={course.teacher.full_name}
                                    className="rounded-circle border"
                                    style={{ width: 24, height: 24, objectFit: "cover" }}
                                  />
                                  <span className="small text-muted">
                                    {course.teacher.full_name}
                                  </span>
                                </div>
                              )}
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => navigate(`/course/${course.slug}/curriculum/${item.variant_item_id}`)}
                              >
                                Derse Git
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}

export default CourseDetail;
