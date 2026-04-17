import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import resumeService from '../services/resumeService';
import reportService from '../services/reportService';
import '../styles/report.css';

const Report = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  // Resume list
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(preselectedResumeId || '');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Load resumes on mount
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await resumeService.getMyResumes();
        const list = data.resumes || [];
        setResumes(list);
        if (preselectedResumeId && list.find(r => r._id === preselectedResumeId)) {
          setSelectedResume(preselectedResumeId);
        } else if (list.length > 0 && !selectedResume) {
          setSelectedResume(list[0]._id);
        }
      } catch {
        // fail silently
      } finally {
        setResumesLoading(false);
      }
    };
    loadResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate report
  const handleGenerate = async () => {
    if (!selectedResume) return;
    setLoading(true);
    setError('');
    setShowSuccess(false);
    setReportDownloaded(false);

    try {
      const data = await reportService.analyzeResume(selectedResume);
      const reportData = data.report || data;

      // Transform criteria into category format for the UI
      const criteria = reportData.criteria || [];
      const suggestions = reportData.aiSuggestions || [];

      // Build categories from criteria
      const categories = criteria.map((c, idx) => ({
        id: `criteria-${idx}`,
        name: c.name,
        score: c.score,
        feedback: c.feedback,
        autoFixAvailable: c.autoFixAvailable,
      }));

      // Add AI Suggestions as a special category
      if (suggestions.length > 0) {
        categories.push({
          id: 'ai-suggestions',
          name: 'AI Suggestions',
          score: null,
          suggestions: suggestions.map((s, idx) => ({
            id: `ai-${idx}`,
            fieldPath: s.fieldPath,
            type: s.type,
            originalValue: s.originalValue,
            suggestedValue: s.suggestedValue,
            note: s.note,
            status: 'pending',
          })),
        });
      }

      setReport({
        generatedAt: new Date().toISOString(),
        overallScore: reportData.overallScore,
        categories,
        aiSuggestions: suggestions,
      });
      setActiveCategory(categories[0]?.id || null);
      setActiveSuggestionIndex(0);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not generate report. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Current category & suggestion
  const currentCategory = report?.categories.find(c => c.id === activeCategory);
  const currentSuggestions = currentCategory?.suggestions || [];
  const currentSuggestion = currentSuggestions[activeSuggestionIndex] || null;
  const isAiSuggestionCategory = activeCategory === 'ai-suggestions';
  const isCriteriaCategory = currentCategory && !isAiSuggestionCategory;

  // Update suggestion status
  const setSuggestionStatus = (suggestionId, status) => {
    setReport(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map(cat => ({
          ...cat,
          suggestions: cat.suggestions?.map(s =>
            s.id === suggestionId ? { ...s, status } : s
          ),
        })),
      };
    });
  };

  // Check if any accepted
  const hasAcceptedChanges = report?.categories.some(cat =>
    cat.suggestions?.some(s => s.status === 'accepted')
  ) || false;

  // Has updated resume (success shown)
  const hasUpdated = showSuccess;

  // Update resume with accepted feedback
  const handleUpdateResume = async () => {
    if (!hasAcceptedChanges || !selectedResume) return;
    setUpdateLoading(true);
    setError('');
    try {
      const acceptedComments = [];
      for (const cat of report.categories) {
        if (!cat.suggestions) continue;
        for (const s of cat.suggestions) {
          if (s.status === 'accepted') {
            acceptedComments.push({
              fieldPath: s.fieldPath,
              type: s.type,
              originalValue: s.originalValue,
              suggestedValue: s.suggestedValue,
              note: s.note,
            });
          }
        }
      }
      await reportService.acceptFeedback(selectedResume, acceptedComments, true);
      setShowSuccess(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to update resume.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Download report as PDF
  const handleDownload = async () => {
    if (!report || !selectedResume) return;
    try {
      const pdfBlob = await resumeService.downloadPdf(selectedResume);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setReportDownloaded(true);
    } catch {
      setReportDownloaded(true);
      // Even if PDF download fails, mark as downloaded to not block navigation
    }
  };

  // Navigation guard — available for sidebar/external callers
  const handleNavigateAway = useCallback((path) => { // eslint-disable-line no-unused-vars
    if (hasUpdated && !reportDownloaded) {
      setPendingNavigation(path);
      setShowLeaveModal(true);
    } else {
      navigate(path);
    }
  }, [hasUpdated, reportDownloaded, navigate]);

  // Intercept browser back/sidebar navigation
  useEffect(() => {
    if (!hasUpdated || reportDownloaded) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUpdated, reportDownloaded]);

  // Suggestion navigation
  const goToPrevSuggestion = () => {
    if (activeSuggestionIndex > 0) {
      setActiveSuggestionIndex(activeSuggestionIndex - 1);
    }
  };

  const goToNextSuggestion = () => {
    if (activeSuggestionIndex < currentSuggestions.length - 1) {
      setActiveSuggestionIndex(activeSuggestionIndex + 1);
    }
  };

  // When category changes, reset suggestion index
  const selectCategory = (catId) => {
    setActiveCategory(catId);
    setActiveSuggestionIndex(0);
  };

  return (
    <div>
      {/* Success Banner */}
      {showSuccess && (
        <div className="report-success-banner">
          <p>Resume updated successfully!</p>
          <Link to="/resumes">View In My Resume</Link>
        </div>
      )}

      {/* Header Row */}
      <div className="report-header-row">
        <div className="report-header-left">
          <label htmlFor="resume-select">Select Resume</label>
          <select
            id="resume-select"
            className="report-select"
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
            disabled={resumesLoading}
          >
            {resumesLoading ? (
              <option value="">Loading...</option>
            ) : resumes.length === 0 ? (
              <option value="">No resumes found</option>
            ) : (
              resumes.map(r => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))
            )}
          </select>
        </div>
        <button
          className="report-action-link"
          onClick={handleGenerate}
          disabled={loading || !selectedResume}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Secondary Row */}
      <div className="report-secondary-row">
        {report?.overallScore !== undefined && report?.overallScore !== null && (
          <div style={{ fontWeight: 600, fontSize: 14, marginRight: 16 }}>
            Overall Score: <span style={{ color: '#3b82f6', fontSize: 18 }}>{report.overallScore}%</span>
          </div>
        )}
        <button
          className="report-action-link"
          onClick={handleDownload}
          disabled={!report}
        >
          Download Resume
        </button>
      </div>

      {/* Error */}
      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Report Body */}
      <div className="report-body">
        {/* Left: Categories */}
        <div className="report-categories">
          {report ? (
            report.categories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className={[
                    'category-item',
                    isActive ? 'active' : '',
                    cat.score !== null && cat.score !== undefined && cat.score >= 70 ? 'resolved' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectCategory(cat.id)}
                >
                  <span>{cat.name}</span>
                  {cat.score !== null && cat.score !== undefined && (
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{cat.score}%</span>
                  )}
                  {cat.score === null && cat.score === undefined && (
                    <span className="category-indicator">&#x203A;</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="report-empty">No categories</div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="report-suggestions">
          {loading ? (
            <div className="report-loading">
              <div className="report-spinner" />
            </div>
          ) : !report ? (
            <div className="report-empty">
              Generate a report to see analysis.
            </div>
          ) : isCriteriaCategory ? (
            /* Criteria detail view */
            <div className="suggestion-detail">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{currentCategory.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: '100%',
                    height: 8,
                    background: '#e5e7eb',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${currentCategory.score || 0}%`,
                      height: '100%',
                      background: (currentCategory.score || 0) >= 70 ? '#059669' : (currentCategory.score || 0) >= 40 ? '#f59e0b' : '#ef4444',
                      borderRadius: 4,
                    }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14, minWidth: 40 }}>{currentCategory.score}%</span>
                </div>
                <div className="suggestion-block suggestion-recommendation">
                  <div className="suggestion-block-label">Feedback</div>
                  {currentCategory.feedback}
                </div>
              </div>
            </div>
          ) : isAiSuggestionCategory && !currentSuggestion ? (
            <div className="report-empty">
              No AI suggestions available.
            </div>
          ) : isAiSuggestionCategory && currentSuggestion ? (
            <>
              {/* Suggestions Header */}
              <div className="suggestions-header">
                <div className="suggestions-nav">
                  <button
                    className="suggestions-nav-btn"
                    onClick={goToPrevSuggestion}
                    disabled={activeSuggestionIndex <= 0}
                    aria-label="Previous suggestion"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span>{activeSuggestionIndex + 1} / {currentSuggestions.length}</span>
                  <button
                    className="suggestions-nav-btn"
                    onClick={goToNextSuggestion}
                    disabled={activeSuggestionIndex >= currentSuggestions.length - 1}
                    aria-label="Next suggestion"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
                <button
                  className="update-resume-btn"
                  onClick={handleUpdateResume}
                  disabled={!hasAcceptedChanges || updateLoading}
                >
                  {updateLoading ? 'Updating...' : 'Update Resume'}
                </button>
              </div>

              {/* Suggestion Detail */}
              <div className="suggestion-detail">
                <div className="suggestion-actions">
                  <button
                    className={`suggestion-action-btn ${currentSuggestion.status === 'accepted' ? 'accept-active' : ''}`}
                    onClick={() => setSuggestionStatus(currentSuggestion.id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className={`suggestion-action-btn ${currentSuggestion.status === 'ignored' ? 'ignore-active' : ''}`}
                    onClick={() => setSuggestionStatus(currentSuggestion.id, 'ignored')}
                  >
                    Ignore
                  </button>
                </div>

                <div className="suggestion-content">
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>
                    {currentSuggestion.fieldPath}
                  </div>
                  {currentSuggestion.originalValue && (
                    <div className="suggestion-block suggestion-issue">
                      <div className="suggestion-block-label">Original</div>
                      {currentSuggestion.originalValue}
                    </div>
                  )}
                  {currentSuggestion.suggestedValue && (
                    <div className="suggestion-block suggestion-recommendation">
                      <div className="suggestion-block-label">Suggested</div>
                      {currentSuggestion.suggestedValue}
                    </div>
                  )}
                  {currentSuggestion.note && (
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, fontStyle: 'italic' }}>
                      {currentSuggestion.note}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="report-empty">
              Select a category to view details.
            </div>
          )}
        </div>
      </div>

      {/* Leave Without Download Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Download Resume?</div>
            <div className="modal-body">
              <p>Do you want to download the updated resume before leaving?</p>
            </div>
            <div className="modal-actions" style={{ gap: 8 }}>
              <button
                className="modal-btn-cancel"
                onClick={() => setShowLeaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn-cancel"
                onClick={() => {
                  setShowLeaveModal(false);
                  if (pendingNavigation) navigate(pendingNavigation);
                }}
              >
                Leave
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => {
                  handleDownload();
                  setShowLeaveModal(false);
                  if (pendingNavigation) navigate(pendingNavigation);
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
