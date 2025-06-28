import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import HafizDersListesiModal from "./modals/HafizDersListesiModal";
import HafizBilgiModal from "./modals/HafizBilgiModal";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function EgitmenHafizListesi() {
  const [hafizlar, setHafizlar] = useState([]);
  const [selectedHafiz, setSelectedHafiz] = useState(null);
  const [showDersler, setShowDersler] = useState(false);
  const [showBilgi, setShowBilgi] = useState(false);

  const api = useAxios();

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/egitmenler/hafizlar/");
      setHafizlar(res.data);
    };
    fetchData();
  }, []);

  return (
    <>
      <HDMBaseHeader />
      <div className="container py-4" style={{ maxWidth: "1380px" }}>
        <Header />
        <div className="row mt-3">
          {/* Sidebar */}
          <div className="col-md-3">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <div className="card shadow-sm p-4">
              <h3 className="mb-4">Eğitmene Ait Hafızlar</h3>
              <div className="list-group">
                {hafizlar.map((hafiz) => (
                  <div
                    key={hafiz.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{hafiz.full_name}</strong> - {hafiz.ceptel}
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedHafiz(hafiz);
                          setShowDersler(true);
                        }}
                      >
                        Derslerini Gör
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setSelectedHafiz(hafiz);
                          setShowBilgi(true);
                        }}
                      >
                        Bilgilerini Gör
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ders Listesi Modalı */}
      {showDersler && selectedHafiz && (
        <HafizDersListesiModal
          hafizId={selectedHafiz.id}
          onClose={() => {
            setShowDersler(false);
            setSelectedHafiz(null);
          }}
        />
      )}

      {/* Bilgi Modalı */}
      {showBilgi && selectedHafiz && (
        <HafizBilgiModal
          hafiz={selectedHafiz}
          onClose={() => {
            setShowBilgi(false);
            setSelectedHafiz(null);
          }}
        />
      )}

      <HDMBaseFooter />
    </>
  );
}

export default EgitmenHafizListesi;
