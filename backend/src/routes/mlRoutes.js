const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/predict', authenticateToken, mlController.predict);
router.get('/federated/status', authenticateToken, mlController.getFederatedStatus);
router.post('/federated/round', authenticateToken, authorizeRoles('ADMIN', 'DISTRICT_OFFICER'), mlController.triggerFederatedRound);

module.exports = router;
