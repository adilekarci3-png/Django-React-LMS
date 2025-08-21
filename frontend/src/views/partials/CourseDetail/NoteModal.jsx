import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

function NoteModal({
  show,
  onClose,
  selectedNote,
  onSubmit,
  onCreate,
  onDelete,
}) {
  const isEditing = !!selectedNote?.id;

  // Yerel state ile inputları kontrol et
  const [noteData, setNoteData] = useState({
    title: "",
    note: "",
  });

  // Modal her açıldığında selectedNote değerini inputlara set et
  useEffect(() => {
    if (selectedNote) {
      setNoteData({
        title: selectedNote.title || "",
        note: selectedNote.note || "",
      });
    } else {
      setNoteData({ title: "", note: "" });
    }
  }, [selectedNote, show]);

  const handleChange = (e) => {
    setNoteData({
      ...noteData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit(e, selectedNote.id, noteData);
    } else {
      onCreate(e, noteData);
    }
    // Modal otomatik kapanabilir burada istenirse
    onClose();
  };

  return (
    <Modal show={show} size="lg" onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? `Notu Düzenle: ${selectedNote.title}` : "Yeni Not Ekle"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Not Başlığı</label>
            <input
              value={noteData.title}
              name="title"
              onChange={handleChange}
              type="text"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Not İçeriği</label>
            <textarea
              value={noteData.note}
              name="note"
              onChange={handleChange}
              className="form-control"
              rows="10"
              required
            />
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                <i className="fas fa-arrow-left"></i> Kapat
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Güncelle" : "Kaydet"} <i className="fas fa-check-circle"></i>
              </button>
            </div>
            {isEditing && (
              <button type="button" className="btn btn-danger" onClick={() => onDelete(selectedNote.id)}>
                <i className="fas fa-trash"></i> Sil
              </button>
            )}
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default NoteModal;
