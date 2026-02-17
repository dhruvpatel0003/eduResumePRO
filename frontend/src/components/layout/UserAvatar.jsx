import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserAvatar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-avatar-wrapper" ref={wrapperRef}>
      <button
        className="user-avatar"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="User menu"
        title={user?.name || 'User'}
      >
        {initials}
      </button>
      {menuOpen && (
        <div className="avatar-dropdown">
          <div className="avatar-dropdown-header">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="avatar-dropdown-item" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
