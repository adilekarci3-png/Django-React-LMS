import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

const days = [
  "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

function InstructorScheduleCreate() {
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { day, start_time: startTime, end_time: endTime, date };

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/instructor/schedule/create/", data);
      Swal.fire({ icon: "success", title: "Ders saati başarıyla kaydedildi" });
      setDay(""); setStartTime(""); setEndTime(""); setDate("");
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Bir hata oluştu" });
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />

            <div className="col-lg-9 col-md-8 col-12">
              <div className="card shadow-sm rounded-4 border-0">
                <div className="card-header bg-light rounded-top-4">
                  <h3 className="mb-1 fw-bold text-dark">
                    <i className="bi bi-calendar-plus me-2 text-success"></i>
                    Ders Zamanı Oluştur
                  </h3>
                  <p className="text-muted mb-0">Eğitmen olarak haftalık ders planınızı belirleyin.</p>
                </div>

                <form className="card-body p-4" onSubmit={handleSubmit}>
                  <div className="row gy-3">
                    {/* Gün */}
                    <div className="col-md-6">
                      <label className="form-label">Gün</label>
                      <select
                        className="form-select"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        required
                      >
                        <option value="">Seçiniz</option>
                        {days.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tarih */}
                    <div className="col-md-6">
                      <label className="form-label">Tarih</label>
                      <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>

                    {/* Başlangıç */}
                    <div className="col-md-6">
                      <label className="form-label">Başlangıç Saati</label>
                      <input
                        type="time"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>

                    {/* Bitiş */}
                    <div className="col-md-6">
                      <label className="form-label">Bitiş Saati</label>
                      <input
                        type="time"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>

                    {/* Submit */}
                    <div className="col-12">
                      <button type="submit" className="btn btn-success w-100 py-2 fs-5">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Kaydet
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default InstructorScheduleCreate;
