import React, { useState, useEffect } from 'react';
import templateService from '../services/templateService';
import '../styles/templates.css';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (templateId) => {
    window.location.href = `/resume/create?template=${templateId}`;
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading templates...</div>;

  return (
    <div className="templates-container">
      <div className="templates-header">
        <h1>Resume Templates</h1>
        <p>Choose a template and start building your resume</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {templates.length === 0 ? (
        <div className="empty-state">
          <p>No templates available at the moment.</p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map(template => (
            <div key={template._id} className="template-card">
              {template.thumbnail && (
                <div className="template-preview">
                  <img src={template.thumbnail} alt={template.name} />
                </div>
              )}
              <h3>{template.name}</h3>
              <p className="template-description">{template.description}</p>
              <span className={`badge ${template.category}`}>{template.category}</span>
              <button 
                className="btn-primary" 
                onClick={() => handleUseTemplate(template._id)}
              >
                Use This Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
