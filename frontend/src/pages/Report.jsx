import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import '../styles/report.css';

// Mock data — replace with real API calls
const MOCK_RESUMES = [
  { id: 'r1', title: 'My Resume' },
];

const generateMockReport = () => ({
  generatedAt: new Date().toISOString(),
  categories: [
    {
      id: 'grammar',
      name: 'Grammar',
      suggestions: [
        {
          id: 'g1',
          issueText: 'Use of "am" is incorrect — should be "are" in the professional experience section.',
          recommendationText: 'Replace "am" with "are" to match the plural subject. Correct syntax: "responsibilities are..."',
          status: 'pending',
        },
        {
          id: 'g2',
          issueText: 'Missing article "the" before "project" in the Projects section.',
          recommendationText: 'Add "the" before "project" for proper grammar: "Led the project..."',
          status: 'pending',
        },
      ],
    },
    {
      id: 'spelling',
      name: 'Spelling',
      suggestions: [
        {
          id: 's1',
          issueText: '"Managment" is misspelled in the Experience section.',
          recommendationText: 'Correct spelling: "Management".',
          status: 'pending',
        },
        {
          id: 's2',
          issueText: '"Developement" is misspelled in the Skills section.',
          recommendationText: 'Correct spelling: "Development".',
          status: 'pending',
        },
      ],
    },
  ],
});

const Report = () => {
  const navigate = useNavigate();

  const [selectedResume, setSelectedResume] = useState(MOCK_RESUMES[0]?.id || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Generate report
  const handleGenerate = async () => {
    if (!selectedResume) return;
    setLoading(true);
    setError('');
    setShowSuccess(false);
    setReportDownloaded(false);

    try {
      // TODO: replace with real API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateMockReport();
      setReport(data);
      setActiveCategory(data.categories[0]?.id || null);
      setActiveSuggestionIndex(0);
    } catch (err) {
      setError('Could not generate report. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Current category & suggestion
  const currentCategory = report?.categories.find(c => c.id === activeCategory);
  const currentSuggestions = currentCategory?.suggestions || [];
  const currentSuggestion = currentSuggestions[activeSuggestionIndex] || null;

  // Update suggestion status
  const setSuggestionStatus = (suggestionId, status) => {
    setReport(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map(cat => ({
          ...cat,
          suggestions: cat.suggestions.map(s =>
            s.id === suggestionId ? { ...s, status } : s
          ),
        })),
      };
    });
  };

  // Check if category is resolved
  const isCategoryResolved = (category) =>
    category.suggestions.length > 0 &&
    category.suggestions.every(s => s.status !== 'pending');

  // Check if any accepted
  const hasAcceptedChanges = report?.categories.some(cat =>
    cat.suggestions.some(s => s.status === 'accepted')
  ) || false;

  // Has updated resume (success shown)
  const hasUpdated = showSuccess;

  // Update resume
  const handleUpdateResume = () => {
    if (!hasAcceptedChanges) return;
    // TODO: real API call to apply changes
    setShowSuccess(true);
  };

  // Download report
  const handleDownload = () => {
    if (!report) return;
    // TODO: real download logic (PDF generation)
    setReportDownloaded(true);
    alert('Report downloaded.');
  };

  // Navigation guard
  const handleNavigateAway = useCallback((path) => {
    if (hasUpdated && !reportDownloaded) {
      setPendingNavigation(path);
      setShowLeaveModal(true);
    } else {
      navigate(path);
    }
  }, [hasUpdated, reportDownloaded, navigate]);

  // Intercept browser back/sidebar navigation via location changes
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
          >
            {MOCK_RESUMES.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
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
        <button
          className="report-action-link"
          onClick={handleDownload}
          disabled={!report}
        >
          Download Report
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
              const resolved = isCategoryResolved(cat);
              return (
                <button
                  key={cat.id}
                  className={[
                    'category-item',
                    activeCategory === cat.id ? 'active' : '',
                    resolved ? 'resolved' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectCategory(cat.id)}
                >
                  {cat.name}
                  <span className="category-indicator">&#x203A;</span>
                </button>
              );
            })
          ) : (
            <div className="report-empty">No categories</div>
          )}
        </div>

        {/* Right: Suggestions */}
        <div className="report-suggestions">
          {loading ? (
            <div className="report-loading">
              <div className="report-spinner" />
            </div>
          ) : !report ? (
            <div className="report-empty">
              Generate a report to see suggestions.
            </div>
          ) : !currentSuggestion ? (
            <div className="report-empty">
              No suggestions in this category.
            </div>
          ) : (
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
                  disabled={!hasAcceptedChanges}
                >
                  Update Resume
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
                  <div className="suggestion-block suggestion-issue">
                    <div className="suggestion-block-label">Issue</div>
                    {currentSuggestion.issueText}
                  </div>
                  <div className="suggestion-block suggestion-recommendation">
                    <div className="suggestion-block-label">Recommendation</div>
                    {currentSuggestion.recommendationText}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leave Without Download Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Download Report?</div>
            <div className="modal-body">
              <p>Do you want to download the report before leaving?</p>
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
