import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import "./css/Stajerlist.css";
import Swal from "sweetalert2";

export default function StajerListesi() {
  const api = useAxios();
  const [stajerler, setStajerler] = useState([]);
  const [country, setCountry] = useState([]);
  const [city, setCity] = useState([]);

  useEffect(() => {
    api
      .get("stajer")
      .then((res) => {
        setStajerler(res.data);
        console.log(res.data[0].image);
      })
      .catch((err) => console.error("Stajer verisi alınamadı:", err));
  }, []);
 
  //   const handleSil = async (id) => {
  //     if (window.confirm("Bu stajeri silmek istediğinize emin misiniz?")) {
  //       try {
  //         await api.delete(`stajerler/${id}/`);
  //         setStajerler((prev) => prev.filter((s) => s.id !== id));
  //       } catch (err) {
  //         console.error("Silme işlemi başarısız:", err);
  //       }
  //     }
  //   };
  const handleSil = async (id) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu stajyeri silmek üzeresiniz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "İptal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`stajerler/${id}/`);
        setStajerler((prev) => prev.filter((s) => s.id !== id));

        Swal.fire({
          title: "Silindi!",
          text: "Stajyer başarıyla silindi.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Silme işlemi başarısız:", err);
        Swal.fire({
          title: "Hata!",
          text: "Stajyer silinirken bir sorun oluştu.",
          icon: "error",
        });
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
                  {stajerler.map((s) => (
                    <div key={s.id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
                      <div className="card h-100 border-0 shadow-sm hover-card text-center">
                        <div className="d-flex justify-content-center mt-4">
                          <img
                            src={s.image || "/default.jpg"}
                            alt={s.full_name}
                            className="rounded-circle shadow"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              border: "3px solid #e0e0e0",
                            }}
                          />
                        </div>
                        <div className="card-body">
                          <h5 className="card-title mb-1">{s.full_name}</h5>
                          <span className="badge bg-secondary mb-2">
                            {s.gender || "Bilinmiyor"}
                          </span>
                          <p
                            className="card-text text-muted"
                            style={{ fontSize: "0.9rem" }}
                          >
                            <strong>Cep:</strong> {s.ceptel}
                          </p>
                          <div className="d-flex justify-content-center gap-2 mt-3">
                            <Link
                              to={`/eskepinstructor/stajer/${s.id}/detay`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Detay
                            </Link>
                            <Link
                              to={`/eskepinstructor/stajer/${s.id}/duzenle`}
                              className="btn btn-sm btn-outline-warning"
                            >
                              Düzenle
                            </Link>
                            <button
                              onClick={() => handleSil(s.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stajerler.length === 0 && (
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
