import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../HDM/Partials/Sidebar";
import Header from "../HDM/Partials/Header";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";

const HafizCreate = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    about: "",
    photo: null,
    egitmen: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("full_name", formData.full_name);
    data.append("about", formData.about);
    data.append("egitmen", formData.egitmen);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      await axios.post("http://localhost:8000/api/v1/hafizlar/", data);
      alert("✅ Hafız başarıyla eklendi!");
      setFormData({ full_name: "", about: "", photo: null, egitmen: "" });
    } catch (error) {
      alert("❌ Hata oluştu: " + error.message);
    }
  };

  return (
    <>
      <HDMBaseHeader />
      <div className="container-fluid py-4">
        <Header />
        <div className="row mt-0 mt-md-4">
          <Sidebar />
          <div className="col-lg-10 col-md-8 col-12">
            <div className="card p-4 shadow-sm">
              <h3 className="mb-4 text-success">🧕 Yeni Hafız Ekle</h3>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                  <label className="form-label">Ad Soyad</label>
                  <input
                    type="text"
                    className="form-control"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Hakkında</label>
                  <textarea
                    className="form-control"
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Profil Fotoğrafı</label>
                  <input
                    type="file"
                    className="form-control"
                    name="photo"
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Eğitmen ID</label>
                  <input
                    type="number"
                    className="form-control"
                    name="egitmen"
                    value={formData.egitmen}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success">
                  Kaydet
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <HDMBaseFooter />
    </>
  );
};

export default HafizCreate;
