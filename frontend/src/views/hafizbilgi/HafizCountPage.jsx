import React from "react";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HafizCountPage = () => {
  const data = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Öğrenci",
        data: [620, 710, 790, 860, 940], // örnek öğrenci verisi
        backgroundColor: "#007bff",
        borderRadius: 6,
        barThickness: 40,
      },
      {
        label: "Eğitmen",
        data: [85, 94, 102, 109, 118], // örnek eğitmen verisi
        backgroundColor: "#28a745",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Yıllar",
        },
        stacked: false,
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Kişi Sayısı",
        },
        ticks: {
          stepSize: 100,
        },
      },
    },
  };

  return (
    <>
      <HBSBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">📊 Son 5 Yılda Hizmet Verilen Kişi Sayısı</h4>
                  <p className="mb-0">Aşağıdaki grafik, yıllara göre sistemde aktif olarak hizmet verilen öğrenci ve eğitmen sayılarını göstermektedir.</p>
                </div>
                <div className="card-body" style={{ height: "400px" }}>
                  <Bar data={data} options={options} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HBSBaseFooter />
    </>
  );
};

export default HafizCountPage;
