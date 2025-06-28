import React, { useEffect, useState } from "react";
import useAxios from "../../../utils/useAxios";

function HafizDersListesiModal({ hafizId, onClose }) {
  const [dersler, setDersler] = useState([]);
  const [hafizName, setHafizName] = useState("");
  const api = useAxios();

  useEffect(() => {
  const fetchDersler = async () => {
    try {
      const res = await api.get(`hafizlar/${hafizId}/dersler/`);
      setDersler(res.data);

      if (res.data.length > 0) {
        const fullName = res.data[0].hafiz_detail?.full_name;
        setHafizName(fullName); // state güncellenir
        console.log("Hafız adı:", hafizName); // burada yazdır
      }
    } catch (error) {
      console.error("Dersler alınırken hata:", error);
    }
  };

  fetchDersler();
}, [hafizId]);

  return (
    <div className="modal show d-block" style={{ background: "#00000099" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <h5>Ders Listesi - {hafizName}</h5>
          <ul>
            {dersler.map((ders) => (
              <li key={ders.id}>
                {ders.start_time} - {ders.topic}{" "}
                {ders.instructor_detail?.full_name && (
                  <span className="text-muted">({ders.instructor_detail.full_name})</span>
                )}
              </li>
            ))}
          </ul>
          <button className="btn btn-outline-secondary mt-2" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default HafizDersListesiModal;
