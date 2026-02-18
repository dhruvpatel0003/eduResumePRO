import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/hunter.css';

// Mock data — replace with real API calls
const MOCK_RESUMES = [
  { id: 'r1', title: 'My Resume' },
];

const MOCK_COMPANIES = [
  { id: 'c1', name: 'Tesla India Inc.' },
  { id: 'c2', name: 'Google LLC' },
  { id: 'c3', name: 'Amazon Web Services' },
];

const MOCK_JOBS = {
  c1: [
    { id: 'j1', title: 'Junior Software Developer', company: 'Tesla India Inc.', location: 'Bangalore' },
    { id: 'j2', title: 'Senior Backend Engineer', company: 'Tesla India Inc.', location: 'Hyderabad' },
    { id: 'j3', title: 'Data Analyst', company: 'Tesla India Inc.', location: 'Bangalore' },
  ],
  c2: [
    { id: 'j4', title: 'Frontend Engineer', company: 'Google LLC', location: 'Mountain View' },
    { id: 'j5', title: 'Cloud Solutions Architect', company: 'Google LLC', location: 'New York' },
  ],
  c3: [
    { id: 'j6', title: 'DevOps Engineer', company: 'Amazon Web Services', location: 'Seattle' },
  ],
};

const generateMockAnalysis = () => ({
  atsScore: null,
  feedback: [
    {
      id: 'f1',
      type: 'missing_keyword',
      message: 'Missing tech stack like Kibana and GraphQL',
      accepted: false,
    },
    {
      id: 'f2',
      type: 'missing_keyword',
      message: 'Add experience with CI/CD pipelines (Jenkins, GitHub Actions)',
      accepted: false,
    },
    {
      id: 'f3',
      type: 'missing_keyword',
      message: 'Include cloud platform certifications (AWS, GCP)',
      accepted: false,
    },
  ],
});

const Hunter = () => {
  const navigate = useNavigate();

  // Filter state
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [jobFilter, setJobFilter] = useState('matched'); // 'all' | 'matched'
  const [selectedJob, setSelectedJob] = useState('');
  const [availableJobs, setAvailableJobs] = useState([]);

  // Results state
  const [analysis, setAnalysis] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load jobs when company changes
  useEffect(() => {
    if (!selectedCompany) {
      setAvailableJobs([]);
      setSelectedJob('');
      return;
    }

    // TODO: replace with real API call
    const jobs = MOCK_JOBS[selectedCompany] || [];
    setAvailableJobs(jobs);
    setSelectedJob(jobs[0]?.id || '');
  }, [selectedCompany]);

  // Filter jobs based on radio selection
  const filteredJobs = jobFilter === 'all'
    ? availableJobs
    : availableJobs.filter(j =>
        j.title.toLowerCase().includes('software') ||
        j.title.toLowerCase().includes('developer') ||
        j.title.toLowerCase().includes('engineer')
      );

  // Ensure selected job is valid when filter changes
  useEffect(() => {
    if (filteredJobs.length > 0 && !filteredJobs.find(j => j.id === selectedJob)) {
      setSelectedJob(filteredJobs[0]?.id || '');
    }
  }, [jobFilter, filteredJobs, selectedJob]);

  const canHunt = selectedResume && selectedCompany;

  // Hunt action
  const handleHunt = async () => {
    if (!canHunt) return;
    setLoading(true);
    setError('');
    setShowSuccess(false);
    setAnalysis(null);
    setAtsScore(null);

    try {
      // TODO: replace with real API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateMockAnalysis();
      setAnalysis(data);
    } catch (err) {
      setError('Could not analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset action
  const handleReset = () => {
    setSelectedResume('');
    setSelectedCompany('');
    setSelectedJob('');
    setJobFilter('matched');
    setAnalysis(null);
    setAtsScore(null);
    setError('');
    setShowSuccess(false);
  };

  // Get ATS Score
  const handleGetAtsScore = async () => {
    if (!analysis) return;
    setAtsLoading(true);

    try {
      // TODO: replace with real API call (reuses report engine logic)
      await new Promise(resolve => setTimeout(resolve, 600));
      const score = 60;
      setAtsScore(score);
    } catch (err) {
      setError('Could not calculate ATS score.');
    } finally {
      setAtsLoading(false);
    }
  };

  // Toggle feedback acceptance
  const toggleFeedback = (feedbackId) => {
    setAnalysis(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedback: prev.feedback.map(f =>
          f.id === feedbackId ? { ...f, accepted: !f.accepted } : f
        ),
      };
    });
  };

  // Accept All
  const handleAcceptAll = () => {
    setAnalysis(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedback: prev.feedback.map(f => ({ ...f, accepted: true })),
      };
    });
  };

  const hasAcceptedFeedback = analysis?.feedback.some(f => f.accepted) || false;
  const allAccepted = analysis?.feedback.length > 0 && analysis.feedback.every(f => f.accepted);

  // Update Resume — reuses Report Update Resume flow
  const handleUpdateResume = () => {
    if (!hasAcceptedFeedback) return;
    // Navigate to report with context to apply hunter suggestions
    navigate('/report', { state: { fromHunter: true, resumeId: selectedResume } });
  };

  // Format job dropdown label
  const formatJobLabel = (job) => `${job.title} | ${job.company}`;

  return (
    <div>
      {/* Success Banner */}
      {showSuccess && (
        <div className="hunter-success-banner">
          <p>Resume updated successfully!</p>
          <Link to="/resumes">View In My Resume</Link>
        </div>
      )}

      {/* Header Filter Row */}
      <div className="hunter-header-row">
        <div className="hunter-header-left">
          <div className="hunter-filter-group">
            <label htmlFor="hunter-resume-select">Select Resume</label>
            <select
              id="hunter-resume-select"
              className="hunter-select"
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
            >
              <option value="">-- Select --</option>
              {MOCK_RESUMES.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div className="hunter-filter-group">
            <label htmlFor="hunter-company-select">Select Company</label>
            <select
              id="hunter-company-select"
              className="hunter-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">-- Select --</option>
              {MOCK_COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="hunter-header-right">
          <button
            className="hunter-action-link"
            onClick={handleHunt}
            disabled={!canHunt || loading}
          >
            {loading ? 'Hunting...' : 'Hunt'}
          </button>
          <button
            className="hunter-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Secondary Controls Row */}
      <div className="hunter-secondary-row">
        <div className="hunter-radio-group">
          <label className="hunter-radio-option">
            <input
              type="radio"
              name="job-filter"
              value="all"
              checked={jobFilter === 'all'}
              onChange={() => setJobFilter('all')}
            />
            Show All
          </label>
          <label className="hunter-radio-option">
            <input
              type="radio"
              name="job-filter"
              value="matched"
              checked={jobFilter === 'matched'}
              onChange={() => setJobFilter('matched')}
            />
            Matched Job Title
          </label>
        </div>
        <div className="hunter-job-select-group">
          <select
            className="hunter-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={filteredJobs.length === 0}
          >
            {filteredJobs.length === 0 ? (
              <option value="">No jobs available</option>
            ) : (
              filteredJobs.map(j => (
                <option key={j.id} value={j.id}>{formatJobLabel(j)}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && <div className="hunter-error">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="hunter-loading">
          <div className="hunter-spinner" />
        </div>
      )}

      {/* Results */}
      {!loading && analysis && (
        <div className="hunter-results">
          {/* Results Header */}
          <div className="hunter-results-header">
            <div>
              {atsScore !== null ? (
                <div className="hunter-ats-display">
                  ATS SCORE: <span className="hunter-ats-value">{atsScore}%</span>
                </div>
              ) : (
                <button
                  className="hunter-ats-score-link"
                  onClick={handleGetAtsScore}
                  disabled={atsLoading}
                >
                  {atsLoading ? 'Calculating...' : 'Get ATS Score'}
                </button>
              )}
            </div>
            <div className="hunter-results-actions">
              <button
                className="hunter-action-link"
                onClick={handleAcceptAll}
                disabled={allAccepted}
              >
                Accept All
              </button>
              <button
                className="hunter-action-link"
                onClick={handleUpdateResume}
                disabled={!hasAcceptedFeedback}
              >
                Update Resume
              </button>
            </div>
          </div>

          {/* Feedback List */}
          {analysis.feedback.length > 0 ? (
            <div className="hunter-feedback-list">
              {analysis.feedback.map(item => (
                <div
                  key={item.id}
                  className={`hunter-feedback-item${item.accepted ? ' accepted' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={item.accepted}
                    onChange={() => toggleFeedback(item.id)}
                    aria-label={`Accept: ${item.message}`}
                  />
                  <div className="hunter-feedback-message">
                    <div className="hunter-feedback-type">{item.type.replace('_', ' ')}</div>
                    {item.message}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hunter-empty">No feedback available.</div>
          )}
        </div>
      )}

      {/* Empty state before hunt */}
      {!loading && !analysis && !error && (
        <div className="hunter-empty">
          Select a resume and company, then click Hunt to analyze.
        </div>
      )}
    </div>
  );
};

export default Hunter;
