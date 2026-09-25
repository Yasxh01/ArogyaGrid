const express = require('express');
const router = express.Router();
const coldChainController = require('../controllers/coldChainController');

router.get('/', coldChainController.getUnits);
router.post('/', coldChainController.ingestTelemetry);
router.get('/:unitId/spoilage-risk', coldChainController.getSpoilageRisk);
router.post('/:unitId/simulate', coldChainController.simulateDrill);

module.exports = router;
