// NoteSection.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import UserData from "../../plugin/UserData";
import useAxios from "../../../utils/useAxios";

function NoteSection({ course, modal, setModal, refresh }) {
  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const api = useAxios();

  const handleNoteChange = (e) => {
    setCreateNote({ ...createNote, [e.target.name]: e.target.value });
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("user_id", UserData()?.user_id);
    form.append("enrollment_id", course.enrollment_id);
    form.append("title", createNote.title);
    form.append("note", createNote.note);
    await api.post(`student/course-note/${UserData()?.user_id}/${course.enrollment_id}/`, form);
    Swal.fire({ icon: "success", title: "Not eklendi" });
    refresh();
  };

  const handleDeleteNote = async (noteId) => {
    await api.delete(`student/course-note-detail/${UserData()?.user_id}/${course.enrollment_id}/${noteId}/`);
    Swal.fire({ icon: "success", title: "Not silindi" });
    refresh();
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5>Notlar</h5>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#modalAddNote"
        >
          Not Ekle
        </button>
      </div>

      {course.note?.length > 0 ? (
        course.note.map((n, index) => (
          <div className="card shadow-sm my-3" key={index}>
            <div className="card-body">
              <h6>{n.title}</h6>
              <p>{n.note}</p>
              <div>
                <button className="btn btn-success btn-sm me-2" onClick={() => setModal({ show: true, selected: n })}>
                  Düzenle
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNote(n.id)}>
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="mt-3">Henüz not yok.</p>
      )}

      {/* Modal for create */}
      <div className="modal fade" id="modalAddNote" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleCreateNote}>
              <div className="modal-header">
                <h5 className="modal-title">Not Ekle</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="title"
                  onChange={handleNoteChange}
                  className="form-control mb-3"
                  placeholder="Not Başlığı"
                />
                <textarea
                  name="note"
                  rows="5"
                  onChange={handleNoteChange}
                  className="form-control"
                  placeholder="Not İçeriği"
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Kapat
                </button>
                <button type="submit" className="btn btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteSection;