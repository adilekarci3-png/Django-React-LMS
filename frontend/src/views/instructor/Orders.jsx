import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

import useAxios from "../../utils/useAxios";
import Useta from "../plugin/UserData";
import { teacherId } from "../../utils/constants";
import UserData from "../plugin/UserData";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    useAxios()
      .get(`teacher/course-order-list/${UserData()?.teacher_id}/`)
      .then((res) => {
        console.log(res.data);
        setOrders(res.data);
      });
  }, []);
  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              {/* Card */}
              <div className="card mb-4">
                {/* Card header */}
                <div className="card-header border-bottom-0">
                  <h3 className="mb-0">Talep Edilen Kurslar</h3>
                  <span>
                    Talep ettiğiniz kurs listesi.
                  </span>
                </div>
                {/* Table */}
                <div className="table-responsive">
                  <table className="table mb-0 text-nowrap table-hover table-centered">
                    <thead className="table-light">
                      <tr>
                        <th>Kurslar</th>
                        <th>Kurs Linki</th>
                        <th>Kursu Talep Eden</th>
                        <th>Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders?.map((o, index) => (
                        <tr>
                          <td>
                            <h5 className="mb-0">
                              <a
                                href="#"
                                className="text-inherit text-decoration-none text-dark"
                              >
                                {o.course.title}
                              </a>
                            </h5>
                          </td>
                          <td>{o.price}</td>
                          <td>#{o.order.oid}</td>
                          <td>{moment(o.date).format("DD MMM, YYYY")}</td>
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

export default Orders;
