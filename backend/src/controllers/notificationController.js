const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
                                            .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark an array of notification IDs as read
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: "Invalid payload: an array of notificationIds is required" });
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, recipient: req.user.id },
      { $set: { status: 'read' } }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

// Delete an array of notification IDs
const deleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: "Invalid payload: an array of notificationIds is required" });
    }

    await Notification.deleteMany({ _id: { $in: notificationIds }, recipient: req.user.id });
    res.status(200).json({ message: "Notifications deleted" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Failed to delete notifications" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotifications
};
