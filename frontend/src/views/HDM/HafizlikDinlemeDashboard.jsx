import React, { useState, useEffect } from "react";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
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

function HafizlikDinlemeDashboard() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("Tümü");
  const [dataSet, setDataSet] = useState({});

  // Simülasyon veri
  const dummyData = {
    "2024": {
      "Tümü": { reads: 400, students: 150, listens: 100 },
      "Ocak": { reads: 60, students: 30, listens: 20 },
    },
    "2023": {
      "Tümü": { reads: 320, students: 120, listens: 85 },
    },
  };

  useEffect(() => {
    const current = dummyData[selectedYear]?.[selectedMonth] || { reads: 0, students: 0, listens: 0 };
    setDataSet(current);
  }, [selectedYear, selectedMonth]);

  // Grafik verileri
  const monthlyReadData = {
    labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"],
    datasets: [{
      label: "Okuma",
      data: [30, 50, 40, 60, 80, 70],
      backgroundColor: "#4e73df",
    }],
  };

  const evaluationData = {
    labels: ["Doğru", "Yanlış", "Eksik"],
    datasets: [{
      data: [75, 15, 10],
      backgroundColor: ["#1cc88a", "#e74a3b", "#f6c23e"],
    }],
  };

  const improvementData = {
    labels: ["1. Ay", "2. Ay", "3. Ay", "4. Ay"],
    datasets: [{
      label: "Puan",
      data: [65, 70, 80, 90],
      borderColor: "#36b9cc",
      backgroundColor: "rgba(54, 185, 204, 0.3)",
    }],
  };

  const levelDistributionData = {
    labels: ["Başlangıç", "Orta", "İleri"],
    datasets: [{
      data: [120, 80, 50],
      backgroundColor: ["#36b9cc", "#4e73df", "#1cc88a"],
    }],
  };

  return (
    <>
      <HBSBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          {/* Üst Kısım */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="d-flex gap-3">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-select">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="form-select">
                <option value="Tümü">Tümü</option>
                <option value="Ocak">Ocak</option>
              </select>
            </div>

            <div className="d-flex gap-3">
              <div className="stat-card bg-primary text-white">
                <div className="stat-number">{dataSet.reads}</div>
                <div className="stat-label">Toplam Okuma</div>
              </div>
              <div className="stat-card bg-success text-white">
                <div className="stat-number">{dataSet.students}</div>
                <div className="stat-label">Toplam Öğrenci</div>
              </div>
              <div className="stat-card bg-warning text-dark">
                <div className="stat-number">{dataSet.listens}</div>
                <div className="stat-label">Toplam Dinleme</div>
              </div>
            </div>
          </div>

          <h2 className="text-center mb-4">📊 Hafızlık Dinleme Merkezi İstatistikleri</h2>

          {/* 4 Grafik */}
          <div className="row g-3">
            {/* Grafik 1 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Aylık Okuma Sayısı</h6>
                <div style={{ height: "250px" }}>
                  <Bar data={monthlyReadData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 2 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Değerlendirme Durumu</h6>
                <div style={{ height: "250px" }}>
                  <Pie data={evaluationData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 3 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Gelişim Grafiği</h6>
                <div style={{ height: "250px" }}>
                  <Line data={improvementData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 4 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Seviye Dağılımı</h6>
                <div style={{ height: "250px" }}>
                  <Doughnut data={levelDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HBSBaseFooter />
    </>
  );
}

export default HafizlikDinlemeDashboard;
