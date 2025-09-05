// ProjeDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";
import moment from "moment";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function ProjeDetail() {
  // ---- STATE ----
  const [proje, setProje] = useState(null);
  const [variantItem, setVariantItem] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState({});
  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null);

  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationShow, setConversationShow] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);

  const [addQuestionShow, setAddQuestionShow] = useState(false);

  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState(null);

  const userData = useUserData();
  const { proje_id } = useParams();
  const api = useAxios();
  const lastElementRef = useRef(null);

  // ---- MODALS ----
  // Video modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (variant_item) => {
    setVariantItem(variant_item);
    setShow(true);
  };

  // Note modal (tek modal; create/edit)
  const [noteShow, setNoteShow] = useState(false);
  const handleNoteClose = () => {
    setNoteShow(false);
    setSelectedNote(null);
    setCreateNote({ title: "", note: "" });
  };
  const handleNoteShow = (note = null) => {
    setSelectedNote(note);
    setCreateNote({ title: note?.title || "", note: note?.note || "" });
    setNoteShow(true);
  };

  // Conversation modal
  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = async (conversation) => {
    setConversationShow(true);
    setSelectedConversation(conversation || null);
    if (conversation?.id) {
      setConversationLoading(true);
      try {
        await refreshConversation(conversation.id);
      } finally {
        setConversationLoading(false);
      }
    }
  };

  // Soru Sor modal
  const handleQuestionShow = () => setAddQuestionShow(true);
  const handleQuestionClose = () => setAddQuestionShow(false);

  // ---- FETCH DETAIL ----
  const fetchProjeDetail = async () => {
    try {
      const res = await api.get(
        `eskepinstructor/proje-detail/${proje_id}/${userData?.user_id}/`
      );
      const data = res.data;
      setProje(data);
      setQuestions(data?.question_answers || []);
      setStudentReview(data?.review || null);

      // Tamamlama yüzdesi: curriculum toplam item sayısı üzerinden, yoksa lectures
      const totalFromCurriculum = (data?.curriculum || []).reduce(
        (sum, v) => sum + (v?.variant_items?.length || 0),
        0
      );
      const totalLectures = data?.lectures?.length || 0;
      const total = totalFromCurriculum || totalLectures || 0;

      const completed = data?.completed_lesson?.length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      setCompletionPercentage(percentage);
    } catch (error) {
      console.error("Proje detayları alınırken hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchProjeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proje_id, userData?.user_id]);

  // ---- LECTURE COMPLETION ----
  const handleMarkLessonAsCompleted = async (variantItemId) => {
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Updating" }));

    try {
      const formdata = new FormData();
      formdata.append("user_id", userData?.user_id || 0);
      formdata.append("proje_id", proje?.proje?.id || proje_id);
      formdata.append("variant_item_id", variantItemId);
      await api.post(`instructor/proje-completed/`, formdata);
      await fetchProjeDetail();
      setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Updated" }));
    } catch (e) {
      console.error(e);
      setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Error" }));
    }
  };

  // ---- NOTES ----
  const handleNoteChange = (event) => {
    setCreateNote((n) => ({ ...n, [event.target.name]: event.target.value }));
  };

  // Tek submit: selectedNote varsa PATCH, yoksa POST
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    try {
      const formdata = new FormData();
      formdata.append("koordinator_id", userData?.user_id);
      formdata.append("proje_id", proje_id);
      formdata.append("title", createNote.title);
      formdata.append("note", createNote.note);

      if (selectedNote?.id) {
        await api.patch(
          `eskepinstructor/proje-note-detail/${proje_id}/${userData?.user_id}/${selectedNote.id}/`,
          formdata
        );
        Toast().fire({ icon: "success", title: "Not Güncellendi" });
      } else {
        await api.post(
          `eskepinstructor/proje-note/${proje_id}/${userData?.user_id}/`,
          formdata
        );
        Toast().fire({ icon: "success", title: "Not Eklendi" });
      }

      await fetchProjeDetail();
      handleNoteClose();
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: "Not kaydedilemedi" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(
        `eskepinstructor/proje-note-detail/${proje_id}/${userData?.user_id}/${noteId}/`
      );
      await fetchProjeDetail();
      Toast().fire({ icon: "success", title: "Not Silindi" });
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: "Not silinemedi" });
    }
  };

  // ---- QA / MESSAGES ----
  const handleMessageChange = (event) => {
    setCreateMessage((m) => ({ ...m, [event.target.name]: event.target.value }));
  };

  // konuşmayı id ile tazele
  const refreshConversation = async (questionId) => {
    try {
      setConversationLoading(true);
      const res = await api.get(
        `eskepinstructor/question-answer-list-create/${proje_id}/`
      );
      const list = res.data || [];
      setQuestions(list);
      const fresh = list.find((q) => q.id === questionId) || null;
      setSelectedConversation(fresh);
    } finally {
      setConversationLoading(false);
    }
  };

  // Yeni konuşma (soru) oluştur
  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    const title = createMessage.title?.trim();
    const message = createMessage.message?.trim();

    if (!title || !message) {
      Toast().fire({ icon: "error", title: "Başlık ve mesaj giriniz" });
      return;
    }

    try {
      const formdata = new FormData();
      formdata.append("proje_id", proje_id);
      formdata.append("user_id", userData?.user_id);
      formdata.append("title", title);
      formdata.append("message", message);

      const res = await api.post(
        `eskepinstructor/question-answer-list-create/${proje_id}/`,
        formdata
      );

      // İsteğe bağlı: yeni konuşmayı hemen aç
      const newQid = res?.data?.question_id;
      await fetchProjeDetail();
      if (newQid) {
        await refreshConversation(newQid);
        setConversationShow(true);
      }

      setCreateMessage({ title: "", message: "" });
      setAddQuestionShow(false);
      Toast().fire({ icon: "success", title: "Mesaj gönderildi" });
    } catch (error) {
      console.error("Sunucu hatası:", error);
      Toast().fire({ icon: "error", title: "Mesaj gönderilemedi" });
    }
  };

  // Var olan konuşmaya yeni mesaj gönder
  const sendNewMessage = async (e) => {
    e.preventDefault();

    const msg = createMessage.message?.trim();
    if (!selectedConversation?.id) {
      Toast().fire({
        icon: "error",
        title: "Önce bir konuşma seçin ya da yeni soru oluşturun",
      });
      return;
    }
    if (!msg) {
      Toast().fire({ icon: "error", title: "Mesaj boş olamaz" });
      return;
    }

    try {
      // BE generic endpoint: body’de proje_id + question_id gönderiyoruz
      const payload = {
        proje_id,
        question_id: selectedConversation.id,
        message: msg,
      };

      await api.post(`eskepinstructor/question-answer-message-create/`, payload);

      await refreshConversation(selectedConversation.id);
      setCreateMessage({ title: "", message: "" });
    } catch (error) {
      console.error(error);
      Toast().fire({
        icon: "error",
        title: error?.response?.data?.detail || "Mesaj gönderilemedi",
      });
    }
  };

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();
    if (!query) {
      setQuestions(proje?.question_answers || []);
      return;
    }
    const filtered = (proje?.question_answers || []).filter((q) =>
      q?.title?.toLowerCase?.().includes(query)
    );
    setQuestions(filtered);
  };

  // ---- REVIEW ----
  const handleReviewChange = (event) => {
    setCreateReview((r) => ({ ...r, [event.target.name]: event.target.value }));
  };

  const handleCreateReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const formdata = new FormData();
      formdata.append("proje_id", proje?.proje?.id || proje_id);
      formdata.append("user_id", userData?.user_id);
      formdata.append("rating", createReview.rating);
      formdata.append("review", createReview.review);

      await api.post(`stajer/rate-proje/`, formdata);
      await fetchProjeDetail();
      Toast().fire({ icon: "success", title: "Yorum Oluşturuldu" });
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: "Yorum oluşturulamadı" });
    }
  };

  const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const formdata = new FormData();
      formdata.append("proje", proje?.proje?.id || proje_id);
      formdata.append("user", userData?.user_id);
      formdata.append("rating", createReview.rating || studentReview?.rating);
      formdata.append("review", createReview.review || studentReview?.review);

      await api.patch(
        `stajer/review-detail/${userData?.user_id}/${studentReview?.id}/`,
        formdata
      );
      await fetchProjeDetail();
      Toast().fire({ icon: "success", title: "Yorum Güncellendi" });
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: "Yorum güncellenemedi" });
    }
  };

  // ---- HELPERS ----
  const isItemCompleted = (item) => {
    const itemId = item?.id ?? item?.variant_item_id;
    return (
      proje?.completed_lesson?.some((cl) => cl?.variant_item?.id === itemId) ||
      false
    );
  };

  // ---- RENDER ----
  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5 min-vh-100 bg-body" style={{ paddingTop: '6rem', paddingBottom: '7rem' }}>
        <div className="container-fluid">
          <Header />
          <div className="row mt-0 mt-md-4 g-4" style={{minHeight: '75vh'}}>
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12 d-flex flex-column pb-5">
              <section className="mt-4"><div className="container-xxl">
                  <div className="row">
                    <div className="col-12">
                      <div className="card shadow rounded-2 p-0 mt-3">
                        {/* Tabs */}
                        <div className="card-header border-bottom px-4 pt-3 pb-0">
                          <ul className="nav nav-bottom-line py-0" role="tablist">
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button
                                className="nav-link mb-2 mb-md-0 active"
                                data-bs-toggle="pill"
                                data-bs-target="#pj-tabs-1"
                                type="button"
                                role="tab"
                                aria-selected="true"
                              >
                                Ödev Bölümleri
                              </button>
                            </li>
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button
                                className="nav-link mb-2 mb-md-0"
                                data-bs-toggle="pill"
                                data-bs-target="#pj-tabs-2"
                                type="button"
                                role="tab"
                                aria-selected="false"
                              >
                                Notlar
                              </button>
                            </li>
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button
                                className="nav-link mb-2 mb-md-0"
                                data-bs-toggle="pill"
                                data-bs-target="#pj-tabs-3"
                                type="button"
                                role="tab"
                                aria-selected="false"
                              >
                                Konuşma
                              </button>
                            </li>
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button
                                className="nav-link mb-2 mb-md-0"
                                data-bs-toggle="pill"
                                data-bs-target="#pj-tabs-4"
                                type="button"
                                role="tab"
                                aria-selected="false"
                              >
                                Not Ver
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Tab contents */}
                        <div className="card-body p-sm-4">
                          <div className="tab-content">
                            {/* Bölümler */}
                            <div className="tab-pane fade show active" id="pj-tabs-1">
                              <div className="accordion accordion-icon accordion-border" id="accordionExample2">
                                <div className="progress mb-3">
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${completionPercentage}%` }}
                                    aria-valuenow={completionPercentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  >
                                    {completionPercentage}%
                                  </div>
                                </div>

                                {/* Varsayılan: ders listesi */}
                                {(proje?.lectures || []).map((c, index) => (
                                  <div key={index}>
                                    <h3>{c?.name}</h3>
                                  </div>
                                ))}

                                {/* Curriculum */}
                                {(proje?.curriculum || []).map((c, index) => (
                                  <div className="accordion-item mb-3 p-3 bg-light" key={index}>
                                    <h6 className="accordion-header font-base" id={`heading-${index}`}>
                                      <button
                                        className="accordion-button p-3 w-100 bg-light btn border fw-bold rounded d-sm-flex d-inline-block collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse-${c?.variant_id}`}
                                        aria-expanded="true"
                                        aria-controls={`collapse-${c?.variant_id}`}
                                      >
                                        {c?.title}
                                        <span className="small ms-0 ms-sm-2">
                                          ({c?.variant_items?.length || 0} Ders{(c?.variant_items?.length || 0) > 1 && "s"})
                                        </span>
                                      </button>
                                    </h6>

                                    <div
                                      id={`collapse-${c?.variant_id}`}
                                      className="accordion-collapse collapse show"
                                      aria-labelledby={`heading-${index}`}
                                      data-bs-parent="#accordionExample2"
                                    >
                                      <div className="accordion-body mt-3">
                                        {(c?.variant_items || []).map((l, idx) => {
                                          const itemId = l?.id ?? l?.variant_item_id;
                                          return (
                                            <div key={idx}>
                                              <div className="d-flex justify-content-between align-items-center">
                                                <div className="position-relative d-flex align-items-center gap-2">
                                                  {l?.file ? (
                                                    <a
                                                      href={l.file}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="btn btn-primary-soft btn-round btn-sm mb-0 position-static"
                                                    >
                                                      <i className="fas fa-file-pdf me-1" /> PDF'yi Görüntüle
                                                    </a>
                                                  ) : (
                                                    <span className="text-muted">PDF mevcut değil</span>
                                                  )}

                                                  {l?.video_url && (
                                                    <button
                                                      type="button"
                                                      className="btn btn-outline-secondary btn-sm"
                                                      onClick={() => handleShow(l)}
                                                    >
                                                      <i className="fas fa-play me-1" /> Videoyu Aç
                                                    </button>
                                                  )}
                                                </div>

                                                <div className="d-flex align-items-center">
                                                  <p className="mb-0 me-2">{l?.content_duration || "0m 0s"}</p>
                                                  <input
                                                    type="checkbox"
                                                    className="form-check-input ms-2"
                                                    onChange={() => handleMarkLessonAsCompleted(itemId)}
                                                    checked={isItemCompleted(l)}
                                                  />
                                                </div>
                                              </div>
                                              <hr />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Notlar */}
                            <div className="tab-pane fade" id="pj-tabs-2">
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3 d-flex justify-content-between align-items-center">
                                  <h4 className="mb-0 p-3">Tüm Notlar</h4>
                                  <button type="button" className="btn btn-primary me-3" onClick={() => handleNoteShow()}>
                                    Not Ekle <i className="fas fa-pen"></i>
                                  </button>
                                </div>

                                <div className="card-body p-0 pt-3">
                                  {(proje?.notes || []).map((n) => (
                                    <div key={n?.id} className="row g-4 p-3">
                                      <div className="col-sm-11 col-xl-11 shadow p-3 m-3 rounded">
                                        <h5>{n?.title}</h5>
                                        <p className="mb-2">{n?.note || n?.notes}</p>
                                        <small className="text-muted">
                                          {moment(n?.date).format("DD MMM, YYYY HH:mm")}
                                        </small>
                                        <div className="hstack gap-3 flex-wrap mt-3">
                                          <button type="button" onClick={() => handleNoteShow(n)} className="btn btn-success mb-0">
                                            <i className="bi bi-pencil-square me-2" /> Düzenle
                                          </button>
                                          <button type="button" onClick={() => handleDeleteNote(n?.id)} className="btn btn-danger mb-0">
                                            <i className="bi bi-trash me-2" /> Sil
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {(proje?.notes?.length || 0) < 1 && (
                                    <p className="mt-3 p-3">Not Bulunamadı</p>
                                  )}
                                  <hr />
                                </div>
                              </div>
                            </div>

                            {/* Konuşma */}
                            <div className="tab-pane fade" id="pj-tabs-3">
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3">
                                  <h4 className="mb-3 p-3">Konuşma</h4>
                                  <form className="row g-4 p-3" onSubmit={(e) => e.preventDefault()}>
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
                                          type="button"
                                          className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                                        >
                                          <i className="fas fa-search fs-6 " />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-3">
                                      {/* Sadece state kontrollü modal */}
                                      <button
                                        type="button"
                                        onClick={handleQuestionShow}
                                        className="btn btn-primary mb-0 w-100"
                                      >
                                        Soru Sor
                                      </button>
                                    </div>
                                  </form>
                                </div>

                                <div className="card-body p-0 pt-3">
                                  <div className="vstack gap-3 p-3">
                                    {(questions || []).map((q, index) => (
                                      <div className="shadow rounded-3 p-3" key={q?.id || index}>
                                        <div className="d-sm-flex justify-content-sm-between mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="avatar avatar-sm flex-shrink-0">
                                              <img
                                                src={q?.profile?.image}
                                                className="avatar-img rounded-circle"
                                                alt="avatar"
                                                style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }}
                                              />
                                            </div>
                                            <div className="ms-2">
                                              <h6 className="mb-0">
                                                <span className="text-decoration-none text-dark">{q?.profile?.full_name}</span>
                                              </h6>
                                              <small>{moment(q?.date).format("DD MMM, YYYY")}</small>
                                            </div>
                                          </div>
                                        </div>
                                        <h5>{q?.title}</h5>
                                        <button
                                          type="button"
                                          className="btn btn-primary btn-sm mb-3 mt-3"
                                          onClick={() => handleConversationShow(q)}
                                        >
                                          Konuşmaya Katıl <i className="fas fa-arrow-right"></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Not Ver */}
                            <div className="tab-pane fade" id="pj-tabs-4">
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3">
                                  <h4 className="mb-3 p-3">
                                    {studentReview?.rating ? <span>Not Ver {studentReview.rating}</span> : "Not Ver"}
                                  </h4>
                                  <div className="mt-2">
                                    {!studentReview && (
                                      <form className="row g-3 p-3" onSubmit={handleCreateReviewSubmit}>
                                        <div className="col-12 bg-light-input">
                                          <select
                                            id="inputState2"
                                            className="form-select js-choice"
                                            onChange={handleReviewChange}
                                            name="rating"
                                            defaultValue={1}
                                          >
                                            <option value={1}>★☆☆☆☆ (1/5)</option>
                                            <option value={2}>★★☆☆☆ (2/5)</option>
                                            <option value={3}>★★★☆☆ (3/5)</option>
                                            <option value={4}>★★★★☆ (4/5)</option>
                                            <option value={5}>★★★★★ (5/5)</option>
                                          </select>
                                        </div>
                                        <div className="col-12 bg-light-input">
                                          <textarea
                                            className="form-control"
                                            placeholder="Yorumun"
                                            rows={3}
                                            onChange={handleReviewChange}
                                            name="review"
                                          />
                                        </div>
                                        <div className="col-12">
                                          <button type="submit" className="btn btn-primary mb-0">
                                            Not Ver
                                          </button>
                                        </div>
                                      </form>
                                    )}

                                    {studentReview && (
                                      <form className="row g-3 p-3" onSubmit={handleUpdateReviewSubmit}>
                                        <div className="col-12 bg-light-input">
                                          <select
                                            id="inputState2"
                                            className="form-select js-choice"
                                            onChange={handleReviewChange}
                                            name="rating"
                                            defaultValue={studentReview?.rating}
                                          >
                                            <option value={1}>★☆☆☆☆ (1/5)</option>
                                            <option value={2}>★★☆☆☆ (2/5)</option>
                                            <option value={3}>★★★☆☆ (3/5)</option>
                                            <option value={4}>★★★★☆ (4/5)</option>
                                            <option value={5}>★★★★★ (5/5)</option>
                                          </select>
                                        </div>
                                        <div className="col-12 bg-light-input">
                                          <textarea
                                            className="form-control"
                                            placeholder="Yorumun"
                                            rows={3}
                                            onChange={handleReviewChange}
                                            name="review"
                                            defaultValue={studentReview?.review}
                                          />
                                        </div>
                                        <div className="col-12">
                                          <button type="submit" className="btn btn-primary mb-0">
                                            Yorumu Güncelle
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* /Not Ver */}
                          </div>
                        </div>
                        {/* /Tab contents */}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Ders (video) Modal */}
      <Modal show={show} size="lg" onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ders: {variantItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactPlayer url={variantItem?.file || variantItem?.video_url} controls width={"100%"} height={"100%"} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Not Create/Edit Modal */}
      <Modal show={noteShow} size="lg" onHide={handleNoteClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedNote?.id ? `Notu Düzenle: ${selectedNote.title}` : "Yeni Not Ekle"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitNote}>
            <div className="mb-3">
              <label className="form-label">Not Başlığı</label>
              <input
                value={createNote.title}
                name="title"
                onChange={handleNoteChange}
                type="text"
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">İçerik</label>
              <textarea
                value={createNote.note}
                name="note"
                onChange={handleNoteChange}
                className="form-control"
                rows={8}
                required
              />
            </div>
            <button type="button" className="btn btn-secondary me-2" onClick={handleNoteClose}>
              <i className="fas fa-arrow-left"></i> Kapat
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedNote?.id ? "Güncelle" : "Kaydet"} <i className="fas fa-check-circle"></i>
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Conversation Modal */}
      <Modal show={conversationShow} size="lg" onHide={handleConversationClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konuşma: {selectedConversation?.title || "—"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border p-2 p-sm-4 rounded-3">
            {conversationLoading ? (
              <div className="text-center py-4">Yükleniyor…</div>
            ) : (
              <ul className="list-unstyled mb-0" style={{ overflowY: "auto", height: 500 }}>
                {(selectedConversation?.messages || []).map((m, index) => (
                  <li key={m?.id || index} className="comment-item mb-3">
                    <div className="d-flex">
                      <div className="avatar avatar-sm flex-shrink-0">
                        <img
                          className="avatar-img rounded-circle"
                          src={
                            m?.profile?.image?.startsWith("http://127.0.0.1:8000")
                              ? m?.profile?.image
                              : `http://127.0.0.1:8000${m?.profile?.image}`
                          }
                          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                          alt="user"
                        />
                      </div>
                      <div className="ms-2 w-100">
                        <div className="bg-light p-3 rounded w-100">
                          <div className="d-flex w-100 justify-content-center">
                            <div className="me-2">
                              <h6 className="mb-1 lead fw-bold">
                                <span className="text-decoration-none text-dark">{m?.profile?.full_name}</span>
                                <br />
                                <span style={{ fontSize: 12, color: "gray" }}>{moment(m?.date).format("DD MMM, YYYY")}</span>
                              </h6>
                              <p className="mb-0 mt-3">{m?.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                <div ref={lastElementRef}></div>
              </ul>
            )}

            <form className="w-100 d-flex mt-3" onSubmit={sendNewMessage}>
              <textarea
                name="message"
                className="one form-control pe-4 bg-light w-75"
                rows={2}
                onChange={handleMessageChange}
                value={createMessage.message}
                placeholder="Mesajınız"
                required
              />
              <button className="btn btn-primary ms-2 mb-0 w-25" type="submit">
                Gönder <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      {/* Soru Sor Modal (STATE KONTROLLÜ) */}
      <Modal show={addQuestionShow} size="lg" onHide={handleQuestionClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Soru Sor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label className="form-label">Soru Başlığı</label>
              <input
                value={createMessage.title}
                name="title"
                onChange={handleMessageChange}
                type="text"
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mesaj</label>
              <textarea
                value={createMessage.message}
                name="message"
                onChange={handleMessageChange}
                className="form-control"
                rows={8}
                required
              />
            </div>
            <button type="button" className="btn btn-secondary me-2" onClick={handleQuestionClose}>
              Kapat
            </button>
            <button type="submit" className="btn btn-primary">
              Mesaj Gönder
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <ESKEPBaseFooter />
    </>
  );
}

export default ProjeDetail;
