const aiService = require('../services/aiService');
const db = require('../config/db');

exports.parseVoiceIntake = async (req, res, next) => {
  try {
    const { text, phc_id, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required', code: 'INVALID_INPUT' });
    }
    const result = await aiService.parseNaturalLanguageIntake({ text, phc_id, language });
    res.json({ success: true, parsed: result });
  } catch (err) {
    next(err);
  }
};

exports.digitizeChallan = async (req, res, next) => {
  try {
    const { imageBase64, mimeType, phc_id } = req.body;
    const result = await aiService.digitizeStockChallan({
      imageBase64,
      mimeType,
      phc_id: phc_id || (req.user ? req.user.phc_id : 'PHC-RAN-01')
    });
    res.json({ success: true, challan: result });
  } catch (err) {
    next(err);
  }
};

exports.getSituationReport = async (req, res, next) => {
  try {
    const district_id = req.query.district_id || (req.user ? req.user.district_id : 'DIST-JH-01');
    const store = db.memoryStore;
    const district = store.districts.find(d => d.id === district_id) || store.districts[0];
    const state = req.query.state || district?.state || 'Jharkhand';
    const district_name = district?.name || 'Ranchi';

    const report = await aiService.generateSituationReport({ district_id, state, district_name });
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

exports.copilotChat = async (req, res, next) => {
  try {
    const { query, district_id } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required', code: 'INVALID_INPUT' });
    }
    const targetDistrictId = district_id || (req.user ? req.user.district_id : 'DIST-JH-01');
    const response = await aiService.handleCopilotQuery({
      query,
      district_id: targetDistrictId,
      user_role: req.user ? req.user.role : 'DISTRICT_OFFICER'
    });
    res.json({ success: true, ...response });
  } catch (err) {
    next(err);
  }
};
