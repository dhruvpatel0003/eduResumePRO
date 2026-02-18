import React, { useState, useEffect, useRef } from 'react';
import DeleteModal from '../components/details/DeleteModal';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import '../styles/professor-templates.css';
import '../styles/details.css';

// Filter options
const SCOPE_OPTIONS = [
  { value: 'uploaded', label: 'Your Uploaded Templates' },
  { value: 'all', label: 'Show All Templates' },
];

const DEFAULT_SCOPE = 'uploaded';

// Accepted file types
const ACCEPTED_TYPES = '.pdf,.docx,.json';

// Mock data — replace with real API calls
const MOCK_UPLOADED_TEMPLATES = [
  { _id: 'pt1', name: 'Graduate Student - CSE', thumbnail: null, uploadedBy: 'me' },
];

const MOCK_ALL_TEMPLATES = [
  { _id: 'pt1', name: 'Graduate Student - CSE', thumbnail: null, uploadedBy: 'me' },
  { _id: 'pt2', name: 'Undergraduate - CSE', thumbnail: null, uploadedBy: 'other' },
  { _id: 'pt3', name: 'Engineering General', thumbnail: null, uploadedBy: 'other' },
];

const ProfessorTemplates = () => {
  // Filter state
  const [selectedScope, setSelectedScope] = useState(DEFAULT_SCOPE);
  const [appliedScope, setAppliedScope] = useState(DEFAULT_SCOPE);

  // Data state
  const [templates, setTemplates] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch templates
  const fetchTemplates = async (scope) => {
    setLoading(true);
    setError('');

    try {
      // TODO: replace with real API call — GET /templates?scope=uploaded|all
      await new Promise(resolve => setTimeout(resolve, 400));
      const data = scope === 'all' ? MOCK_ALL_TEMPLATES : MOCK_UPLOADED_TEMPLATES;
      setTemplates(data);
      setSelectedIds(new Set());
    } catch (err) {
      setError('Failed to fetch templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(appliedScope);
  }, [appliedScope]);

  // Filter actions
  const handleApply = () => {
    setAppliedScope(selectedScope);
  };

  const handleReset = () => {
    setSelectedScope(DEFAULT_SCOPE);
    setAppliedScope(DEFAULT_SCOPE);
  };

  // Selection
  const allSelected = templates.length > 0 && selectedIds.size === templates.length;
  const noneSelected = selectedIds.size === 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(templates.map(t => t._id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Delete
  const handleDeleteClick = () => {
    if (noneSelected) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // TODO: replace with real API call — DELETE /templates (bulk)
      await new Promise(resolve => setTimeout(resolve, 300));
      setTemplates(prev => prev.filter(t => !selectedIds.has(t._id)));
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      setSuccessBanner('Templates deleted successfully.');
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      setError('Failed to delete templates.');
      setShowDeleteModal(false);
    }
  };

  // Upload modal
  const openUploadModal = () => {
    setUploadFile(null);
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // TODO: replace with real API call — POST /templates/upload
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock: add to list
      const newTemplate = {
        _id: `pt-${Date.now()}`,
        name: uploadFile.name.replace(/\.[^/.]+$/, ''),
        thumbnail: null,
        uploadedBy: 'me',
      };
      setTemplates(prev => [...prev, newTemplate]);
      setShowUploadModal(false);
      setSuccessBanner('Template uploaded successfully.');
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      setUploadError('Failed to upload template. Try again.');
    } finally {
      setUploading(false);
    }
  };

  // Escape key for upload modal
  useEffect(() => {
    if (!showUploadModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowUploadModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showUploadModal]);

  return (
    <div>
      {/* Success Banner */}
      {successBanner && (
        <div className="prof-templates-success-banner">
          <p>{successBanner}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="prof-templates-filter-row">
        <div className="prof-templates-filter-left">
          <select
            className="prof-templates-select"
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            aria-label="Template scope filter"
          >
            {SCOPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="prof-templates-filter-right">
          <button
            className="prof-templates-action-link"
            onClick={handleApply}
            disabled={loading}
          >
            Apply
          </button>
          <button
            className="prof-templates-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="prof-templates-toolbar">
        <div className="prof-templates-toolbar-left">
          <label className="prof-templates-select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              disabled={templates.length === 0}
              aria-label="Select all templates"
            />
            Select All
          </label>
          <button
            className="prof-templates-toolbar-action upload-action"
            onClick={openUploadModal}
          >
            + Upload
          </button>
          <button
            className="prof-templates-toolbar-action delete-action"
            onClick={handleDeleteClick}
            disabled={noneSelected}
          >
            Delete
          </button>
        </div>
        <div className="prof-templates-toolbar-right">
          <button className="prof-templates-toolbar-action" disabled aria-label="Previous">
            <ChevronLeftIcon />
          </button>
          <button className="prof-templates-toolbar-action" disabled aria-label="Next">
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="prof-templates-error">
          <p>{error}</p>
          <button className="prof-templates-action-link" onClick={() => fetchTemplates(appliedScope)}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="prof-templates-loading">
          <div className="prof-templates-spinner" />
        </div>
      ) : templates.length === 0 ? (
        /* Empty State */
        <div className="prof-templates-empty">
          <p>No templates found.</p>
          <button className="prof-templates-empty-link" onClick={openUploadModal}>
            Upload Now
          </button>
        </div>
      ) : (
        /* Templates Grid */
        <div className="prof-templates-grid">
          {templates.map(template => (
            <label
              key={template._id}
              className={`prof-template-card${selectedIds.has(template._id) ? ' selected' : ''}`}
            >
              <input
                type="checkbox"
                className="prof-template-card-checkbox"
                checked={selectedIds.has(template._id)}
                onChange={() => toggleSelect(template._id)}
                aria-label={template.name}
              />
              <div className="prof-template-card-thumbnail">
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} />
                ) : (
                  <div className="prof-template-card-thumbnail-placeholder" />
                )}
              </div>
              <div className="prof-template-card-name">{template.name}</div>
            </label>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-container upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-top">
              <div className="modal-header">Upload Template</div>
              <div className="upload-modal-actions-top">
                <button className="modal-btn-cancel" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button
                  className="modal-btn-confirm"
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
            <div className="upload-file-row">
              <button
                className="upload-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </button>
              <span className={`upload-file-name${!uploadFile ? ' placeholder' : ''}`}>
                {uploadFile ? uploadFile.name : 'No file selected'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            {uploadError && <div className="upload-error">{uploadError}</div>}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ProfessorTemplates;
