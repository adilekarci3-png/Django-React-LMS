import React, { useState } from "react";

function NotesTab({ course, handleNoteShow, handleDeleteNote, handleNoteChange, handleSubmitCreateNote }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleOpenModal = () => setShowAddModal(true);
  const handleCloseModal = () => setShowAddModal(false);

  const onSubmit = (e) => {
    handleSubmitCreateNote(e);
    handleCloseModal(); // Notu kaydettikten sonra modalı kapat
  };

  return (
    <div className="tab-pane fade" id="course-pills-2" role="tabpanel" aria-labelledby="course-pills-tab-2">
      <div className="card">
        <div className="card-header border-bottom p-0 pb-3">
          <div className="d-sm-flex justify-content-between align-items-center">
            <h4 className="mb-0 p-3">Tüm Notlar</h4>
            <button type="button" className="btn btn-primary me-3" onClick={handleOpenModal}>
              Not Ekle <i className="fas fa-pen"></i>
            </button>
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
                    <i className="bi bi-pencil-square me-2" /> Düzenle
                  </button>
                  <button onClick={() => handleDeleteNote(n.id)} className="btn btn-danger mb-0">
                    <i className="bi bi-trash me-2" /> Sil
                  </button>
                </div>
              </div>
            </div>
          ))}

          {course?.note?.length < 1 && <p className="mt-3 p-3">Not bulunamadı</p>}
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Yeni Not Ekle <i className="fas fa-pen"></i>
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Not Başlığı</label>
                    <input type="text" className="form-control" name="title" onChange={handleNoteChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Not İçeriği</label>
                    <textarea className="form-control" name="note" rows="6" onChange={handleNoteChange} required></textarea>
                  </div>
                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>
                      <i className="fas fa-arrow-left"></i> Kapat
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Kaydet <i className="fas fa-check-circle"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal arkaplanı */}
      {showAddModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default NotesTab;
