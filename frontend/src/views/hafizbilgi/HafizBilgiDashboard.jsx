import React, { useState, useEffect } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
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

function HafizBilgiDashboard() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedTerm, setSelectedTerm] = useState("Tümü");
  const [dataSet, setDataSet] = useState({});

  const dummyData = {
    "2024": {
      "Tümü": { hafizCount: 220, ongoing: 80, graduated: 140, successRate: 90 },
      "Güz Dönemi": { hafizCount: 120, ongoing: 40, graduated: 80, successRate: 92 },
      "Bahar Dönemi": { hafizCount: 100, ongoing: 40, graduated: 60, successRate: 88 },
    },
    "2023": {
      "Tümü": { hafizCount: 180, ongoing: 60, graduated: 120, successRate: 85 },
    },
  };

  useEffect(() => {
    const current = dummyData[selectedYear]?.[selectedTerm] || { hafizCount: 0, ongoing: 0, graduated: 0, successRate: 0 };
    setDataSet(current);
  }, [selectedYear, selectedTerm]);

  // Grafik verileri
  const hafizlikLevelData = {
    labels: ["Başlangıç", "Orta", "Tamamlayan"],
    datasets: [{
      data: [50, 70, 100],
      backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
    }],
  };

  const ageGroupData = {
    labels: ["7-10 yaş", "11-13 yaş", "14-16 yaş", "17+ yaş"],
    datasets: [{
      label: "Öğrenci Sayısı",
      data: [40, 80, 60, 40],
      backgroundColor: ["#f6c23e", "#e74a3b", "#36b9cc", "#4e73df"],
    }],
  };

  const memorizationCompletionData = {
    labels: ["Ezberi Tamamlayan", "Tamamlamayan"],
    datasets: [{
      data: [140, 80],
      backgroundColor: ["#1cc88a", "#e74a3b"],
    }],
  };

  const overallSuccessData = {
    labels: ["Başarı", "Eksik"],
    datasets: [{
      label: "Başarı Oranı",
      data: [90, 10],
      backgroundColor: ["#36b9cc", "#858796"],
    }],
  };

  return (
    <>
      <BaseHeader />
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
                <div className="stat-number">{dataSet.hafizCount}</div>
                <div className="stat-label">Toplam Hafız</div>
              </div>
              <div className="stat-card bg-success text-white">
                <div className="stat-number">{dataSet.graduated}</div>
                <div className="stat-label">Mezun Olanlar</div>
              </div>
              <div className="stat-card bg-warning text-dark">
                <div className="stat-number">{dataSet.ongoing}</div>
                <div className="stat-label">Devam Edenler</div>
              </div>
              <div className="stat-card bg-info text-white">
                <div className="stat-number">{dataSet.successRate}%</div>
                <div className="stat-label">Başarı Oranı</div>
              </div>
            </div>
          </div>

          <h2 className="text-center mb-4">📖 Hafızlar Bilgi Sistemi İstatistikleri</h2>

          {/* 4 Grafik */}
          <div className="row g-3">
            {/* Grafik 1 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Hafızlık Seviyesi Dağılımı</h6>
                <div style={{ height: "250px" }}>
                  <Pie data={hafizlikLevelData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 2 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Yaş Grupları Dağılımı</h6>
                <div style={{ height: "250px" }}>
                  <Bar data={ageGroupData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 3 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Ezber Tamamlama Oranı</h6>
                <div style={{ height: "250px" }}>
                  <Pie data={memorizationCompletionData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 4 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Genel Başarı</h6>
                <div style={{ height: "250px" }}>
                  <Doughnut data={overallSuccessData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default HafizBilgiDashboard;
