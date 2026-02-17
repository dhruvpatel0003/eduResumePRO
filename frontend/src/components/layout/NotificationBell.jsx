import React from 'react';
import { BellIcon } from './icons';

const NotificationBell = () => {
  return (
    <button className="notification-bell" aria-label="Notifications" onClick={() => {}}>
      <BellIcon />
    </button>
  );
};

export default NotificationBell;
