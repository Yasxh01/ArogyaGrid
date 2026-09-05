const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.get('/', authenticateToken, transferController.getTransfers);
router.post('/request', authenticateToken, validateBody(['source_phc_id', 'destination_phc_id', 'medicine_id', 'quantity']), transferController.createTransfer);
router.patch('/:transferId/status', authenticateToken, authorizeRoles('ADMIN', 'DISTRICT_OFFICER'), validateBody(['status']), transferController.updateStatus);

module.exports = router;
