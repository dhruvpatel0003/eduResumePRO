import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="page-logo">
      <Link to="/">
        <img src="/EduResumeProLogo.png" alt="EduResumePRO" />
      </Link>
    </div>
  );
};

export default Logo;
