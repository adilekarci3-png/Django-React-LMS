import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData"; // Token'dan kullanıcı bilgisi al
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function ESKEPAddLesson() {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    background_color: "#007bff",
    border_color: "#0056b3"
  });

  const api = useAxios();
  const navigate = useNavigate();
  const profile = UserData(); // ✅ Token'dan user_id, username vb. alınır

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile?.user_id) {
      Swal.fire("Hata", "Kullanıcı bilgisi alınamadı.", "error");
      return;
    }

    try {
      await api.post("/events/create/", formData);
      Swal.fire("Başarılı", "Etkinlik eklendi!", "success");
      navigate("/egitmen/takvim");
    } catch (err) {
      console.error("Hata:", err);
      Swal.fire("Hata", "Etkinlik eklenemedi.", "error");
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-8 mx-auto bg-white p-5 rounded shadow">
              <h3 className="text-primary fw-bold mb-4">📘 Yeni Eğitim Ekle</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Ders Başlığı</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tarih</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3 row">
                  <div className="col">
                    <label className="form-label">Arka Plan Rengi</label>
                    <input
                      type="color"
                      name="background_color"
                      className="form-control form-control-color"
                      value={formData.background_color}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">Kenarlık Rengi</label>
                    <input
                      type="color"
                      name="border_color"
                      className="form-control form-control-color"
                      value={formData.border_color}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary mt-3">
                  Kaydet
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default ESKEPAddLesson;
