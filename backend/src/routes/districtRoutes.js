const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, districtController.getDistricts);
router.get('/:districtId/map-telemetry', authenticateToken, districtController.getDistrictMapTelemetry);

module.exports = router;
