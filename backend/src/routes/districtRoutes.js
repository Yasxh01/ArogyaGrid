const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');
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

router.get('/', optionalAuth, districtController.getDistricts);
router.post('/', authenticateToken, districtController.createDistrict);
router.get('/:districtId/facilities', optionalAuth, districtController.getDistrictFacilities);
router.post('/:districtId/facilities', authenticateToken, districtController.createFacility);
router.get('/:districtId/stats', optionalAuth, districtController.getDistrictStats);
router.get('/:districtId/map-telemetry', optionalAuth, districtController.getDistrictMapTelemetry);

module.exports = router;
