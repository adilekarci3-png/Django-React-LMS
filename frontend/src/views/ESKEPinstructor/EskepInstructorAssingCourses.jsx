import { useState, useEffect, useContext, useMemo } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import { ProfileContext } from "../plugin/Context";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import useUserData from "../plugin/useUserData";

function EskepInstructorAssingCourses() {
  const api = useAxios();
  const user = useUserData();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [categoryPages, setCategoryPages] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [profile, setProfile] = useContext(ProfileContext);

  const [searchTerm, setSearchTerm] = useState("");

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
    if (!user) return;

    setLoading(true);
    api
      .get(`eskepinstructor/course-list/${user?.user_id}/`)
      .then((res) => {
        const data = res.data || [];
        setAllCourses(data);

        const initialPages = {};
        data.forEach((course) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCategoryPageChange = (categoryName, newPage) => {
    setCategoryPages((prev) => ({ ...prev, [categoryName]: newPage }));
  };

  // Basit istatistikler
  const { totalCourses, freeCount, paidCount } = useMemo(() => {
    const total = allCourses.length;
    const free = allCourses.filter((c) => Number(c.price) === 0).length;
    const paid = total - free;
    return { totalCourses: total, freeCount: free, paidCount: paid };
  }, [allCourses]);

  const filterBySearch = (course) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const title = (course.title || "").toLowerCase();
    const shortInfo = (course.short_info || "").toLowerCase();
    const desc = (course.description || "").toLowerCase();

    return (
      title.includes(term) || shortInfo.includes(term) || desc.includes(term)
    );
  };

  const renderGroupedCourses = () => {
    const grouped = {};

    allCourses.forEach((course) => {
      const category = getCategoryTitle(course.category) || "Kategorisiz";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(course);
    });

    return Object.entries(grouped).map(([categoryName, courseList]) => {
      const filteredList = courseList.filter(filterBySearch);

      if (filteredList.length === 0) {
        return null;
      }

      const currentPage = categoryPages[categoryName] || 1;
      const totalPages = Math.ceil(filteredList.length / itemsPerPage);
      const paginated = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

      return (
        <div key={categoryName} className="mb-5">
          {/* Kategori başlığı */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="mb-1 fw-semibold">
                <span className="badge bg-light text-primary border me-2">
                  <i className="bi bi-folder2-open me-1"></i>
                  {categoryName}
                </span>
              </h5>
              <small className="text-muted">
                Bu kategoride{" "}
                <strong>{filteredList.length}</strong> kurs listeleniyor.
              </small>
            </div>
          </div>

          {/* Kartlar */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {paginated.map((course) => {
              const imageSrc =
                typeof course.image === "string"
                  ? course.image
                  : course.image?.url;

              const shortHtml = course.short_info
                ? course.short_info
                : course.description
                ? `${course.description.substring(0, 150)}...`
                : "Açıklama yok.";

              const isFree = Number(course.price) === 0;

              return (
                <div className="col" key={course.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden course-card">
                    {/* Üst görsel */}
                    <div className="position-relative">
                      <img
                        src={imageSrc || "/default-course-image.jpg"}
                        alt={course.title}
                        className="img-fluid w-100"
                        style={{
                          height: "190px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-course-image.jpg";
                        }}
                      />

                      <span
                        className={`badge position-absolute top-0 end-0 m-2 px-3 py-2 ${
                          isFree ? "bg-success" : "bg-danger"
                        }`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {isFree ? "Ücretsiz" : `${course.price} TL`}
                      </span>

                      {course.file && (
                        <span
                          className="badge bg-dark position-absolute bottom-0 start-0 m-2 d-flex align-items-center"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <i className="bi bi-play-circle me-1"></i> Video
                        </span>
                      )}
                    </div>

                    {/* İçerik */}
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title mb-1 text-primary fw-semibold">
                        {course.title}
                      </h6>

                      <p className="mb-2 small text-muted">
                        <span className="me-1 text-secondary">
                          <i className="bi bi-translate me-1"></i>
                          {course.language}
                        </span>
                        {" · "}
                        <span className="ms-1">
                          <i className="bi bi-bar-chart-line me-1"></i>
                          {course.level || "Seviye Yok"}
                        </span>
                      </p>

                      {course.category && (
                        <p className="mb-2">
                          <span className="badge bg-warning text-dark">
                            {getCategoryTitle(course.category)}
                          </span>
                        </p>
                      )}

                      <div
                        className="card-text small text-muted flex-grow-1"
                        style={{ minHeight: "60px" }}
                        dangerouslySetInnerHTML={{ __html: shortHtml }}
                      ></div>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          <i className="bi bi-people-fill me-1"></i>
                          {course.enrolled_students} öğrenci
                        </small>

                        <div className="d-flex gap-2">
                          {/* Katıl / Satın al butonlarını istersen açarsın */}
                          {/* <button
                            onClick={() => handleOpenModal(course)}
                            className={`btn btn-sm ${
                              isFree ? "btn-success" : "btn-outline-danger"
                            }`}
                          >
                            {isFree ? (
                              <>
                                <i className="bi bi-box-arrow-in-right me-1"></i>
                                Katıl
                              </>
                            ) : (
                              <>
                                <i className="bi bi-credit-card me-1"></i>
                                Satın Al
                              </>
                            )}
                          </button> */}

                          {course.file && (
                            <button
                              onClick={() => {
                                setSelectedVideo(course.file);
                                setShowVideoModal(true);
                              }}
                              className="btn btn-sm btn-outline-dark"
                            >
                              <i className="bi bi-play-circle me-1"></i> İzle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center mb-0">
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
                    className={`page-item ${
                      currentPage === i + 1 && "active"
                    }`}
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
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        {/* 🔹 SAYFAYI GENİŞLETTİĞİMİZ KISIM */}
        <div className="container-xl px-3">
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar tekrar eklendi */}
            <div className="col-12 col-lg-3 mb-4">
              <Sidebar />
            </div>

            {/* İçerik alanı – biraz daha geniş */}
            <div className="col-12 col-lg-9">
              <div className="card shadow-sm border-0 rounded-4 p-4 eskep-course-page">
                {/* Üst başlık & özet alanı */}
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
                  <div>
                    <h3 className="mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary border-0 rounded-pill px-3 py-2">
                        <i className="bi bi-grid-fill me-2"></i>
                        Eğitmen Kurslarım
                      </span>
                    </h3>
                    <p className="text-muted mb-0 small mt-2">
                      ESKEP üzerinde yayınladığınız tüm kurslarınızı bu
                      ekrandan görüntüleyebilir ve videolarını hızlıca
                      kontrol edebilirsiniz.
                    </p>
                  </div>

                  {/* Minik istatistik barı */}
                  <div className="d-flex flex-wrap gap-2">
                    <div className="border rounded-3 px-3 py-2 text-center">
                      <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        {totalCourses}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Toplam Kurs
                      </div>
                    </div>
                    <div className="border rounded-3 px-3 py-2 text-center">
                      <div
                        className="fw-semibold text-success"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {freeCount}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Ücretsiz
                      </div>
                    </div>
                    <div className="border rounded-3 px-3 py-2 text-center">
                      <div
                        className="fw-semibold text-danger"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {paidCount}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Ücretli
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arama alanı */}
                <div className="mb-4">
                  <div className="row g-2 align-items-center">
                    <div className="col-md-8">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Kurs başlığı veya açıklama içinde ara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <small className="text-muted">
                        {searchTerm
                          ? `"${searchTerm}" için sonuçlar gösteriliyor.`
                          : "Tüm kurslar listeleniyor."}
                      </small>
                    </div>
                  </div>
                </div>

                {/* İçerik */}
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                  </div>
                ) : allCourses.length === 0 ? (
                  <div className="alert alert-info text-center mb-0">
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

      {/* Katıl / Satın Al Modalı */}
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
            <div className="modal-content rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  {selectedCourse.price > 0 ? "Kursu Satın Al" : "Kursa Katıl"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              <div className="modal-body pt-0">
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

                <hr />
                <div className="d-flex align-items-center">
                  <img
                    src={user?.image || "/avatar.jpg"}
                    alt="Profil"
                    className="rounded-circle me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <strong>{user?.full_name || "Misafir Kullanıcı"}</strong>
                    <p className="mb-0 text-muted small">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
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

      {/* Video Modal */}
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
            <div className="modal-content rounded-4">
              <div className="modal-header border-0">
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
              <div className="modal-body pt-0">
                <video width="100%" controls autoPlay>
                  <source src={selectedVideo} type="video/mp4" />
                  Tarayıcınız video etiketini desteklemiyor.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}

      <ESKEPBaseFooter />
    </>
  );
}

export default EskepInstructorAssingCourses;
