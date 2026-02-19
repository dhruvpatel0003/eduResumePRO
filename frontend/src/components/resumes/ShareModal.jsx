import React, { useState, useEffect, useRef } from 'react';

// Mock professors — replace with real API call (e.g., userService.getProfessors())
const MOCK_PROFESSORS = [
  {
    _id: 'p1',
    name: 'Prof. ABC',
    tags: ['Senior Faculty Advisor', 'Resume Viewer', 'Career Advisor'],
  },
  {
    _id: 'p2',
    name: 'Dr. Sarah Johnson',
    tags: ['Associate Professor', 'Resume Reviewer'],
  },
  {
    _id: 'p3',
    name: 'Dr. Michael Chen',
    tags: ['Department Head', 'Career Mentor'],
  },
];

const ShareModal = ({ resumeId, onShare, onCancel }) => {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelector);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [loading]);

  // Load professors on mount
  useEffect(() => {
    const loadProfessors = async () => {
      try {
        // TODO: replace with real API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setProfessors(MOCK_PROFESSORS);
      } catch (err) {
        setError('Failed to load professors');
      } finally {
        setLoading(false);
      }
    };
    loadProfessors();
  }, []);

  const handleShare = async () => {
    if (!selectedProfessorId) return;
    setSharing(true);
    setError('');
    try {
      // TODO: replace with real API call (e.g., resumeService.share(resumeId, professorId))
      await new Promise(resolve => setTimeout(resolve, 500));
      onShare(selectedProfessorId);
    } catch (err) {
      setError('Failed to share resume. Please try again.');
      setSharing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-container share-modal"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-label="Share with Professor"
        aria-modal="true"
      >
        <div className="share-modal-top">
          <div className="modal-header">Share with Professor</div>
          <div className="share-modal-actions-top">
            <button className="modal-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="modal-btn-confirm"
              onClick={handleShare}
              disabled={!selectedProfessorId || sharing}
            >
              {sharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>

        <div className="modal-body">
          {error && (
            <p className="share-modal-error">{error}</p>
          )}

          {loading ? (
            <div className="share-modal-loading">
              <div className="share-modal-spinner" />
            </div>
          ) : professors.length === 0 ? (
            <p className="share-modal-empty">No professors available.</p>
          ) : (
            <div
              className="share-professor-list"
              role="radiogroup"
              aria-label="Select a professor"
            >
              {professors.map((prof) => (
                <label
                  key={prof._id}
                  className={`share-professor-item${selectedProfessorId === prof._id ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="professor-selection"
                    value={prof._id}
                    checked={selectedProfessorId === prof._id}
                    onChange={() => setSelectedProfessorId(prof._id)}
                  />
                  <div className="share-professor-info">
                    <div className="share-professor-name">{prof.name}</div>
                    {prof.tags && prof.tags.length > 0 && (
                      <div className="share-professor-tags">
                        {prof.tags.join(' | ')}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
