import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

// ⚠️ Yolları projenize göre düzeltin
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

const API_CREATE = "educator/documents/"; // POST (FormData)

const ALLOWED_EXTS = [
  "pdf","doc","docx","ppt","pptx","xls","xlsx","txt","rtf","odt","csv","md"
];
const MAX_MB = 50;

export default function EducatorDocumentCreate() {
  const api = useAxios();
  const user = useUserData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    is_public: false,
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return setFile(null);

    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      Toast().fire({ icon: "error", title: `İzin verilmeyen dosya türü (.${ext})` });
      e.target.value = "";
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      Toast().fire({ icon: "error", title: `Dosya ${MAX_MB}MB sınırını aşıyor` });
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      Toast().fire({ icon: "error", title: "Dosya seçiniz" });
      return;
    }
    if (!form.title.trim()) {
      Toast().fire({ icon: "error", title: "Başlık zorunludur" });
      return;
    }

    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("instructor_id", user?.user_id);
      fd.append("title", form.title);
      fd.append("description", form.description || "");
      fd.append("tags", form.tags || "");
      fd.append("is_public", form.is_public ? "true" : "false");
      fd.append("file", file);

      await api.post(API_CREATE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Toast().fire({ icon: "success", title: "Döküman yüklendi" });
      navigate("/educator/documents");
    } catch (err) {
      const detail = err?.response?.data?.detail || "Yükleme başarısız";
      Toast().fire({ icon: "error", title: detail });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <div className="d-flex align-items-center mb-3">
                <h2 className="mb-0">Yeni Döküman Yükle</h2>
                <Link to="/educator/documents" className="btn btn-light ms-auto">
                  <i className="bi bi-arrow-left"></i> Listeye dön
                </Link>
              </div>

              <form className="card p-4 shadow-sm" onSubmit={submit}>
                <div className="row g-3">
                  <div className="col-lg-8">
                    <label className="form-label">Başlık *</label>
                    <input
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-lg-4">
                    <label className="form-label">Görünürlük</label>
                    <div className="form-check form-switch pt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="publicSwitch"
                        name="is_public"
                        checked={form.is_public}
                        onChange={onChange}
                      />
                      <label className="form-check-label" htmlFor="publicSwitch">
                        Herkese açık
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Açıklama</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      name="description"
                      value={form.description}
                      onChange={onChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Etiketler <small className="text-muted">(virgülle ayırın)</small>
                    </label>
                    <input
                      className="form-control"
                      name="tags"
                      value={form.tags}
                      onChange={onChange}
                      placeholder="pdf, sunum"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Dosya *{" "}
                      <small className="text-muted">
                        ({ALLOWED_EXTS.join(", ")}, maks. {MAX_MB}MB)
                      </small>
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      onChange={onFile}
                      accept={ALLOWED_EXTS.map((e) => "." + e).join(",")}
                      required
                    />
                    {file && (
                      <div className="form-text">
                        Seçili: <strong>{file.name}</strong> – {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? "Yükleniyor…" : "Yükle"}
                  </button>
                  <Link to="/educator/documents" className="btn btn-outline-secondary">
                    İptal
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </>
  );
}
