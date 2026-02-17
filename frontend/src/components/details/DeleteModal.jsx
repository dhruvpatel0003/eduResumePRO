import React, { useEffect } from 'react';

const DeleteModal = ({ onConfirm, onCancel }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">Confirm Delete</div>
        <div className="modal-body">
          <p>Are you sure you want to delete this?</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>No</button>
          <button className="modal-btn-danger" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
