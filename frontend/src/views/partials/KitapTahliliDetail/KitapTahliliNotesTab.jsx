import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useAxios from "../../../utils/useAxios";
import useUserData from "../../plugin/useUserData";

import Swal from "sweetalert2";

function KitapTahliliNotesTab({ kitaptahlili, fetchKitapTahliliDetail, id }) {
    const [createNote, setCreateNote] = useState({ title: "", note: "" });
    const [selectedNote, setSelectedNote] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const user = useUserData();
    const handleNoteChange = (e) => {
        setCreateNote({ ...createNote, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("koordinator_id", user?.user_id);
        formData.append("kitaptahlili_id", id);
        formData.append("title", createNote.title);
        formData.append("note", createNote.note);

        try {
            await useAxios().post(`eskepstajer/kitaptahlili-note/${user?.user_id}/${id}/`, formData);
            console.log("✅ Not eklendi, fetchKitapTahliliDetail çağrılıyor");
            await fetchKitapTahliliDetail(); // await önemli olabilir
            Swal.fire({
                icon: "success",
                title: "Başarılı!",
                text: "Yeni not başarıyla eklendi.",
                confirmButtonText: "Tamam",
            });
            setShowCreate(false);
            setCreateNote({ title: "", note: "" }); // Formu temizle
        } catch (err) {
            console.error(err);
              Swal.fire({
                icon: "error",
                title: "Hata!",
                text: "Not Eklenirken Bir Hata Oluştu.",
                confirmButtonText: "Tamam",
            });
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("koordinator_id", user?.user_id);
        formData.append("kitaptahlili_id", id);
        formData.append("title", createNote.title || selectedNote?.title);
        formData.append("note", createNote.note || selectedNote?.note);

        try {
            await useAxios().patch(
                `eskepstajer/kitaptahlili-note-detail/${user?.user_id}/${id}/${selectedNote.id}/`,
                formData
            );
            fetchKitapTahliliDetail();
            Swal.fire({
                icon: "success",
                title: "Başarılı!",
                text: "Yeni not başarıyla güncellendi.",
                confirmButtonText: "Tamam",
            });
            setShowEdit(false);
        } catch (err) {
               Swal.fire({
                icon: "error",
                title: "Hata!",
                text: "Not Eklenirken Bir Hata Oluştu.",
                confirmButtonText: "Tamam",
            });
        }
    };

    const handleDelete = async (selectedNoteid) => {
        try {
            await useAxios().delete(
                `eskepstajer/kitaptahlili-note-detail/${user?.user_id}/${id}/${selectedNoteid}/`
            );
            fetchKitapTahliliDetail();
            Swal.fire({
                icon: "success",
                title: "Başarılı!",
                text: "Not Silindi.",
                confirmButtonText: "Tamam",
            });
        } catch (err) {
               Swal.fire({
                icon: "error",
                title: "Hata!",
                text: "Not Eklenirken Bir Hata Oluştu.",
                confirmButtonText: "Tamam",
            });
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Tüm Notlar</h5>
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                    Not Ekle
                </Button>
            </div>

            {kitaptahlili?.notes?.length > 0 ? (
                kitaptahlili.notes.map((note) => (
                    <div key={note.id} className="card mb-3 shadow-sm p-3">
                        <h6>{note.title}</h6>
                        <p>{note.note}</p>
                        <div className="d-flex gap-2">
                            <Button
                                variant="success"
                                onClick={() => {
                                    setSelectedNote(note);
                                    setShowEdit(true);
                                    setCreateNote({ title: note.title, note: note.note });
                                }}
                            >
                                Düzenle
                            </Button>
                            <Button variant="danger" onClick={() => handleDelete(note.id)}>
                                Sil
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <p>Henüz not bulunmuyor.</p>
            )}

            {/* Yeni Not Modal */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Yeni Not Ekle</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleCreateSubmit}>
                    <Modal.Body>
                        <div className="mb-3">
                            <label>Başlık</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                onChange={handleNoteChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label>İçerik</label>
                            <textarea
                                name="note"
                                className="form-control"
                                rows="5"
                                onChange={handleNoteChange}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>
                            Kapat
                        </Button>
                        <Button variant="primary" type="submit">
                            Kaydet
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Düzenleme Modalı */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Not Düzenle</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        <div className="mb-3">
                            <label>Başlık</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                defaultValue={selectedNote?.title}
                                onChange={handleNoteChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label>İçerik</label>
                            <textarea
                                name="note"
                                className="form-control"
                                rows="5"
                                defaultValue={selectedNote?.note}
                                onChange={handleNoteChange}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEdit(false)}>
                            Kapat
                        </Button>
                        <Button variant="primary" type="submit">
                            Güncelle
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
}

export default KitapTahliliNotesTab;
