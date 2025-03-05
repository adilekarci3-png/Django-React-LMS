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
    setIsLoading(true);
    axios.get(`http://127.0.0.1:8000/api/v1/proje/list/`)
      .then((res) => {
        setProjeList(res.data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProjelist();
  }, []);

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(projelist.length / itemsPerPage);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-2 pb-2 bg-mint-100">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-12 col-12">
              <div className="card mb-4 bg-mint-50 shadow-lg">
                <div className="p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 text-mint-800">Projeler</h3>
                    <span className="text-mint-600">Kurslarınıza katılan öğrenciler ile tanışın</span>
                  </div>
                </div>
              </div>
              <div className="row">
                {projelist?.map((s, index) => (
                  <div className="col-lg-4 col-md-6 col-12" key={index}>
                    <div className="card mb-4 bg-white shadow-md rounded-xl">
                      <div className="card-body">
                        <div className="text-center">
                          {s.name === 'HBS' ? (
                            <Link className="nav-link" to="/hafizbilgi/create-hafizbilgi/">
                              <img
                                src={s.image}
                                className="avatar-xl mb-3 rounded-full object-cover"
                                style={{ width: "150px", height: "150px" }}
                                alt="avatar"
                              />
                            </Link>
                          ) : (
                            <img
                              src={s.image}
                              className="avatar-xl mb-3 rounded-full object-cover"
                              style={{ width: "150px", height: "150px" }}
                              alt="avatar"
                            />
                          )}
                          <h4 className="mb-1 text-mint-800">{s.name}</h4>
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
