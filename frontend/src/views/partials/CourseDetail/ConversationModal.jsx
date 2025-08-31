// src/views/partials/CourseDetail/ConversationModal.jsx
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import "moment/locale/tr";

export default function ConversationModal({
  show,
  question,          // seçili konuşma (title, messages[])
  currentUserId,     // kendi userId'n
  onClose,
  onSendMessage,     // (text: string) => Promise<void>
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (show && scrollRef.current) {
      // açılınca en alta kaydır
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [show, question]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      await onSendMessage(text.trim());
      setText("");
      // gönderimden sonra otomatik alta kay
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const msgs = question?.messages || [];

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,.5)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{question?.title || "Konuşma"}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-0 d-flex flex-column" style={{ height: 520 }}>
            {/* Mesajlar */}
            <div
              ref={scrollRef}
              className="flex-grow-1 p-3"
              style={{ overflowY: "auto", background: "#f8f9fa" }}
            >
              {msgs.length ? (
                msgs.map((m) => {
                  const mine = m?.user === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`d-flex mb-3 ${mine ? "justify-content-end" : "justify-content-start"}`}
                    >
                      {!mine && (
                        <img
                          src={m.profile?.image}
                          alt={m.profile?.full_name}
                          style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", marginRight: 8 }}
                        />
                      )}
                      <div
                        className="p-2 rounded"
                        style={{
                          maxWidth: "75%",
                          background: mine ? "#e7f1ff" : "#fff",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div className="small text-muted mb-1">
                          {!mine ? m.profile?.full_name : "Ben"} · {moment(m.date).format("DD MMM YYYY HH:mm")}
                        </div>
                        <div>{m.message}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted">Henüz mesaj yok.</p>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSubmit} className="border-top p-3">
              <div className="d-flex align-items-end gap-2">
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Mesajınızı yazın... (Göndermek için Enter, satır atlamak için Shift+Enter)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button className="btn btn-primary" type="submit" disabled={sending || !text.trim()}>
                  {sending ? "Gönderiliyor..." : "Gönder"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
