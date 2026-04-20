import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import resumeService from '../services/resumeService';
import DeleteModal from '../components/details/DeleteModal';
import ShareModal from '../components/resumes/ShareModal';
import '../styles/resumes.css';
import '../styles/details.css';

const Resumes = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await resumeService.getMyResumes();
      setResumes(data.resumes || []);
    } catch (err) {
      setError(err || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!selectedResumeId) return;
    navigate(`/report?resumeId=${selectedResumeId}`);
  };

  const handleDelete = async () => {
    // No backend delete route — close modal
    setShowDeleteModal(false);
  };

  const openRenameModal = () => {
    if (!selectedResumeId) return;
    const current = resumes.find(r => r._id === selectedResumeId);
    setRenameValue(current?.title || '');
    setShowRenameModal(true);
  };

  const handleRename = async () => {
    if (!selectedResumeId || !renameValue.trim()) return;
    setRenaming(true);
    try {
      // Fetch full details first so we send back the complete templateInfo
      const details = await resumeService.getDetails(selectedResumeId);
      const fullTemplateInfo = { ...details.templateInfo, title: renameValue.trim() };
      await resumeService.updateDetails(selectedResumeId, fullTemplateInfo);
      setResumes(prev => prev.map(r =>
        r._id === selectedResumeId ? { ...r, title: renameValue.trim() } : r
      ));
      setShowRenameModal(false);
      setSuccessBanner('Resume renamed successfully.');
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      setError(err || 'Failed to rename resume');
      setShowRenameModal(false);
    } finally {
      setRenaming(false);
    }
  };

  const handleShareSuccess = () => {
    setShowShareModal(false);
    navigate('/shared', { state: { shareSuccess: true } });
  };

  const handleRetry = () => {
    setError('');
    fetchResumes();
  };

  return (
    <div className="resumes-container">
      {/* Success Banner */}
      {successBanner && (
        <div className="resumes-success-banner">
          <p>{successBanner}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="resumes-toolbar">
        <div className="resumes-toolbar-left">
          <button
            className="resumes-action-link"
            disabled={!selectedResumeId || loading}
            onClick={() => setShowShareModal(true)}
          >
            Share with Professor
          </button>
          <button
            className="resumes-action-link"
            disabled={!selectedResumeId || loading}
            onClick={handleGenerateReport}
          >
            Generate Report
          </button>
        </div>
        <div className="resumes-toolbar-right">
          <button
            className="resumes-action-link"
            onClick={() => navigate('/templates')}
          >
            + Create New
          </button>
          <button
            className="resumes-action-link"
            disabled={!selectedResumeId || loading}
            onClick={() => navigate(`/details/${selectedResumeId}`)}
          >
            Edit
          </button>
          <button
            className="resumes-action-link"
            disabled={!selectedResumeId || loading}
            onClick={openRenameModal}
          >
            Rename
          </button>
          <button
            className="resumes-action-link resumes-action-link--danger"
            disabled={!selectedResumeId || loading}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="resumes-error">
          <p>{error}</p>
          <button className="resumes-action-link" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="resumes-loading">
          <div className="resumes-spinner" />
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="resumes-empty">
          <p>No resumes yet.</p>
          <Link to="/details" className="resumes-empty-link">
            Create a resume
          </Link>
        </div>
      ) : (
        /* Resume Card Grid */
        <div className="resumes-grid" role="radiogroup" aria-label="Select a resume">
          {resumes.map((resume) => (
            <label
              key={resume._id}
              className={`resumes-card${selectedResumeId === resume._id ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="resume-selection"
                value={resume._id}
                checked={selectedResumeId === resume._id}
                onChange={() => setSelectedResumeId(resume._id)}
                className="resumes-card-radio"
                aria-label={resume.title}
              />
              <div className="resumes-card-thumbnail">
                {resume.thumbnail ? (
                  <img src={resume.thumbnail} alt={resume.title} />
                ) : (
                  <div className="resumes-card-thumbnail-placeholder" />
                )}
              </div>
              <div className="resumes-card-name">{resume.title}</div>
              <div className="resumes-card-meta">
                {(() => {
                  const badges = [];
                  const reviewers = resume.reviewers || [];
                  const hasReviewers = reviewers.length > 0;
                  const hasFeedback = reviewers.some(r => r.status === 'completed');

                  if (hasFeedback) badges.push({ label: 'Feedback', color: '#059669', bg: '#f0fdf4' });
                  else if (hasReviewers) badges.push({ label: 'Shared', color: '#2563eb', bg: '#eff6ff' });

                  if (resume.pdfGenerated || resume.pdfUrl) badges.push({ label: 'Generated', color: '#7c3aed', bg: '#f5f3ff' });

                  if (badges.length === 0) badges.push({ label: 'Draft', color: '#6b7280', bg: '#f3f4f6' });

                  return badges.map(b => (
                    <span key={b.label} style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 10,
                      color: b.color,
                      background: b.bg,
                      marginRight: 4,
                    }}>
                      {b.label}
                    </span>
                  ));
                })()}
                {resume.updatedAt && (
                  <span style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginTop: 4 }}>
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Share with Professor Modal */}
      {showShareModal && selectedResumeId && (
        <ShareModal
          resumeId={selectedResumeId}
          onShare={handleShareSuccess}
          onCancel={() => setShowShareModal(false)}
        />
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Rename Resume</div>
            <div className="modal-body">
              <label htmlFor="rename-input" style={{ display: 'block', marginBottom: 8 }}>
                New name
              </label>
              <input
                id="rename-input"
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); }}
                autoFocus
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowRenameModal(false)}
                disabled={renaming}
              >
                Cancel
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleRename}
                disabled={!renameValue.trim() || renaming}
              >
                {renaming ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resumes;
