import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
// import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import { CartContext } from "../plugin/Context";

function Wishlist() {
  const api = useAxios(); // ✅ hook en üstte
  const [wishlist, setWishlist] = useState([]);

  const [cartCount, setCartCount] = useContext(CartContext);

  // UserData / GetCurrentAddress hook ise bunları da en üstte al
  const userData = UserData();
  const address = GetCurrentAddress();

  const userId = userData?.user_id;
  const country = address?.country;

  const fetchWishlist = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`student/wishlist/${userId}/`);
      setWishlist(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // userId gelince tekrar çek
  }, [userId]);

  const addToWishlist = async (courseId) => {
    if (!userId) return;

    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("course_id", courseId);

    try {
      const res = await api.post(`student/wishlist/${userId}/`, formdata);
      await fetchWishlist();
      Toast().fire({ icon: "success", title: res.data.message });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4 g-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-0 mb-4">
                <i className="fas fa-heart text-danger"></i> İstek Listesi
              </h4>

              <div className="row">
                <div className="col-md-12">
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {wishlist?.map((w) => (
                      <div className="col-lg-4" key={w?.id ?? w?.course?.id}>
                        <div className="card card-hover">
                          <Link to={`/course-detail/${w.course.slug}/`}>
                            <img
                              src={w.course.image}
                              alt="course"
                              className="card-img-top"
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                              }}
                            />
                          </Link>

                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <span className="badge bg-info">
                                  {w.course.level}
                                </span>
                                <span className="badge bg-success ms-2">
                                  {w.course.language}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => addToWishlist(w.course?.id)}
                                className="btn btn-link p-0 fs-5"
                              >
                                <i className="fas fa-heart text-danger align-middle" />
                              </button>
                            </div>

                            <h4 className="mb-2 text-truncate-line-2">
                              <Link
                                to={`/course-detail/${w.course.slug}/`}
                                className="text-inherit text-decoration-none text-dark fs-5"
                              >
                                {w.course.title}
                              </Link>
                            </h4>

                            <small>{w.course?.teacher?.full_name}</small>
                            <br />
                            <small>
                              {w.course.students?.length} Öğrenci
                            </small>
                            <br />

                            <div className="lh-1 mt-3 d-flex">
                              <span className="align-text-top">
                                <span className="fs-6">
                                  <Rater
                                    total={5}
                                    rating={w.course.average_rating || 0}
                                  />
                                </span>
                              </span>
                              <span className="fs-6 ms-2">
                                ({w.course.reviews?.length} Yorumlar)
                              </span>
                            </div>
                          </div>

                          <div className="card-footer">
                            <div className="row align-items-center g-0">
                              <div className="col">
                                <h5 className="mb-0">${w.course.price}</h5>
                              </div>
                              <div className="col-auto">
                                <Link
                                  to={""}
                                  className="text-inherit text-decoration-none btn btn-primary"
                                >
                                  Kayıt Ol{" "}
                                  <i className="fas fa-arrow-right text-primary align-middle me-2 text-white" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {wishlist.length < 1 && (
                      <p className="mt-4 p-3">Kayıt bulunamadı</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </>
  );
}

export default Wishlist;