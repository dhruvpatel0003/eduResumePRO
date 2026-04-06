import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

// Mock dependencies
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/authService', () => ({
  login: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockLoginContext = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLoginContext });
    jest.clearAllMocks();
  });

  const setup = () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('renders login form properly', () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('updates input fields correctly', () => {
    setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('handles successful login', async () => {
    authService.login.mockResolvedValue({
      user: { id: 1, email: 'test@test.com' },
      token: 'fake-jwt-token'
    });
    
    setup();
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'pass');
      expect(mockLoginContext).toHaveBeenCalledWith(
        { id: 1, email: 'test@test.com' },
        'fake-jwt-token'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles invalid login credentials gracefully', async () => {
    authService.login.mockRejectedValue('Invalid credentials provided');

    setup();
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials provided')).toBeInTheDocument();
      expect(mockLoginContext).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
