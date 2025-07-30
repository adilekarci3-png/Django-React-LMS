import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import moment from "moment";
import useAxios from "../../utils/useAxios";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function HBSTemsilciDashboard() {
  const api = useAxios();
  const [stats, setStats] = useState({});
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    api.get("/hbstem/dashboard/summary/").then((res) => {
      setStats(res.data.stats);
      setRecentAssignments(res.data.recent_assignments);
      setAlerts(res.data.alerts);
      setChartData(res.data.assignments_chart);
    });
  }, []);

  const barData = {
    labels: chartData.map((item) => item.egitmen),
    datasets: [
      {
        label: "Hafız Sayısı",
        data: chartData.map((item) => item.hafiz_sayisi),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-4"><i className="bi bi-people-fill me-2"></i>HBSTemsilci Panel</h4>

              {/* Sayısal Kartlar */}
              <div className="row mb-4">
                {[
                  { label: "Toplam Hafız", value: stats.total_hafiz, icon: "fas fa-user", color: "info" },
                  { label: "Toplam Eğitmen", value: stats.total_egitmen, icon: "fas fa-chalkboard-teacher", color: "success" },
                  { label: "Atanmış Hafız", value: stats.assigned_hafiz, icon: "fas fa-link", color: "warning" },
                  { label: "Bugünkü Ders", value: stats.today_lessons, icon: "fas fa-calendar-day", color: "danger" },
                ].map((item, index) => (
                  <div key={index} className="col-sm-6 col-lg-3 mb-3">
                    <div className={`d-flex align-items-center p-4 bg-${item.color} bg-opacity-10 rounded-3`}>
                      <span className={`display-6 lh-1 text-${item.color} mb-0`}>
                        <i className={`${item.icon}`} />
                      </span>
                      <div className="ms-4">
                        <h5 className="mb-0 fw-bold">{item.value}</h5>
                        <p className="mb-0 h6 fw-light">{item.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grafik */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Eğitmen Başına Hafız Dağılımı</h5>
                </div>
                <div className="card-body">
                  <Bar data={barData} height={120} />
                </div>
              </div>

              {/* Uyarılar */}
              <div className="card mb-4">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">⚠️ Uyarılar</h5>
                </div>
                <div className="card-body">
                  {alerts.length > 0 ? (
                    <ul className="mb-0">
                      {alerts.map((alert, i) => (
                        <li key={i}>{alert.message}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Her şey yolunda görünüyor.</p>
                  )}
                </div>
              </div>

              {/* Son Atamalar */}
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Son Hafız - Eğitmen Atamaları</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Hafız</th>
                        <th>Eğitmen</th>
                        <th>Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssignments.map((item, index) => (
                        <tr key={index}>
                          <td>{item.hafiz_name}</td>
                          <td>{item.egitmen_name}</td>
                          <td>{moment(item.date).format("DD MMM YYYY")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default HBSTemsilciDashboard;
