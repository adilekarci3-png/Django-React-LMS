import React from "react";
import { Modal, Button } from "react-bootstrap";
import ReactPlayer from "react-player";

function LectureModal({ show, handleClose, variantItem }) {
  return (
    <Modal show={show} size="lg" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Lesson: {variantItem?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ReactPlayer url={variantItem?.file} controls width="100%" height="100%" />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LectureModal;