const bedService = require('../services/bedService');
const db = require('../config/db');

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

exports.admitPatient = async (req, res, next) => {
  try {
    const { phc_id, bed_type, count = 1 } = req.body;
    const store = db.memoryStore;
    let bed = store.beds.find(b => b.phc_id === phc_id && b.bed_type === bed_type);

    if (!bed) {
      return res.status(404).json({ error: 'Bed category not found for this PHC' });
    }

    if (bed.occupied_beds + count > bed.total_beds) {
      return res.status(400).json({
        error: `Cannot admit: only ${bed.total_beds - bed.occupied_beds} ${bed_type} beds available`,
        code: 'BED_CAPACITY_EXCEEDED'
      });
    }

    const updated = await bedService.updateBedOccupancy({
      phc_id,
      bed_type,
      total_beds: bed.total_beds,
      occupied_beds: bed.occupied_beds + count
    });

    res.json({ success: true, message: `Admitted ${count} patient(s) to ${bed_type} bed`, bed: updated });
  } catch (err) {
    next(err);
  }
};

exports.dischargePatient = async (req, res, next) => {
  try {
    const { phc_id, bed_type, count = 1 } = req.body;
    const store = db.memoryStore;
    let bed = store.beds.find(b => b.phc_id === phc_id && b.bed_type === bed_type);

    if (!bed) {
      return res.status(404).json({ error: 'Bed category not found for this PHC' });
    }

    const newOccupied = Math.max(0, bed.occupied_beds - count);
    const updated = await bedService.updateBedOccupancy({
      phc_id,
      bed_type,
      total_beds: bed.total_beds,
      occupied_beds: newOccupied
    });

    res.json({ success: true, message: `Discharged ${count} patient(s) from ${bed_type} bed`, bed: updated });
  } catch (err) {
    next(err);
  }
};
