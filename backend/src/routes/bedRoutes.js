const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');
const { authenticateToken } = require('../middleware/auth');

router.get('/phc/:phcId?', authenticateToken, bedController.getBeds);
router.post('/update', authenticateToken, bedController.updateBeds);

module.exports = router;
