import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarContext';

const SidebarNavItem = ({ to, label, icon, badge }) => {
  const { isCollapsed, isMobile } = useSidebar();
  const showIconOnly = isCollapsed && !isMobile;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive ? 'active' : ''}`
      }
      title={showIconOnly ? label : undefined}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </NavLink>
  );
};

export default SidebarNavItem;
