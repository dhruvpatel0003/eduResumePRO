import React, { useState, useEffect } from 'react';
import '../styles/notifications.css';
import '../styles/details.css';

// Mock data — replace with real API calls
const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    senderEmail: 'prof.abc@university.edu',
    content: 'Your resume has been reviewed. Please check feedback.',
    status: 'unread',
    createdAt: '2026-02-17T10:00:00Z',
  },
  {
    id: 'n2',
    senderEmail: 'prof.xyz@university.edu',
    content: 'New comments on your shared resume document.',
    status: 'unread',
    createdAt: '2026-02-16T14:30:00Z',
  },
  {
    id: 'n3',
    senderEmail: 'admin@eduresumepro.com',
    content: 'Welcome to EduResumePRO! Start by creating your profile.',
    status: 'read',
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'n4',
    senderEmail: 'prof.abc@university.edu',
    content: 'Feedback ticket has been closed for your resume.',
    status: 'read',
    createdAt: '2026-02-14T16:45:00Z',
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: replace with real API call
        await new Promise(resolve => setTimeout(resolve, 400));
        setNotifications(MOCK_NOTIFICATIONS);
      } catch (err) {
        // Error handling
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const allSelected = notifications.length > 0 && selectedIds.size === notifications.length;
  const noneSelected = selectedIds.size === 0;

  // Select All
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(notifications.map(n => n.id));
      setSelectedIds(allIds);
      // Mark all as read
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' }))
      );
    }
  };

  // Toggle individual selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Mark as read
  const handleMarkAsRead = () => {
    if (noneSelected) return;
    // TODO: replace with real API call
    setNotifications(prev =>
      prev.map(n => selectedIds.has(n.id) ? { ...n, status: 'read' } : n)
    );
  };

  // Delete — open confirmation modal
  const handleDeleteClick = () => {
    if (noneSelected) return;
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    // TODO: replace with real API call
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    setShowDeleteModal(false);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Escape key for modal
  useEffect(() => {
    if (!showDeleteModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowDeleteModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showDeleteModal]);

  return (
    <div>
      {/* Toolbar Row */}
      <div className="notifications-toolbar">
        <div className="notifications-toolbar-left">
          <label className="notifications-select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              aria-label="Select all notifications"
            />
            Select All
          </label>
          <button
            className="notifications-action-link"
            onClick={handleMarkAsRead}
            disabled={noneSelected}
          >
            Marks as read
          </button>
        </div>
        <div className="notifications-toolbar-right">
          <button
            className="notifications-action-link notifications-action-link--danger"
            onClick={handleDeleteClick}
            disabled={noneSelected}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="notifications-loading">
          <div className="notifications-spinner" />
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="notifications-empty">
          No notifications
        </div>
      ) : (
        /* Notification List */
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={[
                'notification-row',
                notification.status === 'read' ? 'read' : '',
                selectedIds.has(notification.id) ? 'selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => toggleSelect(notification.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(notification.id)}
                onChange={() => toggleSelect(notification.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select notification from ${notification.senderEmail}`}
              />
              <span className="notification-sender">{notification.senderEmail}</span>
              <span className="notification-content">{notification.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Delete Notifications</div>
            <div className="modal-body">
              <p>Are you sure you want to delete {selectedIds.size} selected notification{selectedIds.size !== 1 ? 's' : ''}?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={handleCancelDelete}>No</button>
              <button className="modal-btn-danger" onClick={handleConfirmDelete}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
