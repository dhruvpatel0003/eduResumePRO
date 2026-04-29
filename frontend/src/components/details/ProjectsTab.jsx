import React, { useState } from 'react';
import githubService from '../../services/githubService';

const ProjectsTab = ({ entries, selections, onToggle, onChange, githubUrl, resumeId, onEraGenerate }) => {
  const [mode, setMode] = useState('manual');
  const [autoImportProjects, setAutoImportProjects] = useState([]);
  const [autoSelections, setAutoSelections] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!githubUrl) {
      setImportError('Please add your GitHub URL in the Personal tab first.');
      return;
    }
    // Extract username from GitHub URL (e.g., "github.com/username" or just "username")
    const url = githubUrl.replace(/^https?:\/\//, '');
    const parts = url.replace(/^github\.com\//, '').split('/');
    const username = parts[0];
    if (!username) {
      setImportError('Could not determine GitHub username from URL.');
      return;
    }

    setImportLoading(true);
    setImportError('');
    try {
      const data = await githubService.previewRepos(username);
      const repos = data.repos || data.repositories || data || [];
      setAutoImportProjects(
        (Array.isArray(repos) ? repos : []).map(repo => ({
          id: repo.repoFullName || repo.full_name || repo.name,
          name: repo.name || repo.repoFullName,
          repoFullName: repo.repoFullName || repo.full_name,
          description: repo.description || '',
          language: repo.language || '',
        }))
      );
    } catch (err) {
      setImportError(typeof err === 'string' ? err : 'Failed to fetch repositories.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportSelected = async () => {
    if (!resumeId || autoSelections.length === 0) return;
    setImporting(true);
    setImportError('');
    try {
      const selectedProjects = autoSelections.map(id => {
        const proj = autoImportProjects.find(p => p.id === id);
        return { repoFullName: proj?.repoFullName || id };
      });
      await githubService.importProjects(resumeId, selectedProjects);
      setAutoSelections([]);
      setAutoImportProjects([]);
      setMode('manual');
      // Parent will reload resume details to show imported projects
      window.location.reload();
    } catch (err) {
      setImportError(typeof err === 'string' ? err : 'Failed to import selected projects.');
    } finally {
      setImporting(false);
    }
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
                  <button
                    type="button"
                    className="generate-era-link"
                    onClick={() => onEraGenerate && onEraGenerate(entry, 'project')}
                  >
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
            <input type="text" value={githubUrl || ''} readOnly placeholder="Add your GitHub URL in the Personal tab." />
            <button className="btn-primary" onClick={handleImport} disabled={importLoading}>
              {importLoading ? 'Fetching...' : 'Import'}
            </button>
          </div>

          {importError && (
            <div className="error-message" style={{ marginBottom: 12, color: '#ef4444', fontSize: 13 }}>
              {importError}
            </div>
          )}

          {autoImportProjects.length > 0 && (
            <>
              <div className="auto-import-list">
                {autoImportProjects.map(proj => (
                  <div key={proj.id} className="auto-import-item">
                    <input
                      type="checkbox"
                      checked={autoSelections.includes(proj.id)}
                      onChange={() => toggleAutoSelect(proj.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{proj.name}</div>
                      {proj.description && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{proj.description}</div>
                      )}
                    </div>
                    {proj.language && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{proj.language}</span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <button
                  className="btn-primary"
                  onClick={handleImportSelected}
                  disabled={autoSelections.length === 0 || importing}
                >
                  {importing ? 'Importing...' : `Import Selected (${autoSelections.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
