const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// 1. Vernacular / Natural Language Voice & Text Intake
router.post('/voice-intake', validateBody(['text']), aiController.parseVoiceIntake);

// 2. Multimodal Google Gemini Vision Challan Digitizer
router.post('/digitize-challan', aiController.digitizeChallan);

// 3. Executive State/District Situation Report
router.get('/situation-report', authenticateToken, aiController.getSituationReport);

// 4. District Officer Copilot Query / Chat
router.post('/copilot', authenticateToken, validateBody(['query']), aiController.copilotChat);

module.exports = router;
