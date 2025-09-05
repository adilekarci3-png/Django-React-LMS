// src/components/DocumentEditModal.jsx
import React, { useEffect, useState } from "react";

export default function DocumentEditModal({ open, onClose, initial, onSave, saving }) {
  if (!open) return null;

  const [form, setForm] = useState({
    title: "",
    category: "",
    kind: "file",      // "file" | "link"
    file: null,        // File obj
    url: "",           // kind==="link" ise
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        category: initial.category || "",
        kind: initial.url ? "link" : "file",
        file: null,
        url: initial.url || "",
        description: initial.description || "",
        is_active: initial.is_active ?? true,
      });
    } else {
      setForm({
        title: "",
        category: "",
        kind: "file",
        file: null,
        url: "",
        description: "",
        is_active: true,
      });
    }
  }, [initial]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // FormData hazırlayıp parent’a ver
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("is_active", form.is_active ? "1" : "0");
    if (form.kind === "file" && form.file) {
      fd.append("file", form.file);
    } else if (form.kind === "link" && form.url) {
      fd.append("url", form.url);
    }
    onSave(fd); // parent POST/PATCH yapacak
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ display: "block" }} />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
        <div className="bg-white rounded-3 shadow" style={{ width: "95%", maxWidth: 720 }}>
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <h5 className="m-0">{initial ? "Dökümanı Düzenle" : "Yeni Döküman"}</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Kapat</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-3">
              <div className="mb-3">
                <label className="form-label">Başlık</label>
                <input className="form-control" value={form.title} onChange={(e) => change("title", e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <input className="form-control" value={form.category} onChange={(e) => change("category", e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tür</label>
                <select className="form-select" value={form.kind} onChange={(e) => change("kind", e.target.value)}>
                  <option value="file">Dosya Yükle</option>
                  <option value="link">Harici Link</option>
                </select>
              </div>

              {form.kind === "file" ? (
                <div className="mb-3">
                  <label className="form-label">Dosya</label>
                  <input type="file" className="form-control" onChange={(e) => change("file", e.target.files?.[0] || null)} />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label">URL</label>
                  <input className="form-control" value={form.url} onChange={(e) => change("url", e.target.value)} />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Açıklama</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={(e) => change("description", e.target.value)} />
              </div>

              <div className="form-check mb-3">
                <input id="doc_is_active" className="form-check-input" type="checkbox" checked={form.is_active} onChange={(e) => change("is_active", e.target.checked)} />
                <label htmlFor="doc_is_active" className="form-check-label">Aktif</label>
              </div>
            </div>

            <div className="p-3 border-top d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>İptal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
