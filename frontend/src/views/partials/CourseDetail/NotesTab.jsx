import React from "react";

function NotesTab({ course, handleNoteShow, handleDeleteNote, handleNoteChange, handleSubmitCreateNote }) {
  return (
    <div className="tab-pane fade" id="course-pills-2" role="tabpanel" aria-labelledby="course-pills-tab-2">
      <div className="card">
        <div className="card-header border-bottom p-0 pb-3">
          <div className="d-sm-flex justify-content-between align-items-center">
            <h4 className="mb-0 p-3">Tüm Notlar</h4>
            <button type="button" className="btn btn-primary me-3" data-bs-toggle="modal" data-bs-target="#exampleModal">
              Not Ekle <i className="fas fa-pen"></i>
            </button>
            <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                      Add New Note <i className="fas fa-pen"></i>
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmitCreateNote}>
                      <div className="mb-3">
                        <label className="form-label">Note Title</label>
                        <input type="text" className="form-control" name="title" onChange={handleNoteChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Note Content</label>
                        <textarea className="form-control" name="note" rows="10" onChange={handleNoteChange}></textarea>
                      </div>
                      <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
                        <i className="fas fa-arrow-left"></i> Close
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Note <i className="fas fa-check-circle"></i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0 pt-3">
          {course?.note?.map((n) => (
            <div className="row g-4 p-3" key={n.id}>
              <div className="col-sm-11 col-xl-11 shadow p-3 m-3 rounded">
                <h5>{n.title}</h5>
                <p>{n.note}</p>
                <div className="hstack gap-3 flex-wrap">
                  <button onClick={() => handleNoteShow(n)} className="btn btn-success mb-0">
                    <i className="bi bi-pencil-square me-2" /> Edit
                  </button>
                  <button onClick={() => handleDeleteNote(n.id)} className="btn btn-danger mb-0">
                    <i className="bi bi-trash me-2" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {course?.note?.length < 1 && <p className="mt-3 p-3">No notes</p>}
          <hr />
        </div>
      </div>
    </div>
  );
}

export default NotesTab;
