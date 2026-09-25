const express = require('express');
const router = express.Router();
const epidemicController = require('../controllers/epidemicController');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

router.get('/alerts/:districtId?', optionalAuth, epidemicController.getOutbreakAlerts);
router.post('/alerts/:alertId/resolve', optionalAuth, epidemicController.resolveAlert);

module.exports = router;
