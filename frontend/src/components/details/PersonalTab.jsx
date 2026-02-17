import React from 'react';

const PersonalTab = ({ data, onChange }) => {
  return (
    <div className="details-form-section">
      <div className="details-form-section-header">Personal</div>
      <div className="details-form-grid">
        <div className="details-form-group">
          <label>First Name</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="First Name"
          />
        </div>
        <div className="details-form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Last Name"
          />
        </div>
        <div className="details-form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="Email Address"
          />
        </div>
        <div className="details-form-group">
          <label>Phone No</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Phone Number"
          />
        </div>
        <div className="details-form-group">
          <label>Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Location"
          />
        </div>
        <div className="details-form-group">
          <label>GitHub</label>
          <input
            type="url"
            value={data.github}
            onChange={(e) => onChange('github', e.target.value)}
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalTab;
