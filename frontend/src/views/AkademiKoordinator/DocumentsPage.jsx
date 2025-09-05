// src/pages/Koordinator/DocumentsPage.jsx
import React, { useState } from "react";
import useAxios from "../../utils/useAxios";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import GenericList from "./GenericList";
import DocumentEditModal from "./DocumentEditModal";


function PageShell({ children }) {
  return (
    <>
      <AkademiBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3"><Sidebar /></div>
            <div className="col-lg-9">{children}</div>
          </div>
        </div>
        <AkademiBaseFooter />
      </section>
    </>
  );
}

export default function AllInstructorDocumentsCrudPage() {
  const api = useAxios();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: "title", title: "Başlık" },
    { key: "owner_name", title: "Eğitmen" },
    { key: "category", title: "Kategori" },
    { key: "view_url", title: "Görüntüle", render: (val) => val ? <a className="btn btn-sm btn-outline-secondary" href={val} target="_blank" rel="noreferrer">Aç</a> : "-" },
  ];

  const fetchUrl = "documents/?owner_role=instructor";

  const onCreate = () => { setEditing(null); setEditOpen(true); };
  const onEdit = (row) => { setEditing(row); setEditOpen(true); };
  const onDelete = async (row) => {
    if (!window.confirm(`Döküman silinsin mi?\n${row.title}`)) return;
    await api.delete(`documents/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  const handleSave = async (formData /* FormData */) => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`documents/${editing.id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("documents/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setEditOpen(false);
      window.dispatchEvent(new CustomEvent("refresh-list"));
    } finally { setSaving(false); }
  };

  return (
    <PageShell>
      <GenericList
        title="Eğitmenlerin Eklediği Dökümanlar"
        fetchUrl={fetchUrl}
        columns={columns}
        createLabel="Döküman Ekle"
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
        api={api}
      />
      <DocumentEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />
    </PageShell>
  );
}
