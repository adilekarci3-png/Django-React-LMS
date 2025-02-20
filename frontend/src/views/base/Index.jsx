import React, { useEffect, useState, useContext } from "react";
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
        title: "Failed to load projects",
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
  const currentItems = projelist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(projelist.length / itemsPerPage);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-12 col-12">
              <div className="card mb-4">
                <div className="p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">Projeler</h3>
                    <span>EHAD Bünyesindeki Projeler</span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div className="row">
                  {currentItems.map((s, index) => (
                    <div className="col-lg-4 col-md-6 col-12" key={s.id || index}>
                      <div className="card mb-4">
                        <div className="card-body">
                          <div className="text-center">
                            {s.name === "HBS" ? (
                              <Link className="nav-link" to="/hafizbilgi/create-hafizbilgi/">
                                <img
                                  src={s.image}
                                  className="avatar-xl mb-3"
                                  style={{
                                    width: "150px",
                                    height: "150px",
                                    objectFit: "cover",
                                  }}
                                  alt="avatar"
                                />
                              </Link>
                            ) : (
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
                            )}
                            <h4 className="mb-1">{s.name}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <nav>
                <ul className="pagination justify-content-center">
                  {[...Array(totalPages)].map((_, pageNumber) => (
                    <li
                      key={pageNumber + 1}
                      className={`page-item ${currentPage === pageNumber + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(pageNumber + 1)}
                      >
                        {pageNumber + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Index;
