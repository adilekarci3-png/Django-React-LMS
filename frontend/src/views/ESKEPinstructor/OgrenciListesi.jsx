import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

export default function OgrenciListesi() {
  const api = useAxios();
  const [ogrenciler, setOgrenciler] = useState([]);

  useEffect(() => {
    api
      .get("ogrenci")
      .then((res) => {
        setOgrenciler(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error("Öğrenci verisi alınamadı:", err));
  }, []);

  const handleSil = async (id) => {
    if (window.confirm("Bu Öğrenciyi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`ogrenci/${id}/`);
        setStajerler((prev) => prev.filter((o) => o.id !== id));
      } catch (err) {
        console.error("Silme işlemi başarısız:", err);
      }
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header title="Stajer Listesi" />
          <div className="row mt-0 mt-md-4">
            <div className="col-md-4 col-lg-3" style={{ minWidth: "280px" }}>
              <Sidebar />
            </div>
            <div className="col-md-8 col-lg-9">
              <main className="p-2 bg-gray-100">
                <div className="row g-4">
                  {ogrenciler.map((o) => (
                    <div key={o.id} className="col-sm-6 col-md-4 col-lg-3">
                      <div className="card shadow-sm h-100 text-center">
                        <img
                          src={
                            o.image                            
                          }
                          className="card-img-top mx-auto mt-3"
                          alt={o.full_name}
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{o.full_name}</h5>
                          <p className="card-text mb-1">
                            <strong>Cinsiyet:</strong> {o.gender || "-"}
                          </p>
                          <p className="card-text mb-2">
                            <strong>Cep:</strong> {o.ceptel}
                          </p>

                          <div className="d-flex justify-content-around">
                            <Link
                              to={`/eskepinstructor/stajer/${o.id}/detay`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Detay
                            </Link>
                            <Link
                              to={`/eskepinstructor/stajer/${o.id}/duzenle`}
                              
                              className="btn btn-sm btn-outline-warning"
                            >
                              Düzenle
                            </Link>
                            <button
                              onClick={() => handleSil(o.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {ogrenciler.length === 0 && (
                    <div className="text-muted">Kayıtlı stajer bulunamadı.</div>
                  )}
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}
