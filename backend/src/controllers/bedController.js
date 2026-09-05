const bedService = require('../services/bedService');

exports.getBeds = async (req, res, next) => {
  try {
    const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
    const beds = await bedService.getBedsByPHC(phc_id);
    res.json({ phc_id, beds });
  } catch (err) {
    next(err);
  }
};

exports.updateBeds = async (req, res, next) => {
  try {
    const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
    const record = await bedService.updateBedOccupancy({ phc_id, ...req.body });
    res.json({ success: true, bed: record });
  } catch (err) {
    next(err);
  }
};
