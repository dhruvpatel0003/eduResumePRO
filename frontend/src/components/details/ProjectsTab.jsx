import React, { useState } from 'react';

const ProjectsTab = ({ entries, selections, onToggle, onChange, githubUrl }) => {
  const [mode, setMode] = useState('manual');
  const [autoImportProjects, setAutoImportProjects] = useState([]);
  const [autoSelections, setAutoSelections] = useState([]);

  const handleImport = () => {
    // TODO: fetch from GitHub API
    setAutoImportProjects([
      { id: 'auto-1', name: 'Project - 1' },
      { id: 'auto-2', name: 'Project - 2' },
      { id: 'auto-3', name: 'Project - 3' },
    ]);
  };

  const toggleAutoSelect = (id) => {
    setAutoSelections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="project-mode-toggle">
        <label className="project-mode-option">
          <input
            type="radio"
            name="projectMode"
            value="manual"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
          />
          Manual
        </label>
        <label className="project-mode-option">
          <input
            type="radio"
            name="projectMode"
            value="auto"
            checked={mode === 'auto'}
            onChange={() => setMode('auto')}
          />
          Auto Import
        </label>
      </div>

      {mode === 'manual' ? (
        <div>
          {entries.map((entry, index) => (
            <div key={entry.id} className="details-form-section">
              <div className="details-form-section-header">
                <input
                  type="checkbox"
                  checked={selections.includes(entry.id)}
                  onChange={() => onToggle(entry.id)}
                />
                Project - {index + 1}
              </div>
              <div className="details-form-grid">
                <div className="details-form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) => onChange(entry.id, 'name', e.target.value)}
                    placeholder="Project Name"
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
                  <label>Role</label>
                  <input
                    type="text"
                    value={entry.role}
                    onChange={(e) => onChange(entry.id, 'role', e.target.value)}
                    placeholder="Your Role"
                  />
                </div>
                <div className="details-form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={entry.githubUrl}
                    onChange={(e) => onChange(entry.id, 'githubUrl', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="details-form-group full-width">
                  <label>Project Description</label>
                  <textarea
                    value={entry.description}
                    onChange={(e) => onChange(entry.id, 'description', e.target.value)}
                    placeholder="Describe the project"
                  />
                  <button type="button" className="generate-era-link" onClick={() => {}}>
                    Generate with ERA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="auto-import-row">
            <label>GitHub URL</label>
            <input type="text" value={githubUrl || ''} readOnly placeholder="Shows the GitHub URL here." />
            <button className="btn-primary" onClick={handleImport}>Import</button>
          </div>

          {autoImportProjects.length > 0 && (
            <div className="auto-import-list">
              {autoImportProjects.map(proj => (
                <div key={proj.id} className="auto-import-item">
                  <input
                    type="checkbox"
                    checked={autoSelections.includes(proj.id)}
                    onChange={() => toggleAutoSelect(proj.id)}
                  />
                  {proj.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
