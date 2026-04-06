import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('RoleRoute Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/dashboard" element={<div>Default Dashboard</div>} />
          <Route 
            path="/prof-only" 
            element={
              <RoleRoute allowedRoles={['professor']}>
                <div>Professor Content</div>
              </RoleRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to dashboard if user role is not allowed', () => {
    useAuth.mockReturnValue({ user: { role: 'student' } });
    
    renderWithRouter(<RoleRoute />, { route: '/prof-only' });
    
    expect(screen.queryByText('Professor Content')).not.toBeInTheDocument();
    expect(screen.getByText('Default Dashboard')).toBeInTheDocument();
  });

  it('defaults to student role if user role is undefined', () => {
    useAuth.mockReturnValue({ user: {} });
    
    renderWithRouter(<RoleRoute />, { route: '/prof-only' });
    
    expect(screen.getByText('Default Dashboard')).toBeInTheDocument();
  });

  it('renders children if user role is allowed', () => {
    useAuth.mockReturnValue({ user: { role: 'professor' } });
    
    renderWithRouter(<RoleRoute />, { route: '/prof-only' });
    
    expect(screen.getByText('Professor Content')).toBeInTheDocument();
    expect(screen.queryByText('Default Dashboard')).not.toBeInTheDocument();
  });
});
