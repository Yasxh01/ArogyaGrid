const express = require('express');
const router = express.Router();
const abdmController = require('../controllers/abdmController');
const { authenticateToken } = require('../middleware/auth');

router.get('/fhir/bundle/:districtId?', authenticateToken, abdmController.getFhirBundle);
router.get('/hfr/facilities/:districtId?', authenticateToken, abdmController.getHfrRegistry);
router.post('/eaushadhi/sync', authenticateToken, abdmController.syncEAushadhi);
router.post('/abha/verify', authenticateToken, abdmController.verifyAbha);

module.exports = router;
