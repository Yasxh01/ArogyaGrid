const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.get('/phc/:phcId?', authenticateToken, stockController.getStock);
router.post('/transaction', authenticateToken, validateBody(['transaction_uuid', 'phc_id', 'medicine_id', 'quantity', 'transaction_type']), stockController.submitTransaction);

module.exports = router;
