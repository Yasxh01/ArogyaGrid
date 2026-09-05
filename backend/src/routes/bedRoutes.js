const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.get('/phc/:phcId?', authenticateToken, bedController.getBeds);
router.post('/update', authenticateToken, bedController.updateBeds);
router.post('/admit', authenticateToken, validateBody(['phc_id', 'bed_type']), bedController.admitPatient);
router.post('/discharge', authenticateToken, validateBody(['phc_id', 'bed_type']), bedController.dischargePatient);

module.exports = router;
