import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from '../components/layout/icons';
import '../styles/professor-shared.css';
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
  { value: 'not_started', label: 'Not Started' },
  { value: 'pending', label: 'Pending' },
  { value: 'started', label: 'Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

const PAGE_SIZE = 4;

// Mock data — replace with real API calls
const MOCK_REQUESTS = [
  { id: 'sw1', studentName: 'ABC Student', level: 'Graduate', stream: 'Computer Engineering', requestedDate: '02/11/2026', status: 'Not Started' },
  { id: 'sw2', studentName: 'DEF Student', level: 'Undergraduate', stream: 'Electrical Engineering', requestedDate: '02/11/2026', status: 'Not Started' },
  { id: 'sw3', studentName: 'GHI Student', level: 'Graduate', stream: 'Computer Science', requestedDate: '02/10/2026', status: 'Pending' },
  { id: 'sw4', studentName: 'JKL Student', level: 'Graduate', stream: 'Computer Engineering', requestedDate: '02/09/2026', status: 'Not Started' },
  { id: 'sw5', studentName: 'MNO Student', level: 'Undergraduate', stream: 'Mechanical Engineering', requestedDate: '02/08/2026', status: 'Started' },
  { id: 'sw6', studentName: 'PQR Student', level: 'Graduate', stream: 'Business Administration', requestedDate: '02/07/2026', status: 'Not Started' },
  { id: 'sw7', studentName: 'STU Student', level: 'Graduate', stream: 'Computer Engineering', requestedDate: '02/06/2026', status: 'Pending' },
  { id: 'sw8', studentName: 'VWX Student', level: 'Undergraduate', stream: 'Biology', requestedDate: '02/05/2026', status: 'Not Started' },
];

const getStatusClass = (status) => {
  switch (status) {
    case 'Not Started': return 'not-started';
    case 'Pending': return 'pending';
    case 'Started': return 'started';
    case 'Completed': return 'completed';
    default: return '';
  }
};

const ProfessorSharedWithList = () => {
  const navigate = useNavigate();

  // Filter state (applied immediately on change)
  const [sharedWith, setSharedWith] = useState('me');
  const [timeFilter, setTimeFilter] = useState('most_recent');
  const [statusFilter, setStatusFilter] = useState('not_started');

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
      // TODO: replace with real API call — GET /professor/shared-with?status=&time=&sharedWith=me&page=&pageSize=
      await new Promise(resolve => setTimeout(resolve, 400));

      // Mock filtering
      let filtered = [...MOCK_REQUESTS];
      if (filters.status !== 'all') {
        const statusMap = {
          not_started: 'Not Started',
          pending: 'Pending',
          started: 'Started',
          completed: 'Completed',
        };
        filtered = filtered.filter(r => r.status === statusMap[filters.status]);
      }

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setRequests(filtered.slice(start, end));
      setTotalCount(filtered.length);
      setSelectedId(null);
    } catch (err) {
      setError('Failed to load shared requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Build current filters object
  const currentFilters = { sharedWith, time: timeFilter, status: statusFilter };

  useEffect(() => {
    fetchRequests(currentFilters, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedWith, timeFilter, statusFilter, currentPage, fetchRequests]);

  // When a filter dropdown changes, reset to page 1
  const handleSharedWithChange = (value) => {
    setSharedWith(value);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Filter actions
  const handleApply = () => {
    setCurrentPage(1);
    fetchRequests(currentFilters, 1);
  };

  const handleReset = () => {
    setSharedWith('me');
    setTimeFilter('most_recent');
    setStatusFilter('not_started');
    setCurrentPage(1);
  };

  // Row selection (single-select)
  const handleRowSelect = (id) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  // Give Feedback — navigate to detail
  const handleGiveFeedback = () => {
    if (!selectedId) return;
    navigate(`/shared-with/${selectedId}`);
  };

  // Retry
  const handleRetry = () => {
    setError('');
    fetchRequests(currentFilters, currentPage);
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
      <div className="prof-shared-filters">
        <div className="prof-shared-filter-fields">
          <div className="prof-shared-filter-row">
            <label htmlFor="prof-sw-shared-with">Already Shared with</label>
            <select
              id="prof-sw-shared-with"
              className="prof-shared-select"
              value={sharedWith}
              onChange={(e) => handleSharedWithChange(e.target.value)}
            >
              {SHARED_WITH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="prof-shared-filter-row">
            <label htmlFor="prof-sw-time">By Time</label>
            <select
              id="prof-sw-time"
              className="prof-shared-select"
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="prof-shared-filter-row">
            <label htmlFor="prof-sw-status">Status</label>
            <select
              id="prof-sw-status"
              className="prof-shared-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="prof-shared-filter-actions">
          <button
            className="prof-shared-action-link"
            onClick={handleApply}
            disabled={loading}
          >
            Apply
          </button>
          <button
            className="prof-shared-action-link"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Give Feedback Toolbar */}
      <div className="prof-shared-toolbar">
        <button
          className="prof-shared-toolbar-btn"
          onClick={handleGiveFeedback}
          disabled={!selectedId}
        >
          <span className="prof-shared-toolbar-icon"><ShareIcon /></span>
          Give Feedback
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="prof-shared-error">
          <p>{error}</p>
          <button className="prof-shared-action-link" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="prof-shared-loading">
          <div className="prof-shared-spinner" />
        </div>
      ) : !error && requests.length === 0 ? (
        <div className="prof-shared-empty">
          No shared resumes pending review.
        </div>
      ) : !error && (
        <>
          {/* Requests Table */}
          <div className="prof-shared-table" role="table" aria-label="Shared student requests">
            <div className="prof-shared-table-header" role="row">
              <span role="columnheader"></span>
              <span role="columnheader">Student Name</span>
              <span role="columnheader">Level</span>
              <span role="columnheader">Stream</span>
              <span role="columnheader">Requested Date</span>
              <span role="columnheader">Status</span>
            </div>
            {requests.map(req => (
              <div
                key={req.id}
                className={`prof-shared-table-row${selectedId === req.id ? ' selected' : ''}`}
                onClick={() => handleRowSelect(req.id)}
                role="row"
              >
                <div className="prof-shared-cell">
                  <input
                    type="checkbox"
                    checked={selectedId === req.id}
                    onChange={() => handleRowSelect(req.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${req.studentName}`}
                  />
                </div>
                <div className="prof-shared-cell prof-shared-cell-name" role="cell">{req.studentName}</div>
                <div className="prof-shared-cell" role="cell">{req.level}</div>
                <div className="prof-shared-cell" role="cell">{req.stream}</div>
                <div className="prof-shared-cell" role="cell">{req.requestedDate}</div>
                <div className="prof-shared-cell" role="cell">
                  <span className={`prof-shared-status ${getStatusClass(req.status)}`}>
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

export default ProfessorSharedWithList;
