import React, { useState, useEffect, useRef } from 'react';
import DeleteModal from '../components/details/DeleteModal';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import templateService from '../services/templateService';
import { useAuth } from '../context/AuthContext';
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

const ProfessorTemplates = () => {
  const { user } = useAuth();

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
      const data = await templateService.getAll();
      const list = Array.isArray(data) ? data : data.templates || [];
      const filtered = scope === 'uploaded'
        ? list.filter(t => t.professorId === user?._id || t.professorId === user?.id)
        : list;
      setTemplates(filtered);
      setSelectedIds(new Set());
    } catch (err) {
      setError('Failed to fetch templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(appliedScope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Delete each selected template individually
      const idsToDelete = Array.from(selectedIds);
      await Promise.all(idsToDelete.map(id => templateService.delete(id)));
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
      const formData = new FormData();
      formData.append('pdf', uploadFile);
      formData.append('name', uploadFile.name.replace(/\.[^/.]+$/, ''));

      await templateService.create(formData);

      // Refresh templates list
      setShowUploadModal(false);
      setSuccessBanner('Template uploaded successfully.');
      setTimeout(() => setSuccessBanner(''), 4000);
      fetchTemplates(appliedScope);
    } catch (err) {
      setUploadError(err || 'Failed to upload template. Try again.');
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
