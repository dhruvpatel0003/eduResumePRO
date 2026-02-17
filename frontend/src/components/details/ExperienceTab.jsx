import React from 'react';

const ExperienceTab = ({ entries, selections, onToggle, onChange }) => {
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
            Experience - {index + 1}
          </div>
          <div className="details-form-grid">
            <div className="details-form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={entry.company}
                onChange={(e) => onChange(entry.id, 'company', e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div className="details-form-group">
              <label>Location</label>
              <input
                type="text"
                value={entry.location}
                onChange={(e) => onChange(entry.id, 'location', e.target.value)}
                placeholder="Location"
              />
            </div>
            <div className="details-form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={entry.startDate}
                onChange={(e) => onChange(entry.id, 'startDate', e.target.value)}
              />
            </div>
            <div className="details-form-group">
              <label>End Date</label>
              <input
                type="date"
                value={entry.endDate}
                onChange={(e) => onChange(entry.id, 'endDate', e.target.value)}
              />
            </div>
            <div className="details-form-group">
              <label>Job Role</label>
              <input
                type="text"
                value={entry.role}
                onChange={(e) => onChange(entry.id, 'role', e.target.value)}
                placeholder="Job Role"
              />
            </div>
            <div className="details-form-group full-width">
              <label>Job Description</label>
              <textarea
                value={entry.description}
                onChange={(e) => onChange(entry.id, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements"
              />
              <button type="button" className="generate-era-link" onClick={() => {}}>
                Generate with ERA
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTab;
