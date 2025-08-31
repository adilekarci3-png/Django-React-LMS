// src/components/VideoLinkFormModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import { createVideoLink, updateVideoLink } from "../api/educatorVideoLinkApi";

const initialForm = { title: "", videoUrl: "", description: "", instructor_id: "" };

export default function VideoLinkFormModal({
  open, onClose, onSaved, editing, defaultInstructorId, roleDetail
}) {
  const [form, setForm] = useState(initialForm);
  const isEdit = Boolean(editing?.id);

  const isKoordinator = useMemo(() => {
    const b = roleDetail?.base_roles || [];
    const s = roleDetail?.sub_roles || [];
    return b.includes("Koordinator") || s.includes("ESKEPKoordinator") || s.includes("ESKEPGenelKoordinator");
  }, [roleDetail]);

  useEffect(() => {
    if (isEdit) {
      setForm({
        title: editing.title || "",
        videoUrl: editing.videoUrl || "",
        description: editing.description || "",
        instructor_id: isKoordinator
          ? (editing.instructor || editing.instructor_id || defaultInstructorId || "")
          : (defaultInstructorId || ""), // teacher için backend kendi id'sine kilitler
      });
    } else {
      setForm({
        ...initialForm,
        instructor_id: isKoordinator ? (defaultInstructorId || "") : (defaultInstructorId || ""),
      });
    }
  }, [editing, isEdit, defaultInstructorId, isKoordinator]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) return;
    if (isEdit) {
      await updateVideoLink(editing.id, form);
    } else {
      await createVideoLink(form);
    }
    onSaved?.();
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 className="mb-3">{isEdit ? "Video Bağlantısını Düzenle" : "Yeni Video Bağlantısı"}</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group mb-2">
            <label>Başlık</label>
            <input name="title" value={form.title} onChange={onChange} className="form-control" />
          </div>
          <div className="form-group mb-2">
            <label>YouTube Linki</label>
            <input name="videoUrl" value={form.videoUrl} onChange={onChange} className="form-control" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="form-group mb-2">
            <label>Açıklama</label>
            <textarea name="description" value={form.description} onChange={onChange} className="form-control" rows={3} />
          </div>

          {isKoordinator && (
            <div className="form-group mb-2">
              <label>Eğitmen (instructor_id)</label>
              <input name="instructor_id" value={form.instructor_id} onChange={onChange} className="form-control" placeholder="Örn: 12" />
            </div>
          )}

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary">{isEdit ? "Kaydet" : "Ekle"}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
