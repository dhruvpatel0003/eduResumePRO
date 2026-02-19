import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from './icons';

const NotificationBell = () => {
  const navigate = useNavigate();

  return (
    <button
      className="notification-bell"
      aria-label="Notifications"
      onClick={() => navigate('/notifications')}
    >
      <BellIcon />
    </button>
  );
};

export default NotificationBell;
