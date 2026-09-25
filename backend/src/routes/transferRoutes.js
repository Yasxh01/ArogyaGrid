const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
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

router.get('/', optionalAuth, transferController.getTransfers);
router.post('/', optionalAuth, validateBody(['source_phc_id', 'destination_phc_id', 'medicine_id', 'quantity']), transferController.createTransfer);
router.post('/request', optionalAuth, validateBody(['source_phc_id', 'destination_phc_id', 'medicine_id', 'quantity']), transferController.createTransfer);
router.patch('/:transferId/status', optionalAuth, validateBody(['status']), transferController.updateStatus);

module.exports = router;
