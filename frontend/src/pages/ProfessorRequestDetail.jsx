import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '../components/layout/icons';
import DocumentViewer from '../components/DocumentViewer';
import resumeService from '../services/resumeService';
import professorService from '../services/professorService';
import '../styles/professor-request.css';
import '../styles/details.css';

// Feedback categories
const FEEDBACK_CATEGORIES = [
  'SKILLS',
  'EXPERIENCE',
  'EDUCATION',
  'PROJECTS',
  'PERSONAL',
  'SUMMARY',
];

const ProfessorRequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  // Data state
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active view mode
  const [activeMode, setActiveMode] = useState('viewer'); // 'viewer' | 'give' | 'view'

  // Give Feedback editor state
  const [editorCategory, setEditorCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [editorText, setEditorText] = useState('');

  // View Feedback list state
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState(new Set());

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Fetch request detail
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const [detailsData, feedbackData] = await Promise.all([
          resumeService.getDetails(requestId),
          resumeService.getFeedback(requestId),
        ]);

        // Build feedback list from threads
        const feedbackItems = [];
        const threads = feedbackData.feedbackThreads || [];
        threads.forEach(thread => {
          (thread.comments || []).forEach((comment, idx) => {
            feedbackItems.push({
              id: comment._id || `fb-${thread.facultyId?._id}-${idx}`,
              category: comment.fieldPath?.toUpperCase() || 'GENERAL',
              text: comment.text || '',
              createdAt: comment.createdAt || new Date().toISOString(),
            });
          });
        });

        // Get PDF blob URL for viewer
        let resumeUrl = null;
        try {
          const pdfBlob = await resumeService.downloadPdf(requestId);
          resumeUrl = URL.createObjectURL(pdfBlob);
        } catch {
          // PDF may not exist yet
        }

        const personalInfo = detailsData.templateInfo?.personalInfo || {};
        setRequest({
          id: requestId,
          studentName: personalInfo.fullName || 'Student',
          level: '—',
          major: detailsData.template?.name || '—',
          requestedDate: detailsData.templateInfo?.updatedAt
            ? new Date(detailsData.templateInfo.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : '',
          status: 'In Progress',
          resumeUrl,
          feedback: feedbackItems,
        });
      } catch (err) {
        setError('Failed to load request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [requestId]);

  // Back navigation
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Action strip handlers
  const handleGiveFeedbackMode = () => {
    setActiveMode('give');
    setEditorCategory(FEEDBACK_CATEGORIES[0]);
    setEditorText('');
  };

  const handleViewFeedbackMode = () => {
    setActiveMode('view');
    setSelectedFeedbackIds(new Set());
  };

  // Give Feedback — Save
  const handleSaveFeedback = async () => {
    if (!editorText.trim()) return;

    try {
      await resumeService.addFacultyFeedback(requestId, [
        {
          fieldPath: editorCategory.toLowerCase(),
          text: editorText.trim(),
        },
      ]);

      const newFeedback = {
        id: `fb-${Date.now()}`,
        category: editorCategory,
        text: editorText.trim(),
        createdAt: new Date().toISOString(),
      };

      setRequest(prev => ({
        ...prev,
        feedback: [...prev.feedback, newFeedback],
      }));

      setEditorText('');
      setActiveMode('viewer');
    } catch (err) {
      setError('Failed to save feedback.');
    }
  };

  // Give Feedback — Cancel
  const handleCancelEditor = () => {
    setEditorText('');
    setActiveMode('viewer');
  };

  // View Feedback — toggle selection
  const toggleFeedbackSelect = (id) => {
    setSelectedFeedbackIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // View Feedback — Delete selected
  const handleDeleteFeedback = async () => {
    if (selectedFeedbackIds.size === 0) return;

    try {
      // Delete each feedback item individually via /api/feedback/:id
      const idsToDelete = Array.from(selectedFeedbackIds);
      await Promise.all(idsToDelete.map(id => professorService.deleteFeedback(id)));

      setRequest(prev => ({
        ...prev,
        feedback: prev.feedback.filter(f => !selectedFeedbackIds.has(f.id)),
      }));
      setSelectedFeedbackIds(new Set());
    } catch (err) {
      setError('Failed to delete feedback.');
    }
  };

  // View Feedback — Save (persist list changes) & Cancel
  const handleSaveList = () => {
    setActiveMode('viewer');
  };

  const handleCancelList = () => {
    setSelectedFeedbackIds(new Set());
    setActiveMode('viewer');
  };

  // Submit feedback
  const handleSubmitClick = () => {
    if (!request?.feedback.length) return;
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      // No dedicated submit route — feedback is already saved per-item
      setShowSubmitModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to submit feedback.');
      setShowSubmitModal(false);
    }
  };

  // Escape key for submit modal
  useEffect(() => {
    if (!showSubmitModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowSubmitModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showSubmitModal]);

  const feedbackCount = request?.feedback.length || 0;

  if (loading) {
    return (
      <div className="prof-req-loading">
        <div className="prof-req-spinner" />
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="prof-req-empty">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Back Link */}
      <button className="prof-req-back" onClick={handleBack}>
        <ChevronLeftIcon /> Back
      </button>

      {/* Error Banner */}
      {error && (
        <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {/* Student Metadata Panel */}
      {request && (
        <div className="prof-req-meta">
          <div className="prof-req-meta-row">
            <div className="prof-req-meta-fields">
              <div className="prof-req-meta-field">
                <label>Name</label>
                <input type="text" value={request.studentName} disabled />
              </div>
              <div className="prof-req-meta-field">
                <label>Major</label>
                <input type="text" value={request.level} disabled />
              </div>
              <div className="prof-req-meta-field">
                <label>Stream</label>
                <input type="text" value={request.major} disabled />
              </div>
              <div className="prof-req-meta-field">
                <label>Requested Date</label>
                <input type="text" value={request.requestedDate} disabled />
              </div>
              <div className="prof-req-meta-field">
                <label>Status</label>
                <input type="text" value={request.status} disabled />
              </div>
            </div>
            <div className="prof-req-meta-actions">
              <button className="prof-req-action-link" disabled>Apply</button>
              <button className="prof-req-action-link" disabled>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Strip */}
      <div className="prof-req-action-strip">
        <button
          className={`prof-req-strip-btn${activeMode === 'give' ? ' active' : ''}`}
          onClick={handleGiveFeedbackMode}
        >
          Give Feedback
        </button>
        <button
          className={`prof-req-strip-btn${activeMode === 'view' ? ' active' : ''}`}
          onClick={handleViewFeedbackMode}
        >
          Total Feedback
          <span className="prof-req-strip-badge">{feedbackCount}</span>
        </button>
        <button
          className={`prof-req-strip-btn${activeMode === 'view' ? ' active' : ''}`}
          onClick={handleViewFeedbackMode}
        >
          View Feedback
        </button>
        <button
          className="prof-req-strip-btn"
          onClick={handleSubmitClick}
          disabled={feedbackCount === 0}
        >
          Submit
        </button>
      </div>

      {/* Give Feedback Editor */}
      {activeMode === 'give' && (
        <div className="prof-req-feedback-editor">
          <div className="prof-req-editor-top">
            <div className="prof-req-editor-title">Give Feedback</div>
            <div className="prof-req-editor-actions">
              <button className="modal-btn-cancel" onClick={handleCancelEditor}>Cancel</button>
              <button
                className="modal-btn-confirm"
                onClick={handleSaveFeedback}
                disabled={!editorText.trim()}
              >
                Save
              </button>
            </div>
          </div>
          <div className="prof-req-editor-field">
            <label htmlFor="feedback-category">Category</label>
            <select
              id="feedback-category"
              value={editorCategory}
              onChange={(e) => setEditorCategory(e.target.value)}
            >
              {FEEDBACK_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="prof-req-editor-field">
            <label htmlFor="feedback-text">Feedback</label>
            <textarea
              id="feedback-text"
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              placeholder="Enter your feedback..."
            />
            <button className="prof-req-era-link">Summarize with ERA</button>
          </div>
        </div>
      )}

      {/* View Feedback List */}
      {activeMode === 'view' && (
        <div className="prof-req-feedback-list">
          <div className="prof-req-feedback-list-header">
            <div className="prof-req-feedback-list-left">
              <button
                className="prof-req-action-link"
                onClick={handleDeleteFeedback}
                disabled={selectedFeedbackIds.size === 0}
                style={{ color: selectedFeedbackIds.size > 0 ? '#ef4444' : undefined }}
              >
                Delete
              </button>
            </div>
            <div className="prof-req-feedback-list-right">
              <button className="modal-btn-cancel" onClick={handleCancelList}>Cancel</button>
              <button className="modal-btn-confirm" onClick={handleSaveList}>Save</button>
            </div>
          </div>
          {request?.feedback.length > 0 ? (
            <div className="prof-req-feedback-items">
              {request.feedback.map(item => (
                <div
                  key={item.id}
                  className={`prof-req-feedback-row${selectedFeedbackIds.has(item.id) ? ' selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFeedbackIds.has(item.id)}
                    onChange={() => toggleFeedbackSelect(item.id)}
                    aria-label={`Select feedback: ${item.text}`}
                  />
                  <div className="prof-req-feedback-body">
                    <div className="prof-req-feedback-category">{item.category}</div>
                    <div className="prof-req-feedback-text">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="prof-req-empty">No feedback items yet.</div>
          )}
        </div>
      )}

      {/* Document Viewer */}
      {activeMode === 'viewer' && (
        <div className="prof-req-viewer">
          <DocumentViewer
            previewUrl={request?.resumeUrl}
            title={`${request?.studentName} - Resume`}
            placeholderLabel="Student Resume Preview"
          />
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Submit Feedback</div>
            <div className="modal-body">
              <p>Submit feedback to student?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="modal-btn-confirm" onClick={handleConfirmSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorRequestDetail;
