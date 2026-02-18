// import React, { useState, useEffect, useContext, useMemo } from "react";
// import { Link } from "react-router-dom";
// import Rater from "react-rater";
// import "react-rater/lib/react-rater.css";

// import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
// import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
// import Sidebar from "./Partials/Sidebar";
// import Header from "./Partials/Header";

// import useAxios from "../../utils/useAxios";
// import UserData from "../plugin/UserData";
// import Toast from "../plugin/Toast";
// import GetCurrentAddress from "../plugin/UserCountry";
// import { CartContext } from "../plugin/Context";

// function Wishlist() {
//   const api = useAxios(); // ✅ hook en üstte
//   const [wishlist, setWishlist] = useState([]);

//   const [cartCount, setCartCount] = useContext(CartContext);

//   // UserData / GetCurrentAddress hook ise bunları da en üstte al
//   const userData = UserData();
//   const address = GetCurrentAddress();

//   const userId = userData?.user_id;
//   const country = address?.country;

//   const fetchWishlist = async () => {
//     if (!userId) return;
//     try {
//       const res = await api.get(`student/wishlist/${userId}/`);
//       setWishlist(res.data);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     fetchWishlist();
//     // userId gelince tekrar çek
//   }, [userId]);

//   const addToWishlist = async (courseId) => {
//     if (!userId) return;

//     const formdata = new FormData();
//     formdata.append("user_id", userId);
//     formdata.append("course_id", courseId);

//     try {
//       const res = await api.post(`student/wishlist/${userId}/`, formdata);
//       await fetchWishlist();
//       Toast().fire({ icon: "success", title: res.data.message });
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <>
//       <ESKEPBaseHeader />

//       <section className="pt-5 pb-5">
//         <div className="container-xxl">
//           <Header />
//           <div className="row mt-0 mt-md-4 g-4">
//             <div className="col-lg-3 col-md-4 col-12">
//               <Sidebar />
//             </div>

//             <div className="col-lg-9 col-md-8 col-12">
//               <h4 className="mb-0 mb-4">
//                 <i className="fas fa-heart text-danger"></i> İstek Listesi
//               </h4>

//               <div className="row">
//                 <div className="col-md-12">
//                   <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
//                     {wishlist?.map((w) => (
//                       <div className="col-lg-4" key={w?.id ?? w?.course?.id}>
//                         <div className="card card-hover">
//                           <Link to={`/course-detail/${w.course.slug}/`}>
//                             <img
//                               src={w.course.image}
//                               alt="course"
//                               className="card-img-top"
//                               style={{
//                                 width: "100%",
//                                 height: "200px",
//                                 objectFit: "cover",
//                               }}
//                             />
//                           </Link>

//                           <div className="card-body">
//                             <div className="d-flex justify-content-between align-items-center mb-3">
//                               <div>
//                                 <span className="badge bg-info">
//                                   {w.course.level}
//                                 </span>
//                                 <span className="badge bg-success ms-2">
//                                   {w.course.language}
//                                 </span>
//                               </div>

//                               <button
//                                 type="button"
//                                 onClick={() => addToWishlist(w.course?.id)}
//                                 className="btn btn-link p-0 fs-5"
//                               >
//                                 <i className="fas fa-heart text-danger align-middle" />
//                               </button>
//                             </div>

//                             <h4 className="mb-2 text-truncate-line-2">
//                               <Link
//                                 to={`/course-detail/${w.course.slug}/`}
//                                 className="text-inherit text-decoration-none text-dark fs-5"
//                               >
//                                 {w.course.title}
//                               </Link>
//                             </h4>

//                             <small>{w.course?.teacher?.full_name}</small>
//                             <br />
//                             <small>
//                               {w.course.students?.length} Öğrenci
//                             </small>
//                             <br />

//                             <div className="lh-1 mt-3 d-flex">
//                               <span className="align-text-top">
//                                 <span className="fs-6">
//                                   <Rater
//                                     total={5}
//                                     rating={w.course.average_rating || 0}
//                                   />
//                                 </span>
//                               </span>
//                               <span className="fs-6 ms-2">
//                                 ({w.course.reviews?.length} Yorumlar)
//                               </span>
//                             </div>
//                           </div>

//                           <div className="card-footer">
//                             <div className="row align-items-center g-0">
//                               <div className="col">
//                                 <h5 className="mb-0">${w.course.price}</h5>
//                               </div>
//                               <div className="col-auto">
//                                 <Link
//                                   to={""}
//                                   className="text-inherit text-decoration-none btn btn-primary"
//                                 >
//                                   Kayıt Ol{" "}
//                                   <i className="fas fa-arrow-right text-primary align-middle me-2 text-white" />
//                                 </Link>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}

//                     {wishlist.length < 1 && (
//                       <p className="mt-4 p-3">Kayıt bulunamadı</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </section>

//       <ESKEPBaseFooter />
//     </>
//   );
// }

// export default Wishlist;

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

// Diğer importlar aynı kalıyor...

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true); // Veri yükleniyor durumunu ekledik

  // --- ÖRNEK VERİLER (MOCK DATA) ---
  const mockWishlist = [
    {
      id: 1,
      course: {
        id: 101,
        title: "Sıfırdan İleri Seviye React ve Next.js Eğitimi",
        image: "https://picsum.photos/400/200?random=1",
        slug: "react-nextjs-egitimi",
        level: "Orta Seviye",
        language: "Türkçe",
        teacher: { full_name: "Adile Karcii" },
        students: [1, 2, 3, 4, 5],
        average_rating: 4.8,
        reviews: [1, 2, 3],
        price: "199.99"
      }
    },
    {
      id: 2,
      course: {
        id: 102,
        title: "Python ile Veri Bilimi ve Makine Öğrenmesi",
        image: "https://picsum.photos/400/200?random=2",
        slug: "python-veri-bilimi",
        level: "Başlangıç",
        language: "Türkçe",
        teacher: { full_name: "Dr. Veri Bilimci" },
        students: [1, 2, 3, 4, 5, 6, 7],
        average_rating: 4.5,
        reviews: [1, 2, 3, 4, 5],
        price: "149.50"
      }
    },
    {
      id: 3,
      course: {
        id: 103,
        title: "Modern UI/UX Tasarım Temelleri",
        image: "https://picsum.photos/400/200?random=3",
        slug: "ui-ux-tasarim",
        level: "Her Seviye",
        language: "İngilizce",
        teacher: { full_name: "Tasarım Uzmanı" },
        students: [1, 2, 3],
        average_rating: 5.0,
        reviews: [1],
        price: "89.00"
      }
    }
  ];

  const fetchWishlist = async () => {
    // API isteği yerine 1 saniyelik bir gecikme ekliyoruz (gerçekçi olması için)
    setLoading(true);
    setTimeout(() => {
      setWishlist(mockWishlist);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4 g-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            {/* col-lg-10 yerine 9 yaptık ki yan yana sığsınlar */}
            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-4">
                <i className="fas fa-heart text-danger"></i> İstek Listesi
              </h4>

              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {loading ? (
                  <p className="p-3">Yükleniyor...</p>
                ) : wishlist.length > 0 ? (
                  wishlist.map((w) => (
                    <div className="col" key={w.id}>
                      <div className="card h-100 shadow-sm">
                        <Link to={`/course-detail/${w.course.slug}/`}>
                          <img
                            src={w.course.image}
                            alt="course"
                            className="card-img-top"
                            style={{ height: "180px", objectFit: "cover" }}
                          />
                        </Link>
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="badge bg-info-soft text-info">{w.course.level}</span>
                            <button className="btn btn-sm btn-outline-danger border-0">
                                <i className="fas fa-heart" />
                            </button>
                          </div>
                          <h5 className="card-title fs-6">
                            <Link to={`/course-detail/${w.course.slug}/`} className="text-dark text-decoration-none">
                              {w.course.title}
                            </Link>
                          </h5>
                          <small className="text-muted">{w.course.teacher.full_name}</small>
                          <div className="mt-2">
                            <Rater total={5} rating={w.course.average_rating} interactive={false} />
                            <small className="ms-2">({w.course.reviews.length})</small>
                          </div>
                        </div>
                        <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                          <span className="h6 mb-0">${w.course.price}</span>
                          <button className="btn btn-primary btn-sm">Kayıt Ol</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <p className="alert alert-warning">Henüz listenizde kurs bulunmamaktadır.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default Wishlist;