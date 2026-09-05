const aiService = require('../services/aiService');

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

exports.getSituationReport = async (req, res, next) => {
  try {
    const { district_id, state } = req.query;
    const report = await aiService.generateSituationReport({ district_id, state });
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

exports.copilotChat = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required', code: 'INVALID_INPUT' });
    }
    const response = await aiService.handleCopilotQuery({
      query,
      user_role: req.user ? req.user.role : 'DISTRICT_OFFICER'
    });
    res.json({ success: true, ...response });
  } catch (err) {
    next(err);
  }
};
