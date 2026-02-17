import React, { useState, useEffect } from 'react';
import applicationService from '../services/applicationService';
import Logo from '../components/Logo';
import '../styles/applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (err) {
      setError(err || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await applicationService.delete(id);
        setApplications(applications.filter(a => a._id !== id));
      } catch (err) {
        setError(err || 'Failed to delete application');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'applied': '#3b82f6',
      'under-review': '#f59e0b',
      'shortlisted': '#10b981',
      'rejected': '#ef4444',
      'accepted': '#06b6d4'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading applications...</div>;

  return (
    <div className="applications-container">
      <Logo />
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track your job applications</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {applications.length === 0 ? (
        <div className="empty-state">
          <p>You haven't applied to any jobs yet. <a href="/jobs">Browse jobs</a></p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app._id} className="application-card">
              <div className="app-header">
                <div>
                  <h3>{app.jobOpeningId?.title}</h3>
                  <p className="company">{app.jobOpeningId?.company}</p>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(app.status) }}
                >
                  {app.status}
                </span>
              </div>

              <div className="app-details">
                <p><strong>Applied on:</strong> {new Date(app.appliedDate).toLocaleDateString()}</p>
                {app.interviewDate && (
                  <p><strong>Interview:</strong> {new Date(app.interviewDate).toLocaleDateString()}</p>
                )}
                {app.score && <p><strong>Score:</strong> {app.score}/100</p>}
              </div>

              {app.feedback && (
                <div className="feedback-section">
                  <p><strong>Feedback:</strong> {app.feedback}</p>
                </div>
              )}

              <button 
                className="btn-danger" 
                onClick={() => handleDelete(app._id)}
              >
                Withdraw Application
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
