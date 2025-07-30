import React, { useRef, useEffect } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment";

function ConversationModal({ show, handleClose, selectedConversation, handleMessageChange, sendNewMessage }) {
const lastElementRef = useRef();

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  return (
    <Modal show={show} size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Lesson: {selectedConversation?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="border p-2 p-sm-4 rounded-3">
          <ul className="list-unstyled mb-0" style={{ overflowY: "scroll", height: "500px" }}>
            {selectedConversation?.messages?.map((m) => (
              <li key={m.id} className="comment-item mb-3">
                <div className="d-flex">
                  <div className="ms-2">
                    <div className="bg-light p-3 rounded w-100">
                      <div className="d-flex w-100 justify-content-center">
                        <div className="me-2">
                          <h6 className="mb-1 lead fw-bold">
                            <a href="#!" className="text-decoration-none text-dark">
                              {m.profile.full_name}
                            </a>
                            <br />
                            <span style={{ fontSize: "12px", color: "gray" }}>{moment(m.date).format("DD MMM, YYYY")}</span>
                          </h6>
                          <p className="mb-0 mt-3">{m.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            <div ref={lastElementRef}></div>
          </ul>
          <form className="w-100 d-flex" onSubmit={sendNewMessage}>
            <textarea name="message" className="form-control pe-4 bg-light w-75" rows="2" onChange={handleMessageChange} placeholder="What's your question?" />
            <button className="btn btn-primary ms-2 mb-0 w-25" type="submit">
              Post <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ConversationModal;