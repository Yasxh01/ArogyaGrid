const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { broadcastEvent } = require('./socketService');

class StaffService {
  async getStaffByPHC(phc_id) {
    return db.memoryStore.staff_attendance.filter(s => s.phc_id === phc_id);
  }

  async logAttendance({ phc_id, staff_name, role, shift, status }) {
    const record = {
      id: `STF-${uuidv4().substring(0, 8)}`,
      phc_id,
      staff_name,
      role,
      shift: shift || 'MORNING',
      status: status || 'ON_DUTY',
      check_in_time: new Date()
    };
    db.memoryStore.staff_attendance.push(record);

    broadcastEvent('staff:updated', {
      phc_id,
      staff_name,
      role,
      status: record.status
    });

    return record;
  }
}

module.exports = new StaffService();
