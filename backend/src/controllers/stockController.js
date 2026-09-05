const stockService = require('../services/stockService');

exports.getStock = async (req, res, next) => {
  try {
    const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
    const stock = await stockService.getStockByPHC(phc_id);
    res.json({ phc_id, stock });
  } catch (err) {
    next(err);
  }
};

exports.submitTransaction = async (req, res, next) => {
  try {
    const result = await stockService.processTransaction({
      ...req.body,
      created_by: req.user ? req.user.email : 'OFFLINE_SYNC'
    });
    res.status(result.duplicate ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
};
