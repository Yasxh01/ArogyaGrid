const epidemicService = require('../services/epidemicService');

exports.getOutbreakAlerts = (req, res) => {
  const { districtId } = req.params;
  const alerts = epidemicService.detectOutbreakClusters(districtId);
  res.json({
    standard: 'MoHFW Integrated Disease Surveillance Programme (IDSP / DEWS)',
    district_id: districtId || 'ALL',
    active_alerts_count: alerts.length,
    alerts
  });
};
