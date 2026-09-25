const express = require('express');
const router = express.Router();
const epidemicController = require('../controllers/epidemicController');
const { authenticateToken } = require('../middleware/auth');

router.get('/alerts/:districtId?', authenticateToken, epidemicController.getOutbreakAlerts);

module.exports = router;
