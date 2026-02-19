import React, { useState, useEffect } from 'react';

const AddModal = ({ tabs, defaultTab, onAdd, onCancel }) => {
  const [selectedTab, setSelectedTab] = useState(defaultTab);

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
        <div className="modal-header">Add Entry</div>
        <div className="modal-body">
          <label>Select Tab</label>
          <select
            value={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
          >
            {tabs.map(tab => (
              <option key={tab} value={tab}>{tab}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn-confirm" onClick={() => onAdd(selectedTab)}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
