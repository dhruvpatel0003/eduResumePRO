import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import resumeService from '../services/resumeService';
import '../styles/professor-dashboard.css';
import '../styles/dashboard.css';

// Filter options
const SHARED_WITH_OPTIONS = [
  { value: 'me', label: 'Me' },
];

const TIME_OPTIONS = [
  { value: 'most_recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

const PAGE_SIZE = 4;

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'pending';
    case 'viewed': return 'started';
    case 'completed': return 'completed';
    default: return 'not-started';
  }
};

const ProfessorDashboard = () => {
  const navigate = useNavigate();

  // Filter state
  const [sharedWith, setSharedWith] = useState('me');
  const [timeFilter, setTimeFilter] = useState('most_recent');
  const [statusFilter, setStatusFilter] = useState('all');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    sharedWith: 'me',
    time: 'most_recent',
    status: 'all',
  });

  // Data state
  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Fetch requests
  const fetchRequests = useCallback(async (filters, page) => {
    setLoading(true);
    setError('');

    try {
      const data = await resumeService.getFacultyResumes();
      let allRequests = (data.resumes || []).map(r => ({
        id: r.resumeId,
        studentName: r.student?.name || 'Unknown',
        level: '—',
        major: r.student?.email || '—',
        requestedDate: r.sharedAt
          ? new Date(r.sharedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : '',
        status: r.status || 'pending',
      }));

      // Client-side filtering
      if (filters.status !== 'all') {
        allRequests = allRequests.filter(r => r.status.toLowerCase() === filters.status);
      }

      // Sort
      if (filters.time === 'oldest') {
        allRequests.reverse();
      }

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setRequests(allRequests.slice(start, end));
      setTotalCount(allRequests.length);
      setSelectedId(null);
    } catch (err) {
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(appliedFilters, currentPage);
  }, [appliedFilters, currentPage, fetchRequests]);

  // Filter actions
  const handleApply = () => {
    setAppliedFilters({
      sharedWith,
      time: timeFilter,
      status: statusFilter,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSharedWith('me');
    setTimeFilter('most_recent');
    setStatusFilter('all');
    setAppliedFilters({
      sharedWith: 'me',
      time: 'most_recent',
      status: 'all',
    });
    setCurrentPage(1);
  };

  // Row selection (single-select)
  const handleRowSelect = (id) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  // Give Feedback
  const handleGiveFeedback = () => {
    if (!selectedId) return;
    navigate(`/professor/request/${selectedId}`);
  };

  // Retry
  const handleRetry = () => {
    setError('');
    fetchRequests(appliedFilters, currentPage);
  };

  // Pagination
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      {/* Filter Panel */}
      <div className="prof-dash-filters">
        <div className="prof-dash-filter-fields">
          <div className="prof-dash-filter-row">
            <label htmlFor="prof-shared-with">Already Shared with</label>
            <select
              id="prof-shared-with"
              className="prof-dash-select"
              value={sharedWith}
              onChange={(e) => setSharedWith(e.target.value)}
            >
              {SHARED_WITH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="prof-dash-filter-row">
            <label htmlFor="prof-time-filter">By Time</label>
            <select
              id="prof-time-filter"
              className="prof-dash-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="prof-dash-filter-row">
            <label htmlFor="prof-status-filter">Status</label>
            <select
              id="prof-status-filter"
              className="prof-dash-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="prof-dash-filter-actions">
          <button
            className="prof-dash-action-link"
            onClick={handleApply}
            disabled={loading}
          >
            Apply
          </button>
          <button
            className="prof-dash-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Give Feedback Action Row */}
      <div className="prof-dash-action-row">
        <button
          className="prof-dash-action-link"
          onClick={handleGiveFeedback}
          disabled={!selectedId}
        >
          Give Feedback
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="prof-dash-error">
          <p>{error}</p>
          <button className="prof-dash-action-link" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="prof-dash-loading">
          <div className="prof-dash-spinner" />
        </div>
      ) : !error && requests.length === 0 ? (
        <div className="prof-dash-empty">
          No requests found.
        </div>
      ) : !error && (
        <>
          {/* Requests Table */}
          <div className="prof-dash-table" role="table" aria-label="Student requests">
            <div className="prof-dash-table-header" role="row">
              <span role="columnheader"></span>
              <span role="columnheader">Student Name</span>
              <span role="columnheader">Level</span>
              <span role="columnheader">Major</span>
              <span role="columnheader">Requested Date</span>
              <span role="columnheader">Status</span>
            </div>
            {requests.map(req => (
              <div
                key={req.id}
                className={`prof-dash-table-row${selectedId === req.id ? ' selected' : ''}`}
                onClick={() => handleRowSelect(req.id)}
                role="row"
              >
                <div className="prof-dash-cell">
                  <input
                    type="checkbox"
                    checked={selectedId === req.id}
                    onChange={() => handleRowSelect(req.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${req.studentName}`}
                  />
                </div>
                <div className="prof-dash-cell prof-dash-cell-name" role="cell">{req.studentName}</div>
                <div className="prof-dash-cell" role="cell">{req.level}</div>
                <div className="prof-dash-cell" role="cell">{req.major}</div>
                <div className="prof-dash-cell" role="cell">{req.requestedDate}</div>
                <div className="prof-dash-cell" role="cell">
                  <span className={`prof-dash-status ${getStatusClass(req.status)}`}>
                    {req.status}
                  </span>
                </div>
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

export default ProfessorDashboard;
