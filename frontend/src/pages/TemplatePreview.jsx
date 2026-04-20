import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon } from '../components/layout/icons';
import DocumentViewer from '../components/DocumentViewer';
import templateService from '../services/templateService';
import resumeService from '../services/resumeService';
import '../styles/templates.css';
import '../styles/details.css';

const TemplatePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError('');

        // Get template info from the list
        const allTemplates = await templateService.getAll();
        const list = Array.isArray(allTemplates) ? allTemplates : allTemplates.templates || [];
        const found = list.find(t => t._id === id);
        if (!found) throw new Error('Template not found');

        // Get PDF as blob URL for preview
        let previewUrl = null;
        try {
          const pdfBlob = await templateService.getTemplatePdf(id);
          previewUrl = URL.createObjectURL(pdfBlob);
        } catch {
          // PDF preview may not be available — that's ok
        }

        setTemplate({ ...found, previewUrl });
      } catch (err) {
        setError(err?.message || err || 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = () => {
    const major = searchParams.get('major');
    navigate(major ? `/templates?major=${major}` : '/templates');
  };

  const handleOpenTitleModal = () => {
    setResumeTitle(template?.name || 'My Resume');
    setShowTitleModal(true);
  };

  const handleUseIt = async () => {
    setShowTitleModal(false);
    try {
      setIsApplying(true);
      setApplyError('');
      setShowSuccess(false);

      const title = resumeTitle.trim() || template?.name || 'My Resume';
      const data = await resumeService.createFromTemplate(id, title);

      setShowSuccess(true);

      const newResumeId = data.resume?._id || data.resume?.id;
      setTimeout(() => {
        navigate(newResumeId ? `/details/${newResumeId}` : '/resumes');
      }, 1500);
    } catch (err) {
      setApplyError(err || 'Could not apply template. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="templates-container">
      {/* Success Banner */}
      {showSuccess && (
        <div className="templates-success-banner">
          <p>Template applied successfully!</p>
        </div>
      )}

      {/* Apply Error */}
      {applyError && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {applyError}
        </div>
      )}

      {/* Top Row: Back + Use This Template */}
      <div className="templates-preview-header">
        <button className="templates-back-btn" onClick={handleBack}>
          <ChevronLeftIcon /> Back
        </button>
        <button
          className="btn-primary templates-use-btn"
          onClick={handleOpenTitleModal}
          disabled={isApplying || loading || !!error}
        >
          {isApplying ? 'Applying...' : 'Use This Template'}
        </button>
      </div>

      {/* Viewer */}
      {loading ? (
        <div className="templates-loading">
          <div className="templates-spinner" />
        </div>
      ) : error ? (
        <div className="templates-empty">
          Preview unavailable.
          <button className="templates-action-link" onClick={handleBack} style={{ marginLeft: 8 }}>
            Back
          </button>
        </div>
      ) : (
        <DocumentViewer
          previewUrl={template.previewUrl}
          title={template.name}
          numPages={template.numPages || 1}
          placeholderLabel="Template Preview"
        />
      )}

      {/* Title Input Modal */}
      {showTitleModal && (
        <div className="modal-overlay" onClick={() => setShowTitleModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Name Your Resume</div>
            <div className="modal-body">
              <label htmlFor="resume-title-input" style={{ display: 'block', marginBottom: 8 }}>
                Resume Title
              </label>
              <input
                id="resume-title-input"
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUseIt(); }}
                autoFocus
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                placeholder="My Resume"
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowTitleModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleUseIt} disabled={!resumeTitle.trim()}>
                Create Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;
