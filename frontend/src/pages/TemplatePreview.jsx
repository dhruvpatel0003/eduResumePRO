import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon } from '../components/layout/icons';
import DocumentViewer from '../components/DocumentViewer';
import templateService from '../services/templateService';
import resumeService from '../services/resumeService';
import '../styles/templates.css';

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

  const handleUseIt = async () => {
    try {
      setIsApplying(true);
      setApplyError('');
      setShowSuccess(false);

      const data = await resumeService.createFromTemplate(id, template?.name || 'My Resume');

      setShowSuccess(true);

      const resumeId = data.resume?._id || data.resume?.id;
      setTimeout(() => {
        navigate(resumeId ? `/details/${resumeId}` : '/resumes');
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
          onClick={handleUseIt}
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
    </div>
  );
};

export default TemplatePreview;
