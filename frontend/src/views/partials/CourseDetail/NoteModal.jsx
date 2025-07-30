import React from "react";
import { Modal } from "react-bootstrap";

function NoteModal({ show, handleClose, selectedNote, handleNoteChange, handleSubmitEditNote }) {
  return (
    <Modal show={show} size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Note: {selectedNote?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) => handleSubmitEditNote(e, selectedNote?.id)}>
          <div className="mb-3">
            <label className="form-label">Note Title</label>
            <input defaultValue={selectedNote?.title} name="title" onChange={handleNoteChange} type="text" className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Note Content</label>
            <textarea defaultValue={selectedNote?.note} name="note" onChange={handleNoteChange} className="form-control" rows="10" />
          </div>
          <button type="button" className="btn btn-secondary me-2" onClick={handleClose}>
            <i className="fas fa-arrow-left"></i> Close
          </button>
          <button type="submit" className="btn btn-primary">
            Save Note <i className="fas fa-check-circle"></i>
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default NoteModal;