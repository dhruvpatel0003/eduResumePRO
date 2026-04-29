import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hunterService from '../services/hunterService';
import resumeService from '../services/resumeService';
import '../styles/hunter.css';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'are', 'our', 'will', 'have',
  'this', 'that', 'from', 'into', 'they', 'their', 'them', 'has', 'was', 'were',
  'been', 'being', 'but', 'not', 'all', 'any', 'can', 'may', 'who', 'what',
  'when', 'where', 'how', 'why', 'which', 'about', 'also', 'must', 'should',
  'would', 'could', 'team', 'work', 'role', 'job', 'company', 'position',
  'years', 'year', 'experience', 'including', 'such', 'other', 'more', 'most',
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

function buildResumeText(templateInfo) {
  if (!templateInfo) return '';
  const parts = [];
  parts.push(templateInfo.personalInfo?.summary || '');
  (templateInfo.experience || []).forEach(exp => {
    parts.push(exp.title || exp.position || '');
    parts.push(exp.description || '');
    if (Array.isArray(exp.bullets)) parts.push(exp.bullets.join(' '));
    if (Array.isArray(exp.technologies)) parts.push(exp.technologies.join(' '));
  });
  (templateInfo.projects || []).forEach(proj => {
    parts.push(proj.name || '');
    parts.push(proj.description || '');
    if (Array.isArray(proj.bullets)) parts.push(proj.bullets.join(' '));
    if (Array.isArray(proj.technologies)) parts.push(proj.technologies.join(' '));
  });
  if (Array.isArray(templateInfo.skills)) parts.push(templateInfo.skills.join(' '));
  (templateInfo.education || []).forEach(edu => {
    parts.push(edu.degree || edu.fieldOfStudy || '');
    parts.push(edu.coursework || '');
  });
  return parts.join(' ');
}

function analyzeResumeAgainstJob(templateInfo, job) {
  const resumeText = buildResumeText(templateInfo);
  const resumeTokens = new Set(tokenize(resumeText));
  const jobTitle = job.title || '';
  const jobDescription = job.description || '';
  const jobTokens = tokenize(`${jobTitle} ${jobDescription}`);

  // Count frequency of each job token to surface most important keywords
  const freq = {};
  jobTokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  const uniqueJobTokens = Object.keys(freq);

  if (uniqueJobTokens.length === 0) {
    return {
      atsScore: 0,
      matchScore: 0,
      feedback: [{
        id: 'fb-no-desc',
        fieldPath: '',
        type: 'info',
        originalValue: '',
        suggestedValue: '',
        note: 'This job listing has no description available, so a keyword match could not be performed. Try selecting a different role.',
        accepted: false,
      }],
    };
  }

  const matched = uniqueJobTokens.filter(t => resumeTokens.has(t));
  const missing = uniqueJobTokens
    .filter(t => !resumeTokens.has(t))
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 12);

  const matchScore = Math.round((matched.length / uniqueJobTokens.length) * 100);
  const atsScore = matchScore;

  const feedback = missing.map((kw, idx) => ({
    id: `fb-${idx}`,
    fieldPath: '',
    type: 'keyword',
    originalValue: '',
    suggestedValue: kw,
    note: `Consider incorporating "${kw}" into your resume — it appears ${freq[kw]} time${freq[kw] === 1 ? '' : 's'} in this job description but is missing from your resume.`,
    accepted: false,
  }));

  if (feedback.length === 0) {
    feedback.push({
      id: 'fb-strong-match',
      fieldPath: '',
      type: 'info',
      originalValue: '',
      suggestedValue: '',
      note: 'Strong keyword match — your resume already covers the key terms in this job description.',
      accepted: false,
    });
  }

  return { atsScore, matchScore, feedback };
}

const Hunter = () => {
  // Resume list
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  // Search inputs
  const [selectedResume, setSelectedResume] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [keywords, setKeywords] = useState('');

  // Companies
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobFilter, setJobFilter] = useState('all');

  // Analysis results
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Load resumes on mount
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await resumeService.getMyResumes();
        setResumes(data.resumes || []);
      } catch {
        // silently fail - user can still use the page
      } finally {
        setResumesLoading(false);
      }
    };
    loadResumes();
  }, []);

  // Search companies
  const handleSearchCompanies = async () => {
    if (!searchLocation && !companyType && !keywords) return;
    setCompaniesLoading(true);
    setError('');
    setCompanies([]);
    setSelectedCompany('');
    setJobs([]);
    setSelectedJob(null);
    setAnalysis(null);

    try {
      const data = await hunterService.searchCompanies(searchLocation, companyType, keywords);
      const companyList = data.companies || data || [];
      setCompanies(Array.isArray(companyList) ? companyList : []);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to search companies.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Search jobs when company is selected
  const handleSearchJobs = async (companyName) => {
    setSelectedCompany(companyName);
    setJobsLoading(true);
    setError('');
    setJobs([]);
    setSelectedJob(null);
    setAnalysis(null);

    try {
      const data = await hunterService.searchJobs(companyName, searchLocation, keywords);
      const jobList = data.jobs || data || [];
      setJobs(Array.isArray(jobList) ? jobList : []);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to fetch jobs.');
    } finally {
      setJobsLoading(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobFilter === 'all'
    ? jobs
    : jobs.filter(j => {
        const title = (j.title || '').toLowerCase();
        return title.includes('software') || title.includes('developer') || title.includes('engineer');
      });

  // Hunt/Analyze (client-side keyword analysis — no backend /analyze call)
  const handleHunt = async () => {
    if (!selectedResume || !selectedJob) return;
    setLoading(true);
    setError('');
    setShowSuccess(false);
    setAnalysis(null);

    try {
      const resumeData = await resumeService.getDetails(selectedResume);
      const templateInfo = resumeData.resume?.templateInfo || resumeData.templateInfo || {};
      const result = analyzeResumeAgainstJob(templateInfo, selectedJob);

      setAnalysis({
        atsScore: result.atsScore,
        matchScore: result.matchScore,
        feedback: result.feedback,
      });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setSelectedResume('');
    setSearchLocation('');
    setCompanyType('');
    setKeywords('');
    setCompanies([]);
    setSelectedCompany('');
    setJobs([]);
    setSelectedJob(null);
    setJobFilter('all');
    setAnalysis(null);
    setError('');
    setShowSuccess(false);
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
  const hasActionableAcceptedFeedback = analysis?.feedback.some(f => f.accepted && f.fieldPath) || false;
  const allAccepted = analysis?.feedback.length > 0 && analysis.feedback.every(f => f.accepted);

  // Update Resume with accepted AI feedback
  const handleUpdateResume = async () => {
    if (!hasActionableAcceptedFeedback || !selectedResume) return;
    setUpdateLoading(true);
    setError('');
    try {
      const acceptedComments = analysis.feedback
        .filter(f => f.accepted && f.fieldPath)
        .map(f => ({
          fieldPath: f.fieldPath,
          type: f.type,
          originalValue: f.originalValue,
          suggestedValue: f.suggestedValue,
          note: f.note,
        }));
      await resumeService.acceptAiFeedback(selectedResume, acceptedComments, { autoRegenerate: true });
      setShowSuccess(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to update resume with feedback.');
    } finally {
      setUpdateLoading(false);
    }
  };

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
              disabled={resumesLoading}
            >
              <option value="">-- Select --</option>
              {resumes.map(r => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="hunter-header-right">
          <button
            className="hunter-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Search Row */}
      <div className="hunter-secondary-row" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="hunter-filter-group">
          <label htmlFor="hunter-location">Location</label>
          <input
            id="hunter-location"
            type="text"
            className="hunter-select"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="e.g. New York, NY"
            style={{ minWidth: 160 }}
          />
        </div>
        <div className="hunter-filter-group">
          <label htmlFor="hunter-company-type">Company Type</label>
          <input
            id="hunter-company-type"
            type="text"
            className="hunter-select"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            placeholder="e.g. tech"
            style={{ minWidth: 120 }}
          />
        </div>
        <div className="hunter-filter-group">
          <label htmlFor="hunter-keywords">Keywords</label>
          <input
            id="hunter-keywords"
            type="text"
            className="hunter-select"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. software engineer"
            style={{ minWidth: 160 }}
          />
        </div>
        <button
          className="hunter-action-link"
          onClick={handleSearchCompanies}
          disabled={companiesLoading || (!searchLocation && !companyType && !keywords)}
        >
          {companiesLoading ? 'Searching...' : 'Search Companies'}
        </button>
      </div>

      {/* Error */}
      {error && <div className="hunter-error">{error}</div>}

      {/* Companies List */}
      {companies.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>
            Companies ({companies.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {companies.map((c, idx) => {
              const name = c.name || c.company || c;
              const isSelected = selectedCompany === name;
              return (
                <button
                  key={idx}
                  className="hunter-action-link"
                  style={{
                    border: `1px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: 6,
                    padding: '6px 14px',
                    background: isSelected ? '#eff6ff' : '#fff',
                  }}
                  onClick={() => handleSearchJobs(name)}
                  disabled={jobsLoading}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Jobs Loading */}
      {jobsLoading && (
        <div className="hunter-loading">
          <div className="hunter-spinner" />
        </div>
      )}

      {/* Jobs List */}
      {!jobsLoading && jobs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>
              Jobs at {selectedCompany} ({filteredJobs.length})
            </div>
            <div className="hunter-radio-group">
              <label className="hunter-radio-option">
                <input type="radio" name="job-filter" value="all" checked={jobFilter === 'all'} onChange={() => setJobFilter('all')} />
                Show All
              </label>
              <label className="hunter-radio-option">
                <input type="radio" name="job-filter" value="matched" checked={jobFilter === 'matched'} onChange={() => setJobFilter('matched')} />
                Tech Roles
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredJobs.map((job, idx) => {
              const isSelected = selectedJob?.jobId === job.jobId || selectedJob?.id === job.id;
              return (
                <div
                  key={job.jobId || job.id || idx}
                  style={{
                    border: `1px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : '#fff',
                  }}
                  onClick={() => setSelectedJob(job)}
                >
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {job.company || selectedCompany} {job.location ? `| ${job.location}` : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hunt button */}
          <div style={{ marginTop: 12 }}>
            <button
              className="hunter-action-link"
              onClick={handleHunt}
              disabled={!selectedResume || !selectedJob || loading}
              style={{ border: '1px solid #3b82f6', borderRadius: 6, padding: '8px 20px' }}
            >
              {loading ? 'Analyzing...' : 'Hunt'}
            </button>
          </div>
        </div>
      )}

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
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {analysis.atsScore !== null && analysis.atsScore !== undefined && (
                <div className="hunter-ats-display">
                  ATS SCORE: <span className="hunter-ats-value">{analysis.atsScore}%</span>
                </div>
              )}
              {analysis.matchScore !== null && analysis.matchScore !== undefined && (
                <div className="hunter-ats-display">
                  MATCH SCORE: <span className="hunter-ats-value">{analysis.matchScore}%</span>
                </div>
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
                disabled={!hasActionableAcceptedFeedback || updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Resume'}
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
                    aria-label={`Accept: ${item.note}`}
                  />
                  <div className="hunter-feedback-message">
                    <div className="hunter-feedback-type">{item.fieldPath || item.type}</div>
                    {item.note}
                    {item.originalValue && item.suggestedValue && (
                      <div style={{ marginTop: 6, fontSize: 13 }}>
                        <div style={{ color: '#991b1b', textDecoration: 'line-through' }}>{item.originalValue}</div>
                        <div style={{ color: '#065f46' }}>{item.suggestedValue}</div>
                      </div>
                    )}
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
      {!loading && !analysis && !error && companies.length === 0 && (
        <div className="hunter-empty">
          Enter search criteria above to find companies and job openings, then analyze your resume.
        </div>
      )}
    </div>
  );
};

export default Hunter;
