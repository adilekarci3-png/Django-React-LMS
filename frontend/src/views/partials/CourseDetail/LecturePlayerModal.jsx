// LecturePlayerModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";
import ReactPlayer from "react-player";

function LecturePlayerModal({ show, onClose, variantItem }) {
  return (
    <Modal show={show} size="lg" onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ders: {variantItem?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ReactPlayer
          url={variantItem?.file}
          controls
          width="100%"
          height="100%"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Kapat
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LecturePlayerModal;