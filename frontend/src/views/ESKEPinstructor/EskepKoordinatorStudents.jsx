// src/pages/EskepKoordinatorStudents.jsx
import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function EskepKoordinatorStudents() {
  const [students, setStudents] = useState([]);
  const api = useAxios();
  const userData = useUserData();
  const userId = userData?.user_id;

  useEffect(() => {
    if (!userId) return;

    api
      .get(`/eskep/koordinator/students/${userId}/`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("Öğrenciler alınamadı:", err));
  }, [api, userId]);

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container-xxl">
          {/* üst kısım */}
          <Header />

          <div className="row mt-0 mt-md-4">
            {/* SOL SİDEBAR */}
            <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ İÇERİK */}
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card mb-4">
                <div className="p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">Koordinatör Öğrencileri</h3>
                    <span>Size bağlı öğrencilerin listesi.</span>
                  </div>
                </div>
              </div>

              <div className="row">
                {students.length === 0 && (
                  <div className="col-12">
                    <div className="alert alert-info mb-4">
                      Bu koordinatöre bağlı öğrenci bulunamadı.
                    </div>
                  </div>
                )}

                {students.map((s, i) => (
                  <div className="col-lg-4 col-md-6 col-12" key={i}>
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="text-center">
                          <img
                            src={s.image ? s.image : "https://via.placeholder.com/70"}
                            className="rounded-circle avatar-xl mb-3"
                            style={{
                              width: "70px",
                              height: "70px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            alt="avatar"
                          />
                          <h4 className="mb-1">{s.full_name}</h4>
                          <p className="mb-0">
                            <i className="fas fa-map-pin me-1" /> {s.country || "—"}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between py-2 mt-4 fs-6">
                          <span>Kayıt Tarihi</span>
                          <span className="text-dark">
                            {s.date ? moment(s.date).format("DD MMM YYYY") : "—"}
                          </span>
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

export default EskepKoordinatorStudents;
