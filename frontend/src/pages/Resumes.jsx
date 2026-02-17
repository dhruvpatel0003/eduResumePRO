import React, { useState, useEffect } from 'react';
import resumeService from '../services/resumeService';
import { useAuth } from '../context/AuthContext';
import '../styles/resumes.css';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getAll();
      setResumes(data);
    } catch (err) {
      setError(err || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.delete(id);
        setResumes(resumes.filter(r => r._id !== id));
      } catch (err) {
        setError(err || 'Failed to delete resume');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      const updated = await resumeService.publish(id);
      setResumes(resumes.map(r => r._id === id ? updated : r));
    } catch (err) {
      setError(err || 'Failed to publish resume');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className="resumes-container">
      <div className="resumes-header">
        <h1>My Resumes</h1>
        <button className="btn-primary" onClick={() => window.location.href = '/resume/create'}>
          Create New Resume
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {resumes.length === 0 ? (
        <div className="empty-state">
          <p>No resumes yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="resumes-grid">
          {resumes.map(resume => (
            <div key={resume._id} className="resume-card">
              <h3>{resume.title}</h3>
              <p className="resume-meta">
                {resume.personalInfo?.fullName} • {resume.personalInfo?.email}
              </p>
              <div className="resume-stats">
                <span>ATS Score: {resume.atsScore}</span>
                <span className={`status ${resume.isPublished ? 'published' : 'draft'}`}>
                  {resume.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="resume-actions">
                <button className="btn-secondary" onClick={() => window.location.href = `/resume/${resume._id}`}>
                  View
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = `/resume/${resume._id}/edit`}>
                  Edit
                </button>
                {!resume.isPublished && (
                  <button className="btn-secondary" onClick={() => handlePublish(resume._id)}>
                    Publish
                  </button>
                )}
                <button className="btn-danger" onClick={() => handleDelete(resume._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resumes;
