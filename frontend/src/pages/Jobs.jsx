import React, { useState, useEffect } from 'react';
import jobService from '../services/jobService';
import Logo from '../components/Logo';
import '../styles/jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getAll();
      setJobs(data);
    } catch (err) {
      setError(err || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId) => {
    window.location.href = `/apply/${jobId}`;
  };

  const filteredJobs = filter
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(filter.toLowerCase()) ||
        job.company.toLowerCase().includes(filter.toLowerCase())
      )
    : jobs;

  if (loading) return <div style={{ padding: '20px' }}>Loading jobs...</div>;

  return (
    <div className="jobs-container">
      <Logo />
      <div className="jobs-header">
        <h1>Job Openings</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs found. Check back later!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {filteredJobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <div>
                  <h3>{job.title}</h3>
                  <p className="company">{job.company}</p>
                </div>
                <span className={`status ${job.status}`}>{job.status}</span>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-details">
                <span>📍 {job.location}</span>
                <span>💼 {job.jobType}</span>
                {job.salaryRange?.min && (
                  <span>💰 ${job.salaryRange.min} - ${job.salaryRange.max}</span>
                )}
              </div>

              {job.requiredSkills && (
                <div className="skills">
                  {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-badge">{skill}</span>
                  ))}
                </div>
              )}

              <button 
                className="btn-primary" 
                onClick={() => handleApply(job._id)}
                disabled={job.status !== 'open'}
              >
                {job.status === 'open' ? 'Apply Now' : 'Position Closed'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
