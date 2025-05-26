import React, { useState, useEffect } from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
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

function ESKEPDashboard() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedPeriod, setSelectedPeriod] = useState("Tümü");
  const [dataSet, setDataSet] = useState({});

  // Simülasyon verisi
  const dummyData = {
    "2024": {
      "Tümü": { interns: 300, projects: 220, ongoing: 50, graduated: 30 },
      "Güz Dönemi": { interns: 180, projects: 140, ongoing: 25, graduated: 15 },
      "Bahar Dönemi": { interns: 120, projects: 80, ongoing: 25, graduated: 15 },
    },
    "2023": {
      "Tümü": { interns: 250, projects: 180, ongoing: 40, graduated: 30 },
    },
  };

  useEffect(() => {
    const current = dummyData[selectedYear]?.[selectedPeriod] || { interns: 0, projects: 0, ongoing: 0, graduated: 0 };
    setDataSet(current);
  }, [selectedYear, selectedPeriod]);

  // Grafik verileri
  const projectCompletionData = {
    labels: ["Başlayan", "Tamamlayan"],
    datasets: [{
      data: [300, 220],
      backgroundColor: ["#36b9cc", "#1cc88a"],
    }],
  };

  const internshipTypeData = {
    labels: ["Yaz Stajı", "Güz Dönemi Stajı", "Kış Stajı"],
    datasets: [{
      label: "Stajyer Sayısı",
      data: [120, 100, 80],
      backgroundColor: ["#4e73df", "#f6c23e", "#e74a3b"],
    }],
  };

  const successRateData = {
    labels: ["Başarılı", "Başarısız"],
    datasets: [{
      data: [85, 15],
      backgroundColor: ["#1cc88a", "#e74a3b"],
    }],
  };

  const graduationData = {
    labels: ["Mezun Olan", "Devam Eden"],
    datasets: [{
      label: "Durum",
      data: [30, 50],
      backgroundColor: ["#36b9cc", "#858796"],
    }],
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          {/* Üst Kısım */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="d-flex gap-3">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-select">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="form-select">
                <option value="Tümü">Tümü</option>
                <option value="Güz Dönemi">Güz Dönemi</option>
                <option value="Bahar Dönemi">Bahar Dönemi</option>
              </select>
            </div>

            <div className="d-flex gap-3">
              <div className="stat-card bg-primary text-white">
                <div className="stat-number">{dataSet.interns}</div>
                <div className="stat-label">Toplam Stajyer</div>
              </div>
              <div className="stat-card bg-success text-white">
                <div className="stat-number">{dataSet.projects}</div>
                <div className="stat-label">Tamamlanan Proje</div>
              </div>
              <div className="stat-card bg-warning text-dark">
                <div className="stat-number">{dataSet.ongoing}</div>
                <div className="stat-label">Devam Edenler</div>
              </div>
              <div className="stat-card bg-info text-white">
                <div className="stat-number">{dataSet.graduated}</div>
                <div className="stat-label">Mezun Olanlar</div>
              </div>
            </div>
          </div>

          <h2 className="text-center mb-4">🛠️ ESKEP Staj ve Kariyer Eğitimi Programı İstatistikleri</h2>

          {/* 4 Grafik */}
          <div className="row g-3">
            {/* Grafik 1 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Proje Tamamlama Oranı</h6>
                <div style={{ height: "250px" }}>
                  <Pie data={projectCompletionData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 2 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Staj Türlerine Göre Dağılım</h6>
                <div style={{ height: "250px" }}>
                  <Bar data={internshipTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 3 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Başarı Oranı</h6>
                <div style={{ height: "250px" }}>
                  <Pie data={successRateData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            {/* Grafik 4 */}
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card p-3 shadow-sm">
                <h6 className="text-center mb-3">Mezuniyet Durumu</h6>
                <div style={{ height: "250px" }}>
                  <Doughnut data={graduationData} options={{ responsive: true, maintainAspectRatio: false }} />
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

export default ESKEPDashboard;
