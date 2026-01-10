// DersSonuRaporuDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import moment from "moment";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";

function DersSonuRaporuDetail() {
  const api = useAxios();
  const user = useUserData();
  const { derssonuraporu_id } = useParams();

  // ---- STATE ----
  const [dsr, setDsr] = useState(null);
  const [variantItem, setVariantItem] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Notes
  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteShow, setNoteShow] = useState(false);

  // Q&A
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [conversationShow, setConversationShow] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);

  // Video modal
  const [videoShow, setVideoShow] = useState(false);

  const lastElementRef = useRef(null);

  // ---- MODALS ----
  const openVideo = (item) => {
    setVariantItem(item);
    setVideoShow(true);
  };
  const closeVideo = () => setVideoShow(false);

  const openNoteModal = (note = null) => {
    setSelectedNote(note);
    setCreateNote({ title: note?.title || "", note: note?.note || "" });
    setNoteShow(true);
  };
  const closeNoteModal = () => {
    setNoteShow(false);
    setSelectedNote(null);
    setCreateNote({ title: "", note: "" });
  };

  const openConversation = async (conversation) => {
    setConversationShow(true);
    if (conversation?.id) {
      await refreshConversation(conversation.id);
    } else {
      await refreshConversation();
    }
  };
  const closeConversation = () => setConversationShow(false);

  // ---- FETCH DETAIL ----
  const fetchDetail = async () => {
    try {
      const res = await api.get(
        `eskepinstructor/derssonuraporu-detail/${user?.user_id}/${derssonuraporu_id}/`
      );
      const data = res.data;
      setDsr(data);
      setQuestions(data?.question_answers || []);

      const totalFromCurriculum = (data?.curriculum || []).reduce(
        (sum, v) => sum + (v?.variant_items?.length || 0),
        0
      );
      const totalLectures = data?.lectures?.length || 0;
      const total = totalFromCurriculum || totalLectures || 0;
      const completed = data?.completed_lesson?.length || 0;
      setCompletionPercentage(total > 0 ? Math.round((completed / total) * 100) : 0);
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Detaylar alınamadı" });
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derssonuraporu_id, user?.user_id]);

  // ---- COMPLETION ----
  const handleMarkLessonAsCompleted = async (variantItemId) => {
    try {
      const form = new FormData();
      form.append("user_id", user?.user_id || 0);
      form.append("derssonuraporu_id", dsr?.dersSonuRaporu?.id || derssonuraporu_id);
      form.append("variant_item_id", variantItemId);

      await api.post(`instructor/derssonuraporu-completed/`, form);
      await fetchDetail();
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Ders güncellenemedi" });
    }
  };

  // ---- NOTES ----
  const onNoteChange = (e) =>
    setCreateNote((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submitNote = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("koordinator_id", user?.user_id);
      form.append("derssonuraporu_id", derssonuraporu_id);
      form.append("title", createNote.title);
      form.append("note", createNote.note);

      if (selectedNote?.id) {
        await api.patch(
          `eskepinstructor/derssonuraporu-note-detail/${derssonuraporu_id}/${user?.user_id}/${selectedNote.id}/`,
          form
        );
        Toast().fire({ icon: "success", title: "Not güncellendi" });
      } else {
        await api.post(
          `eskepinstructor/derssonuraporu-note/${derssonuraporu_id}/${user?.user_id}/`,
          form
        );
        Toast().fire({ icon: "success", title: "Not eklendi" });
      }

      await fetchDetail();
      closeNoteModal();
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Not kaydedilemedi" });
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(
        `eskepinstructor/derssonuraporu-note-detail/${derssonuraporu_id}/${user?.user_id}/${noteId}/`
      );
      await fetchDetail();
      Toast().fire({ icon: "success", title: "Not silindi" });
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Not silinemedi" });
    }
  };

  // ---- Q&A ----
  const onMessageChange = (e) =>
    setCreateMessage((s) => ({ ...s, [e.target.name]: e.target.value }));

  const refreshConversation = async (questionId) => {
    try {
      setConversationLoading(true);
      const res = await api.get(
        `eskepinstructor/dsr-question-answer-list-create/${derssonuraporu_id}/`
      );
      const list = res.data || [];
      setQuestions(list);
      const fresh = questionId ? list.find((q) => q.id === questionId) : null;
      setSelectedConversation(fresh || null);
    } catch (e) {
      console.error(e);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const title = createMessage.title?.trim();
    const message = createMessage.message?.trim();

    if (!title || !message) {
      Toast().fire({ icon: "error", title: "Başlık ve mesaj giriniz" });
      return;
    }

    try {
      const form = new FormData();
      form.append("derssonuraporu_id", derssonuraporu_id);
      form.append("user_id", user?.user_id);
      form.append("title", title);
      form.append("message", message);

      await api.post(
        `eskepinstructor/dsr-question-answer-list-create/${derssonuraporu_id}/`,
        form
      );

      setCreateMessage({ title: "", message: "" });
      await refreshConversation();
      setConversationShow(true);
      Toast().fire({ icon: "success", title: "Konuşma başlatıldı" });
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Konuşma başlatılamadı" });
    }
  };

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
      await api.post(
        `eskepinstructor/dsr-question-answer-message-create/${derssonuraporu_id}/`,
        {
          question_id: selectedConversation.id,
          message: msg,
          user_id: user?.user_id,
        }
      );

      await refreshConversation(selectedConversation.id);
      setCreateMessage({ title: "", message: "" });
    } catch (e) {
      console.error(e);
      Toast().fire({ icon: "error", title: "Mesaj gönderilemedi" });
    }
  };

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const onSearchQuestion = (e) => {
    const q = e.target.value.toLowerCase();
    if (!q) {
      setQuestions(dsr?.question_answers || []);
      return;
    }
    const filtered = (dsr?.question_answers || []).filter((x) =>
      x?.title?.toLowerCase?.().includes(q)
    );
    setQuestions(filtered);
  };

  const isItemCompleted = (item) => {
    const itemId = item?.id ?? item?.variant_item_id;
    return (
      dsr?.completed_lesson?.some((cl) => cl?.variant_item?.id === itemId) || false
    );
  };

  // ---- RENDER ----
  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <section className="mt-4">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <div className="card shadow rounded-2 p-0 mt-n5">
                        {/* Tabs */}
                        <div className="card-header border-bottom px-4 pt-3 pb-0">
                          <ul className="nav nav-bottom-line py-0" role="tablist">
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button
                                className="nav-link mb-2 mb-md-0 active"
                                data-bs-toggle="pill"
                                data-bs-target="#dsr-tabs-1"
                                type="button"
                                role="tab"
                                aria-selected="true"
                              >
                                Bölümler
                              </button>
                            </li>
                            <li className="nav-item me-2 me-sm-4" role="presentation">
                              <button
                                className="nav-link mb-2 mb-md-0"
                                data-bs-toggle="pill"
                                data-bs-target="#dsr-tabs-2"
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
                                data-bs-target="#dsr-tabs-3"
                                type="button"
                                role="tab"
                                aria-selected="false"
                              >
                                Konuşma
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Tab contents */}
                        <div className="card-body p-sm-4">
                          <div className="tab-content">
                            {/* Bölümler */}
                            <div className="tab-pane fade show active" id="dsr-tabs-1">
                              <div className="accordion modern-accordion" id="accordionDsr">
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

                                {(dsr?.curriculum || []).map((c, index) => (
                                  <div className="accordion-item modern-item mb-3" key={index}>
                                    <h2 className="accordion-header" id={`heading-${index}`}>
                                      <button
                                        className="accordion-button modern-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse-${c?.variant_id}`}
                                        aria-expanded="false"
                                        aria-controls={`collapse-${c?.variant_id}`}
                                      >
                                        <span className="fw-bold">{c?.title}</span>
                                        <span className="badge bg-secondary ms-2">
                                          {(c?.variant_items?.length || 0)} Ders
                                        </span>
                                      </button>
                                    </h2>

                                    <div
                                      id={`collapse-${c?.variant_id}`}
                                      className="accordion-collapse collapse"
                                      aria-labelledby={`heading-${index}`}
                                      data-bs-parent="#accordionDsr"
                                    >
                                      <div className="accordion-body">
                                        {(c?.variant_items || []).map((l, idx) => {
                                          const itemId = l?.id ?? l?.variant_item_id;
                                          return (
                                            <div
                                              key={idx}
                                              className="lesson-item d-flex justify-content-between"
                                            >
                                              <div>
                                                <strong>
                                                  {l?.title || `Ders ${idx + 1}`}
                                                </strong>
                                                <br />
                                                {l?.file ? (
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
                                                {l?.video_url && (
                                                  <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm ms-2"
                                                    onClick={() => openVideo(l)}
                                                  >
                                                    <i className="fas fa-play me-1" />
                                                    Video
                                                  </button>
                                                )}
                                              </div>
                                              <div className="lesson-info d-flex align-items-center gap-2">
                                                <span className="text-muted">
                                                  {l?.content_duration || "0m 0s"}
                                                </span>
                                                <input
                                                  type="checkbox"
                                                  className="form-check-input"
                                                  onChange={() =>
                                                    handleMarkLessonAsCompleted(itemId)
                                                  }
                                                  checked={isItemCompleted(l)}
                                                />
                                              </div>
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
                            <div className="tab-pane fade" id="dsr-tabs-2">
                              <div className="card">
                                <div className="card-header border-bottom p-0 pb-3 d-flex justify-content-between align-items-center">
                                  <h4 className="mb-0 p-3">Tüm Notlar</h4>
                                  <button
                                    type="button"
                                    className="btn btn-primary me-3"
                                    onClick={() => openNoteModal()}
                                  >
                                    Not Ekle <i className="fas fa-pen"></i>
                                  </button>
                                </div>

                                <div className="card-body p-0 pt-3">
                                  {(dsr?.notes || []).map((n) => (
                                    <div key={n?.id} className="row g-4 p-3">
                                      <div className="col-sm-11 col-xl-11 shadow p-3 m-3 rounded">
                                        <h5>{n?.title}</h5>
                                        <p className="mb-2">{n?.note}</p>
                                        <small className="text-muted">
                                          {moment(n?.date).format("DD MMM, YYYY HH:mm")}
                                        </small>
                                        <div className="hstack gap-3 flex-wrap mt-3">
                                          <button
                                            type="button"
                                            onClick={() => openNoteModal(n)}
                                            className="btn btn-success mb-0"
                                          >
                                            <i className="bi bi-pencil-square me-2" /> Düzenle
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => deleteNote(n?.id)}
                                            className="btn btn-danger mb-0"
                                          >
                                            <i className="bi bi-trash me-2" /> Sil
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {(dsr?.notes?.length || 0) < 1 && (
                                    <p className="mt-3 p-3">Not Bulunamadı</p>
                                  )}
                                  <hr />
                                </div>
                              </div>
                            </div>

                            {/* Konuşma */}
                            <div className="tab-pane fade" id="dsr-tabs-3">
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
                                          onChange={onSearchQuestion}
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
                                      <button
                                        type="button"
                                        className="btn btn-primary mb-0 w-100"
                                        onClick={() => openConversation(null)}
                                      >
                                        Soru Sor
                                      </button>
                                    </div>
                                  </form>
                                </div>

                                <div className="card-body p-0 pt-3">
                                  <div className="vstack gap-3 p-3">
                                    {(questions || []).map((q) => (
                                      <div className="shadow rounded-3 p-3" key={q?.id}>
                                        <div className="d-sm-flex justify-content-sm-between mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="avatar avatar-sm flex-shrink-0">
                                              <img
                                                src={q?.profile?.image}
                                                className="avatar-img rounded-circle"
                                                alt="avatar"
                                                style={{
                                                  width: 60,
                                                  height: 60,
                                                  borderRadius: "50%",
                                                  objectFit: "cover",
                                                }}
                                              />
                                            </div>
                                            <div className="ms-2">
                                              <h6 className="mb-0">
                                                <span className="text-decoration-none text-dark">
                                                  {q?.profile?.full_name}
                                                </span>
                                              </h6>
                                              <small>{moment(q?.date).format("DD MMM, YYYY")}</small>
                                            </div>
                                          </div>
                                        </div>
                                        <h5>{q?.title}</h5>
                                        <button
                                          type="button"
                                          className="btn btn-primary btn-sm mb-3 mt-3"
                                          onClick={() => openConversation(q)}
                                        >
                                          Konuşmaya Katıl <i className="fas fa-arrow-right"></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* /Konuşma */}
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

      {/* Video Modal */}
      <Modal show={videoShow} size="lg" onHide={closeVideo} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ders: {variantItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactPlayer
            url={variantItem?.file || variantItem?.video_url}
            controls
            width={"100%"}
            height={"100%"}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeVideo}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Note Create/Edit Modal */}
      <Modal show={noteShow} size="lg" onHide={closeNoteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedNote?.id ? `Notu Düzenle: ${selectedNote.title}` : "Yeni Not Ekle"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={submitNote}>
            <div className="mb-3">
              <label className="form-label">Not Başlığı</label>
              <input
                value={createNote.title}
                name="title"
                onChange={onNoteChange}
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
                onChange={onNoteChange}
                className="form-control"
                rows={8}
                required
              />
            </div>
            <button type="button" className="btn btn-secondary me-2" onClick={closeNoteModal}>
              Kapat
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedNote?.id ? "Güncelle" : "Kaydet"}
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Conversation Modal */}
      <Modal
        show={conversationShow}
        size="lg"
        onHide={() => {
          setCreateMessage({ title: "", message: "" });
          closeConversation();
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedConversation?.id ? `Konuşma: ${selectedConversation?.title}` : "Soru Sor"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Yeni konuşma modal görünümü */}
          {!selectedConversation?.id ? (
            <form onSubmit={handleSaveQuestion}>
              <div className="mb-3">
                <label className="form-label">Soru Başlığı</label>
                <input
                  value={createMessage.title}
                  name="title"
                  onChange={onMessageChange}
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
                  onChange={onMessageChange}
                  className="form-control"
                  rows={8}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Mesaj Gönder
              </button>
            </form>
          ) : (
            <div className="border p-2 p-sm-4 rounded-3">
              <div className="mb-3">
                <strong>{selectedConversation?.title}</strong>
              </div>

              {conversationLoading ? (
                <div className="text-center py-4">Yükleniyor…</div>
              ) : (
                <ul className="list-unstyled mb-0" style={{ overflowY: "auto", height: 500 }}>
                  {(selectedConversation?.messages || []).map((m, idx) => (
                    <li key={m?.id || idx} className="comment-item mb-3">
                      <div className="d-flex">
                        <div className="avatar avatar-sm flex-shrink-0">
                          <img
                            className="avatar-img rounded-circle"
                            src={
                              m?.profile?.image?.startsWith("http://127.0.0.1:8000")
                                ? m?.profile?.image
                                : `http://127.0.0.1:8000${m?.profile?.image || ""}`
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
                                  <span className="text-decoration-none text-dark">
                                    {m?.profile?.full_name}
                                  </span>
                                  <br />
                                  <span style={{ fontSize: 12, color: "gray" }}>
                                    {moment(m?.date).format("DD MMM, YYYY")}
                                  </span>
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
                  onChange={onMessageChange}
                  value={createMessage.message}
                  placeholder="Mesajınız"
                  required
                />
                <button className="btn btn-primary ms-2 mb-0 w-25" type="submit">
                  Gönder <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <ESKEPBaseFooter />
    </>
  );
}

export default DersSonuRaporuDetail;
