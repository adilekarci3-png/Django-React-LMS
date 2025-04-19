import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaPlus,
  FaVideo,
  FaClock,
  FaRegFileVideo,
  FaListUl,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import Toast from "../plugin/Toast";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function InstructorList() {
  const [coordinators, setCoordinators] = useState([]);
  const [students, setStudents] = useState([]);
  const [interns, setInterns] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedIntern, setSelectedIntern] = useState("");
  const [studentCoordinator, setStudentCoordinator] = useState("");
  const [internCoordinator, setInternCoordinator] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const coordinatorsResponse = await useAxios().get("eskep/egitmens");
        setCoordinators(coordinatorsResponse.data);
        const studentsResponse = await useAxios().get("/user/students");
        setStudents(studentsResponse.data);
        const internsResponse = await useAxios().get("/user/interns");
        setInterns(internsResponse.data);
      } catch (error) {
        console.error("Veriler alınırken hata oluştu", error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card mt-4">
                <div className="card-header">
                  <h3 className="mb-0">Eğitmenler</h3>
                </div>
                <div className="card-body">
                  <ul className="list-group">
                    {coordinators.map((coordinator) => (
                      <li
                        key={coordinator.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {/* Resim ve İsim */}
                        <div className="d-flex align-items-center">
                          <img
                            src={coordinator.image}
                            alt={coordinator.full_name}
                            className="rounded-circle"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                          <span className="ms-2">{coordinator.full_name}</span>{" "}
                          {/* Resim ile isim arasında boşluk */}
                        </div>

                        {/* İkonlar */}
                        <div>
                          <Link to="/eskepegitmen/profil">
                            <FaUser
                              className="text-primary mx-2 fs-4" // fs-4 sınıfı ile ikon boyutunu büyüttük
                              title="Eğitmen Profili"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>

                          <Link to="/eskepegitmen/ders-olustur/">
                            <FaPlus
                              className="text-success mx-2 fs-4" // fs-4 sınıfı ile ikon boyutunu büyüttük
                              title="Ders Oluştur"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>

                          <Link to="/eskepegitmen/video-ekle/">
                            <FaVideo
                              className="text-warning mx-2 fs-4" // fs-4 sınıfı ile ikon boyutunu büyüttük
                              title="Eğitmen Videoları"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>
                          <Link to="/eskepegitmen/ders-saat-ekle/">
                            <FaClock
                              className="text-info mx-2 fs-4" // fs-4 sınıfı ile ikon boyutunu büyüttük
                              title="Ders Saatleri"
                            />
                          </Link>
                          <Link to="/eskepegitmen/video-olustur">
                            <FaRegFileVideo
                              className="text-danger mx-2 fs-4" // fs-4 sınıfı ile ikon boyutunu büyüttük
                              title="Video Oluştur"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>

                          <Link to="/eskepegitmen/video-list/">
                            <FaListUl
                              className="text-secondary mx-2 fs-4" // fs-4 sınıfı ile ikon boyutunu büyüttük
                              title="Video Listesi"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>
                          <Link to="/eskepegitmen/youtube-canli/">
                            <FaYoutube
                              className="text-danger mx-2 fs-4" // YouTube rengine uygun olarak text-danger
                              title="YouTube Video Listesi"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default InstructorList;
