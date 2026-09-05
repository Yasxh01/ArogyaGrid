const stockService = require('../services/stockService');
const bedService = require('../services/bedService');
const staffService = require('../services/staffService');

exports.batchIntake = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'transactions must be an array', code: 'INVALID_PAYLOAD' });
    }

    const receipts = [];
    for (const item of transactions) {
      if (['STOCK_IN', 'STOCK_OUT', 'INTAKE', 'DISPENSE'].includes(item.type)) {
        const resTx = await stockService.processTransaction({
          transaction_uuid: item.transaction_uuid,
          phc_id: item.phc_id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          transaction_type: item.type === 'STOCK_IN' ? 'INTAKE' : (item.type === 'STOCK_OUT' ? 'DISPENSE' : item.type),
          created_by: req.user ? req.user.email : 'BATCH_SYNC'
        });
        receipts.push({ transaction_uuid: item.transaction_uuid, status: resTx.status, duplicate: resTx.duplicate });
      } else if (item.type === 'BED_UPDATE') {
        await bedService.updateBedOccupancy({
          phc_id: item.phc_id,
          bed_type: item.bed_type,
          occupied_beds: item.occupied_beds,
          total_beds: item.total_beds
        });
        receipts.push({ transaction_uuid: item.transaction_uuid, status: 'SUCCESS', type: 'BED_UPDATE' });
      } else if (item.type === 'STAFF_LOG') {
        await staffService.logAttendance({
          phc_id: item.phc_id,
          staff_name: item.staff_name,
          role: item.role,
          shift: item.shift,
          status: item.status
        });
        receipts.push({ transaction_uuid: item.transaction_uuid, status: 'SUCCESS', type: 'STAFF_LOG' });
      }
    }

    res.json({
      message: 'Batch telemetry synchronized successfully',
      processed_count: receipts.length,
      receipts
    });
  } catch (err) {
    next(err);
  }
};
