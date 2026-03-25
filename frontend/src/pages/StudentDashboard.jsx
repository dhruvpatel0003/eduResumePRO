import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import jobService from '../services/jobService';
import '../styles/dashboard.css';

// Filter options — extensible for future additions
const FILTER_OPTIONS = [
  { value: 'most_recent', label: 'Most Recent Job Opening' },
];

const DEFAULT_FILTER = 'most_recent';
const PAGE_SIZE = 4;

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
      const data = await jobService.getAll();
      const allJobs = (Array.isArray(data) ? data : data.jobs || []).map(job => ({
        id: job._id || job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        postedDate: job.postedDate
          ? new Date(job.postedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : '',
      }));

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setJobs(allJobs.slice(start, end));
      setTotalCount(allJobs.length);
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
