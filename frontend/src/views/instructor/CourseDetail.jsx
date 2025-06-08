import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import moment from "moment";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

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
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!course) return <div className="text-center mt-5">Kurs bulunamadı</div>;

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container" ref={printRef}>
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-2 col-md-4 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-10 col-md-8">
              <div className="card shadow-sm p-4">
                <div className="d-flex justify-content-between">
                  <h3>{course.title}</h3>
                  <div>
                    <Link
                      to={`/instructor/edit-course/${course.course_id}`}
                      className="btn btn-primary me-2"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="btn btn-danger me-2"
                    >
                      Sil
                    </button>
                    <button onClick={handlePrint} className="btn btn-secondary">
                      PDF / Yazdır
                    </button>
                  </div>
                </div>
                <ul className="nav nav-tabs mt-4">
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
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "students" ? "active" : ""}`}
                      onClick={() => setActiveTab("students")}
                    >
                      Öğrenciler
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Yorumlar
                    </button>
                  </li>
                </ul>

                <div className="tab-content mt-6">
                  {activeTab === "overview" && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      {/* Görsel */}
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full max-h-64 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-4 rounded-lg">
                          <span className="text-gray-500">
                            Görsel bulunamadı
                          </span>
                        </div>
                      )}

                      {/* Video */}
                      {course.file ? (
                        <video
                          src={course.file}
                          controls
                          className="w-full rounded-lg mb-4"
                        >
                          Tarayıcınız video etiketini desteklemiyor.
                        </video>
                      ) : (
                        <div className="mb-4 text-sm text-gray-500">
                          Video bulunamadı
                        </div>
                      )}

                      {/* Açıklama */}
                      <p className="text-gray-700 text-base mb-4">
                        {course.description || "Açıklama bulunamadı."}
                      </p>

                      {/* Bilgiler */}
                      <ul className="space-y-2 text-sm text-gray-800">
                        <li>
                          <strong className="text-gray-600">Seviye:</strong>{" "}
                          {course.level || "Belirtilmemiş"}
                        </li>
                        <li>
                          <strong className="text-gray-600">Dil:</strong>{" "}
                          {course.language || "Belirtilmemiş"}
                        </li>
                        <li>
                          <strong className="text-gray-600">Fiyat:</strong>{" "}
                          {course.price ?? "Ücretsiz"} TL
                        </li>
                        <li>
                          <strong className="text-gray-600">
                            Oluşturulma:
                          </strong>{" "}
                          {course.date
                            ? moment(course.date).format("DD MMMM YYYY")
                            : "Tarih yok"}
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeTab === "lessons" && (
                    <div>
                      {course.variants?.map((v) => (
                        <div key={v.id} className="mb-3">
                          <h5>{v.variant_title}</h5>
                          <ul>
                            {v.items.map((item) => (
                              <li key={item.id}>
                                {item.title}{" "}
                                {item.preview && (
                                  <span className="badge bg-info ms-2">
                                    Önizleme
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "students" && (
                    <div>
                      {course.students?.length > 0 ? (
                        <ul>
                          {course.students.map((s) => (
                            <li key={s.id}>{s.full_name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">Hiç öğrenci yok.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div>
                      {course.reviews?.length > 0 ? (
                        course.reviews.map((r) => (
                          <div key={r.id} className="border rounded p-2 mb-2">
                            <p className="mb-1">
                              <strong>{r.user}</strong>
                            </p>
                            <p className="mb-1">Puan: {r.rating} / 5</p>
                            <p>{r.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Henüz yorum yapılmamış.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default CourseDetail;
