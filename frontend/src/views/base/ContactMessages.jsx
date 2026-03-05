import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

// header/footer’lar
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://127.0.0.1:8000";

export default function ContactMessages() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selected, setSelected] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const api = useAxios();
  const user = useUserData();
  const location = useLocation();

  // URL'den hangi moddayız?
  const pathname = location.pathname || "";
  const isEskep = pathname.startsWith("/eskep/");
  const isHbs = pathname.startsWith("/hbs/");
  const isHdm = pathname.startsWith("/hdm/");
  const isAkademi = pathname.startsWith("/akademi/");

  // slug'ı backend'e gönderelim
  const subjectSlug = isEskep
    ? "eskep"
    : isHbs
    ? "hbs"
    : isHdm
    ? "hdm"
    : isAkademi
    ? "akademi"
    : "";

  async function loadMessages() {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get(`/api/v1/contact/messages/`, {
        params: subjectSlug ? { subject_slug: subjectSlug } : {},
      });
      // DRF ListAPIView default'u {results: [...]} olabilir; sen düz liste döndürüyorsan burayı ayarla
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(data);
    } catch (err) {
      console.error(err);
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Mesajlar alınırken hata oluştu.";
      setFetchError(detail);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectSlug]);

  async function blockIp(msg) {
    if (!window.confirm(`${msg.ip_address} IP adresini bloklamak istiyor musun?`)) return;
    try {
      const res = await api.post(
        `/api/v1/contact/messages/${msg.id}/block-ip/`,
        {}
      );
      alert(res.data?.detail || "İşlem tamam");
    } catch (err) {
      console.error(err);
      alert("Hata oluştu");
    }
  }

  function openReply(msg) {
    setSelected(msg);
    // backend’de subject FK, frontend’de string olabilir, ikisini de düşün
    const subjText = typeof msg.subject === "string" ? msg.subject : msg.subject?.name || "";
    setReplySubject(`Eğitim Portalı İletişim Yanıtı: ${subjText}`);
    setReplyBody(`Merhaba ${msg.name},\n\n`);
    setReplyOpen(true);
  }

  async function sendReply() {
    if (!selected) return;
    try {
      const res = await api.post(
        `/api/v1/contact/messages/${selected.id}/reply/`,
        {
          subject: replySubject,
          body: replyBody,
        }
      );
      alert(res.data?.detail || "Mail gönderildi");
      setReplyOpen(false);
      setSelected(null);
      loadMessages();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.detail ||
          err?.message ||
          "Cevap gönderilirken hata oluştu."
      );
    }
  }

  // seçilecek header/footer
  const HeaderComp = isEskep
    ? ESKEPBaseHeader
    : isHbs
    ? HBSBaseHeader
    : isHdm
    ? HDMBaseHeader
    : isAkademi
    ? AkademiBaseHeader
    : React.Fragment;

  const FooterComp = isEskep
    ? ESKEPBaseFooter
    : isHbs
    ? HBSBaseFooter
    : isHdm
    ? HDMBaseFooter
    : isAkademi
    ? AkademiBaseFooter
    : React.Fragment;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f3f5f7",
      }}
    >
      <HeaderComp />

      {/* içerik */}
      <main style={{ flex: 1 }}>
        <div className="container py-4">
          <h3 className="mb-3">Gelen İletişim Mesajları</h3>

          {fetchError && (
            <div className="alert alert-danger" role="alert">
              {fetchError}
            </div>
          )}

          {loading ? (
            <div>Yükleniyor...</div>
          ) : rows.length === 0 ? (
            <div>Henüz mesaj yok.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Konu</th>
                    <th>Mesaj</th>
                    <th>IP</th>
                    <th>Tarih</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <tr key={m.id} className={m.replied ? "table-success" : ""}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>
                        {typeof m.subject === "string"
                          ? m.subject
                          : m.subject?.name || "-"}
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <small>{m.message}</small>
                      </td>
                      <td>{m.ip_address || "-"}</td>
                      <td>
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openReply(m)}
                          >
                            Cevap Yaz
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            disabled={!m.ip_address}
                            onClick={() => blockIp(m)}
                          >
                            IP Blokla
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <FooterComp />

      {/* Modal */}
      {replyOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div className="card shadow" style={{ width: 520, maxWidth: "90%" }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>{selected?.email} adresine cevap</strong>
              <button
                className="btn btn-sm btn-light"
                onClick={() => setReplyOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <label className="form-label">Konu</label>
                <input
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Mesaj</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="form-control"
                  rows={6}
                />
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setReplyOpen(false)}
              >
                İptal
              </button>
              <button className="btn btn-primary btn-sm" onClick={sendReply}>
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
