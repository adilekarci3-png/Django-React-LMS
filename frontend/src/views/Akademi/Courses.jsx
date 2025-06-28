import { useState, useEffect,useContext } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import { ProfileContext } from "../plugin/Context";

function Courses() {
  const api = useAxios();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [categoryPages, setCategoryPages] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [profile, setProfile] = useContext(ProfileContext);
  const itemsPerPage = 3;

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setShowJoinModal(true);
  };

  const handleCloseModal = () => {
    setShowJoinModal(false);
    setSelectedCourse(null);
  };

  const handleJoin = () => {
    console.log("Kursa katıl:", selectedCourse.slug);
    handleCloseModal();
  };

  const handlePurchase = () => {
    console.log("Satın alınan kurs ID:", selectedCourse.id);
    handleCloseModal();
  };

  const getCategoryTitle = (category) =>
    typeof category === "object" ? category?.title : category;

  const fetchCourseData = () => {
    setLoading(true);
    api
      .get(`course/course-list/`)
      .then((res) => {
        setAllCourses(res.data);
        const initialPages = {};
        res.data.forEach((course) => {
          const cat = getCategoryTitle(course.category) || "Kategorisiz";
          if (!initialPages[cat]) initialPages[cat] = 1;
        });
        setCategoryPages(initialPages);
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

  const handleCategoryPageChange = (categoryName, newPage) => {
    setCategoryPages((prev) => ({ ...prev, [categoryName]: newPage }));
  };

  const renderGroupedCourses = () => {
    const grouped = {};

    allCourses.forEach((course) => {
      const category = getCategoryTitle(course.category) || "Kategorisiz";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(course);
    });

    return Object.entries(grouped).map(([categoryName, courseList]) => {
      const currentPage = categoryPages[categoryName] || 1;
      const totalPages = Math.ceil(courseList.length / itemsPerPage);
      const paginated = courseList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

      return (
        <div key={categoryName} className="mb-5">
          <h5 className="text-primary mb-3">
            <i className="bi bi-folder2-open me-1"></i> {categoryName}
          </h5>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {paginated.map((course) => (
              <div className="col" key={course.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div
                    className="row g-0 flex-column flex-md-row"
                    style={{ minHeight: "200px" }}
                  >
                    {/* Görsel */}
                    <div className="col-md-4">
                      <img
                        src={
                          typeof course.image === "string"
                            ? course.image
                            : course.image?.url
                        }
                        alt={course.title}
                        className="img-fluid w-100 h-100 rounded-start"
                        style={{
                          objectFit: "cover",
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-course-image.jpg";
                        }}
                      />
                    </div>

                    {/* İçerik */}
                    <div className="col-md-8">
                      <div className="card-body d-flex flex-column h-100">
                        <h5 className="card-title text-primary">
                          {course.title}
                        </h5>
                        <div
                          className="card-text small text-muted mb-2"
                          dangerouslySetInnerHTML={{
                            __html:
                              course.short_info ||
                              course.description?.substring(0, 150) + "..." ||
                              "Açıklama yok.",
                          }}
                        ></div>
                        <div className="mb-2 d-flex flex-wrap gap-2">
                          <span className="badge bg-info">{course.level}</span>
                          <span className="badge bg-secondary">
                            {course.language}
                          </span>
                          {course.category && (
                            <span className="badge bg-warning text-dark">
                              {getCategoryTitle(course.category)}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {course.enrolled_students} öğrenci
                          </small>
                          <span
                            className={`fw-bold ${
                              course.price > 0 ? "text-danger" : "text-success"
                            }`}
                          >
                            {course.price > 0
                              ? `${course.price} TL`
                              : "Ücretsiz"}
                          </span>
                        </div>

                        <div className="d-flex gap-2 mt-3 flex-wrap">
                          {course.price > 0 ? (
                            <button
                              onClick={() => handleOpenModal(course)}
                              className="btn btn-danger btn-sm"
                            >
                              <i className="bi bi-credit-card me-1"></i> Satın
                              Al
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(course)}
                              className="btn btn-success btn-sm"
                            >
                              <i className="bi bi-box-arrow-in-right me-1"></i>{" "}
                              Katıl
                            </button>
                          )}

                          {course.file && (
                            <button
                              onClick={() => {
                                setSelectedVideo(course.file);
                                setShowVideoModal(true);
                              }}
                              className="btn btn-outline-dark btn-sm"
                            >
                              <i className="bi bi-play-circle me-1"></i> İzle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                  <button
                    className="page-link"
                    onClick={() =>
                      handleCategoryPageChange(categoryName, currentPage - 1)
                    }
                  >
                    Önceki
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 && "active"}`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handleCategoryPageChange(categoryName, i + 1)
                      }
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages && "disabled"
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      handleCategoryPageChange(categoryName, currentPage + 1)
                    }
                  >
                    Sonraki
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      );
    });
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
                  <i className="bi bi-grid-fill"></i> Kurslar
                </h4>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                  </div>
                ) : allCourses.length === 0 ? (
                  <div className="alert alert-info text-center">
                    Henüz kurs eklenmemiş.
                  </div>
                ) : (
                  renderGroupedCourses()
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showJoinModal && selectedCourse && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedCourse.price > 0 ? "Kursu Satın Al" : "Kursa Katıl"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              <div className="modal-body">
                {/* Kurs Detayı */}
                <div className="row">
                  <div className="col-md-4">
                    <img
                      src={
                        typeof selectedCourse.image === "string"
                          ? selectedCourse.image
                          : selectedCourse.image?.url
                      }
                      alt={selectedCourse.title}
                      className="img-fluid rounded mb-3"
                      style={{
                        objectFit: "cover",
                        height: "180px",
                        width: "100%",
                      }}
                      onError={(e) =>
                        (e.target.src = "/default-course-image.jpg")
                      }
                    />
                  </div>
                  <div className="col-md-8">
                    <h5 className="text-primary">{selectedCourse.title}</h5>
                    <p className="text-muted small mb-2">
                      {selectedCourse.short_info}
                    </p>
                    <p>
                      <span className="badge bg-info me-2">
                        {selectedCourse.level}
                      </span>
                      <span className="badge bg-secondary me-2">
                        {selectedCourse.language}
                      </span>
                      <span className="badge bg-warning text-dark">
                        {selectedCourse?.category?.title || "Kategorisiz"}
                      </span>
                    </p>
                    <p className="mt-2 mb-1">
                      <strong>Öğrenci Sayısı:</strong>{" "}
                      {selectedCourse.enrolled_students}
                    </p>
                    <p className="mb-0">
                      <strong>Fiyat:</strong>{" "}
                      {selectedCourse.price > 0
                        ? `${selectedCourse.price} TL`
                        : "Ücretsiz"}
                    </p>
                  </div>
                </div>

                {/* Kullanıcı Profili */}
                <hr />
                <div className="d-flex align-items-center">
                  <img
                    src={profile.image || "/avatar.jpg"}
                    alt="Profil"
                    className="rounded-circle me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <strong>
                      {profile.full_name || "Misafir Kullanıcı"}
                    </strong>
                    <p className="mb-0 text-muted small">{profile.email}</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Vazgeç
                </button>
                {selectedCourse.price > 0 ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      alert(
                        `Satın alma işlemi başarıyla tamamlandı: ${selectedCourse.title}`
                      );
                      handleCloseModal();
                    }}
                  >
                    Satın Al
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      alert(
                        `Kursa başarıyla katıldınız: ${selectedCourse.title}`
                      );
                      handleCloseModal();
                    }}
                  >
                    Katıl
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎬 Video Modal */}
      {showVideoModal && selectedVideo && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ders Videosu</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedVideo(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <video width="100%" controls autoPlay>
                  <source src={selectedVideo} type="video/mp4" />
                  Tarayıcınız video etiketini desteklemiyor.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}

      <AkademiBaseFooter />
    </>
  );
}

export default Courses;
