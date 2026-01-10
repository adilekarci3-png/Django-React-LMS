import React from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function DashboardLayout({ title, right, children }) {
  return (
    <section className="page-section">
      <div className="container dashboard-container">
        <div className="mb-3">
          <Header />
        </div>

        <div className="row mt-0 mt-md-4">
          {/* Sidebar biraz daraldı */}
          <div className="col-lg-2 col-md-4 mb-4">
            <Sidebar />
          </div>

          {/* İçerik alanı genişletildi */}
          <div className="col-lg-10 col-md-8">
            <div className="dashboard-content">
              <div className="titlebar d-flex flex-wrap justify-content-between align-items-center mb-4">
                <h3 className="text-primary fw-bold m-0">{title}</h3>
                <div>{right}</div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Daha geniş container */
        .dashboard-container {
          max-width: 1400px; /* normal container ~1140px, bu daha geniş */
        }

        .page-section {
          background-color: #f9fafb;
          padding-top: 1rem;
          padding-bottom: 3rem;
        }

        .dashboard-content {
          background: #fff;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
          min-height: 70vh;
        }

        @media (max-width: 991.98px) {
          .dashboard-content {
            padding: 1.25rem;
          }
          .dashboard-container {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

export default DashboardLayout;
export { DashboardLayout };
