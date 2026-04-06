import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Mock the useAuth hook
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state when auth is loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });
    
    renderWithRouter(<ProtectedRoute />, { route: '/protected' });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    
    renderWithRouter(<ProtectedRoute />, { route: '/protected' });
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    
    renderWithRouter(<ProtectedRoute />, { route: '/protected' });
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
