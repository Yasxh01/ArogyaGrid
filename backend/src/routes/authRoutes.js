const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.post('/login', validateBody(['email', 'password']), authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
