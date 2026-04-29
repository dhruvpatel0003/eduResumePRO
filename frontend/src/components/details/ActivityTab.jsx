import React from 'react';

const ActivityTab = ({ entries, selections, onToggle, onChange }) => {
  return (
    <div>
      {entries.map((entry, index) => (
        <div key={entry.id} className="details-form-section">
          <div className="details-form-section-header">
            <input
              type="checkbox"
              checked={selections.includes(entry.id)}
              onChange={() => onToggle(entry.id)}
            />
            Activity - {index + 1}
          </div>
          <div className="details-form-grid">
            <div className="details-form-group">
              <label>Activity Name</label>
              <input
                type="text"
                value={entry.name}
                onChange={(e) => onChange(entry.id, 'name', e.target.value)}
                placeholder="Activity Name"
              />
            </div>
            <div className="details-form-group">
              <label>Issuer</label>
              <input
                type="text"
                value={entry.location}
                onChange={(e) => onChange(entry.id, 'location', e.target.value)}
                placeholder="Issuing organization"
              />
            </div>
            <div className="details-form-group">
              <label>Date</label>
              <input
                type="date"
                value={entry.startDate}
                onChange={(e) => onChange(entry.id, 'startDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTab;
