import React, { useEffect, useState, useContext } from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import axios from "axios";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import useAxios from "../../utils/useAxios";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import { CartContext } from "../plugin/Context";
import apiInstance from "../../utils/axios";

function ESKEPIndex() {
  const [projelist, setProjeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useContext(CartContext);

  const country = GetCurrentAddress().country;
  const userId = UserData()?.user_id;
  const cartId = CartId();

  const fetchProjelist = () => {
    debugger;
    setIsLoading(true);
    axios.get(`http://127.0.0.1:8000/api/v1/proje/list/`)
      .then((res) => {
        debugger;
        setProjeList(res.data);
        setIsLoading(false);
        console.log(res.data);
      });

  };

  useEffect(() => {
    fetchProjelist();
  }, []);

  // const addToCart = async (courseId, userId, price, country, cartId) => {

  //   const formdata = new FormData();

  //   formdata.append("course_id", courseId);
  //   formdata.append("user_id", userId);
  //   formdata.append("price", price);
  //   formdata.append("country_name", country);
  //   formdata.append("cart_id", cartId);

  //   try {
  //     await useAxios()
  //       .post(`course/cart/`, formdata)
  //       .then((res) => {
  //         console.log(res.data);
  //         Toast().fire({
  //           title: "Added To Cart",
  //           icon: "success",
  //         });

  //         // Set cart count after adding to cart
  //         apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
  //           setCartCount(res.data?.length);
  //         });
  //       });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // Pagination

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  //const currentItems = courses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(projelist.length / itemsPerPage);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );


  // const projelist = (courseId) => {
  //   const formdata = new FormData();
  //   formdata.append("user_id", UserData()?.user_id);
  //   formdata.append("course_id", courseId);

  //   useAxios()
  //     .post(`student/wishlist/${UserData()?.user_id}/`, formdata)
  //     .then((res) => {
  //       console.log(res.data);
  //       Toast().fire({
  //         icon: "success",
  //         title: res.data.message,
  //       });
  //     });
  // };

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-2 pb-2">
        <div className="container">
          {/* Header Here */}

          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}

            <div className="col-lg-12 col-md-12 col-12">
              {/* Card */}
              <div className="card mb-4">
                {/* Card body */}
                <div className="p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">Projeler</h3>
                    <span>Kurslarınıza katılan öğrenciler ile tanışın</span>
                  </div>
                  {/* Nav */}
                </div>
              </div>
              {/* Tab content */}
              <div className="row">
                {projelist?.map((s, index) => (
                  <div className="col-lg-4 col-md-6 col-12">
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="text-center">
                          {s.name == 'HBS' ? (
                            <Link className="nav-link" to="/hafizbilgi/create-hafizbilgi/">
                            <img
                              src={s.image}
                              className="avatar-xl mb-3"
                              style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              alt="avatar"
                            />
                          </Link>
                          ):(<img
                            src={s.image}
                            className="avatar-xl mb-3"
                            style={{
                              width: "150px",
                              height: "150px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            alt="avatar"
                          />)}                          

                          <h4 className="mb-1">{s.name}</h4>
                          {/* <p className="mb-0">
                            {" "}
                            <i className="fas fa-map-pin me-1" /> {s.country}{" "}
                          </p> */}
                        </div>
                        <div className="d-flex justify-content-between py-2 mt-4 fs-6">
                          {/* <span>Kayıt olanlar</span>
                          <span className="text-dark">
                            {moment(s.date).format("DD MMM YYYY")}
                          </span> */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />
    </>
  );
}

export default ESKEPIndex;
