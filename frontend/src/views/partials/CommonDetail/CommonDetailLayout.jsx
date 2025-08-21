import React from "react";

import ESKEPBaseHeader from "../ESKEPBaseHeader";
import ESKEPBaseFooter from "../ESKEPBaseFooter";
import Header from "../../ESKEPstajer/Partials/Header";
import Sidebar from "../../ESKEPstajer/Partials/Sidebar";

function CommonDetailLayout({ title, description, date, children }) {
  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <div className="border rounded bg-light p-4 mb-4">
                <h3 className="mb-3">{title}</h3>
                <p><strong>Açıklama:</strong> {description || "—"}</p>
                <p>
                  <strong>Oluşturulma:</strong> {date ? new Date(date).toLocaleString("tr-TR") : "—"}
                </p>
              </div>
              <section className="mt-4">
                <div className="card shadow rounded-2 p-4">
                  {children}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default CommonDetailLayout;
