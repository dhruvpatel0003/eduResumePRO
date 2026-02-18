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
  const [successBanner] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await resumeService.getAll();
      setResumes(data);
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
    if (!selectedResumeId) return;
    try {
      await resumeService.delete(selectedResumeId);
      setResumes((prev) => prev.filter((r) => r._id !== selectedResumeId));
      setSelectedResumeId(null);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err || 'Failed to delete resume');
      setShowDeleteModal(false);
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
            Shared with Professor
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
    </div>
  );
};

export default Resumes;
