import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import "moment/locale/tr";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

moment.locale("tr");

function DersSonuRaporuDetail() {
  const api = useAxios();
  const userData = useUserData();
  const { dersSonuRaporu_id } = useParams();

  const [detail, setDetail] = useState(null);
  const [variantItem, setVariantItem] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState({});
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null);

  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);

  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState(null);

  const [askModalOpen, setAskModalOpen] = useState(false);

  const lastElementRef = useRef(null);
  const askTitleRef = useRef(null);

  // Video modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (variant_item) => {
    setVariantItem(variant_item);
    setShow(true);
  };

  // Note modal
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

  // Fetch detail (memoize + reuse for refresh)
  const fetchDetail = useCallback(async () => {
    if (!userData?.user_id || !dersSonuRaporu_id) return;
    try {
      setFetching(true);
      setError("");
      const res = await api.get(
        `eskepinstructor/derssonuraporu-detail/${dersSonuRaporu_id}/${userData.user_id}/`
      );
      const data = res.data || {};
      setDetail(data);
      setQuestions(data?.question_answers || []);
      setStudentReview(data?.review || null);

      const totalFromCurriculum = (data?.curriculum || []).reduce(
        (sum, v) => sum + (v?.variant_items?.length || 0),
        0
      );
      const totalLectures = data?.lectures?.length || 0;
      const total = totalFromCurriculum || totalLectures || 0;
      const completed = data?.completed_lesson?.length || 0;
      setCompletionPercentage(total ? Math.round((completed / total) * 100) : 0);
    } catch (e) {
      console.error(e);
      setError("Detay alınamadı");
      try { Toast().fire({ icon: "error", title: "Detay alınamadı" }); } catch(_) {}
    } finally {
      setFetching(false);
    }
  }, [api, dersSonuRaporu_id, userData?.user_id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  // Complete lesson
  const handleMarkLessonAsCompleted = async (variantItemId) => {
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Updating" }));
    try {
      const formdata = new FormData();
      formdata.append("user_id", userData?.user_id || 0);
      formdata.append("dersSonuRaporu_id", dersSonuRaporu_id);
      formdata.append("variant_item_id", variantItemId);
      await api.post(`instructor/derssonuraporu-completed/`, formdata);
      await fetchDetail();
      setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Updated" }));
    } catch (e) {
      setMarkAsCompletedStatus((s) => ({ ...s, [key]: "Error" }));
    }
  };

  // Notes
  const handleNoteChange = (e) => {
    setCreateNote((n) => ({ ...n, [e.target.name]: e.target.value }));
  };
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("koordinator_id", userData?.user_id);
    fd.append("dersSonuRaporu_id", dersSonuRaporu_id);
    fd.append("title", (createNote.title || "").trim());
    fd.append("note", (createNote.note || "").trim());
    try {
      if (selectedNote?.id) {
        await api.patch(
          `eskepinstructor/derssonuraporu-note-detail/${dersSonuRaporu_id}/${userData?.user_id}/${selectedNote.id}/`,
          fd
        );
        Toast().fire({ icon: "success", title: "Not güncellendi" });
      } else {
        await api.post(
          `eskepinstructor/derssonuraporu-note/${dersSonuRaporu_id}/${userData?.user_id}/`,
          fd
        );
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
      await api.delete(
        `eskepinstructor/derssonuraporu-note-detail/${dersSonuRaporu_id}/${userData?.user_id}/${noteId}/`
      );
      await fetchDetail();
      Toast().fire({ icon: "success", title: "Not silindi" });
    } catch (e) {
      Toast().fire({ icon: "error", title: "Not silinemedi" });
    }
  };

  // QA
  const handleMessageChange = (e) => {
    setCreateMessage((m) => ({ ...m, [e.target.name]: e.target.value }));
  };
  const refreshConversation = async (questionId) => {
    try {
      setConversationLoading(true);
      const res = await api.get(
        `eskepinstructor/question-answer-list-create/${dersSonuRaporu_id}/`
      );
      const list = res.data || [];
      setQuestions(list);
      const fresh = list.find((q) => q.id === questionId) || null;
      setSelectedConversation(fresh);
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
    const fd = new FormData();
    fd.append("dersSonuRaporu_id", dersSonuRaporu_id);
    fd.append("gonderen_id", userData?.user_id);
    fd.append("title", title);
    fd.append("message", message);
    const res = await api.post(
      `eskepinstructor/question-answer-list-create/${dersSonuRaporu_id}/`,
      fd
    );
    const newQid = res?.data?.question_id;
    await fetchDetail();
    if (newQid) await refreshConversation(newQid);
    setCreateMessage({ title: "", message: "" });
    setAskModalOpen(false);
    Toast().fire({ icon: "success", title: "Mesaj gönderildi" });
  };
  const sendNewMessage = async (e) => {
    e.preventDefault();
    if (!selectedConversation?.id) {
      Toast().fire({ icon: "error", title: "Önce bir konuşma seçin" });
      return;
    }
    const msg = createMessage.message?.trim();
    if (!msg) return;
    const fd = new FormData();
    fd.append("dersSonuRaporu_id", dersSonuRaporu_id);
    fd.append("gonderen_id", userData?.user_id);
    fd.append("question_id", selectedConversation.id);
    fd.append("message", msg);
    await api.post(`eskepinstructor/question-answer-message-create/`, fd);
    await refreshConversation(selectedConversation.id);
    setCreateMessage({ title: "", message: "" });
  };

  useEffect(() => {
    if (lastElementRef.current) lastElementRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  const handleSearchQuestion = (e) => {
    const q = e.target.value.toLowerCase();
    if (!q) {
      setQuestions(detail?.question_answers || []);
      return;
    }
    setQuestions((detail?.question_answers || []).filter((it) => it?.title?.toLowerCase().includes(q)));
  };

  // Review
  const handleReviewChange = (e) => {
    setCreateReview((r) => ({ ...r, [e.target.name]: e.target.value }));
  };
  const handleCreateReviewSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("dersSonuRaporu_id", detail?.dersSonuRaporu?.id || detail?.id);
    fd.append("user_id", userData?.user_id);
    fd.append("rating", createReview.rating);
    fd.append("review", createReview.review);
    await api.post(`stajer/rate-derssonuraporu/`, fd);
    await fetchDetail();
    Toast().fire({ icon: "success", title: "Yorum oluşturuldu" });
  };
  const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("dersSonuRaporu", detail?.dersSonuRaporu?.id || detail?.id);
    fd.append("user", userData?.user_id);
    fd.append("rating", createReview.rating || studentReview?.rating);
    fd.append("review", createReview.review || studentReview?.review);
    await api.patch(`stajer/review-detail/${userData?.user_id}/${studentReview?.id}/`, fd);
    await fetchDetail();
    Toast().fire({ icon: "success", title: "Yorum güncellendi" });
  };

  const isItemCompleted = (item) => {
    const itemId = item?.id ?? item?.variant_item_id;
    return detail?.completed_lesson?.some((cl) => cl?.variant_item?.id === itemId) || false;
  };

  const totalCounts = useMemo(() => {
    const lessonCount = (detail?.curriculum || []).reduce(
      (sum, v) => sum + (v?.variant_items?.length || 0),
      0
    );
    return {
      variants: (detail?.curriculum || []).length,
      lessons: lessonCount,
      notes: detail?.notes?.length || 0,
      questions: (detail?.question_answers || []).length,
    };
  }, [detail]);

  // helpers
  const avatarSrc = (url) => {
    if (!url) return "https://ui-avatars.com/api/?name=?&background=ddd&color=555";
    return url.startsWith("http://127.0.0.1:8000") ? url : `http://127.0.0.1:8000${url}`;
  };

  return (
    <>
      <ESKEPBaseHeader />

      <section className="py-4 py-md-5 bg-light">
        <div className="container-xxl">
          <Header />

          {/* Üst araç çubuğu */}
          <div className="d-flex align-items-center justify-content-between mt-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <h4 className="mb-0">Ders Sonu Raporu</h4>
              {fetching && <span className="badge bg-secondary">Yükleniyor</span>}
              {error && <span className="badge bg-danger">{error}</span>}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={fetchDetail} title="Yenile">
                <i className="fas fa-rotate" /> Yenile
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setAskModalOpen(true); setTimeout(() => askTitleRef.current?.focus(), 50); }}
              >
                <i className="fas fa-question-circle me-1" /> Soru Sor
              </button>
            </div>
          </div>

          <div className="row g-4 g-lg-5">
            {/* SOL: Sidebar (mini kart) */}
            <div className="col-lg-3 col-xl-3">
              <div className="position-sticky" style={{ top: 88 }}>
                <div className="card border-0 shadow-sm rounded-3 mb-3">
                  <div className="card-body p-2 p-md-3">
                    <Sidebar />
                  </div>
                </div>

                {/* Mini özet kutuları */}
                <div className="vstack gap-2">
                  <MiniStat label="Tamamlama" value={`${completionPercentage}%`} />
                  <MiniStat label="Bölüm" value={totalCounts.variants} />
                  <MiniStat label="Ders" value={totalCounts.lessons} />
                  <MiniStat label="Not" value={totalCounts.notes} />
                  <MiniStat label="Konuşma" value={totalCounts.questions} />
                </div>
              </div>
            </div>

            {/* SAĞ: İçerik */}
            <div className="col-lg-9 col-xl-9">
              {/* Özeti */}
              <div className="card border-0 shadow-sm rounded-3 mb-3">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="mb-0">Rapor Özeti</h5>
                  </div>

                  <div className="small text-muted mb-3">
                    {detail?.derssonuraporu?.title || detail?.title || "—"}
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
                </div>
              </div>

              {/* Sekmeler */}
              <div className="card shadow rounded-3 border-0">
                <div className="card-header bg-white border-0 px-3 px-md-4 pt-3 pb-0">
                  <ul className="nav nav-pills gap-2 flex-wrap" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active" data-bs-toggle="pill" data-bs-target="#dsr-1" type="button">
                        Bölümler
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" data-bs-toggle="pill" data-bs-target="#dsr-2" type="button">
                        Notlar
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" data-bs-toggle="pill" data-bs-target="#dsr-3" type="button">
                        Konuşma
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" data-bs-toggle="pill" data-bs-target="#dsr-4" type="button">
                        Not Ver
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="card-body p-3 p-md-4">
                  <div className="tab-content">
                    {/* Bölümler */}
                    <div className="tab-pane fade show active" id="dsr-1">
                      {fetching ? (
                        <SkeletonCurriculum />
                      ) : (
                        <div className="accordion" id="accDsr">
                          {(detail?.lectures || []).length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-uppercase text-muted small mb-2">Dersler</h6>
                              {(detail?.lectures || []).map((c, i) => (
                                <div key={i} className="p-3 border rounded-3 mb-2 bg-white d-flex justify-content-between">
                                  <span className="fw-semibold">{c?.name}</span>
                                  <span className="badge bg-light text-dark">{c?.content_duration || "0m 0s"}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {(detail?.curriculum || []).map((c, index) => (
                            <div className="accordion-item border rounded-3 overflow-hidden mb-3" key={index}>
                              <h2 className="accordion-header" id={`h-${index}`}>
                                <button
                                  className="accordion-button collapsed bg-white fw-semibold"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#col-${c?.variant_id}`}
                                >
                                  <div className="d-flex align-items-center w-100">
                                    <span className="me-2">{c?.title}</span>
                                    <span className="badge bg-secondary-subtle text-dark ms-auto">
                                      {c?.variant_items?.length || 0} Ders
                                    </span>
                                  </div>
                                </button>
                              </h2>
                              <div id={`col-${c?.variant_id}`} className="accordion-collapse collapse" data-bs-parent="#accDsr">
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
                                              <a
                                                href={l.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-primary btn-sm"
                                              >
                                                <i className="fas fa-file-pdf me-1" /> PDF'yi Görüntüle
                                              </a>
                                            ) : (
                                              <span className="text-muted small">PDF yok</span>
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

                          {(detail?.curriculum?.length || 0) < 1 &&
                            (detail?.lectures?.length || 0) < 1 && (
                              <EmptyState title="İçerik Bulunamadı" subtitle="Henüz ders veya müfredat eklenmemiş." />
                            )}
                        </div>
                      )}
                    </div>

                    {/* Notlar */}
                    <div className="tab-pane fade" id="dsr-2">
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
                          {(detail?.notes || []).map((n) => (
                            <div key={n?.id} className="border rounded-3 p-3 bg-white shadow-sm">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{n?.title}</h6>
                                  <p className="mb-0 text-muted">{n?.note || n?.notes}</p>
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

                          {(detail?.notes?.length || 0) < 1 && (
                            <EmptyState title="Not Bulunamadı" subtitle="Henüz not eklenmemiş." />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Konuşma */}
                    <div className="tab-pane fade" id="dsr-3">
                      <div className="row g-3">
                        {/* Sol: liste */}
                        <div className="col-lg-5">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="input-group mb-3">
                                <input className="form-control" type="search" placeholder="Konuşmalarda ara" onChange={handleSearchQuestion} />
                                <button
                                  className="btn btn-outline-primary"
                                  type="button"
                                  onClick={() => { setAskModalOpen(true); setTimeout(() => askTitleRef.current?.focus(), 50); }}
                                >
                                  Soru Sor
                                </button>
                              </div>
                              <div className="vstack gap-2" style={{ maxHeight: 480, overflowY: "auto" }}>
                                {(questions || []).map((q) => (
                                  <button
                                    key={q?.id}
                                    className={`text-start p-3 rounded-3 border ${selectedConversation?.id === q?.id ? "bg-primary text-white" : "bg-white"}`}
                                    onClick={() => (setSelectedConversation(q), refreshConversation(q.id))}
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <img
                                        src={avatarSrc(q?.profile?.image)}
                                        alt="avatar"
                                        className="rounded-circle"
                                        style={{ width: 40, height: 40, objectFit: "cover" }}
                                      />
                                      <div>
                                        <div className="fw-semibold small mb-1">{q?.profile?.full_name}</div>
                                        <div className="small text-truncate" style={{ maxWidth: 220 }}>
                                          {q?.title}
                                        </div>
                                        <div className="small opacity-75">{moment(q?.date).format("DD MMM, YYYY")}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {(questions?.length || 0) < 1 && (
                                  <EmptyState title="Konuşma yok" subtitle="Yeni bir soru oluşturarak başlayın." />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sağ: mesajlar */}
                        <div className="col-lg-7">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              {selectedConversation ? (
                                <>
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h6 className="mb-0">{selectedConversation?.title}</h6>
                                    <span className="badge bg-light text-dark">
                                      {selectedConversation?.messages?.length || 0} mesaj
                                    </span>
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
                                              src={avatarSrc(m?.profile?.image)}
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
                                    <textarea
                                      name="message"
                                      className="form-control bg-light"
                                      rows={2}
                                      onChange={handleMessageChange}
                                      placeholder="Mesaj yazın (Ctrl+Enter ile gönder)"
                                      value={createMessage.message}
                                      onKeyDown={(e) => {
                                        if (e.ctrlKey && e.key === "Enter") {
                                          sendNewMessage(e);
                                        }
                                      }}
                                      required
                                    />
                                    <button className="btn btn-primary" type="submit" disabled={conversationLoading}>
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
                    <div className="tab-pane fade" id="dsr-4">
                      <div className="card border-0">
                        <div className="card-body p-0">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="mb-0">
                              {studentReview?.rating ? `Notunuz: ${studentReview.rating}/5` : "Not Ver"}
                            </h5>
                          </div>

                          {!studentReview ? (
                            <form className="row g-3" onSubmit={handleCreateReviewSubmit}>
                              <div className="col-12">
                                <label className="form-label">Puan</label>
                                <select className="form-select" onChange={handleReviewChange} name="rating" defaultValue={1}>
                                  <option value={1}>★☆☆☆☆ (1/5)</option>
                                  <option value={2}>★★☆☆☆ (2/5)</option>
                                  <option value={3}>★★★☆☆ (3/5)</option>
                                  <option value={4}>★★★★☆ (4/5)</option>
                                  <option value={5}>★★★★★ (5/5)</option>
                                </select>
                              </div>
                              <div className="col-12">
                                <label className="form-label">Yorum</label>
                                <textarea className="form-control" rows={3} onChange={handleReviewChange} name="review" />
                              </div>
                              <div className="col-12 d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary">Not Ver</button>
                              </div>
                            </form>
                          ) : (
                            <form className="row g-3" onSubmit={handleUpdateReviewSubmit}>
                              <div className="col-12">
                                <label className="form-label">Puan</label>
                                <select className="form-select" onChange={handleReviewChange} name="rating" defaultValue={studentReview?.rating}>
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
                                <button type="submit" className="btn btn-primary">Yorumu Güncelle</button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* /Not Ver */}
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
        <Modal.Body>
          <ReactPlayer url={variantItem?.file || variantItem?.video_url} controls width="100%" height="100%" />
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={handleClose}>Kapat</Button></Modal.Footer>
      </Modal>

      {/* Note Modal */}
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
              <textarea value={createNote.note} name="note" onChange={handleNoteChange} className="form-control" rows={8} required />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleNoteClose}>Kapat</button>
              <button type="submit" className="btn btn-primary">{selectedNote?.id ? "Güncelle" : "Kaydet"}</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Soru Sor Modal (FIX) */}
      <Modal show={askModalOpen} size="lg" onHide={() => setAskModalOpen(false)} centered>
        <Modal.Header closeButton><Modal.Title>Soru Sor</Modal.Title></Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label className="form-label">Soru Başlığı</label>
              <input
                ref={askTitleRef}
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
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setAskModalOpen(false)}>
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

export default DersSonuRaporuDetail;

/* ————— yardımcı küçük bileşenler ————— */

function MiniStat({ label, value }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body py-2">
        <div className="small text-muted">{label}</div>
        <div className="fs-5">{value}</div>
      </div>
    </div>
  );
}

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
