import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDeleteModal = ({ show, onClose, onConfirm, tourTitle }) => {
  return (
    <Modal show={show} onHide={onClose} centered size="sm" className="rounded-3">
      <Modal.Body className="text-center p-4 bg-white" style={{ borderRadius: '8px' }}>
        <div className="fs-1 mb-2 text-warning">⚠️</div>
        <Modal.Title className="fw-bold mb-3 text-dark fs-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Confirm Deletion
        </Modal.Title>
        <p className="text-muted small mb-4">
          Are you sure you want to archive the tour <strong>"{tourTitle}"</strong>? It will be marked as <strong>ARCHIVED</strong> and hidden from active listings.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" onClick={onClose} size="sm" className="fw-semibold px-3 py-2" style={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} size="sm" className="fw-bold px-3 py-2" style={{ borderRadius: '8px' }}>
            Yes, Archive
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDeleteModal;
