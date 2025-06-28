import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";

function Courses() {
    
 const renderCourseProperty = (value, fallback = "-") => {
    if (typeof value === "object" && value !== null) {
      // If the value is an object, handle it appropriately
      return value.title || value.name || fallback;
    }
    return value || fallback;
  };

  const fetchCourseData = () => {
    setLoading(true);
    api
      .get(`course/course-list/`)
      .then((res) => {
        setCourses(res.data);
        setAllCourses(res.data);

        // Extract unique categories
        // const uniqueCategories = [...new Set(res.data.map(course => course.category))];
        // setCategories(uniqueCategories);

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

  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "all") {
      setCourses(allCourses);
    } else {
      const filtered = allCourses.filter((c) => c.category === category);
      setCourses(filtered);
    }
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

  const handlePurchase = (courseId) => {
    api
      .post(`course/purchase/${courseId}/`)
      .then(() => {
        Swal.fire("Başarılı!", "Kurs satın alındı.", "success");
        fetchCourseData();
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Hata!", "Satın alma işlemi başarısız oldu.", "error");
      });
  };

  const handleJoin = (courseSlug) => {
    navigate(`/course/${courseSlug}`);
  };

  const totalPages = Math.ceil(courses.length / itemsPerPage);
    const paginatedCourses = courses.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
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

                {/* Kategori Filtreleme */}
                <div className="mb-4">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      onClick={() => filterByCategory("all")}
                      className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      Tüm Kurslar
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category || "uncategorized"}
                        onClick={() => filterByCategory(category)}
                        className={`btn btn-sm ${activeCategory === category ? "btn-primary" : "btn-outline-primary"}`}
                      >
                        {renderCourseProperty(category, "Kategorisiz")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ... rest of your component ... */}

                {/* In your course rendering section: */}
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {paginatedCourses.map((course) => (
                    <div className="col" key={course.id}>
                      <div className="card h-100 shadow-sm border-0">
                        {course.image && (
                          <img
                            src={typeof course.image === 'string' ? course.image : course.image.url}
                            alt={renderCourseProperty(course.title)}
                            className="card-img-top"
                            style={{ height: "160px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-course-image.jpg";
                            }}
                          />
                        )}
                        <div className="card-body d-flex flex-column p-3">
                          <h5 className="card-title mb-2 text-primary">
                            {renderCourseProperty(course.title)}
                          </h5>
                          <p className="card-text small text-muted mb-2">
                            {renderCourseProperty(
                              course.short_info || 
                              (course.description && course.description.substring(0, 80) + "...")
                            )}
                          </p>
                          {/* ... rest of your course card ... */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ... rest of your component ... */}
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