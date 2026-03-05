import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import templateService from '../services/templateService';
import '../styles/templates.css';

const StudentTemplates = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [templates, setTemplates] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await templateService.getAll();
      const list = Array.isArray(data) ? data : data.templates || [];
      setAllTemplates(list);
      setTemplates(list);
    } catch (err) {
      setError(err || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleApply = () => {
    if (!searchTerm.trim()) {
      setTemplates(allTemplates);
    } else {
      const term = searchTerm.toLowerCase();
      setTemplates(allTemplates.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      ));
    }
    setSearchParams(searchTerm.trim() ? { search: searchTerm } : {});
  };

  const handleReset = () => {
    setSearchTerm('');
    setTemplates(allTemplates);
    setSearchParams({});
  };

  const handleCardClick = (templateId) => {
    navigate(`/templates/${templateId}`);
  };

  return (
    <div className="templates-container">
      {/* Filter Header Row */}
      <div className="templates-filter-row">
        <div className="templates-filter-left">
          <label htmlFor="template-search">Search Templates</label>
          <input
            id="template-search"
            type="text"
            className="templates-major-select"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="templates-filter-right">
          <button className="templates-action-link" onClick={handleApply}>
            Apply
          </button>
          <button className="templates-action-link" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {error}
          <button className="templates-action-link" onClick={() => fetchTemplates()} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="templates-loading">
          <div className="templates-spinner" />
        </div>
      ) : templates.length === 0 ? (
        <div className="templates-empty">
          No templates found for this major.
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map(template => (
            <button
              key={template._id}
              className="template-card"
              onClick={() => handleCardClick(template._id)}
              aria-label={`View template: ${template.name}`}
            >
              <div className="template-thumbnail">
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} />
                ) : (
                  <div className="template-thumbnail-placeholder" />
                )}
              </div>
              <div className="template-card-title">{template.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTemplates;
