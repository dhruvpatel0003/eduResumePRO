import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useAuth } from '../context/AuthContext';

// Mock context and child components
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./StudentDashboard', () => {
  return function MockStudentDashboard() {
    return <div>Mocked Student Dashboard</div>;
  };
});

jest.mock('./ProfessorDashboard', () => {
  return function MockProfessorDashboard() {
    return <div>Mocked Professor Dashboard</div>;
  };
});

describe('Dashboard Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for student fallback if role is undefined', () => {
    useAuth.mockReturnValue({ user: {} });
    render(<Dashboard />);
    expect(screen.getByText('Mocked Student Dashboard')).toBeInTheDocument();
  });

  it('renders student dashboard perfectly', () => {
    useAuth.mockReturnValue({ user: { role: 'student' } });
    render(<Dashboard />);
    expect(screen.getByText('Mocked Student Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Mocked Professor Dashboard')).not.toBeInTheDocument();
  });

  it('renders professor dashboard when appropriate', () => {
    useAuth.mockReturnValue({ user: { role: 'professor' } });
    render(<Dashboard />);
    expect(screen.getByText('Mocked Professor Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Mocked Student Dashboard')).not.toBeInTheDocument();
  });
});
