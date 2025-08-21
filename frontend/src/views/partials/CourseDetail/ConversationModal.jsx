import React, { useRef, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment";

function ConversationModal({ show, handleClose, selectedConversation, handleMessageChange, sendNewMessage }) {
  const lastElementRef = useRef();
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!localMessage.trim()) return;
    handleMessageChange({ target: { name: "message", value: localMessage } });
    sendNewMessage(e);
    setLocalMessage(""); // mesaj kutusunu temizle
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={true}>
      <Modal.Header closeButton>
        <Modal.Title>{selectedConversation?.title || "Müzakere"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="border p-2 p-sm-4 rounded-3">
          <ul className="list-unstyled mb-0" style={{ overflowY: "auto", height: "500px" }}>
            {selectedConversation?.messages?.map((m) => (
              <li key={m.id} className="comment-item mb-3">
                <div className="d-flex">
                  <div className="ms-2 w-100">
                    <div className="bg-light p-3 rounded">
                      <h6 className="mb-1 fw-bold">{m.profile.full_name}</h6>
                      <small className="text-muted">{moment(m.date).format("DD MMM YYYY HH:mm")}</small>
                      <p className="mt-2 mb-0">{m.message}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            <div ref={lastElementRef}></div>
          </ul>
          <form className="mt-3 w-100 d-flex" onSubmit={onSubmit}>
            <textarea
              className="form-control pe-4 bg-light w-75"
              rows="2"
              placeholder="Yeni mesaj yazın..."
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
            />
            <button className="btn btn-primary ms-2 w-25" type="submit">
              Gönder <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ConversationModal;
