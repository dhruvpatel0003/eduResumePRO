import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/shared.css';
import '../styles/details.css';

// Mock data — replace with real API calls
const MOCK_SHARED_ENTRIES = [
  {
    id: 'se1',
    resumeId: 'r1',
    resumeTitle: 'My Resume',
    professorId: 'p1',
    professorName: 'Prof. ABC',
    status: 'Under Review',
    feedback: [
      {
        id: 'fb1',
        section: 'SKILLS',
        message: 'Need to update and add more specific',
        accepted: false,
      },
      {
        id: 'fb2',
        section: 'EXPERIENCE',
        message: 'Respell this word to professional experience',
        accepted: false,
      },
      {
        id: 'fb3',
        section: 'EDUCATION',
        message: 'Add GPA if above 3.5',
        accepted: false,
      },
    ],
  },
  {
    id: 'se2',
    resumeId: 'r1',
    resumeTitle: 'My Resume',
    professorId: 'p2',
    professorName: 'Prof. XYZ',
    status: 'Resolved',
    feedback: [
      {
        id: 'fb4',
        section: 'PROJECTS',
        message: 'Include technologies used in each project',
        accepted: true,
      },
    ],
  },
];

const Shared = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter state
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Show share success banner from navigation state
  useEffect(() => {
    if (location.state?.shareSuccess) {
      setSuccessBanner('Resume shared successfully!');
      // Clear the state so it doesn't show on refresh
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessBanner(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Get unique professors from shared entries
  const professors = MOCK_SHARED_ENTRIES.reduce((acc, entry) => {
    if (!acc.find(p => p.id === entry.professorId)) {
      acc.push({ id: entry.professorId, name: entry.professorName });
    }
    return acc;
  }, []);

  // Apply filter
  const handleApply = async () => {
    if (!selectedProfessor) return;
    setLoading(true);
    setError('');

    try {
      // TODO: replace with real API call
      await new Promise(resolve => setTimeout(resolve, 400));
      const entry = MOCK_SHARED_ENTRIES.find(e => e.professorId === selectedProfessor);
      setActiveEntry(entry || null);
    } catch (err) {
      setError('Failed to load shared document.');
    } finally {
      setLoading(false);
    }
  };

  // Reset filter
  const handleReset = () => {
    setSelectedProfessor('');
    setActiveEntry(null);
    setError('');
  };

  // Toggle feedback acceptance
  const toggleFeedback = (feedbackId) => {
    setActiveEntry(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedback: prev.feedback.map(f =>
          f.id === feedbackId ? { ...f, accepted: !f.accepted } : f
        ),
      };
    });
  };

  // Accept All feedback
  const handleAcceptAll = () => {
    setActiveEntry(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedback: prev.feedback.map(f => ({ ...f, accepted: true })),
      };
    });
  };

  const hasAcceptedFeedback = activeEntry?.feedback.some(f => f.accepted) || false;
  const allAccepted = activeEntry?.feedback.length > 0 && activeEntry.feedback.every(f => f.accepted);

  // Update Resume — opens confirm modal
  const handleUpdateResume = () => {
    if (!hasAcceptedFeedback) return;
    setShowConfirmModal(true);
  };

  // Confirm update
  const handleConfirmUpdate = () => {
    setShowConfirmModal(false);
    // TODO: real API call to apply updates + close feedback ticket
    setActiveEntry(prev => prev ? { ...prev, status: 'Resolved' } : prev);
    setSuccessBanner('Resume updated and feedback ticket closed.');
    // Navigate to Report Update Resume flow
    navigate('/report', { state: { fromShared: true, resumeId: activeEntry?.resumeId } });
  };

  // Cancel update
  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
  };

  return (
    <div>
      {/* Success Banner */}
      {successBanner && (
        <div className="shared-success-banner">
          <p>{successBanner}</p>
        </div>
      )}

      {/* Header Filter Row */}
      <div className="shared-header-row">
        <div className="shared-header-left">
          <label htmlFor="shared-professor-select">Already Shared with</label>
          <select
            id="shared-professor-select"
            className="shared-select"
            value={selectedProfessor}
            onChange={(e) => setSelectedProfessor(e.target.value)}
          >
            <option value="">-- Select --</option>
            {professors.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="shared-header-right">
          <button
            className="shared-action-link"
            onClick={handleApply}
            disabled={!selectedProfessor || loading}
          >
            Apply
          </button>
          <button
            className="shared-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="shared-error">
          <p>{error}</p>
          <button className="shared-action-link" onClick={handleApply}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="shared-loading">
          <div className="shared-spinner" />
        </div>
      )}

      {/* Active shared entry */}
      {!loading && activeEntry && (
        <>
          {/* Shared Document Info */}
          <div className="shared-document-section">
            <div className="shared-document-grid">
              <div className="shared-document-field">
                <label>Shared Document</label>
                <select className="shared-select" disabled value={activeEntry.resumeTitle}>
                  <option>{activeEntry.resumeTitle}</option>
                </select>
              </div>
              <div className="shared-document-field">
                <label>Status</label>
                <span className={`shared-status-badge ${activeEntry.status === 'Under Review' ? 'under-review' : activeEntry.status === 'Resolved' ? 'resolved' : ''}`}>
                  {activeEntry.status}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="shared-feedback-section">
            <div className="shared-feedback-header">
              <div className="shared-feedback-title">Feedback</div>
              <div className="shared-feedback-actions">
                <button
                  className="shared-action-link"
                  onClick={handleAcceptAll}
                  disabled={allAccepted}
                >
                  Accept All
                </button>
                <button
                  className="shared-action-link"
                  onClick={handleUpdateResume}
                  disabled={!hasAcceptedFeedback}
                >
                  Update Resume
                </button>
              </div>
            </div>
            {activeEntry.feedback.length > 0 ? (
              <div className="shared-feedback-list">
                {activeEntry.feedback.map(item => (
                  <div
                    key={item.id}
                    className={`shared-feedback-item${item.accepted ? ' accepted' : ''}`}
                  >
                    <div className="shared-feedback-check">
                      <input
                        type="checkbox"
                        checked={item.accepted}
                        onChange={() => toggleFeedback(item.id)}
                        aria-label={`Accept feedback: ${item.message}`}
                      />
                      <div>
                        <div className="shared-feedback-section-label">{item.section}</div>
                        <div className="shared-feedback-message">{item.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="shared-empty">No feedback yet.</div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !activeEntry && !error && (
        <div className="shared-empty">
          Select a professor to view shared documents and feedback.
        </div>
      )}

      {/* Confirm Update Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelUpdate}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Update Resume</div>
            <div className="modal-body">
              <p>Do you want to update resume and close feedback ticket?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={handleCancelUpdate}>No</button>
              <button className="modal-btn-confirm" onClick={handleConfirmUpdate}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shared;
