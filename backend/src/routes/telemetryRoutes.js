const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { validateBody } = require('../middleware/validate');

router.post('/intake', validateBody(['transactions']), telemetryController.batchIntake);

module.exports = router;
