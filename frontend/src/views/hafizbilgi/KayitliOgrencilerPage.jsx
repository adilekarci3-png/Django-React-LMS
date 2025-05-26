import React from 'react';
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import { Doughnut } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const KayitliOgrencilerPage = () => {
  const data = {
    labels: ['Hafızlar', 'Hafızlık Öğrencileri'],
    datasets: [{
      data: [820, 1350],
      backgroundColor: ['#17a2b8', '#ffc107'],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
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
                <div className="card-header bg-info text-white">
                  <h4 className="mb-0">🧑‍🎓 Kayıtlı Hafız ve Öğrenciler</h4>
                  <p className="mb-0">Uygulamaya kayıtlı hafızlar ve hafızlık öğrencilerinin oranını gösterir.</p>
                </div>
                <div className="card-body" style={{ height: "400px" }}>
                  <Doughnut data={data} options={options} />
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

export default KayitliOgrencilerPage;
