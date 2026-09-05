const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.get('/phc/:phcId?', authenticateToken, staffController.getStaff);
router.post('/attendance', authenticateToken, validateBody(['phc_id', 'staff_name', 'role']), staffController.logAttendance);

module.exports = router;
