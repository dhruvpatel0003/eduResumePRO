import React from 'react';

const SkillsTab = ({ data, onChange }) => {
  return (
    <div className="details-form-section">
      <div className="details-form-section-header">Skills</div>
      <div className="details-form-grid single-column">
        <div className="details-form-group">
          <label>Languages</label>
          <textarea
            value={data.languages}
            onChange={(e) => onChange('languages', e.target.value)}
            placeholder="e.g. JavaScript, Python, Java, C++"
          />
        </div>
        <div className="details-form-group">
          <label>Technologies</label>
          <textarea
            value={data.technologies}
            onChange={(e) => onChange('technologies', e.target.value)}
            placeholder="e.g. React, Node.js, Express, Django"
          />
        </div>
        <div className="details-form-group">
          <label>Databases</label>
          <textarea
            value={data.databases}
            onChange={(e) => onChange('databases', e.target.value)}
            placeholder="e.g. MongoDB, PostgreSQL, MySQL, Redis"
          />
        </div>
        <div className="details-form-group">
          <label>Tools</label>
          <textarea
            value={data.tools}
            onChange={(e) => onChange('tools', e.target.value)}
            placeholder="e.g. Git, Docker, AWS, VS Code"
          />
        </div>
      </div>
    </div>
  );
};

export default SkillsTab;
