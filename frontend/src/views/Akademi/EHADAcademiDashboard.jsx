import React, { useState, useEffect } from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import "./css/GirisPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function EHADAcademiDashboard() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedTerm, setSelectedTerm] = useState("Tümü");
  const [dataSet, setDataSet] = useState({});

  // Simülasyon veri
  const dummyData = {
    "2024": {
      "Tümü": { students: 450, lessons: 320, exams: 85, liveSessions: 180 },
      "Güz Dönemi": { students: 250, lessons: 180, exams: 60, liveSessions: 90 },
      "Bahar Dönemi": { students: 200, lessons: 140, exams: 25, liveSessions: 90 },
    },
    "2023": {
      "Tümü": { students: 400, lessons: 280, exams: 70, liveSessions: 150 },
    },
  };

  useEffect(() => {
    const current = dummyData[selectedYear]?.[selectedTerm] || { students: 0, lessons: 0, exams: 0, liveSessions: 0 };
    setDataSet(current);
  }, [selectedYear, selectedTerm]);

  // Grafik verileri
  const studentsData = {
    labels: ["Güz", "Bahar"],
    datasets: [{
      label: "Öğrenci Sayısı",
      data: [250, 200],
      backgroundColor: "#4e73df",
    }],
  };

  const lessonsData = {
    labels: ["Arapça", "Tefsir", "Fıkıh", "Hadis", "Kıraat"],
    datasets: [{
      label: "Tamamlanan Dersler",
      data: [60, 50, 80, 40, 90],
      backgroundColor: "#36b9cc",
    }],
  };

  const examsData = {
    labels: ["Başarılı", "Başarısız"],
    datasets: [{
      data: [85, 15],
      backgroundColor: ["#1cc88a", "#e74a3b"],
    }],
  };

  const liveSessionsData = {
    labels: ["Katılan", "Katılmayan"],
    datasets: [{
      data: [180, 70],
      backgroundColor: ["#f6c23e", "#858796"],
    }],
  };

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          {/* Üst Kısım */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="d-flex gap-3">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-select">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="form-select">
                <option value="Tümü">Tümü</option>
                <option value="Güz Dönemi">Güz Dönemi</option>
                <option value="Bahar Dönemi">Bahar Dönemi</option>
              </select>
            </div>

            <div className="d-flex gap-3">
              <div className="stat-card bg-primary text-white">
                <div className="stat-number">{dataSet.students}</div>
                <div className="stat-label">Toplam Öğrenci</div>
              </div>
              <div className="stat-card bg-success text-white">
                <div className="stat-number">{dataSet.lessons}</div>
                <div className="stat-label">Tamamlanan Ders</div>
              </div>
              <div className="stat-card bg-warning text-dark">
                <div className="stat-number">{dataSet.exams}</div>
                <div className="stat-label">Sınav Başarısı</div>
              </div>
              <div className="stat-card bg-info text-white">
                <div className="stat-number">{dataSet.liveSessions}</div>
                <div className="stat-label">Canlı Ders Katılımı</div>
              </div>
            </div>
          </div>

          <h2 className="text-center mb-4">📚 EHAD Akademi İstatistikleri</h2>

          {/* 4 Grafik */}
          <div className="row g-3">
            {/* Grafik 1 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Dönemlere Göre Öğrenci Sayısı</h6>
                <div style={{ height: "250px" }}>
                  <Bar data={studentsData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 2 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Ders Tamamlama Dağılımı</h6>
                <div style={{ height: "250px" }}>
                  <Bar data={lessonsData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 3 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Sınav Başarı Durumu</h6>
                <div style={{ height: "250px" }}>
                  <Pie data={examsData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 4 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Canlı Ders Katılımı</h6>
                <div style={{ height: "250px" }}>
                  <Doughnut data={liveSessionsData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}

export default EHADAcademiDashboard;
