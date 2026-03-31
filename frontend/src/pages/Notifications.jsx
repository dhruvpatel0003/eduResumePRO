import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import '../styles/notifications.css';
import '../styles/details.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      const formattedData = data.map(n => ({
        ...n,
        id: n._id || n.id
      }));
      setNotifications(formattedData);
    } catch (err) {
      setError(err || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  const handleMarkAsRead = async () => {
    if (noneSelected) return;
    try {
      const idsArray = Array.from(selectedIds);
      await notificationService.markAsRead(idsArray);
      setNotifications(prev =>
        prev.map(n => selectedIds.has(n.id) ? { ...n, status: 'read' } : n)
      );
      setSelectedIds(new Set());
    } catch (err) {
      setError(err || 'Failed to mark as read');
    }
  };

  // Delete — open confirmation modal
  const handleDeleteClick = () => {
    if (noneSelected) return;
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      const idsArray = Array.from(selectedIds);
      await notificationService.deleteNotifications(idsArray);
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      setShowDeleteModal(false);
    } catch (err) {
      setError(err || 'Failed to delete notifications');
    }
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
      {error && <div className="error-message" style={{ color: 'red', margin: '10px 20px' }}>{error}</div>}
      
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
        <div className="notifications-empty">
          No notifications
        </div>
      ) : (
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
              <span className="notification-content">
                {notification.content}
                {notification.link && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      navigate(notification.link);
                    }} 
                    style={{
                      marginLeft: '15px', 
                      padding: '4px 10px', 
                      background: '#eff6ff', 
                      color: '#2563eb', 
                      border: '1px solid #bfdbfe', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    View Details
                  </button>
                )}
              </span>
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
