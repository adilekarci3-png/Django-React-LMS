// CourseDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useUserData from "../plugin/useUserData";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import LectureList from "../partials/CourseDetail/LectureList";
import NoteSection from "../partials/CourseDetail/NoteSection";
import ReviewForm from "../partials/CourseDetail/ReviewForm";
import LecturePlayerModal from "../partials/CourseDetail/LecturePlayerModal";
import ConversationModal from "../partials/CourseDetail/ConversationModal";
import QuestionSection from "../partials/CourseDetail/QuestionSection";
import AskQuestionModal from "../partials/CourseDetail/AskQuestionModal";
import NoteModal from "../partials/CourseDetail/NoteModal";
import "./css/Sidebar.css";

function CourseDetail() {
  const [course, setCourse] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [variantItem, setVariantItem] = useState(null);
  const [showLecture, setShowLecture] = useState(false);
  const [noteModal, setNoteModal] = useState({ show: false, selected: null });
  const [showConversation, setShowConversation] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionModal, setQuestionModal] = useState(false);
  const [qaId, setQaId] = useState(null);
  const api = useAxios();
  const param = useParams();
  const user = useUserData();             // ✅ hook en üstte
  const userId = user?.user_id;           // fetch'te kullanacağız
  const enrollmentId = useParams()?.enrollment_id;

  const fetchCourseDetail = async () => {
    debugger;
    try {
      const res = await api.get(
        `student/course-detail/${userId}/${param.enrollment_id}/`
      );
      setCourse(res.data);
      const percentage =
        (res.data.completed_lesson?.length / res.data.lectures?.length) * 100;
      setCompletionPercentage(percentage?.toFixed(0));
      console.error("Kurs detayı :", res.data);
    } catch (error) {
      console.error("Kurs detayı alınamadı:", error);
    }
  };

 // Mevcut sohbete mesaj gönder
 const handleSendConversationMessage = async (text) => {
   const msg = (text || "").trim();
   if (!msg || !selectedQuestion) return;
   try {
     const payload = {
       course_id: course?.id,
       qa_id: selectedQuestion?.qa_id || selectedQuestion?.id, // thread anahtarı
       message: msg,
     };
     await api.post("student/course-qa/", payload);

     // Gönderimden sonra thread'i tazele ve seçili konuşmayı yeniden eşle
     const res = await api.get(`student/course-detail/${userId}/${param.enrollment_id}/`);
     setCourse(res.data);
     const key = selectedQuestion?.qa_id || selectedQuestion?.id;
     const updated = res.data?.question_answer?.find(
       (q) => (q.qa_id || q.id) === key
     );
     setSelectedQuestion(updated || selectedQuestion);
   } catch (e) {
     console.error("Mesaj gönderilemedi:", e);
   }
 };

  const handleSaveQuestion = async ({ title, message }) => {
    try {
      const payload = {
        course_id: course?.id,     // zorunlu
        message,                   // zorunlu
        title: title || null,      // opsiyonel
      };
      if (qaId) payload.qa_id = qaId;  // sadece mevcut thread varsa ekle

      const { data } = await api.post("student/course-qa/", payload);
      // backend yanıtında qa_id döndürüyoruz (view tarafını buna göre yazmıştık)
      if (!qaId && data?.qa_id) setQaId(data.qa_id);

      setQuestionModal(false);
      fetchCourseDetail();
    } catch (e) {
      console.error("Soru/Mesaj gönderilemedi:", e);
    }
  };

 +useEffect(() => {
  if (userId && param?.enrollment_id) {
    fetchCourseDetail();
  }
  }, [userId, param?.enrollment_id]);

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
                          onOpenConversation={(q) => { setSelectedQuestion(q); setShowConversation(true); }}
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

        show={showConversation}
        question={selectedQuestion}
        onClose={() => setShowConversation(false)}
        refresh={fetchCourseDetail}
      />

      <AskQuestionModal
        show={questionModal}
        handleClose={() => setQuestionModal(false)}
        handleSaveQuestion={handleSaveQuestion}
      />

      <NoteModal
        modal={noteModal}
        setModal={setNoteModal}
        course={course}
        enrollmentId={enrollmentId}
        refresh={fetchCourseDetail}
      />

      <AkademiBaseFooter />
    </>
  );
}

export default CourseDetail;
