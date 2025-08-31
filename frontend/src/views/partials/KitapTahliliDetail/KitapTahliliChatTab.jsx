// EskepProjeChatTab.jsx
import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import moment from "moment";
import useAxios from "../../../utils/useAxios";
import useUserData from "../../plugin/useUserData";
import Swal from "sweetalert2";

function EskepProjeChatTab({ eskepproje, fetchEskepProjeDetail }) {
  const user = useUserData();

  // --- GÜVENLİ BAŞLANGIÇ ---
  const qaList = Array.isArray(eskepproje?.question_answers)
    ? eskepproje.question_answers
    : [];

  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [filteredQuestions, setFilteredQuestions] = useState(qaList);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [addQuestionShow, setAddQuestionShow] = useState(false);
  const [conversationShow, setConversationShow] = useState(false);
  const lastElementRef = useRef(null);

  // eskepproje geldiğinde listeyi yenile
  useEffect(() => {
    setFilteredQuestions(
      Array.isArray(eskepproje?.question_answers) ? eskepproje.question_answers : []
    );
  }, [eskepproje]);

  // --- ESKEPPROJE HENÜZ YOKSA ERKEN DÖN ---
  if (!eskepproje) {
    return <div>Yükleniyor…</div>;
  }

  const handleSearchQuestion = (e) => {
    const query = e.target.value.toLowerCase();
    const all = Array.isArray(eskepproje?.question_answers)
      ? eskepproje.question_answers
      : [];
    if (!query) return setFilteredQuestions(all);
    setFilteredQuestions(all.filter((q) => (q?.title || "").toLowerCase().includes(query)));
  };

  const handleShowConversation = (question) => {
    setSelectedConversation(question);
    setConversationShow(true);
    setTimeout(() => lastElementRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = (createMessage.message || "").trim();

    if (!selectedConversation?.qa_id) {
      Swal.fire({ icon: "warning", title: "Konuşma seçiniz" });
      return;
    }
    if (!text) return;

    try {
      const formData = new FormData();
      formData.append("eskepproje_id", eskepproje?.id ?? "");
      formData.append("user_id", user?.user_id ?? "");
      formData.append("message", text);
      formData.append("qa_id", selectedConversation.qa_id);

      const res = await useAxios().post(
        `eskepstajer/question-answer-message-create/`,
        formData
      );

      const updated = res?.data?.question || selectedConversation;
      setSelectedConversation(updated);
      setCreateMessage((s) => ({ ...s, message: "" }));
      fetchEskepProjeDetail?.();

      setTimeout(() => lastElementRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Hata!", text: "Mesaj gönderilemedi." });
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const title = (createMessage.title || "").trim();
    const message = (createMessage.message || "").trim();
    if (!title || !message) {
      Swal.fire({ icon: "warning", title: "Başlık ve mesaj zorunludur" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("eskepproje_id", eskepproje?.id ?? "");
      formData.append("user_id", user?.user_id ?? "");
      formData.append("title", title);
      formData.append("message", message);

      await useAxios().post(
        `eskepstajer/question-answer-list-create/${eskepproje?.id}/`,
        formData
      );

      Swal.fire({ icon: "success", title: "Soru gönderildi" });
      setAddQuestionShow(false);
      setCreateMessage({ title: "", message: "" });
      fetchEskepProjeDetail?.();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Hata!", text: "Soru gönderilemedi." });
    }
  };

  useEffect(() => {
    lastElementRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages?.length]);

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Sorularda ara..."
          onChange={handleSearchQuestion}
        />
        <Button onClick={() => setAddQuestionShow(true)}>Soru Sor</Button>
      </div>

      <div className="vstack gap-3">
        {filteredQuestions?.map((q) => (
          <div key={q.qa_id} className="card p-3 shadow-sm">
            <div className="d-flex align-items-center mb-2">
              <img
                src={q?.profile?.image}
                className="rounded-circle"
                style={{ width: 50, height: 50, objectFit: "cover", marginRight: "1rem" }}
                alt="Profil"
              />
              <div>
                <h6 className="mb-0">{q?.profile?.full_name}</h6>
                <small className="text-muted">
                  {q?.date ? moment(q.date).format("DD MMM YYYY") : ""}
                </small>
              </div>
            </div>
            <h5 className="mt-2">{q?.title}</h5>
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-2"
              style={{ width: 100, height: 32, padding: 0 }}
              onClick={() => handleShowConversation(q)}
            >
              <i className="fas fa-comments me-1"></i> Katıl
            </Button>
          </div>
        ))}
        {!filteredQuestions?.length && <p>Hiç soru bulunamadı.</p>}
      </div>

      {/* Soru Ekle Modal */}
      <Modal show={addQuestionShow} onHide={() => setAddQuestionShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Soru Sor</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSaveQuestion}>
          <Modal.Body>
            <div className="mb-3">
              <label>Başlık</label>
              <input
                name="title"
                className="form-control"
                value={createMessage.title}
                onChange={(e) => setCreateMessage({ ...createMessage, title: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Mesaj</label>
              <textarea
                name="message"
                className="form-control"
                rows="5"
                value={createMessage.message}
                onChange={(e) => setCreateMessage({ ...createMessage, message: e.target.value })}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setAddQuestionShow(false)}>
              Kapat
            </Button>
            <Button variant="primary" type="submit">
              Gönder
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Konuşma Modal */}
      <Modal show={conversationShow} onHide={() => setConversationShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedConversation?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {selectedConversation?.messages?.map((m) => (
              <div key={m.id} className="mb-3">
                <div className="d-flex align-items-center mb-1">
                  <img
                    src={m?.profile?.image}
                    className="rounded-circle"
                    style={{ width: 40, height: 40, marginRight: "0.75rem", objectFit: "cover" }}
                    alt="Avatar"
                  />
                  <strong>{m?.profile?.full_name}</strong>
                </div>
                <p className="bg-light p-2 rounded">{m?.message}</p>
                <small className="text-muted">
                  {m?.date ? moment(m.date).format("DD MMM YYYY HH:mm") : ""}
                </small>
              </div>
            ))}
            <div ref={lastElementRef} />
          </div>

          <form className="mt-3 d-flex" onSubmit={handleSendMessage}>
            <textarea
              className="form-control me-2"
              rows="2"
              name="message"
              value={createMessage.message}
              onChange={(e) => setCreateMessage({ ...createMessage, message: e.target.value })}
              placeholder="Yeni mesaj yaz..."
            />
            <Button type="submit" variant="primary">
              Gönder
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EskepProjeChatTab;
