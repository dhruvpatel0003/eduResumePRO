import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import '../styles/profile.css';

const PROFILE_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', required: true },
  { key: 'email', label: 'Email Address', type: 'email', required: true },
  { key: 'alternateEmail', label: 'Alternate Email', type: 'email', required: false },
  { key: 'university', label: 'University', type: 'text', required: false },
  { key: 'major', label: 'Major', type: 'text', required: false },
  { key: 'stream', label: 'Stream', type: 'text', required: false },
  { key: 'role', label: 'Role', type: 'text', required: false },
];

const validateField = (field, value) => {
  const trimmed = value.trim();
  if (field.required && !trimmed) {
    return `${field.label} is required`;
  }
  if (field.type === 'email' && trimmed) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address';
    }
  }
  return null;
};

const Profile = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    alternateEmail: '',
    university: '',
    major: '',
    stream: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [successField, setSuccessField] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setFetchError('');

        // TODO: replace with real API call — authService.getProfile()
        await new Promise(resolve => setTimeout(resolve, 300));

        // Populate from auth context for now
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          alternateEmail: '',
          university: '',
          major: '',
          stream: '',
          role: user?.role || '',
        });
      } catch (err) {
        setFetchError(err || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleEdit = (fieldKey) => {
    setEditingField(fieldKey);
    setEditValue(profile[fieldKey] || '');
    setFieldError('');
    setSuccessField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
    setFieldError('');
  };

  const handleSave = async (field) => {
    const trimmed = editValue.trim();
    const error = validateField(field, editValue);
    if (error) {
      setFieldError(error);
      return;
    }

    try {
      setSaving(true);
      setFieldError('');

      // TODO: replace with real API call — authService.updateProfile(field.key, trimmed)
      await new Promise(resolve => setTimeout(resolve, 400));

      const updatedProfile = { ...profile, [field.key]: trimmed };
      setProfile(updatedProfile);

      // Update auth context if name or email changed
      if (field.key === 'name' || field.key === 'email') {
        const token = localStorage.getItem('token');
        login({ ...user, [field.key]: trimmed }, token);
      }

      setEditingField(null);
      setEditValue('');
      setSuccessField(field.key);
      setTimeout(() => setSuccessField(null), 2500);
    } catch (err) {
      setFieldError(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <div className="error-message" style={{ marginBottom: 16 }}>
          {fetchError}
        </div>
        <button className="profile-action-link" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Update Profile</h1>

      <div className="profile-form">
        {PROFILE_FIELDS.map(field => {
          const isEditing = editingField === field.key;

          return (
            <div key={field.key} className="profile-field-row">
              <label htmlFor={`profile-${field.key}`} className="profile-field-label">
                {field.label}
              </label>

              <div className="profile-field-input-row">
                <input
                  id={`profile-${field.key}`}
                  type={field.type}
                  className="profile-field-input"
                  value={isEditing ? editValue : (profile[field.key] || '')}
                  readOnly={!isEditing}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    if (fieldError) setFieldError('');
                  }}
                  onKeyDown={(e) => {
                    if (isEditing && e.key === 'Enter') handleSave(field);
                    if (isEditing && e.key === 'Escape') handleCancel();
                  }}
                />

                <div className="profile-field-actions">
                  {isEditing ? (
                    <>
                      <button
                        className="profile-action-link profile-save-link"
                        onClick={() => handleSave(field)}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="profile-action-link"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="profile-action-link"
                      onClick={() => handleEdit(field.key)}
                      disabled={editingField !== null && editingField !== field.key}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditing && fieldError && (
                <div className="profile-field-error">{fieldError}</div>
              )}
              {successField === field.key && (
                <div className="profile-field-success">Updated successfully</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
