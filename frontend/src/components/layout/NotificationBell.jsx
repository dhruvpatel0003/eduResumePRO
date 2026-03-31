import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { BellIcon } from './icons';

const NotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    // Function to check unread counts
    const checkUnread = async () => {
      try {
        const notifications = await notificationService.getNotifications();
        if (!isMounted) return;
        const unread = notifications.filter(n => n.status === 'unread').length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notification count", err);
      }
    };

    // Check immediately, then poll every 30 seconds
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]); // Re-check when route changes (e.g., when they mark them read)

  return (
    <button
      className="notification-bell"
      aria-label="Notifications"
      onClick={() => navigate('/notifications')}
      style={{ position: 'relative' }}
    >
      <BellIcon />
      {unreadCount > 0 && (
        <span 
          className="notification-badge" 
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
