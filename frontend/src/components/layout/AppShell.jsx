import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/app-shell.css';

const AppShell = () => {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-shell-body">
        <Sidebar />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
