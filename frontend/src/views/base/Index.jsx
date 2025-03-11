import React, { useEffect, useState, useContext, useMemo } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import { CartContext } from "../plugin/Context";
import apiInstance from "../../utils/axios";

function Index() {
  const [projelist, setProjeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useContext(CartContext);

  const country = GetCurrentAddress().country;
  const userId = UserData()?.user_id;

  const fetchProjelist = async () => {
    setIsLoading(true);
    try {
      const res = await apiInstance.get(`proje/list/`);
      setProjeList(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      Toast().fire({
        title: "Projeler yüklenemedi",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjelist();
  }, []);

  // Pagination
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return projelist.slice(indexOfFirstItem, indexOfLastItem);
  }, [projelist, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(projelist.length / itemsPerPage);
  }, [projelist.length]);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <BaseHeader />
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
                {currentItems?.map((s, index) => (
                  <div className="col-lg-4 col-md-6 col-12" key={index}>
                    <div className="card mb-4 bg-white shadow-md rounded-xl">
                      <div className="card-body">
                        <div className="text-center">
                          {/* HBS veya ESKEP'e özel link yönlendirmesi */}
                          {s.name === 'HBS' ? (
                            <Link className="nav-link" to="/hafizbilgi/create-hafizbilgi/">
                              <img
                                src={s.image}
                                className="avatar-xl mb-3 rounded-full object-cover"
                                style={{ width: "250px", height: "250px" }}
                                alt="avatar"
                              />
                            </Link>
                          ) : s.name === 'ESKEP' ? (
                            <Link className="nav-link" to="/eskep/">
                              <img
                                src={s.image}
                                className="avatar-xl mb-3 rounded-full object-cover"
                                style={{ width: "250px", height: "250px" }}
                                alt="avatar"
                              />
                            </Link>
                          ) : (
                            <img
                              src={s.image}
                              className="avatar-xl mb-3 rounded-full object-cover"
                              style={{ width: "250px", height: "250px" }}
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

      <BaseFooter />
    </>
  );
}

export default Index;
