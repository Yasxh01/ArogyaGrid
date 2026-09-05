const transferService = require('../services/transferService');

exports.getTransfers = async (req, res, next) => {
  try {
    const list = await transferService.getTransfers(req.query);
    res.json({ transfers: list });
  } catch (err) {
    next(err);
  }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const transfer = await transferService.createTransfer({
      ...req.body,
      requested_by: req.user ? req.user.email : 'SYSTEM'
    });
    res.status(201).json({ success: true, transfer });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const transfer = await transferService.updateStatus(req.params.transferId, {
      status: req.body.status,
      approved_by: req.user ? req.user.email : 'ADMIN'
    });
    res.json({ success: true, transfer });
  } catch (err) {
    next(err);
  }
};
