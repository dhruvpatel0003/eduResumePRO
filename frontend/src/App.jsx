import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { SidebarProvider } from './components/layout/SidebarContext';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Templates from './pages/Templates';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Details from './pages/Details';
import Report from './pages/Report';
import Shared from './pages/Shared';
import Hunter from './pages/Hunter';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - wrapped in AppShell layout */}
          <Route
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <AppShell />
                </SidebarProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/details" element={<Details />} />
            <Route path="/report" element={<Report />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/hunter" element={<Hunter />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
