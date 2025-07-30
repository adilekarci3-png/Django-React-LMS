// CourseDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import LectureList from "../partials/CourseDetail/LectureList";
import NoteSection from "../partials/CourseDetail/NoteSection";
import QuestionSection from "../partials/CourseDetail/QuestionSection";
import ReviewForm from "../partials/CourseDetail/ReviewForm";
import LecturePlayerModal from "../partials/CourseDetail/LecturePlayerModal";
import ConversationModal from "../partials/CourseDetail/ConversationModal";


function CourseDetail() {
  const [course, setCourse] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [variantItem, setVariantItem] = useState(null);
  const [showLecture, setShowLecture] = useState(false);
  const [noteModal, setNoteModal] = useState({ show: false, selected: null });
  const [conversationModal, setConversationModal] = useState({ show: false, selected: null });
  const [questionModal, setQuestionModal] = useState(false);

  const api = useAxios();
  const param = useParams();

  const fetchCourseDetail = async () => {
    try {
      const res = await api.get(
        `student/course-detail/${UserData()?.user_id}/${param.enrollment_id}/`
      );
      setCourse(res.data);
      const percentage =
        (res.data.completed_lesson?.length / res.data.lectures?.length) * 100;
      setCompletionPercentage(percentage?.toFixed(0));
    } catch (error) {
      console.error("Kurs detayı alınamadı:", error);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, []);

  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-2 col-md-3 col-12">
              <Sidebar />
            </div>
            <div className="col-lg-10 col-md-9 col-12">
              <section className="mt-4">
                <div className="card shadow rounded-2">
                  <div className="card-header border-bottom px-4 pt-3 pb-0">
                    <ul className="nav nav-bottom-line" role="tablist">
                      <li className="nav-item me-3">
                        <button className="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-1">
                          Kurs Dersleri
                        </button>
                      </li>
                      <li className="nav-item me-3">
                        <button className="nav-link" data-bs-toggle="pill" data-bs-target="#tab-2">
                          Notlar
                        </button>
                      </li>
                      <li className="nav-item me-3">
                        <button className="nav-link" data-bs-toggle="pill" data-bs-target="#tab-3">
                          Konuşma
                        </button>
                      </li>
                      <li className="nav-item me-3">
                        <button className="nav-link" data-bs-toggle="pill" data-bs-target="#tab-4">
                          Not Ver
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body p-sm-4">
                    <div className="tab-content">
                      <div className="tab-pane fade show active" id="tab-1">
                        <LectureList
                          course={course}
                          completionPercentage={completionPercentage}
                          setShowLecture={setShowLecture}
                          setVariantItem={setVariantItem}
                          refresh={fetchCourseDetail}
                        />
                      </div>
                      <div className="tab-pane fade" id="tab-2">
                        <NoteSection
                          course={course}
                          modal={noteModal}
                          setModal={setNoteModal}
                          refresh={fetchCourseDetail}
                        />
                      </div>
                      <div className="tab-pane fade" id="tab-3">
                        <QuestionSection
                          course={course}
                          setModal={setConversationModal}
                          openAskModal={() => setQuestionModal(true)}
                          refresh={fetchCourseDetail}
                        />
                      </div>
                      <div className="tab-pane fade" id="tab-4">
                        <ReviewForm
                          course={course}
                          refresh={fetchCourseDetail}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <LecturePlayerModal
        show={showLecture}
        onClose={() => setShowLecture(false)}
        variantItem={variantItem}
      />

      <ConversationModal
        modal={conversationModal}
        setModal={setConversationModal}
        refresh={fetchCourseDetail}
      />

      {/* Add question modal */}
      {/* Note edit modal */}
      {/* Bunlar da ayrı bileşen olarak eklenebilir */}

      <AkademiBaseFooter />
    </>
  );
}

export default CourseDetail;
