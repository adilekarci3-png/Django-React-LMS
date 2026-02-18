// src/pages/EskepStajerOdevDetail.jsx
// Route: /eskepstajer/odevs/:id/:koordinator_id/
//
// API ÖZET (Swagger'a göre):
//   GET    eskepstajer/odev-detail/{user_id}/{id}/
//   POST   eskepstajer/odev-note/{koordinator_id}/{id}/
//   PATCH  eskepstajer/odev-note/{koordinator_id}/{id}/
//   DELETE eskepstajer/odev-note/{koordinator_id}/{id}/
//   POST   eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{id}/   ← belirli not işlemleri için
//   PATCH  eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{id}/
//   DELETE eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{id}/
//   GET    eskepstajer/question-answer-list-create/{odev_id}/
//   POST   eskepstajer/question-answer-list-create/{odev_id}/
//   POST   eskepstajer/question-answer-message-create/

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import "moment/locale/tr";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { buildImg, FALLBACK_SRC } from "../../utils/buildImg";

function EskepStajerOdevDetail() {
  const api = useAxios();
  const userData = useUserData();
  const { id, koordinator_id } = useParams(); // id = odev_id

  const [detail, setDetail] = useState(null);
  const [variantItem, setVariantItem] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [fetching, setFetching] = useState(true);

  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteShow, setNoteShow] = useState(false);

  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);

  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState(null);

  const [show, setShow] = useState(false);
  const lastElementRef = useRef(null);

  useEffect(() => { moment.locale("tr"); }, []);

  const handleClose = () => setShow(false);
  const handleShow = (item) => { setVariantItem(item); setShow(true); };

  const handleNoteClose = () => { setNoteShow(false); setSelectedNote(null); setCreateNote({ title: "", note: "" }); };
  const handleNoteShow = (note = null) => {
    setSelectedNote(note);
    setCreateNote({ title: note?.title || "", note: note?.note || "" });
    setNoteShow(true);
  };

  // ── GET /eskepstajer/odev-detail/{user_id}/{id}/ ─────────────
  const fetchDetail = async () => {
    if (!userData?.user_id || !id) return;
    try {
      setFetching(true);
      const res = await api.get(`eskepstajer/odev-detail/${userData.user_id}/${id}/`);
      const data = res.data || {};
      setDetail(data);
      setQuestions(data?.question_answers || []);
      setStudentReview(data?.review || null);

      const totalCurriculum = (data?.curriculum || []).reduce((s, v) => s + (v?.variant_items?.length || 0), 0);
      const total = totalCurriculum || data?.lectures?.length || 0;
      const completed = data?.completed_lesson?.length || 0;
      setCompletionPercentage(total ? Math.round((completed / total) * 100) : 0);
    } catch (e) {
      console.error(e);
      try { Toast().fire({ icon: "error", title: "Detay alınamadı" }); } catch (_) {}
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [userData?.user_id, id]); // eslint-disable-line

  const handleMarkLessonAsCompleted = async (variantItemId) => {
    try {
      const fd = new FormData();
      fd.append("user_id", userData?.user_id);
      fd.append("odev_id", id);
      fd.append("variant_item_id", variantItemId);
      await api.post(`eskepstajer/odev-completed/`, fd);
      await fetchDetail();
    } catch (e) { console.error(e); }
  };

  // ── Notes ─────────────────────────────────────────────────────
  // Not oluşturma: POST /eskepstajer/odev-note/{koordinator_id}/{id}/
  // Not düzenleme: PATCH /eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{note_id}/
  // Not silme:    DELETE /eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{note_id}/
  const handleNoteChange = (e) => setCreateNote((n) => ({ ...n, [e.target.name]: e.target.value }));

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", createNote.title.trim());
    fd.append("note", createNote.note.trim());
    try {
      if (selectedNote?.id) {
        // PATCH /eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{id}/
        await api.patch(`eskepstajer/odev-note-detail/${koordinator_id}/${id}/${selectedNote.id}/`, fd);
        Toast().fire({ icon: "success", title: "Not güncellendi" });
      } else {
        // POST /eskepstajer/odev-note/{koordinator_id}/{id}/
        await api.post(`eskepstajer/odev-note/${koordinator_id}/${id}/`, fd);
        Toast().fire({ icon: "success", title: "Not eklendi" });
      }
      await fetchDetail();
      handleNoteClose();
    } catch (e) {
      Toast().fire({ icon: "error", title: "Not kaydedilemedi" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      // DELETE /eskepstajer/odev-note-detail/{koordinator_id}/{odev_id}/{note_id}/
      await api.delete(`eskepstajer/odev-note-detail/${koordinator_id}/${id}/${noteId}/`);
      await fetchDetail();
      Toast().fire({ icon: "success", title: "Not silindi" });
    } catch (e) {
      Toast().fire({ icon: "error", title: "Not silinemedi" });
    }
  };

  // ── Konuşma ───────────────────────────────────────────────────
  // GET/POST /eskepstajer/question-answer-list-create/{odev_id}/
  const handleMessageChange = (e) => setCreateMessage((m) => ({ ...m, [e.target.name]: e.target.value }));

  const refreshConversation = async (questionId) => {
    try {
      setConversationLoading(true);
      const res = await api.get(`eskepstajer/question-answer-list-create/${id}/`);
      const list = res.data || [];
      setQuestions(list);
      setSelectedConversation(list.find((q) => q.id === questionId) || null);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const title = createMessage.title?.trim();
    const message = createMessage.message?.trim();
    if (!title || !message) { Toast().fire({ icon: "error", title: "Başlık ve mesaj giriniz" }); return; }
    const fd = new FormData();
    fd.append("odev_id", id);
    fd.append("gonderen_id", userData?.user_id);
    fd.append("title", title);
    fd.append("message", message);
    const res = await api.post(`eskepstajer/question-answer-list-create/${id}/`, fd);
    const newQid = res?.data?.question_id;
    await fetchDetail();
    if (newQid) await refreshConversation(newQid);
    setCreateMessage({ title: "", message: "" });
    setQuestionModal(false);
    Toast().fire({ icon: "success", title: "Mesaj gönderildi" });
  };

  const sendNewMessage = async (e) => {
    e.preventDefault();
    const msg = createMessage.message?.trim();
    if (!msg || !selectedConversation?.id) return;
    const fd = new FormData();
    fd.append("odev_id", id);
    fd.append("gonderen_id", userData?.user_id);
    fd.append("question_id", selectedConversation.id);
    fd.append("message", msg);
    await api.post(`eskepstajer/question-answer-message-create/`, fd);
    await refreshConversation(selectedConversation.id);
    setCreateMessage({ title: "", message: "" });
  };

  useEffect(() => {
    if (lastElementRef.current) lastElementRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  const handleSearchQuestion = (e) => {
    const q = e.target.value.toLowerCase();
    setQuestions(!q ? detail?.question_answers || [] : (detail?.question_answers || []).filter((it) => it?.title?.toLowerCase().includes(q)));
  };

  const handleReviewChange = (e) => setCreateReview((r) => ({ ...r, [e.target.name]: e.target.value }));

  const handleCreateReviewSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("odev_id", detail?.odev?.id || detail?.id);
    fd.append("user_id", userData?.user_id);
    fd.append("rating", createReview.rating);
    fd.append("review", createReview.review);
    await api.post(`eskepstajer/rate-odev/`, fd);
    await fetchDetail();
    Toast().fire({ icon: "success", title: "Yorum oluşturuldu" });
  };

  const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("odev", detail?.odev?.id || detail?.id);
    fd.append("user", userData?.user_id);
    fd.append("rating", createReview.rating || studentReview?.rating);
    fd.append("review", createReview.review || studentReview?.review);
    await api.patch(`eskepstajer/review-detail/${userData?.user_id}/${studentReview?.id}/`, fd);
    await fetchDetail();
    Toast().fire({ icon: "success", title: "Yorum güncellendi" });
  };

  const isItemCompleted = (item) => {
    const itemId = item?.id ?? item?.variant_item_id;
    return detail?.completed_lesson?.some((cl) => cl?.variant_item?.id === itemId) || false;
  };

  const totalCounts = useMemo(() => ({
    variants: (detail?.curriculum || []).length,
    lessons: (detail?.curriculum || []).reduce((s, v) => s + (v?.variant_items?.length || 0), 0),
    notes: detail?.notes?.length || 0,
    questions: (detail?.question_answers || []).length,
  }), [detail]);

  const handleImgError = (e) => { e.target.onerror = null; e.target.src = FALLBACK_SRC; };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="py-4 py-md-5 bg-light eskep-detail-layout">
        <div className="container-xxl">
          <Header />
          <div className="row g-4 mt-0 mt-md-4 align-items-start">
            <div className="col-lg-4 col-xl-3"><Sidebar /></div>
            <div className="col-lg-8 col-xl-9">

              {/* Özet */}
              <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="mb-0">Ödev Detayı</h5>
                    {fetching && <span className="badge bg-secondary">Yükleniyor</span>}
                  </div>
                  <div className="small text-muted mb-3">{detail?.odev?.title || detail?.title || "—"}</div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-semibold">Tamamlama</span>
                      <span className="small fw-bold">{completionPercentage}%</span>
                    </div>
                    <div className="progress" style={{ height: 10 }}>
                      <div className="progress-bar" role="progressbar" style={{ width: `${completionPercentage}%` }} aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100} />
                    </div>
                  </div>
                  <div className="row text-center g-2">
                    {[["Bölüm", totalCounts.variants], ["Ders", totalCounts.lessons], ["Not", totalCounts.notes], ["Konuşma", totalCounts.questions]].map(([label, val]) => (
                      <div className="col-6 col-md-3" key={label}>
                        <div className="p-2 border rounded-3 bg-white">
                          <div className="small text-muted">{label}</div>
                          <div className="fw-bold">{val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sekmeler */}
              <div className="card shadow rounded-3 border-0">
                <div className="card-header bg-white border-0 px-3 px-md-4 pt-3 pb-0">
                  <ul className="nav nav-pills gap-2 flex-wrap" role="tablist">
                    {[["#od-1","Bölümler",true],["#od-2","Notlar"],["#od-3","Konuşma"],["#od-4","Not Ver"]].map(([target,label,active]) => (
                      <li className="nav-item" role="presentation" key={target}>
                        <button className={`nav-link ${active ? "active" : ""}`} data-bs-toggle="pill" data-bs-target={target} type="button">{label}</button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-body p-3 p-md-4">
                  <div className="tab-content">

                    {/* BÖLÜMLER */}
                    <div className="tab-pane fade show active" id="od-1">
                      {fetching ? <SkeletonCurriculum /> : (
                        <div className="accordion" id="accOd">
                          {(detail?.lectures || []).map((c, i) => (
                            <div key={i} className="p-3 border rounded-3 mb-2 bg-white d-flex justify-content-between">
                              <span className="fw-semibold">{c?.name}</span>
                              <span className="badge bg-light text-dark">{c?.content_duration || "0m 0s"}</span>
                            </div>
                          ))}
                          {(detail?.curriculum || []).map((c, index) => (
                            <div className="accordion-item border rounded-3 overflow-hidden mb-3" key={index}>
                              <h2 className="accordion-header">
                                <button className="accordion-button collapsed bg-white fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target={`#col-od-${c?.variant_id}`}>
                                  <div className="d-flex align-items-center w-100">
                                    <span className="me-2">{c?.title}</span>
                                    <span className="badge bg-secondary-subtle text-dark ms-auto">{c?.variant_items?.length || 0} Ders</span>
                                  </div>
                                </button>
                              </h2>
                              <div id={`col-od-${c?.variant_id}`} className="accordion-collapse collapse" data-bs-parent="#accOd">
                                <div className="accordion-body bg-light">
                                  {(c?.variant_items || []).map((l, idx) => {
                                    const itemId = l?.id ?? l?.variant_item_id;
                                    const completed = isItemCompleted(l);
                                    return (
                                      <div key={idx} className="p-3 bg-white rounded-3 mb-2 border">
                                        <div className="d-flex justify-content-between align-items-center gap-3">
                                          <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <span className={`badge ${completed ? "bg-success" : "bg-light text-dark"}`}>{completed ? "Tamamlandı" : "Bekliyor"}</span>
                                            {l?.file ? <a href={l.file} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm"><i className="fas fa-file-pdf me-1" />PDF'yi Görüntüle</a> : <span className="text-muted small">PDF yok</span>}
                                            {l?.video_url && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleShow(l)}><i className="fas fa-play me-1" />Videoyu Aç</button>}
                                          </div>
                                          <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted small">{l?.content_duration || "0m 0s"}</span>
                                            <input type="checkbox" className="form-check-input" onChange={() => handleMarkLessonAsCompleted(itemId)} checked={completed} />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                          {!(detail?.curriculum?.length) && !(detail?.lectures?.length) && <EmptyState title="İçerik Bulunamadı" subtitle="Henüz ders veya müfredat eklenmemiş." />}
                        </div>
                      )}
                    </div>

                    {/* NOTLAR */}
                    <div className="tab-pane fade" id="od-2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Notlar</h5>
                        <Button className="btn btn-primary" onClick={() => handleNoteShow()}>Not Ekle <i className="fas fa-pen" /></Button>
                      </div>
                      {fetching ? <SkeletonNotes /> : (
                        <div className="vstack gap-3">
                          {(detail?.notes || []).map((n) => (
                            <div key={n?.id} className="border rounded-3 p-3 bg-white shadow-sm">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{n?.title}</h6>
                                  <p className="mb-0 text-muted">{n?.note || n?.notes}</p>
                                </div>
                                <div className="ms-3 d-flex gap-2">
                                  <button type="button" onClick={() => handleNoteShow(n)} className="btn btn-sm btn-outline-success"><i className="bi bi-pencil-square me-1" />Düzenle</button>
                                  <button type="button" onClick={() => handleDeleteNote(n?.id)} className="btn btn-sm btn-outline-danger"><i className="bi bi-trash me-1" />Sil</button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!(detail?.notes?.length) && <EmptyState title="Not Bulunamadı" subtitle="Henüz not eklenmemiş." />}
                        </div>
                      )}
                    </div>

                    {/* KONUŞMA */}
                    <div className="tab-pane fade" id="od-3">
                      <div className="row g-3">
                        <div className="col-lg-5">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="input-group mb-3">
                                <input className="form-control" type="search" placeholder="Konuşmalarda ara" onChange={handleSearchQuestion} />
                                <button className="btn btn-outline-primary" type="button" onClick={() => setQuestionModal(true)}>Soru Sor</button>
                              </div>
                              <div className="vstack gap-2" style={{ maxHeight: 480, overflowY: "auto" }}>
                                {(questions || []).map((q) => (
                                  <button key={q?.id} className={`text-start p-3 rounded-3 border ${selectedConversation?.id === q?.id ? "bg-primary text-white" : "bg-white"}`} onClick={() => { setSelectedConversation(q); refreshConversation(q.id); }}>
                                    <div className="d-flex align-items-center gap-2">
                                      <img src={buildImg(q?.profile?.image)} onError={handleImgError} alt="avatar" className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover" }} />
                                      <div>
                                        <div className="fw-semibold small mb-1">{q?.profile?.full_name}</div>
                                        <div className="small text-truncate" style={{ maxWidth: 220 }}>{q?.title}</div>
                                        <div className="small opacity-75">{moment(q?.date).format("DD MMM, YYYY")}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {!(questions?.length) && <EmptyState title="Konuşma yok" subtitle="Yeni bir soru oluşturarak başlayın." />}
                              </div>
                            </div>
                          </div>
                        </div>
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
                                    {conversationLoading ? <div className="text-center py-5">Yükleniyor…</div> : (
                                      <div className="p-3">
                                        {(selectedConversation?.messages || []).map((m, i) => (
                                          <div key={m?.id || i} className="d-flex gap-2 mb-3">
                                            <img className="rounded-circle mt-1" src={buildImg(m?.profile?.image)} onError={handleImgError} style={{ width: 36, height: 36, objectFit: "cover" }} alt="user" />
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
                                    <button className="btn btn-primary" type="submit">Gönder <i className="fas fa-paper-plane" /></button>
                                  </form>
                                </>
                              ) : <EmptyState title="Konuşma seçilmedi" subtitle="Soldan bir konuşma seçin veya yeni bir soru oluşturun." />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NOT VER */}
                    <div className="tab-pane fade" id="od-4">
                      <div className="card border-0">
                        <div className="card-body p-0">
                          <h5 className="mb-3">{studentReview?.rating ? `Notunuz: ${studentReview.rating}/5` : "Not Ver"}</h5>
                          <form className="row g-3" onSubmit={!studentReview ? handleCreateReviewSubmit : handleUpdateReviewSubmit}>
                            <div className="col-12">
                              <label className="form-label">Puan</label>
                              <select className="form-select" onChange={handleReviewChange} name="rating" defaultValue={studentReview?.rating || 1}>
                                {[1,2,3,4,5].map((v) => <option key={v} value={v}>{"★".repeat(v)}{"☆".repeat(5-v)} ({v}/5)</option>)}
                              </select>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Yorum</label>
                              <textarea className="form-control" rows={3} onChange={handleReviewChange} name="review" defaultValue={studentReview?.review || ""} />
                            </div>
                            <div className="col-12 d-flex justify-content-end">
                              <button type="submit" className="btn btn-primary">{studentReview ? "Yorumu Güncelle" : "Not Ver"}</button>
                            </div>
                          </form>
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

      {/* Video Modal */}
      <Modal show={show} size="lg" onHide={handleClose} centered>
        <Modal.Header closeButton><Modal.Title>Ders: {variantItem?.title}</Modal.Title></Modal.Header>
        <Modal.Body><ReactPlayer url={variantItem?.file || variantItem?.video_url} controls width="100%" height="100%" /></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={handleClose}>Kapat</Button></Modal.Footer>
      </Modal>

      {/* Not Modal */}
      <Modal show={noteShow} size="lg" onHide={handleNoteClose} centered>
        <Modal.Header closeButton><Modal.Title>{selectedNote?.id ? `Notu Düzenle: ${selectedNote.title}` : "Yeni Not Ekle"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitNote}>
            <div className="mb-3">
              <label className="form-label">Not Başlığı</label>
              <input value={createNote.title} name="title" onChange={handleNoteChange} type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">İçerik</label>
              <textarea value={createNote.note} name="note" onChange={handleNoteChange} className="form-control" rows={8} required />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleNoteClose}>Kapat</button>
              <button type="submit" className="btn btn-primary">{selectedNote?.id ? "Güncelle" : "Kaydet"}</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Soru Modal */}
      <Modal show={questionModal} size="lg" onHide={() => setQuestionModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Soru Sor</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label className="form-label">Soru Başlığı</label>
              <input value={createMessage.title} name="title" onChange={handleMessageChange} type="text" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Mesaj</label>
              <textarea value={createMessage.message} name="message" onChange={handleMessageChange} className="form-control" rows={8} required />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setQuestionModal(false)}>Kapat</button>
              <button type="submit" className="btn btn-primary">Mesaj Gönder</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <ESKEPBaseFooter />
    </>
  );
}

export default EskepStajerOdevDetail;

function EmptyState({ title = "Kayıt bulunamadı", subtitle = "" }) {
  return (
    <div className="text-center p-4 border rounded-3 bg-white">
      <div className="display-6 mb-2">🗂️</div>
      <h6 className="mb-1">{title}</h6>
      {subtitle && <div className="text-muted small">{subtitle}</div>}
    </div>
  );
}
function SkeletonCurriculum() {
  return <div className="vstack gap-2">{Array.from({length:4}).map((_,i)=><div key={i} className="p-3 bg-white border rounded-3"><div className="placeholder-glow"><span className="placeholder col-6"></span></div></div>)}</div>;
}
function SkeletonNotes() {
  return <div className="vstack gap-2">{Array.from({length:3}).map((_,i)=><div key={i} className="p-3 bg-white border rounded-3"><div className="placeholder-glow"><span className="placeholder col-5"></span></div></div>)}</div>;
}