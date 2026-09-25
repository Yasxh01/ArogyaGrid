const notificationService = require('../services/notificationService');

exports.getNotifications = (req, res) => {
  const { role } = req.query;
  const list = notificationService.getRecentNotifications(role);
  res.json({ count: list.length, notifications: list });
};

exports.simulateDispatch = (req, res) => {
  const notif = notificationService.simulateDispatch(req.body);
  res.status(201).json({ success: true, notification: notif });
};
