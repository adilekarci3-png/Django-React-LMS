import { useState, useEffect, useContext, useMemo } from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import useAxios from "../../utils/useAxios";
import { ProfileContext } from "../plugin/Context";
import DashboardLayout from "../layouts/DashboardLayout";

/**
 * Courses (Modern Tasarım)
 * - Üst araç çubuğu: arama, kategori/level/language filtreleri, sıralama ve görünüm seçici
 * - Grup başlığı altında grid/list görünümü
 * - Gelişmiş kart: image overlay, rozetler, fiyat bandı, aksiyonlar
 * - Skeleton loader
 * - Daha iyi modal görselliği
 */

function Courses() {
  const api = useAxios();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [categoryPages, setCategoryPages] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [profile] = useContext(ProfileContext) || [{}];

  // Yeni: Filtre/Sıralama/Görünüm durumları
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Hepsi");
  const [levelFilter, setLevelFilter] = useState("Hepsi");
  const [languageFilter, setLanguageFilter] = useState("Hepsi");
  const [sortKey, setSortKey] = useState("popularity"); // popularity | price-asc | price-desc | newest | title
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  const itemsPerPage = 6; // grid için artırıldı

  const handleOpenModal = (course) => { setSelectedCourse(course); setShowJoinModal(true); };
  const handleCloseModal = () => { setShowJoinModal(false); setSelectedCourse(null); };

  // Kursa katılma isteği atan fonksiyon
const handleEnroll = async () => {
  // profile.id kontrolü (Context'ten geliyor)
  if (!profile?.id) {
    alert("Lütfen önce giriş yapınız.");
    return;
  }

  const payload = { id: profile.id, course_id: selectedCourse.id };
  // Fiyatı sayıya çevirerek karşılaştır
  const isFree = parseFloat(selectedCourse.price) === 0;

  try {
    const endpoint = isFree ? "student/enroll-course/" : "student/create-donation/";
    const res = await api.post(endpoint, payload);
    
    alert(res.data.message);
    
    handleCloseModal();
    fetchCourseData(); // Sayfadaki öğrenci sayısını güncelle
  } catch (error) {
    console.error("Enrollment error:", error);
    alert(error.response?.data?.message || "İşlem sırasında bir hata oluştu.");
  }
};

  const getCategoryTitle = (category) => (typeof category === "object" ? category?.title : category);

  const fetchCourseData = () => {
    setLoading(true);
    api.get(`course/course-list/`)
      .then((res) => {
        setAllCourses(res.data || []);
        const initialPages = {};
        (res.data || []).forEach((c) => {
          const cat = getCategoryTitle(c.category) || "Kategorisiz";
          if (!initialPages[cat]) initialPages[cat] = 1;
        });
        setCategoryPages(initialPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourseData(); /* eslint-disable-next-line */ }, []);

  const handleCategoryPageChange = (categoryName, newPage) => {
    setCategoryPages((prev) => ({ ...prev, [categoryName]: newPage }));
  };

  const getOrigin = (baseURL) => {
    try {
      const u = new URL(baseURL);
      return `${u.protocol}//${u.host}`;
    } catch {
      return window.location.origin;
    }
  };

  const joinUrl = (left = "", right = "") => {
    const l = String(left).replace(/\/+$/, "");
    const r = String(right).replace(/^\/+/, "");
    return `${l}/${r}`;
  };

  const buildMediaUrl = (api, imgLike) => {
    const FALLBACK = "/default-course-image.jpg";
    if (!imgLike) return FALLBACK;
    const raw = typeof imgLike === "string" ? imgLike : imgLike.url || imgLike.path || imgLike.src || "";
    if (!raw) return FALLBACK;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^\/?media\//i.test(raw)) {
      const origin = getOrigin(api?.defaults?.baseURL || "");
      const right = raw.replace(/^\/?/, "");
      return joinUrl(origin, `/${right}`);
    }
    const origin = getOrigin(api?.defaults?.baseURL || "");
    return joinUrl(origin, `/media/${raw.replace(/^\/+/, "")}`);
  };

  // ---------- Filtrelenmiş + Sıralanmış veri ----------
  const uniqueValues = useMemo(() => {
    const cats = new Set(["Hepsi"]);
    const lvls = new Set(["Hepsi"]);
    const langs = new Set(["Hepsi"]);
    allCourses.forEach((c) => {
      cats.add(getCategoryTitle(c.category) || "Kategorisiz");
      if (c.level) lvls.add(c.level);
      if (c.language) langs.add(c.language);
    });
    return {
      categories: Array.from(cats),
      levels: Array.from(lvls),
      languages: Array.from(langs),
    };
  }, [allCourses]);

  const filteredSorted = useMemo(() => {
    let list = [...allCourses];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.short_info || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter !== "Hepsi") {
      list = list.filter((c) => (getCategoryTitle(c.category) || "Kategorisiz") === categoryFilter);
    }

    // Level
    if (levelFilter !== "Hepsi") {
      list = list.filter((c) => (c.level || "") === levelFilter);
    }

    // Language
    if (languageFilter !== "Hepsi") {
      list = list.filter((c) => (c.language || "") === languageFilter);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortKey) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "title":
          return String(a.title || "").localeCompare(String(b.title || ""));
        case "popularity":
        default:
          return (b.students.length || 0) - (a.students.length || 0);
      }
    });

    return list;
  }, [allCourses, searchQuery, categoryFilter, levelFilter, languageFilter, sortKey]);

  // ---------- Gruplama ----------
  const groupedByCategory = useMemo(() => {
    const grouped = {};
    filteredSorted.forEach((course) => {
      const category = getCategoryTitle(course.category) || "Kategorisiz";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(course);
    });
    return grouped;
  }, [filteredSorted]);

  // ---------- Kart bileşeni ----------
  const CourseCard = ({ course }) => (
    <div className={`card h-100 border-0 shadow-sm course-card ${viewMode === "list" ? "course-card--list" : ""}`}>
      <div className={`position-relative ${viewMode === "list" ? "row g-0 flex-md-row" : ""}`}>
        <div className={viewMode === "list" ? "col-md-4" : ""}>
          <div className="ratio ratio-16x9">
            <img
              src={buildMediaUrl(api, course.image)}
              alt={course.title}
              className="w-100 h-100 object-fit-cover rounded-top"
              onError={(e) => { e.currentTarget.src = "/default-course-image.jpg"; }}
              style={{ borderTopLeftRadius: ".75rem", borderTopRightRadius: viewMode === "list" ? 0 : ".75rem" }}
            />
            <div className="card-img-overlay d-flex flex-column justify-content-between p-2" style={{ pointerEvents: "none" }}>
              <div className="d-flex gap-1 flex-wrap">
                {course.level && <span className="badge bg-light text-dark fw-semibold small">{course.level}</span>}
                {course.language && <span className="badge bg-dark small">{course.language}</span>}
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <span className={`badge fw-bold ${course.price > 0 ? "bg-danger" : "bg-success"}`}>
                  {course.price > 0 ? `${course.price} TL` : "Ücretsiz"}
                </span>
                {course.category && (
                  <span className="badge bg-warning text-dark small">{getCategoryTitle(course.category)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={viewMode === "list" ? "col-md-8" : ""}>
          <div className="card-body d-flex flex-column gap-2">
            <h5 className="card-title mb-1 text-truncate" title={course.title}>
              <i className="bi bi-mortarboard-fill me-2 text-primary"></i>{course.title}
            </h5>
            <div
              className="card-text text-muted small line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: course.short_info || (course.description ? `${course.description.substring(0, 180)}...` : "Açıklama yok."),
              }}
            />
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <small className="text-muted">
                <i className="bi bi-people-fill me-1"></i>{course.students.length || 0} öğrenci
              </small>
              <div className="d-flex gap-2 flex-wrap">
                {course.price > 0 ? (
                  <button onClick={() => handleOpenModal(course)} className="btn btn-danger btn-sm">
                    <i className="bi bi-credit-card me-1"></i> Bağış Yap
                  </button>
                ) : (
                  <button onClick={() => handleOpenModal(course)} className="btn btn-success btn-sm">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Katıl
                  </button>
                )}
                {course.file && (
                  <button
                    onClick={() => { setSelectedVideo(course.file); setShowVideoModal(true); }}
                    className="btn btn-outline-secondary btn-sm"
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
  );

  // ---------- Grup render ----------
  const renderGroupedCourses = () => {
    return Object.entries(groupedByCategory).map(([categoryName, courseList]) => {
      const currentPage = categoryPages[categoryName] || 1;
      const totalPages = Math.ceil(courseList.length / itemsPerPage) || 1;
      const paginated = courseList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

      return (
        <section key={categoryName} className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="m-0 d-flex align-items-center gap-2">
              <i className="bi bi-folder2-open text-primary"></i>
              <span>{categoryName}</span>
              <span className="badge text-bg-secondary">{courseList.length}</span>
            </h5>
          </div>

          {viewMode === "grid" ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
              {paginated.map((course) => (
                <div className="col" key={course.id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="vstack gap-3">
              {paginated.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handleCategoryPageChange(categoryName, currentPage - 1)}>
                    Önceki
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handleCategoryPageChange(categoryName, i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handleCategoryPageChange(categoryName, currentPage + 1)}>
                    Sonraki
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </section>
      );
    });
  };

  // ---------- Skeleton ----------
  const Skeleton = () => (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="col" key={i}>
          <div className="card border-0 shadow-sm">
            <div className="ratio ratio-16x9 bg-light placeholder-glow">
              <span className="placeholder col-12 h-100"></span>
            </div>
            <div className="card-body">
              <h5 className="card-title placeholder-glow"><span className="placeholder col-8"></span></h5>
              <p className="card-text placeholder-glow"><span className="placeholder col-12"></span><span className="placeholder col-10"></span></p>
              <div className="d-flex justify-content-between">
                <span className="placeholder col-3"></span>
                <span className="placeholder col-2"></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const totalCount = filteredSorted.length;

  return (
    <>
      <AkademiBaseHeader />

      <DashboardLayout
        title={<><i className="bi bi-grid-fill me-2"></i>Kurslar</>}
        right={<span className="badge text-bg-secondary">{totalCount}</span>}
      >
        {/* Araç Çubuğu */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Arama</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Başlık, açıklama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Kategori</label>
                <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {uniqueValues.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Seviye</label>
                <select className="form-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                  {uniqueValues.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Dil</label>
                <select className="form-select" value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                  {uniqueValues.languages.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Sırala</label>
                <select className="form-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                  <option value="popularity">Popüler</option>
                  <option value="newest">En yeni</option>
                  <option value="price-asc">Fiyat (Artan)</option>
                  <option value="price-desc">Fiyat (Azalan)</option>
                  <option value="title">Başlığa göre</option>
                </select>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center mt-2">
                <div className="text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  <span>Toplam <strong>{totalCount}</strong> kurs listeleniyor.</span>
                </div>
                <div className="btn-group" role="group" aria-label="Görünüm">
                  <button
                    className={`btn btn-outline-secondary ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Grid görünüm"
                  >
                    <i className="bi bi-grid-3x3-gap-fill"></i>
                  </button>
                  <button
                    className={`btn btn-outline-secondary ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    title="Liste görünüm"
                  >
                    <i className="bi bi-list-ul"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-4"><Skeleton /></div>
        ) : Object.keys(groupedByCategory).length === 0 ? (
          <div className="alert alert-light text-center m-0">Kriterlere uygun kurs bulunamadı.</div>
        ) : (
          renderGroupedCourses()
        )}
      </DashboardLayout>

      {/* Join/Katıl Modal */}
      {showJoinModal && selectedCourse && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  {selectedCourse.price > 0 ? "Kursa Bağış Yap" : "Kursa Katıl"}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <img
                      src={buildMediaUrl(api, selectedCourse.image)}
                      alt={selectedCourse.title}
                      className="img-fluid rounded"
                      style={{ objectFit: "cover", height: 180, width: "100%" }}
                      onError={(e) => (e.target.src = "/default-course-image.jpg")}
                    />
                  </div>
                  <div className="col-md-8">
                    <h5 className="text-primary d-flex align-items-center gap-2">
                      <i className="bi bi-mortarboard-fill"></i>{selectedCourse.title}
                    </h5>
                    <p className="text-muted small mb-2" dangerouslySetInnerHTML={{ __html: selectedCourse.short_info || "" }} />
                    <div className="d-flex flex-wrap gap-2">
                      {selectedCourse.level && <span className="badge bg-info">{selectedCourse.level}</span>}
                      {selectedCourse.language && <span className="badge bg-secondary">{selectedCourse.language}</span>}
                      <span className="badge bg-warning text-dark">{getCategoryTitle(selectedCourse?.category) || "Kategorisiz"}</span>
                    </div>
                    <div className="mt-3 small">
                      <div className="mb-1"><strong>Öğrenci Sayısı:</strong> {selectedCourse.students.length || 0}</div>
                      <div><strong>Fiyat:</strong> {selectedCourse.price > 0 ? `${selectedCourse.price} TL` : "Ücretsiz"}</div>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="d-flex align-items-center">
                  <img src={profile?.image || "/avatar.jpg"} alt="Profil" className="rounded-circle me-3" style={{ width: 48, height: 48, objectFit: "cover" }} />
                  <div>
                    <strong>{profile?.full_name || "Misafir Kullanıcı"}</strong>
                    <p className="mb-0 text-muted small">{profile?.email || ""}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
  <button className="btn btn-light" onClick={handleCloseModal}>Vazgeç</button>
  
  {selectedCourse.price > 0 ? (
    <button className="btn btn-danger" onClick={handleEnroll}>
      <i className="bi bi-credit-card me-1"></i> Bağış Yap ve Katıl
    </button>
  ) : (
    <button className="btn btn-success" onClick={handleEnroll}>
      <i className="bi bi-box-arrow-in-right me-1"></i> Kursa Katıl
    </button>
  )}
</div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", position: "fixed", inset: 0, zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title">Ders Videosu</h5>
                <button type="button" className="btn-close" onClick={() => { setShowVideoModal(false); setSelectedVideo(null); }}></button>
              </div>
              <div className="modal-body">
                <div className="ratio ratio-16x9">
                  <video controls autoPlay className="w-100 h-100 rounded">
                    <source src={selectedVideo} type="video/mp4" />
                    Tarayıcınız video etiketini desteklemiyor.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AkademiBaseFooter />

      {/* Minimal yerel stil - mevcut Bootstrap ile uyumlu */}
      <style>{`
        .object-fit-cover { object-fit: cover; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .course-card:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.08) !important; transition: .2s ease; }
        .course-card--list img { border-top-right-radius: 0 !important; border-bottom-left-radius: .75rem; }
      `}</style>
    </>
  );
}

export default Courses;
