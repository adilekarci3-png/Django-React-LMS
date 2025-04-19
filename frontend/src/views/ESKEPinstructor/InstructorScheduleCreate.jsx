import { useState } from "react";
import { TextField, Button, MenuItem, Select, InputLabel } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";  // Sidebar'ı import ettik

const days = [
  "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

function InstructorScheduleCreate() {
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      day,
      start_time: startTime,
      end_time: endTime
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/instructor/schedule/create/", data);
      Swal.fire({
        icon: "success",
        title: "Ders saati başarıyla kaydedildi",
      });
      setDay("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Bir hata oluştu",
      });
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              {/* Card */}
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">Eğitmen Ders Saati Belirle</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <InputLabel>Gün</InputLabel>
                      <Select
                        fullWidth
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        size="small"
                      >
                        {days.map((d, index) => (
                          <MenuItem key={index} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>

                    <div className="mb-3">
                      <TextField
                        label="Başlangıç Saati"
                        type="time"
                        fullWidth
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }} // 5 dakikalık adım
                      />
                    </div>

                    <div className="mb-3">
                      <TextField
                        label="Bitiş Saati"
                        type="time"
                        fullWidth
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                      />
                    </div>

                    <div className="d-grid">
                      <Button type="submit" variant="contained" color="primary">
                        Kaydet
                      </Button>
                    </div>
                  </form>
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

export default InstructorScheduleCreate;
