const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const stockRoutes = require('./stockRoutes');
const bedRoutes = require('./bedRoutes');
const staffRoutes = require('./staffRoutes');
const telemetryRoutes = require('./telemetryRoutes');
const transferRoutes = require('./transferRoutes');
const districtRoutes = require('./districtRoutes');
const mlRoutes = require('./mlRoutes');
const aiRoutes = require('./aiRoutes');
const coldChainRoutes = require('./coldChainRoutes');
const epidemicRoutes = require('./epidemicRoutes');
const notificationRoutes = require('./notificationRoutes');
const abdmRoutes = require('./abdmRoutes');
const cloudRoutes = require('./cloudRoutes');

router.use('/auth', authRoutes);
router.use('/stock', stockRoutes);
router.use('/beds', bedRoutes);
router.use('/staff', staffRoutes);
router.use('/telemetry/cold-chain', coldChainRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/transfers', transferRoutes);
router.use('/districts', districtRoutes);
router.use('/ml', mlRoutes);
router.use('/ai', aiRoutes);
router.use('/epidemic', epidemicRoutes);
router.use('/notifications', notificationRoutes);
router.use('/abdm', abdmRoutes);
router.use('/cloud', cloudRoutes);



router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ArogyaGrid Backend', timestamp: new Date().toISOString() });
});

module.exports = router;
