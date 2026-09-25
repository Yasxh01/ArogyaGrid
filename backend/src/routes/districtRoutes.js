const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, districtController.getDistricts);
router.post('/', authenticateToken, districtController.createDistrict);
router.get('/:districtId/facilities', authenticateToken, districtController.getDistrictFacilities);
router.post('/:districtId/facilities', authenticateToken, districtController.createFacility);
router.get('/:districtId/stats', authenticateToken, districtController.getDistrictStats);
router.get('/:districtId/map-telemetry', authenticateToken, districtController.getDistrictMapTelemetry);

module.exports = router;
