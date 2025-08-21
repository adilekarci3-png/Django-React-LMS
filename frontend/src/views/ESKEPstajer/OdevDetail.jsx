import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import OdevFileTab from "../partials/OdevDetails/OdevFileTab";
import OdevStatusTab from "../partials/OdevDetails/OdevLecturesTab";
import OdevChatTab from "../partials/OdevDetails/OdevChatTab";
import OdevNotesTab from "../partials/OdevDetails/OdevNotesTab";
import OdevReviewTab from "../partials/OdevDetails/OdevReviewTab";

// Tab bileşenleri


function OdevDetail() {
  const [odev, setOdev] = useState([]);
  const param = useParams();
  const [studentReview, setStudentReview] = useState(null);
  const user = useUserData();

  const fetchOdevDetail = async () => {
    useAxios()
      .get(`eskepstajer/odev-detail/${user?.user_id}/${param.id}/`)
      .then((res) => {

        setOdev(res.data);
        setStudentReview(res.data.review || null);
      });
  };

  useEffect(() => {
    fetchOdevDetail();
  }, []);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              {/* ÖDEV ÖZET PANELİ - TEPESİNDE */}
              <div className="border rounded bg-light p-4 mb-4">
                <h3 className="mb-3">{odev?.title || "Ödev Başlığı"}</h3>
                <p><strong>Açıklama:</strong> {odev?.description || "—"}</p>
                <p><strong>Dil:</strong> {odev?.language || "—"}</p>
                <p><strong>Seviye:</strong> {odev?.level || "—"}</p>
                <p>
                  <strong>Ekleyen:</strong> {odev?.inserteduser?.full_name || "—"}{" "}
                  ({odev?.inserteduser?.email || "—"})
                </p>
                <p>
                  <strong>Oluşturulma:</strong> {odev?.date ? new Date(odev.date).toLocaleString("tr-TR") : "—"}
                </p>
              </div>
              <section className="mt-4">
                <div className="card shadow rounded-2 p-4">
                  <ul className="nav nav-tabs mb-4" id="odevTabs" role="tablist">
                    <li className="nav-item">
                      <button
                        className="nav-link active"
                        id="course-pills-tab-1"
                        data-bs-toggle="pill"
                        data-bs-target="#course-pills-1"
                        type="button"
                        role="tab"
                      >
                        Durum
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pdf-tab" data-bs-toggle="tab" data-bs-target="#pdfs" type="button" role="tab">
                        PDF Dosyaları
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes" type="button" role="tab">
                        Notlar
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="chat-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#chat"
                        type="button"
                        role="tab"
                      >
                        Konuşma
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="review-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#review"
                        type="button"
                        role="tab"
                      >
                        Not Ver
                      </button>
                    </li>
                  </ul>

                  <div className="tab-content" id="odevTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="course-pills-1"
                      role="tabpanel"
                      aria-labelledby="course-pills-tab-1"
                    >
                      <OdevStatusTab odev={odev} />
                    </div>
                    <div className="tab-pane fade" id="pdfs" role="tabpanel">
                      <OdevFileTab curriculum={odev?.curriculum} />
                    </div>
                    <div className="tab-pane fade" id="notes" role="tabpanel">
                      <OdevNotesTab
                        odev={odev}
                        id={param.id}
                        fetchOdevDetail={fetchOdevDetail}
                      />
                    </div>
                    <div className="tab-pane fade" id="chat" role="tabpanel">
                      <OdevChatTab odev={odev} fetchOdevDetail={fetchOdevDetail} />
                    </div>
                    <div className="tab-pane fade" id="review" role="tabpanel">
                      <OdevReviewTab
                        odev={odev}
                        studentReview={studentReview}
                        fetchOdevDetail={fetchOdevDetail}
                      />
                    </div>
                  </div>
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

export default OdevDetail;
