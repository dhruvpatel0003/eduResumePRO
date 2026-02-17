import React from 'react';

const EducationTab = ({ entries, selections, onToggle, onChange }) => {
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
            Education - {index + 1}
          </div>
          <div className="details-form-grid">
            <div className="details-form-group">
              <label>Degree</label>
              <select
                value={entry.degree}
                onChange={(e) => onChange(entry.id, 'degree', e.target.value)}
              >
                <option value="">Select Degree</option>
                <option value="bachelors">Bachelor's</option>
                <option value="masters">Master's</option>
                <option value="phd">PhD</option>
                <option value="associate">Associate</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>
            <div className="details-form-group">
              <label>Program</label>
              <select
                value={entry.program}
                onChange={(e) => onChange(entry.id, 'program', e.target.value)}
              >
                <option value="">Select Program</option>
                <option value="cs">Computer Science</option>
                <option value="it">Information Technology</option>
                <option value="ee">Electrical Engineering</option>
                <option value="me">Mechanical Engineering</option>
                <option value="business">Business Administration</option>
                <option value="other">Other</option>
              </select>
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
              <label>CGPA</label>
              <input
                type="text"
                value={entry.cgpa}
                onChange={(e) => onChange(entry.id, 'cgpa', e.target.value)}
                placeholder="e.g. 3.8"
              />
            </div>
            <div className="details-form-group">
              <label>Starting Date</label>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationTab;
