import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";

import Toast from "../plugin/Toast";
import moment from "moment";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import useUserData from "../plugin/useUserData";

/**
 * OdevDetail (Modernized)
 * - Daha temiz layout
 * - Solda sticky özet + ilerleme
 * - Sağda sekmeli içerik (Bölümler / Notlar / Konuşma / Not Ver)
 * - Tek modal akışları korunuyor
 * - Daha belirgin boş durumlar, loading skeleton'ları
 */
function OdevDetail() {
  // ---- STATE ----
  const [odev, setOdev] = useState(null);
  const [variantItem, setVariantItem] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState({});
  const [conversationLoading, setConversationLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null); // null => create, obj => edit

  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState(null);

  const userData = useUserData();
  const { odev_id, koordinator_id } = useParams();
  console.log(odev_id,koordinator_id)
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

  // Note create/edit modal (tek modal)
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

  // Konuşmayı id ile tazele
  const refreshConversation = async (questionId) => {
    try {
      setConversationLoading(true);
      const res = await api.get(`eskepinstructor/question-answer-list-create/${odev_id}/`);
      setQuestions(res.data || []);
      const fresh = (res.data || []).find((q) => q.id === questionId);
      setSelectedConversation(fresh || null);
    } finally {
      setConversationLoading(false);
    }
  };

  // Conversation modal
  const [conversationShow, setConversationShow] = useState(false);
  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = async (conversation) => {
    setConversationShow(true);
    await refreshConversation(conversation.id);
  };

  // Add question modal
  const [addQuestionShow, setAddQuestionShow] = useState(false);
  const handleQuestionClose = () => setAddQuestionShow(false);
  const handleQuestionShow = () => setAddQuestionShow(true);

  // ---- FETCH DETAIL ----
  const fetchOdevDetail = async () => {
    try {
      setFetching(true);
      debugger;
      const res = await api.get(`eskepinstructor/odev-detail/${odev_id}/${koordinator_id}/`);
      
      const data = res.data;
      setOdev(data);
      setQuestions(data?.question_answers || []);
      setStudentReview(data?.review || null);

      // Tamamlama yüzdesi
      const totalFromCurriculum = (data?.curriculum || []).reduce((sum, v) => sum + (v?.variant_items?.length || 0), 0);
      const totalLectures = data?.lectures?.length || 0;
      const total = totalFromCurriculum || totalLectures || 0;

      const completed = data?.completed_lesson?.length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      setCompletionPercentage(percentage);
    } catch (error) {
      console.error("Ödev detayları alınırken hata oluştu:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchOdevDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [koordinator_id, odev_id]);

  // ---- LECTURE COMPLETION ----
  const handleMarkLessonAsCompleted = async (variantItemId) => {
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Updating" }));

    try {
      const formdata = new FormData();
      formdata.append("user_id", userData?.user_id || 0);
      formdata.append("odev_id", odev?.odev?.id);
      formdata.append("variant_item_id", variantItemId);
      await api.post(`instructor/odev-completed/`, formdata);
      await fetchOdevDetail();
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

  const handleSubmitNote = async (e) => {
    console.log(koordinator_id);
    console.log(odev_id);
    console.log(selectedNote);
    e.preventDefault();
    try {
      const formdata = new FormData();
      formdata.append("koordinator_id", koordinator_id);
      formdata.append("odev_id", odev_id);
      formdata.append("title", createNote.title);
      formdata.append("note", createNote.note);

      if (selectedNote?.id) {
        await api.patch(`eskepinstructor/odev-note-detail/${koordinator_id}/${odev_id}/${selectedNote.id}/`, formdata);
        Toast().fire({ icon: "success", title: "Not Güncellendi" });
      } else {
        await api.post(`eskepinstructor/odev-note/${odev_id}/${koordinator_id}/`, formdata);
        Toast().fire({ icon: "success", title: "Not Eklendi" });
      }

      fetchOdevDetail();
      handleNoteClose();
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: "Not kaydedilemedi" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`eskepinstructor/odev-note-detail/${koordinator_id}/${odev_id}/${noteId}/`);
      await fetchOdevDetail();
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

  // Yeni konuşma mesajı (var olan konuşmaya ek)
  const sendNewMessage = async (e) => {
    e.preventDefault();

    if (!selectedConversation?.id) {
      Toast().fire({ icon: "error", title: "Önce bir konuşma seçin ya da yeni soru oluşturun" });
      return;
    }
    if (!createMessage.message?.trim()) {
      Toast().fire({ icon: "error", title: "Mesaj boş olamaz" });
      return;
    }

    try {
      const payload = {
        odev_id,
        question_id: selectedConversation.id,
        message: createMessage.message.trim(),
      };

      const res = await api.post(`eskepinstructor/question-answer-message-create/${odev_id}/`, payload);
      const qid = res?.data?.question_id ?? selectedConversation.id;
      await refreshConversation(qid);
      setCreateMessage({ title: "", message: "" });
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: error?.response?.data?.detail || "Mesaj gönderilemedi" });
    }
  };

  // Yeni soru + ilk mesaj
  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    const title = createMessage.title?.trim();
    const message = createMessage.message?.trim();

    if (!title || !message) {
      Toast().fire({ icon: "error", title: "Başlık ve mesaj giriniz" });
      return;
    }

    try {
      const res = await api.post(`eskepinstructor/question-answer-message-create/${odev_id}/`, {
        odev_id,
        question_id: selectedConversation?.id, // backend yeni olusturup id döndürmeli
        title: title,
        message: message,
      });
      const qid = res?.data?.question_id ?? selectedConversation?.id;
      await refreshConversation(qid);
      setCreateMessage({ title: "", message: "" });
      handleQuestionClose();
      Toast().fire({ icon: "success", title: "Mesaj Gönderildi" });
    } catch (error) {
      console.error("Sunucu hatası:", error);
      Toast().fire({ icon: "error", title: error?.response?.data?.detail || "Mesaj gönderilemedi" });
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
      setQuestions(odev?.question_answers || []);
      return;
    }
    const filtered = (odev?.question_answers || []).filter((q) => q?.title?.toLowerCase?.().includes(query));
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
      formdata.append("odev_id", odev?.odev?.id);
      formdata.append("user_id", userData?.user_id);
      formdata.append("rating", createReview.rating);
      formdata.append("review", createReview.review);

      await api.post(`stajer/rate-odev/`, formdata);
      await fetchOdevDetail();
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
      formdata.append("odev", odev?.odev?.id);
      formdata.append("user", userData?.user_id);
      formdata.append("rating", createReview.rating || studentReview?.rating);
      formdata.append("review", createReview.review || studentReview?.review);

      await api.patch(`stajer/review-detail/${userData?.user_id}/${studentReview?.id}/`, formdata);
      await fetchOdevDetail();
      Toast().fire({ icon: "success", title: "Yorum Güncellendi" });
    } catch (error) {
      console.error(error);
      Toast().fire({ icon: "error", title: "Yorum güncellenemedi" });
    }
  };

  // ---- HELPERS ----
  const isItemCompleted = (item) => {
    const itemId = item?.id ?? item?.variant_item_id;
    return odev?.completed_lesson?.some((cl) => cl?.variant_item?.id === itemId) || false;
  };

  const totalCounts = useMemo(() => {
    const lessonCount = (odev?.curriculum || []).reduce((sum, v) => sum + (v?.variant_items?.length || 0), 0);
    return {
      variants: (odev?.curriculum || []).length,
      lessons: lessonCount,
      notes: odev?.notes?.length || 0,
      questions: (odev?.question_answers || []).length,
    };
  }, [odev]);

  return (
    <>
      <ESKEPBaseHeader />

      <section className="py-4 py-md-5 bg-light">
        <div className="container">
          {/* Global Header */}
          <Header />

          <div className="row g-4 g-lg-5 mt-0 mt-md-4">
            {/* SOL: Özet kartı (sticky) */}
            <div className="col-lg-4 col-xl-3">
              <div className="position-sticky" style={{ top: 88 }}>
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h5 className="mb-0">Ödev Özeti</h5>
                      {fetching && <span className="badge bg-secondary">Yükleniyor</span>}
                    </div>

                    <div className="small text-muted mb-3">
                      {odev?.odev?.title || "—"}
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small fw-semibold">Tamamlama</span>
                        <span className="small fw-bold">{completionPercentage}%</span>
                      </div>
                      <div className="progress" style={{ height: 10 }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${completionPercentage}%` }}
                          aria-valuenow={completionPercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>

                    <div className="row text-center g-2">
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-white">
                          <div className="small text-muted">Bölüm</div>
                          <div className="fw-bold">{totalCounts.variants}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-white">
                          <div className="small text-muted">Ders</div>
                          <div className="fw-bold">{totalCounts.lessons}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-white mt-2">
                          <div className="small text-muted">Not</div>
                          <div className="fw-bold">{totalCounts.notes}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 border rounded-3 bg-white mt-2">
                          <div className="small text-muted">Konuşma</div>
                          <div className="fw-bold">{totalCounts.questions}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar bileşenini aşağıda ayrı kartta koruyalım */}
                <div className="card border-0 shadow-sm rounded-3 mt-3">
                  <div className="card-body p-2 p-md-3">
                    <Sidebar />
                  </div>
                </div>
              </div>
            </div>

            {/* SAĞ: İçerik */}
            <div className="col-lg-8 col-xl-9">
              <div className="card shadow rounded-3 border-0">
                {/* Tabs */}
                <div className="card-header bg-white border-0 px-3 px-md-4 pt-3 pb-0">
                  <ul className="nav nav-pills gap-2 flex-wrap" id="course-pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active" id="course-pills-tab-1" data-bs-toggle="pill" data-bs-target="#course-pills-1" type="button" role="tab" aria-controls="course-pills-1" aria-selected="true">
                        Ödev Bölümleri
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="course-pills-tab-2" data-bs-toggle="pill" data-bs-target="#course-pills-2" type="button" role="tab" aria-controls="course-pills-2" aria-selected="false">
                        Notlar
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="course-pills-tab-3" data-bs-toggle="pill" data-bs-target="#course-pills-3" type="button" role="tab" aria-controls="course-pills-3" aria-selected="false">
                        Konuşma
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="course-pills-tab-4" data-bs-toggle="pill" data-bs-target="#course-pills-4" type="button" role="tab" aria-controls="course-pills-4" aria-selected="false">
                        Not Ver
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Tab contents */}
                <div className="card-body p-3 p-md-4">
                  <div className="tab-content" id="course-pills-tabContent">
                    {/* Ödev Bölümleri */}
                    <div className="tab-pane fade show active" id="course-pills-1" role="tabpanel" aria-labelledby="course-pills-tab-1">
                      {fetching ? (
                        <SkeletonCurriculum />
                      ) : (
                        <div className="accordion" id="accordionExample2">
                          {/* Varsayılan: ders listesi */}
                          {(odev?.lectures || []).length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-uppercase text-muted small mb-2">Dersler</h6>
                              {(odev?.lectures || []).map((c, index) => (
                                <div key={index} className="p-3 border rounded-3 mb-2 bg-white">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <span className="fw-semibold">{c?.name}</span>
                                    <span className="badge bg-light text-dark">{c?.content_duration || "0m 0s"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Curriculum */}
                          {(odev?.curriculum || []).map((c, index) => (
                            <div className="accordion-item border rounded-3 overflow-hidden mb-3" key={index}>
                              <h2 className="accordion-header" id={`heading-${index}`}>
                                <button
                                  className="accordion-button collapsed bg-white fw-semibold"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse-${c?.variant_id}`}
                                  aria-expanded="false"
                                  aria-controls={`collapse-${c?.variant_id}`}
                                >
                                  <div className="d-flex align-items-center w-100">
                                    <span className="me-2">{c?.title}</span>
                                    <span className="badge bg-secondary-subtle text-dark ms-auto">{c?.variant_items?.length || 0} Ders</span>
                                  </div>
                                </button>
                              </h2>
                              <div id={`collapse-${c?.variant_id}`} className="accordion-collapse collapse" aria-labelledby={`heading-${index}`} data-bs-parent="#accordionExample2">
                                <div className="accordion-body bg-light">
                                  {(c?.variant_items || []).map((l, idx) => {
                                    const itemId = l?.id ?? l?.variant_item_id;
                                    const completed = isItemCompleted(l);
                                    return (
                                      <div key={idx} className="p-3 bg-white rounded-3 mb-2 border">
                                        <div className="d-flex justify-content-between align-items-center gap-3">
                                          <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <span className={`badge ${completed ? "bg-success" : "bg-light text-dark"}`}>
                                              {completed ? "Tamamlandı" : "Bekliyor"}
                                            </span>

                                            {l?.file ? (
                                              <a href={l.file} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                                <i className="fas fa-file-pdf me-1" /> PDF'yi Görüntüle
                                              </a>
                                            ) : (
                                              <span className="text-muted small">PDF yok</span>
                                            )}

                                            {l?.video_url && (
                                              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleShow(l)}>
                                                <i className="fas fa-play me-1" /> Videoyu Aç
                                              </button>
                                            )}
                                          </div>

                                          <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted small">{l?.content_duration || "0m 0s"}</span>
                                            <div className="form-check">
                                              <input
                                                type="checkbox"
                                                className="form-check-input"
                                                onChange={() => handleMarkLessonAsCompleted(itemId)}
                                                checked={completed}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}

                          {(odev?.curriculum?.length || 0) < 1 && (odev?.lectures?.length || 0) < 1 && (
                            <EmptyState title="İçerik Bulunamadı" subtitle="Bu ödev için henüz ders veya müfredat eklenmemiş görünüyor." />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notlar */}
                    <div className="tab-pane fade" id="course-pills-2" role="tabpanel" aria-labelledby="course-pills-tab-2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Notlar</h5>
                        <Button className="btn btn-primary" onClick={() => handleNoteShow()}>
                          Not Ekle <i className="fas fa-pen" />
                        </Button>
                      </div>

                      {fetching ? (
                        <SkeletonNotes />
                      ) : (
                        <div className="vstack gap-3">
                          {(odev?.notes || []).map((n) => (
                            <div key={n?.id} className="border rounded-3 p-3 bg-white shadow-sm">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{n?.title}</h6>
                                  <p className="mb-0 text-muted">{n?.note}</p>
                                </div>
                                <div className="ms-3 d-flex gap-2">
                                  <button type="button" onClick={() => handleNoteShow(n)} className="btn btn-sm btn-outline-success">
                                    <i className="bi bi-pencil-square me-1" /> Düzenle
                                  </button>
                                  <button type="button" onClick={() => handleDeleteNote(n?.id)} className="btn btn-sm btn-outline-danger">
                                    <i className="bi bi-trash me-1" /> Sil
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {(odev?.notes?.length || 0) < 1 && (
                            <EmptyState title="Not Bulunamadı" subtitle="Henüz not eklenmemiş. Yeni bir not oluşturabilirsiniz." />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Konuşma */}
                    <div className="tab-pane fade" id="course-pills-3" role="tabpanel" aria-labelledby="course-pills-tab-3">
                      <div className="row g-3">
                        {/* Sol: Arama + Liste */}
                        <div className="col-lg-5">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="input-group mb-3">
                                <input className="form-control" type="search" placeholder="Konuşmalarda ara" aria-label="Ara" onChange={handleSearchQuestion} />
                                <button className="btn btn-outline-primary" type="button" onClick={handleQuestionShow}>
                                  Soru Sor
                                </button>
                              </div>
                              <div className="vstack gap-2" style={{ maxHeight: 480, overflowY: "auto" }}>
                                {(questions || []).map((q) => (
                                  <button key={q?.id} className={`text-start p-3 rounded-3 border ${selectedConversation?.id === q?.id ? "bg-primary text-white" : "bg-white"}`} onClick={() => handleConversationShow(q)}>
                                    <div className="d-flex align-items-center gap-2">
                                      <img src={q?.profile?.image} alt="avatar" className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover" }} />
                                      <div>
                                        <div className="fw-semibold small mb-1">{q?.profile?.full_name}</div>
                                        <div className="small text-truncate" style={{ maxWidth: 220 }}>{q?.title}</div>
                                        <div className="small opacity-75">{moment(q?.date).format("DD MMM, YYYY")}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {(questions?.length || 0) < 1 && <EmptyState title="Konuşma yok" subtitle="Yeni bir soru oluşturarak başlayın." />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sağ: Mesajlar */}
                        <div className="col-lg-7">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              {selectedConversation ? (
                                <>
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="mb-0">{selectedConversation?.title}</h6>
                                    <span className="badge bg-light text-dark">{selectedConversation?.messages?.length || 0} mesaj</span>
                                  </div>
                                  <div className="border rounded-3" style={{ height: 420, overflowY: "auto" }}>
                                    {conversationLoading ? (
                                      <div className="text-center py-5">Yükleniyor…</div>
                                    ) : (
                                      <div className="p-3">
                                        {(selectedConversation?.messages || []).map((m, i) => (
                                          <div key={m?.id || i} className="d-flex gap-2 mb-3">
                                            <img
                                              className="rounded-circle mt-1"
                                              src={m?.profile?.image?.startsWith("http://127.0.0.1:8000") ? m?.profile?.image : `http://127.0.0.1:8000${m?.profile?.image}`}
                                              style={{ width: 36, height: 36, objectFit: "cover" }}
                                              alt="user"
                                            />
                                            <div className="bg-light p-2 px-3 rounded-3 w-100">
                                              <div className="d-flex justify-content-between align-items-center">
                                                <div className="fw-semibold small">{m?.profile?.full_name}</div>
                                                <div className="small text-muted">{moment(m?.date).format("DD MMM, YYYY")}</div>
                                              </div>
                                              <div className="mt-2">{m?.message}</div>
                                            </div>
                                          </div>
                                        ))}
                                        <div ref={lastElementRef} />
                                      </div>
                                    )}
                                  </div>

                                  <form className="d-flex gap-2 mt-3" onSubmit={sendNewMessage}>
                                    <textarea name="message" className="form-control bg-light" rows={2} onChange={handleMessageChange} placeholder="Mesaj yazın" value={createMessage.message} required />
                                    <button className="btn btn-primary" type="submit">
                                      Gönder <i className="fas fa-paper-plane" />
                                    </button>
                                  </form>
                                </>
                              ) : (
                                <EmptyState title="Konuşma seçilmedi" subtitle="Soldan bir konuşma seçin veya yeni bir soru oluşturun." />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Not Ver */}
                    <div className="tab-pane fade" id="course-pills-4" role="tabpanel" aria-labelledby="course-pills-tab-4">
                      <div className="card border-0">
                        <div className="card-body p-0">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="mb-0">{studentReview?.rating ? `Notunuz: ${studentReview.rating}/5` : "Not Ver"}</h5>
                          </div>

                          {!studentReview ? (
                            <form className="row g-3" onSubmit={handleCreateReviewSubmit}>
                              <div className="col-12">
                                <label className="form-label">Puan</label>
                                <select id="inputState2" className="form-select" onChange={handleReviewChange} name="rating" defaultValue={1}>
                                  <option value={1}>★☆☆☆☆ (1/5)</option>
                                  <option value={2}>★★☆☆☆ (2/5)</option>
                                  <option value={3}>★★★☆☆ (3/5)</option>
                                  <option value={4}>★★★★☆ (4/5)</option>
                                  <option value={5}>★★★★★ (5/5)</option>
                                </select>
                              </div>
                              <div className="col-12">
                                <label className="form-label">Yorum</label>
                                <textarea className="form-control" rows={3} onChange={handleReviewChange} name="review" placeholder="Geri bildiriminiz" />
                              </div>
                              <div className="col-12 d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary">
                                  Not Ver
                                </button>
                              </div>
                            </form>
                          ) : (
                            <form className="row g-3" onSubmit={handleUpdateReviewSubmit}>
                              <div className="col-12">
                                <label className="form-label">Puan</label>
                                <select id="inputState2" className="form-select" onChange={handleReviewChange} name="rating" defaultValue={studentReview?.rating}>
                                  <option value={1}>★☆☆☆☆ (1/5)</option>
                                  <option value={2}>★★☆☆☆ (2/5)</option>
                                  <option value={3}>★★★☆☆ (3/5)</option>
                                  <option value={4}>★★★★☆ (4/5)</option>
                                  <option value={5}>★★★★★ (5/5)</option>
                                </select>
                              </div>
                              <div className="col-12">
                                <label className="form-label">Yorum</label>
                                <textarea className="form-control" rows={3} onChange={handleReviewChange} name="review" defaultValue={studentReview?.review} />
                              </div>
                              <div className="col-12 d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary">
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
              <input value={createNote.title} name="title" onChange={handleNoteChange} type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">İçerik</label>
              <textarea value={createNote.note} name="note" onChange={handleNoteChange} className="form-control" cols={30} rows={8} required />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleNoteClose}>
                Kapat
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedNote?.id ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Conversation Modal: (Artık sağdaki panel ile büyük oranda redundant, ama istersen korunuyor) */}
      <Modal show={false} size="lg" onHide={() => {}} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konuşma</Modal.Title>
        </Modal.Header>
        <Modal.Body>—</Modal.Body>
      </Modal>

      {/* Soru Sor Modal */}
      <Modal show={addQuestionShow} size="lg" onHide={handleQuestionClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Soru Sor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label className="form-label">Soru Başlığı</label>
              <input value={createMessage.title} name="title" onChange={handleMessageChange} type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Mesaj</label>
              <textarea value={createMessage.message} name="message" onChange={handleMessageChange} className="form-control" cols={30} rows={8} required />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleQuestionClose}>
                Kapat
              </button>
              <button type="submit" className="btn btn-primary">
                Mesaj Gönder
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <ESKEPBaseFooter />
    </>
  );
}

export default OdevDetail;

/** Simple Empty State */
function EmptyState({ title = "Kayıt bulunamadı", subtitle = "" }) {
  return (
    <div className="text-center p-4 border rounded-3 bg-white">
      <div className="display-6 mb-2">🗂️</div>
      <h6 className="mb-1">{title}</h6>
      {subtitle && <div className="text-muted small">{subtitle}</div>}
    </div>
  );
}

/** Loading Skeletons */
function SkeletonCurriculum() {
  return (
    <div className="vstack gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-3 bg-white border rounded-3">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
            <span className="placeholder col-4 ms-2"></span>
          </div>
          <div className="mt-2 placeholder-glow">
            <span className="placeholder col-12"></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonNotes() {
  return (
    <div className="vstack gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-3 bg-white border rounded-3">
          <div className="placeholder-glow">
            <span className="placeholder col-5"></span>
          </div>
          <div className="mt-2 placeholder-glow">
            <span className="placeholder col-9"></span>
          </div>
        </div>
      ))}
    </div>
  );
}
