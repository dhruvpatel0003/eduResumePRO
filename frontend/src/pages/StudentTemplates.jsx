import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/templates.css';

// Mock major categories — replace with real API data
const MAJOR_CATEGORIES = [
  { id: 'all', name: 'All Majors' },
  { id: 'cse-grad', name: 'Computer Engineering - Graduate' },
  { id: 'cse-undergrad', name: 'Computer Engineering - Undergraduate' },
  { id: 'ece', name: 'Electrical Engineering' },
  { id: 'mech', name: 'Mechanical Engineering' },
  { id: 'business', name: 'Business Administration' },
  { id: 'biology', name: 'Biology' },
];

// Mock templates — replace with real API data
const MOCK_TEMPLATES = [
  { _id: 't1', name: 'Graduate Student - CSE', majorCategoryId: 'cse-grad', thumbnail: null },
  { _id: 't2', name: 'Undergraduate - CSE', majorCategoryId: 'cse-undergrad', thumbnail: null },
  { _id: 't3', name: 'Engineering General', majorCategoryId: 'ece', thumbnail: null },
  { _id: 't4', name: 'Business Professional', majorCategoryId: 'business', thumbnail: null },
  { _id: 't5', name: 'Research Assistant - Bio', majorCategoryId: 'biology', thumbnail: null },
  { _id: 't6', name: 'Mechanical Design Resume', majorCategoryId: 'mech', thumbnail: null },
];

const StudentTemplates = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMajor = searchParams.get('major') || 'all';

  const [selectedMajorId, setSelectedMajorId] = useState(initialMajor);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTemplates = async (majorId) => {
    try {
      setLoading(true);
      setError('');

      // TODO: replace with real API call, e.g. templateService.getAll({ major: majorId })
      await new Promise(resolve => setTimeout(resolve, 400));

      let filtered = MOCK_TEMPLATES;
      if (majorId && majorId !== 'all') {
        filtered = MOCK_TEMPLATES.filter(t => t.majorCategoryId === majorId);
      }
      setTemplates(filtered);
    } catch (err) {
      setError(err || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(selectedMajorId);
  }, [selectedMajorId]);

  const handleMajorChange = (majorId) => {
    setSelectedMajorId(majorId);
    setSearchParams(majorId === 'all' ? {} : { major: majorId });
  };

  const handleApply = () => {
    fetchTemplates(selectedMajorId);
  };

  const handleReset = () => {
    handleMajorChange('all');
  };

  const handleCardClick = (templateId) => {
    navigate(`/templates/${templateId}?major=${selectedMajorId}`);
  };

  return (
    <div className="templates-container">
      {/* Filter Header Row */}
      <div className="templates-filter-row">
        <div className="templates-filter-left">
          <label htmlFor="major-select">Select Major</label>
          <select
            id="major-select"
            className="templates-major-select"
            value={selectedMajorId}
            onChange={(e) => handleMajorChange(e.target.value)}
          >
            {MAJOR_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
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
          <button className="templates-action-link" onClick={() => fetchTemplates(selectedMajorId)} style={{ marginLeft: 12 }}>
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
