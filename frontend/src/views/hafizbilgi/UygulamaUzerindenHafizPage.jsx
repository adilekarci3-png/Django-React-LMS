import React from 'react';
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const UygulamaUzerindenHafizPage = () => {
  const data = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
      label: 'Uygulama Üzerinden Hafız Olanlar',
      data: [20, 60, 120, 200, 280],
      backgroundColor: '#007bff',
      borderRadius: 6,
      barThickness: 40
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Yıllar'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hafız Sayısı'
        }
      }
    }
  };

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">📊 Uygulama Üzerinden Hafız Olanlar</h4>
                  <p className="mb-0">Bu grafik, uygulama aracılığıyla hafız olan kişilerin yıllara göre dağılımını gösterir.</p>
                </div>
                <div className="card-body" style={{ height: "400px" }}>
                  <Bar data={data} options={options} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
};

export default UygulamaUzerindenHafizPage;
