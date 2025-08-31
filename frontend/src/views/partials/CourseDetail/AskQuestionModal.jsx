import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

function AskQuestionModal({
  show,
  handleClose = () => {},            // no-op default
  handleMessageChange = () => {},     // no-op default
  handleSaveQuestion = () => {},      // no-op default
}) {
  const [localMessage, setLocalMessage] = useState({ title: "", message: "" });

  useEffect(() => {
    if (show) setLocalMessage({ title: "", message: "" });
  }, [show]);

  const onChange = (e) => {
    const updated = { ...localMessage, [e.target.name]: e.target.value };
    setLocalMessage(updated);
    handleMessageChange(updated);     // parent'a güncel obje gönder
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const t = localMessage.title?.trim();
    const m = localMessage.message?.trim();
    if (!t || !m) return;

    // parent'a payload gönder
    handleSaveQuestion({ title: t, message: m });
  };

  return (
    <Modal show={show} size="lg" onHide={handleClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Yeni Soru Sor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Soru Başlığı</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={localMessage.title}
              onChange={onChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mesaj</label>
            <textarea
              className="form-control"
              name="message"
              rows="6"
              value={localMessage.message}
              onChange={onChange}
              required
            />
          </div>
          <div className="text-end">
            <button type="button" className="btn btn-secondary me-2" onClick={handleClose}>
              <i className="fas fa-arrow-left" /> Kapat
            </button>
            <button type="submit" className="btn btn-primary">
              Gönder <i className="fas fa-check-circle" />
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default AskQuestionModal;
