import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

const OgrenciDetay = () => {
  const { id } = useParams();
  const api = useAxios();
  const [ogrenci, setOgrenci] = useState(null);

  useEffect(() => {
    api.get(`/ogrenci/${id}/`).then((res) => {
      setOgrenci(res.data);
    });
  }, [id]);

  if (!ogrenci) return <div className="text-center mt-5">Yükleniyor...</div>;

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header title="Öğrenci Detay" />
          <div className="row mt-0 mt-md-4">
            <div className="col-md-4 col-lg-3" style={{ minWidth: "280px" }}>
              <Sidebar />
            </div>
            <div className="col-md-8 col-lg-9">
              <div className="card shadow-sm p-4">
                <div className="text-center mb-4">
                  {ogrenci.image ? (
                    <img
                      src={ogrenci.image}
                      alt={ogrenci.full_name}
                      className="rounded-circle"
                      style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-inline-block"
                      style={{ width: "120px", height: "120px" }}
                    />
                  )}
                  <h3 className="mt-3">{ogrenci.full_name}</h3>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-group list-group-flush mb-3">
                      <li className="list-group-item"><strong>Cinsiyet:</strong> {ogrenci.gender}</li>
                      <li className="list-group-item"><strong>Ev Tel:</strong> {ogrenci.evtel}</li>
                      <li className="list-group-item"><strong>İş Tel:</strong> {ogrenci.istel}</li>
                      <li className="list-group-item"><strong>Cep Tel:</strong> {ogrenci.ceptel}</li>
                      <li className="list-group-item"><strong>Ülke:</strong> {ogrenci.country?.name}</li>
                      <li className="list-group-item"><strong>Şehir:</strong> {ogrenci.city?.name}</li>
                    </ul>
                  </div>

                  <div className="col-md-6">
                    <ul className="list-group list-group-flush mb-3">
                      <li className="list-group-item"><strong>Biyografi:</strong> {ogrenci.bio}</li>
                      <li className="list-group-item"><strong>Hakkında:</strong> {ogrenci.about}</li>
                      <li className="list-group-item">
                        <strong>Facebook:</strong> <br />
                        <a href={ogrenci.facebook} target="_blank" rel="noopener noreferrer">{ogrenci.facebook}</a>
                      </li>
                      <li className="list-group-item">
                        <strong>Twitter:</strong> <br />
                        <a href={ogrenci.twitter} target="_blank" rel="noopener noreferrer">{ogrenci.twitter}</a>
                      </li>
                      <li className="list-group-item">
                        <strong>LinkedIn:</strong> <br />
                        <a href={ogrenci.linkedin} target="_blank" rel="noopener noreferrer">{ogrenci.linkedin}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
};

export default OgrenciDetay;
