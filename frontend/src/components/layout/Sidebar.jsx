import React from 'react';
import { useSidebar } from './SidebarContext';
import SidebarNavItem from './SidebarNavItem';
import { DocumentIcon, UserIcon, ChartIcon, ShareIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const navItems = [
  { to: '/resumes', label: 'My Resume', icon: <DocumentIcon /> },
  { to: '/details', label: 'My Details', icon: <UserIcon /> },
  { to: '/report', label: 'Report', icon: <ChartIcon /> },
  { to: '/shared', label: 'Shared with', icon: <ShareIcon /> },
  { to: '/hunter', label: 'Hunter', icon: <SearchIcon />, badge: 'New' },
];

const Sidebar = () => {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();

  const sidebarClass = [
    'app-shell-sidebar',
    isCollapsed && !isMobile ? 'collapsed' : '',
    isMobile && !isCollapsed ? 'expanded-mobile' : '',
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClass}>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <SidebarNavItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
