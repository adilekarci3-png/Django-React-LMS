import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";
import moment from "moment";

import LectureModal from "../partials/CourseDetail/LectureModal";
import NoteModal from "../partials/CourseDetail/NoteModal";
import ConversationModal from "../partials/CourseDetail/ConversationModal";
import AskQuestionModal from "../partials/CourseDetail/AskQuestionModal";

import NotesTab from "../partials/CourseDetail/NotesTab";
import DiscussionTab from "../partials/CourseDetail/DiscussionTab";
import ReviewTab from "../partials/CourseDetail/ReviewTab";
import LecturesTab from "../partials/CourseDetail/LecturesTab";
import { Spinner } from "react-bootstrap";

function EskepInstructorCourseDetail() {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState([]);
  const [variantItem, setVariantItem] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState({});
  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null);
  const [createMessage, setCreateMessage] = useState({
    title: "",
    message: "",
  });
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState([]);
  const user = useUserData();
  const param = useParams();
  const lastElementRef = useRef();
  const api = useAxios();
  // Play Lecture Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (variant_item) => {
    setShow(true);
    setVariantItem(variant_item);
  };

  const [noteShow, setNoteShow] = useState(false);
  const handleNoteClose = () => setNoteShow(false);
  const handleNoteShow = (note) => {
    setNoteShow(true);
    setSelectedNote(note);
  };

  const [ConversationShow, setConversationShow] = useState(false);
  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = (converation) => {
    setConversationShow(true);
    setSelectedConversation(converation);
  };

  const [addQuestionShow, setAddQuestionShow] = useState(false);
  const handleQuestionClose = () => setAddQuestionShow(false);
  const handleQuestionShow = () => setAddQuestionShow(true);

  const fetchCourseDetail = async () => {
    debugger;
    setLoading(true);
    try {
      const res = await api.get(`student/course-detail/${user?.user_id}/${param.enrollment_id}/`);
      console.log("DETAY VERİ:", res.data);
      setCourse(res.data);
      setQuestions(res.data.question_answer);
      setStudentReview(res.data.review);
      debugger;
      const completed = res.data.completed_lesson?.length || 0;
      const total = Array.isArray(res.data.lectures) ? res.data.lectures.length : 0;
      const percentageCompleted = total > 0 ? (completed / total) * 100 : 0;
      setCompletionPercentage(percentageCompleted.toFixed(0));
    } catch (error) {
      console.error("Kurs verisi alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.user_id && param.enrollment_id) {
      fetchCourseDetail();
    }
  }, [user?.user_id, param.enrollment_id]);

  console.log(createReview?.rating);
  // console.log(studentReview);
  const handleMarkLessonAsCompleted = (variantItemId) => {
    debugger;
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus({
      ...markAsCompletedStatus,
      [key]: "Updating",
    });

    const formdata = new FormData();
    debugger;
    formdata.append("user_id", user?.user_id || 0);
    formdata.append("course_id", course.course);
    formdata.append("variant_item_id", variantItemId.variant_item_id);

    api.post(`student/course-completed/`, formdata).then((res) => {
      debugger;
      fetchCourseDetail();
      setMarkAsCompletedStatus({
        ...markAsCompletedStatus,
        [key]: "Updated",
      });
    });
  };

  const handleNoteChange = (event) => {
    setCreateNote({
      ...createNote,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmitCreateNote = async (e) => {
    e.preventDefault();
    const formdata = new FormData();

    formdata.append("user_id", user?.user_id);
    formdata.append("enrollment_id", param.enrollment_id);
    formdata.append("title", createNote.title);
    formdata.append("note", createNote.note);

    try {
      await api.post(`student/course-note/${user?.user_id}/${param.enrollment_id}/`, formdata).then((res) => {
        fetchCourseDetail();
        handleNoteClose(); // modal kapanıyor
        Toast().fire({
          icon: "success",
          title: "Note created",
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitEditNote = (e, noteId) => {
    e.preventDefault();
    const formdata = new FormData();

    formdata.append("user_id", user?.user_id);
    formdata.append("enrollment_id", param.enrollment_id);
    formdata.append("title", createNote.title || selectedNote?.title);
    formdata.append("note", createNote.note || selectedNote?.note);

    api.patch(`student/course-note-detail/${user?.user_id}/${param.enrollment_id}/${noteId}/`, formdata).then((res) => {
      fetchCourseDetail();
      Toast().fire({
        icon: "success",
        title: "Note updated",
      });
    });
  };

  const handleDeleteNote = (noteId) => {
    api.delete(`student/course-note-detail/${user?.user_id}/${param.enrollment_id}/${noteId}/`).then((res) => {
      fetchCourseDetail();
      Toast().fire({
        icon: "success",
        title: "Note deleted",
      });
    });
  };

  const handleMessageChange = (event) => {
    setCreateMessage({
      ...createMessage,
      [event.target.name]: event.target.value,
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const formdata = new FormData();

    formdata.append("course_id", course?.id);
    formdata.append("user_id", user?.user_id);
    formdata.append("title", createMessage.title);
    formdata.append("message", createMessage.message);

    await api.post(`student/question-answer-list-create/${course?.id}/`, formdata).then((res) => {
      fetchCourseDetail();
      handleQuestionClose();
      Toast().fire({
        icon: "success",
        title: "Question sent",
      });
    });
  };

  const sendNewMessage = async (e) => {
    e.preventDefault();
debugger;
    const courseId = course?.id;
    const userId = user?.user_id;
    const qaId = selectedConversation?.qa_id;
    const messageText = createMessage?.message;

    if (!courseId || !userId || !qaId || !messageText?.trim()) {
      alert("Tüm alanları doldurun!");
      return;
    }

    const formdata = new FormData();
    formdata.append("course_id", courseId);
    formdata.append("user_id", userId);
    formdata.append("qa_id", qaId);
    formdata.append("message", messageText);

    try {
      const res = await api.post(`student/question-answer-message-create/`, formdata);
      setSelectedConversation(res.data.question);
    } catch (err) {
      console.error("Hata:", err.response?.data || err.message);
    }
  };


  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchCourseDetail();
    } else {
      const filtered = questions?.filter((question) => {
        return question.title.toLowerCase().includes(query);
      });
      setQuestions(filtered);
    }
  };

  const handleReviewChange = (event) => {
    setCreateReview({
      ...createReview,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateReviewSubmit = (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("course_id", course?.id);
    formdata.append("user_id", user?.user_id);
    formdata.append("rating", createReview?.rating);
    formdata.append("review", createReview?.review);
    debugger;
    api.post(`student/rate-course/`, formdata).then((res) => {
      console.log(res.data);
      fetchCourseDetail();
      Toast().fire({
        icon: "success",
        title: "Review created",
      });
    });
  };

  const handleUpdateReviewSubmit = (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("course", course?.id);
    formdata.append("user", user?.user_id);
    formdata.append("rating", createReview?.rating || studentReview?.rating);
    formdata.append("review", createReview?.review || studentReview?.review);

    api.patch(`student/review-detail/${user?.user_id}/${studentReview?.id}/`, formdata).then((res) => {
      console.log(res.data);
      fetchCourseDetail();
      Toast().fire({
        icon: "success",
        title: "Review updated",
      });
    });
  };
  // if (!course || !course.curriculum) {
  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <div className="col-lg-3 col-md-4">
              <Sidebar />
            </div>
            <div className="col-lg-9 col-md-8 col-12">
              {/* <section className="bg-blue py-7">
                <div className="container">
                  <ReactPlayer url='https://www.youtube.com/watch?v=LXb3EKWsInQ' width={"100%"} height={600} />
                </div>
              </section> */}

              <section className="mt-4">
                <div className="container">
                  <div className="row">
                    {/* Main content START */}
                    <div className="col-12">
                      <div className="card shadow rounded-2 p-0 mt-n5">
                        {/* Tabs START */}
                        <div className="card-header border-bottom px-4 pt-3 pb-0">
                          <ul className="nav nav-bottom-line py-0" id="course-pills-tab" role="tablist">
                            {/* Tab item */}
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button className="nav-link mb-2 mb-md-0 active" id="course-pills-tab-1" data-bs-toggle="pill" data-bs-target="#course-pills-1" type="button" role="tab" aria-controls="course-pills-1" aria-selected="true">
                                Kurs Dersleri
                              </button>
                            </li>
                            {/* Tab item */}
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button className="nav-link mb-2 mb-md-0" id="course-pills-tab-2" data-bs-toggle="pill" data-bs-target="#course-pills-2" type="button" role="tab" aria-controls="course-pills-2" aria-selected="false">
                                Not Defteri
                              </button>
                            </li>
                            {/* Tab item */}
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button className="nav-link mb-2 mb-md-0" id="course-pills-tab-3" data-bs-toggle="pill" data-bs-target="#course-pills-3" type="button" role="tab" aria-controls="course-pills-3" aria-selected="false">
                                Müzakere
                              </button>
                            </li>

                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button className="nav-link mb-2 mb-md-0" id="course-pills-tab-4" data-bs-toggle="pill" data-bs-target="#course-pills-4" type="button" role="tab" aria-controls="course-pills-4" aria-selected="false">
                                Fikir Beyan Et :)
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* Tabs END */}
                        {/* Tab contents START */}
                        <div className="card-body p-sm-4">
                          <div className="tab-content" id="course-pills-tabContent">
                            {/* Content START */}
                            <div className="tab-pane fade show active" id="course-pills-1" role="tabpanel" aria-labelledby="course-pills-tab-1">
                              {/* Accordion START */}
                              {loading ? (
                                <div className="text-center py-5">
                                  <Spinner animation="border" variant="primary" />
                                  <div className="mt-2">Kurs verileri yükleniyor...</div>
                                </div>
                              ) : (
                                <LecturesTab
                                  course={course}
                                  handleShow={handleShow}
                                  handleMarkLessonAsCompleted={handleMarkLessonAsCompleted}
                                />
                              )}

                              {/* Accordion END */}
                            </div>

                            <NotesTab
                              course={course}
                              handleNoteShow={handleNoteShow}
                              handleDeleteNote={handleDeleteNote}
                              handleNoteChange={handleNoteChange}
                              handleSubmitCreateNote={handleSubmitCreateNote}
                            />
                            <DiscussionTab
                              questions={questions}
                              handleSearchQuestion={handleSearchQuestion}
                              handleQuestionShow={handleQuestionShow}
                              handleConversationShow={handleConversationShow}
                            />
                            <ReviewTab
                              studentReview={studentReview}
                              course={course}
                              createReview={createReview}
                              handleReviewChange={handleReviewChange}
                              handleCreateReviewSubmit={handleCreateReviewSubmit}
                              handleUpdateReviewSubmit={handleUpdateReviewSubmit}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <LectureModal
        show={show}
        handleClose={handleClose}
        variantItem={variantItem}
      />

      <NoteModal
        show={noteShow}
        onClose={handleNoteClose}
        selectedNote={selectedNote}
        onCreate={(e, data) => handleSubmitCreateNote(e, data)}
        onSubmit={(e, id, data) => handleSubmitEditNote(e, id, data)}
        onDelete={handleDeleteNote}
      />
      <ConversationModal
        show={ConversationShow}
        handleClose={handleConversationClose}
        selectedConversation={selectedConversation}
        handleMessageChange={handleMessageChange}
        sendNewMessage={sendNewMessage}
      />

      <AskQuestionModal
        show={addQuestionShow}
        handleClose={handleQuestionClose}
        handleMessageChange={handleMessageChange}
        handleSaveQuestion={handleSaveQuestion}
      />

      <ESKEPBaseFooter />

    </>
  );
  // }
}

export default EskepInstructorCourseDetail;

