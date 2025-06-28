import { useState, useEffect } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";

function Courses() {
  const api = useAxios();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCourseData = () => {
    setLoading(true);
    api
      .get(`teacher/course-lists/${UserData()?.user_id}/`)
      .then((res) => {
        console.log(res.data);
        setCourses(res.data);
        setAllCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Kurs verisi alınamadı", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      setCourses(allCourses);
    } else {
      const filtered = allCourses.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
      setCourses(filtered);
      setCurrentPage(1);
    }
  };

  const handleFilter = (key, value) => {
    if (value === "") return setCourses(allCourses);
    const filtered = allCourses.filter((c) => c[key] === value);
    setCourses(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kurs silinecek!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`course/course-delete/${id}/`);
        Swal.fire("Silindi!", "Kurs başarıyla silindi.", "success");
        fetchCourseData();
      } catch (err) {
        console.error(err);
        Swal.fire("Hata!", "Kurs silinemedi.", "error");
      }
    }
  };

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-2 col-md-4 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-10 col-md-8">
              <div className="card shadow-sm p-4">
                <h4 className="mb-4">
                  <i className="bi bi-grid-fill"></i> Kurslarım
                </h4>

                {/* Filtre ve Arama */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <input
                    type="search"
                    className="form-control w-auto"
                    placeholder="Kurs adında ara..."
                    onChange={handleSearch}
                  />
                  <select
                    className="form-select w-auto"
                    onChange={(e) => handleFilter("level", e.target.value)}
                  >
                    <option value="">Seviye</option>
                    <option value="Başlangic">Başlangıç</option>
                    <option value="Orta">Orta</option>
                    <option value="Ileri Seviye">İleri Seviye</option>
                  </select>
                  <select
                    className="form-select w-auto"
                    onChange={(e) => handleFilter("language", e.target.value)}
                  >
                    <option value="">Dil</option>
                    <option value="Turkce">Türkçe</option>
                    <option value="Ingilizce">İngilizce</option>
                    <option value="Arapca">Arapça</option>
                  </select>
                </div>

                {/* İçerik */}
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover text-nowrap align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Kurs</th>
                            <th>Öğrenci</th>
                            <th>Seviye</th>
                            <th>Durum</th>
                            <th>Oluşturulma</th>
                            <th>İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedCourses.map((course) => (
                            <tr key={course.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={course.image}
                                    alt="course"
                                    className="rounded"
                                    style={{
                                      width: "100px",
                                      height: "70px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <div className="ms-3">
                                    <h6 className="mb-1">{course.title}</h6>
                                    <small className="text-muted">
                                      {course.language} – {course.level}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{course.students?.length || 0}</td>
                              <td>
                                <span className="badge bg-success">
                                  {course.level}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-warning text-dark">
                                  Yayınlandı
                                </span>
                              </td>
                              <td>{moment(course.date).format("DD MMM, YYYY")}</td>
                              <td>
                                <Link
                                  to={`/instructor/edit-course/${course.course_id}`}
                                  className="btn btn-sm btn-primary me-1"
                                  title="Düzenle"
                                >
                                  <i className="fas fa-edit"></i>
                                </Link>
                                <Link
                                  to={`/instructor/course-detay/${course.id}`}
                                  className="btn btn-sm btn-primary me-1"
                                  title="Kurs Detayları"
                                >
                                  <i className="fas fa-info"></i>
                                </Link>
                                <button
                                  className="btn btn-sm btn-danger me-1"
                                  onClick={() => handleDelete(course.id)}
                                  title="Sil"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                                <button className="btn btn-sm btn-secondary" title="Görüntüle">
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {paginatedCourses.length === 0 && (
                            <tr>
                              <td colSpan="6" className="text-center text-muted">
                                Kurs bulunamadı.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Sayfalama */}
                    <div className="mt-3 text-center">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`btn btn-sm me-1 ${
                            currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
                          }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}

export default Courses;
