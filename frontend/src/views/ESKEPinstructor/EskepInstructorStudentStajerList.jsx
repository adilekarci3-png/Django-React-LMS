import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import { useParams, useNavigate } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import UserData from "../plugin/UserData";

function EskepInstructorStudentStajerList() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [stajerler, setStajerler] = useState([]);
  const [search, setSearch] = useState("");
  const api = useAxios();
  const navigate = useNavigate();
  const koordinatorId = UserData()?.user_id;

  const filteredOgrenciler = ogrenciler.filter(o => o.full_name.toLowerCase().includes(search.toLowerCase()));
  const filteredStajerler = stajerler.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
     debugger;
     console.log(koordinatorId);
    async function fetchData() {
      try {
        debugger;
        const res = await api.get(`/eskepinstructor/${koordinatorId}/kisisel-liste/`);
        
        console.log(koordinatorId);
        console.log(res.data);
        setOgrenciler(res.data.ogrenciler);
        setStajerler(res.data.stajerler);
      } catch (err) {
        console.error("Liste alınamadı:", err);
      }
    }

    if (koordinatorId) fetchData();
  }, [koordinatorId]);

  const renderPerson = (p) => (
    <li
      className="list-group-item d-flex justify-content-between align-items-center list-group-item-action"
      key={p.email}
      onClick={() => navigate(`/profil-detay/${p.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex align-items-center">
        <img
          src={p.image || "/default.jpg"}
          alt="Profil"
          className="rounded-circle me-3"
          width={50}
          height={50}
        />
        <div>
          <strong>{p.full_name}</strong><br />
          <small className="text-muted">
            {p.email} | {p.gender} | {p.city} <br />
            Başlangıç: {p.start_date} | Rol: {p.role} | {p.active ? "Aktif" : "Pasif"}
          </small>
        </div>
      </div>
    </li>
  );

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <h3 className="text-primary mb-4">📘 Öğrenci ve Stajyer Listesi</h3>
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="İsim ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-3 text-success">👨‍🎓 Öğrenciler</h5>
                  <ul className="list-group">
                    {filteredOgrenciler.length > 0 ? filteredOgrenciler.map(renderPerson) : <li className="list-group-item">Kayıtlı öğrenci yok.</li>}
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5 className="mb-3 text-info">🧑‍🔬 Stajyerler</h5>
                  <ul className="list-group">
                    {filteredStajerler.length > 0 ? filteredStajerler.map(renderPerson) : <li className="list-group-item">Kayıtlı stajyer yok.</li>}
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

export default EskepInstructorStudentStajerList;
