// src/pages/Koordinator/VideoLists.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaExternalLinkAlt,
} from "react-icons/fa";

import useAxios from "../../utils/useAxios";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import GenericList from "./GenericList";
import VideoEditModal from "./VideoEditModal";



/** Ortak sayfa iskeleti */
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

/* ------------------------------------------------------------------ */
/* 1) Tüm YouTube Videoları (ekleyen, düzenle, sil)                   */
/* ------------------------------------------------------------------ */
export function AllYoutubeVideosPage() {
  const api = useAxios();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: "title", title: "Başlık" },
    { key: "owner_name", title: "Ekleyen" },
    {
      key: "url",
      title: "URL",
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noreferrer">
            {val} <FaExternalLinkAlt />
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "created_at",
      title: "Oluşturulma",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
  ];

  // NOT: useAxios.baseURL /api/v1/ ile bitiyorsa, önde / kullanma.
  // const fetchUrl = "videos/?source=youtube";
  const fetchUrl = "videos/";

  const onCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };
  const onEdit = (row) => {
    setEditing(row);
    setEditOpen(true);
  };
  const onDelete = async (row) => {
    if (!window.confirm(`Silinsin mi?\n${row.title}`)) return;
    await api.delete(`videos/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`videos/${editing.id}/`, form);
      } else {
        await api.post("videos/", { ...form, source: "youtube" });
      }
      setEditOpen(false);
      window.dispatchEvent(new CustomEvent("refresh-list"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <GenericList
        title="Tüm YouTube Videoları"
        fetchUrl={fetchUrl}
        columns={columns}
        createLabel="Video Ekle"
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
        api={api}
      />
      <VideoEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* 2) Eğitmenlerin Eklediği Tüm Videolar (kaynak fark etmez)          */
/* ------------------------------------------------------------------ */
export function AllInstructorVideosPage() {
  const api = useAxios();

  const columns = [
    { key: "title", title: "Başlık" },
    { key: "owner_name", title: "Eğitmen" },
    { key: "source", title: "Kaynak" }, // youtube | local
    {
      key: "url",
      title: "URL",
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noreferrer">
            {val} <FaExternalLinkAlt />
          </a>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <PageShell>
      <GenericList
        title="Eğitmenlerin Eklediği Tüm Videolar"
        fetchUrl="videos/?owner_role=instructor"
        columns={columns}
        api={api}
      />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* 3) Belirli Eğitmenin Kendi Videoları (route param ile)             */
/*    Route: /koordinator/egitmen/:instructorId/videolar              */
/* ------------------------------------------------------------------ */
export function MyInstructorVideosPage() {
  const { instructorId } = useParams();
  const api = useAxios();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: "title", title: "Başlık" },
    { key: "source", title: "Kaynak" }, // youtube | local
    {
      key: "url",
      title: "URL",
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noreferrer">
            {val} <FaExternalLinkAlt />
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "created_at",
      title: "Oluşturulma",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
  ];

  const fetchUrl = `instructors/${instructorId}/videos/`;

  const onCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };
  const onEdit = (row) => {
    setEditing(row);
    setEditOpen(true);
  };
  const onDelete = async (row) => {
    if (!window.confirm(`Silinsin mi?\n${row.title}`)) return;
    await api.delete(`videos/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`videos/${editing.id}/`, form);
      } else {
        await api.post(`instructors/${instructorId}/videos/`, form);
      }
      setEditOpen(false);
      window.dispatchEvent(new CustomEvent("refresh-list"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <GenericList
        title={`Eğitmen Videoları #${instructorId}`}
        fetchUrl={fetchUrl}
        columns={columns}
        createLabel="Video Ekle"
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
        api={api}
      />
      <VideoEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* 4) Belirli Videoyu Satın Alan Öğrenciler                           */
/*    Route: /koordinator/video/:videoId/satin-alanlar                */
/* ------------------------------------------------------------------ */
export function VideoPurchasersPage() {
  const { videoId } = useParams();
  const api = useAxios();

  const columns = [
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    {
      key: "purchased_at",
      title: "Satın Alma",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    { key: "amount", title: "Tutar" },
  ];

  const fetchUrl = `videos/${videoId}/purchases/`; // alternatif: video-purchases/?video_id=...

  const onDelete = async (row) => {
    if (!window.confirm(`Satın alma kaydı silinsin mi?\n${row.student_name}`))
      return;
    await api.delete(`video-purchases/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <PageShell>
      <GenericList
        title={`Videoyu Satın Alan Öğrenciler • #${videoId}`}
        fetchUrl={fetchUrl}
        columns={columns}
        onDelete={onDelete}
        api={api}
      />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* 5) Belirli Videoya Kayıtlı Öğrenciler                               */
/*    Route: /koordinator/video/:videoId/kayitli-ogrenciler           */
/* ------------------------------------------------------------------ */
export function VideoEnrolleesPage() {
  const { videoId } = useParams();
  const api = useAxios();

  const columns = [
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    {
      key: "enrolled_at",
      title: "Kayıt Tarihi",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    {
      key: "progress",
      title: "İlerleme",
      render: (v) => (v != null ? `%${v}` : "-"),
    },
  ];

  const fetchUrl = `videos/${videoId}/enrollments/`; // alternatif: video-enrollments/?video_id=...

  const onDelete = async (row) => {
    if (!window.confirm(`Kayıt silinsin mi?\n${row.student_name}`)) return;
    await api.delete(`video-enrollments/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <PageShell>
      <GenericList
        title={`Videoya Kayıtlı Öğrenciler • #${videoId}`}
        fetchUrl={fetchUrl}
        columns={columns}
        onDelete={onDelete}
        api={api}
      />
    </PageShell>
  );
}

/** Tüm Video Satın Almalar (toplu) */
export function AllVideoPurchasesPage() {
  const api = useAxios();
  const columns = [
    { key: "video_title", title: "Video" },
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    { key: "purchased_at", title: "Satın Alma", render: (v) => v ? new Date(v).toLocaleString() : "-" },
    { key: "amount", title: "Tutar" },
  ];
  const fetchUrl = "video-purchases/"; // DRF list endpoint (paginate + q desteklerse GenericList arama çalışır)

  const onDelete = async (row) => {
    if (!window.confirm(`Satın alma kaydı silinsin mi?\n${row.student_name} • ${row.video_title}`)) return;
    await api.delete(`video-purchases/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <PageShell>
      <GenericList
        title="Tüm Video Satın Almalar"
        fetchUrl={fetchUrl}
        columns={columns}
        onDelete={onDelete}
        api={api}
      />
    </PageShell>
  );
}

/** Tüm Video Kayıtları (toplu) */
export function AllVideoEnrollmentsPage() {
  const api = useAxios();
  const columns = [
    { key: "video_title", title: "Video" },
    { key: "student_name", title: "Öğrenci" },
    { key: "email", title: "E-posta" },
    { key: "enrolled_at", title: "Kayıt Tarihi", render: (v) => v ? new Date(v).toLocaleString() : "-" },
    { key: "progress", title: "İlerleme", render: (v) => (v != null ? `%${v}` : "-") },
  ];
  const fetchUrl = "video-enrollments/"; // DRF list endpoint

  const onDelete = async (row) => {
    if (!window.confirm(`Kayıt silinsin mi?\n${row.student_name} • ${row.video_title}`)) return;
    await api.delete(`video-enrollments/${row.id}/`);
    window.dispatchEvent(new CustomEvent("refresh-list"));
  };

  return (
    <PageShell>
      <GenericList
        title="Tüm Video Kayıtları"
        fetchUrl={fetchUrl}
        columns={columns}
        onDelete={onDelete}
        api={api}
      />
    </PageShell>
  );
}