import React from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from '../DocumentViewer';

const CreateResumeTab = ({
  resumePreviewUrl,
  resumeGenerated,
  resumeDownloaded,
  isGenerating,
  generationError,
  isStale,
  onCreateResume,
  onDownload,
  enhanceProjects,
  onEnhanceProjectsChange,
}) => {
  return (
    <div className="create-resume-tab">
      {/* Stale notice */}
      {resumeGenerated && isStale && (
        <div className="create-resume-stale-notice">
          Your details have changed. Regenerate resume to reflect updates.
        </div>
      )}

      {/* Enhance Projects Option */}
      {onEnhanceProjectsChange && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enhanceProjects || false}
            onChange={(e) => onEnhanceProjectsChange(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#3b82f6' }}
          />
          Enhance projects to match template format
        </label>
      )}

      {/* Generation error */}
      {generationError && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {generationError}
        </div>
      )}

      {/* Success banner with View link */}
      {resumeGenerated && !isStale && (
        <div className="create-resume-success-banner">
          <p>Resume generated successfully!</p>
          <Link to="/resumes" className="create-resume-view-link">
            View in My Resume
          </Link>
        </div>
      )}

      {/* Viewer area */}
      {isGenerating ? (
        <div className="create-resume-loading">
          <div className="create-resume-spinner" />
          <span>Generating Resume...</span>
        </div>
      ) : resumeGenerated ? (
        <DocumentViewer
          previewUrl={resumePreviewUrl}
          title="Generated Resume"
          numPages={1}
          placeholderLabel="Resume Preview"
        />
      ) : (
        <div className="create-resume-empty">
          Click Create Resume to generate your resume preview.
        </div>
      )}
    </div>
  );
};

export default CreateResumeTab;
