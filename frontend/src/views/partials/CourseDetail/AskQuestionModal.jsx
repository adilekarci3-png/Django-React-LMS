import React from "react";
import { Modal } from "react-bootstrap";

function AskQuestionModal({ show, handleClose, createMessage, handleMessageChange, handleSaveQuestion }) {
  return (
    <Modal show={show} size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Soru Sor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSaveQuestion}>
          <div className="mb-3">
            <label className="form-label">Question Title</label>
            <input value={createMessage.title} name="title" onChange={handleMessageChange} type="text" className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Question Message</label>
            <textarea value={createMessage.message} name="message" onChange={handleMessageChange} className="form-control" rows="10" />
          </div>
          <button type="button" className="btn btn-secondary me-2" onClick={handleClose}>
            <i className="fas fa-arrow-left"></i> Close
          </button>
          <button type="submit" className="btn btn-primary">
            Send Message <i className="fas fa-check-circle"></i>
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default AskQuestionModal;