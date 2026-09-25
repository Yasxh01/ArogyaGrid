const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, districtController.getDistricts);
router.post('/', authenticateToken, districtController.createDistrict);
router.post('/:districtId/facilities', authenticateToken, districtController.createFacility);
router.get('/:districtId/map-telemetry', authenticateToken, districtController.getDistrictMapTelemetry);

module.exports = router;
