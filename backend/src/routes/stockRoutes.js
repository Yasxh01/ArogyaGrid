const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

router.get('/medicines', optionalAuth, stockController.getMedicines);
router.post('/medicines', authenticateToken, authorizeRoles('ADMIN', 'DISTRICT_OFFICER'), validateBody(['name']), stockController.createMedicine);
router.get('/phc/:phcId?', optionalAuth, stockController.getStock);
router.get('/batches/:phcId?', optionalAuth, stockController.getBatches);
router.post('/batches', optionalAuth, stockController.createBatch);
router.post('/transaction', optionalAuth, validateBody(['transaction_uuid', 'phc_id', 'medicine_id', 'quantity', 'transaction_type']), stockController.submitTransaction);

module.exports = router;
