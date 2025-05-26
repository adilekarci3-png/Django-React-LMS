import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import moment from "moment";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
// import '../css/modernAccordion.css';
import "./css/modernAccordion.css";

function KitapTahliliDetail() {
  const [kitapTahlili, setKitapTahlili] = useState([]);
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

  const param = useParams();
  const lastElementRef = useRef(null);
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

  const fetchKitapTahliliDetail = async () => {
    try {
      debugger;
      //const { kitaptahlili_id } = param.kitaptahlili_id; // URL parametresinden al
      const response = await useAxios().get(
        `eskepinstructor/kitaptahlili-detail/${param.kitaptahlili_id}/${UserData()?.user_id}/`
      );

      const data = response.data;
      setKitapTahlili(data);
      setQuestions(data.question_answers);
      setStudentReview(data.review);
      console.log(kitapTahlili);
      debugger;
      // setVariantItem eksik, örnek olarak aşağıya ekliyorum:
      // setVariantItem(data.variant_item || null);
      const completed = data.completed_lesson?.length || 0;
      const total = data.lectures?.length || 1; // sıfıra bölünme hatasını engelle

      const percentageCompleted = (completed / total) * 100;
      setCompletionPercentage(percentageCompleted.toFixed(0));
    } catch (error) {
      console.error("Ödev detayları alınırken hata oluştu:", error);
    }
  };
  useEffect(() => {
    fetchKitapTahliliDetail();
  }, []);

  //console.log(createReview?.rating);
  // console.log(studentReview);
  const handleMarkLessonAsCompleted = (variantItemId) => {
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus({
      ...markAsCompletedStatus,
      [key]: "Updating",
    });

    const formdata = new FormData();
    formdata.append("user_id", UserData()?.user_id || 0);
    formdata.append("kitaptahlili_id", kitapTahlili.kitapTahlili?.id);
    formdata.append("variant_item_id", variantItemId);

    useAxios()
      .post(`instructor/kitaptahlili-completed/`, formdata)
      .then((res) => {
        fetchKitapTahliliDetail();
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
    debugger;
    console.log(UserData());
    formdata.append("koordinator_id", UserData()?.user_id);
    formdata.append("kitaptahlili_id", param.kitaptahlili_id);
    formdata.append("title", createNote.title);
    formdata.append("note", createNote.note);

    try {
      await useAxios()
        .post(
          `eskepinstructor/kitaptahlili-note/${param.kitaptahlili_id}/${UserData()?.user_id}/`,
          formdata
        )
        .then((res) => {
          fetchKitapTahliliDetail();
          handleNoteClose();
          Toast().fire({
            icon: "success",
            title: "Not Eklendi",
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitEditNote = (e, noteId) => {
    e.preventDefault();
    const formdata = new FormData();

    formdata.append("user_id", UserData()?.user_id);
    formdata.append("koordinator_id", param.koordinator_id);
    formdata.append("title", createNote.title || selectedNote?.title);
    formdata.append("note", createNote.note || selectedNote?.note);

    useAxios()
      .patch(
        `eskepinstructor/kitaptahlili-note-detail/${param.kitaptahlili_id}/${UserData()?.user_id}/${noteId}/`,
        formdata
      )
      .then((res) => {
        fetchKitapTahliliDetail();
        Toast().fire({
          icon: "success",
          title: "Not Güncellendi",
        });
      });
  };

  const handleDeleteNote = (noteId) => {
    useAxios()
      .delete(
        `eskepinstructor/kitaptahlili-note-detail/${param.kitapTahlili_id}/${UserData()?.user_id}/${noteId}/`
      )
      .then((res) => {
        fetchKitapTahliliDetail();
        Toast().fire({
          icon: "success",
          title: "Not Silindi",
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

    formdata.append("kitaptahlili_id", param.kitaptahlili_id);
    formdata.append("gonderen_id", UserData()?.user_id);
    //formdata.append("koordinator_id", UserData()?.user_id);
    formdata.append("title", createMessage.title);
    formdata.append("message", createMessage.message);
    debugger;
    await useAxios()
      .post(
        `eskepinstructor/question-answer-list-create/${param.kitaptahlili_id}/`,
        formdata
      )
      .then((res) => {
        debugger;
        fetchKitapTahliliDetail();
        handleQuestionClose();
        Toast().fire({
          icon: "success",
          title: "Mesaj Gönderildi",
        });
      });
  };

  const sendNewMessage = async (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("kitaptahlili_id", param.kitaptahlili_id);
    formdata.append("gonderen_id", UserData()?.user_id);
    //formdata.append("koordinator_id", UserData()?.user_id);
    formdata.append("title", createMessage.title);
    formdata.append("message", createMessage.message);
    debugger;
    useAxios()
      .post(`eskepinstructor/question-answer-message-create/`, formdata)
      .then((res) => {
        debugger;
        setSelectedConversation(res.data.question);
      });
  };

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchKitapTahliliDetail();
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
    formdata.append("kitaptahlili_id", kitapTahlili.kitapTahlili?.id);
    formdata.append("user_id", UserData()?.user_id);
    formdata.append("rating", createReview.rating);
    formdata.append("review", createReview.review);

    useAxios()
      .post(`stajer/rate-kitaptahlili/`, formdata)
      .then((res) => {
        console.log(res.data);
        fetchKitapTahliliDetail();
        Toast().fire({
          icon: "success",
          title: "Yorum Oluştur",
        });
      });
  };

  const handleUpdateReviewSubmit = (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("kitapTahlili", kitapTahlili.kitapTahlili?.id);
    formdata.append("user", UserData()?.user_id);
    formdata.append("rating", createReview.rating || studentReview?.rating);
    formdata.append("review", createReview.review || studentReview?.review);

    useAxios()
      .patch(
        `stajer/review-detail/${UserData()?.user_id}/${studentReview?.id}/`,
        formdata
      )
      .then((res) => {
        console.log(res.data);
        fetchKitapTahliliDetail();
        Toast().fire({
          icon: "success",
          title: "Yorum Güncelle",
        });
      });
  };

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
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
                          <ul
                            className="nav nav-bottom-line py-0"
                            id="course-pills-tab"
                            role="tablist"
                          >
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0 active"
                                id="course-pills-tab-1"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-1"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-1"
                                aria-selected="true"
                              >
                                Ödev Bölümleri
                              </button>
                            </li>
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-2"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-2"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-2"
                                aria-selected="false"
                              >
                                Notlar
                              </button>
                            </li>
                            {/* Tab item */}
                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-3"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-3"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-3"
                                aria-selected="false"
                              >
                                Konuşma
                              </button>
                            </li>

                            <li
                              className="nav-item me-2 me-sm-4"
                              role="presentation"
                            >
                              <button
                                className="nav-link mb-2 mb-md-0"
                                id="course-pills-tab-4"
                                data-bs-toggle="pill"
                                data-bs-target="#course-pills-4"
                                type="button"
                                role="tab"
                                aria-controls="course-pills-4"
                                aria-selected="false"
                              >
                                Not Ver
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* Tabs END */}
                        {/* Tab contents START */}
                        <div className="card-body p-sm-4">
                          <div
                            className="tab-content"
                            id="course-pills-tabContent"
                          >
                            {/* Content START */}
                            <div
                              className="tab-pane fade show active"
                              id="course-pills-1"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-1"
                            >
                              {/* Accordion START */}
                              <div
                                className="accordion modern-accordion"
                                id="accordionExample2"
                              >
                                {kitapTahlili?.curriculum?.map((c, index) => (
                                  <div
                                    className="accordion-item modern-item mb-3"
                                    key={index}
                                  >
                                    <h2
                                      className="accordion-header"
                                      id={`heading-${index}`}
                                    >
                                      <button
                                        className="accordion-button modern-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse-${c.variant_id}`}
                                        aria-expanded="false"
                                        aria-controls={`collapse-${c.variant_id}`}
                                      >
                                        <span className="fw-bold">
                                          {c.title}
                                        </span>
                                        <span className="badge bg-secondary ms-2">
                                          {c.variant_items?.length} Ders
                                        </span>
                                      </button>
                                    </h2>
                                    <div
                                      id={`collapse-${c.variant_id}`}
                                      className="accordion-collapse collapse"
                                      aria-labelledby={`heading-${index}`}
                                      data-bs-parent="#accordionExample2"
                                    >
                                      <div className="accordion-body">
                                        {c.variant_items?.map((l, idx) => (
                                          <div
                                            key={idx}
                                            className="lesson-item"
                                          >
                                            <div>
                                              <strong>
                                                {l.title || `Ders ${idx + 1}`}
                                              </strong>
                                              <br />
                                              {l.file ? (
                                                <a
                                                  href={l.file}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  PDF'yi Görüntüle
                                                </a>
                                              ) : (
                                                <span className="text-muted">
                                                  PDF mevcut değil
                                                </span>
                                              )}
                                            </div>
                                            <div className="lesson-info">
                                              <span className="text-muted">
                                                {l.content_duration || "0m 0s"}
                                              </span>
                                              <input
                                                type="checkbox"
                                                className="form-check-input"
                                                onChange={() =>
                                                  handleMarkLessonAsCompleted(
                                                    l.variant_item_id
                                                  )
                                                }
                                                checked={kitapTahlili.completed_lesson?.some(
                                                  (cl) =>
                                                    cl.variant_item.id === l.id
                                                )}
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Accordion END */}
                            </div>

                            <div
                              className="tab-pane fade"
                              id="course-pills-2"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-2"
                            >
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3">
                                  <div className="d-sm-flex justify-content-between align-items-center">
                                    <h4 className="mb-0 p-3">Tüm Notlar</h4>
                                    {/* Add Note Modal */}
                                    <button
                                      type="button"
                                      className="btn btn-primary me-3"
                                      data-bs-toggle="modal"
                                      data-bs-target="#exampleModal"
                                    >
                                      Not Ekle <i className="fas fa-pen"></i>
                                    </button>
                                    <div
                                      className="modal fade"
                                      id="exampleModal"
                                      tabIndex={-1}
                                      aria-labelledby="exampleModalLabel"
                                      aria-hidden="true"
                                    >
                                      <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                          <div className="modal-header">
                                            <h5
                                              className="modal-title"
                                              id="exampleModalLabel"
                                            >
                                              Yeni Not Ekle{" "}
                                              <i className="fas fa-pen"></i>
                                            </h5>
                                            <button
                                              type="button"
                                              className="btn-close"
                                              data-bs-dismiss="modal"
                                              aria-label="Kapat"
                                            />
                                          </div>
                                          <div className="modal-body">
                                            <form
                                              onSubmit={handleSubmitCreateNote}
                                            >
                                              <div className="mb-3">
                                                <label
                                                  htmlFor="exampleInputEmail1"
                                                  className="form-label"
                                                >
                                                  Not Başlığı
                                                </label>
                                                <input
                                                  type="text"
                                                  className="form-control"
                                                  name="title"
                                                  onChange={handleNoteChange}
                                                />
                                              </div>
                                              <div className="mb-3">
                                                <label
                                                  htmlFor="exampleInputPassword1"
                                                  className="form-label"
                                                >
                                                  İçerik
                                                </label>
                                                <textarea
                                                  className="form-control"
                                                  id=""
                                                  cols="30"
                                                  rows="10"
                                                  name="note"
                                                  onChange={handleNoteChange}
                                                ></textarea>
                                              </div>
                                              <button
                                                type="button"
                                                className="btn btn-secondary me-2"
                                                data-bs-dismiss="modal"
                                              >
                                                <i className="fas fa-arrow-left"></i>{" "}
                                                Kapat
                                              </button>
                                              <button
                                                type="submit"
                                                className="btn btn-primary"
                                              >
                                                Notu Kaydet{" "}
                                                <i className="fas fa-check-circle"></i>
                                              </button>
                                            </form>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="card-body p-0 pt-3">
                                  {/* Note item start */}
                                  {kitapTahlili?.notes?.map((n, index) => (
                                    <div className="row g-4 p-3">
                                      <div className="col-sm-11 col-xl-11 shadow p-3 m-3 rounded">
                                        <h5> {n.title}</h5>
                                        <p>{n.notes}</p>
                                        {/* Buttons */}
                                        <div className="hstack gap-3 flex-wrap">
                                          <a
                                            onClick={() => handleNoteShow(n)}
                                            className="btn btn-success mb-0"
                                          >
                                            <i className="bi bi-pencil-square me-2" />{" "}
                                            Düzenle
                                          </a>
                                          <a
                                            onClick={() =>
                                              handleDeleteNote(n.id)
                                            }
                                            className="btn btn-danger mb-0"
                                          >
                                            <i className="bi bi-trash me-2" />{" "}
                                            Sil
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {kitapTahlili?.notes?.length < 1 && (
                                    <p className="mt-3 p-3">Not Bulunamadı</p>
                                  )}
                                  <hr />
                                </div>
                              </div>
                            </div>
                            <div
                              className="tab-pane fade"
                              id="course-pills-3"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-3"
                            >
                              <div className="card">
                                {/* Card header */}
                                <div className="card-header border-bottom p-0 pb-3">
                                  {/* Title */}
                                  <h4 className="mb-3 p-3">Konuşma</h4>
                                  <form className="row g-4 p-3">
                                    {/* Search */}
                                    <div className="col-sm-6 col-lg-9">
                                      <div className="position-relative">
                                        <input
                                          className="form-control pe-5 bg-transparent"
                                          type="search"
                                          placeholder="Ara"
                                          aria-label="Ara"
                                          onChange={handleSearchQuestion}
                                        />
                                        <button
                                          className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                                          type="submit"
                                        >
                                          <i className="fas fa-search fs-6 " />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-3">
                                      <a
                                        onClick={handleQuestionShow}
                                        className="btn btn-primary mb-0 w-100"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modalCreatePost"
                                      >
                                        Soru Sor
                                      </a>
                                    </div>
                                  </form>
                                </div>
                                {/* Card body */}
                                <div className="card-body p-0 pt-3">
                                  <div className="vstack gap-3 p-3">
                                    {/* Question item START */}
                                    {questions?.map((q, index) => (
                                      <div
                                        className="shadow rounded-3 p-3"
                                        key={index}
                                      >
                                        <div className="d-sm-flex justify-content-sm-between mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="avatar avatar-sm flex-shrink-0">
                                              <img
                                                src={q.profile.image}
                                                className="avatar-img rounded-circle"
                                                alt="avatar"
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  borderRadius: "50%",
                                                  objectFit: "cover",
                                                }}
                                              />
                                            </div>
                                            <div className="ms-2">
                                              <h6 className="mb-0">
                                                <a
                                                  href="#"
                                                  className="text-decoration-none text-dark"
                                                >
                                                  {q.profile.full_name}
                                                </a>
                                              </h6>
                                              <small>
                                                {moment(q.date).format(
                                                  "DD MMM, YYYY"
                                                )}
                                              </small>
                                            </div>
                                          </div>
                                        </div>
                                        <h5>{q.title}</h5>
                                        <button
                                          className="btn btn-primary btn-sm mb-3 mt-3"
                                          onClick={() =>
                                            handleConversationShow(q)
                                          }
                                        >
                                          Konuşmaya Katıl{" "}
                                          <i className="fas fa-arrow-right"></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              className="tab-pane fade"
                              id="course-pills-4"
                              role="tabpanel"
                              aria-labelledby="course-pills-tab-4"
                            >
                              <div className="card">
                                {/* Card header */}
                                <div className="card-header border-bottom p-0 pb-3">
                                  {/* Title */}
                                  <h4 className="mb-3 p-3">
                                    {studentReview?.rating && (
                                      <p>Not Ver {studentReview.rating}</p>
                                    )}
                                  </h4>
                                  <div className="mt-2">
                                    {!studentReview && (
                                      <form
                                        className="row g-3 p-3"
                                        onSubmit={handleCreateReviewSubmit}
                                      >
                                        {/* Rating */}
                                        <div className="col-12 bg-light-input">
                                          <select
                                            id="inputState2"
                                            className="form-select js-choice"
                                            onChange={handleReviewChange}
                                            name="rating"
                                            defaultValue={
                                              studentReview?.rating || 0
                                            }
                                          >
                                            <option value={1}>
                                              ★☆☆☆☆ (1/5)
                                            </option>
                                            <option value={2}>
                                              ★★☆☆☆ (2/5)
                                            </option>
                                            <option value={3}>
                                              ★★★☆☆ (3/5)
                                            </option>
                                            <option value={4}>
                                              ★★★★☆ (4/5)
                                            </option>
                                            <option value={5}>
                                              ★★★★★ (5/5)
                                            </option>
                                          </select>
                                        </div>
                                        {/* Message */}
                                        <div className="col-12 bg-light-input">
                                          <textarea
                                            className="form-control"
                                            id="exampleFormControlTextarea1"
                                            placeholder="Yorumun"
                                            rows={3}
                                            onChange={handleReviewChange}
                                            name="review"
                                            defaultValue={
                                              studentReview?.review ||
                                              createReview?.review
                                            }
                                          />
                                        </div>
                                        {/* Button */}
                                        <div className="col-12">
                                          <button
                                            type="submit"
                                            className="btn btn-primary mb-0"
                                          >
                                            Not Ver
                                          </button>
                                        </div>
                                      </form>
                                    )}

                                    {studentReview && (
                                      <form
                                        className="row g-3 p-3"
                                        onSubmit={handleUpdateReviewSubmit}
                                      >
                                        {/* Rating */}
                                        <div className="col-12 bg-light-input">
                                          <select
                                            id="inputState2"
                                            className="form-select js-choice"
                                            onChange={handleReviewChange}
                                            name="rating"
                                            //value={course.review.rating}
                                          >
                                            <option value={1}>
                                              ★☆☆☆☆ (1/5)
                                            </option>
                                            <option value={2}>
                                              ★★☆☆☆ (2/5)
                                            </option>
                                            <option value={3}>
                                              ★★★☆☆ (3/5)
                                            </option>
                                            <option value={4}>
                                              ★★★★☆ (4/5)
                                            </option>
                                            <option value={5}>
                                              ★★★★★ (5/5)
                                            </option>
                                          </select>
                                        </div>
                                        {/* Message */}
                                        <div className="col-12 bg-light-input">
                                          <textarea
                                            className="form-control"
                                            id="exampleFormControlTextarea1"
                                            placeholder="Yorumun"
                                            rows={3}
                                            onChange={handleReviewChange}
                                            name="review"
                                            defaultValue={studentReview?.review}
                                          />
                                        </div>
                                        {/* Button */}
                                        <div className="col-12">
                                          <button
                                            type="submit"
                                            className="btn btn-primary mb-0"
                                          >
                                            Yorumu Güncelle
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
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

      {/* Lecture Modal */}
      <Modal show={show} size="lg" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ders: {variantItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactPlayer
            url={variantItem?.file}
            controls
            width={"100%"}
            height={"100%"}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Note Edit Modal */}
      <Modal show={noteShow} size="lg" onHide={handleNoteClose}>
        <Modal.Header closeButton>
          <Modal.Title>Not: {selectedNote?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmitEditNote(e, selectedNote?.id)}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Not Başlığı
              </label>
              <input
                defaultValue={selectedNote?.title}
                name="title"
                onChange={handleNoteChange}
                type="text"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                İçerik
              </label>
              <textarea
                defaultValue={selectedNote?.note}
                name="note"
                onChange={handleNoteChange}
                className="form-control"
                cols="30"
                rows="10"
              ></textarea>
            </div>
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={handleNoteClose}
            >
              <i className="fas fa-arrow-left"></i> Kapat
            </button>
            <button type="submit" className="btn btn-primary">
              Kaydet <i className="fas fa-check-circle"></i>
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Conversation Modal */}
      <Modal show={ConversationShow} size="lg" onHide={handleConversationClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ders: {selectedConversation?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-2 p-sm-4 rounded-3">
            <ul
              className="list-unstyled mb-0"
              style={{ overflowY: "scroll", height: "500px" }}
            >
              {selectedConversation?.messages?.map((m, index) => (
                <li className="comment-item mb-3">
                  <div className="d-flex">
                    <div className="avatar avatar-sm flex-shrink-0">
                      <a href="#">
                        <img
                          className="avatar-img rounded-circle"
                          src={
                            m.profile.image?.startsWith("http://127.0.0.1:8000")
                              ? m.profile.image
                              : `http://127.0.0.1:8000${m.profile.image}`
                          }
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          alt="womans image"
                        />
                      </a>
                    </div>
                    <div className="ms-2">
                      {/* Comment by */}
                      <div className="bg-light p-3 rounded w-100">
                        <div className="d-flex w-100 justify-content-center">
                          <div className="me-2 ">
                            <h6 className="mb-1 lead fw-bold">
                              <a
                                href="#!"
                                className="text-decoration-none text-dark"
                              >
                                {" "}
                                {m.profile.full_name}{" "}
                              </a>
                              <br />
                              <span style={{ fontSize: "12px", color: "gray" }}>
                                {moment(m.date).format("DD MMM, YYYY")}
                              </span>
                            </h6>
                            <p className="mb-0 mt-3  ">{m.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              <div ref={lastElementRef}></div>
            </ul>

            <form class="w-100 d-flex" onSubmit={sendNewMessage}>
              <textarea
                name="message"
                class="one form-control pe-4 bg-light w-75"
                id="autoheighttextarea"
                rows="2"
                onChange={handleMessageChange}
                placeholder="Sorunuz Nedir?"
              ></textarea>
              <button class="btn btn-primary ms-2 mb-0 w-25" type="submit">
                Gönder <i className="fas fa-paper-plane"></i>
              </button>
            </form>

            {/* <form class="w-100">
              <input
                name="title"
                type="text"
                className="form-control mb-2"
                placeholder="Question Title"
              />
              <textarea
                name="message"
                class="one form-control pe-4 mb-2 bg-light"
                id="autoheighttextarea"
                rows="5"
                placeholder="What's your question?"
              ></textarea>
              <button class="btn btn-primary mb-0 w-25" type="button">
                Post <i className="fas fa-paper-plane"></i>
              </button>
            </form> */}
          </div>
        </Modal.Body>
      </Modal>

      {/* Ask Question Modal */}
      {/* Note Edit Modal */}
      <Modal show={addQuestionShow} size="lg" onHide={handleQuestionClose}>
        <Modal.Header closeButton>
          <Modal.Title>Soru Sor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Soru Başlığı
              </label>
              <input
                value={createMessage.title}
                name="title"
                onChange={handleMessageChange}
                type="text"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Mesaj
              </label>
              <textarea
                value={createMessage.message}
                name="message"
                onChange={handleMessageChange}
                className="form-control"
                cols="30"
                rows="10"
              ></textarea>
            </div>
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={handleQuestionClose}
            >
              <i className="fas fa-arrow-left"></i> Kapat
            </button>
            <button type="submit" className="btn btn-primary">
              Mesaj Gönder <i className="fas fa-check-circle"></i>
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <ESKEPBaseFooter />
    </>
  );
}

export default KitapTahliliDetail;
