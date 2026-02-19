import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import UserAvatar from './UserAvatar';

const Header = () => {
  return (
    <header className="app-shell-header">
      <div className="header-left">
        <Link to="/dashboard">
          <img src="/EduResumeProLogo.png" alt="EduResumePRO" className="header-logo" />
        </Link>
      </div>

      <nav className="header-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `header-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            `header-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          Templates
        </NavLink>
      </nav>

      <div className="header-right">
        <NotificationBell />
        <UserAvatar />
      </div>
    </header>
  );
};

export default Header;
