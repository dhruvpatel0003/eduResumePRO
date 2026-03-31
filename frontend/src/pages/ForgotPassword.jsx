import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../components/Logo';
import '../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await authService.forgotPassword(email);
      setMessage(data.message || 'Password reset link sent to your email');
      setEmail('');
    } catch (err) {
      setError(err || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Logo />
      <div className="auth-form">
        <h2>Reset Password</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Enter your registered email address and we'll send you a link to reset your password.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: '20px' }}>
          <p>Remember your password? <Link to="/login">Login</Link></p>
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
