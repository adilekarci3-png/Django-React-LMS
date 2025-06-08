import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import moment from "moment";
import useAxios from "../../utils/useAxios";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Swal from "sweetalert2";

function CourseDetail() {
  const { course_id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const api = useAxios();
  const navigate = useNavigate();

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
      try {
        await api.delete(`course/course-delete/${course.id}/`);
        Swal.fire("Silindi", "Kurs başarıyla silindi.", "success");
        navigate("/instructor/courses");
      } catch (error) {
        Swal.fire("Hata", "Kurs silinemedi.", "error");
      }
    }
  };

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
        <div className="container">
          <div className="card shadow-sm p-4">
            {/* Başlık ve Butonlar */}
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h3>{course.title}</h3>
                <p className="text-muted">
                  Oluşturulma: {moment(course.date).format("DD MMMM YYYY")}
                </p>
              </div>
              <div>
                <Link
                  to={`/instructor/edit-course/${course.course_id}`}
                  className="btn btn-sm btn-primary me-2"
                >
                  Düzenle
                </Link>
                <button onClick={handleDelete} className="btn btn-sm btn-danger">
                  Sil
                </button>
              </div>
            </div>

            {/* Sekmeler */}
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
                  className={`nav-link ${activeTab === "students" ? "active" : ""}`}
                  onClick={() => setActiveTab("students")}
                >
                  Öğrenciler
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "lessons" ? "active" : ""}`}
                  onClick={() => setActiveTab("lessons")}
                >
                  Bölümler & Dersler
                </button>
              </li>
            </ul>

            <div className="tab-content mt-3">
              {activeTab === "overview" && (
                <div>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                  <p>{course.description}</p>
                  <ul className="list-unstyled">
                    <li><strong>Seviye:</strong> {course.level}</li>
                    <li><strong>Dil:</strong> {course.language}</li>
                    <li><strong>Fiyat:</strong> {course.price} TL</li>
                    <li><strong>Eğitmen:</strong> {course.teacher_name || "N/A"}</li>
                  </ul>
                </div>
              )}

              {activeTab === "students" && (
                <div>
                  <h5>Öğrenci Listesi</h5>
                  {course.students?.length > 0 ? (
                    <ul>
                      {course.students.map((s) => (
                        <li key={s.id}>{s.full_name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Henüz öğrenci eklenmemiş.</p>
                  )}
                </div>
              )}

              {activeTab === "lessons" && (
                <div>
                  <h5>Bölümler ve Dersler</h5>
                  {course.variants?.length > 0 ? (
                    course.variants.map((v) => (
                      <div key={v.id} className="mb-3">
                        <h6 className="fw-bold">{v.variant_title}</h6>
                        <ul>
                          {v.items.map((item) => (
                            <li key={item.id}>
                              {item.title} {item.preview && <span className="badge bg-info ms-2">Önizleme</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Ders eklenmemiş.</p>
                  )}
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

export default CourseDetail;
