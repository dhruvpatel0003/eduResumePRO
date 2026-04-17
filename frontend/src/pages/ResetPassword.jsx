import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../components/Logo';
import '../styles/auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsVerifying(false);
        setError('Invalid or missing reset token');
        return;
      }
      try {
        await authService.verifyResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError(err || 'Invalid or expired token');
      } finally {
        setIsVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword(token, password);
      setMessage(data.message || 'Password reset successful');
      setTokenValid(false); // hide form on success
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="auth-container">
        <Logo />
        <div className="auth-form" style={{ textAlign: 'center' }}>
          <h2>Verifying Reset Link</h2>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Logo />
      <div className="auth-form">
        <h2>Set New Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
        
        {tokenValid ? (
          <form onSubmit={handleSubmit}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              Create a new strong password for your account.
            </p>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          !message && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p className="error-message">The password reset link is invalid or has expired.</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/forgot-password')}
                style={{ marginTop: '15px' }}
              >
                Request New Link
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
