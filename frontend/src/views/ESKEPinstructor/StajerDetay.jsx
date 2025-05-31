import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

const StajerDetay = () => {
  const { id } = useParams();
  const api = useAxios();
  const [stajer, setStajer] = useState(null);

  useEffect(() => {
    api.get(`/stajer/${id}/`).then((res) => {
      setStajer(res.data);
    });
  }, [id]);

  if (!stajer) return <div className="text-center mt-5">Yükleniyor...</div>;

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header title="Stajer Detay" />
          <div className="row mt-0 mt-md-4">
            <div className="col-md-4 col-lg-3" style={{ minWidth: "280px" }}>
              <Sidebar />
            </div>
            <div className="col-md-8 col-lg-9">
              <div className="card shadow-sm p-4">
                <div className="text-center mb-4">
                  {stajer.image ? (
                    <img
                      src={stajer.image}
                      alt={stajer.full_name}
                      className="rounded-circle"
                      style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-inline-block"
                      style={{ width: "120px", height: "120px" }}
                    />
                  )}
                  <h3 className="mt-3">{stajer.full_name}</h3>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-group list-group-flush mb-3">
                      <li className="list-group-item"><strong>Cinsiyet:</strong> {stajer.gender}</li>
                      <li className="list-group-item"><strong>Ev Tel:</strong> {stajer.evtel}</li>
                      <li className="list-group-item"><strong>İş Tel:</strong> {stajer.istel}</li>
                      <li className="list-group-item"><strong>Cep Tel:</strong> {stajer.ceptel}</li>
                      <li className="list-group-item"><strong>Ülke:</strong> {stajer.country?.name}</li>
                      <li className="list-group-item"><strong>Şehir:</strong> {stajer.city?.name}</li>
                    </ul>
                  </div>

                  <div className="col-md-6">
                    <ul className="list-group list-group-flush mb-3">
                      <li className="list-group-item"><strong>Biyografi:</strong> {stajer.bio}</li>
                      <li className="list-group-item"><strong>Hakkında:</strong> {stajer.about}</li>
                      <li className="list-group-item">
                        <strong>Facebook:</strong> <br />
                        <a href={stajer.facebook} target="_blank" rel="noopener noreferrer">{stajer.facebook}</a>
                      </li>
                      <li className="list-group-item">
                        <strong>Twitter:</strong> <br />
                        <a href={stajer.twitter} target="_blank" rel="noopener noreferrer">{stajer.twitter}</a>
                      </li>
                      <li className="list-group-item">
                        <strong>LinkedIn:</strong> <br />
                        <a href={stajer.linkedin} target="_blank" rel="noopener noreferrer">{stajer.linkedin}</a>
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

export default StajerDetay;
