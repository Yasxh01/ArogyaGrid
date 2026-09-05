const mlService = require('../services/mlService');

exports.predict = async (req, res, next) => {
  try {
    const result = await mlService.predictStockout(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getFederatedStatus = async (req, res, next) => {
  try {
    const status = await mlService.getFederatedStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
};

exports.triggerFederatedRound = async (req, res, next) => {
  try {
    const result = await mlService.triggerFederatedRound(req.body.nodes);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
