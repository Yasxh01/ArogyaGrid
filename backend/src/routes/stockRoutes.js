const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.get('/medicines', authenticateToken, stockController.getMedicines);
router.post('/medicines', authenticateToken, authorizeRoles('ADMIN', 'DISTRICT_OFFICER'), validateBody(['name']), stockController.createMedicine);
router.get('/phc/:phcId?', authenticateToken, stockController.getStock);
router.post('/transaction', authenticateToken, validateBody(['transaction_uuid', 'phc_id', 'medicine_id', 'quantity', 'transaction_type']), stockController.submitTransaction);

module.exports = router;
