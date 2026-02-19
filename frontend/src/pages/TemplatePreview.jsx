import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon } from '../components/layout/icons';
import DocumentViewer from '../components/DocumentViewer';
import templateService from '../services/templateService';
import '../styles/templates.css';

// Mock template detail — replace with real API data
const MOCK_TEMPLATE_DETAILS = {
  t1: { _id: 't1', name: 'Graduate Student - CSE', previewUrl: null, numPages: 1 },
  t2: { _id: 't2', name: 'Undergraduate - CSE', previewUrl: null, numPages: 1 },
  t3: { _id: 't3', name: 'Engineering General', previewUrl: null, numPages: 1 },
  t4: { _id: 't4', name: 'Business Professional', previewUrl: null, numPages: 1 },
  t5: { _id: 't5', name: 'Research Assistant - Bio', previewUrl: null, numPages: 1 },
  t6: { _id: 't6', name: 'Mechanical Design Resume', previewUrl: null, numPages: 1 },
};

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

        // TODO: replace with real API call — templateService.getById(id)
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = MOCK_TEMPLATE_DETAILS[id];
        if (!data) throw 'Template not found';
        setTemplate(data);
      } catch (err) {
        setError(err || 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
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

      // TODO: replace with real API call
      await new Promise(resolve => setTimeout(resolve, 600));
      // await templateService.applyTemplate(id);

      setShowSuccess(true);

      setTimeout(() => {
        navigate('/resumes');
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
