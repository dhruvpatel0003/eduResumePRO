import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import '../styles/dashboard.css';

// Filter options — extensible for future additions
const FILTER_OPTIONS = [
  { value: 'most_recent', label: 'Most Recent Job Opening' },
];

const DEFAULT_FILTER = 'most_recent';
const PAGE_SIZE = 4;

// Mock data — replace with real API calls
const MOCK_JOBS = [
  { id: 'j1', title: 'Mobile Application Developer', company: 'Apple Inc.', location: 'NewJersy, NJ', postedDate: '02/11/2026' },
  { id: 'j2', title: 'Mobile Application Developer', company: 'Apple Inc.', location: 'NewJersy, NJ', postedDate: '02/11/2026' },
  { id: 'j3', title: 'Mobile Application Developer', company: 'Apple Inc.', location: 'NewJersy, NJ', postedDate: '02/11/2026' },
  { id: 'j4', title: 'Mobile Application Developer', company: 'Apple Inc.', location: 'NewJersy, NJ', postedDate: '02/11/2026' },
  { id: 'j5', title: 'Frontend Engineer', company: 'Google LLC', location: 'Mountain View, CA', postedDate: '02/10/2026' },
  { id: 'j6', title: 'Backend Developer', company: 'Amazon Web Services', location: 'Seattle, WA', postedDate: '02/09/2026' },
  { id: 'j7', title: 'Full Stack Developer', company: 'Microsoft Corp.', location: 'Redmond, WA', postedDate: '02/08/2026' },
  { id: 'j8', title: 'DevOps Engineer', company: 'Netflix Inc.', location: 'Los Gatos, CA', postedDate: '02/07/2026' },
];

const StudentDashboard = () => {
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState(DEFAULT_FILTER);
  const [appliedFilter, setAppliedFilter] = useState(DEFAULT_FILTER);

  // Data state
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Fetch jobs
  const fetchJobs = useCallback(async (filter, page) => {
    setLoading(true);
    setError('');

    try {
      // TODO: replace with real API call using filter + page + PAGE_SIZE
      await new Promise(resolve => setTimeout(resolve, 400));

      // Mock: return slice of mock data
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setJobs(MOCK_JOBS.slice(start, end));
      setTotalCount(MOCK_JOBS.length);
    } catch (err) {
      setError('Failed to load job openings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs(appliedFilter, currentPage);
  }, [appliedFilter, currentPage, fetchJobs]);

  // Apply filter
  const handleApply = () => {
    setAppliedFilter(selectedFilter);
    setCurrentPage(1);
  };

  // Reset filter
  const handleReset = () => {
    setSelectedFilter(DEFAULT_FILTER);
    setAppliedFilter(DEFAULT_FILTER);
    setCurrentPage(1);
  };

  // Retry on error
  const handleRetry = () => {
    setError('');
    fetchJobs(appliedFilter, currentPage);
  };

  // Page change
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="dashboard-filter-row">
        <div className="dashboard-filter-left">
          <select
            id="dashboard-filter"
            className="dashboard-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            aria-label="Job filter"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="dashboard-filter-right">
          <button
            className="dashboard-action-link"
            onClick={handleApply}
            disabled={loading}
          >
            Apply
          </button>
          <button
            className="dashboard-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button className="dashboard-action-link" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
        </div>
      ) : !error && jobs.length === 0 ? (
        /* Empty State */
        <div className="dashboard-empty">
          No job openings found.
        </div>
      ) : !error && (
        <>
          {/* Job Openings Table */}
          <div className="dashboard-job-list" role="table" aria-label="Job openings">
            <div className="dashboard-job-header" role="row">
              <span role="columnheader">Job Title</span>
              <span role="columnheader">Company</span>
              <span role="columnheader">Location</span>
              <span role="columnheader">Date Posted</span>
            </div>
            {jobs.map(job => (
              <div key={job.id} className="dashboard-job-row" role="row">
                <div className="dashboard-job-cell dashboard-job-title" role="cell">{job.title}</div>
                <div className="dashboard-job-cell" role="cell">{job.company}</div>
                <div className="dashboard-job-cell" role="cell">{job.location}</div>
                <div className="dashboard-job-cell" role="cell">{job.postedDate}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="dashboard-pagination" aria-label="Pagination">
              <button
                className="dashboard-page-nav"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeftIcon />
              </button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  className={`dashboard-page-btn${currentPage === page ? ' active' : ''}`}
                  onClick={() => goToPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                className="dashboard-page-nav"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRightIcon />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
