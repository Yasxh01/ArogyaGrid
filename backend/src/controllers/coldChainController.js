const coldChainService = require('../services/coldChainService');

exports.getUnits = async (req, res, next) => {
  try {
    const { district_id, state } = req.query;
    const units = await coldChainService.getAllUnits({ district_id, state });
    res.json({ success: true, count: units.length, units });
  } catch (err) {
    next(err);
  }
};

exports.ingestTelemetry = async (req, res, next) => {
  try {
    const { unit_id, temperature_celsius, ambient_temp_celsius, power_status, battery_runtime_mins } = req.body;
    if (!unit_id || temperature_celsius === undefined) {
      return res.status(400).json({ error: 'unit_id and temperature_celsius are required', code: 'INVALID_INPUT' });
    }
    const result = await coldChainService.recordTelemetry({
      unit_id,
      temperature_celsius,
      ambient_temp_celsius,
      power_status,
      battery_runtime_mins
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getSpoilageRisk = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const assessment = await coldChainService.assessThermalSpoilageRisk(unitId);
    res.json({ success: true, assessment });
  } catch (err) {
    next(err);
  }
};

exports.simulateDrill = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { event_type } = req.body;
    const result = await coldChainService.simulateDrill({ unit_id: unitId, event_type });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
