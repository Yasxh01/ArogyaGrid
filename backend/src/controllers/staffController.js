const staffService = require('../services/staffService');

exports.getStaff = async (req, res, next) => {
  try {
    const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
    const staff = await staffService.getStaffByPHC(phc_id);
    res.json({ phc_id, staff });
  } catch (err) {
    next(err);
  }
};

exports.logAttendance = async (req, res, next) => {
  try {
    const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
    const record = await staffService.logAttendance({ phc_id, ...req.body });
    res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};
