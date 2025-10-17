// src/views/layouts/DashboardLayout.jsx
import React from "react";

// layout konumuna göre Sidebar/Header yolları:
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function DashboardLayout({ title, right, children }) {
  return (
    <section className="page-section">
      <div className="container">
        <div className="mb-3">
          <Header />
        </div>

        <div className="row mt-0 mt-md-4">
          <div className="col-lg-3 col-md-4 mb-4">
            <Sidebar />
          </div>

          <div className="col-lg-9 col-md-8">
            <div className="dashboard-content">
              <div className="titlebar">
                <h3 className="text-primary fw-bold">{title}</h3>
                <div>{right}</div>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardLayout;     // ⬅️ default export VAR
export { DashboardLayout };         // (opsiyonel named export)
