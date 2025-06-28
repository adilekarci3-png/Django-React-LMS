import React from "react";

function HafizBilgiModal({ hafiz, onClose }) {
  return (
    <div className="modal show d-block" style={{ background: "#00000099" }}>
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5>Hafız Bilgileri</h5>
          <p><strong>Adı:</strong> {hafiz.full_name}</p>
          <p><strong>Telefon:</strong> {hafiz.ceptel}</p>
          <p><strong>Adres:</strong> {hafiz.adres}</p>
          <button className="btn btn-outline-secondary mt-2" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default HafizBilgiModal;
