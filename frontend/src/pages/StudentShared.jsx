import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import resumeService from '../services/resumeService';
import DocumentViewer from '../components/DocumentViewer';
import '../styles/shared.css';
import '../styles/details.css';

const StudentShared = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter state
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [sharedEntries, setSharedEntries] = useState([]);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Show share success banner from navigation state
  useEffect(() => {
    if (location.state?.shareSuccess) {
      setSuccessBanner('Resume shared successfully!');
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSuccessBanner(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Load shared resumes on mount
  useEffect(() => {
    const loadSharedResumes = async () => {
      try {
        setInitialLoading(true);
        const data = await resumeService.getMyResumes();
        const resumes = data.resumes || [];

        // Build shared entries from reviewers on each resume
        const entries = [];
        for (const resume of resumes) {
          const reviewers = resume.reviewers || [];
          if (reviewers.length === 0) continue;

          // Load feedback for this resume
          let feedbackThreads = [];
          try {
            const feedbackData = await resumeService.getFeedback(resume._id);
            feedbackThreads = feedbackData.feedbackThreads || [];
          } catch {
            // No feedback yet — still show the shared entry
          }

          for (const reviewer of reviewers) {
            const prof = reviewer.facultyId || {};
            const profId = String(prof._id || prof);

            // Find feedback thread for this professor
            const thread = feedbackThreads.find(
              t => String(t.facultyId?._id || t.facultyId) === profId
            );
            const comments = thread?.comments || [];

            const statusMap = {
              pending: 'Pending Review',
              viewed: 'Under Review',
              completed: 'Resolved',
            };

            entries.push({
              id: `${resume._id}-${profId}`,
              resumeId: resume._id,
              resumeTitle: resume.title || 'Resume',
              professorId: profId,
              professorName: prof.name || prof.email || 'Professor',
              status: statusMap[reviewer.status] || 'Pending Review',
              sharedAt: reviewer.sharedAt,
              feedback: comments.map((c, idx) => ({
                id: c._id || `fb-${idx}`,
                section: c.fieldPath?.toUpperCase() || 'GENERAL',
                message: c.text || c.note || c.suggestedValue || '',
                accepted: c.status === 'accepted',
              })),
            });
          }
        }
        setSharedEntries(entries);
      } catch (err) {
        setError(err || 'Failed to load shared resumes');
      } finally {
        setInitialLoading(false);
      }
    };

    loadSharedResumes();
  }, []);

  // Get unique professors from shared entries
  const professors = sharedEntries.reduce((acc, entry) => {
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

    // Revoke previous blob URL
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(null);
    }

    try {
      const entry = sharedEntries.find(e => e.professorId === selectedProfessor);
      setActiveEntry(entry || null);

      // Load resume PDF preview
      if (entry) {
        setLoadingPdf(true);
        try {
          const pdfBlob = await resumeService.downloadPdf(entry.resumeId);
          setResumePreviewUrl(URL.createObjectURL(pdfBlob));
        } catch {
          // PDF may not exist yet (not generated)
        } finally {
          setLoadingPdf(false);
        }
      }
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
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(null);
    }
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
  const handleAcceptAll = async () => {
    if (!activeEntry?.resumeId) return;

    try {
      await resumeService.acceptAllFeedback(activeEntry.resumeId);
      setActiveEntry(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: prev.feedback.map(f => ({ ...f, accepted: true })),
        };
      });
    } catch {
      // Fall back to client-side only
      setActiveEntry(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedback: prev.feedback.map(f => ({ ...f, accepted: true })),
        };
      });
    }
  };

  const hasAcceptedFeedback = activeEntry?.feedback.some(f => f.accepted) || false;
  const allAccepted = activeEntry?.feedback.length > 0 && activeEntry.feedback.every(f => f.accepted);

  // Update Resume — opens confirm modal
  const handleUpdateResume = () => {
    if (!hasAcceptedFeedback) return;
    setShowConfirmModal(true);
  };

  // Confirm update
  const handleConfirmUpdate = async () => {
    if (!activeEntry?.resumeId) return;
    try {
      await resumeService.acceptAllFeedback(activeEntry.resumeId);
      setShowConfirmModal(false);
      setActiveEntry(prev => prev ? { ...prev, status: 'Resolved' } : prev);
      setSuccessBanner('Resume updated and feedback accepted.');
      navigate('/report', { state: { fromShared: true, resumeId: activeEntry.resumeId } });
    } catch (err) {
      setShowConfirmModal(false);
      setError(err || 'Failed to update resume.');
    }
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
                <span className={`shared-status-badge ${activeEntry.status === 'Under Review' ? 'under-review' : activeEntry.status === 'Pending Review' ? 'under-review' : activeEntry.status === 'Resolved' ? 'resolved' : ''}`}>
                  {activeEntry.status}
                </span>
              </div>
            </div>
          </div>

          {/* Resume Preview */}
          <div style={{ marginBottom: 16 }}>
            {loadingPdf ? (
              <div className="shared-loading">
                <div className="shared-spinner" />
              </div>
            ) : (
              <DocumentViewer
                previewUrl={resumePreviewUrl}
                title={activeEntry.resumeTitle}
                placeholderLabel="Resume not generated yet"
              />
            )}
          </div>

          {/* Feedback Section */}
          <div className="shared-feedback-section">
            <div className="shared-feedback-header">
              <div className="shared-feedback-title">
                Feedback
                {activeEntry.feedback.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: '#6b7280' }}>
                    ({activeEntry.feedback.length})
                  </span>
                )}
              </div>
              <div className="shared-feedback-actions">
                <button
                  className="shared-action-link"
                  onClick={handleAcceptAll}
                  disabled={allAccepted || activeEntry.feedback.length === 0}
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
              <div className="shared-empty">No feedback from this professor yet.</div>
            )}
          </div>
        </>
      )}

      {/* Initial loading state */}
      {initialLoading && (
        <div className="shared-loading">
          <div className="shared-spinner" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !initialLoading && !activeEntry && !error && (
        <div className="shared-empty">
          {sharedEntries.length === 0
            ? 'No shared resumes found. Share a resume with a professor first.'
            : 'Select a professor to view shared documents and feedback.'}
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

export default StudentShared;
